import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  LayoutDashboard,
  Users,
  Church,
  MessageSquare,
  Cake,
  Megaphone,
  HeartHandshake,
  HandHeart,
  Settings,
  CircleHelp,
  ChevronDown,
  ChevronRight,
  Search,
  Bell,
  Plus,
  ArrowUpRight,
  Cross,
  Menu,
  X,
  Check,
  Command,
  PanelLeftClose,
} from "lucide-react";
import { ParishContext } from "./context.js";
import { createSeed, CHURCHES } from "./data.js";
import { Avatar } from "./components.jsx";
import { uid } from "./domain.js";
import Dashboard from "./Dashboard.jsx";
import {
  Members,
  Churches,
  Communications,
  Celebrations,
  NoticeBoard,
  Giving,
  Prayers,
  SettingsPage,
} from "./Pages.jsx";
import Dialogs from "./Dialogs.jsx";
import PublicPortal, { LanguageToggle } from "./PublicPortal.jsx";
import { getLanguage, setLanguage } from "./i18n.js";

const STORAGE_KEY = "parish-ma-nagar-prototype-v1";
const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "members", label: "Members", icon: Users },
  { id: "churches", label: "Churches", icon: Church },
  { id: "communications", label: "Communications", icon: MessageSquare },
  { id: "celebrations", label: "Celebrations", icon: Cake },
  {
    id: "notice-board",
    label: "Notice board",
    icon: Megaphone,
    section: "COMMUNITY",
  },
  { id: "giving", label: "Giving & contributions", icon: HeartHandshake },
  { id: "prayers", label: "Prayer requests", icon: HandHeart },
];
function initialData() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (
      saved?.version === 1 &&
      Array.isArray(saved.members) &&
      [
        "notices",
        "campaigns",
        "donations",
        "prayers",
        "messages",
        "activity",
      ].every((key) => Array.isArray(saved[key])) &&
      saved.settings &&
      saved.rules
    )
      return saved;
  } catch {}
  return createSeed();
}

