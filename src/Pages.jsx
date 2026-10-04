import React, { useState, useEffect } from "react";
import {
  Users,
  Church,
  Plus,
  Download,
  Search,
  ArrowUpRight,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageCircle,
  MessageSquare,
  Cake,
  Heart,
  CalendarDays,
  Sparkles,
  Pin,
  MapPin,
  Clock3,
  HeartHandshake,
  HandHeart,
  Wallet,
  Banknote,
  CreditCard,
  ShieldCheck,
  Settings,
  LockKeyhole,
  SlidersHorizontal,
  Mail,
  CheckCheck,
  UserRoundCheck,
  Eye,
  CircleHelp,
} from "lucide-react";
import { useParish } from "./context.js";
import { CHURCHES, churchById } from "./data.js";
import {
  GROUPS,
  groupsFor,
  ageOn,
  membersInScope,
  celebrationsFor,
  money,
} from "./domain.js";
import {
  Avatar,
  Badge,
  Button,
  Empty,
  PageHeader,
  SectionHeading,
  SearchInput,
  ChurchArt,
  StatCard,
  Field,
} from "./components.jsx";
import { ChurchSelect } from "./Dashboard.jsx";

export function exportMembers(members) {
  const quote = (value) =>
    `"${String(value ?? "")
      .replace(/^[=+@-]/, "'$&")
      .replaceAll('"', '""')}"`;
  const csv = [
    [
      "Name",
      "Church",
      "Sandhai number",
      "Membership ID",
      "Role",
      "Status",
      "Date of birth",
      "Phone",
      "Email",
    ],
    ...members.map((m) => [
      m.name,
      churchById(m.church).name,
      m.sandhai,
      m.sandhai ? `${churchById(m.church).code}-${m.sandhai}` : "",
      m.role,
      m.status,
      m.dob,
      m.phone,
      m.email,
    ]),
  ]
    .map((row) => row.map(quote).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(
    new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = "parish-members.csv";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function Members() {
  const {
    data,
    church,
    open,
    notify,
    memberQuery,
    setMemberQuery,
    memberStatus,
    setMemberStatus,
    can,
  } = useParish();
  const [group, setGroup] = useState("all");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const scoped = membersInScope(data.members, church === "all" ? [] : [church]);
  const filtered = scoped.filter(
    (m) =>
      (memberStatus === "All" || m.status === memberStatus) &&
      (group === "all" || groupsFor(m, data.rules).includes(group)) &&
      `${m.name} ${m.sandhai} ${m.phone} ${m.email}`
        .toLowerCase()
        .includes(memberQuery.toLowerCase()),
  );
  const maxPage = Math.max(1, Math.ceil(filtered.length / 10));
  const safePage = Math.min(page, maxPage);
  const shown = filtered.slice((safePage - 1) * 10, safePage * 10);
  useEffect(() => {
    setPage(1);
    setSelected([]);
  }, [church, group, memberStatus, memberQuery]);
  const toggle = (id) =>
    setSelected((old) =>
      old.includes(id) ? old.filter((x) => x !== id) : [...old, id],
    );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="PEOPLE AT THE HEART OF IT ALL"
        title="Our church family"
        description="Every name is a story. Keep your community connected and cared for."
      >
        <Button
          variant="secondary"
          onClick={() => {
            exportMembers(filtered);
            notify("Member directory exported.");
          }}
        >
          <Download size={16} />
          Export
        </Button>
        {can("manageMembers") && (
          <Button onClick={() => open("member")}>
            <Plus size={17} />
            Add member
          </Button>
        )}
      </PageHeader>
      <div className="member-overview-strip">
        <div>
          <span className="strip-icon green">
            <Users size={20} />
          </span>
          <span>
            <strong>
              {scoped.filter((m) => m.status === "Active").length}
            </strong>{" "}
            active members
          </span>
        </div>
        <div>
          <span className="strip-icon orange">
            <UserRoundCheck size={20} />
          </span>
          <span>
            <strong>
              {scoped.filter((m) => m.status === "Pending").length}
            </strong>{" "}
            awaiting approval
          </span>
        </div>
        <button
          className="text-button"
          onClick={() => open("member", { registration: true })}
        >
          Preview self-registration
          <ArrowUpRight size={15} />
        </button>
      </div>
      <section className="card members-panel">
        <div className="table-tabs">
          {["Active", "Pending", "Archived", "All"].map((status) => (
            <button
              key={status}
              className={memberStatus === status ? "selected" : ""}
              onClick={() => setMemberStatus(status)}
            >
              {status === "Pending" ? "Pending approvals" : status}
              <span>
                {status === "All"
                  ? scoped.length
                  : scoped.filter((m) => m.status === status).length}
              </span>
            </button>
          ))}
        </div>
        <div className="table-toolbar">
          <SearchInput
            value={memberQuery}
            onChange={setMemberQuery}
            placeholder="Search name, Sandhai no. or phone…"
          />
          <div className="filters">
            <ChurchSelect />
            <select
              aria-label="Fellowship filter"
              value={group}
              onChange={(e) => setGroup(e.target.value)}
            >
              <option value="all">All fellowships</option>
              {GROUPS.filter((g) => g !== "Whole church").map((g) => (
                <option key={g}>{g}</option>
              ))}
            </select>
          </div>
        </div>
        {selected.length > 0 && (
          <div className="selection-toolbar">
            <strong>{selected.length} selected</strong>
            <button onClick={() => open("message", { memberIds: selected })}>
              <Send size={14} />
              Message selected
            </button>
            <button
              onClick={() => {
                exportMembers(
                  data.members.filter((m) => selected.includes(m.id)),
                );
                notify("Selected members exported.");
              }}
            >
              <Download size={14} />
              Export selected
            </button>
            <button onClick={() => setSelected([])}>Clear</button>
          </div>
        )}
        <div className="table-scroll">
          <table className="member-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    aria-label="Select all members on this page"
                    checked={
                      shown.length > 0 &&
                      shown.every((m) => selected.includes(m.id))
                    }
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [
                              ...new Set([
                                ...selected,
                                ...shown.map((m) => m.id),
                              ]),
                            ]
                          : selected.filter(
                              (id) => !shown.some((m) => m.id === id),
                            ),
                      )
                    }
                  />
                </th>
                <th>MEMBER</th>
                <th>CHURCH / SANDHAI NO.</th>
                <th>FELLOWSHIP</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {shown.map((m) => (
                <tr key={m.id}>
                  <td>
                    <input
                      type="checkbox"
                      aria-label={`Select ${m.name}`}
                      checked={selected.includes(m.id)}
                      onChange={() => toggle(m.id)}
                    />
                  </td>
                  <td>
                    <button
                      className="member-name-button"
                      onClick={() => open("member-detail", { memberId: m.id })}
                    >
                      <Avatar name={m.name} />
                      <span>
                        <strong>{m.name}</strong>
                        <small>{m.role === "Member" ? m.phone : m.role}</small>
                      </span>
                    </button>
                  </td>
                  <td>
                    <div className="table-cell-stack">
                      <strong>{churchById(m.church).name}</strong>
                      <small>
                        {m.sandhai
                          ? `${churchById(m.church).code}-${m.sandhai}`
                          : "Sandhai number to be confirmed"}
                      </small>
                    </div>
                  </td>
                  <td>
                    <div className="group-chips">
                      {groupsFor(m, data.rules)
                        .filter(
                          (g) => !["Whole church", "Men", "Women"].includes(g),
                        )
                        .slice(0, 1)
                        .map((g) => (
                          <Badge
                            tone={
                              g === "Youth"
                                ? "purple"
                                : g === "Seniors"
                                  ? "orange"
                                  : "neutral"
                            }
                            key={g}
                          >
                            {g}
                          </Badge>
                        ))}
                    </div>
                  </td>
                  <td>
                    <Badge
                      tone={
                        m.status === "Active"
                          ? "green"
                          : m.status === "Pending"
                            ? "orange"
                            : "neutral"
                      }
                    >
                      <span className="badge-dot" />
                      {m.status}
                    </Badge>
                  </td>
                  <td>
                    {can("approve") && m.status === "Pending" ? (
                      <button
                        className="text-button"
                        onClick={() => open("approve", { memberId: m.id })}
                      >
                        Review
                        <ArrowRight size={14} />
                      </button>
                    ) : (
                      <button
                        className="icon-button"
                        aria-label={`View ${m.name}`}
                        onClick={() =>
                          open("member-detail", { memberId: m.id })
                        }
                      >
                        <ArrowUpRight size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <Empty
            title="No members found"
            description="Try another name, church, or fellowship."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setMemberQuery("");
                  setGroup("all");
                  setMemberStatus("All");
                }}
              >
                Clear filters
              </Button>
            }
          />
        )}
        <div className="pagination">
          <span>
            Showing {filtered.length ? (safePage - 1) * 10 + 1 : 0}–
            {Math.min(safePage * 10, filtered.length)} of {filtered.length}{" "}
            members
          </span>
          <div>
            <button
              disabled={safePage <= 1}
              onClick={() => setPage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page {safePage} of {maxPage}
            </span>
            <button
              disabled={safePage >= maxPage}
              onClick={() => setPage(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>
      <p className="page-footnote">
        <ShieldCheck size={14} />
        Sandhai numbers are unique within each church. A church prefix connects
        them across the pastorate.
      </p>
    </div>
  );
}

export function Churches() {
  const { data, open, go, setChurch, church, scopedRole } = useParish();
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="ROOTED IN FAITH. GROWING TOGETHER."
        title="One pastorate. Many places to belong."
        description="Meet the churches and people who make up our shared community."
      />
      <section className="hierarchy-banner">
        <span className="hierarchy-icon">
          <Church size={32} />
        </span>
        <div>
          <span className="eyebrow">{data.settings.diocese}</span>
          <h2>{data.settings.pastorate}</h2>
          <p>
            Led by Rev. Joseph Paul, Head Pastor <span>·</span> 4 churches
            united in service
          </p>
        </div>
        <Badge tone="green">Pastorate workspace</Badge>
      </section>
      <div className="church-card-grid">
        {CHURCHES.filter((c) => !scopedRole || c.id === church).map((c) => (
          <article className="card church-profile" key={c.id}>
            <div className={`church-profile-cover ${c.color}`}>
              <ChurchArt compact />
              <Badge tone="white">{c.type}</Badge>
            </div>
            <div className="church-profile-content">
              <span className="eyebrow">
                {c.code} · EST. {c.established}
              </span>
              <h2>{c.name}</h2>
              <p className="icon-line">
                <MapPin size={14} />
                {c.place}, Tamil Nadu
              </p>
              <div className="church-pastor">
                <Avatar name={c.pastor} />
                <span>
                  <small>Serving pastor</small>
                  <strong>{c.pastor}</strong>
                </span>
              </div>
              <div className="church-profile-stats">
                <span>
                  <strong>
                    {
                      data.members.filter(
                        (m) => m.church === c.id && m.status === "Active",
                      ).length
                    }
                  </strong>
                  Members
                </span>
                <span>
                  <strong>
                    {
                      data.members.filter(
                        (m) =>
                          m.church === c.id && m.role === "Committee member",
                      ).length
                    }
                  </strong>
                  Committee members
                </span>
                <span>
                  <strong>
                    {
                      data.members.filter(
                        (m) => m.church === c.id && m.status === "Pending",
                      ).length
                    }
                  </strong>
                  Pending
                </span>
              </div>
              <div className="church-card-actions">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setChurch(c.id);
                    go("members");
                  }}
                >
                  View members
                  <ArrowRight size={15} />
                </Button>
                <button
                  className="icon-button"
                  aria-label={`About ${c.name}`}
                  onClick={() => open("church", { churchId: c.id })}
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function Communications() {
  const { data, open, church, can } = useParish();
  const [tab, setTab] = useState("All messages");
  const messages = data.messages.filter(
    (m) =>
      (tab === "All messages" ||
        (tab === "Drafts" ? m.status === "Draft" : m.status !== "Draft")) &&
      (church === "all" || !m.churches.length || m.churches.includes(church)),
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="THE RIGHT WORDS, TO THE RIGHT PEOPLE"
        title="Keep the conversation going"
        description="Share an announcement, send a reminder, or simply reach out."
      >
        {can("message") && (
          <Button onClick={() => open("message")}>
            <Plus size={17} />
            Compose message
          </Button>
        )}
      </PageHeader>
      <div className="communications-banner">
        <span className="large-circle">
          <MessageCircle size={32} />
        </span>
        <div>
          <h2>A message can mean so much.</h2>
          <p>
            Reach a fellowship, a church, or your whole pastorate through
            WhatsApp and SMS.
          </p>
        </div>
        <Badge tone="white">Demo messaging</Badge>
      </div>
      {can("message") && (
        <section className="card whatsapp-connect-card">
          <div>
            <h2>Try the Meta connection</h2>
            <p>
              Send a real WhatsApp test to the recipient configured on your
              backend.
            </p>
          </div>
          <Button onClick={() => open("whatsapp-test")}>
            <MessageCircle size={17} />
            Meta WhatsApp test
          </Button>
        </section>
      )}
      <div className="quick-template-grid">
        {[
          {
            title: "Service reminder",
            icon: Church,
            body: "Dear church family, join us this Sunday at 8:30 AM for worship and fellowship. We look forward to seeing you!",
            tone: "green",
          },
          {
            title: "Birthday blessing",
            icon: Cake,
            body: "Wishing you a blessed birthday! May God fill this new year of your life with joy, good health, and grace. With love, your church family.",
            tone: "orange",
          },
          {
            title: "Community announcement",
            icon: Users,
            body: "Dear church family, we have some news to share with you. ",
            tone: "purple",
          },
        ].map((t) => (
          <button
            className="card template-card"
            key={t.title}
            onClick={() => open("message", { title: t.title, body: t.body })}
          >
            <span className={`template-icon ${t.tone}`}>
              <t.icon size={21} />
            </span>
            <span>
              <strong>{t.title}</strong>
              <small>Start with a thoughtful template</small>
            </span>
            <ArrowUpRight size={17} />
          </button>
        ))}
      </div>
      <section className="card">
        <div className="table-tabs">
          {["All messages", "Drafts", "Demo activity"].map((t) => (
            <button
              key={t}
              className={tab === t ? "selected" : ""}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="table-scroll">
          <table className="messages-table">
            <thead>
              <tr>
                <th>MESSAGE</th>
                <th>AUDIENCE</th>
                <th>CHANNEL</th>
                <th>STATUS</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {messages.map((m) => (
                <tr key={m.id}>
                  <td>
                    <button
                      className="table-cell-stack clickable"
                      onClick={() =>
                        open(
                          m.status === "Draft" ? "message" : "message-detail",
                          m.status === "Draft" ? { draft: m } : { message: m },
                        )
                      }
                    >
                      <strong>{m.title}</strong>
                      <small>
                        {new Date(m.date).toLocaleDateString(getLocale(), {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </small>
                    </button>
                  </td>
                  <td>
                    <div className="table-cell-stack">
                      <strong>{m.count} recipients</strong>
                      <small>{m.groups.join(", ") || "Selected members"}</small>
                    </div>
                  </td>
                  <td>
                    <span className="icon-line">
                      {m.channel === "whatsapp" ? (
                        <MessageCircle size={16} />
                      ) : (
                        <MessageSquare size={16} />
                      )}{" "}
                      {m.channel === "whatsapp" ? "WhatsApp" : "SMS"}
                    </span>
                  </td>
                  <td>
                    <Badge
                      tone={
                        m.status === "Draft"
                          ? "neutral"
                          : m.status === "Scheduled demo"
                            ? "orange"
                            : "green"
                      }
                    >
                      {m.status}
                    </Badge>
                  </td>
                  <td>
                    <button
                      className="icon-button"
                      aria-label={`Open ${m.title}`}
                      onClick={() =>
                        open(
                          m.status === "Draft" ? "message" : "message-detail",
                          m.status === "Draft" ? { draft: m } : { message: m },
                        )
                      }
                    >
                      <ArrowUpRight size={17} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!messages.length && (
          <Empty
            title="Room for a new conversation"
            description="Compose your first message to this community."
          />
        )}
      </section>
      <p className="page-footnote">
        <CircleHelp size={14} />
        Audience campaigns and SMS are simulated. The separate Meta test sends a
        real message to your configured test recipient.
      </p>
    </div>
  );
}

export function Celebrations() {
  const { data, church, go, open } = useParish();
  const [period, setPeriod] = useState("week");
  const [type, setType] = useState("All occasions");
  const today = new Date();
  const events = celebrationsFor(
    membersInScope(data.members, church === "all" ? [] : [church]),
  ).filter(
    (e) =>
      (type === "All occasions" || e.type === type) &&
      (period === "week"
        ? e.days < 7
        : period === "month"
          ? e.date.getMonth() === today.getMonth() &&
            e.date.getFullYear() === today.getFullYear()
          : e.days < 90),
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="THE LITTLE MOMENTS THAT MATTER"
        title="There’s always a reason to celebrate"
        description="Remember a special day. Make someone feel a little more loved."
      >
        <ChurchSelect />
        <Button variant="secondary" onClick={() => go("settings")}>
          <Sparkles size={16} />
          Wish preferences
        </Button>
      </PageHeader>
      <div className="celebrations-hero">
        <div>
          <span className="eyebrow">A BLESSING FOR EVERY MILESTONE</span>
          <h2>Seen. Remembered. Celebrated.</h2>
          <p>Birthdays and wedding anniversaries across your church family.</p>
        </div>
        <span className="celebration-doodle">
          <Cake size={62} strokeWidth={1} />
          <Sparkles size={28} />
          <Heart size={24} />
        </span>
      </div>
      <div className="page-toolbar">
        <div className="segmented">
          {[
            ["week", "Next 7 days"],
            ["month", "This month"],
            ["quarter", "Next 90 days"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={period === id ? "active" : ""}
              onClick={() => setPeriod(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={type}
          aria-label="Occasion type"
          onChange={(e) => setType(e.target.value)}
        >
          {["All occasions", "Birthday", "Wedding anniversary"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>
      <div className="celebration-grid">
        {events.map((e) => (
          <article className="card event-card" key={`${e.member.id}-${e.type}`}>
            <div className="event-card-top">
              <span
                className={`event-icon ${e.type === "Birthday" ? "orange" : "purple"}`}
              >
                {e.type === "Birthday" ? (
                  <Cake size={22} />
                ) : (
                  <Heart size={22} />
                )}
              </span>
              <Badge tone={e.days === 0 ? "green" : "neutral"}>
                {e.days === 0
                  ? "Today"
                  : e.days === 1
                    ? "Tomorrow"
                    : e.date.toLocaleDateString(getLocale(), {
                        day: "numeric",
                        month: "short",
                      })}
              </Badge>
            </div>
            <Avatar name={e.member.name} size="large" />
            <h3>{e.member.name}</h3>
            <p>{e.type}</p>
            <small>{churchById(e.member.church).name}</small>
            <Button
              variant="secondary"
              onClick={() =>
                open("message", { memberId: e.member.id, celebration: e.type })
              }
            >
              <Send size={14} />
              Send a blessing
            </Button>
          </article>
        ))}
      </div>
      {!events.length && (
        <Empty
          title="A quiet chapter"
          description="There are no upcoming celebrations in this selection. Try the next 90 days."
        />
      )}
    </div>
  );
}

export function NoticeBoard() {
  const { data, church, open, isStaff, can } = useParish();
  const [category, setCategory] = useState("All announcements");
  const notices = data.notices.filter(
    (n) =>
      (church === "all" || n.church === "all" || n.church === church) &&
      (category === "All announcements" || n.category === category),
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="GOOD THINGS HAPPEN WHEN WE GATHER"
        title="Around the pastorate"
        description="News, gatherings, and the everyday life of our church family."
      >
        <ChurchSelect />
        {can("manageNotices") && (
          <Button onClick={() => open("notice")}>
            <Plus size={17} />
            Post announcement
          </Button>
        )}
      </PageHeader>
      <div className="filter-chips">
        {[
          "All announcements",
          ...new Set(data.notices.map((n) => n.category)),
        ].map((t) => (
          <button
            className={category === t ? "selected" : ""}
            key={t}
            onClick={() => setCategory(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="notice-grid">
        {notices.map((n, i) => (
          <article className="card notice-card" key={n.id}>
            <div className={`notice-art art-${i % 3}`}>
              {i % 3 === 0 ? (
                <ChurchArt compact />
              ) : i % 3 === 1 ? (
                <>
                  <span className="decorative-circle" />
                  <Sparkles size={76} strokeWidth={1} />
                  <Heart className="art-small" size={32} strokeWidth={1} />
                </>
              ) : (
                <>
                  <span className="decorative-circle" />
                  <Users size={76} strokeWidth={1} />
                  <Sparkles className="art-small" size={30} strokeWidth={1} />
                </>
              )}
              {n.pinned && (
                <span className="pin-badge">
                  <Pin size={12} />
                  Pinned announcement
                </span>
              )}
            </div>
            <div className="notice-card-content">
              <div className="notice-topline">
                <Badge tone={["green", "orange", "purple"][i % 3]}>
                  {n.category}
                </Badge>
                <small>
                  {n.church === "all"
                    ? "All churches"
                    : churchById(n.church).place}
                </small>
              </div>
              <h2>{n.title}</h2>
              <p>{n.description}</p>
              {n.event && (
                <div className="icon-line">
                  <CalendarDays size={14} />
                  {n.event}
                </div>
              )}
              {n.location && (
                <div className="icon-line">
                  <MapPin size={14} />
                  {n.location}
                </div>
              )}
              <div className="notice-author">
                <Avatar name={n.author} size="small" />
                <span>{n.author}</span>
                <button
                  className="icon-button"
                  aria-label={`Read ${n.title}`}
                  onClick={() => open("notice-detail", { notice: n })}
                >
                  <ArrowUpRight size={18} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!notices.length && (
        <Empty
          title="A fresh notice board"
          description="Share an announcement with your church to get started."
        />
      )}
    </div>
  );
}

export function Giving() {
  const { data, church, open, isStaff, can } = useParish();
  const campaigns = data.campaigns.filter(
    (c) => church === "all" || c.church === church,
  );
  const donations = data.donations.filter((d) =>
    campaigns.some((c) => c.id === d.campaign),
  );
  const online = donations
    .filter((d) => d.method === "Online demo")
    .reduce((s, d) => s + d.amount, 0);
  const offline = donations
    .filter((d) => d.method !== "Online demo")
    .reduce((s, d) => s + d.amount, 0);
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="GENEROSITY WITH A PURPOSE"
        title="Small gifts. Lasting good."
        description="Support the needs of our churches and see the difference we make together."
      >
        <ChurchSelect />
        {can("manageGiving") && (
          <Button variant="secondary" onClick={() => open("campaign")}>
            <Plus size={16} />
            Create a need
          </Button>
        )}
        {can("manageGiving") && (
          <Button onClick={() => open("donation", { method: "Cash" })}>
            <Banknote size={17} />
            Record contribution
          </Button>
        )}
      </PageHeader>
      <div className="stats-grid three">
        <StatCard
          icon={HeartHandshake}
          title="Total contributions"
          value={money(online + offline)}
          detail="Across your church initiatives"
          onClick={() =>
            isStaff
              ? document
                  .getElementById("contributions")
                  ?.scrollIntoView({ behavior: "smooth" })
              : open("donation")
          }
        />
        <StatCard
          icon={CreditCard}
          title="Online contributions"
          value={money(online)}
          detail="Simulated payments in this prototype"
          tone="blue"
          onClick={() => open("donation", { method: "Online demo" })}
        />
        <StatCard
          icon={Banknote}
          title="Offline contributions"
          value={money(offline)}
          detail="Cash and bank transfer records"
          tone="orange"
          onClick={() =>
            open("donation", { method: isStaff ? "Cash" : "Online demo" })
          }
        />
      </div>
      <SectionHeading
        title="Give where your heart is"
        subtitle="Real needs. Shared hope. A community that shows up."
      />
      <div className="campaign-grid">
        {campaigns.map((c, i) => {
          const total = data.donations
            .filter((d) => d.campaign === c.id)
            .reduce((s, d) => s + d.amount, 0);
          const pct = Math.min(100, Math.round((total / c.goal) * 100));
          return (
            <article className="card campaign-card" key={c.id}>
              <div className={`campaign-art ${c.color}`}>
                <span className="campaign-art-circle" />
                {i % 3 === 0 ? (
                  <Church size={64} strokeWidth={1} />
                ) : i % 3 === 1 ? (
                  <Heart size={64} strokeWidth={1} />
                ) : (
                  <HandHeart size={64} strokeWidth={1} />
                )}
                <Badge tone="white">{c.category}</Badge>
                <span className="campaign-spark">✦</span>
              </div>
              <div className="campaign-content">
                <small className="icon-line">
                  <Church size={13} />
                  {churchById(c.church).name}
                </small>
                <h2>{c.title}</h2>
                <p>{c.description}</p>
                <div className="campaign-amount">
                  <strong>{money(total)}</strong>
                  <span>of {money(c.goal)}</span>
                </div>
                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={c.title}
                >
                  <span style={{ width: `${pct}%` }} />
                </div>
                <div className="campaign-progress-meta">
                  <span>{pct}% raised</span>
                  <span>{money(c.pledged)} pledged</span>
                </div>
                <Button
                  onClick={() =>
                    open("donation", {
                      campaignId: c.id,
                      method: "Online demo",
                    })
                  }
                >
                  <Heart size={15} />
                  Donate now
                  <ArrowUpRight size={15} />
                </Button>
                <button
                  className="pledge-button"
                  onClick={() => open("pledge", { campaignId: c.id })}
                >
                  Make a pledge
                </button>
              </div>
            </article>
          );
        })}
      </div>
      {!campaigns.length && (
        <Empty
          title="Every good thing starts somewhere"
          description="Post a church need to invite your community to contribute."
        />
      )}
      {isStaff && (
        <section className="card contribution-table" id="contributions">
          <SectionHeading
            title="A record of generosity"
            subtitle="Online and offline gifts, together in one place."
          />
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>CONTRIBUTOR</th>
                  <th>INITIATIVE</th>
                  <th>METHOD</th>
                  <th>AMOUNT</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {donations
                  .slice()
                  .reverse()
                  .map((d) => (
                    <tr key={d.id}>
                      <td>
                        <strong>{d.donor}</strong>
                      </td>
                      <td>
                        {data.campaigns.find((c) => c.id === d.campaign)?.title}
                      </td>
                      <td>
                        <Badge
                          tone={d.method === "Online demo" ? "blue" : "neutral"}
                        >
                          {d.method}
                        </Badge>
                      </td>
                      <td>
                        <strong>{money(d.amount)}</strong>
                      </td>
                      <td>
                        {new Date(d.date).toLocaleDateString(getLocale(), {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

export function Prayers() {
  const { data, church, open, update, activity, can } = useParish();
  const [status, setStatus] = useState("All requests");
  const [pastorPreview, setPastorPreview] = useState(false);
  const prayers = data.prayers.filter(
    (p) =>
      (church === "all" || p.church === church) &&
      (status === "All requests" || p.status === status),
  );
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="NO ONE HAS TO WALK ALONE"
        title="Held in prayer"
        description="A caring space for our church family to share what’s on their hearts."
      >
        <ChurchSelect />
        <Button onClick={() => open("prayer")}>
          <Plus size={17} />
          Submit a prayer
        </Button>
      </PageHeader>
      <div className="prayer-banner">
        <span>
          <HandHeart size={34} strokeWidth={1.3} />
        </span>
        <div>
          <h2>“Where two or three gather in my name, there am I with them.”</h2>
          <p>MATTHEW 18:20</p>
        </div>
      </div>
      <div className="page-toolbar">
        <div className="filter-chips">
          {["All requests", "New", "Praying", "Answered"].map((t) => (
            <button
              className={status === t ? "selected" : ""}
              key={t}
              onClick={() => setStatus(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {can("pastoral") && (
          <label className="preview-toggle">
            <input
              type="checkbox"
              checked={pastorPreview}
              onChange={(e) => setPastorPreview(e.target.checked)}
            />
            <Eye size={15} />
            Preview pastoral inbox
          </label>
        )}
      </div>
      {pastorPreview && (
        <div className="inline-info">
          <ShieldCheck size={17} />
          Pastor preview: confidential requests are visible here. This prototype
          has no authenticated access control.
        </div>
      )}
      <div className="prayer-grid">
        {prayers.map((p) => (
          <article className="card prayer-card" key={p.id}>
            <div className="prayer-card-top">
              <Badge
                tone={
                  p.category === "Healing"
                    ? "purple"
                    : p.category === "Family"
                      ? "orange"
                      : "blue"
                }
              >
                {p.category}
              </Badge>
              {p.private && (
                <span className="private-label">
                  <LockKeyhole size={12} />
                  Pastors only
                </span>
              )}
            </div>
            <div className="prayer-author">
              <Avatar name={p.name} />
              <div>
                <strong>{p.name}</strong>
                <small>{churchById(p.church).name}</small>
              </div>
            </div>
            <p className={p.private && !pastorPreview ? "private-copy" : ""}>
              {p.private && !pastorPreview
                ? "This request is confidential. It is addressed to the church pastor and head pastor."
                : p.message}
            </p>
            <div className="prayer-assigned">
              <ShieldCheck size={14} />
              <span>
                Assigned to {churchById(p.church).pastor}
                <br />
                and Rev. Joseph Paul, Head Pastor
              </span>
            </div>
            <div className="prayer-card-bottom">
              <Badge
                tone={
                  p.status === "New"
                    ? "orange"
                    : p.status === "Praying"
                      ? "purple"
                      : "green"
                }
              >
                {p.status}
              </Badge>
              {pastorPreview && p.status !== "Answered" && (
                <button
                  className="text-button"
                  onClick={() => {
                    const next = p.status === "New" ? "Praying" : "Answered";
                    update(
                      (d) => ({
                        ...d,
                        prayers: d.prayers.map((item) =>
                          item.id === p.id ? { ...item, status: next } : item,
                        ),
                        activity: [
                          activity(
                            `Prayer request marked ${next.toLowerCase()}`,
                            p.name,
                          ),
                          ...d.activity,
                        ],
                      }),
                      next === "Praying"
                        ? "Prayer request acknowledged."
                        : "Prayer request marked answered.",
                    );
                  }}
                >
                  {p.status === "New" ? "Acknowledge prayer" : "Mark answered"}
                  <Check size={14} />
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
      {!prayers.length && (
        <Empty
          title="A peaceful moment"
          description="There are no prayer requests in this selection."
        />
      )}
    </div>
  );
}

export function SettingsPage() {
  const { data, update, notify } = useParish();
  const [settings, setSettings] = useState(data.settings);
  const [rules, setRules] = useState(data.rules);
  const [error, setError] = useState("");
  function save(e) {
    e.preventDefault();
    if (
      !(
        rules.sundayMax >= 0 &&
        rules.sundayMax < rules.youthMax &&
        rules.youthMax < rules.seniorMin
      )
    ) {
      setError(
        "Age ranges must progress from Sunday school, to youth, to seniors.",
      );
      return;
    }
    update(
      (d) => ({
        ...d,
        settings: {
          ...settings,
          pastorate: settings.pastorate.trim(),
          diocese: settings.diocese.trim(),
        },
        rules,
      }),
      "Workspace preferences saved.",
    );
    setError("");
  }
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="MAKE THIS SPACE YOUR OWN"
        title="A thoughtful setup"
        description="Shape your workspace around the way your pastorate serves."
      />
      <form onSubmit={save} className="settings-layout">
        <div className="settings-main">
          <section className="card settings-card">
            <SectionHeading
              title="Your pastorate"
              subtitle="A shared identity for all your churches."
            />
            <div className="form-grid">
              <Field label="Pastorate name">
                <input
                  required
                  value={settings.pastorate}
                  onChange={(e) =>
                    setSettings({ ...settings, pastorate: e.target.value })
                  }
                />
              </Field>
              <Field label="Diocese">
                <input
                  required
                  value={settings.diocese}
                  onChange={(e) =>
                    setSettings({ ...settings, diocese: e.target.value })
                  }
                />
              </Field>
            </div>
          </section>
          <section className="card settings-card">
            <SectionHeading
              title="Fellowships that grow with you"
              subtitle="Members can belong to more than one group. Age groups update from their date of birth."
            />
            <div className="age-rule">
              <span className="rule-icon orange">
                <Sparkles size={19} />
              </span>
              <div>
                <strong>Sunday school</strong>
                <small>Children up to and including this age</small>
              </div>
              <input
                aria-label="Sunday school maximum age"
                type="number"
                required
                min="0"
                max="30"
                value={rules.sundayMax}
                onChange={(e) =>
                  setRules({ ...rules, sundayMax: Number(e.target.value) })
                }
              />
              <span>years</span>
            </div>
            <div className="age-rule">
              <span className="rule-icon purple">
                <Users size={19} />
              </span>
              <div>
                <strong>Youth fellowship</strong>
                <small>
                  From {Number(rules.sundayMax) + 1} through this age
                </small>
              </div>
              <input
                aria-label="Youth maximum age"
                type="number"
                required
                min="1"
                max="70"
                value={rules.youthMax}
                onChange={(e) =>
                  setRules({ ...rules, youthMax: Number(e.target.value) })
                }
              />
              <span>years</span>
            </div>
            <div className="age-rule">
              <span className="rule-icon green">
                <Heart size={19} />
              </span>
              <div>
                <strong>Senior fellowship</strong>
                <small>Members from this age onward</small>
              </div>
              <input
                aria-label="Seniors minimum age"
                type="number"
                required
                min="20"
                max="100"
                value={rules.seniorMin}
                onChange={(e) =>
                  setRules({ ...rules, seniorMin: Number(e.target.value) })
                }
              />
              <span>years</span>
            </div>
            <p className="setting-note">
              Middle-aged: {Number(rules.youthMax) + 1}–
              {Number(rules.seniorMin) - 1} years. Men’s and women’s fellowships
              include members above Sunday school age.
            </p>
          </section>
          <section className="card settings-card">
            <SectionHeading
              title="Never miss a special day"
              subtitle="Save your preferences for automatic morning wishes."
            />
            {[
              [
                "birthdayWishes",
                "Birthday blessings",
                "A warm birthday message from the church family.",
              ],
              [
                "anniversaryWishes",
                "Wedding anniversary wishes",
                "Celebrate another year of love and togetherness.",
              ],
            ].map(([key, title, desc]) => (
              <label className="toggle-row" key={key}>
                <span>
                  <strong>{title}</strong>
                  <small>{desc}</small>
                </span>
                <input
                  type="checkbox"
                  className="toggle"
                  checked={settings[key]}
                  onChange={(e) =>
                    setSettings({ ...settings, [key]: e.target.checked })
                  }
                />
              </label>
            ))}
            <Field label="Morning delivery time (Asia/Kolkata)">
              <input
                className="time-field"
                type="time"
                required
                value={settings.wishTime}
                onChange={(e) =>
                  setSettings({ ...settings, wishTime: e.target.value })
                }
              />
            </Field>
            <div className="inline-info">
              <CircleHelp size={16} />
              Preferences only in this prototype. Automated delivery needs a
              messaging provider and scheduler.
            </div>
          </section>
          {error && (
            <p role="alert" className="form-error">
              {error}
            </p>
          )}
          <div className="settings-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setSettings(data.settings);
                setRules(data.rules);
                setError("");
                notify("Unsaved changes discarded.");
              }}
            >
              Discard changes
            </Button>
            <Button type="submit">
              <Check size={16} />
              Save preferences
            </Button>
          </div>
        </div>
        <aside className="settings-aside">
          <section className="card">
            <span className="settings-shield">
              <ShieldCheck size={28} />
            </span>
            <h3>Everyone has a part to play</h3>
            <p>Your church’s roles, reflected in the workspace.</p>
            <dl className="role-list">
              <dt>Head pastor & administrator</dt>
              <dd>Care and oversight across the pastorate.</dd>
              <dt>Secretary & treasurer</dt>
              <dd>Member approvals, communications, and contributions.</dd>
              <dt>Church pastor</dt>
              <dd>Members, approvals, and prayers within their church.</dd>
              <dt>Committee members</dt>
              <dd>Represent and serve their own church.</dd>
              <dt>Members</dt>
              <dd>Register, stay connected, give, and request prayer.</dd>
            </dl>
            <div className="prototype-note">
              Role assignments are demonstrated in member profiles. Secure login
              and server-enforced permissions are part of the production build.
            </div>
          </section>
        </aside>
      </form>
    </div>
  );
}
