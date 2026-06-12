import { Linkedin, Twitter } from "lucide-react";
import CardImage from "./CardImage.jsx";

export default function TeamCard({ member }) {
  return (
    <article className="card overflow-hidden">
      <CardImage src={member.photo_url} alt={member.name} className="h-72" />
      <div className="p-6">
        <h3 className="text-xl font-black text-ink">{member.name}</h3>
        <p className="mt-1 text-sm font-bold text-maroon">{member.position}</p>
        <p className="mt-4 text-sm leading-6 text-black/65">{member.bio}</p>
        <div className="mt-5 flex gap-2">
          <a href={member.linkedin || "#"} className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white hover:bg-maroon"><Linkedin className="h-4 w-4" /></a>
          <a href={member.twitter || "#"} className="grid h-9 w-9 place-items-center rounded-md bg-ink text-white hover:bg-ember hover:text-ink"><Twitter className="h-4 w-4" /></a>
        </div>
      </div>
    </article>
  );
}
