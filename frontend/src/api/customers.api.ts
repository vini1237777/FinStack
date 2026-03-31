import api from "./axios";

export const customersApi = {
  getAll: () => api.get("/masters/customers"),
  create: (data: any) => api.post("/masters/customers", data),
  deleteOne: (id: string) => api.delete(`/masters/customers/${id}`),
};

export default customersApi;
