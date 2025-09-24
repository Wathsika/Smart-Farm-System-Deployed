// src/context/AuthContext.jsx
import React, {
   createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
  useMemo,
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

const login = useCallback(({ token, user }) => {
    // guard against malformed responses
    if (!token || !user) throw new Error("Malformed login response");
    storageAuth.login({ token, user }); // persist
    setUser(user);
    setToken(token);
}, []);

  const logout = useCallback(() => {
    storageAuth.logout();
    setUser(null);
    setToken(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    setUser((prev) => {
      const resolved =
        typeof nextUser === "function" ? nextUser(prev) : nextUser;

      if (resolved === undefined) {
        return prev;
      }

      storageAuth.updateUser(resolved);
      return resolved;
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
      updateUser,
    }),
     [user, token, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
