// src/components/common/Layout.jsx (The fix)

import React from "react";
import { Outlet } from "react-router-dom"; // Just Outlet is enough
import Header from "./Header";
import Footer from "./Footer";
// Make sure Header.jsx and Footer.jsx exist in the same folder and use: export default function Header() { ... }
// ... (other imports)

export default function Layout() {
  return (
    // Correct structure: just the JSX elements and the Outlet
    <div>
      <Header />
      <main>
        {/* The Outlet is where the child routes will render */}
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}