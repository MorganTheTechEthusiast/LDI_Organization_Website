import bcrypt from "bcryptjs";
import { closeDb, initDb, run } from "./db.js";

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
  await run("DELETE FROM trainings");
  await run("DELETE FROM opportunities");
  await run("DELETE FROM video_interviews");
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

async function seedVideos() {
  const videos = [
    {
      title: "Inside Liberia's Digital Media Future",
      slug: "inside-liberias-digital-media-future",
      category: "Video Interview",
      guest_name: "Emmanuel S. Johnson",
      guest_title: "Founder, Liberia Digital Insights",
      date: "2026-05-30",
      thumbnail_url: images.podcast,
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      summary: "A conversation on technology storytelling, digital inclusion, and how media can accelerate Liberia's innovation ecosystem.",
      description:
        "In this LDI video interview, we discuss the role of media in helping young Liberians understand technology, discover opportunities, and build confidence in the digital era."
    },
    {
      title: "Youth Skills, Startups, and Liberia's Tech Opportunity",
      slug: "youth-skills-startups-and-liberias-tech-opportunity",
      category: "Startup Conversation",
      guest_name: "Grace N. Cooper",
      guest_title: "Podcast Host and Digital Storyteller",
      date: "2026-05-21",
      thumbnail_url: images.training,
      video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      summary: "A practical discussion about digital skills, youth empowerment, and startup visibility in Liberia.",
      description:
        "This interview explores how training, storytelling, and community awareness can help young people and founders participate more actively in Liberia's digital economy."
    }
  ];

  for (const video of videos) {
    await run(
      `INSERT INTO video_interviews (title, slug, category, guest_name, guest_title, date, thumbnail_url, video_url, summary, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [video.title, video.slug, video.category, video.guest_name, video.guest_title, video.date, video.thumbnail_url, video.video_url, video.summary, video.description]
    );
  }
}

async function seedTrainings() {
  const trainings = [
    {
      title: "Girls in Tech Digital Skills Training",
      slug: "girls-in-tech-digital-skills-training",
      course: "Digital Literacy, Online Safety, Canva, Content Creation, and Intro to Web Tools",
      location: "Monrovia, Liberia",
      start_date: "2026-07-12",
      duration: "4 weeks",
      image_url: images.training,
      description:
        "A practical training program designed to help girls and young women build confidence with digital tools, online safety, creative content, and technology career pathways.",
      registration_url: "https://forms.gle/example",
      status: "Upcoming",
      featured: 1
    },
    {
      title: "High School Technology Awareness Bootcamp",
      slug: "high-school-technology-awareness-bootcamp",
      course: "Technology Careers, Responsible Internet Use, Productivity Tools, and Innovation Mindset",
      location: "Partner high schools across Montserrado",
      start_date: "2026-08-03",
      duration: "2 days per school",
      image_url: images.outreach,
      description:
        "A school-based awareness bootcamp introducing students to digital careers, technology opportunities, safe internet habits, and problem-solving with modern tools.",
      registration_url: "https://forms.gle/example",
      status: "Upcoming",
      featured: 0
    }
  ];

  for (const training of trainings) {
    await run(
      `INSERT INTO trainings (title, slug, course, location, start_date, duration, image_url, description, registration_url, status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        training.title,
        training.slug,
        training.course,
        training.location,
        training.start_date,
        training.duration,
        training.image_url,
        training.description,
        training.registration_url,
        training.status,
        training.featured
      ]
    );
  }
}

async function seedOpportunities() {
  const opportunities = [
    ["Google Africa Developer Scholarship", "google-africa-developer-scholarship", "Scholarships", "Google", "A learning opportunity for aspiring developers to build practical skills through structured online courses and community support.", "2026-08-15", "Online", images.code, "https://grow.google/intl/africa/", "Open", 1],
    ["LDI Creator Bootcamp", "ldi-creator-bootcamp", "Training", "Liberia Digital Insights", "A practical program for young creators learning content strategy, digital storytelling, personal branding, and responsible media production.", "2026-07-30", "Monrovia, Liberia", images.podcast, "/contact", "Open", 0],
    ["Youth Innovation Challenge", "youth-innovation-challenge", "Competitions", "LDI Community", "Bring a technology idea that responds to a real community need and connect with peers, mentors, and ecosystem supporters.", "2026-09-05", "Monrovia, Liberia", images.startup, "/contact", "Open", 0],
    ["Digital Skills Internship Pathway", "digital-skills-internship-pathway", "Internships", "LDI Partners", "A pathway for emerging digital professionals to gain hands-on experience in media, communications, design, and technology projects.", "2026-08-20", "Monrovia, Liberia", images.training, "/contact", "Closing Soon", 0],
    ["Technology Community Events", "technology-community-events", "Events", "Liberia Tech Ecosystem", "Find conversations, workshops, meetups, and public technology events happening across Liberia's growing digital ecosystem.", "2026-10-01", "Liberia", images.outreach, "/contact", "Open", 0]
  ];

  for (const opportunity of opportunities) {
    await run(
      `INSERT INTO opportunities (title, slug, category, organization, description, deadline, location, image_url, opportunity_url, status, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      opportunity
    );
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
  await seedVideos();
  await seedTrainings();
  await seedOpportunities();
  await seedTeam();
  await seedGallery();
  await seedPartners();
  console.log("LDI database seeded successfully.");
  await closeDb();
}

main().catch((error) => {
  console.error(error);
  closeDb().finally(() => process.exit(1));
});
