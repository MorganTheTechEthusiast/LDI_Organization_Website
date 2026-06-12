import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import Logo from "./Logo.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

const links = [
  ["About", "/about"],
  ["Services", "/services"],
  ["Programs", "/programs"],
  ["Video", "/video"],
  ["News", "/news"],
  ["Team", "/team"],
  ["Gallery", "/gallery"],
  ["Partners", "/partners"],
  ["Contact", "/contact"]
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navClass = ({ isActive }) =>
    `font-heading text-base font-bold transition ${isActive ? "text-ember" : "text-white/85 hover:text-white"}`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#252525] shadow-sm">
      <nav className="container-tight flex h-[92px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Logo to="/" size="nav" />
        <div className="hidden items-center gap-9 lg:flex">
          {links.map(([label, href]) => (
            <NavLink key={href} to={href} className={navClass}>
              {label}
            </NavLink>
          ))}
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button className="rounded-md p-2 text-white" onClick={() => setOpen((value) => !value)} aria-label="Toggle navigation">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </nav>
      {open && (
        <div className="border-t border-white/10 bg-[#252525] px-4 py-4 lg:hidden">
          <div className="grid gap-3">
            {links.map(([label, href]) => (
              <NavLink key={href} to={href} className={navClass} onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
