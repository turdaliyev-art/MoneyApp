import api from "./api";
import { filterByCurrentUser, normalizeWallet, serializeWallet } from "./serializers";

const walletsService = {
  create: (data) => api.post("/wallets", serializeWallet(data)),
  getAll: () => api.get("/wallets").then((res) => ({ ...res, data: filterByCurrentUser(res.data.map(normalizeWallet)) })),
  getById: (id) => api.get(`/wallets/${id}`).then((res) => ({ ...res, data: normalizeWallet(res.data) })),
  update: (id, data) => api.put(`/wallets/${id}`, serializeWallet(data)),
  remove: (id) => api.delete(`/wallets/${id}`),
};

export default walletsService;
