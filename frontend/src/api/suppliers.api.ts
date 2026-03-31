import api from "./axios";

export const suppliersApi = {
  getAll: () => api.get("/masters/suppliers"),
  create: (data: any) => api.post("/masters/suppliers", data),
  deleteOne: (id: string) => api.delete(`/masters/suppliers/${id}`),
};
