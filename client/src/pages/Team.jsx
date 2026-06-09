import { endpoints } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import TeamCard from "../components/TeamCard.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Team() {
  const { data } = useFetch(endpoints.team);
  return (
    <section className="section-pad bg-white">
      <SectionHeader eyebrow="Team Members" title="The People Behind LDI" text="A growing team of media makers, technologists, writers, trainers, volunteers, and digital community builders." />
      <div className="container-tight grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {data.map((member) => <TeamCard key={member.id} member={member} />)}
      </div>
    </section>
  );
}
