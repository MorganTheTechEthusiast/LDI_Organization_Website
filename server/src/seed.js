import bcrypt from "bcryptjs";
import { db, initDb, run } from "./db.js";

const images = {
  hero: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  training: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
  podcast: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=1200&q=80",
  startup: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&w=1200&q=80",
  outreach: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80",
  news: "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=1200&q=80",
  code: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  team1: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80",
  team2: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
  team3: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
  team4: "https://images.unsplash.com/photo-1589561253898-768105ca91a8?auto=format&fit=crop&w=800&q=80"
};

async function reset() {
  await initDb();
  await run("DELETE FROM contact_messages");
  await run("DELETE FROM partners");
  await run("DELETE FROM gallery");
  await run("DELETE FROM team_members");
  await run("DELETE FROM events");
  await run("DELETE FROM blog_posts");
  await run("DELETE FROM users");
}

async function seedUsers() {
  const hash = await bcrypt.hash("Admin@12345", 10);
  await run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [
    "LDI Administrator",
    "admin@liberiadigitalinsights.org",
    hash,
    "admin"
  ]);
}

async function seedBlogPosts() {
  const posts = [
    {
      title: "Why Digital Skills Matter for Liberia's Next Generation",
      slug: "why-digital-skills-matter-for-liberias-next-generation",
      category: "Education",
      author: "LDI Editorial Team",
      date: "2026-05-18",
      image_url: images.training,
      summary: "A practical look at how digital literacy, coding, media skills, and online safety can unlock youth opportunity.",
      content:
        "Liberia's digital future will be shaped by young people who can learn, build, communicate, and solve problems with technology. Digital skills are no longer optional; they are part of education, entrepreneurship, public service, and community development. Liberia Digital Insights supports training programs that help students understand technology as a pathway to confidence, employment, and innovation."
    },
    {
      title: "Startup Spotlight: Building Local Solutions With Global Tools",
      slug: "startup-spotlight-building-local-solutions-with-global-tools",
      category: "Startup Feature",
      author: "Marcus Dolo",
      date: "2026-05-09",
      image_url: images.startup,
      summary: "Liberian founders are using cloud platforms, mobile payments, and social media to reach new customers.",
      content:
        "Across Liberia, entrepreneurs are using digital tools to solve practical problems in commerce, education, agriculture, logistics, and creative media. Our Startup Spotlight series gives visibility to founders, product teams, and community builders who are turning ideas into services that people can use."
    },
    {
      title: "Inside Our Tech Tip Tuesday Series",
      slug: "inside-our-tech-tip-tuesday-series",
      category: "Digital Tips",
      author: "Sarah Kpadeh",
      date: "2026-04-27",
      image_url: images.code,
      summary: "Short, useful lessons that help communities use technology more confidently and safely.",
      content:
        "Tech Tip Tuesday is designed for everyday usefulness. Each episode breaks down a practical digital topic, from securing social media accounts to using productivity tools and understanding online misinformation. The goal is simple: make technology easier, safer, and more empowering for Liberians."
    }
  ];

  for (const post of posts) {
    await run(
      `INSERT INTO blog_posts (title, slug, category, author, date, image_url, summary, content)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [post.title, post.slug, post.category, post.author, post.date, post.image_url, post.summary, post.content]
    );
  }
}

async function seedEvents() {
  const events = [
    ["Girls in Tech Digital Skills Training", "2026-07-12", images.training, "Hands-on digital skills sessions for girls and young women interested in technology, creativity, and entrepreneurship.", "Upcoming"],
    ["High School Technology Awareness Program", "2026-06-21", images.outreach, "A school-based outreach program introducing students to online safety, digital careers, coding, and responsible media use.", "Upcoming"],
    ["Tech Tip Tuesday", "2026-05-28", images.code, "Weekly short-form digital education content shared across LDI media channels.", "Ongoing"],
    ["Podcast Interviews", "2026-05-16", images.podcast, "Conversations with founders, educators, technologists, creators, and digital policy voices in Liberia.", "Ongoing"],
    ["Startup Spotlight", "2026-04-30", images.startup, "Media features that help Liberian startups tell their stories and reach partners, customers, and supporters.", "Completed"],
    ["Community Outreach", "2026-04-12", images.outreach, "Community awareness activities focused on digital inclusion, online safety, and technology opportunity.", "Completed"]
  ];

  for (const event of events) {
    await run("INSERT INTO events (title, date, image_url, description, status) VALUES (?, ?, ?, ?, ?)", event);
  }
}

async function seedTeam() {
  const members = [
    ["Emmanuel S. Johnson", "CEO & Founder", "Leads LDI's mission to make technology information accessible, useful, and inspiring across Liberia.", images.team1, "https://linkedin.com", "https://x.com"],
    ["Grace N. Cooper", "Podcast Host", "Hosts conversations with innovators, educators, founders, and young digital leaders.", images.team2, "https://linkedin.com", "https://x.com"],
    ["Samuel T. Kollie", "CTO", "Guides platform strategy, digital tools, and technical systems for LDI media and training programs.", images.team3, "https://linkedin.com", "https://x.com"],
    ["Miatta B. Harris", "Social Media Manager", "Shapes LDI's digital presence, community engagement, and youth-centered storytelling.", images.team4, "https://linkedin.com", "https://x.com"]
  ];

  for (const member of members) {
    await run(
      "INSERT INTO team_members (name, position, bio, photo_url, linkedin, twitter) VALUES (?, ?, ?, ?, ?, ?)",
      member
    );
  }
}

async function seedGallery() {
  const items = [
    ["Digital Skills Training", "Training", images.training, "Students practicing digital productivity and creative tools."],
    ["Podcast Studio Session", "Media", images.podcast, "LDI podcast interview with a local technology founder."],
    ["Startup Founder Meetup", "Startup", images.startup, "Young entrepreneurs sharing product ideas and community needs."],
    ["Community Awareness Visit", "Outreach", images.outreach, "LDI team engaging communities on safe and productive technology use."],
    ["Tech News Desk", "Media", images.news, "Editorial coverage of Liberia's growing digital economy."],
    ["Coding Workshop", "Training", images.code, "Introductory web and software development learning session."]
  ];

  for (const item of items) {
    await run("INSERT INTO gallery (title, category, image_url, description) VALUES (?, ?, ?, ?)", item);
  }
}

async function seedPartners() {
  const partners = [
    ["Liberia Innovation Hub", "https://dummyimage.com/300x140/7A1022/ffffff&text=LIH", "A collaborator supporting startup education, networking, and innovation programming.", "https://example.com"],
    ["Monrovia Tech Community", "https://dummyimage.com/300x140/F97316/111111&text=MTC", "A community partner for events, mentorship, and technology awareness.", "https://example.com"],
    ["Future Girls Liberia", "https://dummyimage.com/300x140/111113/ffffff&text=FGL", "A youth empowerment partner focused on girls, skills, and digital confidence.", "https://example.com"],
    ["Digital Business Network", "https://dummyimage.com/300x140/f7f8fa/7A1022&text=DBN", "A partner helping technology businesses gain visibility and trusted media coverage.", "https://example.com"]
  ];

  for (const partner of partners) {
    await run("INSERT INTO partners (name, logo_url, description, website) VALUES (?, ?, ?, ?)", partner);
  }
}

async function main() {
  await reset();
  await seedUsers();
  await seedBlogPosts();
  await seedEvents();
  await seedTeam();
  await seedGallery();
  await seedPartners();
  console.log("LDI database seeded successfully.");
  db.close();
}

main().catch((error) => {
  console.error(error);
  db.close();
  process.exit(1);
});
