import React, { useState } from "react";
import {
  Users,
  Church,
  Plus,
  Check,
  Send,
  MessageCircle,
  MessageSquare,
  CalendarDays,
  Heart,
  ShieldCheck,
  LockKeyhole,
  ArrowRight,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Cake,
  CreditCard,
  Banknote,
  Wallet,
  AlertCircle,
  Sparkles,
  X,
  Copy,
  ExternalLink,
  HandHeart,
  UserRoundCheck,
  Settings,
} from "lucide-react";
import { useParish } from "./context.js";
import { CHURCHES, churchById } from "./data.js";
import {
  ageOn,
  groupsFor,
  GROUPS,
  membershipConflict,
  nextSandhai,
  recipientsFor,
  uid,
  money,
} from "./domain.js";
import {
  Avatar,
  Badge,
  Button,
  Field,
  Modal,
  ChurchArt,
  Empty,
} from "./components.jsx";
import { StaffLogin } from "./PublicPortal.jsx";
import { CHURCH_LOCATION } from "./church-location.js";

const today = () => new Date().toISOString().slice(0, 10);
const roles = [
  "Member",
  "Pastor",
  "Head Pastor",
  "Committee member",
  "Secretary",
  "Treasurer",
  "Chairman",
  "Administrator",
];
const Footer = ({ children }) => <div className="modal-footer">{children}</div>;
function ErrorText({ error }) {
  return error ? (
    <p className="form-error" role="alert">
      <AlertCircle size={15} />
      {error}
    </p>
  ) : null;
}

