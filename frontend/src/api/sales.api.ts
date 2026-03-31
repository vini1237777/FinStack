import api from "./axios";

export const salesApi = {
  getAll: () => api.get("/sales/invoices"),
  create: (data: any) => api.post("/sales/invoices", data),
  getById: (id: string) => api.get(`/sales/invoices/${id}`),
};
