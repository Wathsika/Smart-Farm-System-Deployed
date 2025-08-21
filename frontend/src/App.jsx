// src/App.jsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { auth } from "./lib/auth";
import Layout from "./components/common/Layout";

// --- PUBLIC-FACING PAGES ---
import Home from "./pages/Home";
import Storefront from "./pages/Storefront";
import AboutUs from "./pages/aboutus.jsx";
import ContactUs from "./pages/contactus.jsx";
import Login from "./pages/Login";
import UserProfile from "./pages/UserProfile";
import CheckoutPage from "./pages/checkout";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderSuccessPage from "./pages/store/OrderSuccessPage";
import OrderCancelPage from "./pages/store/OrderCancelPage";

// --- EMPLOYEE ---
import EmployeeDashboard from "./pages/employee/EmployeeDashboard";

// --- ADMIN (direct imports) ---
import AdminUsers from "./pages/AdminUsers";
import StaffAttendance from "./admin/StaffAttendance";
import LeaveManagement from "./admin/LeaveManagement";
import TaskManagement from "./admin/TaskManagement";
import AdminProducts from "./pages/store/Products";
import AdminOrders from "./pages/store/Orders";
import AdminDiscountsPage from "./admin/DiscountsPage";
import StoreReports from "./admin/StoreReports";

// --- ADMIN FARM MODULES ---
import AddCrop from "./admin/AddCrop.jsx";
import CropPage from "./admin/CropPage.jsx";
import EditCrop from "./admin/EditCrop.jsx";
import FieldPage from "./admin/FieldPage.jsx";
import AddFieldPage from "./admin/AddFieldPage.jsx";
import EditFieldPage from "./admin/EditFieldPage.jsx";

// ⬇️ ADDED: Plan pages (no other changes)
import AddPlan from "./admin/AddPlan.jsx";
import PlanList from "./admin/PlanList.jsx";

// --- FINANCE (admin) ---
import FinanceOverview from "./admin/FinanceOverview";
import FinanceTransaction from "./admin/FinanceTransaction";
import FinanceNewTransaction from "./admin/FinanceNewTransaction";
import FinancePayrollManagement from "./admin/FinancePayrollManagement";
import FinanceEditPayrollRule from "./admin/FinanceEditPayrollRule";

// --- ADMIN PAGES (Lazy Loading for performance) ---
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const StoreDashboard = lazy(() => import("./admin/StoreDashboard"));

// --- TEMP PLACEHOLDERS ---
const FarmDashboard = () => (
  <div className="p-6 text-2xl font-bold">Farm Overview Dashboard</div>
);
const LivestockPage = () => (
  <div className="p-6 text-2xl font-bold">Livestock Management</div>
);
const StaffPage = () => (
  <div className="p-6 text-2xl font-bold">Staff Management</div>
);
const RevenuePage = () => (
  <div className="p-6 text-2xl font-bold">Revenue & Financials</div>
);
const CustomersPage = () => (
  <div className="p-6 text-2xl font-bold">Customer Management</div>
);


// --- GUARDS ---
const Private = ({ children }) =>
  auth.token ? children : <Navigate to="/login" replace />;

const AdminOnly = ({ children }) =>
  auth.user?.role === "Admin" ? children : <Navigate to="/" replace />;


// Livestock management pages
import CowProfilePage from "./pages/livestock/cow.jsx";
import MilkProduction from "./pages/livestock/Milk.jsx";
import HealthPage from "./pages/livestock/Health.jsx";

const EmployeeOnly = ({ children }) =>
  auth.user?.role === "Employee" ? children : <Navigate to="/" replace />;

const BreedingRecordsPage = () => (
  <div className="p-6 text-2xl font-bold">Breeding Records</div>
);

export default function App() {
  return (
    <Routes>
      {/* PUBLIC (wrapped with main layout) */}
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/store" element={<Storefront />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/order/success" element={<OrderSuccessPage />} />
        <Route path="/order/cancel" element={<OrderCancelPage />} />
      </Route>

      {/* STANDALONE */}
      <Route path="/login" element={<Login />} />

      {/* AUTH USER */}
      <Route
        path="/profile"
        element={
          <Private>
            <UserProfile />
          </Private>
        }
      />
      <Route
        path="/checkout"
        element={
          <Private>
            <CheckoutPage />
          </Private>
        }
      />
      <Route
        path="/my-orders"
        element={
          <Private>
            <MyOrdersPage />
          </Private>
        }
      />

      {/* EMPLOYEE */}
      <Route
        path="/dashboard"
        element={
          <EmployeeOnly>
            <EmployeeDashboard />
          </EmployeeOnly>
        }
      />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <AdminOnly>
            <Suspense
              fallback={
                <div className="w-full h-screen flex items-center justify-center text-lg">
                  Loading Admin…
                </div>
              }
            >
              <AdminLayout />
            </Suspense>
          </AdminOnly>
        }
      >
        <Route index element={<FarmDashboard />} />


        {/* Farm management pages */}
        <Route path="livestock" element={<LivestockPage />} /> 
        {/* Livestock sub-pages */}
        <Route path="livestock/profile" element={<CowProfilePage />} />
        <Route path="livestock/milk" element={<MilkProduction />} />
        <Route path="livestock/health" element={<HealthPage />} />
        <Route path="livestock/breeding" element={<BreedingRecordsPage />} />

          <Route path="staff" element={<StaffPage />} />
          <Route path="revenue" element={<RevenuePage />} />

          {/* Crop management */}
          <Route path="crop" element={<CropPage />} />
        <Route path="crop/add" element={<AddCrop />} />
        <Route path="crop/:id/edit" element={<EditCrop />} />

        {/* ⬇️ ADDED: Plan pages under Crop (distinct paths, no conflicts) */}
        <Route path="crop/plans" element={<PlanList />} />
        <Route path="crop/plan/new" element={<AddPlan />} />

        {/* Field management */}
        <Route path="fields" element={<FieldPage />} />
        <Route path="fields/add" element={<AddFieldPage />} />
        <Route path="fields/edit/:id" element={<EditFieldPage />} />

        {/* HR management */}
        <Route path="users" element={<AdminUsers />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="attendance" element={<StaffAttendance />} />
        <Route path="leave" element={<LeaveManagement />} />

        {/* Store (nested) */}
        <Route
          path="store/dashboard"
          element={
            <Suspense fallback={<div className="p-6">Loading Dashboard…</div>}>
              <StoreDashboard />
            </Suspense>
          }
        />
        <Route path="store/products" element={<AdminProducts />} />
        <Route path="store/orders" element={<AdminOrders />} />
        <Route path="store/discounts" element={<AdminDiscountsPage />} />
        <Route path="store/customers" element={<CustomersPage />} />
        <Route path="store/reports" element={<StoreReports />} />



        {/* Finance (nested) */}
        <Route path="finance">
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<FinanceOverview />} />
          <Route path="transaction" element={<FinanceTransaction />} />
          <Route path="new_transaction" element={<FinanceNewTransaction />} />
          <Route path="edit_rule" element={<FinanceEditPayrollRule />} />
          <Route
            path="payroll_management"
            element={<FinancePayrollManagement />}
          />
        </Route>


      </Route>

      {/* FALLBACK */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
