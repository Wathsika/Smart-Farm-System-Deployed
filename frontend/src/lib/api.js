// src/lib/api.js
import axios from "axios";
import { auth } from "./auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
});

// Attach token before every request
api.interceptors.request.use((config) => {
  const token = auth.token;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

// Optional: auto logout on 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      auth.logout();
      // Optionally: redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