export default function App() {
  const [data, setData] = useState(initialData);
  const [page, setPage] = useState(location.hash.slice(1) || "welcome");
  const [language, setCurrentLanguage] = useState(getLanguage);
  const [session, setSession] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem("parish-demo-session")) || null;
    } catch {
      return null;
    }
  });
  const [church, setChurch] = useState("all");
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [globalSearch, setGlobalSearch] = useState("");
  const [memberQuery, setMemberQuery] = useState("");
  const [memberStatus, setMemberStatus] = useState("Active");
  const [storageError, setStorageError] = useState(false);
  const searchRef = useRef(null);
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }, [data]);
  useEffect(() => {
    const h = () => {
      setPage(location.hash.slice(1) || "overview");
      setMobileNav(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);
  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  const go = useCallback((id) => {
    location.hash = id;
    setPage(id);
    setMobileNav(false);
  }, []);
  const close = useCallback(() => setDialog(null), []);
  const open = useCallback(
    (type, props = {}) => {
      if (
        !session &&
        !["login", "prayer", "notice-detail", "donation", "pledge"].includes(
          type,
        ) &&
        !(type === "member" && props.registration)
      )
        return;
      if (
        session?.role === "Committee member" &&
        ["approve", "message", "whatsapp-test", "notice", "campaign"].includes(
          type,
        )
      )
        return;
      if (
        session?.role === "Committee member" &&
        type === "member" &&
        !props.registration
      )
        return;
      setDialog({ type, ...props });
    },
    [session],
  );
  const notify = useCallback((message) => setToast(message), []);
  function update(mutator, message) {
    setData((old) => mutator(old));
    if (message) notify(message);
  }
  function activity(title, detail = "") {
    return { id: uid(), title, detail, date: new Date().toISOString() };
  }
  function showApprovals() {
    setMemberStatus("Pending");
    go("members");
  }
  const current =
    navigation.find((n) => n.id === page)?.label ||
    (page === "settings" ? "Settings" : "Overview");
  const pending = data.members.filter(
    (m) => m.status === "Pending" && (church === "all" || m.church === church),
  ).length;
  useEffect(() => {
    setLanguage(getLanguage());
    const change = () => setCurrentLanguage(getLanguage());
    window.addEventListener("parish-language-change", change);
    return () => window.removeEventListener("parish-language-change", change);
  }, []);
  function login(value) {
    setSession(value);
    try {
      sessionStorage.setItem("parish-demo-session", JSON.stringify(value));
    } catch {}
    setChurch(
      ["Church pastor", "Committee member"].includes(value.role)
        ? value.church
        : "all",
    );
    setDialog(null);
    go("overview");
  }
  function logout() {
    setSession(null);
    try {
      sessionStorage.removeItem("parish-demo-session");
    } catch {}
    setChurch("all");
    setDialog(null);
    go("welcome");
  }
  const scopedRole =
    session && ["Church pastor", "Committee member"].includes(session.role);
  const effectiveChurch = scopedRole ? session.church : church;
  function can(action) {
    if (!session) return false;
    if (action === "settings")
      return ["Administrator", "Head pastor", "Secretary"].includes(
        session.role,
      );
    if (action === "pastoral")
      return ["Administrator", "Head pastor", "Church pastor"].includes(
        session.role,
      );
    return session.role !== "Committee member";
  }
  const context = {
    data,
    update,
    church: effectiveChurch,
    setChurch: scopedRole ? () => {} : setChurch,
    go,
    open,
    close,
    notify,
    activity,
    memberQuery,
    setMemberQuery,
    memberStatus,
    setMemberStatus,
    showApprovals,
    language,
    session,
    login,
    logout,
    isStaff: !!session,
    can,
    scopedRole,
  };
  const views = {
    overview: Dashboard,
    members: Members,
    churches: Churches,
    communications: Communications,
    celebrations: Celebrations,
    "notice-board": NoticeBoard,
    giving: Giving,
    prayers: Prayers,
    settings: SettingsPage,
  };
  const View = views[page] || Dashboard;
  if (!session)
    return (
      <ParishContext.Provider value={context}>
        <PublicPortal page={page} />
        {dialog && <Dialogs dialog={dialog} />}
        {toast && (
          <div className="toast public-toast" role="status">
            <span>
              <Check size={16} />
            </span>
            {toast}
            <button
              aria-label="Dismiss notification"
              onClick={() => setToast("")}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </ParishContext.Provider>
    );
  return (
    <ParishContext.Provider value={context}>
      {mobileNav && (
        <button
          className="sidebar-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside className={`sidebar ${mobileNav ? "is-open" : ""}`}>
        <a href="#overview" className="brand church-sidebar-brand">
          <img
            src={`${import.meta.env.BASE_URL}church-mark.svg`}
            alt="St. John’s Church logo"
          />
          <span>
            <strong>St. John’s Church</strong>
            <small>MA NAGAR PASTORATE</small>
          </span>
        </a>
        <button className="workspace-switch" onClick={() => open("workspace")}>
          <span className="workspace-icon">
            <Church size={19} />
          </span>
          <span>
            <strong>{data.settings.pastorate}</strong>
            <small>Your church, connected</small>
          </span>
          <ChevronDown size={14} />
        </button>
        <div className="nav-section-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {navigation
            .filter(
              (item) =>
                !(
                  session?.role === "Committee member" &&
                  item.id === "communications"
                ),
            )
            .map(({ id, label, icon: Icon, section }) => (
              <React.Fragment key={id}>
                {section && (
                  <div className="nav-section-label community-label">
                    {section}
                  </div>
                )}
                <a
                  href={`#${id}`}
                  className={`nav-link ${page === id ? "active" : ""}`}
                  aria-current={page === id ? "page" : undefined}
                  onClick={() => setMobileNav(false)}
                >
                  <Icon size={19} strokeWidth={1.7} />
                  <span>{label}</span>
                  {id === "members" && pending > 0 && (
                    <span className="nav-count">{pending}</span>
                  )}
                  {id === "prayers" &&
                    data.prayers.filter(
                      (p) =>
                        p.status === "New" &&
                        (church === "all" || p.church === church),
                    ).length > 0 && <span className="nav-dot" />}
                </a>
              </React.Fragment>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-verse">
            <span className="verse-icon">✧</span>
            <p>
              Many members.
              <br />
              One body in Christ.
            </p>
            <small>ROMANS 12:5</small>
          </div>
          {can("settings") && (
            <a
              href="#settings"
              className={`nav-link ${page === "settings" ? "active" : ""}`}
            >
              <Settings size={19} />
              <span>Settings</span>
            </a>
          )}
          <button className="nav-link" onClick={() => open("help")}>
            <CircleHelp size={19} />
            <span>Help & getting started</span>
            <ArrowUpRight size={14} />
          </button>
          <div className="sidebar-user">
            <Avatar name="Daniel Selvaraj" />
            <span>
              <strong>Daniel Selvaraj</strong>
              <small>{session.role}</small>
            </span>
            <button
              className="icon-button"
              aria-label="View account"
              onClick={() => open("account")}
            >
              <ChevronDown size={15} />
            </button>
          </div>
        </div>
      </aside>
      <div className="app-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              aria-label="Open navigation"
              onClick={() => setMobileNav(true)}
            >
              <Menu size={22} />
            </button>
            <span>Workspace</span>
            <ChevronRight size={14} />
            <strong>{current}</strong>
          </div>
          <div className="topbar-right">
            <LanguageToggle />
            <form
              className="global-search"
              onSubmit={(e) => {
                e.preventDefault();
                setMemberQuery(globalSearch);
                setMemberStatus("All");
                go("members");
                setGlobalSearch("");
              }}
            >
              <Search size={16} />
              <input
                ref={searchRef}
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Search members…"
                aria-label="Search all members"
              />
              <kbd>
                <Command size={11} /> K
              </kbd>
            </form>
            <span className="topbar-divider" />
            <button
              className="notification-button icon-button"
              title="Activity & notifications"
              onClick={() => open("activity")}
            >
              <Bell size={20} />
              <span />
            </button>
            <button
              className="profile-button"
              aria-label="Your account"
              onClick={() => open("account")}
            >
              <Avatar name="Daniel Selvaraj" size="small" />
            </button>
          </div>
        </header>
        {storageError && (
          <div className="storage-warning">
            Your browser could not save these changes. Keep this tab open and
            export your member list before leaving.
          </div>
        )}
        <main className="main-content">
          {page === "settings" && !can("settings") ? <Dashboard /> : <View />}
        </main>
        <footer className="app-footer">
          <span>
            <span className="status-dot" /> All together. All connected.
          </span>
          <span>
            Parish prototype <span className="footer-dot">·</span> Sample data
          </span>
        </footer>
      </div>
      {dialog && <Dialogs dialog={dialog} />}
      {toast && (
        <div className="toast" role="status">
          <span>
            <Check size={16} />
          </span>
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </ParishContext.Provider>
  );
}
