import axios from "axios";

// VITE_API_URL domen bo'lsa, backend API prefiksini avtomatik qo'shamiz.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
export const BASE_URL = API_URL.replace(/\/$/, "").endsWith("/api")
  ? API_URL.replace(/\/$/, "")
  : `${API_URL.replace(/\/$/, "")}/api`;

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

// So'rov yuborishdan oldin tokenni header'ga qo'shish
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pn_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Javoblarni ushlab, 401 bo'lsa foydalanuvchini chiqarib yuborish
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("pn_token");
      localStorage.removeItem("pn_user");
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
