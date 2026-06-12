import { PlayCircle } from "lucide-react";
import { endpoints } from "../api.js";
import SectionHeader from "../components/SectionHeader.jsx";
import VideoCard from "../components/VideoCard.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function Videos() {
  const { data: videos } = useFetch(endpoints.videos);
  const featured = videos[0];
  const remaining = videos.slice(1);

  return (
    <section className="section-pad bg-[#282828] text-white">
      <SectionHeader light eyebrow="Video" title="Video Interviews" text="Conversations with founders, creators, educators, innovators, and digital leaders shaping Liberia's technology ecosystem." />

      {featured && (
        <div className="container-tight mb-14">
          <VideoCard video={featured} />
        </div>
      )}

      <div className="container-tight grid gap-x-12 gap-y-16 lg:grid-cols-2">
        {remaining.map((video) => (
          <VideoCard key={video.id} video={video} />
        ))}
      </div>

      {!videos.length && (
        <div className="container-tight rounded-sm border border-white/10 bg-white/5 p-10 text-center">
          <PlayCircle className="mx-auto mb-4 h-12 w-12 text-ember" />
          <p className="font-heading text-2xl font-black">No video interviews have been published yet.</p>
        </div>
      )}
    </section>
  );
}
