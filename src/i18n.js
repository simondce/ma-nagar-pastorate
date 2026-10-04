import { createElement, Fragment as ReactFragment } from "react";
import { tamil } from "./tamil.js";

let language = (() => {
  try {
    return localStorage.getItem("parish-language") === "ta" ? "ta" : "en";
  } catch {
    return "en";
  }
})();
export const Fragment = ReactFragment;
export const getLanguage = () => language;
export const getLocale = () => (language === "ta" ? "ta-IN" : "en-IN");

export function setLanguage(next) {
  language = next === "ta" ? "ta" : "en";
  try {
    localStorage.setItem("parish-language", language);
  } catch {}
  document.documentElement.lang = language;
  document.title =
    language === "ta"
      ? "தூய யோவான் திருச்சபை · மா. அ. நகர் சேகரம்"
      : "St. John’s Church · M. A Nagar Pastorate";
  window.dispatchEvent(new Event("parish-language-change"));
}

export function translate(value) {
  if (language !== "ta" || typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  const match = tamil[trimmed];
  if (match) return value.replace(trimmed, match);
  const patterns = [
    [/^Showing (.+) of (.+) members$/, "$1 / $2 உறுப்பினர்கள்"],
    [/^Page (\d+) of (\d+)$/, "பக்கம் $1 / $2"],
    [/^Church prefix: (.+)$/, "ஆலயக் குறியீடு: $1"],
    [/^Full membership ID: (.+)$/, "முழு உறுப்பினர் எண்: $1"],
    [/^New membership ID (.+)$/, "புதிய உறுப்பினர் எண் $1"],
    [/^(.+) recipients$/, "$1 பெறுநர்கள்"],
    [/^(.+) selected members$/, "தேர்ந்தெடுக்கப்பட்ட $1 உறுப்பினர்கள்"],
    [/^(.+) selected$/, "$1 தேர்ந்தெடுக்கப்பட்டது"],
    [/^Assigned to (.+)$/, "பொறுப்பு: $1"],
    [
      /^and Rev\. Joseph Paul, Head Pastor$/,
      "மற்றும் தலைமை போதகர் அருட்திரு ஜோசப் பால்",
    ],
    [/^Shared by (.+)$/, "பகிர்ந்தவர்: $1"],
    [/^View (.+)$/, "$1 — விவரங்கள்"],
    [/^Wish (.+)$/, "$1 — வாழ்த்துகள்"],
    [/^Select (.+)$/, "$1 — தேர்ந்தெடு"],
    [
      /^(.+) has been added to your church family\.$/,
      "$1 திருச்சபை குடும்பத்தில் சேர்க்கப்பட்டார்.",
    ],
    [
      /^(.+) is now an active member\. Membership ID: (.+)$/,
      "$1 உறுப்பினராக ஒப்புதல் பெற்றார். உறுப்பினர் எண்: $2",
    ],
    [
      /^Demo complete for (.+) recipients\. No real messages were sent\.$/,
      "$1 பெறுநர்களுக்கான மாதிரி முடிந்தது. உண்மையான செய்திகள் அனுப்பப்படவில்லை.",
    ],
    [
      /^Demo contribution of (.+) recorded\. No payment was taken\.$/,
      "$1 மாதிரி காணிக்கை பதிவு செய்யப்பட்டது. பணம் பெறப்படவில்லை.",
    ],
    [
      /^Thank you\. Your (.+) pledge has been recorded\.$/,
      "நன்றி. உங்கள் $1 நன்கொடை உறுதிமொழி பதிவு செய்யப்பட்டது.",
    ],
    [/^From (.+) through this age$/, "$1 வயது முதல் இந்த வயது வரை"],
  ];
  for (const [pattern, replacement] of patterns)
    if (pattern.test(trimmed))
      return value.replace(trimmed, trimmed.replace(pattern, replacement));
  // Composite labels contain stable church names and role labels separated by these marks.
  if (/ · |\n| & /.test(value))
    return value
      .split(/( · |\n| & )/)
      .map((part) =>
        tamil[part.trim()]
          ? part.replace(part.trim(), tamil[part.trim()])
          : part,
      )
      .join("");
  return value;
}

// Translate rendered copy without changing stored values, IDs, routes, or user-entered input.
// Explicit option values preserve English enum values when the visible option is Tamil.
export function h(type, props, ...children) {
  const next = props ? { ...props } : {};
  if (
    type === "option" &&
    next.value === undefined &&
    children.every((child) => ["string", "number"].includes(typeof child))
  )
    next.value = children.join("");
  for (const key of ["aria-label", "placeholder", "title", "alt"])
    if (typeof next[key] === "string") next[key] = translate(next[key]);
  return createElement(
    type,
    next,
    ...children.map((child) =>
      typeof child === "string"
        ? translate(child)
        : Array.isArray(child)
          ? child.map((item) =>
              typeof item === "string" ? translate(item) : item,
            )
          : child,
    ),
  );
}
