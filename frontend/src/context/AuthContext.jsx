// src/context/AuthContext.jsx
import React, {
  createContext, useState, useContext, useEffect, useMemo,
} from "react";
import { auth as storageAuth } from "../lib/auth"; // localStorage helper

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  // hydrate from localStorage on first render
  const [user, setUser]   = useState(storageAuth.user);
  const [token, setToken] = useState(storageAuth.token);

  // keep other tabs/windows in sync
  useEffect(() => {
    const onStorage = () => {
      setUser(storageAuth.user);
      setToken(storageAuth.token);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = ({ token, user }) => {
    // guard against malformed responses
    if (!token || !user) throw new Error("Malformed login response");
    storageAuth.login({ token, user }); // persist
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    storageAuth.logout();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [user, token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
