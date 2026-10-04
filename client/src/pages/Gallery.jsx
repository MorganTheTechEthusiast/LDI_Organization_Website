import { Expand, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints } from "../api.js";
import CardImage from "../components/CardImage.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Gallery() {
  const { data } = useFetch(endpoints.gallery);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState(null);
  const categories = useMemo(() => ["All", ...new Set(data.map((item) => item.category).filter(Boolean))], [data]);
  const filtered = data.filter((item) => `${item.title} ${item.description || ""} ${item.category}`.toLowerCase().includes(query.toLowerCase()) && (category === "All" || item.category === category));
  return (
    <>
      <section className="gallery-hero"><div className="container-tight gallery-hero-inner"><div><p className="eyebrow">Stories in frames</p><h1>Gallery</h1><p>A visual record of the people, programs, conversations, and community moments shaping LDI.</p></div></div></section>
      <section className="section-pad bg-paper"><div className="container-tight"><div className="gallery-heading"><div><p className="eyebrow">LDI moments</p><h2>See the work in motion.</h2></div><p>Explore photos published through the LDI content dashboard, from training rooms to community events.</p></div><div className="gallery-toolbar"><label className="opportunity-search"><Search className="h-4 w-4" /><span className="sr-only">Search gallery</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gallery" /></label><div className="gallery-filters" aria-label="Gallery categories">{categories.map((item) => <button className={category === item ? "is-selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>{filtered.length ? <div className="gallery-grid">{filtered.map((item, index) => <button type="button" className={`gallery-tile gallery-tile-${index % 5}`} key={item.id} onClick={() => setSelected(item)}><CardImage src={item.image_url} alt={item.title} className="h-full min-h-64" /><span className="gallery-tile-overlay"><span><strong>{item.title}</strong><small>{item.category}</small></span><Expand className="h-5 w-5" /></span></button>)}</div> : <div className="opportunity-empty"><h2>No gallery moments found.</h2><p>Try another search or category.</p></div>}</div></section>{selected && <div className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={selected.title} onClick={() => setSelected(null)}><button type="button" className="gallery-close" aria-label="Close image" onClick={() => setSelected(null)}><X className="h-6 w-6" /></button><div className="gallery-lightbox-content" onClick={(event) => event.stopPropagation()}><img src={selected.image_url} alt={selected.title} /><div><p className="eyebrow">{selected.category}</p><h2>{selected.title}</h2>{selected.description && <p>{selected.description}</p>}</div></div></div>}
    </>
  );
}
