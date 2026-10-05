import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

const clientDir = fileURLToPath(new URL(".", import.meta.url));

function portNumber(value, fallback, name) {
  const port = Number(value || fallback);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`${name} must be an integer between 1 and 65535.`);
  }
  return port;
}

export default defineConfig(({ mode, command }) => {
  const env = { ...loadEnv(mode, clientDir, ""), ...process.env };
  // A hostname without a protocol becomes a path on the frontend domain.
  // Catch this during builds instead of shipping broken API requests.
  if (command === "build") {
    const apiUrl = env.VITE_API_URL?.trim();
    if (apiUrl && !/^\/(?!\/)/.test(apiUrl)) {
      let valid = false;
      try {
        const url = new URL(apiUrl);
        valid = /^https?:\/\//i.test(apiUrl) &&
          ["http:", "https:"].includes(url.protocol) && Boolean(url.hostname);
      } catch {
        // Report a configuration error without exposing the supplied value.
      }
      if (!valid) {
        throw new Error(
          "VITE_API_URL must be an absolute http:// or https:// URL (including /api), or a root-relative path such as /api. Update the frontend environment variable and rebuild."
        );
      }
    }
  }
  const allowedHosts = (env.ALLOWED_HOSTS || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  const proxy = { "/api": env.API_PROXY_TARGET || "http://127.0.0.1:5050" };

  return {
    plugins: [react()],
    server: {
      host: env.HOST || "localhost",
      port: portNumber(env.CLIENT_PORT, 5173, "CLIENT_PORT"),
      strictPort: true,
      allowedHosts,
      proxy,
    },
    preview: {
      host: env.HOST || "0.0.0.0",
      port: portNumber(env.PORT || env.PREVIEW_PORT, 4173, "PORT / PREVIEW_PORT"),
      strictPort: true,
      allowedHosts,
      proxy,
    },
  };
});
