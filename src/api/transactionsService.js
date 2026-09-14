import api from "./api";
import { filterByCurrentUser, normalizeTransaction, serializeTransaction } from "./serializers";

const transactionsService = {
  create: (data) => api.post("/transactions", serializeTransaction(data)),
  getAll: () => api.get("/transactions").then((res) => ({ ...res, data: filterByCurrentUser(res.data.map(normalizeTransaction)) })),
  getById: (id) => api.get(`/transactions/${id}`).then((res) => ({ ...res, data: normalizeTransaction(res.data) })),
  update: (id, data) => api.put(`/transactions/${id}`, serializeTransaction(data)),
  remove: (id) => api.delete(`/transactions/${id}`),
};

export default transactionsService;
