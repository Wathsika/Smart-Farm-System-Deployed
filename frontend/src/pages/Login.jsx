import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { api } from "../lib/api";

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isLoginView) {
        const { data } = await api.post("/auth/login", { email: formData.email, password: formData.password });
        // Expect backend to return: { token, user: { role, ... } }
        const { token, user } = data;
        if (!token || !user) throw new Error("Malformed login response");
        login({ token, user });

        if (user.role === "Admin") {
          navigate("/admin", { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else {
        await api.post("/auth/signup", { fullName: formData.fullName, email: formData.email, password: formData.password });
        alert("Registration successful! Please log in.");
        setIsLoginView(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-14rem)] bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-gray-800">{isLoginView ? 'Welcome Back!' : 'Create an Account'}</h2>
          <p className="text-center text-gray-500 mt-2">{isLoginView ? 'Sign in to continue.' : 'Join us to start shopping.'}</p>
        </div>
        {error && <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="text-sm font-medium text-gray-700">Full Name</label>
              <input name="fullName" type="text" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700">Email Address</label>
            <input name="email" type="email" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input name="password" type="password" onChange={handleChange} className="w-full px-3 py-2 mt-1 border rounded-md" required />
          </div>

          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-3 font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-green-400">
              {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Create Account')}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button onClick={() => setIsLoginView(!isLoginView)} className="text-sm text-green-600 hover:underline">
            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}
