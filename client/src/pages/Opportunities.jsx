import { ArrowRight, BriefcaseBusiness, CalendarDays, ExternalLink, MapPin, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints } from "../api.js";
import { useFetch } from "../hooks/useFetch.js";
import CardImage from "../components/CardImage.jsx";

const fallbackImage = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80";

export default function Opportunities() {
  const { data: opportunities, loading } = useFetch(endpoints.opportunities);
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const categories = useMemo(() => ["All", ...new Set(opportunities.map((item) => item.category).filter(Boolean))], [opportunities]);
  const filtered = opportunities.filter((item) => {
    const matchesCategory = category === "All" || item.category === category;
    const searchText = (item.title + " " + item.description + " " + (item.organization || "")).toLowerCase();
    return matchesCategory && searchText.includes(query.toLowerCase());
  });
  const featured = filtered.find((item) => Number(item.featured) === 1) || filtered[0];
  const remaining = filtered.filter((item) => item.id !== featured?.id);

  return (
    <>
      <section className="opportunities-hero">
        <div className="container-tight opportunities-hero-grid">
          <div><p className="eyebrow"><Sparkles className="inline h-4 w-4" /> Digital pathways</p><h1>Digital Opportunities Hub</h1><p>Find scholarships, fellowships, internships, jobs, grants, hackathons, training programs, and technology events that can move your next idea forward.</p></div>
          <div className="opportunities-hero-mark"><BriefcaseBusiness className="h-10 w-10" /><span>Discover<br />what's next.</span></div>
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="container-tight">
          <div className="opportunities-toolbar">
            <div className="opportunity-filters" aria-label="Opportunity categories">{categories.map((item) => <button className={category === item ? "is-selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div>
            <label className="opportunity-search"><Search className="h-4 w-4" /><span className="sr-only">Search opportunities</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search opportunities" /></label>
          </div>
          {loading ? <div className="opportunity-empty">Loading current opportunities...</div> : featured ? <><div className="opportunity-featured"><CardImage src={featured.image_url || fallbackImage} alt={featured.title} className="h-full min-h-72" /><div><p className="eyebrow">{featured.category}</p><h2>{featured.title}</h2><p>{featured.description}</p><OpportunityMeta item={featured} /><OpportunityAction item={featured} featured /></div></div><div className="opportunity-results-head"><div><p className="eyebrow">Opportunity board</p><h2>Browse current openings</h2></div><span>{filtered.length} {filtered.length === 1 ? "opportunity" : "opportunities"}</span></div><div className="opportunity-list">{remaining.map((item) => <OpportunityCard item={item} key={item.id} />)}</div>{!remaining.length && <div className="opportunity-empty">No other opportunities match your current filters.</div>}</> : <div className="opportunity-empty"><h2>No opportunities published yet.</h2><p>Check back soon or contact LDI to share an opportunity with our community.</p></div>}
        </div>
      </section>
    </>
  );
}

function OpportunityCard({ item }) {
  return <article className="opportunity-card"><div className="opportunity-card-image"><CardImage src={item.image_url || fallbackImage} alt={item.title} className="h-48" /><span>{item.status}</span></div><div className="opportunity-card-content"><p className="eyebrow">{item.category}</p><h3>{item.title}</h3>{item.organization && <p className="opportunity-organization">{item.organization}</p>}<p className="opportunity-description">{item.description}</p><OpportunityMeta item={item} /><OpportunityAction item={item} /></div></article>;
}

function OpportunityMeta({ item }) {
  return <div className="opportunity-meta">{item.deadline && <span><CalendarDays className="h-4 w-4" /> Deadline: {item.deadline}</span>}{item.location && <span><MapPin className="h-4 w-4" /> {item.location}</span>}</div>;
}

function OpportunityAction({ item, featured = false }) {
  const url = item.opportunity_url || "/contact";
  const external = url.startsWith("http");
  return external ? <a className={featured ? "btn-crimson mt-6" : "text-link"} href={url} target="_blank" rel="noreferrer">View Opportunity <ExternalLink className="h-4 w-4" /></a> : <a className={featured ? "btn-crimson mt-6" : "text-link"} href={url}>View Opportunity <ArrowRight className="h-4 w-4" /></a>;
}
