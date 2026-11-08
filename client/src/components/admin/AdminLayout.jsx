import { BarChart3, ClipboardList, Image, LayoutDashboard, LogOut, Newspaper, Users, CalendarDays, Handshake, Mail, Video, GraduationCap, BriefcaseBusiness, Lightbulb, Settings2, ExternalLink, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../Logo.jsx";

const contentLinks = [
  ["Posts", "/admin/posts", Newspaper],
  ["Events", "/admin/events", CalendarDays],
  ["Videos", "/admin/videos", Video],
  ["Training", "/admin/trainings", GraduationCap],
  ["Opportunities", "/admin/opportunities", BriefcaseBusiness],
];

const peopleLinks = [
  ["Team", "/admin/team", Users],
  ["Youth Innovation", "/admin/youth-innovators", Lightbulb],
  ["Gallery", "/admin/gallery", Image],
  ["Partners", "/admin/partners", Handshake],
];

const systemLinks = [
  ["Messages", "/admin/messages", Mail],
  ["Applications", "/admin/training-applications", ClipboardList],
  ["Program Settings", "/admin/training-program", Settings2],
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
  const logout = () => {
    localStorage.removeItem("ldi_token");
    localStorage.removeItem("ldi_user");
    navigate("/admin/login");
  };

  const navSection = (title, items) => <div className="admin-nav-section"><p className="admin-nav-label">{title}</p>{items.map(([label, href, Icon]) => <NavLink onClick={() => setMobileOpen(false)} key={href} to={href} end={href === "/admin"} className={({ isActive }) => `admin-nav-link ${isActive ? "is-active" : ""}`}><Icon className="h-[17px] w-[17px]" /> <span>{label}</span></NavLink>)}</div>;

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
        <div className="admin-sidebar-footer"><div className="admin-user-chip"><span className="admin-user-avatar">LDI</span><span><strong>Administrator</strong><small>Signed in</small></span></div><button onClick={logout} className="admin-logout"><LogOut className="h-4 w-4" /> Sign out</button></div>
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
