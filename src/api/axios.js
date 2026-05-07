import axios from "axios";

const baseURL =
  typeof window !== "undefined" && window.location.port === "5173"
    ? "http://localhost:3500/api"
    : "/api";

const api = axios.create({
  baseURL,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
