// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "./context/AuthContext";
import Layout from "./components/common/Layout";

// Public
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import LoginPage from "./pages/Login";

// Private (still protected)
import UserProfilePage from "./pages/UserProfile";
import CheckoutPage from "./pages/checkout";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderSuccessPage from "./pages/store/OrderSuccessPage";
import OrderCancelPage from "./pages/store/OrderCancelPage";

// --- ADMIN PAGES (UNPROTECTED for development) ---
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import StoreDashboard from "./admin/StoreDashboard";
import AdminOrdersPage from "./pages/store/Orders";
import AdminDiscountsPage from "./admin/DiscountsPage";
import FinanceOverview from "./admin/FinanceOverview";
import FinanceTransaction from "./admin/FinanceTransaction";
import FinanceNewTransaction from "./admin/FinanceNewTransaction";
import StaffAttendance from "./admin/StaffAttendance";
import LeaveManagement from "./admin/LeaveManagement";

/* --------- Route Guards (user area only) --------- */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/profile" replace />;
  return children;
};

/* ---------------------- App ---------------------- */
export default function App() {
  return (
    <Routes>
      {/* Public with site Layout */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
      </Route>

      {/* Private with site Layout (user-only) */}
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      {/* ADMIN — NO AUTH GUARD (for building UI) */}
      <Route path="/admin/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="store/dashboard" element={<StoreDashboard />} />
        <Route path="store/orders" element={<AdminOrdersPage />} />
        <Route path="store/discounts" element={<AdminDiscountsPage />} />
        <Route path="finance/overview" element={<FinanceOverview />} />
        <Route path="finance/transaction" element={<FinanceTransaction />} />
        <Route path="finance/new_transaction" element={<FinanceNewTransaction />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<LeaveManagement />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
