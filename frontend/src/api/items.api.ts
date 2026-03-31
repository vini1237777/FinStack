import api from "./axios";

export const itemsApi = {
  getAll: () => api.get("/masters/items"),
  create: (data: any) => api.post("/masters/items", data),
  deleteOne: (id: string) => api.delete(`/masters/items/${id}`),
  getCategories: () => api.get("/masters/categories"),
};
export default itemsApi;
