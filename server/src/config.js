import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Resolve from this module so root and workspace commands use the same file.
dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });

const port = Number(process.env.PORT || 5050);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be an integer between 1 and 65535.");
}

export const config = {
  port,
  host: process.env.HOST?.trim() || "0.0.0.0",
  clientOrigins: (process.env.CLIENT_ORIGIN ?? "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "ldi-dev-secret",
};
