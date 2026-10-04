import React, { useState } from "react";
import {
  MessageCircle,
  Send,
  ExternalLink,
  Check,
  AlertCircle,
} from "lucide-react";
import { Modal, Field, Button } from "./components.jsx";
import { useParish } from "./context.js";
import "./whatsapp.css";

const errors = {
  unauthorized: "The backend key is incorrect, or has not been configured.",
  not_configured:
    "Add the Meta credentials and test recipient to the server settings first.",
  origin_not_allowed: "Allow this website address in the backend settings.",
  invalid_message: "Enter a message of up to 4,096 characters.",
  meta_token_expired:
    "The Meta token is invalid or expired. Replace it in the server settings.",
  recipient_not_verified:
    "Verify this recipient in Meta’s WhatsApp API Setup first.",
  reply_required:
    "Ask the test recipient to reply to the WhatsApp number, then try custom text again.",
  template_unavailable:
    "The hello_world template is unavailable for this sender. Use Meta’s test number.",
  meta_rejected:
    "Meta rejected this message. Check the sender, token permissions, and verified recipient.",
  rate_limited:
    "The demo allows five requests per minute. Please wait before trying again.",
  request_changed:
    "Prepare a new test before changing a request that was already submitted.",
  send_unknown:
    "The send result is unknown. Check the recipient’s WhatsApp before preparing another test; it may already have arrived.",
  network:
    "Cannot reach the backend. Check its URL and that the server is running.",
};

export default function WhatsAppDemo({ initialBody = "" }) {
  const { close } = useParish();
  const [url, setUrl] = useState(
    import.meta.env.VITE_WHATSAPP_API_URL ||
      (["localhost", "127.0.0.1"].includes(location.hostname)
        ? "http://127.0.0.1:3001"
        : ""),
  );
  const [key, setKey] = useState("");
  const [connection, setConnection] = useState(null);
  const [kind, setKind] = useState(initialBody ? "text" : "template");
  const [body, setBody] = useState(initialBody);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  function baseUrl() {
    const target = new URL(url.trim());
    const local =
      ["localhost", "127.0.0.1"].includes(target.hostname) &&
      ["localhost", "127.0.0.1"].includes(location.hostname);
    if (target.protocol !== "https:" && !(target.protocol === "http:" && local))
      throw new Error(
        "Use an HTTPS backend URL. Local HTTP works only with the local prototype.",
      );
    if (
      target.username ||
      target.password ||
      target.search ||
      target.hash ||
      target.pathname !== "/"
    )
      throw new Error(
        "Enter the backend’s base URL without a path or credentials.",
      );
    return target.origin;
  }

  async function call(path, payload, id) {
    const endpoint = baseUrl();
    let response;
    try {
      response = await fetch(`${endpoint}/api/whatsapp/${path}`, {
        method: payload ? "POST" : "GET",
        headers: {
          Authorization: `Bearer ${key.trim()}`,
          ...(payload
            ? { "Content-Type": "application/json", "Idempotency-Key": id }
            : {}),
        },
        ...(payload ? { body: JSON.stringify(payload) } : {}),
        signal: AbortSignal.timeout(60000),
        cache: "no-store",
      });
    } catch {
      throw new Error(payload ? errors.send_unknown : errors.network);
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error(errors.network);
    }
    if (!response.ok) throw new Error(errors[data.error] || errors.network);
    return data;
  }

  async function connect(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const data = await call("status");
      if (!data.configured || !/^[1-9]\d{7,14}$/.test(data.recipient))
        throw new Error(errors.network);
      setConnection(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function send(e) {
    e.preventDefault();
    if (busy || result) return;
    setBusy(true);
    setError("");
    setSubmitted(true);
    const id = requestId || crypto.randomUUID();
    setRequestId(id);
    try {
      const data = await call(
        "send",
        kind === "text" ? { kind, text: body } : { kind },
        id,
      );
      if (data.status !== "accepted" || !data.messageId)
        throw new Error(errors.send_unknown);
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function resetTest() {
    setSubmitted(false);
    setResult(null);
    setRequestId(null);
    setError("");
  }

  return (
    <Modal
      title="Meta WhatsApp test"
      description="Send a real test message through your backend."
      onClose={close}
    >
      <div className="modal-body whatsapp-demo">
        {!connection ? (
          <form onSubmit={connect} className="whatsapp-stack">
            <p>
              The Meta access token stays on your server. Use the separate
              backend key here.
            </p>
            <Field label="Backend URL">
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-backend.onrender.com"
                autoComplete="off"
              />
            </Field>
            <Field label="Backend demo key">
              <input
                type="password"
                required
                value={key}
                onChange={(e) => setKey(e.target.value)}
                autoComplete="off"
              />
            </Field>
            <small>This key is cleared when you close this dialog.</small>
            <Button type="submit" disabled={busy}>
              <MessageCircle size={16} />
              {busy ? "Checking backend…" : "Check backend"}
            </Button>
            <a
              className="text-button"
              href="https://github.com/simondce/ma-nagar-pastorate/blob/main/WHATSAPP_SETUP.md"
              target="_blank"
              rel="noopener noreferrer"
            >
              Meta setup instructions <ExternalLink size={14} />
            </a>
          </form>
        ) : (
          <form onSubmit={send} className="whatsapp-stack">
            <div className="whatsapp-recipient">
              <Check size={18} />
              <div>
                <strong>Backend ready</strong>
                <span>Test recipient</span>
                <b dir="ltr">+{connection.recipient}</b>
              </div>
            </div>
            <small>
              Meta checks the credentials when you send. The sample member
              directory is never used for real sends.
            </small>
            <Field label="Test message type">
              <select
                value={kind}
                disabled={busy || submitted}
                onChange={(e) => setKind(e.target.value)}
              >
                <option value="template">
                  Meta starter template (hello_world)
                </option>
                <option value="text">Custom message</option>
              </select>
            </Field>
            {kind === "template" ? (
              <div className="inline-info">
                Send Meta’s English starter template to begin the test
                conversation.
              </div>
            ) : (
              <>
                <Field label="Test message">
                  <textarea
                    rows={5}
                    required
                    value={body}
                    maxLength={4096}
                    disabled={busy || submitted}
                    onChange={(e) => setBody(e.target.value)}
                  />
                </Field>
                <small>
                  For custom text, the recipient must have messaged your
                  WhatsApp number within the last 24 hours. Tamil text is
                  supported.
                </small>
              </>
            )}
            {result ? (
              <div className="whatsapp-result" role="status">
                <strong>Accepted by Meta</strong>
                <p>
                  Check the recipient’s WhatsApp. Acceptance does not confirm
                  delivery.
                </p>
                <code>{result.messageId}</code>
              </div>
            ) : (
              <Button
                type="submit"
                disabled={busy || (kind === "text" && !body.trim())}
              >
                <Send size={16} />
                {busy
                  ? "Sending via Meta…"
                  : submitted
                    ? "Check same request again"
                    : "Send test via Meta"}
              </Button>
            )}
            {submitted && !busy && (
              <Button type="button" variant="secondary" onClick={resetTest}>
                Prepare another test
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setConnection(null);
                setKey("");
                resetTest();
              }}
            >
              Disconnect backend
            </Button>
          </form>
        )}
        {error && (
          <p className="form-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </p>
        )}
      </div>
    </Modal>
  );
}
