import { ArrowRight, CalendarDays, User } from "lucide-react";
import { Link } from "react-router-dom";
import CardImage from "./CardImage.jsx";

export default function BlogCard({ post }) {
  return (
    <article className="card overflow-hidden">
      <CardImage src={post.image_url} alt={post.title} />
      <div className="p-6">
        <span className="font-heading text-sm font-black uppercase text-maroon">#{post.category}</span>
        <h3 className="mt-3 font-heading text-2xl font-black leading-tight text-ink transition hover:text-maroon">{post.title}</h3>
        <div className="mt-3 flex flex-wrap gap-4 font-heading text-sm font-semibold text-black/50">
          <span className="flex items-center gap-1"><User className="h-4 w-4" /> {post.author}</span>
          <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {post.date}</span>
        </div>
        <p className="mt-4 line-clamp-3 text-[16px] leading-7 text-black/65">{post.summary}</p>
        <Link to={`/news/${post.slug}`} className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-maroon hover:text-ember">
          Read Article <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
