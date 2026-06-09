import express from "express";
import { all, run } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { requiredFields } from "../utils.js";

export const contactRouter = express.Router();

contactRouter.post("/contact", async (req, res, next) => {
  try {
    const missing = requiredFields(req.body, ["name", "email", "subject", "message"]);
    if (missing.length) return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });

    const { name, email, phone = "", subject, message } = req.body;
    await run(
      "INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone, subject, message]
    );
    return res.status(201).json({ message: "Message received. Our team will respond soon." });
  } catch (error) {
    return next(error);
  }
});

contactRouter.get("/contact-messages", requireAuth, async (_req, res, next) => {
  try {
    const messages = await all("SELECT * FROM contact_messages ORDER BY created_at DESC");
    return res.json(messages);
  } catch (error) {
    return next(error);
  }
});

contactRouter.delete("/contact-messages/:id", requireAuth, async (req, res, next) => {
  try {
    await run("DELETE FROM contact_messages WHERE id = ?", [req.params.id]);
    return res.json({ message: "Message deleted." });
  } catch (error) {
    return next(error);
  }
});
