import axios from "axios";

// Backend API manzilini shu yerda yoki .env faylida VITE_API_BASE_URL orqali sozlang
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

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
