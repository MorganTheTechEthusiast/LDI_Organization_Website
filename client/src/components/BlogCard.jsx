import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import CardImage from "./CardImage.jsx";

export default function BlogCard({ post }) {
  return (
    <article className="group">
      <Link to={`/news/${post.slug}`} className="block">
        <CardImage
          src={post.image_url}
          alt={post.title}
          className="mb-4"
          imageClassName="transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div>
        <span className="font-heading text-sm font-black uppercase text-maroon">#{post.category}</span>
        <Link to={`/news/${post.slug}`} className="block">
          <h3 className="mt-3 font-heading text-3xl font-black leading-tight text-ink transition group-hover:text-maroon dark:group-hover:text-ember">{post.title}</h3>
        </Link>
        <div className="mt-4 flex items-center justify-between gap-4 font-heading text-base text-black/55">
          <span>{post.date}</span>
          <span>2 min read</span>
        </div>
        <p className="mt-4 line-clamp-3 text-[16px] leading-7 text-black/65">{post.summary}</p>
        <Link to={`/news/${post.slug}`} className="mt-5 inline-flex items-center gap-2 font-heading text-sm font-black uppercase text-maroon transition group-hover:translate-x-1 group-hover:text-ember">
          Read Article <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </article>
  );
}
