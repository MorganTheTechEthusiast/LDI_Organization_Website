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

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, clientDir, ""), ...process.env };
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
