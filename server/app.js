import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";

export function configuration(env = process.env) {
  return {
    token: env.WHATSAPP_ACCESS_TOKEN || "",
    phoneId: env.WHATSAPP_PHONE_NUMBER_ID || "",
    version: env.WHATSAPP_GRAPH_VERSION || "",
    recipient: env.WHATSAPP_TEST_RECIPIENT || "",
    key: env.WHATSAPP_DEMO_KEY || "",
    origins: (env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
  };
}

function ready(c) {
  return (
    !!c.token &&
    /^\d+$/.test(c.phoneId) &&
    /^v\d+\.\d+$/.test(c.version) &&
    /^[1-9]\d{7,14}$/.test(c.recipient) &&
    c.key.length >= 32 &&
    c.origins.length > 0
  );
}

function authorized(value, key) {
  if (key.length < 32) return false;
  const actual = Buffer.from(value || "");
  const expected = Buffer.from(`Bearer ${key}`);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function payloadFor(input, recipient) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw new Error("invalid_message");
  // The browser cannot select a recipient, sender, endpoint, or template.
  if (Object.keys(input).some((k) => !["kind", "text"].includes(k)))
    throw new Error("invalid_message");
  const base = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: recipient,
  };
  if (input.kind === "template" && input.text === undefined) {
    return {
      ...base,
      type: "template",
      template: { name: "hello_world", language: { code: "en_US" } },
    };
  }
  if (
    input.kind === "text" &&
    typeof input.text === "string" &&
    input.text.trim() &&
    input.text.length <= 4096
  ) {
    return {
      ...base,
      type: "text",
      text: { preview_url: false, body: input.text.trim() },
    };
  }
  throw new Error("invalid_message");
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 24000) throw new Error("invalid_message");
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function metaError(error) {
  if (error?.code === 190) return "meta_token_expired";
  if (error?.code === 131030) return "recipient_not_verified";
  if (error?.code === 131047) return "reply_required";
  if ([132001, 132000, 132015, 132016].includes(error?.code))
    return "template_unavailable";
  return "meta_rejected";
}

export function createWhatsAppServer({
  config = configuration(),
  fetchImpl = fetch,
  now = Date.now,
} = {}) {
  const requests = new Map();
  let sends = [];
  return createServer(async (req, res) => {
    const reply = (status, data) => {
      res.writeHead(status, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      res.end(JSON.stringify(data));
    };
    const origin = req.headers.origin;
    res.setHeader("Vary", "Origin");
    if (origin && !config.origins.includes(origin))
      return reply(403, { error: "origin_not_allowed" });
    if (origin) res.setHeader("Access-Control-Allow-Origin", origin);
    if (req.method === "OPTIONS") {
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Authorization, Content-Type, Idempotency-Key",
      );
      res.writeHead(204);
      res.end();
      return;
    }
    let path;
    try {
      path = new URL(req.url, "http://backend.local").pathname;
    } catch {
      return reply(400, { error: "invalid_request" });
    }
    if (path === "/health" && req.method === "GET")
      return reply(200, { status: "ok" });
    if (!["/api/whatsapp/status", "/api/whatsapp/send"].includes(path))
      return reply(404, { error: "not_found" });
    if (!authorized(req.headers.authorization, config.key))
      return reply(401, { error: "unauthorized" });
    if (!ready(config)) return reply(503, { error: "not_configured" });
    if (path === "/api/whatsapp/status" && req.method === "GET") {
      return reply(200, {
        configured: true,
        recipient: config.recipient,
        mode: "single-recipient-demo",
      });
    }
    if (path !== "/api/whatsapp/send" || req.method !== "POST")
      return reply(405, { error: "method_not_allowed" });
    if (!req.headers["content-type"]?.startsWith("application/json"))
      return reply(415, { error: "invalid_message" });
    const requestId = req.headers["idempotency-key"];
    if (
      typeof requestId !== "string" ||
      !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)
    )
      return reply(400, { error: "request_id_required" });
    let payload;
    try {
      payload = payloadFor(await readJson(req), config.recipient);
    } catch {
      return reply(400, { error: "invalid_message" });
    }
    const signature = JSON.stringify(payload);
    for (const [key, entry] of requests)
      if (now() - entry.at > 3600000) requests.delete(key);
    const previous = requests.get(requestId);
    if (previous && previous.signature !== signature)
      return reply(409, { error: "request_changed" });
    if (previous) {
      const result = await previous.result;
      return reply(result.status, result.body);
    }
    sends = sends.filter((at) => now() - at < 60000);
    if (sends.length >= 5) return reply(429, { error: "rate_limited" });
    sends.push(now());
    const send = async () => {
      try {
        const response = await fetchImpl(
          `https://graph.facebook.com/${config.version}/${config.phoneId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${config.token}`,
              "Content-Type": "application/json",
            },
            body: signature,
            signal: AbortSignal.timeout(15000),
          },
        );
        const data = await response.json();
        if (!response.ok)
          return {
            status: 502,
            body: {
              error: metaError(data.error),
              code: Number(data.error?.code) || null,
            },
          };
        if (!data.messages?.[0]?.id)
          return { status: 502, body: { error: "send_unknown" } };
        return {
          status: 202,
          body: {
            status: "accepted",
            messageId: data.messages[0].id,
            recipient: config.recipient,
          },
        };
      } catch {
        // Do not retry automatically: Meta may have accepted the first request.
        return { status: 502, body: { error: "send_unknown" } };
      }
    };
    const result = send();
    requests.set(requestId, { signature, at: now(), result });
    const completed = await result;
    reply(completed.status, completed.body);
  });
}
