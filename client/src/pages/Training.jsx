import { GraduationCap } from "lucide-react";
import { endpoints } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import TrainingCard from "../components/TrainingCard.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Training() {
  const { data: trainings } = useFetch(endpoints.trainings);
  const featured = trainings.find((training) => Number(training.featured) === 1);
  const remaining = trainings.filter((training) => training.id !== featured?.id);

  return (
    <>
      <section className="section-pad bg-ink text-white">
        <div className="container-tight grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-4 font-heading text-sm font-black uppercase text-ember">#Training</p>
            <h1 className="font-heading text-5xl font-black leading-none sm:text-7xl">Digital Skills Training Programs</h1>
            <p className="mt-6 max-w-2xl text-xl leading-9 text-white/72">
              Practical courses and awareness programs helping Liberians build confidence, skills, and opportunity in the digital economy.
            </p>
          </div>
          <div className="rounded-sm border border-white/10 bg-white/10 p-7">
            <GraduationCap className="mb-5 h-10 w-10 text-ember" />
            <h2 className="font-heading text-3xl font-black">Learn. Build. Lead.</h2>
            <p className="mt-3 text-[16px] leading-7 text-white/70">
              LDI training programs are designed for youth, students, women, founders, and community leaders who want practical digital skills and trusted guidance.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-mist">
        <SectionHeader eyebrow="Upcoming Training" title="Featured and Upcoming Opportunities" text="Browse active and upcoming LDI training programs, review course details, and register for sessions that match your goals." />
        <div className="container-tight grid gap-7 md:grid-cols-2 lg:grid-cols-3">
          {featured && <TrainingCard training={featured} />}
          {remaining.map((training) => (
            <TrainingCard key={training.id} training={training} />
          ))}
        </div>
      </section>
    </>
  );
}
