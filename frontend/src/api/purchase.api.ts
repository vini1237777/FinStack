import api from "./axios";

export const purchaseApi = {
  getAll: () => api.get("/purchase/invoices"),
  create: (data: any) => api.post("/purchase/invoices", data),
};
