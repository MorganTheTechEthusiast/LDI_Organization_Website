import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const links = [
  ["About Us", "/about"],
  ["Programs & Impact", "/programs"],
  ["Digital Opportunities", "/opportunities"],
  ["Youth Innovation", "/youth-innovation"],
  ["Team", "/team"],
  ["Gallery", "/gallery"],
  ["Insights / News", "/news"]
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navClass = ({ isActive }) =>
    `nav-link font-heading text-sm font-semibold transition ${isActive ? "is-active" : ""}`;

  return (
    <header className="site-header sticky top-0 z-50">
      <nav className="container-tight flex min-h-[76px] items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        <Logo to="/" size="nav" />
        <div className="hidden items-center gap-9 lg:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={navClass}>
              {label}
            </NavLink>
          ))}
          <ThemeToggle />
          <NavLink to="/get-involved" className="btn-crimson px-5 py-2.5 text-sm">Get Involved <ArrowRight className="h-4 w-4" /></NavLink>
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button className="mobile-menu-button" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation" aria-expanded={open}>
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="mobile-nav border-t border-black/10 px-4 py-5 lg:hidden">
          <div className="grid gap-3">
            {links.map(([label, href]) => (
              <NavLink key={href} to={href} className={navClass} onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
            <NavLink to="/get-involved" className="btn-crimson mt-2 justify-center" onClick={() => setOpen(false)}>Get Involved <ArrowRight className="h-4 w-4" /></NavLink>
          </div>
        </div>
      )}
    </header>
  );
}
