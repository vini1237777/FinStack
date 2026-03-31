import api from "./axios";

export const authApi = {
  login: (email: string, password: string) => {
    return api.post("/auth/login", { email, password });
  },

  register: (name: string, email: string, password: string) => {
    return api.post("/auth/register", {
      email,
      name,
      password,
    });
  },
};
