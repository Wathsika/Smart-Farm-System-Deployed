// src/admin/Sidebar.jsx

import React, { useState } from 'react';
// useNavigate hook එක import කරගන්න
import { NavLink, useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';

// ... (SidebarLink component එකේ වෙනසක් නැහැ)
const SidebarLink = ({ to, icon, children }) => (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex w-full items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 ${
          isActive ? 'bg-green-100 text-green-800 font-semibold' : 'text-gray-700'
        }`
      }
    >
      <i className={`${icon} w-5 text-center`} />
      <span>{children}</span>
    </NavLink>
);

const Sidebar = () => {
  const [isStoreOpen, setStoreOpen] = useState(true);
  const navigate = useNavigate(); // useNavigate hook එක call කරගන්න
  const [isLivestockOpen, setIsLivestockOpen] = useState(false);

  // Store බොත්තම සඳහා click handler function එකක්
  const handleStoreClick = () => {
    // sub-menu එක විවෘත කිරීම/වැසීම සිදු කරන්න
    setStoreOpen(!isStoreOpen);
    // '/admin/store/dashboard' පිටුවට යොමු කරන්න
    navigate('/admin/store/dashboard'); 
  };

   const handleLivestockClick = () => {
    setIsLivestockOpen(!isLivestockOpen);
    // ප්‍රධාන dashboard එකට යොමු කරන්න
    navigate('/admin/livestock');
  };

  return (
    <aside className="flex flex-col w-64 border-r border-gray-200 p-4 bg-white">
      {/* ... (Header එකේ වෙනසක් නැහැ) */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center">
          <i className="fas fa-leaf text-white text-xl" />
        </div>
        <div className="font-bold text-xl text-gray-800">Admin Panel</div>
      </div>
      
      {/* Navigation */}
      <nav className="flex flex-col space-y-1">
        {/* ... (අනෙක් links වල වෙනසක් නැහැ) */}
        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">Overview</div>
        <SidebarLink to="/admin" icon="fas fa-chart-pie">Dashboard</SidebarLink>

        <div className="text-xs uppercase tracking-wider text-gray-400 px-3 mb-2 mt-4">Farm</div>
        {/*Livestock button*/}
         <button
          onClick={handleLivestockClick}
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-cow w-5 text-center" />
            <span>Livestock</span>
          </div>
          <motion.i
             animate={{ rotate: isLivestockOpen ? 0 : -90 }}
             className="fas fa-chevron-down text-xs"
          />
        </button>
         {/* LIVESTOCK SUB-MENU*/}
        <AnimatePresence>
          {isLivestockOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              <SidebarLink to="/admin/livestock/profile" icon="fas fa-id-card">Cow Profile</SidebarLink>
              <SidebarLink to="/admin/livestock/milk" icon="fas fa-tint">Milk Production</SidebarLink>
              <SidebarLink to="/admin/livestock/health" icon="fas fa-heartbeat">Health Records</SidebarLink>
              <SidebarLink to="/admin/livestock/breeding" icon="fas fa-venus-mars">Breeding Records</SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>
        
        <SidebarLink to="/admin/crop" icon="fas fa-seedling">Crop</SidebarLink>
        <SidebarLink to="/admin/staff" icon="fas fa-users-cog">Staff</SidebarLink>
        
        {/* === STORE BUTTON - මෙම කොටස පමණක් වෙනස් කරන්න === */}
        <button
          onClick={handleStoreClick} // මෙතනට අලුත් function එක යොදන්න
          className="flex w-full items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700"
        >
          <div className="flex items-center gap-3">
            <i className="fas fa-store w-5 text-center" />
            <span>Store</span>
          </div>
          <motion.i
             animate={{ rotate: isStoreOpen ? 0 : -90 }}
             className="fas fa-chevron-down text-xs"
          />
        </button>

        <AnimatePresence>
          {isStoreOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pl-6 space-y-1"
            >
              {/* මෙහි sub-menu එක පමණක් තබන්න */}
              <SidebarLink to="/admin/store/products" icon="fas fa-box">Products</SidebarLink>
              <SidebarLink to="/admin/store/orders" icon="fas fa-shopping-cart">Orders</SidebarLink>
              <SidebarLink to="/admin/store/discounts" icon="fas fa-tags">Discounts</SidebarLink>
              <SidebarLink to="/admin/store/customers" icon="fas fa-user-friends">Customers</SidebarLink>
              <SidebarLink to="/admin/store/reports" icon="fas fa-chart-bar">Reports</SidebarLink>
            </motion.div>
          )}
        </AnimatePresence>
        
        <SidebarLink to="/admin/revenue" icon="fas fa-coins">Revenue</SidebarLink>
      </nav>
    </aside>
  );
};

export default Sidebar;