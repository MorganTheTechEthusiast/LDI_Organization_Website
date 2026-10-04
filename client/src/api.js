import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://ldi-backend.up.railway.app/api" : "/api")
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ldi_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || "";
    if (error.response?.status === 401 && !requestUrl.includes("/auth/login")) {
      localStorage.removeItem("ldi_token");
      localStorage.removeItem("ldi_user");
      if (window.location.pathname.startsWith("/admin") && window.location.pathname !== "/admin/login") {
        window.location.assign("/admin/login");
      }
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  posts: "/blog-posts",
  events: "/events",
  videos: "/videos",
  trainings: "/trainings",
  opportunities: "/opportunities",
  team: "/team-members",
  gallery: "/gallery",
  partners: "/partners",
  messages: "/contact-messages"
};
