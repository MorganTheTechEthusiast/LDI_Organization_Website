import SectionHeader from "../components/SectionHeader.jsx";
import { services } from "../data/site.js";

export default function Services() {
  return (
    <section className="section-pad bg-white">
      <SectionHeader eyebrow="Our Services" title="Media and Digital Growth Services" text="LDI supports technology organizations, startups, schools, and communities with media coverage, digital education, and practical visibility." />
      <div className="container-tight grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, text }) => (
          <div key={title} className="card p-6">
            <Icon className="mb-5 h-9 w-9 text-maroon" />
            <h3 className="text-lg font-black">{title}</h3>
            <p className="mt-3 text-sm leading-6 text-black/65">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
