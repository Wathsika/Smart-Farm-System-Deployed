import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../lib/auth'; // Using your teammate's auth helper

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    // Initialize state from the auth helper in localStorage
    const [user, setUser] = useState(auth.user);
    const [token, setToken] = useState(auth.token);
    
    // Create login and logout functions that update both the state and localStorage
    const login = (data) => {
        auth.login(data); // This saves to localStorage
        setUser(data.user);
        setToken(data.token);
    };

    const logout = () => {
        auth.logout(); // This clears localStorage
        setUser(null);
        setToken(null);
    };

    const value = {
        user,
        token,
        isAuthenticated: !!token, // A helpful boolean: true if logged in, false if not
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};