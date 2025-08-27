import axios from "axios";

const ORIGIN = window.location.origin.replace(/\/+$/, "");
const BASE = (import.meta.env.VITE_API_URL || ORIGIN + "/api").replace(/\/+$/, "");

const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
