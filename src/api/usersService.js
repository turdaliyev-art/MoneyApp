import api from "./api";
import { normalizeUser, serializeUser } from "./serializers";

const usersService = {
  register: (data) => api.post("/users", serializeUser(data)),
  login: (data) => api.post("/users/login", data),
  getAll: () => api.get("/users").then((res) => ({ ...res, data: res.data.map(normalizeUser) })),
  search: (query) => api.get("/users/search", { params: { query } }),
  getById: (id) => api.get(`/users/${id}`).then((res) => ({ ...res, data: normalizeUser(res.data) })),
  update: (id, data) => api.put(`/users/${id}`, serializeUser(data)),
  remove: (id) => api.delete(`/users/${id}`),
};

export default usersService;
