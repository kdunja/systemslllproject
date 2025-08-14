import axios from "axios";

const BASE = import.meta.env.VITE_API_URL || window.location.origin;
const api = axios.create({
  baseURL: BASE.replace(/\/+$/, ""),
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// auto‑attach token to every request
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export default api;
