import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { endpoints } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";
import { impact, services, values } from "../data/site.js";

const fallbackPeople = [
  "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
];

export default function About() {
  const { data: team } = useFetch(endpoints.team);
  const people = team.length ? team.slice(0, 5).map((member) => member.photo_url) : fallbackPeople;

  return (
    <>
      <section className="about-hero">
        <div className="container-tight">
          <p className="eyebrow">About Liberia Digital Insights</p>
          <h1>Who We Are?</h1>
          <p>We are building a more informed, skilled, and connected digital Liberia.</p>
        </div>
      </section>

      <section className="about-intro-section">
        <div className="container-tight about-intro-grid">
          <div className="about-copy">
            <p className="eyebrow">Our story</p>
            <h2>Technology becomes powerful when people can access it, understand it, and build with it.</h2>
            <p>Liberia Digital Insights is a technology media, digital innovation, and youth empowerment organization that focuses on promoting technology, digital transformation, and innovation in Liberia. Our services include technology news coverage, media publicity for tech-related events, digital marketing and branding, business promotion, content creation, podcast/media production, website and digital platform promotion, community technology awareness, and digital skills training programs.</p>
            <p>Our work connects media with action: we tell important technology stories while creating programs that help youth and communities build digital confidence.</p>
            <div className="about-check-list"><span><CheckCircle2 className="h-5 w-5" /> Inform young Liberians</span><span><CheckCircle2 className="h-5 w-5" /> Connect people to opportunity</span><span><CheckCircle2 className="h-5 w-5" /> Highlight local innovation</span></div>
          </div>
          <div className="about-visual" aria-label="LDI team and community visual">
            <div className="about-collage about-collage-main"><img src={people[0]} alt="LDI team member working with technology" /></div>
            <div className="about-collage about-collage-small about-collage-one"><img src={people[1] || people[0]} alt="LDI community member" /></div>
            <div className="about-collage about-collage-small about-collage-two"><img src={people[2] || people[0]} alt="Young Liberian innovator" /></div>
            <div className="about-collage about-collage-small about-collage-three"><img src={people[3] || people[0]} alt="LDI team member" /></div>
            <div className="about-collage about-collage-small about-collage-four"><img src={people[4] || people[0]} alt="Digital learning participant" /></div>
            <span className="about-visual-mark">LDI<br /><small>Inform. Inspire. Innovate.</small></span>
          </div>
        </div>
      </section>

      <section className="about-purpose-section">
        <div className="container-tight about-purpose-grid">
          <div className="purpose-copy">
            <p className="eyebrow">What guides us</p>
            <div className="purpose-block"><h2>Our Mission</h2><p>Our mission is to provide relevant, high-quality tech content that informs, educates, and encourages more Liberians to embrace technology. We strive to make Liberia a well-recognized player in the global tech landscape through meaningful stories, educational insights, and engaging content.</p></div>
            <div className="purpose-block"><h2>Our Vision</h2><p>Our vision is to become the leading tech media hub in Liberia, empowering individuals and inspiring the next generation of tech innovators. Liberia Digital Insights aims to be the go-to platform for all things tech in Liberia, bridging the gap between global tech trends and local innovation.</p></div>
          </div>
          <div className="about-purpose-card"><p className="eyebrow">Our promise</p><h2>Information opens the door. Skills and opportunity help people walk through it.</h2><p>That belief shapes how we report, teach, partner, and create spaces for Liberians to participate in the digital economy.</p><Link to="/programs" className="text-link light-link">Explore our work <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="container-tight journey-layout">
          <div><p className="eyebrow">Our journey</p><h2>From trusted stories to practical pathways.</h2><p>LDI brings together journalism, education, visibility, and community so that technology is not only discussed, but experienced and put to work.</p><Link to="/contact" className="btn-crimson">Work with LDI <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="journey-stats">{impact.map(([stat, label]) => <div key={label}><strong>{stat}</strong><span>{label}</span></div>)}</div>
        </div>
      </section>

      <section className="section-pad bg-sand">
        <SectionHeader eyebrow="How we contribute" title="Media, learning, and visibility that move the ecosystem forward." />
        <div className="container-tight service-list">{services.slice(0, 6).map(({ icon: Icon, title, text }, index) => <article key={title}><span className="service-number">0{index + 1}</span><Icon className="service-list-icon h-6 w-6" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
      </section>

      <section className="section-pad bg-paper">
        <SectionHeader eyebrow="Core values" title="The principles behind our work." text="Six commitments shape how we show up for our community, partners, and the future we are helping to build." />
        <div className="container-tight grid gap-5 md:grid-cols-2 lg:grid-cols-3">{values.map(({ icon: Icon, title, text }, index) => <article className="value-card" key={title}><div className="value-card-top"><span>0{index + 1}</span><Icon className="h-6 w-6" /></div><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="about-bottom-cta"><div className="container-tight"><p className="eyebrow">The next chapter</p><h2>Let's build Liberia's digital future together.</h2><p>Join the people, organizations, and young innovators making technology more accessible and more meaningful in Liberia.</p><Link to="/contact" className="btn-crimson">Get involved <ArrowRight className="h-4 w-4" /></Link></div></section>
    </>
  );
}
