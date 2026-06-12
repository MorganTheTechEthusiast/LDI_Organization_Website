import express from "express";
import { all, get, run } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requiredFields, slugify } from "../utils.js";

const tableConfig = {
  "blog-posts": {
    table: "blog_posts",
    fields: ["title", "slug", "category", "author", "date", "image_url", "summary", "content"],
    required: ["title", "category", "author", "date", "summary", "content"],
    defaults: { image_url: "https://dummyimage.com/1200x800/7A1022/ffffff&text=Liberia+Digital+Insights" },
    order: "date DESC, id DESC",
    bySlug: true
  },
  events: {
    table: "events",
    fields: ["title", "date", "image_url", "description", "status"],
    required: ["title", "date", "description", "status"],
    defaults: { image_url: "https://dummyimage.com/1200x800/F97316/111111&text=LDI+Event" },
    order: "date DESC, id DESC"
  },
  videos: {
    table: "video_interviews",
    fields: ["title", "slug", "category", "guest_name", "guest_title", "date", "thumbnail_url", "video_url", "summary", "description"],
    required: ["title", "category", "guest_name", "date", "video_url", "summary"],
    defaults: { thumbnail_url: "https://dummyimage.com/1200x675/7A1022/ffffff&text=LDI+Video+Interview" },
    order: "date DESC, id DESC",
    bySlug: true
  },
  "team-members": {
    table: "team_members",
    fields: ["name", "position", "bio", "photo_url", "linkedin", "twitter"],
    required: ["name", "position", "bio"],
    defaults: { photo_url: "https://dummyimage.com/800x800/111113/ffffff&text=LDI+Team" },
    order: "id ASC"
  },
  gallery: {
    table: "gallery",
    fields: ["title", "category", "image_url", "description"],
    required: ["title", "category"],
    defaults: { image_url: "https://dummyimage.com/1200x800/7A1022/ffffff&text=LDI+Gallery" },
    order: "id DESC"
  },
  partners: {
    table: "partners",
    fields: ["name", "logo_url", "description", "website"],
    required: ["name", "description"],
    defaults: { logo_url: "https://dummyimage.com/300x140/7A1022/ffffff&text=LDI+Partner" },
    order: "id ASC"
  }
};

export const crudRouter = express.Router();

function applyDefaults(body, defaults = {}) {
  for (const [field, value] of Object.entries(defaults)) {
    if (!body[field] || String(body[field]).trim() === "") body[field] = value;
  }
}

async function uniqueSlug(table, title, currentId = null) {
  const base = slugify(title || "ldi-story") || "ldi-story";
  let candidate = base;
  let suffix = 2;

  while (true) {
    const row = currentId
      ? await get(`SELECT id FROM ${table} WHERE slug = ? AND id != ?`, [candidate, currentId])
      : await get(`SELECT id FROM ${table} WHERE slug = ?`, [candidate]);
    if (!row) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

for (const [path, config] of Object.entries(tableConfig)) {
  crudRouter.get(`/${path}`, async (_req, res, next) => {
    try {
      const rows = await all(`SELECT * FROM ${config.table} ORDER BY ${config.order}`);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  });

  crudRouter.get(`/${path}/:identifier`, async (req, res, next) => {
    try {
      const column = config.bySlug && Number.isNaN(Number(req.params.identifier)) ? "slug" : "id";
      const row = await get(`SELECT * FROM ${config.table} WHERE ${column} = ?`, [req.params.identifier]);
      if (!row) return res.status(404).json({ message: "Record not found." });
      return res.json(row);
    } catch (error) {
      return next(error);
    }
  });

  crudRouter.post(`/${path}`, requireAuth, async (req, res, next) => {
    try {
      applyDefaults(req.body, config.defaults);
      if (config.bySlug) req.body.slug = await uniqueSlug(config.table, req.body.slug || req.body.title);
      const missing = requiredFields(req.body, config.required);
      if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });

      const values = config.fields.map((field) => req.body[field] || "");
      const placeholders = config.fields.map(() => "?").join(", ");
      const result = await run(
        `INSERT INTO ${config.table} (${config.fields.join(", ")}) VALUES (${placeholders})`,
        values
      );
      const created = await get(`SELECT * FROM ${config.table} WHERE id = ?`, [result.id]);
      return res.status(201).json(created);
    } catch (error) {
      return next(error);
    }
  });

  crudRouter.put(`/${path}/:id`, requireAuth, async (req, res, next) => {
    try {
      applyDefaults(req.body, config.defaults);
      if (config.bySlug) req.body.slug = await uniqueSlug(config.table, req.body.slug || req.body.title, req.params.id);
      const missing = requiredFields(req.body, config.required);
      if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });

      const assignments = config.fields.map((field) => `${field} = ?`).join(", ");
      const values = config.fields.map((field) => req.body[field] || "");
      await run(`UPDATE ${config.table} SET ${assignments} WHERE id = ?`, [...values, req.params.id]);
      const updated = await get(`SELECT * FROM ${config.table} WHERE id = ?`, [req.params.id]);
      return res.json(updated);
    } catch (error) {
      return next(error);
    }
  });

  crudRouter.delete(`/${path}/:id`, requireAuth, async (req, res, next) => {
    try {
      await run(`DELETE FROM ${config.table} WHERE id = ?`, [req.params.id]);
      return res.json({ message: "Record deleted." });
    } catch (error) {
      return next(error);
    }
  });
}
