export const resourceConfig = {
  posts: {
    title: "Blog Posts",
    endpoint: "/blog-posts",
    columns: ["title", "category", "author", "date"],
    required: ["title", "category", "author", "date", "summary", "content"],
    fields: [
      ["title", "Title"],
      ["slug", "Slug"],
      ["category", "Category"],
      ["author", "Author"],
      ["date", "Date", "date"],
      ["image_url", "Featured Image URL", "url"],
      ["summary", "Short Summary", "textarea"],
      ["content", "Full Content", "textarea"]
    ]
  },
  events: {
    title: "Programs & Events",
    endpoint: "/events",
    columns: ["title", "date", "status"],
    required: ["title", "date", "description", "status"],
    fields: [
      ["title", "Title"],
      ["date", "Date", "date"],
      ["image_url", "Image URL", "url"],
      ["status", "Status", "select", ["Upcoming", "Ongoing", "Completed"]],
      ["description", "Short Description", "textarea"]
    ]
  },
  team: {
    title: "Team Members",
    endpoint: "/team-members",
    columns: ["name", "position"],
    required: ["name", "position", "bio"],
    fields: [
      ["name", "Full Name"],
      ["position", "Position"],
      ["photo_url", "Photo URL", "url"],
      ["bio", "Short Bio", "textarea"],
      ["linkedin", "LinkedIn URL", "url"],
      ["twitter", "Twitter / X URL", "url"]
    ]
  },
  gallery: {
    title: "Gallery",
    endpoint: "/gallery",
    columns: ["title", "category"],
    required: ["title", "category"],
    fields: [
      ["title", "Title"],
      ["category", "Category"],
      ["image_url", "Image URL", "url"],
      ["description", "Description", "textarea"]
    ]
  },
  partners: {
    title: "Partners",
    endpoint: "/partners",
    columns: ["name", "website"],
    required: ["name", "description"],
    fields: [
      ["name", "Partner Name"],
      ["logo_url", "Logo URL", "url"],
      ["description", "Description", "textarea"],
      ["website", "Website", "url"]
    ]
  },
  messages: {
    title: "Contact Messages",
    endpoint: "/contact-messages",
    columns: ["name", "email", "subject", "created_at"],
    readOnly: true,
    fields: []
  }
};
