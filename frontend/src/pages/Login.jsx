// src/pages/Login.jsx
import React, { useState } from "react";
//import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";
import { auth } from "../lib/auth";

export default function Login() {
  const [email, setEmail] = useState("admin@farm.com");
  const [password, setPassword] = useState("Adm1n@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  //const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      auth.login({ token: data.token, user: data.user });
      
      // Navigate based on user role
     if (data.user.role === 'Admin') {
        window.location.href = "/admin"; // navigate("/admin") වෙනුවට
      } else if (data.user.role === 'Employee') {
        window.location.href = "/dashboard"; // navigate("/dashboard") වෙනුවට
      } else {
        window.location.href = "/"; // navigate("/") වෙනුවට
      }

    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-16rem)] bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800">Admin Login</h2>
        
        {error && (
          <div className="p-3 text-sm text-red-800 bg-red-100 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="admin@farm.com"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}