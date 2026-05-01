import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    // Stocker toutes les données (inclut le token JWT si présent)
    localStorage.setItem("user", JSON.stringify(userData));
    // Stocker le token séparément pour les appels API
    if (userData.token) {
      localStorage.setItem("token", userData.token);
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  };

  const isAuthenticated = !!user;

  // Compatibilité pfe/ (_id, email, role) et JWT (id, username, statut)
  const userId   = user?._id   || user?.id;
  const userName = user?.prenom || user?.nom || user?.username;
  const userRole = user?.role   || user?.statut;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, userId, userName, userRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
