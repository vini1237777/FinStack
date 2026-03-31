import { createContext, useContext, useState, type ReactNode } from "react";
import { authApi } from "../api/auth.api";

interface User {
  name: string;
  userId: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

/* eslint-disable react-refresh/only-export-components */

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    const { token, user } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      }),
    );

    setToken(token);
    setUser({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
