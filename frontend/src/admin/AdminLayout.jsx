// src/admin/AdminLayout.jsx

import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar"; // This import is correct

// There is no AdminHeader file, so we do not import or use it.

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* 
          The <AdminHeader /> line has been removed.
          The <main> element will now fill the entire space next to the sidebar.
        */}
        <main className="p-6 bg-gray-50 flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}