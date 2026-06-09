import { ArrowLeft, CalendarDays, Megaphone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CardImage from "../components/CardImage.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

const statusStyle = {
  Upcoming: "bg-ember text-ink",
  Ongoing: "bg-maroon text-white",
  Completed: "bg-ink text-white dark:bg-white dark:text-ink"
};

export default function ProgramDetail() {
  const { id } = useParams();
  const { data: program } = useFetch(`/events/${id}`, {});

  return (
    <article className="bg-white dark:bg-[#0f0f11]">
      <header className="section-pad bg-ink text-white">
        <div className="container-tight max-w-5xl">
          <Link to="/programs" className="mb-8 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-white/70 transition hover:text-ember">
            <ArrowLeft className="h-4 w-4" /> Back to Programs
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {program.status && (
              <span className={`rounded-sm px-3 py-1 font-heading text-xs font-black uppercase ${statusStyle[program.status] || "bg-white text-ink"}`}>
                {program.status}
              </span>
            )}
            {program.date && (
              <span className="inline-flex items-center gap-2 font-heading text-sm text-white/70">
                <CalendarDays className="h-4 w-4" /> {program.date}
              </span>
            )}
          </div>
          <h1 className="mt-5 max-w-4xl font-heading text-5xl font-black leading-none sm:text-7xl">{program.title}</h1>
          <p className="mt-6 max-w-3xl text-xl leading-9 text-white/72">{program.description}</p>
        </div>
      </header>

      <div className="container-tight grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          {program.image_url && <CardImage src={program.image_url} alt={program.title} className="h-[460px] rounded-sm" />}
          <div className="mt-10 border-l-4 border-maroon pl-6">
            <h2 className="font-heading text-3xl font-black text-ink">Program Overview</h2>
            <p className="mt-4 text-lg leading-9 text-black/70">{program.description}</p>
            <p className="mt-4 text-lg leading-9 text-black/70">
              Liberia Digital Insights uses programs like this to connect young people, communities, founders, and institutions with practical digital knowledge and trusted technology media.
            </p>
          </div>
        </div>

        <aside className="h-fit rounded-sm bg-mist p-7 dark:bg-[#18181b]">
          <Megaphone className="mb-5 h-9 w-9 text-ember" />
          <h3 className="font-heading text-3xl font-black text-ink">Get Involved</h3>
          <p className="mt-3 text-[16px] leading-7 text-black/65">
            Partner with LDI to sponsor, host, promote, or participate in programs that strengthen Liberia's digital ecosystem.
          </p>
          <Link to="/contact" className="btn-primary mt-6 w-full">
            Contact LDI
          </Link>
        </aside>
      </div>

      <section className="section-pad bg-mist dark:bg-[#17171a]">
        <SectionHeader eyebrow="Programs" title="Media With Community Impact" text="Our programs combine storytelling, training, and public awareness to help Liberia's digital future become more inclusive and visible." />
      </section>
    </article>
  );
}
