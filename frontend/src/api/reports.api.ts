import api from "./axios";

export const reportsApi = {
  trialBalance: (fyId: string) => api.get(`/reports/trial-balance/${fyId}`),
  profitLoss: (fyId: string) => api.get(`/reports/profit-loss/${fyId}`),
  gstr3b: (fyId: string) => api.get(`/reports/gstr3b/${fyId}`),
  stockSummary: () => api.get("/reports/stock-summary"),
};
