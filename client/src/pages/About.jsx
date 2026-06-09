import SectionHeader from "../components/SectionHeader.jsx";
import { impact, values } from "../data/site.js";

export default function About() {
  return (
    <>
      <section className="section-pad bg-ink text-white">
        <div className="container-tight max-w-5xl">
          <p className="mb-4 text-sm font-black uppercase text-ember">About Us</p>
          <h1 className="text-4xl font-black sm:text-6xl">A trusted media platform for Liberia's digital transformation.</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/75">
            Liberia Digital Insights exists to make technology understandable, visible, and useful for students, entrepreneurs, organizations, and communities.
          </p>
        </div>
      </section>
      <section className="section-pad bg-white">
        <div className="container-tight grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-black">Who We Are</h2>
            <p className="mt-4 leading-8 text-black/65">
              Liberia Digital Insights is a technology media, digital innovation, and youth empowerment organization that focuses on promoting technology, digital transformation, and innovation in Liberia. Our services include technology news coverage, media publicity for tech-related events, digital marketing and branding, business promotion, content creation, podcast/media production, website and digital platform promotion, community technology awareness, and digital skills training programs.
            </p>
            <p className="mt-4 leading-8 text-black/65">
              Our work connects media with action: we tell important technology stories while also creating programs that help youth and communities build digital confidence.
            </p>
          </div>
          <div className="grid gap-5">
            <div className="rounded-lg bg-maroon p-7 text-white">
              <h3 className="text-2xl font-black">Mission</h3>
              <p className="mt-3 leading-7 text-white/80">Our mission is to provide relevant, high-quality tech content that informs, educates, and encourages more Liberians to embrace technology. We strive to make Liberia a well-recognized player in the global tech landscape through meaningful stories, educational insights, and engaging content.</p>
            </div>
            <div className="rounded-lg bg-ink p-7 text-white">
              <h3 className="text-2xl font-black">Vision</h3>
              <p className="mt-3 leading-7 text-white/80">Our vision is to become the leading tech media hub in Liberia, empowering individuals and inspiring the next generation of tech innovators. Liberia Digital Insights aims to be the go-to platform for all things tech in Liberia, bridging the gap between global tech trends and local innovation.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="section-pad bg-mist">
        <SectionHeader eyebrow="Goals" title="What We Are Building Toward" />
        <div className="container-tight grid gap-5 md:grid-cols-4">
          {impact.map(([stat, label]) => (
            <div key={label} className="rounded-lg bg-white p-6 text-center shadow-sm">
              <p className="text-4xl font-black text-maroon">{stat}</p>
              <p className="mt-2 text-sm font-semibold text-black/60">{label}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section-pad bg-white">
        <SectionHeader eyebrow="Core Values" title="Principles That Guide Our Work" />
        <div className="container-tight grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {values.map(({ icon: Icon, title, text }) => (
            <div key={title} className="card p-6">
              <Icon className="mb-4 h-8 w-8 text-ember" />
              <h3 className="text-lg font-black">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
