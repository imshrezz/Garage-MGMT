// src/lib/axios.ts
import axios from "axios";
import { toast } from "sonner";
const api = axios.create({
  baseURL: "http://localhost:5000/api", // change to your backend URL
  withCredentials: true, // if using cookies or auth headers
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("garage_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("garage_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
