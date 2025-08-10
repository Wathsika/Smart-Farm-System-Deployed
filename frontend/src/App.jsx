import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import AboutUs from "./pages/aboutus";
import FarmStore from "./pages/Storefront";
import ContactUs from "./pages/contactus";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/checkout";
import Storefront from "./pages/Storefront";

// --- ADMIN PAGES (Lazy Loaded) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
// We rename the import to be more specific. The file is the same,
// but it now represents the *Store's* dashboard.
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// --- PLACEHOLDER COMPONENTS for the new admin pages ---
// You can replace these with your actual page components later.
const FarmDashboard = () => <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6 text-2xl font-bold">Livestock Management</div>;
const CropPage = () => <div className="p-6 text-2xl font-bold">Crop Management</div>;
const StaffPage = () => <div className="p-6 text-2xl font-bold">Staff Management</div>;
const RevenuePage = () => <div className="p-6 text-2xl font-bold">Revenue & Financials</div>;
const ProductsPage = () => <div className="p-6 text-2xl font-bold">Product Management</div>;
const OrdersPage = () => <div className="p-6 text-2xl font-bold">Order Management</div>;
const DiscountsPage = () => <div className="p-6 text-2xl font-bold">Discount Management</div>;
const CustomersPage = () => <div className="p-6 text-2xl font-bold">Customer Management</div>;
const ReportsPage = () => <div className="p-6 text-2xl font-bold">Store Reports</div>;


export default function App() {
  return (
    <Routes>
      {/* === PUBLIC ROUTES (with Header/Footer via Layout) === */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/checkout" element={<Checkout />} />
      </Route>

      {/* === ADMIN ROUTES (all nested under AdminLayout) === */}
      <Route
        path="/admin"
        element={
          <Suspense fallback={<div className="w-full h-screen flex items-center justify-center text-lg">Loading Admin...</div>}>
            <AdminLayout />
          </Suspense>
        }
      >
        {/* Main farm dashboard at /admin */}
        <Route index element={<FarmDashboard />} />

        {/* Farm management pages */}
        <Route path="livestock" element={<LivestockPage />} />
        <Route path="crop" element={<CropPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* Store management pages. The existing dashboard is now one of the store pages */}
        <Route 
          path="store/dashboard" 
          element={
            <Suspense fallback={<div className="p-6">Loading Store Dashboard…</div>}>
              <StoreDashboard />
            </Suspense>
          } 
        />
        <Route path="store/products" element={<ProductsPage />} />
        <Route path="store/orders" element={<OrdersPage />} />
        <Route path="store/discounts" element={<DiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<ReportsPage />} />
      </Route>

      {/* === 404 FALLBACK ROUTE === */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}