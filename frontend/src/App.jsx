import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";

// --- PUBLIC-FACING PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import LoginPage from "./pages/Login"; 
import UserProfilePage from "./pages/UserProfile";
import CheckoutPage from "./pages/checkout";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderSuccessPage from './pages/store/OrderSuccessPage';
import OrderCancelPage from './pages/store/OrderCancelPage';

// --- ADMIN PAGES (Lazy Loading for performance) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));
import AdminProductsPage from "./pages/store/Products";
import AdminOrdersPage from "./pages/store/Orders";
import AdminDiscountsPage from "./admin/DiscountsPage";

// --- Simple Placeholder Pages ---
// These are useful to keep your routes working while pages are being built.
const FarmDashboard = () => <div className="p-6">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6">Livestock Management</div>;
const CropPage = () => <div className="p-6">Crop Management</div>;
const StaffPage = () => <div className="p-6">Staff Management</div>;
const RevenuePage = () => <div className="p-6">Revenue & Financials</div>;
const CustomersPage = () => <div className="p-6">Customer Management</div>;
const ReportsPage = () => <div className="p-6">Store Reports</div>;

// --- Main App Component ---
export default function App() {
  return (
    <Routes>
      
      {/* === PUBLIC ROUTES (Wrapped with standard Header/Footer) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<LoginPage />} />

        {/* These pages are for users, but are accessible without auth guards for now */}
        <Route path="/profile" element={<UserProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} /> 
        <Route path="/my-orders" element={<MyOrdersPage />} />
        
        {/* Order completion pages also use the main layout */}
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      
      {/* === ADMIN ROUTES (Wrapped with special AdminLayout) === */}
      {/* No authentication is applied to these routes for now. */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center">Loading Admin...</div>}>
            <AdminLayout />
          </Suspense>
        }
      >
        <Route index element={<FarmDashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="revenue" element={<RevenuePage />} />
        
        {/* --- Nested Admin Store Routes --- */}
        <Route path="store/dashboard" element={<Suspense fallback={<div>Loading...</div>}><StoreDashboard /></Suspense>} />
        <Route path="store/products" element={<AdminProductsPage />} />
        <Route path="store/orders" element={<AdminOrdersPage />} />
        <Route path="store/discounts" element={<AdminDiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<ReportsPage />} />
      </Route>

      
      {/* === FALLBACK ROUTE (Catches any unmatched URL and redirects to Home) === */}
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  );
}