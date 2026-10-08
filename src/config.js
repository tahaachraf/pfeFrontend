export const IS_LOCAL =
  typeof window !== "undefined" && window.location.port === "5173";

export const API_ORIGIN =
  import.meta.env.VITE_API_URL ||
  (IS_LOCAL ? "http://localhost:3500" : "https://pfebackend-4ylm.onrender.com");

export const API_URL = `${API_ORIGIN}/api`;
export const IMAGE_BASE = `${API_ORIGIN}/api/uploads/`;