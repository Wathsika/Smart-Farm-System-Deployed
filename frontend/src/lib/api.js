// src/lib/api.js
import axios from "axios";
import { auth } from "./auth"; // Import the auth helper

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api",
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    const token = auth.token;
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);