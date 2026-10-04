import test from "node:test";
import assert from "node:assert/strict";
import { createWhatsAppServer, payloadFor } from "../server/app.js";

const config = {
  token: "test-meta-secret",
  phoneId: "12345",
  version: "v24.0",
  recipient: "15555550101",
  key: "local-test-key-".padEnd(40, "x"),
  origins: ["http://127.0.0.1:5173"],
};
async function fixture(t, implementation, override = {}) {
  const calls = [];
  const server = createWhatsAppServer({
    config: { ...config, ...override },
    fetchImpl: async (...args) => {
      calls.push(args);
      return implementation
        ? implementation(...args)
        : new Response(JSON.stringify({ messages: [{ id: "wamid.test" }] }), {
            status: 200,
          });
    },
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = (path, body, headers = {}) =>
    fetch(base + path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        Origin: config.origins[0],
        "Content-Type": "application/json",
        "Idempotency-Key": "request-test-00000001",
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  return { request, calls };
}

test("sends the fixed Meta template only to the configured recipient", async (t) => {
  const { request, calls } = await fixture(t);
  const res = await request("/api/whatsapp/send", { kind: "template" });
  assert.equal(res.status, 202);
  assert.equal((await res.json()).status, "accepted");
  assert.equal(calls[0][0], "https://graph.facebook.com/v24.0/12345/messages");
  assert.equal(calls[0][1].headers.Authorization, "Bearer test-meta-secret");
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to: config.recipient,
    type: "template",
    template: { name: "hello_world", language: { code: "en_US" } },
  });
});

test("requires backend authorization, exact origin and configured credentials", async (t) => {
  const { request, calls } = await fixture(t);
  assert.equal(
    (
      await request(
        "/api/whatsapp/send",
        { kind: "template" },
        { Authorization: "Bearer wrong" },
      )
    ).status,
    401,
  );
  assert.equal(
    (
      await request("/api/whatsapp/status", undefined, {
        Origin: "https://untrusted.example",
      })
    ).status,
    403,
  );
  assert.equal(calls.length, 0);
  const empty = await fixture(t, null, { token: "" });
  assert.equal(
    (await empty.request("/api/whatsapp/send", { kind: "template" })).status,
    503,
  );
  assert.equal(empty.calls.length, 0);
});

test("validates text, preserves Tamil, and rejects recipient or template overrides", async (t) => {
  const { request, calls } = await fixture(t);
  for (const body of [
    { kind: "template", to: "15555550202" },
    { kind: "template", template: "other" },
    { kind: "text", text: " " },
    { kind: "text", text: "a".repeat(4097) },
    null,
  ]) {
    assert.equal((await request("/api/whatsapp/send", body)).status, 400);
  }
  assert.equal(calls.length, 0);
  const body = "இறைவனின் சமாதானம் உங்களோடு இருப்பதாக!\nஞாயிறு ஆராதனை.";
  assert.equal(
    payloadFor({ kind: "text", text: body }, config.recipient).text.body,
    body,
  );
});

test("repeated and concurrent request IDs call Meta once; changed content conflicts", async (t) => {
  const { request, calls } = await fixture(t);
  const replies = await Promise.all([
    request("/api/whatsapp/send", { kind: "template" }),
    request("/api/whatsapp/send", { kind: "template" }),
  ]);
  assert.deepEqual(
    replies.map((r) => r.status),
    [202, 202],
  );
  assert.equal(calls.length, 1);
  assert.equal(
    (await request("/api/whatsapp/send", { kind: "text", text: "changed" }))
      .status,
    409,
  );
});

test("provider rejection never reports sent or echoes Meta credentials", async (t) => {
  const { request } = await fixture(
    t,
    () =>
      new Response(
        JSON.stringify({ error: { code: 190, message: "test-meta-secret" } }),
        { status: 401 },
      ),
  );
  const res = await request("/api/whatsapp/send", { kind: "template" });
  assert.equal(res.status, 502);
  const body = await res.text();
  assert.ok(!body.includes(config.token));
  assert.equal(JSON.parse(body).error, "meta_token_expired");
});

test("uncertain sends are not retried automatically", async (t) => {
  const { request, calls } = await fixture(t, () => {
    throw new Error("timeout");
  });
  for (let i = 0; i < 2; i++) {
    const res = await request("/api/whatsapp/send", { kind: "template" });
    assert.equal((await res.json()).error, "send_unknown");
  }
  assert.equal(calls.length, 1);
});

test("limits new sends and does not expose the Meta token in status", async (t) => {
  const { request, calls } = await fixture(t);
  const status = await request("/api/whatsapp/status");
  assert.ok(!(await status.text()).includes(config.token));
  for (let i = 0; i < 5; i++)
    assert.equal(
      (
        await request(
          "/api/whatsapp/send",
          { kind: "template" },
          { "Idempotency-Key": `test-request-number-${i}` },
        )
      ).status,
      202,
    );
  assert.equal(
    (
      await request(
        "/api/whatsapp/send",
        { kind: "template" },
        { "Idempotency-Key": "test-request-number-6" },
      )
    ).status,
    429,
  );
  assert.equal(calls.length, 5);
});
