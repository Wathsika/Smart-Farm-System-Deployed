import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const handleSignIn = () => {
    setIsSignedIn(true);
  };

  const handleSignOut = () => {
    setIsSignedIn(false);
    setShowProfileDropdown(false);
  };

  const closeDropdown = () => {
    setShowProfileDropdown(false);
  };

  return (
    <motion.header 
      className="bg-white shadow-md sticky top-0 z-50"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <a href="/" className="text-2xl font-bold text-green-600 flex items-center">
              <motion.i 
                className="fas fa-leaf mr-2"
                whileHover={{ rotate: 20 }}
                transition={{ duration: 0.3 }}
              ></motion.i>
              GreenLeaf Farm
            </a>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="/" 
              className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:font-semibold"
            >
              Home
            </a>
            <a 
              href="/store" 
              className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:font-semibold"
            >
              Store
            </a>
            <a 
              href="/about" 
              className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:font-semibold"
            >
              About Us
            </a>
            <a 
              href="/contact" 
              className="text-gray-700 hover:text-green-600 transition-all duration-300 hover:font-semibold"
            >
              Contact
            </a>

            {/* Authentication Section */}
            <div className="flex items-center space-x-4 ml-4 border-l border-gray-300 pl-4">
              {!isSignedIn ? (
                <motion.button
                  className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 flex items-center space-x-2"
                  onClick={handleSignIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <i className="fas fa-sign-in-alt"></i>
                  <span>Sign In</span>
                </motion.button>
              ) : (
                <div className="relative">
                  {/* User Profile Dropdown Trigger */}
                  <motion.button
                    className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition-all duration-300 p-2 rounded-lg hover:bg-green-50"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                      <i className="fas fa-user text-white text-sm"></i>
                    </div>
                    <span className="font-medium">John Farmer</span>
                    <i className={`fas fa-chevron-down text-sm transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`}></i>
                  </motion.button>

                  {/* Profile Dropdown Menu */}
                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        {/* User Info Header */}
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                              <i className="fas fa-user text-white"></i>
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">John Farmer</p>
                              <p className="text-sm text-gray-500">john.farmer@email.com</p>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <i className="fas fa-crown mr-1"></i>
                              Premium Member
                            </span>
                          </div>
                        </div>

                        {/* Dropdown Menu Items */}
                        <div className="py-2">
                          <motion.a
                            href="/profile"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                            onClick={closeDropdown}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="fas fa-user-circle mr-3 text-green-600"></i>
                            <span>My Profile</span>
                          </motion.a>

                          <motion.a
                            href="/orders"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                            onClick={closeDropdown}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="fas fa-shopping-bag mr-3 text-green-600"></i>
                            <span>My Orders</span>
                          </motion.a>

                          <motion.a
                            href="/wishlist"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                            onClick={closeDropdown}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="fas fa-heart mr-3 text-green-600"></i>
                            <span>Wishlist</span>
                          </motion.a>

                          <motion.a
                            href="/settings"
                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                            onClick={closeDropdown}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="fas fa-cog mr-3 text-green-600"></i>
                            <span>Settings</span>
                          </motion.a>

                          <div className="border-t border-gray-100 my-2"></div>

                          <motion.button
                            className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                            onClick={handleSignOut}
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <i className="fas fa-sign-out-alt mr-3"></i>
                            <span>Sign Out</span>
                          </motion.button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            {/* Mobile Auth Section */}
            {!isSignedIn ? (
              <motion.button
                className="bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-all duration-300"
                onClick={handleSignIn}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-sign-in-alt mr-1"></i>
                Sign In
              </motion.button>
            ) : (
              <div className="relative">
                {/* Mobile Profile Button */}
                <motion.button
                  className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-300"
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="w-7 h-7 bg-green-600 rounded-full flex items-center justify-center">
                    <i className="fas fa-user text-white text-xs"></i>
                  </div>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-300 ${showProfileDropdown ? 'rotate-180' : ''}`}></i>
                </motion.button>

                {/* Mobile Profile Dropdown */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Mobile User Info */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                            <i className="fas fa-user text-white text-sm"></i>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">John Farmer</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-1">
                              <i className="fas fa-crown mr-1"></i>
                              Premium
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Dropdown Items */}
                      <div className="py-2">
                        <a
                          href="/profile"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                          onClick={closeDropdown}
                        >
                          <i className="fas fa-user-circle mr-3 text-green-600"></i>
                          <span>My Profile</span>
                        </a>
                        <a
                          href="/orders"
                          className="flex items-center px-4 py-2 text-gray-700 hover:bg-green-50 hover:text-green-600 transition-colors duration-200"
                          onClick={closeDropdown}
                        >
                          <i className="fas fa-shopping-bag mr-3 text-green-600"></i>
                          <span>My Orders</span>
                        </a>
                        <div className="border-t border-gray-100 my-2"></div>
                        <button
                          className="flex items-center w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                          onClick={handleSignOut}
                        >
                          <i className="fas fa-sign-out-alt mr-3"></i>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button 
              className="text-gray-700 hover:text-green-600 transition-colors duration-300"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <motion.div 
          className="md:hidden"
          initial={false}
          animate={{ height: showMobileMenu ? 'auto' : 0, opacity: showMobileMenu ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ overflow: 'hidden' }}
        >
          {showMobileMenu && (
            <div className="py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <a 
                  href="/" 
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-home mr-2"></i>
                  Home
                </a>
                <a 
                  href="/store" 
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-store mr-2"></i>
                  Store
                </a>
                <a 
                  href="/about" 
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-info-circle mr-2"></i>
                  About Us
                </a>
                <a 
                  href="/contact" 
                  className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-300"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Contact
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </nav>

      {/* Overlay to close dropdown when clicking outside */}
      <AnimatePresence>
        {showProfileDropdown && (
          <motion.div
            className="fixed inset-0 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDropdown}
          />
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;