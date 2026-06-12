import { endpoints } from "../api.js";
import BlogCard from "../components/BlogCard.jsx";
import CardImage from "../components/CardImage.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import { useFetch } from "../hooks/useFetch.js";

export default function News() {
  const { data } = useFetch(endpoints.posts);
  const leadPost = data[0];
  const remainingPosts = data.slice(1);

  return (
    <section className="section-pad bg-white">
      <SectionHeader eyebrow="News / Blog" title="Tech News, Digital Updates, and Innovation Stories" text="Read LDI coverage on technology, startups, education, digital safety, events, and youth innovation in Liberia." />
      <div className="container-tight">
        {leadPost && (
          <article className="mb-10 grid gap-7 border-b border-black/10 pb-10 lg:grid-cols-[0.85fr_1fr]">
            <CardImage src={leadPost.image_url} alt={leadPost.title} className="rounded-sm" ratio="aspect-[16/11]" />
            <div className="self-center">
              <p className="font-heading text-sm font-black uppercase text-maroon">#{leadPost.category}</p>
              <h2 className="mt-3 font-heading text-4xl font-black leading-tight text-ink sm:text-6xl">{leadPost.title}</h2>
              <div className="mt-4 flex flex-wrap justify-between gap-4 font-heading text-base text-black/55">
                <span>{leadPost.date}</span>
                <span>{leadPost.author}</span>
              </div>
              <p className="mt-6 text-xl leading-9 text-black/65">{leadPost.summary}</p>
            </div>
          </article>
        )}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {remainingPosts.map((post) => <BlogCard key={post.id} post={post} />)}
        </div>
      </div>
    </section>
  );
}
