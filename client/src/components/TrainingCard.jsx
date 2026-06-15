import { ArrowRight, CalendarDays, Clock, MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import CardImage from "./CardImage.jsx";

const statusStyle = {
  Upcoming: "bg-ember text-ink",
  Ongoing: "bg-maroon text-white",
  Completed: "bg-ink text-white"
};

export default function TrainingCard({ training }) {
  const isFeatured = Number(training.featured) === 1;

  return (
    <Link to={`/training/${training.slug}`} className="group block h-full">
      <article className="card h-full overflow-hidden">
        <div className="relative overflow-hidden">
          <CardImage src={training.image_url} alt={training.title} className="h-64 transition duration-500 group-hover:scale-105" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className={`rounded-sm px-3 py-1 font-heading text-xs font-black uppercase ${statusStyle[training.status] || "bg-black text-white"}`}>{training.status}</span>
            {isFeatured && (
              <span className="inline-flex items-center gap-1 rounded-sm bg-white px-3 py-1 font-heading text-xs font-black uppercase text-maroon">
                <Star className="h-3.5 w-3.5 fill-current" /> Featured
              </span>
            )}
          </div>
        </div>
        <div className="p-6">
          <p className="font-heading text-sm font-black uppercase text-maroon">{training.course}</p>
          <h3 className="mt-3 font-heading text-3xl font-black leading-tight text-ink transition group-hover:text-maroon dark:group-hover:text-ember">{training.title}</h3>
          <div className="mt-4 grid gap-2 font-heading text-sm font-semibold text-black/55">
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-ember" /> Starts {training.start_date}</span>
            <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-ember" /> {training.duration}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-ember" /> {training.location}</span>
          </div>
          <p className="mt-4 line-clamp-3 text-[16px] leading-7 text-black/65">{training.description}</p>
          <span className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-maroon transition group-hover:translate-x-1 group-hover:text-ember">
            View Training <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </article>
    </Link>
  );
}
