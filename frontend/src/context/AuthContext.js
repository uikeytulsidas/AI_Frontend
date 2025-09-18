import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [tokens, setTokens] = useState(() =>
    localStorage.getItem("tokens") ? JSON.parse(localStorage.getItem("tokens")) : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("user") || null
  );

  useEffect(() => {
    if (tokens) {
      localStorage.setItem("tokens", JSON.stringify(tokens));
    }
    if (user) {
      localStorage.setItem("user", user);
    }
  }, [tokens, user]);

  const logout = () => {
    setTokens(null);
    setUser(null);
    localStorage.removeItem("tokens");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ tokens, setTokens, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
