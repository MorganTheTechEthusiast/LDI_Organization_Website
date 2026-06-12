import { BarChart3, Image, LayoutDashboard, LogOut, Newspaper, Users, CalendarDays, Handshake, Mail, Video } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import Logo from "../Logo.jsx";

const links = [
  ["Dashboard", "/admin", LayoutDashboard],
  ["Posts", "/admin/posts", Newspaper],
  ["Events", "/admin/events", CalendarDays],
  ["Videos", "/admin/videos", Video],
  ["Team", "/admin/team", Users],
  ["Gallery", "/admin/gallery", Image],
  ["Partners", "/admin/partners", Handshake],
  ["Messages", "/admin/messages", Mail]
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("ldi_token");
    localStorage.removeItem("ldi_user");
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-mist">
      <aside className="fixed inset-y-0 left-0 hidden w-72 bg-ink p-5 text-white lg:block">
        <div className="mb-8 flex items-center gap-3">
          <Logo size="admin" />
          <div>
            <p className="font-black">Admin Dashboard</p>
            <p className="text-xs text-white/50">Content management</p>
          </div>
        </div>
        <nav className="grid gap-2">
          {links.map(([label, href, Icon]) => (
            <NavLink key={href} to={href} end={href === "/admin"} className={({ isActive }) => `flex items-center gap-3 rounded-md px-4 py-3 text-sm font-bold ${isActive ? "bg-ember text-ink" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="absolute bottom-5 left-5 right-5 flex items-center justify-center gap-2 rounded-md bg-white/10 px-4 py-3 text-sm font-bold hover:bg-maroon">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-white px-4 py-4 shadow-sm sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-maroon" />
              <span className="font-black">Liberia Digital Insights CMS</span>
            </div>
            <button onClick={logout} className="rounded-md bg-ink px-4 py-2 text-sm font-bold text-white lg:hidden">Logout</button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto lg:hidden">
            {links.map(([label, href]) => (
              <NavLink key={href} to={href} end={href === "/admin"} className={({ isActive }) => `shrink-0 rounded-md px-3 py-2 text-xs font-bold ${isActive ? "bg-ember text-ink" : "bg-black/5 text-ink"}`}>
                {label}
              </NavLink>
            ))}
          </div>
        </header>
        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
