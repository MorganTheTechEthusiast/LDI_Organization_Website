import { endpoints } from "../api.js";
import CardImage from "../components/CardImage.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Gallery() {
  const { data } = useFetch(endpoints.gallery);
  return (
    <section className="section-pad bg-mist">
      <SectionHeader eyebrow="Gallery" title="Moments From Our Programs and Media Work" text="Event photos, training sessions, outreach activities, interviews, and community engagement." />
      <div className="container-tight grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => (
          <figure key={item.id} className="card overflow-hidden">
            <CardImage src={item.image_url} alt={item.title} className="h-72" />
            <figcaption className="p-5">
              <p className="text-xs font-black uppercase text-maroon">{item.category}</p>
              <h3 className="mt-1 text-lg font-black">{item.title}</h3>
              <p className="mt-2 text-sm text-black/60">{item.description}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
