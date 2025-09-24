// src/lib/api.js
import axios from "axios";
import { auth } from "./auth";

export const api = axios.create({
  baseURL: "http://localhost:5001/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const pickValidationErrors = (data) => {
  if (!data || typeof data !== "object") return null;
  if (data.errors && typeof data.errors === "object") return data.errors;
  if (data.error && typeof data.error === "object") return data.error;
  return null;
};

class ApiError extends Error {
  constructor(message, { status, errors } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors ?? null;
  }
}

const toApiError = (error) => {
  if (axios.isAxiosError(error)) {
    const { response, message: fallbackMessage } = error;
    const status = response?.status;
    const data = response?.data;
    const message =
      (typeof data?.message === "string" && data.message) ||
      (typeof data?.error === "string" && data.error) ||
      fallbackMessage ||
      "Request failed";

    return new ApiError(message, {
      status,
      errors: pickValidationErrors(data),
    });
  }

  return new ApiError(error?.message || "Request failed");
};

export { ApiError };

export const updateProfile = async (payload) => {
  try {
    const { data } = await api.put("/auth/profile", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const updateProfilePassword = async (payload) => {
  try {
    const { data } = await api.put("/auth/profile/password", payload);
    return data;
  } catch (error) {
    throw toApiError(error);
  }
};