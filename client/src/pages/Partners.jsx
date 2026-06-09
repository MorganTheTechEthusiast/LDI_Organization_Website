import { endpoints } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Partners() {
  const { data } = useFetch(endpoints.partners);
  return (
    <section className="section-pad bg-white">
      <SectionHeader eyebrow="Partners" title="Collaborators Strengthening Liberia's Technology Ecosystem" text="LDI works with organizations that believe in media, education, entrepreneurship, and inclusive digital growth." />
      <div className="container-tight grid gap-6 md:grid-cols-2">
        {data.map((partner) => (
          <a key={partner.id} href={partner.website || "#"} className="card flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
            <img src={partner.logo_url} alt={`${partner.name} logo`} className="h-24 w-44 rounded-md object-contain" />
            <div>
              <h3 className="text-xl font-black">{partner.name}</h3>
              <p className="mt-2 text-sm leading-6 text-black/65">{partner.description}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
