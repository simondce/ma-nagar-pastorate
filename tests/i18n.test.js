import test from "node:test";
import assert from "node:assert/strict";
import { translate, setLanguage, h, getLocale } from "../src/i18n.js";

globalThis.document = { documentElement: { lang: "en" }, title: "" };
globalThis.window = { dispatchEvent() {} };

test("Tamil translates public navigation and church identity", () => {
  setLanguage("ta");
  assert.equal(translate("Our churches"), "நமது ஆலயங்கள்");
  assert.equal(translate("M. A Nagar Pastorate"), "மா. அ. நகர் சேகரம்");
  assert.equal(document.documentElement.lang, "ta");
  assert.equal(getLocale(), "ta-IN");
  setLanguage("en");
  assert.equal(translate("Our churches"), "Our churches");
});

test("Tamil selection preserves stored form enum values", () => {
  setLanguage("ta");
  const option = h("option", {}, "Secretary");
  assert.equal(option.props.value, "Secretary");
  assert.equal(option.props.children, "செயலாளர்");
  const field = h("input", { value: "Secretary", placeholder: "Your name *" });
  assert.equal(field.props.value, "Secretary");
  assert.equal(field.props.placeholder, "உங்கள் பெயர் *");
});

test("visible composite text translates without changing routes or identifiers", () => {
  setLanguage("ta");
  const link = h(
    "a",
    { href: "#members", id: "members", "aria-label": "Members" },
    "Members",
  );
  assert.equal(link.props.href, "#members");
  assert.equal(link.props.id, "members");
  assert.equal(link.props["aria-label"], "உறுப்பினர்கள்");
  assert.equal(
    translate("Showing 1–10 of 248 members"),
    "1–10 / 248 உறுப்பினர்கள்",
  );
  assert.equal(translate("Church prefix: MAN"), "ஆலயக் குறியீடு: MAN");
  setLanguage("en");
});
