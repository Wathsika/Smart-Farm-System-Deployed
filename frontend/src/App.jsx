import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/common/Layout";

// --- PUBLIC PAGES ---
import Home from "./pages/Home";
import AboutUs from "./pages/aboutus";
import ContactUs from "./pages/contactus";
import UserProfile from "./pages/UserProfile";
import Checkout from "./pages/checkout";
import Storefront from "./pages/Storefront";

// --- ADMIN PAGES (Lazy Loaded) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
// Store's dashboard (same file as your AdminDashboard)
const StoreDashboard = lazy(() => import("./admin/AdminDashboard"));

// --- REAL ADMIN STORE PAGES ---
import AdminProducts from "./pages/store/Products"; // ✅ your real products page

// Livestock management pages
import CowProfilePage from "./pages/livestock/cow.jsx";
import MilkProduction from "./pages/livestock/Milk.jsx";
import HealthPage from "./pages/livestock/Health.jsx";

// --- PLACEHOLDER COMPONENTS for other admin pages (keep until you build them) ---
const FarmDashboard = () => <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>;
const LivestockPage = () => <div className="p-6 text-2xl font-bold">Livestock Management</div>;
const CropPage = () => <div className="p-6 text-2xl font-bold">Crop Management</div>;
const StaffPage = () => <div className="p-6 text-2xl font-bold">Staff Management</div>;
const RevenuePage = () => <div className="p-6 text-2xl font-bold">Revenue & Financials</div>;
const OrdersPage = () => <div className="p-6 text-2xl font-bold">Order Management</div>;
const DiscountsPage = () => <div className="p-6 text-2xl font-bold">Discount Management</div>;
const CustomersPage = () => <div className="p-6 text-2xl font-bold">Customer Management</div>;
const ReportsPage = () => <div className="p-6 text-2xl font-bold">Store Reports</div>;

const BreedingRecordsPage = () => <div className="p-6 text-2xl font-bold">Breeding Records</div>;

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
        {/* Livestock sub-pages */}
        <Route path="livestock/profile" element={<CowProfilePage />} />
        <Route path="livestock/milk" element={<MilkProduction />} />
        <Route path="livestock/health" element={<HealthPage />} />
        <Route path="livestock/breeding" element={<BreedingRecordsPage />} />

        <Route path="crop" element={<CropPage />} />
        <Route path="staff" element={<StaffPage />} />
        <Route path="revenue" element={<RevenuePage />} />

        {/* Store management pages */}
        <Route
          path="store/dashboard"
          element={
            <Suspense fallback={<div className="p-6">Loading Store Dashboard…</div>}>
              <StoreDashboard />
            </Suspense>
          }
        />
        <Route path="store/products" element={<AdminProducts />} /> {/* ✅ linked to your file */}
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
