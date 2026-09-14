import api from "./api";
import { filterByCurrentUser, normalizeDebt, serializeDebt } from "./serializers";

const debtsService = {
  create: (data) => api.post("/debts", serializeDebt(data)),
  getAll: () => api.get("/debts").then((res) => ({ ...res, data: filterByCurrentUser(res.data.map(normalizeDebt)) })),
  getById: (id) => api.get(`/debts/${id}`).then((res) => ({ ...res, data: normalizeDebt(res.data) })),
  update: (id, data) => api.put(`/debts/${id}`, serializeDebt(data)),
  remove: (id) => api.delete(`/debts/${id}`),
};

export default debtsService;
