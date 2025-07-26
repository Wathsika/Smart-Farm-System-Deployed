import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold text-green-600">
            <i className="fas fa-leaf mr-2"></i>
            GreenLeaf Farm
          </Link>
          
          <div className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 transition-colors">
              Home
            </Link>
            <Link to="/store" className="text-gray-700 hover:text-green-600 transition-colors">
              Store
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-green-600 transition-colors">
              About Us
            </Link>

            <Link to="/contact" className="text-gray-700 hover:text-green-600 transition-colors">
              Contact
            </Link>
          </div>
          
          <div className="md:hidden">
            <button className="text-gray-700">
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;