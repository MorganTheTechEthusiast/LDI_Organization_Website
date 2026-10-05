import cors from "cors";
import { config } from "./config.js";
import express from "express";
import morgan from "morgan";
import { closeDb, initDb } from "./db.js";
import { authRouter } from "./routes/auth.js";
import { contactRouter } from "./routes/contact.js";
import { crudRouter } from "./routes/crud.js";

const app = express();
const { port, host } = config;

function normalizeOrigin(origin) {
  return origin?.trim().replace(/\/$/, "");
}

const allowedOrigins = new Set(config.clientOrigins);

const corsOptions = {
  origin(origin, callback) {
    const normalizedOrigin = normalizeOrigin(origin);
    if (
      !normalizedOrigin ||
      allowedOrigins.has(normalizedOrigin)
    ) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", organization: "Liberia Digital Insights" });
});

app.use("/api/auth", authRouter);
app.use("/api", crudRouter);
app.use("/api", contactRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.code === "SQLITE_CONSTRAINT") {
    return res
      .status(409)
      .json({
        message:
          "That record conflicts with existing content. Please change the title or slug and try again.",
      });
  }
  return res
    .status(500)
    .json({ message: "Something went wrong on the server." });
});

initDb()
  .then(() => {
    const server = app.listen(port, host, () => {
      console.log(`LDI API running on port ${port}`);
    });

    server.on("error", async (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${port} is already in use. Stop the other process or start this server with a different PORT.`
        );
      } else {
        console.error("Server failed to start.");
        console.error(error);
      }

      await closeDb().catch((closeError) => {
        console.error("Failed to close database connection after startup error.");
        console.error(closeError);
      });
      process.exit(1);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database. Server did not start.");
    console.error(error);
    process.exit(1);
  });
