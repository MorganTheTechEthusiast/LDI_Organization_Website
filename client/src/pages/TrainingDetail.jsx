import { ArrowLeft, CalendarDays, CheckCircle2, Clock, ExternalLink, MapPin, Star } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import CardImage from "../components/CardImage.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function TrainingDetail() {
  const { slug } = useParams();
  const { data: training } = useFetch(`/trainings/${slug}`, {});
  const courseItems = (training.course || "").split(",").map((item) => item.trim()).filter(Boolean);
  const registrationUrl = training.registration_url || "/contact";
  const isExternal = registrationUrl.startsWith("http");

  return (
    <article className="bg-white dark:bg-[#0f0f11]">
      <header className="section-pad bg-ink text-white">
        <div className="container-tight">
          <Link to="/training" className="mb-8 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-white/70 transition hover:text-ember">
            <ArrowLeft className="h-4 w-4" /> Back to Training
          </Link>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                <span className="rounded-sm bg-ember px-3 py-1 font-heading text-xs font-black uppercase text-ink">{training.status}</span>
                {Number(training.featured) === 1 && (
                  <span className="inline-flex items-center gap-1 rounded-sm bg-white px-3 py-1 font-heading text-xs font-black uppercase text-maroon">
                    <Star className="h-3.5 w-3.5 fill-current" /> Featured Training
                  </span>
                )}
              </div>
              <h1 className="font-heading text-5xl font-black leading-none sm:text-7xl">{training.title}</h1>
              <p className="mt-6 max-w-3xl text-xl leading-9 text-white/72">{training.description}</p>
            </div>
            <div className="rounded-sm border border-white/10 bg-white/10 p-7">
              <h2 className="font-heading text-3xl font-black">Training Details</h2>
              <div className="mt-6 grid gap-4 font-heading text-base text-white/75">
                <span className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-ember" /> Starts {training.start_date}</span>
                <span className="flex items-center gap-3"><Clock className="h-5 w-5 text-ember" /> {training.duration}</span>
                <span className="flex items-center gap-3"><MapPin className="h-5 w-5 text-ember" /> {training.location}</span>
              </div>
              {isExternal ? (
                <a href={registrationUrl} target="_blank" rel="noreferrer" className="btn-primary mt-7 w-full">
                  Register Now <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <Link to={registrationUrl} className="btn-primary mt-7 w-full">
                  Register Now
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container-tight grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <div>
          {training.image_url && <CardImage src={training.image_url} alt={training.title} className="h-[460px] rounded-sm" />}
          <section className="mt-10">
            <h2 className="font-heading text-4xl font-black text-ink">Course Description</h2>
            <p className="mt-4 text-lg leading-9 text-black/70">{training.description}</p>
          </section>
        </div>

        <aside className="h-fit rounded-sm bg-mist p-7 dark:bg-[#18181b]">
          <h3 className="font-heading text-3xl font-black text-ink">Course Focus</h3>
          <div className="mt-5 grid gap-3">
            {courseItems.map((item) => (
              <p key={item} className="flex gap-3 text-[16px] leading-7 text-black/70">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-ember" /> {item}
              </p>
            ))}
          </div>
        </aside>
      </div>
    </article>
  );
}
