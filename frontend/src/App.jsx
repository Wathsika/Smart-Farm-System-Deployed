import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/checkout";
import Storefront from "./pages/Storefront";
import OrderSuccessPage from './pages/store/OrderSuccessPage';
import OrderCancelPage from './pages/store/OrderCancelPage';

// --- ADMIN PAGES (Lazy Loaded & Direct Imports) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// --- REAL ADMIN STORE PAGES ---
import AdminProducts from "./pages/store/Products";
import AdminOrders from "./pages/store/Orders";

// --- PLACEHOLDER COMPONENTS ---
// These are simple, non-lazy components, so they don't need Suspense
const FarmDashboard = () => <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6 text-2xl font-bold">Livestock Management</div>;
const CropPage = () => <div className="p-6 text-2xl font-bold">Crop Management</div>;
const StaffPage = () => <div className="p-6 text-2xl font-bold">Staff Management</div>;
const RevenuePage = () => <div className="p-6 text-2xl font-bold">Revenue & Financials</div>;
const DiscountsPage = () => <div className="p-6 text-2xl font-bold">Discount Management</div>;
const CustomersPage = () => <div className="p-6 text-2xl font-bold">Customer Management</div>;
const ReportsPage = () => <div className="p-6 text-2xl font-bold">Store Reports</div>;

export default function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES (Wrapped with Header/Footer via Layout) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        
        {/* --- THIS IS THE FIX --- */}
        {/* The order completion pages should also have the main layout */}
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      {/* --- Stripe Redirect Routes (No Layout) --- */}
      <Route path="/order/success" element={<OrderSuccessPage />} />
      <Route path="/order/cancel" element={<OrderCancelPage />} />

      {/* === ADMIN ROUTES (all nested under AdminLayout) === */}
      <Route
        path="/admin"
        element={
          // CORRECTED: Provide a valid JSX element for the fallback prop
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-lg">Loading Admin Interface...</div>}>
            <AdminLayout />
          </Suspense>
        }
      >
        {/* The index and other simple routes don't need Suspense because their components are not lazy-loaded */}
        <Route index element={<FarmDashboard />} />
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* Store management pages */}
        <Route
          path="store/dashboard"
          element={
            // CORRECTED: Provide a valid JSX element for the fallback prop
            <Suspense fallback={<div className="p-6">Loading Store Dashboard…</div>}>
              <StoreDashboard />
            </Suspense>
          }
        />
        <Route path="store/products" element={<AdminProducts />} />
        <Route path="store/orders" element={<AdminOrders />} />
        <Route path="store/discounts" element={<DiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<ReportsPage />} />
      </Route>

      {/* === 404 FALLBACK ROUTE === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}