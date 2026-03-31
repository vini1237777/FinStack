import api from "./axios";

export const expensesApi = {
  getAll: () => api.get("/expenses"),
  create: (data: any) => api.post("/expenses", data),
};
