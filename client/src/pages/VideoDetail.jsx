import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useFetch } from "../hooks/useFetch.js";
import { getVideoEmbedUrl } from "../utils/video.js";

export default function VideoDetail() {
  const { slug } = useParams();
  const { data: video } = useFetch(`/videos/${slug}`, {});
  const embedUrl = getVideoEmbedUrl(video.video_url);

  return (
    <article className="bg-[#282828] text-white">
      <header className="section-pad">
        <div className="container-tight">
          <Link to="/video" className="mb-8 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-white/65 transition hover:text-ember">
            <ArrowLeft className="h-4 w-4" /> Back to Video
          </Link>
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="font-heading text-sm font-black uppercase text-ember">#{video.category}</p>
              <h1 className="mt-4 font-heading text-5xl font-black leading-none sm:text-7xl">{video.title}</h1>
              <div className="mt-6 flex flex-wrap gap-5 font-heading text-base text-white/65">
                <span className="flex items-center gap-2"><UserRound className="h-4 w-4" /> {video.guest_name}</span>
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {video.date}</span>
              </div>
              {video.guest_title && <p className="mt-4 text-xl italic text-white/60">{video.guest_title}</p>}
            </div>
            <p className="text-xl leading-9 text-white/70">{video.summary}</p>
          </div>
        </div>
      </header>

      <div className="container-tight px-4 pb-16 sm:px-6 lg:px-8">
        {embedUrl && (
          <div className="aspect-video overflow-hidden rounded-sm bg-ink shadow-soft">
            <iframe
              src={embedUrl}
              title={video.title}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        )}
        <div className="mt-10 max-w-4xl border-l-4 border-ember pl-6">
          <h2 className="font-heading text-3xl font-black">Interview Overview</h2>
          <p className="mt-4 text-lg leading-9 text-white/68">{video.description || video.summary}</p>
        </div>
      </div>
    </article>
  );
}
