import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Send, Youtube } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "./Logo.jsx";

const socialLinks = [
  { Icon: Facebook, href: "https://web.facebook.com/profile.php?id=61559827598587", label: "Facebook" },
  { Icon: Linkedin, href: "https://www.linkedin.com/company/liberia-digital-insights/?viewAsMember=true", label: "LinkedIn" },
  { Icon: Instagram, href: "#", label: "Instagram" },
  { Icon: Youtube, href: "#", label: "YouTube" }
];

export default function Footer() {
  return <footer className="site-footer">
    <div className="container-tight footer-grid">
      <div className="footer-brand"><Logo to="/" size="footer" /><p>Inform. Inspire. Innovate.</p><span>Connecting Liberian youth to skills, technology, and opportunity.</span><div className="social-row">{socialLinks.map(({ Icon, href, label }) => <a key={label} href={href} aria-label={label} target={href.startsWith("http") ? "_blank" : undefined} rel={href.startsWith("http") ? "noreferrer" : undefined}><Icon className="h-4 w-4" /></a>)}</div></div>
      <div><h3>Explore</h3><div className="footer-links"><Link to="/about">About Us</Link><Link to="/programs">Programs</Link><Link to="/opportunities">Opportunities</Link><Link to="/youth-innovation">Youth Innovation</Link><Link to="/news">Insights</Link><Link to="/contact">Contact</Link></div></div>
      <div><h3>Connect</h3><div className="footer-contact"><p><Mail className="h-4 w-4" /> info@liberiadigitalinsights.org</p><p><Phone className="h-4 w-4" /> +231 770 000 000</p><p><MapPin className="h-4 w-4" /> Monrovia, Liberia</p></div></div>
      <div className="footer-newsletter"><h3>Stay connected</h3><p>Stay connected with technology, opportunities and innovation in Liberia.</p><form onSubmit={(event) => event.preventDefault()}><label className="sr-only" htmlFor="newsletter-email">Email address</label><input id="newsletter-email" type="email" placeholder="Your email address" required /><button aria-label="Subscribe to newsletter" type="submit"><Send className="h-4 w-4" /></button></form></div>
    </div>
    <div className="container-tight footer-bottom"><span>© {new Date().getFullYear()} Liberia Digital Insights. All rights reserved.</span><span>Inform. Inspire. Innovate.</span></div>
  </footer>;
}
