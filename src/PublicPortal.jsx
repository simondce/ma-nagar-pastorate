import React, { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Church,
  HandHeart,
  Heart,
  Megaphone,
  MapPin,
  ShieldCheck,
  LogIn,
  Users,
  ChevronDown,
} from "lucide-react";
import { useParish } from "./context.js";
import { CHURCHES } from "./data.js";
import { Button, Badge, ChurchArt, Modal, Field } from "./components.jsx";
import { getLanguage, setLanguage } from "./i18n.js";
import { NoticeBoard, Giving } from "./Pages.jsx";
import LocationSection from "./LocationSection.jsx";
import { CHURCH_LOCATION } from "./church-location.js";

export function LanguageToggle() {
  const current = getLanguage();
  return (
    <div
      className="language-toggle"
      role="group"
      aria-label="Change site language"
    >
      <button
        lang="en"
        aria-pressed={current === "en"}
        className={current === "en" ? "selected" : ""}
        onClick={() => setLanguage("en")}
      >
        EN
      </button>
      <button
        lang="ta"
        aria-pressed={current === "ta"}
        className={current === "ta" ? "selected" : ""}
        onClick={() => setLanguage("ta")}
      >
        தமிழ்
      </button>
    </div>
  );
}

export function StaffLogin() {
  const { close, login } = useParish();
  const [role, setRole] = useState("Secretary");
  const [church, setChurch] = useState("mng");
  return (
    <Modal
      title="A workspace for those who serve."
      description="Public visitors do not need to sign in. This area is for authorized church staff and committee members."
      onClose={close}
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          login({ role, church });
        }}
      >
        <div className="modal-body">
          <div className="login-emblem">
            <img
              src={`${import.meta.env.BASE_URL}church-mark.svg`}
              alt="St. John’s Church logo"
            />
            <div>
              <h3>St. John’s Church, MA Nagar</h3>
              <p>M. A Nagar Pastorate</p>
            </div>
          </div>
          <Field label="Choose a demo role">
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {[
                "Head pastor",
                "Church pastor",
                "Administrator",
                "Committee member",
                "Secretary",
                "Treasurer",
              ].map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </Field>
          {["Church pastor", "Committee member"].includes(role) && (
            <Field label="Assigned church">
              <select
                value={church}
                onChange={(e) => setChurch(e.target.value)}
              >
                {CHURCHES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          <div className="inline-info">
            <ShieldCheck size={22} />
            Prototype sign-in only. No password is collected. Production access
            will require verified accounts and secure authentication.
          </div>
        </div>
        <div className="modal-footer">
          <Button type="button" variant="secondary" onClick={close}>
            Cancel
          </Button>
          <Button type="submit">
            <LogIn size={16} />
            Enter demo workspace
          </Button>
        </div>
      </form>
    </Modal>
  );
}

export default function PublicPortal({ page }) {
  const { data, open, go } = useParish();
  const [menu, setMenu] = useState(false);
  const navigation = [
    ["welcome", "Home"],
    ["public-churches", "Our churches"],
    ["public-notices", "Notice board"],
    ["public-giving", "Giving"],
    ["public-prayer", "Prayer"],
  ];
  const current = navigation.some(([id]) => id === page) ? page : "welcome";
  function navigate(id) {
    go(id);
    setMenu(false);
  }
  const ChurchCards = () => (
    <div className="public-church-grid">
      {CHURCHES.map((c, i) => (
        <article key={c.id} className="public-church-card">
          <span className={`church-table-icon ${c.color}`}>
            <Church size={24} />
          </span>
          <span className="public-church-code">0{i + 1}</span>
          <h3>{c.name}</h3>
          <p>
            <MapPin size={14} />
            {c.place}
          </p>
          <Badge tone={i === 0 ? "green" : "neutral"}>
            {i === 0 ? "Parent & pastorate church" : "Branch church"}
          </Badge>
        </article>
      ))}
    </div>
  );
  return (
    <div className="public-site">
      <header className="public-header">
        <a
          className="church-brand"
          href="#welcome"
          onClick={() => setMenu(false)}
        >
          <img
            src={`${import.meta.env.BASE_URL}church-mark.svg`}
            alt="St. John’s Church logo"
          />
          <span>
            <strong>St. John’s Church</strong>
            <small>MA NAGAR PASTORATE</small>
          </span>
        </a>
        <nav className="public-desktop-nav" aria-label="Public navigation">
          {navigation.map(([id, label]) => (
            <a
              href={`#${id}`}
              className={current === id ? "active" : ""}
              key={id}
            >
              {label}
            </a>
          ))}
        </nav>
        <div className="public-header-actions">
          <LanguageToggle />
          <button className="staff-login-button" onClick={() => open("login")}>
            <LogIn size={16} />
            <span>Staff login</span>
          </button>
          <button
            className="icon-button public-menu-toggle"
            onClick={() => setMenu(!menu)}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
          >
            {menu ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </header>
      {menu && (
        <nav className="public-mobile-nav" aria-label="Mobile navigation">
          {navigation.map(([id, label]) => (
            <button
              className={current === id ? "active" : ""}
              key={id}
              onClick={() => navigate(id)}
            >
              {label}
              <ArrowRight size={16} />
            </button>
          ))}
          <button
            onClick={() => {
              open("login");
              setMenu(false);
            }}
          >
            Staff login
            <LogIn size={16} />
          </button>
        </nav>
      )}
      <main className="public-main page-enter" key={current}>
        {current === "welcome" && (
          <>
            <section className="public-hero">
              <div className="public-hero-copy">
                <span className="public-eyebrow">
                  <span />
                  ONE PASTORATE. ONE CHURCH FAMILY.
                </span>
                <h1>
                  Faith brings us together.
                  <br />
                  <em>Love makes us family.</em>
                </h1>
                <p>
                  Welcome to St. John’s Church, MA Nagar, and our branch
                  churches. A place to worship, belong, and care for one
                  another.
                </p>
                <div className="public-hero-actions">
                  <Button
                    onClick={() => open("member", { registration: true })}
                  >
                    Join our church family
                    <ArrowUpRight size={18} />
                  </Button>
                  <Button variant="secondary" onClick={() => open("prayer")}>
                    <HandHeart size={18} />
                    Share a prayer
                  </Button>
                </div>
                <span className="public-no-login">
                  <ShieldCheck size={14} />
                  No login needed
                </span>
              </div>
              <div className="public-hero-art">
                <div className="hero-art-label">
                  <span>EST. IN FAITH</span>
                  <img
                    src={`${import.meta.env.BASE_URL}church-mark.svg`}
                    alt="St. John’s Church logo"
                  />
                  <span>ROOTED IN LOVE</span>
                </div>
                <ChurchArt />
                <div className="public-art-caption">
                  <span />
                  <p>You are welcome, just as you are.</p>
                  <span />
                </div>
              </div>
            </section>
            <section className="public-welcome-intro">
              <div>
                <span className="eyebrow">Explore our community</span>
                <h2>Everyone is welcome here.</h2>
              </div>
              <p>
                Read our notices, support a church need, or submit a prayer. No
                account is needed.
              </p>
            </section>
            <div className="public-action-grid">
              {[
                {
                  title: "Stay connected",
                  description: "News and gatherings from our churches.",
                  icon: Megaphone,
                  tone: "sage",
                  page: "public-notices",
                },
                {
                  title: "Give with love",
                  description: "Support a need close to your heart.",
                  icon: Heart,
                  tone: "peach",
                  page: "public-giving",
                },
                {
                  title: "We’re here to pray",
                  description: "Share what’s on your heart with our pastors.",
                  icon: HandHeart,
                  tone: "lavender",
                  page: "public-prayer",
                },
              ].map((item) => (
                <button
                  className={`public-action-card ${item.tone}`}
                  onClick={() => navigate(item.page)}
                  key={item.title}
                >
                  <span className="public-action-icon">
                    <item.icon size={25} strokeWidth={1.5} />
                  </span>
                  <ArrowUpRight className="public-action-arrow" size={19} />
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </button>
              ))}
            </div>
            <section className="public-church-section">
              <div className="public-section-heading">
                <div>
                  <span className="eyebrow">Our churches</span>
                  <h2>
                    A church for every neighborhood. A family for everyone.
                  </h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate("public-churches")}
                >
                  View all churches
                  <ArrowRight size={16} />
                </button>
              </div>
              <ChurchCards />
            </section>
            <section className="public-news">
              <div className="public-section-heading">
                <div>
                  <span className="eyebrow">Notice board</span>
                  <h2>Around the pastorate</h2>
                </div>
                <button
                  className="text-button"
                  onClick={() => navigate("public-notices")}
                >
                  View all
                  <ArrowRight size={16} />
                </button>
              </div>
              <div className="public-news-grid">
                {data.notices.slice(0, 3).map((n) => (
                  <button
                    className="public-news-card"
                    key={n.id}
                    onClick={() => open("notice-detail", { notice: n })}
                  >
                    <Badge>{n.category}</Badge>
                    <h3>{n.title}</h3>
                    <p>{n.description}</p>
                    <span>
                      {n.event}
                      <ArrowUpRight size={17} />
                    </span>
                  </button>
                ))}
              </div>
            </section>
            <section className="public-register-strip">
              <span className="register-icon">
                <Users size={30} />
              </span>
              <div>
                <h2>New to our church family?</h2>
                <p>
                  Tell us a little about yourself. Your church office will
                  review your registration and help you get connected.
                </p>
              </div>
              <Button onClick={() => open("member", { registration: true })}>
                Begin registration
                <ArrowRight size={16} />
              </Button>
            </section>
            <LocationSection />
          </>
        )}
        {current === "public-churches" && (
          <section className="public-inner-page">
            <span className="eyebrow">M. A Nagar Pastorate</span>
            <h1>Our churches</h1>
            <p className="public-page-intro">
              The parent church and its branches, united in faith and service.
            </p>
            <ChurchCards />
            <div className="public-parent-note">
              <img
                src={`${import.meta.env.BASE_URL}church-mark.svg`}
                alt="St. John’s Church logo"
              />
              <div>
                <Badge>Parent & pastorate church</Badge>
                <h2>St. John’s Church, MA Nagar</h2>
                <p>M. A Nagar Pastorate</p>
              </div>
            </div>
            <LocationSection />
          </section>
        )}
        {current === "public-notices" && (
          <div className="public-inner-page">
            <NoticeBoard />
          </div>
        )}
        {current === "public-giving" && (
          <div className="public-inner-page">
            <Giving />
          </div>
        )}
        {current === "public-prayer" && (
          <section className="public-prayer-page">
            <span className="public-prayer-icon">
              <HandHeart size={48} strokeWidth={1.3} />
            </span>
            <span className="eyebrow">NO ONE HAS TO WALK ALONE</span>
            <h1>Your prayer matters.</h1>
            <p>
              Share your request with your church pastor and the head pastor.
              Public visitors cannot see other people’s prayer requests.
            </p>
            <Button onClick={() => open("prayer")}>
              <HandHeart size={18} />
              Submit a prayer request
            </Button>
            <span className="public-no-login">
              <ShieldCheck size={15} />
              No login needed
            </span>
            <blockquote>
              “Where two or three gather in my name, there am I with them.”
              <cite>MATTHEW 18:20</cite>
            </blockquote>
          </section>
        )}
      </main>
      <footer className="public-footer">
        <div>
          <img
            src={`${import.meta.env.BASE_URL}church-mark.svg`}
            alt="St. John’s Church logo"
          />
          <span>
            <strong>St. John’s Church, MA Nagar</strong>
            <small>M. A Nagar Pastorate</small>
            <a
              className="footer-address"
              href={CHURCH_LOCATION.directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {CHURCH_LOCATION.address}
            </a>
          </span>
        </div>
        <span>Sample data · No live payments or messages</span>
        <button onClick={() => open("login")}>
          Staff login
          <ArrowUpRight size={14} />
        </button>
      </footer>
    </div>
  );
}
