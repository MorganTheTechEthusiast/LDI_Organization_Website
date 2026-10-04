import { ArrowRight, Handshake, HeartHandshake, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";

const involvementOptions = [
  { icon: HeartHandshake, title: "Become a Mentor", text: "Share your experience, guide a young person, and help turn digital curiosity into confidence.", subject: "Become a Mentor" },
  { icon: UsersRound, title: "Volunteer", text: "Bring your time, skills, and energy to LDI programs, stories, events, and community learning.", subject: "Volunteer with LDI" },
  { icon: Handshake, title: "Become a Partner", text: "Work with LDI to expand access to technology, opportunity, and meaningful youth impact.", subject: "Become an LDI Partner" }
];

export default function GetInvolved() {
  return <>
    <section className="involved-hero"><div className="container-tight involved-hero-inner"><div><p className="eyebrow">Join the movement</p><h1>Get Involved</h1><p>There is a place for you in Liberia's digital future.</p></div><div className="involved-hero-mark"><HeartHandshake className="h-12 w-12" /><span>Connect.<br />Contribute.</span></div></div></section>
    <section className="section-pad bg-paper"><div className="container-tight"><div className="involved-heading"><p className="eyebrow">Ways to contribute</p><h2>Build with us.</h2><p>Whether you are an experienced professional, a passionate volunteer, or an organization ready to create impact, your contribution can help more Liberians access skills and opportunity.</p></div><div className="involved-grid">{involvementOptions.map(({ icon: Icon, title, text, subject }) => <article className="involved-card" key={title}><div className="involved-card-icon"><Icon className="h-6 w-6" /></div><h3>{title}</h3><p>{text}</p><Link to={`/contact?subject=${encodeURIComponent(subject)}`} className="btn-crimson">Start a conversation <ArrowRight className="h-4 w-4" /></Link></article>)}</div></div></section>
  </>;
}
