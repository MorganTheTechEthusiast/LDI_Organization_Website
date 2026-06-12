import { CalendarDays, Image, Mail, Newspaper, Users, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../../api.js";

const cards = [
  ["Posts", "/blog-posts", Newspaper],
  ["Events", "/events", CalendarDays],
  ["Videos", "/videos", Video],
  ["Team", "/team-members", Users],
  ["Gallery", "/gallery", Image],
  ["Messages", "/contact-messages", Mail]
];

export default function Dashboard() {
  const [counts, setCounts] = useState({});

  useEffect(() => {
    Promise.all(cards.map(([label, endpoint]) => api.get(endpoint).then((res) => [label, res.data.length]).catch(() => [label, 0]))).then((entries) => {
      setCounts(Object.fromEntries(entries));
    });
  }, []);

  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-black uppercase text-maroon">Overview</p>
        <h1 className="text-3xl font-black text-ink">Content Dashboard</h1>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, , Icon]) => (
          <div key={label} className="rounded-lg bg-white p-6 shadow-sm">
            <Icon className="mb-5 h-8 w-8 text-maroon" />
            <p className="text-4xl font-black text-ink">{counts[label] ?? "-"}</p>
            <p className="mt-1 text-sm font-bold text-black/55">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-lg bg-ink p-8 text-white">
        <h2 className="text-2xl font-black">Admin Notes</h2>
        <p className="mt-3 max-w-3xl leading-7 text-white/70">
          Use the navigation to add, edit, and delete website content. Images are managed by URL in this first release, which keeps publishing fast and deployment-friendly.
        </p>
      </div>
    </div>
  );
}
