import { CalendarDays, Play } from "lucide-react";
import { Link } from "react-router-dom";
import CardImage from "./CardImage.jsx";

export default function VideoCard({ video }) {
  return (
    <Link to={`/video/${video.slug}`} className="group block">
      <article>
        <div className="relative overflow-hidden">
          <CardImage src={video.thumbnail_url} alt={video.title} className="h-72 transition duration-500 group-hover:scale-105" />
          <div className="absolute inset-0 bg-ink/20 transition group-hover:bg-ink/45" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-white bg-white/10 text-white shadow-soft backdrop-blur transition group-hover:scale-110 group-hover:bg-ember group-hover:text-ink">
            <Play className="ml-1 h-7 w-7 fill-current" />
          </span>
        </div>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full border border-white/70 px-5 py-2 font-heading text-sm font-black uppercase text-white">{video.category}</span>
          <span className="flex items-center gap-2 font-heading text-base text-white/65"><CalendarDays className="h-4 w-4" /> {video.date}</span>
        </div>
        <h3 className="mt-4 font-heading text-4xl font-black leading-tight text-white transition group-hover:text-ember">{video.title}</h3>
        <p className="mt-4 text-lg italic leading-8 text-white/58">{video.guest_title || video.guest_name}</p>
      </article>
    </Link>
  );
}
