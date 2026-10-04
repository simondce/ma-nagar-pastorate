import React from "react";
import {
  Users,
  Church,
  UserRoundCheck,
  HeartHandshake,
  Plus,
  ChevronDown,
  ArrowUpRight,
  ArrowRight,
  Send,
  Cake,
  Heart,
  CalendarDays,
  Clock3,
  HandHeart,
  UserPlus,
  Sparkles,
  Sun,
  ChevronRight,
} from "lucide-react";
import { useParish } from "./context.js";
import { CHURCHES, churchById } from "./data.js";
import { money, celebrationsFor, membersInScope } from "./domain.js";
import {
  PageHeader,
  StatCard,
  SectionHeading,
  Avatar,
  Badge,
  Button,
  ChurchArt,
  Empty,
} from "./components.jsx";

export function ChurchSelect() {
  const { church, setChurch, scopedRole } = useParish();
  return (
    <div className="church-select">
      <Church size={16} />
      <select
        aria-label="Church scope"
        value={church}
        onChange={(e) => setChurch(e.target.value)}
      >
        {!scopedRole && <option value="all">All churches</option>}
        {CHURCHES.filter((c) => !scopedRole || c.id === church).map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>
      <ChevronDown size={14} />
    </div>
  );
}

export default function Dashboard() {
  const { data, church, open, go, showApprovals, can } = useParish();
  const members = membersInScope(
    data.members,
    church === "all" ? [] : [church],
  );
  const active = members.filter((m) => m.status === "Active");
  const pending = data.members.filter(
    (m) => m.status === "Pending" && (church === "all" || m.church === church),
  );
  const prayers = data.prayers.filter(
    (p) => p.status === "New" && (church === "all" || p.church === church),
  );
  const churches = CHURCHES.filter((c) => church === "all" || c.id === church);
  const events = celebrationsFor(active)
    .filter((e) => e.days < 7)
    .slice(0, 4);
  const contributions = data.donations
    .filter((d) => {
      const campaign = data.campaigns.find((c) => c.id === d.campaign);
      const date = new Date(d.date);
      const now = new Date();
      return (
        (church === "all" || campaign?.church === church) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, d) => s + d.amount, 0);
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
  return (
    <div className="page-enter">
      <PageHeader
        eyebrow="A LITTLE CARE. A STRONGER COMMUNITY."
        title={
          <>
            Good {greeting}, Daniel <Sun className="greeting-sun" size={26} />
          </>
        }
        description="Here’s what’s happening across your pastorate today."
      >
        <ChurchSelect />
        {can("manageMembers") && (
          <Button onClick={() => open("member")}>
            <Plus size={17} />
            Add member
          </Button>
        )}
      </PageHeader>
      <div className="date-caption">
        <CalendarDays size={14} />
        {now.toLocaleDateString(getLocale(), {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        <span className="mini-divider" />
        Peace be with you.
      </div>
      <div className="stats-grid">
        <StatCard
          icon={Users}
          title="Total members"
          value={active.length.toLocaleString(getLocale())}
          detail="A growing church family"
          onClick={() => go("members")}
        />
        <StatCard
          icon={Church}
          title="Our churches"
          value={churches.length.toString().padStart(2, "0")}
          tone="blue"
          detail={
            church === "all"
              ? "One pastorate. One family."
              : churchById(church).place
          }
          onClick={() => go("churches")}
        />
        <StatCard
          icon={UserRoundCheck}
          title="Pending approvals"
          value={pending.length.toString().padStart(2, "0")}
          tone="orange"
          detail={
            <>
              <span className="little-dot orange" />
              Awaiting a warm welcome
            </>
          }
          onClick={showApprovals}
        />
        <StatCard
          icon={HeartHandshake}
          title="Contributions this month"
          value={money(contributions)}
          tone="purple"
          detail={
            <>
              <span className="little-dot purple" />
              Every gift makes a difference
            </>
          }
          onClick={() => go("giving")}
        />
      </div>
      <div className="dashboard-feature-row">
        <section className="welcome-banner">
          <div className="banner-content">
            <span className="banner-eyebrow">
              <span /> CONNECTED IN FAITH
            </span>
            <h2>
              One faith.
              <br />
              One connected community.
            </h2>
            <p>
              A thoughtful word can bring us closer.
              <br />
              Reach your church family, all in one place.
            </p>
            <Button onClick={() => open("message")}>
              <Send size={15} />
              Send a message
              <ArrowUpRight size={15} />
            </Button>
          </div>
          <ChurchArt />
        </section>
        <section className="card attention-card">
          <div className="attention-title">
            <h2>A little attention, a big difference</h2>
            <span className="attention-spark">
              <Sparkles size={17} />
            </span>
          </div>
          <p>Help your community feel cared for.</p>
          <button className="attention-item" onClick={showApprovals}>
            <span className="attention-icon orange">
              <UserPlus size={18} />
            </span>
            <span>
              <strong>{pending.length} new member requests</strong>
              <small>Ready to join your church family</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <button className="attention-item" onClick={() => go("prayers")}>
            <span className="attention-icon lavender">
              <HandHeart size={19} />
            </span>
            <span>
              <strong>{prayers.length} prayer requests</strong>
              <small>A moment of care goes a long way</small>
            </span>
            <ChevronRight size={16} />
          </button>
          <div className="attention-footer">
            <span className="status-dot" />
            You’re making a difference, every day.
          </div>
        </section>
      </div>
      <div className="dashboard-detail-row">
        <section className="card churches-card">
          <SectionHeading
            title="Our churches"
            subtitle="Different places. One shared purpose."
            action="View all"
            onAction={() => go("churches")}
          />
          <div className="table-scroll">
            <table className="church-table">
              <thead>
                <tr>
                  <th>CHURCH</th>
                  <th>MEMBERS</th>
                  <th>PASTOR</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {churches.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => open("church", { churchId: c.id })}
                    tabIndex={0}
                    onKeyDown={(e) =>
                      e.key === "Enter" && open("church", { churchId: c.id })
                    }
                  >
                    <td>
                      <div className="church-name-cell">
                        <span className={`church-table-icon ${c.color}`}>
                          <Church size={20} strokeWidth={1.5} />
                        </span>
                        <span>
                          <strong>
                            {c.name}
                            {c.type === "Pastorate church" && (
                              <span className="main-tag">MAIN</span>
                            )}
                          </strong>
                          <small>{c.place}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="member-count">
                        {
                          data.members.filter(
                            (m) => m.church === c.id && m.status === "Active",
                          ).length
                        }
                      </span>
                    </td>
                    <td className="pastor-cell">{c.pastor}</td>
                    <td>
                      <ArrowUpRight size={16} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-foot">
            <span className="overlap-avatars">
              <Avatar name="Samuel David" size="tiny" />
              <Avatar name="Peter Raj" size="tiny" />
              <Avatar name="Isaac Joseph" size="tiny" />
            </span>
            <span>Serving together, growing together.</span>
            <Heart size={13} />
          </div>
        </section>
        <section className="card celebrations-card">
          <SectionHeading
            title="Moments to celebrate"
            subtitle="A little joy in our church family."
            action="View all"
            onAction={() => go("celebrations")}
          />
          <div className="week-label">
            <span>COMING UP THIS WEEK</span>
            <Badge tone="neutral">
              {celebrationsFor(active).filter((e) => e.days < 7).length} moments
            </Badge>
          </div>
          <div className="celebration-list">
            {events.length ? (
              events.map((event, i) => (
                <div
                  className="celebration-item"
                  key={`${event.member.id}-${event.type}`}
                >
                  <Avatar name={event.member.name} />
                  <div>
                    <strong>{event.member.name}</strong>
                    <small>
                      {event.type === "Birthday" ? (
                        <Cake size={12} />
                      ) : (
                        <Heart size={12} />
                      )}{" "}
                      {event.type} <span>·</span>{" "}
                      {event.days === 0
                        ? "Today"
                        : event.date.toLocaleDateString(getLocale(), {
                            day: "numeric",
                            month: "short",
                          })}
                    </small>
                  </div>
                  <button
                    className={`wish-button ${event.days === 0 ? "today" : ""}`}
                    title={`Wish ${event.member.name}`}
                    onClick={() =>
                      open("message", {
                        memberId: event.member.id,
                        celebration: event.type,
                      })
                    }
                  >
                    {event.days === 0 ? "Wish" : <ArrowUpRight size={15} />}
                  </button>
                </div>
              ))
            ) : (
              <Empty
                title="A quiet week"
                description="View all upcoming celebrations to plan ahead."
              />
            )}
          </div>
          <button className="celebration-footer" onClick={() => go("settings")}>
            <span className="automation-icon">
              <Sparkles size={14} />
            </span>
            <span>Make every special day count</span>
            <ArrowRight size={15} />
          </button>
        </section>
      </div>
      <section className="notice-preview">
        <SectionHeading
          title="Around the pastorate"
          subtitle="The news, gatherings, and good things that bring us together."
          action="Open notice board"
          onAction={() => go("notice-board")}
        />
        <div className="notice-preview-grid">
          {data.notices
            .filter(
              (n) =>
                church === "all" || n.church === "all" || n.church === church,
            )
            .slice(0, 3)
            .map((n, i) => (
              <button
                className={`notice-mini card accent-${i}`}
                key={n.id}
                onClick={() => open("notice-detail", { notice: n })}
              >
                <div>
                  <Badge tone={["green", "orange", "purple"][i]}>
                    {n.category}
                  </Badge>
                  <ArrowUpRight size={17} />
                </div>
                <h3>{n.title}</h3>
                <p>{n.description}</p>
                <span className="notice-meta">
                  <CalendarDays size={13} />
                  {n.event || "Community announcement"}
                </span>
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
