import { v2 as cloudinary } from "cloudinary";
import express from "express";
import multer from "multer";
import { requireAuth } from "../middleware/auth.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, file.mimetype.startsWith("image/"))
});

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export const uploadsRouter = express.Router();

uploadsRouter.post("/images", requireAuth, upload.single("image"), async (req, res, next) => {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({ message: "Cloudinary is not configured on the backend." });
    }
    if (!req.file) return res.status(400).json({ message: "Please select an image file." });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ldi", resource_type: "image", use_filename: true, unique_filename: true },
        (error, uploaded) => error ? reject(error) : resolve(uploaded)
      );
      stream.end(req.file.buffer);
    });

    return res.status(201).json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    return next(error);
  }
});

uploadsRouter.post("/payment-proof", upload.single("proof"), async (req, res, next) => {
  try {
    if (!cloudName || !apiKey || !apiSecret) {
      return res.status(503).json({ message: "Payment proof storage is not configured on the backend." });
    }
    if (!req.file) return res.status(400).json({ message: "Please select a payment screenshot." });
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "ldi/payment-proofs", resource_type: "image", type: "authenticated", use_filename: false, unique_filename: true },
        (error, uploaded) => error ? reject(error) : resolve(uploaded)
      );
      stream.end(req.file.buffer);
    });
    return res.status(201).json({ url: cloudinary.url(result.public_id, { secure: true, type: "authenticated", sign_url: true, resource_type: "image" }), public_id: result.public_id });
  } catch (error) {
    return next(error);
  }
});
