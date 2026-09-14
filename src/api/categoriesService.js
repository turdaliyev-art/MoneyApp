import api from "./api";
import { filterByCurrentUser, normalizeCategory, serializeCategory } from "./serializers";

const categoriesService = {
  create: (data) => api.post("/categories", serializeCategory(data)),
  getAll: () => api.get("/categories").then((res) => ({ ...res, data: filterByCurrentUser(res.data.map(normalizeCategory)) })),
  getById: (id) => api.get(`/categories/${id}`).then((res) => ({ ...res, data: normalizeCategory(res.data) })),
  update: (id, data) => api.put(`/categories/${id}`, serializeCategory(data)),
  remove: (id) => api.delete(`/categories/${id}`),
};

export default categoriesService;
