import { ArrowRight, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import CardImage from "./CardImage.jsx";

const statusColor = {
  Upcoming: "bg-ember text-ink",
  Ongoing: "bg-maroon text-white",
  Completed: "bg-ink text-white"
};

export default function ProgramCard({ item }) {
  return (
    <Link to={`/programs/${item.id}`} className="group block h-full">
      <article className="h-full">
        <div className="relative mb-4">
          <CardImage
            src={item.image_url}
            alt={item.title}
            imageClassName="transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
        </div>
        <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <span className={`rounded-sm px-3 py-1 font-heading text-xs font-black uppercase ${statusColor[item.status] || "bg-black text-white"}`}>{item.status}</span>
          <span className="flex items-center gap-2 font-heading text-sm font-semibold text-black/55"><CalendarDays className="h-4 w-4" /> {item.date}</span>
        </div>
        <h3 className="font-heading text-3xl font-black leading-tight text-ink transition group-hover:text-maroon dark:group-hover:text-ember">{item.title}</h3>
        <p className="mt-3 line-clamp-3 text-[16px] leading-7 text-black/65">{item.description}</p>
        <span className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-maroon transition group-hover:translate-x-1 group-hover:text-ember">
          Read More <ArrowRight className="h-4 w-4" />
        </span>
        </div>
      </article>
    </Link>
  );
}
