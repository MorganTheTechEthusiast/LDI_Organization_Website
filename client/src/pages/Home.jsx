import { ArrowRight, Handshake, Newspaper, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api.js";
import BlogCard from "../components/BlogCard.jsx";
import ProgramCard from "../components/ProgramCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { impact, services } from "../data/site.js";

export default function Home() {
  const { data: events } = useFetch(endpoints.events);
  const { data: posts } = useFetch(endpoints.posts);
  const leadPost = posts[0];
  const supportingPosts = posts.slice(1, 3);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80" alt="Digital media workspace" className="h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-maroon/50" />
        </div>
        <div className="container-tight relative grid min-h-[calc(100vh-92px)] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-sm bg-white/10 px-4 py-2 font-heading text-sm font-black uppercase text-ember"><Sparkles className="h-4 w-4" /> Liberia's tech media voice</p>
            <h1 className="max-w-4xl font-heading text-5xl font-black leading-none sm:text-7xl lg:text-8xl">Informing, Educating & Inspiring Liberia's Digital Future</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/75">
              Liberia Digital Insights is a tech media organization amplifying innovation, digital skills, startup stories, events, and community impact across Liberia.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className="btn-primary" to="/programs">Explore Our Work <ArrowRight className="h-4 w-4" /></Link>
              <Link className="btn-secondary" to="/partners"><Handshake className="h-4 w-4" /> Partner With Us</Link>
              <Link className="btn-secondary" to="/contact">Contact Us</Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-sm border border-white/15 bg-white/10 p-5 backdrop-blur">
            <h2 className="font-heading text-3xl font-black">Impact Snapshot</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {impact.map(([stat, label]) => (
                <div key={label} className="rounded-sm bg-white p-5 text-ink">
                  <p className="font-heading text-4xl font-black text-maroon">{stat}</p>
                  <p className="mt-1 text-sm font-semibold leading-5 text-black/60">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <SectionHeader eyebrow="What We Do" title="Media, Training, Events, and Ecosystem Visibility" text="LDI helps Liberians understand technology, discover opportunities, and connect with the people building the country's digital economy." />
        <div className="container-tight grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <Icon className="mb-5 h-9 w-9 text-maroon" />
              <h3 className="font-heading text-2xl font-black leading-tight">{title}</h3>
              <p className="mt-3 text-[16px] leading-7 text-black/65">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-pad bg-mist">
        <SectionHeader eyebrow="Programs & Events" title="Featured Community Programs" text="Youth-centered programs, digital awareness campaigns, interviews, and media coverage designed for practical impact." />
        <div className="container-tight grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((item) => <ProgramCard key={item.id} item={item} />)}
        </div>
      </section>

      <section className="section-pad bg-ink">
        <SectionHeader light eyebrow="Latest News" title="Stories From Liberia's Digital Ecosystem" text="News, explainers, startup features, interviews, and educational articles for a growing technology community." />
        {leadPost && (
          <div className="container-tight grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <article className="grid overflow-hidden rounded-sm bg-white shadow-soft md:grid-cols-[0.9fr_1.1fr]">
              <img src={leadPost.image_url} alt={leadPost.title} className="h-full min-h-80 w-full object-cover" />
              <div className="p-7 sm:p-9">
                <p className="font-heading text-sm font-black uppercase text-maroon">#{leadPost.category}</p>
                <h3 className="mt-4 font-heading text-4xl font-black leading-tight text-ink sm:text-5xl">{leadPost.title}</h3>
                <div className="mt-4 flex flex-wrap justify-between gap-3 font-heading text-base text-black/55">
                  <span>{leadPost.date}</span>
                  <span>2 min read</span>
                </div>
                <p className="mt-5 text-lg leading-8 text-black/65">{leadPost.summary}</p>
                <Link to={`/news/${leadPost.slug}`} className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-maroon hover:text-ember">
                  Read Lead Story <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
            <div className="grid gap-4">
              {supportingPosts.map((post) => (
                <Link key={post.id} to={`/news/${post.slug}`} className="group grid gap-4 rounded-sm border border-white/10 bg-white/10 p-4 sm:grid-cols-[150px_1fr]">
                  <img src={post.image_url} alt={post.title} className="h-36 w-full rounded-sm object-cover sm:h-full" />
                  <div>
                    <p className="font-heading text-sm font-black uppercase text-ember">#{post.category}</p>
                    <h3 className="mt-2 font-heading text-2xl font-black leading-tight text-white group-hover:text-ember">{post.title}</h3>
                    <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/65">{post.summary}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
        <div className="mt-10 text-center">
          <Link to="/news" className="btn-primary"><Newspaper className="h-4 w-4" /> View All News</Link>
        </div>
      </section>
    </>
  );
}
