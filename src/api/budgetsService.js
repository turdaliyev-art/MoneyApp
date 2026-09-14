import api from "./api";
import { filterByCurrentUser, normalizeBudget, serializeBudget } from "./serializers";

const budgetsService = {
  create: (data) => api.post("/budgets", serializeBudget(data)),
  getAll: () => api.get("/budgets").then((res) => ({ ...res, data: filterByCurrentUser(res.data.map(normalizeBudget)) })),
  getById: (id) => api.get(`/budgets/${id}`).then((res) => ({ ...res, data: normalizeBudget(res.data) })),
  update: (id, data) => api.put(`/budgets/${id}`, serializeBudget(data)),
  remove: (id) => api.delete(`/budgets/${id}`),
};

export default budgetsService;
