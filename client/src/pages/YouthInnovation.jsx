import { ExternalLink, Lightbulb, MapPin, Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints } from "../api.js";
import CardImage from "../components/CardImage.jsx";
import { useFetch } from "../hooks/useFetch.js";

const fallbackImage = "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85";

export default function YouthInnovation() {
  const { data: innovators, loading } = useFetch(endpoints.youthInnovators);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(innovators.map((item) => item.category).filter(Boolean))], [innovators]);
  const filtered = innovators.filter((item) => {
    const haystack = `${item.name} ${item.role} ${item.category} ${item.bio} ${item.location || ""}`.toLowerCase();
    return (category === "All" || item.category === category) && haystack.includes(query.toLowerCase());
  });

  return (
    <>
      <section className="youth-hero">
        <div className="container-tight youth-hero-inner">
          <div><p className="eyebrow"><Sparkles className="inline h-4 w-4" /> Youth innovation</p><h1>LDI Spotlight:<br /><span>Meet Liberia's impact makers.</span></h1><p>Young Liberians are not only using technology. They are building with it.</p></div>
          <div className="youth-hero-mark"><Lightbulb className="h-14 w-14" /><span>Build<br />what matters.</span></div>
        </div>
      </section>
      <section className="section-pad bg-paper">
        <div className="container-tight">
          <div className="youth-intro"><div><p className="eyebrow">Youth Innovation Spotlight</p><h2>People shaping Liberia's digital future.</h2></div><p>Discover the developers, designers, entrepreneurs, creators, and STEM innovators turning curiosity into meaningful work.</p></div>
          <div className="youth-toolbar"><label className="opportunity-search"><Search className="h-4 w-4" /><span className="sr-only">Search innovators</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search innovators" /></label><div className="youth-filters" aria-label="Innovation areas">{categories.map((item) => <button key={item} className={category === item ? "is-selected" : ""} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
          {loading ? <div className="opportunity-empty">Loading youth innovators...</div> : filtered.length ? <div className="youth-grid">{filtered.map((innovator) => <InnovatorCard key={innovator.id} innovator={innovator} />)}</div> : <div className="opportunity-empty"><h2>No spotlights published yet.</h2><p>Check back soon for stories of young Liberians building with technology.</p></div>}
        </div>
      </section>
    </>
  );
}

function InnovatorCard({ innovator }) {
  return <article className="youth-card"><div className="youth-card-image"><CardImage src={innovator.photo_url || fallbackImage} alt={innovator.name} className="h-80" />{Number(innovator.featured) === 1 && <span>Featured</span>}</div><div className="youth-card-content"><p className="eyebrow">{innovator.category}</p><h3>{innovator.name}</h3><p className="youth-role">{innovator.role}</p><p className="youth-bio">{innovator.bio}</p>{innovator.location && <p className="youth-location"><MapPin className="h-4 w-4" />{innovator.location}</p>}{innovator.website && <div className="youth-card-actions"><a href={innovator.website} target="_blank" rel="noreferrer">View work <ExternalLink className="h-4 w-4" /></a></div>}</div></article>;
}
