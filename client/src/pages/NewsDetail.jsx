import { CalendarDays, User } from "lucide-react";
import { useParams } from "react-router-dom";
import CardImage from "../components/CardImage.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function NewsDetail() {
  const { slug } = useParams();
  const { data: post } = useFetch(`/blog-posts/${slug}`, {});

  return (
    <article className="bg-white">
      <header className="section-pad bg-ink text-white">
        <div className="container-tight max-w-4xl">
          <p className="mb-4 text-sm font-black uppercase text-ember">{post.category}</p>
          <h1 className="text-4xl font-black sm:text-6xl">{post.title}</h1>
          <div className="mt-5 flex flex-wrap gap-5 text-sm text-white/65">
            <span className="flex items-center gap-2"><User className="h-4 w-4" /> {post.author}</span>
            <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {post.date}</span>
          </div>
        </div>
      </header>
      <div className="container-tight max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {post.image_url && <CardImage src={post.image_url} alt={post.title} className="mb-8 rounded-sm" ratio="aspect-[16/9]" />}
        <p className="text-xl font-semibold leading-8 text-black/75">{post.summary}</p>
        <div className="mt-8 whitespace-pre-line text-lg leading-9 text-black/70">{post.content}</div>
      </div>
    </article>
  );
}