function MemberForm({ dialog }) {
  const { data, church, update, close, activity } = useParish();
  const existing = data.members.find((m) => m.id === dialog.memberId);
  const registration = dialog.registration;
  const [form, setForm] = useState(
    existing || {
      name: "",
      church: church === "all" ? "mng" : church,
      secondary: [],
      gender: "Female",
      dob: "",
      anniversary: "",
      phone: "",
      email: "",
      address: "",
      sandhai: "",
      role: "Member",
      status: registration ? "Pending" : "Active",
      consent: { whatsapp: !registration, sms: !registration },
    },
  );
  const [generate, setGenerate] = useState(false);
  const [error, setError] = useState("");
  const change = (key, value) => setForm({ ...form, [key]: value });
  function submit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter the member’s name.");
    if (new Date(form.dob) > new Date())
      return setError("Date of birth cannot be in the future.");
    if (form.anniversary && new Date(form.anniversary) < new Date(form.dob))
      return setError("The wedding date must be after the date of birth.");
    if (form.status === "Active" && !form.sandhai.trim() && !generate)
      return setError(
        "Enter the existing Sandhai number, or confirm that a new number is needed.",
      );
    const number =
      form.sandhai.trim() ||
      (!registration && generate ? nextSandhai(data.members, form.church) : "");
    if (membershipConflict(data.members, form.church, number, existing?.id))
      return setError(
        "This Sandhai number already belongs to someone in this church. Please review it.",
      );
    const member = {
      ...form,
      name: form.name.trim(),
      sandhai: number,
      secondary: form.secondary.filter((id) => id !== form.church),
      id: existing?.id || uid(),
      joined: existing?.joined || today(),
    };
    update(
      (d) => ({
        ...d,
        members: existing
          ? d.members.map((m) => (m.id === existing.id ? member : m))
          : [member, ...d.members],
        activity: [
          activity(
            registration
              ? "New registration submitted"
              : existing
                ? "Member profile updated"
                : "A new member was welcomed",
            member.name,
          ),
          ...d.activity,
        ],
      }),
      registration
        ? "Registration submitted for review."
        : existing
          ? "Member profile updated."
          : `${member.name} has been added to your church family.`,
    );
    close();
  }
  return (
    <Modal
      wide
      title={
        registration
          ? "Welcome to the church family"
          : existing
            ? "Edit member profile"
            : "Make room for one more"
      }
      description={
        registration
          ? "Register with your church. Your pastor or church office will review your details."
          : "A few details help us stay connected and care for each other."
      }
      onClose={close}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Full name *">
              <input
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => change("name", e.target.value)}
                placeholder="e.g. Rebecca Samuel"
              />
            </Field>
            <Field label="Primary church *">
              <select
                value={form.church}
                onChange={(e) =>
                  setForm({
                    ...form,
                    church: e.target.value,
                    secondary: form.secondary.filter(
                      (id) => id !== e.target.value,
                    ),
                  })
                }
              >
                {CHURCHES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.place}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Date of birth *">
              <input
                required
                type="date"
                max={today()}
                value={form.dob}
                onChange={(e) => change("dob", e.target.value)}
              />
            </Field>
            <Field label="Gender">
              <select
                value={form.gender}
                onChange={(e) => change("gender", e.target.value)}
              >
                <option>Female</option>
                <option>Male</option>
              </select>
            </Field>
            <Field label="Mobile number *">
              <input
                required
                type="tel"
                pattern="[+0-9 \(\)\-]{8,20}"
                value={form.phone}
                onChange={(e) => change("phone", e.target.value)}
                placeholder="+91 90000 00000"
              />
            </Field>
            <Field label="Email address">
              <input
                type="email"
                value={form.email}
                onChange={(e) => change("email", e.target.value)}
                placeholder="name@example.com"
              />
            </Field>
            <Field label="Wedding anniversary">
              <input
                type="date"
                min={form.dob}
                max={today()}
                value={form.anniversary}
                onChange={(e) => change("anniversary", e.target.value)}
              />
            </Field>
            {!registration && (
              <Field label="Role">
                <select
                  value={form.role}
                  onChange={(e) => change("role", e.target.value)}
                >
                  {roles.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </Field>
            )}
            <Field
              label="Sandhai number"
              hint={
                registration
                  ? "If you don’t know it, your reviewer will confirm it."
                  : `Full membership ID: ${churchById(form.church).code}-${form.sandhai || "…"}`
              }
            >
              <input
                value={form.sandhai}
                onChange={(e) => {
                  change("sandhai", e.target.value);
                  setGenerate(false);
                }}
                placeholder="Existing church membership number"
              />
            </Field>
            <Field label="Address">
              <input
                value={form.address}
                onChange={(e) => change("address", e.target.value)}
                placeholder="Street, area, city"
              />
            </Field>
          </div>
          {!registration && !form.sandhai && (
            <label className="check-line">
              <input
                type="checkbox"
                checked={generate}
                onChange={(e) => setGenerate(e.target.checked)}
              />
              I have confirmed this member has no existing Sandhai number.
              Assign a new one.
            </label>
          )}
          <div className="field">
            <span>
              Also associated with <small>(optional)</small>
            </span>
            <div className="checkbox-grid">
              {CHURCHES.filter((c) => c.id !== form.church).map((c) => (
                <label key={c.id}>
                  <input
                    type="checkbox"
                    checked={form.secondary.includes(c.id)}
                    onChange={(e) =>
                      change(
                        "secondary",
                        e.target.checked
                          ? [...form.secondary, c.id]
                          : form.secondary.filter((id) => id !== c.id),
                      )
                    }
                  />
                  {c.name}
                </label>
              ))}
            </div>
          </div>
          <div className="consent-box">
            <strong>Communication preferences</strong>
            <p>
              Record the member’s permission to receive church communications.
            </p>
            <div className="checkbox-grid">
              {["whatsapp", "sms"].map((channel) => (
                <label key={channel}>
                  <input
                    type="checkbox"
                    checked={form.consent[channel]}
                    onChange={(e) =>
                      change("consent", {
                        ...form.consent,
                        [channel]: e.target.checked,
                      })
                    }
                  />
                  {channel === "whatsapp" ? "WhatsApp messages" : "SMS alerts"}
                </label>
              ))}
            </div>
          </div>
          <ErrorText error={error} />
        </div>
        <Footer>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            {registration
              ? "Submit for approval"
              : existing
                ? "Save changes"
                : "Add member"}
            <ArrowRight size={15} />
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

function MemberDetail({ dialog }) {
  const { data, close, open, update, activity, can } = useParish();
  const m = data.members.find((m) => m.id === dialog.memberId);
  const [archive, setArchive] = useState(false);
  const [reason, setReason] = useState("Transferred to another church");
  if (!m) return null;
  return (
    <Modal title="A member of our family" onClose={close}>
      <div className="modal-body">
        <div className="profile-summary">
          <Avatar name={m.name} size="large" />
          <h2>{m.name}</h2>
          <p>
            {m.role} · {churchById(m.church).name}
          </p>
          <Badge
            tone={
              m.status === "Active"
                ? "green"
                : m.status === "Pending"
                  ? "orange"
                  : "neutral"
            }
          >
            {m.status}
          </Badge>
        </div>
        <dl className="detail-grid">
          <dt>Membership ID</dt>
          <dd>
            {m.sandhai
              ? `${churchById(m.church).code}-${m.sandhai}`
              : "Awaiting confirmation"}
          </dd>
          <dt>Birthday</dt>
          <dd>
            {new Date(`${m.dob}T12:00:00`).toLocaleDateString(getLocale(), {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}{" "}
            · {ageOn(m.dob)} years
          </dd>
          <dt>Mobile</dt>
          <dd>{m.phone}</dd>
          <dt>Email</dt>
          <dd>{m.email || "Not provided"}</dd>
          <dt>Address</dt>
          <dd>{m.address || "Not provided"}</dd>
          {m.anniversary && (
            <>
              <dt>Wedding anniversary</dt>
              <dd>
                {new Date(`${m.anniversary}T12:00:00`).toLocaleDateString(
                  getLocale(),
                  { day: "numeric", month: "long", year: "numeric" },
                )}
              </dd>
            </>
          )}
          <dt>Other churches</dt>
          <dd>
            {m.secondary.map((id) => churchById(id).name).join(", ") ||
              "Primary church only"}
          </dd>
          <dt>Communication</dt>
          <dd>
            {Object.entries(m.consent)
              .filter(([, yes]) => yes)
              .map(([key]) => (key === "whatsapp" ? "WhatsApp" : "SMS"))
              .join(" & ") || "No channels opted in"}
          </dd>
          {m.archiveReason && (
            <>
              <dt>Archive reason</dt>
              <dd>{m.archiveReason}</dd>
            </>
          )}
        </dl>
        <div className="profile-groups">
          <span className="eyebrow">A PLACE TO BELONG</span>
          <div className="group-chips">
            {groupsFor(m, data.rules).map((g) => (
              <Badge key={g} tone="neutral">
                {g}
              </Badge>
            ))}
          </div>
        </div>
        {archive && (
          <div className="archive-box">
            <Field label="Reason for archiving">
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              >
                {[
                  "Transferred to another church",
                  "Moved after marriage",
                  "Voluntary departure",
                  "Deceased",
                ].map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </Field>
            <p>
              The member’s history is preserved. They will no longer receive
              messages.
            </p>
            <Button
              variant="danger"
              onClick={() => {
                update(
                  (d) => ({
                    ...d,
                    members: d.members.map((member) =>
                      member.id === m.id
                        ? {
                            ...member,
                            status: "Archived",
                            archiveReason: reason,
                          }
                        : member,
                    ),
                    activity: [
                      activity("Member archived", `${m.name} · ${reason}`),
                      ...d.activity,
                    ],
                  }),
                  "Member archived. Their history is preserved.",
                );
                close();
              }}
            >
              Confirm archive
            </Button>
          </div>
        )}
      </div>
      <Footer>
        {can("manageMembers") && m.status === "Active" && !archive && (
          <button className="subtle-danger" onClick={() => setArchive(true)}>
            Archive member
          </button>
        )}
        {can("manageMembers") && (
          <Button
            variant="secondary"
            onClick={() => open("member", { memberId: m.id })}
          >
            Edit profile
          </Button>
        )}
        {can("manageMembers") && m.status === "Pending" ? (
          <Button onClick={() => open("approve", { memberId: m.id })}>
            Review registration
            <ArrowRight size={15} />
          </Button>
        ) : can("message") && m.status === "Active" ? (
          <Button onClick={() => open("message", { memberId: m.id })}>
            <Send size={15} />
            Message
          </Button>
        ) : null}
      </Footer>
    </Modal>
  );
}

function ApproveMember({ dialog }) {
  const { data, close, update, activity, open } = useParish();
  const m = data.members.find((m) => m.id === dialog.memberId);
  const [number, setNumber] = useState(m?.sandhai || "");
  const [generate, setGenerate] = useState(false);
  const [error, setError] = useState("");
  if (!m) return null;
  function approve(e) {
    e.preventDefault();
    if (m.status !== "Pending")
      return setError("This registration has already been reviewed.");
    if (!number.trim() && !generate)
      return setError(
        "Confirm an existing number, or check that a new number is needed.",
      );
    const sandhai = number.trim() || nextSandhai(data.members, m.church);
    if (membershipConflict(data.members, m.church, sandhai, m.id))
      return setError(
        "This number is already assigned in this church. Please check the church register.",
      );
    update(
      (d) => ({
        ...d,
        members: d.members.map((member) =>
          member.id === m.id
            ? { ...member, sandhai, status: "Active" }
            : member,
        ),
        activity: [activity("Registration approved", m.name), ...d.activity],
      }),
      `${m.name} is now an active member. Membership ID: ${churchById(m.church).code}-${sandhai}`,
    );
    close();
  }
  return (
    <Modal
      title="A warm welcome starts here"
      description="Review this registration and confirm the church’s membership record."
      onClose={close}
    >
      <form onSubmit={approve}>
        <div className="modal-body">
          <div className="review-member">
            <Avatar name={m.name} size="large" />
            <span>
              <h3>{m.name}</h3>
              <p>
                {churchById(m.church).name} · {m.phone}
              </p>
            </span>
            <Badge tone="orange">Pending</Badge>
          </div>
          <div className="inline-info">
            <ShieldCheck size={20} />
            Check the existing church register before issuing a new Sandhai
            number.
          </div>
          <Field
            label="Existing Sandhai number"
            hint={`Church prefix: ${churchById(m.church).code}`}
          >
            <input
              value={number}
              onChange={(e) => {
                setNumber(e.target.value);
                setGenerate(false);
              }}
              placeholder="Enter their existing number"
            />
          </Field>
          <label className="check-line">
            <input
              disabled={!!number.trim()}
              checked={generate}
              type="checkbox"
              onChange={(e) => setGenerate(e.target.checked)}
            />
            I confirm this member has no existing number. Create a new Sandhai
            number.
          </label>
          {generate && (
            <div className="generated-id">
              New membership ID{" "}
              <strong>
                {churchById(m.church).code}-
                {nextSandhai(data.members, m.church)}
              </strong>
            </div>
          )}
          <ErrorText error={error} />
        </div>
        <Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={() => open("member-detail", { memberId: m.id })}
          >
            View full profile
          </Button>
          <Button type="submit">
            <Check size={16} />
            Approve member
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

function ComposeMessage({ dialog }) {
  const { data, church, update, close, activity } = useParish();
  const draft = dialog.draft;
  const ids =
    dialog.memberIds ||
    draft?.memberIds ||
    (dialog.memberId ? [dialog.memberId] : null);
  const person = data.members.find((m) => m.id === dialog.memberId);
  const [title, setTitle] = useState(
    draft?.title ||
      dialog.title ||
      (dialog.celebration ? `${dialog.celebration} blessing` : ""),
  );
  const [body, setBody] = useState(
    draft?.body ||
      dialog.body ||
      (dialog.celebration
        ? `Dear ${person?.name || "friend"}, wishing you a blessed ${dialog.celebration.toLowerCase()}! May God surround you with joy, love, and grace. With love, your church family.`
        : ""),
  );
  const [channel, setChannel] = useState(draft?.channel || "whatsapp");
  const [churches, setChurches] = useState(
    draft?.churches || dialog.churches || (church === "all" ? [] : [church]),
  );
  const [groups, setGroups] = useState(draft?.groups || ["Whole church"]);
  const [schedule, setSchedule] = useState(
    draft?.scheduledAt ? "later" : "now",
  );
  const [scheduledAt, setScheduledAt] = useState(draft?.scheduledAt || "");
  const [error, setError] = useState("");
  const eligible = recipientsFor(
    data.members,
    ids ? [] : churches,
    ids ? [] : groups,
    channel,
    data.rules,
  );
  const recipients = ids
    ? eligible.filter((m) => ids.includes(m.id))
    : eligible;
  function save(asDraft, e) {
    e?.preventDefault();
    if (!title.trim())
      return setError("Give your message a title so you can find it later.");
    if (!body.trim()) return setError("Write a message for your community.");
    if (!asDraft && !recipients.length)
      return setError(
        "No active members in this audience have opted in to this channel.",
      );
    if (
      !asDraft &&
      schedule === "later" &&
      (!scheduledAt || new Date(scheduledAt) <= new Date())
    )
      return setError("Choose a future date and time.");
    const message = {
      id: draft?.id || uid(),
      title: title.trim(),
      body: body.trim(),
      channel,
      churches,
      groups: ids ? [] : groups,
      memberIds: ids || undefined,
      count: recipients.length,
      recipientIds: recipients.map((m) => m.id),
      scheduledAt: schedule === "later" ? scheduledAt : null,
      status: asDraft
        ? "Draft"
        : schedule === "later"
          ? "Scheduled demo"
          : "Demo completed",
      date: new Date().toISOString(),
    };
    update(
      (d) => ({
        ...d,
        messages: draft
          ? d.messages.map((m) => (m.id === draft.id ? message : m))
          : [message, ...d.messages],
        activity: [
          activity(
            asDraft ? "Message draft saved" : "Message demo created",
            `${message.title} · ${recipients.length} recipients`,
          ),
          ...d.activity,
        ],
      }),
      asDraft
        ? "Your message has been saved as a draft."
        : schedule === "later"
          ? "Demo schedule saved. No messages will be sent."
          : `Demo complete for ${recipients.length} recipients. No real messages were sent.`,
    );
    close();
  }
  return (
    <Modal
      wide
      title="A word for your church family"
      description="Choose your audience. Share something that brings them closer."
      onClose={close}
    >
      <form onSubmit={(e) => save(false, e)}>
        <div className="modal-body compose-body">
          <div className="channel-selector">
            <button
              type="button"
              className={channel === "whatsapp" ? "selected" : ""}
              onClick={() => setChannel("whatsapp")}
            >
              <MessageCircle size={19} />
              <span>
                <strong>WhatsApp</strong>
                <small>Connect personally</small>
              </span>
              {channel === "whatsapp" && <Check size={16} />}
            </button>
            <button
              type="button"
              className={channel === "sms" ? "selected" : ""}
              onClick={() => setChannel("sms")}
            >
              <MessageSquare size={19} />
              <span>
                <strong>SMS</strong>
                <small>Keep it simple</small>
              </span>
              {channel === "sms" && <Check size={16} />}
            </button>
          </div>
          {!ids ? (
            <>
              <div className="field">
                <span>Who is this message for?</span>
                <div className="audience-churches">
                  <label className={!churches.length ? "selected" : ""}>
                    <input
                      type="checkbox"
                      checked={!churches.length}
                      onChange={() => setChurches([])}
                    />
                    Whole pastorate
                  </label>
                  {CHURCHES.map((c) => (
                    <label
                      className={churches.includes(c.id) ? "selected" : ""}
                      key={c.id}
                    >
                      <input
                        type="checkbox"
                        checked={churches.includes(c.id)}
                        onChange={(e) =>
                          setChurches(
                            e.target.checked
                              ? [...churches, c.id]
                              : churches.filter((id) => id !== c.id),
                          )
                        }
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Fellowships and roles">
                <select
                  value=""
                  onChange={(e) => {
                    const g = e.target.value;
                    if (g === "Whole church") setGroups(["Whole church"]);
                    else
                      setGroups([
                        ...new Set([
                          ...groups.filter((x) => x !== "Whole church"),
                          g,
                        ]),
                      ]);
                  }}
                >
                  <option value="" disabled>
                    Add a fellowship or role…
                  </option>
                  {GROUPS.map((g) => (
                    <option key={g}>{g}</option>
                  ))}
                </select>
              </Field>
              <div className="selected-groups">
                {groups.map((g) => (
                  <button
                    type="button"
                    key={g}
                    onClick={() =>
                      setGroups(
                        groups.length === 1
                          ? ["Whole church"]
                          : groups.filter((x) => x !== g),
                      )
                    }
                  >
                    {g}
                    <X size={12} />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="recipient-selection">
              <Users size={18} />
              <span>
                {ids.length === 1
                  ? person?.name ||
                    data.members.find((m) => m.id === ids[0])?.name
                  : `${ids.length} selected members`}
              </span>
            </div>
          )}
          <div className="audience-summary">
            <span>
              <Users size={19} />
              <strong>{recipients.length} recipients</strong>
            </span>
            <small>
              Active members with {channel === "whatsapp" ? "WhatsApp" : "SMS"}{" "}
              consent · counted once
            </small>
          </div>
          <Field label="Message title *">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. This Sunday, let’s come together"
              maxLength={120}
            />
          </Field>
          <Field label="Your message *">
            <textarea
              required
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Dear church family…"
              maxLength={4096}
            />
          </Field>
          <div className="message-char-count">
            {body.length} characters
            {channel === "sms" && body.length > 160
              ? " · May use multiple SMS segments"
              : ""}
          </div>
          <div className="schedule-row">
            <label>
              <input
                type="radio"
                name="schedule"
                checked={schedule === "now"}
                onChange={() => setSchedule("now")}
              />
              Run demo now
            </label>
            <label>
              <input
                type="radio"
                name="schedule"
                checked={schedule === "later"}
                onChange={() => setSchedule("later")}
              />
              Schedule demo
            </label>
          </div>
          {schedule === "later" && (
            <Field label="Date and time (your local time)">
              <input
                type="datetime-local"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
            </Field>
          )}
          <p className="demo-disclaimer">
            Prototype preview only. No messages are sent, and saved schedules do
            not run automatically.
          </p>
          <ErrorText error={error} />
        </div>
        <Footer>
          <Button type="button" variant="secondary" onClick={() => save(true)}>
            Save draft
          </Button>
          <Button type="submit" disabled={!recipients.length}>
            <Send size={15} />
            {schedule === "later" ? "Save demo schedule" : "Send demo message"}
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

function AnnouncementForm() {
  const { church, close, update, activity } = useParish();
  const [form, setForm] = useState({
    title: "",
    description: "",
    church,
    category: "General",
    event: "",
    location: "",
    pinned: false,
  });
  const change = (key, value) => setForm({ ...form, [key]: value });
  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    const notice = {
      ...form,
      id: uid(),
      title: form.title.trim(),
      description: form.description.trim(),
      date: today(),
      author: "Daniel Selvaraj",
    };
    update(
      (d) => ({
        ...d,
        notices: [notice, ...d.notices],
        activity: [
          activity("Announcement posted", notice.title),
          ...d.activity,
        ],
      }),
      "Your announcement is on the notice board.",
    );
    close();
  }
  return (
    <Modal
      title="Something worth sharing"
      description="Bring your church family into the loop."
      onClose={close}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Announcement title *">
            <input
              required
              maxLength={100}
              value={form.title}
              onChange={(e) => change("title", e.target.value)}
              placeholder="What’s happening in your church?"
            />
          </Field>
          <div className="form-grid">
            <Field label="Share with">
              <select
                value={form.church}
                onChange={(e) => change("church", e.target.value)}
              >
                <option value="all">Whole pastorate</option>
                {CHURCHES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => change("category", e.target.value)}
              >
                {[
                  "General",
                  "Worship",
                  "Fellowship",
                  "Sunday school",
                  "Community care",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="The details *">
            <textarea
              required
              rows={5}
              value={form.description}
              onChange={(e) => change("description", e.target.value)}
              placeholder="Tell your community a little more…"
            />
          </Field>
          <div className="form-grid">
            <Field label="When (optional)">
              <input
                value={form.event}
                onChange={(e) => change("event", e.target.value)}
                placeholder="Sunday · 8:30 AM"
              />
            </Field>
            <Field label="Where (optional)">
              <input
                value={form.location}
                onChange={(e) => change("location", e.target.value)}
                placeholder="Church hall"
              />
            </Field>
          </div>
          <label className="check-line">
            <input
              type="checkbox"
              checked={form.pinned}
              onChange={(e) => change("pinned", e.target.checked)}
            />
            Pin this announcement
          </label>
        </div>
        <Footer>
          <Button variant="secondary" type="button" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            Post announcement
            <ArrowRight size={15} />
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

function DonationForm({ dialog }) {
  const { data, church, close, update, activity, isStaff } = useParish();
  const choices = data.campaigns.filter(
    (c) => church === "all" || c.church === church,
  );
  const [campaign, setCampaign] = useState(
    dialog.campaignId || choices[0]?.id || "",
  );
  const [amount, setAmount] = useState("");
  const [donor, setDonor] = useState("");
  const [method, setMethod] = useState(
    (isStaff ? dialog.method : null) || "Online demo",
  );
  const [error, setError] = useState("");
  const pledge = dialog.type === "pledge";
  const selected = data.campaigns.find((c) => c.id === campaign);
  function submit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!campaign) return setError("Choose a church initiative first.");
    if (!Number.isFinite(value) || value <= 0 || value > 100000000)
      return setError("Enter an amount between ₹1 and ₹10,00,00,000.");
    const entry = {
      id: uid(),
      campaign,
      amount: value,
      donor: donor.trim() || "Anonymous",
      method,
      date: new Date().toISOString(),
    };
    update(
      (d) => ({
        ...d,
        ...(pledge
          ? {
              campaigns: d.campaigns.map((c) =>
                c.id === campaign ? { ...c, pledged: c.pledged + value } : c,
              ),
              pledges: [...(d.pledges || []), entry],
            }
          : { donations: [...d.donations, entry] }),
        activity: [
          activity(
            pledge
              ? "A new pledge was made"
              : method === "Online demo"
                ? "Demo contribution recorded"
                : "Offline contribution recorded",
            `${money(value)} · ${selected.title}`,
          ),
          ...d.activity,
        ],
      }),
      pledge
        ? `Thank you. Your ${money(value)} pledge has been recorded.`
        : method === "Online demo"
          ? `Demo contribution of ${money(value)} recorded. No payment was taken.`
          : `${money(value)} ${method.toLowerCase()} contribution recorded.`,
    );
    close();
  }
  return (
    <Modal
      title={
        pledge
          ? "A promise of generosity"
          : method === "Online demo"
            ? "Give with an open heart"
            : "Record a generous gift"
      }
      description="Every contribution helps our community flourish."
      onClose={close}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Support an initiative">
            <select
              required
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
            >
              {choices.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} · {churchById(c.church).place}
                </option>
              ))}
            </select>
          </Field>
          {selected && (
            <div className="donation-impact">
              <Heart size={23} />
              <p>{selected.description}</p>
            </div>
          )}
          <Field label="Amount (₹) *">
            <input
              required
              type="number"
              min="1"
              max="100000000"
              step="1"
              className="amount-input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0"
            />
          </Field>
          <div className="amount-presets">
            {[500, 1000, 2500, 5000].map((n) => (
              <button
                key={n}
                type="button"
                className={Number(amount) === n ? "selected" : ""}
                onClick={() => setAmount(String(n))}
              >
                {money(n)}
              </button>
            ))}
          </div>
          <Field
            label="Contributor name"
            hint="Leave blank to record an anonymous gift."
          >
            <input
              value={donor}
              onChange={(e) => setDonor(e.target.value)}
              placeholder="Your name or fellowship"
            />
          </Field>
          {!pledge && isStaff && (
            <Field label="Contribution method">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
              >
                <option>Online demo</option>
                <option>Cash</option>
                <option>Bank transfer</option>
              </select>
            </Field>
          )}
          {!pledge && method === "Online demo" && (
            <div className="inline-info">
              <ShieldCheck size={20} />
              This is a payment demonstration. No money will be charged, and no
              payment details are collected.
            </div>
          )}
          {pledge && (
            <p className="demo-disclaimer">
              A pledge records your intention to give. It is tracked separately
              from collected contributions.
            </p>
          )}
          <ErrorText error={error} />
        </div>
        <Footer>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            <Heart size={15} />
            {pledge
              ? "Record pledge"
              : method === "Online demo"
                ? "Simulate contribution"
                : "Record contribution"}
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

function CampaignForm() {
  const { church, close, update, activity } = useParish();
  const [form, setForm] = useState({
    title: "",
    description: "",
    goal: "",
    church: church === "all" ? "mng" : church,
    category: "Community care",
  });
  function submit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) return;
    const campaign = {
      ...form,
      id: uid(),
      goal: Number(form.goal),
      pledged: 0,
      color: "green",
    };
    update(
      (d) => ({
        ...d,
        campaigns: [campaign, ...d.campaigns],
        activity: [
          activity("A new church need was shared", form.title),
          ...d.activity,
        ],
      }),
      "Your church initiative is ready to receive support.",
    );
    close();
  }
  return (
    <Modal
      title="Let your community help"
      description="Share a church need and invite others to make a difference."
      onClose={close}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <Field label="Initiative title *">
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What can we make possible together?"
            />
          </Field>
          <Field label="Church">
            <select
              value={form.church}
              onChange={(e) => setForm({ ...form, church: e.target.value })}
            >
              {CHURCHES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tell us about the need *">
            <textarea
              rows={4}
              required
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </Field>
          <div className="form-grid">
            <Field label="Fundraising goal (₹) *">
              <input
                type="number"
                min="1"
                max="100000000"
                required
                value={form.goal}
                onChange={(e) => setForm({ ...form, goal: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {[
                  "Community care",
                  "Church restoration",
                  "Outreach",
                  "Education",
                ].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>
        </div>
        <Footer>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            Share this need
            <ArrowRight size={15} />
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

function PrayerForm() {
  const { church, close, update, activity } = useParish();
  const [form, setForm] = useState({
    name: "",
    church: church === "all" ? "mng" : church,
    category: "Healing",
    message: "",
    private: true,
  });
  function submit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.message.trim()) return;
    const prayer = {
      ...form,
      name: form.name.trim(),
      message: form.message.trim(),
      id: uid(),
      date: today(),
      status: "New",
    };
    update(
      (d) => ({
        ...d,
        prayers: [prayer, ...d.prayers],
        activity: [
          activity(
            "A prayer request was received",
            churchById(form.church).name,
          ),
          ...d.activity,
        ],
      }),
      "Your prayer request is in the pastoral inbox.",
    );
    close();
  }
  return (
    <Modal
      title="You don’t have to carry it alone"
      description="Your church family is here to pray with you."
      onClose={close}
    >
      <form onSubmit={submit}>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Your name *">
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <Field label="Your church">
              <select
                value={form.church}
                onChange={(e) => setForm({ ...form, church: e.target.value })}
              >
                {CHURCHES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Prayer category">
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {["Healing", "Family", "Guidance", "Thanksgiving", "Other"].map(
                (c) => (
                  <option key={c}>{c}</option>
                ),
              )}
            </select>
          </Field>
          <Field label="What’s on your heart? *">
            <textarea
              required
              rows={5}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Share as much or as little as you feel comfortable with…"
            />
          </Field>
          <label className="check-line">
            <input
              type="checkbox"
              checked={form.private}
              onChange={(e) => setForm({ ...form, private: e.target.checked })}
            />
            Keep this request confidential to my pastors
          </label>
          <div className="prayer-routing">
            <ShieldCheck size={22} />
            <div>
              <strong>Placed in the pastoral inbox for</strong>
              <p>
                {churchById(form.church).pastor}
                <br />
                Rev. Joseph Paul, Head Pastor
              </p>
            </div>
          </div>
          <p className="demo-disclaimer">
            Use sample details in this prototype. Requests stay in this browser;
            no pastors are notified externally.
          </p>
        </div>
        <Footer>
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            <HandHeart size={16} />
            Submit prayer request
          </Button>
        </Footer>
      </form>
    </Modal>
  );
}

export default function Dialogs({ dialog }) {
  const { data, close, open, go, setChurch, isStaff, session, logout, can } =
    useParish();
  if (dialog.type === "login") return <StaffLogin />;
  if (dialog.type === "member") return <MemberForm dialog={dialog} />;
  if (dialog.type === "member-detail") return <MemberDetail dialog={dialog} />;
  if (dialog.type === "approve") return <ApproveMember dialog={dialog} />;
  if (dialog.type === "message") return <ComposeMessage dialog={dialog} />;
  if (dialog.type === "notice") return <AnnouncementForm />;
  if (["donation", "pledge"].includes(dialog.type))
    return <DonationForm dialog={dialog} />;
  if (dialog.type === "campaign") return <CampaignForm />;
  if (dialog.type === "prayer") return <PrayerForm />;
  if (dialog.type === "church") {
    const c = churchById(dialog.churchId);
    return (
      <Modal
        title={c.name}
        description={`${c.type} · ${c.place}, Tamil Nadu`}
        onClose={close}
      >
        <div className="modal-body">
          <div className={`church-modal-art ${c.color}`}>
            <ChurchArt />
          </div>
          <dl className="detail-grid">
            <dt>Pastorate</dt>
            <dd>{data.settings.pastorate}</dd>
            <dt>Diocese</dt>
            <dd>{data.settings.diocese}</dd>
            <dt>Serving pastor</dt>
            <dd>{c.pastor}</dd>
            <dt>Head pastor</dt>
            <dd>Rev. Joseph Paul</dd>
            <dt>Church code</dt>
            <dd>{c.code}</dd>
            {c.id === "mng" && (
              <>
                <dt>Address</dt>
                <dd>
                  {CHURCH_LOCATION.address}
                  <br />
                  <a
                    className="church-location-link"
                    href={CHURCH_LOCATION.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get directions
                    <ArrowUpRight size={14} />
                  </a>
                </dd>
              </>
            )}
            <dt>Active members</dt>
            <dd>
              {
                data.members.filter(
                  (m) => m.church === c.id && m.status === "Active",
                ).length
              }
            </dd>
            <dt>Established</dt>
            <dd>{c.established}</dd>
          </dl>
        </div>
        <Footer>
          <Button
            variant="secondary"
            onClick={() => open("message", { churches: [c.id] })}
          >
            <Send size={15} />
            Message church
          </Button>
          <Button
            onClick={() => {
              setChurch(c.id);
              go("members");
              close();
            }}
          >
            View members
            <ArrowRight size={15} />
          </Button>
        </Footer>
      </Modal>
    );
  }
  if (dialog.type === "notice-detail") {
    const n = dialog.notice;
    return (
      <Modal
        title={n.title}
        description={
          n.church === "all"
            ? "An announcement for the whole pastorate"
            : churchById(n.church).name
        }
        onClose={close}
      >
        <div className="modal-body notice-detail">
          <Badge>{n.category}</Badge>
          <p>{n.description}</p>
          {n.event && (
            <p className="icon-line">
              <CalendarDays size={17} />
              {n.event}
            </p>
          )}
          {n.location && (
            <p className="icon-line">
              <MapPin size={17} />
              {n.location}
            </p>
          )}
          <div className="notice-author">
            <Avatar name={n.author} />
            <span>Shared by {n.author}</span>
          </div>
        </div>
        <Footer>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
          {isStaff && (
            <Button
              onClick={() =>
                open("message", {
                  title: n.title,
                  body: `${n.title}\n\n${n.description}${n.event ? `\n\n${n.event}` : ""}${n.location ? ` · ${n.location}` : ""}`,
                })
              }
            >
              <Send size={15} />
              Share a reminder
            </Button>
          )}
        </Footer>
      </Modal>
    );
  }
  if (dialog.type === "message-detail") {
    const m = dialog.message;
    return (
      <Modal
        title={m.title}
        description={`${m.channel === "whatsapp" ? "WhatsApp" : "SMS"} · ${m.count} eligible recipients`}
        onClose={close}
      >
        <div className="modal-body">
          <Badge>{m.status}</Badge>
          <div className="message-preview">{m.body}</div>
          <dl className="detail-grid">
            <dt>Churches</dt>
            <dd>
              {m.churches.length
                ? m.churches.map((id) => churchById(id).name).join(", ")
                : "Whole pastorate"}
            </dd>
            <dt>Audience</dt>
            <dd>{m.groups.join(", ") || "Selected members"}</dd>
            {m.scheduledAt && (
              <>
                <dt>Demo schedule</dt>
                <dd>{new Date(m.scheduledAt).toLocaleString(getLocale())}</dd>
              </>
            )}
          </dl>
          <div className="inline-info">
            <ShieldCheck size={18} />
            This is a demo record. No real messages were sent or scheduled for
            delivery.
          </div>
        </div>
        <Footer>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
          <Button
            onClick={() => open("message", { title: m.title, body: m.body })}
          >
            Use as a template
            <ArrowRight size={15} />
          </Button>
        </Footer>
      </Modal>
    );
  }
  if (dialog.type === "activity")
    return (
      <Modal
        title="The life of your pastorate"
        description="Recent activity in your community workspace."
        onClose={close}
      >
        <div className="modal-body activity-list">
          {data.activity.slice(0, 15).map((a) => (
            <div key={a.id}>
              <span className="activity-icon">
                <Check size={15} />
              </span>
              <span>
                <strong>{a.title}</strong>
                <p>{a.detail}</p>
                <small>
                  {new Date(a.date).toLocaleDateString(getLocale(), {
                    day: "numeric",
                    month: "short",
                  })}
                </small>
              </span>
            </div>
          ))}
        </div>
        <Footer>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
        </Footer>
      </Modal>
    );
  if (dialog.type === "workspace")
    return (
      <Modal
        title="Your pastorate workspace"
        description="One shared home for all your churches."
        onClose={close}
      >
        <div className="modal-body">
          <div className="workspace-heading">
            <span className="workspace-icon">
              <Church size={25} />
            </span>
            <div>
              <h3>{data.settings.pastorate}</h3>
              <p>{data.settings.diocese}</p>
            </div>
          </div>
          <div className="workspace-list">
            {CHURCHES.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setChurch(c.id);
                  close();
                }}
              >
                <Church size={19} />
                <span>
                  <strong>{c.name}</strong>
                  <small>
                    {c.place} · {c.type}
                  </small>
                </span>
                <ArrowRight size={16} />
              </button>
            ))}
          </div>
        </div>
        <Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setChurch("all");
              close();
            }}
          >
            View all churches
          </Button>
          <Button
            onClick={() => {
              go("settings");
              close();
            }}
          >
            <Settings size={16} />
            Workspace settings
          </Button>
        </Footer>
      </Modal>
    );
  if (dialog.type === "account")
    return (
      <Modal
        title="Welcome, Daniel"
        description="Your role in this shared community."
        onClose={close}
      >
        <div className="modal-body">
          <div className="profile-summary">
            <Avatar name="Daniel Selvaraj" size="large" />
            <h2>Daniel Selvaraj</h2>
            <p>
              {session?.role} · {data.settings.pastorate}
            </p>
            <Badge>Pastorate-wide access</Badge>
          </div>
          <div className="inline-info">
            <ShieldCheck size={22} />
            You’re exploring a sample account. Secure sign-in and role-based
            access will be connected in the production application.
          </div>
        </div>
        <Footer>
          <Button variant="secondary" onClick={close}>
            Close
          </Button>
          <Button onClick={logout}>
            Sign out
            <ArrowRight size={15} />
          </Button>
        </Footer>
      </Modal>
    );
  return (
    <Modal
      title="A little guide to Parish"
      description="Your church, connected. Here’s where to begin."
      onClose={close}
    >
      <div className="modal-body help-content">
        {[
          [
            Users,
            "Welcome your members",
            "Add a member or try self-registration. Review pending requests and confirm their Sandhai number.",
          ],
          [
            Send,
            "Bring your community closer",
            "Compose a WhatsApp or SMS demo for a church, fellowship, or the whole pastorate.",
          ],
          [
            Heart,
            "Care in everyday ways",
            "Celebrate birthdays, respond to prayers in the pastoral preview, and support a church initiative.",
          ],
        ].map(([Icon, title, body]) => (
          <div key={title}>
            <span>
              <Icon size={21} />
            </span>
            <section>
              <h3>{title}</h3>
              <p>{body}</p>
            </section>
          </div>
        ))}
        <div className="prototype-note">
          This prototype uses fictional people and churches. Changes are saved
          in this browser. Messaging, scheduled wishes, payments, and account
          permissions are demonstrations that need production integrations.
        </div>
      </div>
      <Footer>
        <Button onClick={close}>
          Let’s get started
          <ArrowRight size={15} />
        </Button>
      </Footer>
    </Modal>
  );
}
