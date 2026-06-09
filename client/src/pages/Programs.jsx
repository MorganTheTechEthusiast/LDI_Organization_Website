import { endpoints } from "../api.js";
import ProgramCard from "../components/ProgramCard.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Programs() {
  const { data } = useFetch(endpoints.events);
  return (
    <section className="section-pad bg-mist dark:bg-[#17171a]">
      <SectionHeader eyebrow="Programs & Events" title="Training, Outreach, Interviews, and Ecosystem Campaigns" text="Explore LDI programs built around education, youth empowerment, startup storytelling, and community awareness." />
      <div className="container-tight grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.map((item) => <ProgramCard key={item.id} item={item} />)}
      </div>
    </section>
  );
}
