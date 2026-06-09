import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

const socialLinks = [
  { Icon: Facebook, href: "https://web.facebook.com/profile.php?id=61559827598587", label: "Facebook" },
  { Icon: Twitter, href: "https://example.com", label: "Twitter" },
  { Icon: Linkedin, href: "https://www.linkedin.com/company/liberia-digital-insights/?viewAsMember=true", label: "LinkedIn" },
  { Icon: Mail, href: "mailto:info@liberiadigitalinsights.org", label: "Email" }
];

export default function Footer() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-tight grid gap-10 px-4 py-14 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <div className="mb-4">
            <Logo to="/" size="footer" />
          </div>
          <p className="max-w-xl text-sm leading-7 text-white/70">
            Informing, educating, and inspiring Liberia's digital future through trusted media, skills training, programs, and community-centered innovation.
          </p>
          <div className="mt-5 flex gap-3">
            {socialLinks.map(({ Icon, href, label }) => (
              <a key={label} href={href} aria-label={label} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined} className="grid h-10 w-10 place-items-center rounded-md bg-white/10 text-white transition hover:bg-ember hover:text-ink">
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase text-ember">Explore</h3>
          <div className="grid gap-2 text-sm text-white/70">
            {["About", "Services", "Programs", "News", "Team", "Gallery"].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="hover:text-white">
                {item}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-black uppercase text-ember">Contact</h3>
          <div className="grid gap-3 text-sm text-white/70">
            <p className="flex gap-2"><Mail className="h-5 w-5 text-ember" /> info@liberiadigitalinsights.org</p>
            <p className="flex gap-2"><Phone className="h-5 w-5 text-ember" /> +231 770 000 000</p>
            <p className="flex gap-2"><MapPin className="h-5 w-5 text-ember" /> Monrovia, Liberia</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-white/50">
        Copyright {new Date().getFullYear()} Liberia Digital Insights. All rights reserved.
      </div>
    </footer>
  );
}
