import React, { useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  X,
  Church,
  ChevronDown,
  Plus,
  Search,
  Check,
  Heart,
  Cross,
} from "lucide-react";
import { initials } from "./domain.js";
import { translate } from "./i18n.js";

export function Avatar({ name, size = "", color = "" }) {
  const colors = ["sage", "lavender", "peach", "blue", "rose"];
  return (
    <span
      className={`avatar ${size} ${color || colors[name.charCodeAt(0) % colors.length]}`}
    >
      {initials(name)}
    </span>
  );
}
export function Badge({ children, tone = "green" }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
export function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`button ${variant} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
export function Empty({
  title = "Nothing here just yet",
  description = "Your community’s next chapter starts here.",
  action,
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <Church size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function PageHeader({ eyebrow, title, description, children }) {
  return (
    <div className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <div className="heading-actions">{children}</div>
    </div>
  );
}
export function SectionHeading({ title, subtitle, action, onAction }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action && (
        <button className="text-button" onClick={onAction}>
          {action}
          <ArrowRight size={15} />
        </button>
      )}
    </div>
  );
}
export function Field({ label, hint, children, className = "" }) {
  const control =
    React.isValidElement(children) &&
    ["input", "select", "textarea"].includes(children.type)
      ? React.cloneElement(children, { "aria-label": translate(label) })
      : children;
  return (
    <label className={`field ${className}`}>
      <span>{label}</span>
      {control}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function SearchInput({ value, onChange, placeholder = "Search…" }) {
  return (
    <div className="search-field">
      <Search size={17} />
      <input
        aria-label={placeholder}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {value && (
        <button title="Clear search" onClick={() => onChange("")}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}
export function Modal({ title, description, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    const focusable = () => [
      ...ref.current.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select, textarea, [tabindex="0"]',
      ),
    ];
    focusable()[0]?.focus();
    const handle = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const elements = focusable();
        const first = elements[0];
        const last = elements.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handle);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className={`modal ${wide ? "wide" : ""}`}
      >
        <div className="modal-heading">
          <div>
            <h2 id="dialog-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button
            aria-label="Close dialog"
            className="icon-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function ChurchArt({ compact = false }) {
  return (
    <svg
      className={`church-art ${compact ? "compact" : ""}`}
      viewBox="0 0 390 230"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="258" cy="102" r="90" fill="#d9e5d0" />
      <circle cx="275" cy="71" r="27" fill="#f6f2d8" />
      <path
        d="M10 211c42-14 68-13 102-6 32-9 82-14 120-3 38-10 89-13 145 8"
        stroke="#a6b9a1"
        strokeWidth="1.3"
      />
      <path
        d="M279 203V123l-33-33-34 33v80"
        fill="#f3f2e7"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path d="M218 122h60l-31-30-29 30Z" fill="#abc3af" />
      <path
        d="M108 204v-88l65-44 66 44v88"
        fill="#f4f4e9"
        stroke="#628172"
        strokeWidth="1.7"
      />
      <path
        d="m97 119 76-54 76 54-8 9-68-47-68 47Z"
        fill="#89a895"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path
        d="M154 82V43l19-28 19 28v39"
        fill="#f7f5e8"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path d="m149 46 24-36 24 36Z" fill="#6d907c" />
      <path d="M173 11V0m-6 5h12" stroke="#476e59" strokeWidth="2" />
      <path
        d="M164 64V52a9 9 0 0 1 18 0v12Z"
        fill="#b6cbbb"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path
        d="M153 204v-38a20 20 0 0 1 40 0v38"
        fill="#8cab97"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path d="M173 148v56" stroke="#628172" strokeWidth="1.5" />
      <path
        d="M123 160v-17a7 7 0 0 1 14 0v17Zm86 0v-17a7 7 0 0 1 14 0v17Z"
        fill="#c4d6c3"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <circle
        cx="173"
        cy="112"
        r="12"
        fill="#d6dfbe"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path
        d="M173 100v24m-12-12h24M245 151v-15a7 7 0 0 1 14 0v15Z"
        stroke="#628172"
        strokeWidth="1.5"
      />
      <path d="m151 205-11 23m55-23 11 23" stroke="#a0b59e" />
      <path
        d="M74 207v-55m0 34-14-12m14-4 11-12"
        stroke="#6d8e71"
        strokeWidth="2"
      />
      <path
        d="M73 173c-39-5-29-35-17-33-7-22 29-28 30-9 26-5 28 33-1 42"
        fill="#b4c8a4"
      />
      <path
        d="M318 207v-80m0 42-13-11m13-10 12-10"
        stroke="#6d8e71"
        strokeWidth="2"
      />
      <path
        d="M317 158c-33 1-36-22-20-33-14-14 0-32 15-28 14-22 39-3 26 13 24 14 13 43-21 48"
        fill="#a8c39e"
      />
      <path
        d="M45 204c3-20 22-18 28 0m213 1c8-22 25-19 32 0m9 0c2-15 17-19 25-3"
        fill="#98b491"
      />
      <path
        d="m32 75 7-4 7 4m-5-22 6-3 6 3m289 21 6-4 7 4"
        stroke="#8da68d"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export function StatCard({
  icon: Icon,
  title,
  value,
  detail,
  tone = "green",
  trend,
  onClick,
}) {
  return (
    <button className="stat-card" onClick={onClick}>
      <div className="stat-top">
        <span>{title}</span>
        <span className={`stat-icon ${tone}`}>
          <Icon size={19} />
        </span>
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-detail">
        {trend && (
          <span className="trend">
            <ArrowUpRight size={13} />
            {trend}
          </span>
        )}
        {detail}
      </div>
    </button>
  );
}
