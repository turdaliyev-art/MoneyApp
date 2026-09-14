import api from "./api";
import { filterByCurrentUser, normalizeGoal, serializeGoal } from "./serializers";

const goalsService = {
  create: (data) => api.post("/goals", serializeGoal(data)),
  getAll: () => api.get("/goals").then((res) => ({ ...res, data: filterByCurrentUser(res.data.map(normalizeGoal)) })),
  getById: (id) => api.get(`/goals/${id}`).then((res) => ({ ...res, data: normalizeGoal(res.data) })),
  update: (id, data) => api.put(`/goals/${id}`, serializeGoal(data)),
  remove: (id) => api.delete(`/goals/${id}`),
};

export default goalsService;
