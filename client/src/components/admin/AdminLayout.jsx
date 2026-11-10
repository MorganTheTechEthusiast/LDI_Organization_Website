import { BarChart3, ClipboardList, FileClock, Image, LayoutDashboard, LogOut, Newspaper, Users, CalendarDays, Handshake, Mail, Video, GraduationCap, BriefcaseBusiness, Lightbulb, Settings2, ExternalLink, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../Logo.jsx";

const contentLinks = [
  ["Posts", "/admin/posts", Newspaper, ["content_editor"]],
  ["Events", "/admin/events", CalendarDays, ["content_editor"]],
  ["Videos", "/admin/videos", Video, ["content_editor"]],
  ["Training", "/admin/trainings", GraduationCap, ["content_editor", "training_manager"]],
  ["Opportunities", "/admin/opportunities", BriefcaseBusiness, ["content_editor"]],
];

const peopleLinks = [
  ["Team", "/admin/team", Users, ["content_editor"]],
  ["Youth Innovation", "/admin/youth-innovators", Lightbulb, ["content_editor"]],
  ["Gallery", "/admin/gallery", Image, ["content_editor"]],
  ["Partners", "/admin/partners", Handshake, ["content_editor"]],
];

const systemLinks = [
  ["Messages", "/admin/messages", Mail, ["support_officer", "training_manager", "auditor"]],
  ["Applications", "/admin/training-applications", ClipboardList, ["training_manager", "finance_reviewer", "support_officer", "auditor"]],
  ["Program Settings", "/admin/training-program", Settings2, ["training_manager"]],
  ["Audit Activity", "/admin/audit-logs", FileClock, ["training_manager", "finance_reviewer", "auditor"]],
];

const links = [
  ["Dashboard", "/admin", LayoutDashboard],
  ...contentLinks,
  ...peopleLinks,
  ...systemLinks,
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = (() => { try { return JSON.parse(localStorage.getItem("ldi_user") || "{}"); } catch { return {}; } })();
  const canSee = (roles) => currentUser.role === "superadmin" || !roles || roles.includes(currentUser.role);
  const logout = () => {
    localStorage.removeItem("ldi_token");
    localStorage.removeItem("ldi_user");
    navigate("/admin/login");
  };

  const navSection = (title, items) => { const visibleItems = items.filter((item) => canSee(item[3])); return visibleItems.length ? <div className="admin-nav-section"><p className="admin-nav-label">{title}</p>{visibleItems.map(([label, href, Icon]) => <NavLink onClick={() => setMobileOpen(false)} key={href} to={href} end={href === "/admin"} className={({ isActive }) => `admin-nav-link ${isActive ? "is-active" : ""}`}><Icon className="h-[17px] w-[17px]" /> <span>{label}</span></NavLink>)}</div> : null; };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${mobileOpen ? "is-open" : ""}`}>
        <div className="admin-brand"><Logo size="admin" /><div><p className="admin-brand-title">LDI workspace</p><p className="admin-brand-subtitle">Content & impact</p></div></div>
        <nav className="admin-nav">
          {navSection("Workspace", [["Dashboard", "/admin", LayoutDashboard]])}
          {navSection("Publish", contentLinks)}
          {navSection("Community", peopleLinks)}
          {navSection("Operations", systemLinks)}
        </nav>
        <div className="admin-sidebar-footer"><div className="admin-user-chip"><span className="admin-user-avatar">LDI</span><span><strong>{currentUser.name || "Administrator"}</strong><small>{currentUser.role || "Signed in"}</small></span></div><button onClick={logout} className="admin-logout"><LogOut className="h-4 w-4" /> Sign out</button></div>
      </aside>
      {mobileOpen && <button className="admin-overlay lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="flex items-center gap-3"><button className="admin-mobile-toggle lg:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button><div className="admin-topbar-mark"><BarChart3 className="h-5 w-5" /></div><div><p className="admin-topbar-title">Liberia Digital Insights</p><p className="admin-topbar-subtitle">Management workspace</p></div></div>
          <div className="flex items-center gap-3"><a className="admin-view-site" href="/" target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /> <span>View website</span></a><button onClick={logout} className="admin-topbar-user"><span>LDI</span><ChevronDownIcon /></button></div>
        </header>
        <main className="admin-content"><Outlet /></main>
      </div>
    </div>
  );
}

function ChevronDownIcon() { return <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3.5 w-3.5"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>; }
