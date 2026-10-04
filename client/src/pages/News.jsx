import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { endpoints } from "../api.js";
import BlogCard from "../components/BlogCard.jsx";
import CardImage from "../components/CardImage.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function News() {
  const { data } = useFetch(endpoints.posts);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const categories = useMemo(() => ["All", ...new Set(data.map((post) => post.category).filter(Boolean))], [data]);
  const filtered = data.filter((post) => {
    const haystack = `${post.title} ${post.summary} ${post.author} ${post.category}`.toLowerCase();
    return (category === "All" || post.category === category) && haystack.includes(query.toLowerCase());
  });
  const leadPost = filtered[0];
  const remainingPosts = filtered.slice(1);

  return (
    <>
      <section className="news-hero"><div className="container-tight news-hero-inner"><div><p className="eyebrow"><Sparkles className="inline h-4 w-4" /> News / resources</p><h1>News &amp; Insights</h1><p>Stories, ideas, and practical information shaping technology, education, and innovation in Liberia.</p></div></div></section>
      <section className="section-pad bg-paper">
      <div className="container-tight news-intro"><SectionHeader eyebrow="Impact & insights" title="Stay close to what is changing." text="Read LDI coverage on technology, startups, education, digital safety, events, and youth innovation in Liberia." /></div>
      <div className="container-tight">
        <div className="news-toolbar"><label className="opportunity-search"><Search className="h-4 w-4" /><span className="sr-only">Search news</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search insights" /></label><div className="news-filters" aria-label="News categories">{categories.map((item) => <button className={category === item ? "is-selected" : ""} key={item} onClick={() => setCategory(item)}>{item}</button>)}</div></div>
        {leadPost && (
          <article className="mb-10 grid gap-7 border-b border-black/10 pb-10 lg:grid-cols-[0.85fr_1fr]">
            <CardImage src={leadPost.image_url} alt={leadPost.title} className="h-[420px] rounded-sm" />
            <div className="self-center">
              <p className="font-heading text-sm font-black uppercase text-maroon">#{leadPost.category}</p>
              <h2 className="mt-3 font-heading text-4xl font-black leading-tight text-ink sm:text-6xl">{leadPost.title}</h2>
              <div className="mt-4 flex flex-wrap justify-between gap-4 font-heading text-base text-black/55">
                <span>{leadPost.date}</span>
                <span>{leadPost.author}</span>
              </div>
              <p className="mt-6 text-xl leading-9 text-black/65">{leadPost.summary}</p>
            </div>
          </article>
        )}
        {filtered.length ? <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div> : <div className="opportunity-empty"><h2>No stories found.</h2><p>Try a different search or category.</p></div>}
      </div>
      </section>
    </>
  );
}
