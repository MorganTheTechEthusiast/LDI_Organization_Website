import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints } from "../api.js";
import { useFetch } from "../hooks/useFetch.js";
import TeamCard from "../components/TeamCard.jsx";

export default function Team() {
  const { data } = useFetch(endpoints.team);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All");
  const roles = useMemo(() => ["All", ...new Set(data.map((member) => member.position).filter(Boolean))], [data]);
  const filtered = data.filter((member) => {
    const text = `${member.name} ${member.position} ${member.bio}`.toLowerCase();
    return (role === "All" || member.position === role) && text.includes(query.toLowerCase());
  });

  return (
    <>
      <section className="people-hero"><div className="container-tight people-hero-inner"><div><p className="eyebrow"><Sparkles className="inline h-4 w-4" /> The LDI team</p><h1>People behind<br /><span>the progress.</span></h1><p>Meet the media makers, technologists, trainers, and community builders helping Liberia move forward.</p></div><div className="people-hero-mark">LDI<br /><small>People make<br />possibility.</small></div></div></section>
      <section className="section-pad bg-paper"><div className="container-tight"><div className="people-heading"><div><p className="eyebrow">Our people</p><h2>A team built around impact.</h2></div><p>LDI is powered by people who believe trusted information, practical skills, and collaboration can open more doors.</p></div><div className="people-toolbar"><label className="opportunity-search"><Search className="h-4 w-4" /><span className="sr-only">Search team</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search team members" /></label><div className="people-filters" aria-label="Team roles">{roles.map((item) => <button className={role === item ? "is-selected" : ""} key={item} onClick={() => setRole(item)}>{item}</button>)}</div></div>{filtered.length ? <div className="people-grid">{filtered.map((member) => <TeamCard key={member.id} member={member} />)}</div> : <div className="opportunity-empty"><h2>No team members found.</h2><p>Try another search or role.</p></div>}</div></section>
    </>
  );
}
