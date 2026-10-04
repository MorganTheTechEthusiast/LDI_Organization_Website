import { ArrowRight, CheckCircle2, ChevronRight, Play, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api.js";
import { impact, opportunityTypes, pillars } from "../data/site.js";
import { useFetch } from "../hooks/useFetch.js";
import BlogCard from "../components/BlogCard.jsx";
import CardImage from "../components/CardImage.jsx";
import SectionHeader from "../components/SectionHeader.jsx";

const heroImage = "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1400&q=85";

export default function Home() {
  const { data: events } = useFetch(endpoints.events);
  const { data: posts } = useFetch(endpoints.posts);
  const { data: trainings } = useFetch(endpoints.trainings);
  const { data: team } = useFetch(endpoints.team);
  const featuredTraining = trainings.find((item) => Number(item.featured) === 1) || trainings[0];
  const leadPost = posts[0];

  return (
    <>
      <section className="hero-section">
        <div className="hero-grid container-tight">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><Sparkles className="h-4 w-4" /> Inform. Inspire. Innovate.</p>
            <h1>Connecting Liberian Youth to Skills, Technology <span>&amp; Opportunity</span></h1>
            <p className="hero-lede">Information opens the door — skills and opportunity help people walk through it.</p>
            <div className="hero-actions"><Link to="/opportunities" className="btn-crimson">Explore Opportunities <ArrowRight className="h-4 w-4" /></Link><a href="#impact" className="btn-outline-orange">Our Impact</a></div>
            <div className="hero-proof"><div className="avatar-stack" aria-hidden="true">{team.slice(0, 3).map((member) => <img key={member.id} src={member.photo_url} alt="" />)}{!team.length && <span className="avatar-fallback">LDI</span>}</div><p><strong>Built for Liberia's next generation</strong><br />Stories, skills, and pathways to possibility.</p></div>
          </div>
          <div className="hero-visual-wrap"><div className="hero-shield" aria-hidden="true" /><div className="hero-visual"><img src={heroImage} alt="Young Liberians collaborating around technology" /><div className="hero-visual-caption"><span className="live-dot" /> Creating what comes next</div></div><div className="hero-note"><span>LDI</span><br />Digital confidence<br />starts with access.</div></div>
        </div>
      </section>

      <section className="section-pad bg-paper" id="pillars">
        <SectionHeader eyebrow="Our focus" title="Building Skills. Creating Opportunities. Inspiring Innovation." text="LDI brings trusted information and practical pathways together so more Liberians can participate in the digital future." />
        <div className="container-tight grid gap-5 md:grid-cols-3">{pillars.map(({ icon: Icon, title, text }, index) => <article className={"pillar-card " + (index === 0 ? "pillar-card-featured" : "")} key={title}><div className="pillar-icon"><Icon className="h-6 w-6" /></div><p className="card-index">0{index + 1}</p><h3>{title}</h3><p className="body-copy">{text}</p><Link to={index === 1 ? "/training" : "/programs"} className="text-link">Learn more <ArrowRight className="h-4 w-4" /></Link></article>)}</div>
      </section>

      <section className="impact-band" id="impact"><div className="container-tight grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center"><div><p className="eyebrow text-orange-200">Our impact</p><h2>Progress you can feel.</h2><p>Every story shared, workshop hosted, and opportunity surfaced is a step toward a more confident and connected digital Liberia.</p></div><div className="impact-grid">{impact.map(([stat, label]) => <div className="impact-stat" key={label}><strong>{stat}</strong><span>{label}</span></div>)}</div></div></section>

      <section className="section-pad bg-paper"><div className="container-tight section-intro-row"><SectionHeader eyebrow="Digital opportunities" title="Find your next opening." text="Explore the pathways, programs, and conversations that can help you move from interest to action." /><Link to="/opportunities" className="text-link section-intro-link">Explore all opportunities <ArrowRight className="h-4 w-4" /></Link></div><div className="container-tight opportunity-grid">{opportunityTypes.map(({ icon: Icon, title, text }) => <Link to={title.includes("Training") ? "/training" : "/opportunities"} className="opportunity-row" key={title}><span className="opportunity-icon"><Icon className="h-5 w-5" /></span><span><strong>{title}</strong><small>{text}</small></span><ChevronRight className="opportunity-arrow h-5 w-5" /></Link>)}</div></section>

      <section className="section-pad bg-sand"><div className="container-tight section-intro-row"><SectionHeader eyebrow="Programs & impact" title="Where ideas become momentum." text="From community learning to media visibility, our programs make digital participation practical and visible." /><Link to="/programs" className="text-link section-intro-link">View all programs <ArrowRight className="h-4 w-4" /></Link></div><div className="container-tight grid gap-6 md:grid-cols-2 lg:grid-cols-3">{events.slice(0, 3).map((event) => <Link to={"/programs/" + event.id} className="story-card group" key={event.id}><div className="story-card-image"><CardImage src={event.image_url} alt={event.title} className="h-60 transition duration-500 group-hover:scale-105" /><span>{event.status || "Program"}</span></div><div className="story-card-content"><p className="eyebrow">{event.date}</p><h3>{event.title}</h3><p>{event.description}</p><span className="text-link">Explore program <ArrowRight className="h-4 w-4" /></span></div></Link>)}{!events.length && <EmptyState text="New programs and community events are coming soon." href="/contact" action="Partner with LDI" />}</div></section>

      <section className="section-pad bg-paper"><div className="container-tight feature-split"><div className="feature-copy"><p className="eyebrow">Featured learning</p><h2>{featuredTraining ? featuredTraining.title : "Practical digital skills for the next chapter."}</h2><p>{featuredTraining?.description || "LDI creates spaces where young people can learn together, build confidence, and take meaningful steps toward opportunity."}</p><ul>{["Practical, community-centered learning", "Built for students, creators, and emerging professionals", "A supportive path from curiosity to confidence"].map((item) => <li key={item}><CheckCircle2 className="h-5 w-5" />{item}</li>)}</ul><Link to={featuredTraining ? "/training/" + featuredTraining.slug : "/training"} className="btn-crimson">View training <ArrowRight className="h-4 w-4" /></Link></div><div className="feature-art"><img src={featuredTraining?.image_url || heroImage} alt="LDI digital skills learning" /><div className="feature-art-label"><Play className="h-4 w-4 fill-current" /> Learn. Build. Lead.</div></div></div></section>

      <section className="section-pad bg-ink text-white"><div className="container-tight section-intro-row"><SectionHeader light eyebrow="Insights / news" title="Stories for a digital Liberia." text="Read the ideas, people, and progress shaping technology and opportunity across our ecosystem." /><Link to="/news" className="text-link section-intro-link light-link">Read all insights <ArrowRight className="h-4 w-4" /></Link></div>{leadPost ? <div className="container-tight grid gap-6 lg:grid-cols-[1.15fr_0.85fr]"><article className="lead-story"><CardImage src={leadPost.image_url} alt={leadPost.title} className="h-full min-h-80" /><div><p className="eyebrow">{leadPost.category}</p><h3>{leadPost.title}</h3><p>{leadPost.summary}</p><Link to={"/news/" + leadPost.slug} className="text-link light-link">Read story <ArrowRight className="h-4 w-4" /></Link></div></article><div className="grid gap-5 md:grid-cols-2 lg:grid-cols-1">{posts.slice(1, 3).map((post) => <BlogCard key={post.id} post={post} />)}</div></div> : <EmptyState dark text="Fresh insights are on the way." href="/contact" action="Talk to our team" />}</section>

      <section className="cta-band"><div className="container-tight cta-inner"><div><p className="eyebrow">Join the movement</p><h2>Be Part of Liberia's Digital Future.</h2><p>Whether you are a student, educator, creator, organization, company, or technology enthusiast, there is a place for you in the LDI community.</p></div><div className="hero-actions"><Link to="/contact" className="btn-crimson">Get Involved <ArrowRight className="h-4 w-4" /></Link><Link to="/opportunities" className="btn-outline-orange">Explore Opportunities</Link></div></div></section>
    </>
  );
}

function EmptyState({ text, href, action, dark = false }) {
  return <div className={"container-tight empty-state " + (dark ? "empty-state-dark" : "")}><p>{text}</p><Link to={href} className="text-link">{action} <ArrowRight className="h-4 w-4" /></Link></div>;
}
