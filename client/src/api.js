import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://ldi-backend.up.railway.app/api" : "/api")
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ldi_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const endpoints = {
  posts: "/blog-posts",
  events: "/events",
  team: "/team-members",
  gallery: "/gallery",
  partners: "/partners",
  messages: "/contact-messages"
};
