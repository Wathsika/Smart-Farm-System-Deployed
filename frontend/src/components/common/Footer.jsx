import React from "react";
import { motion } from "framer-motion";

const Footer = () => {
  const socialLinks = [
    { name: "Facebook", icon: "fab fa-facebook-f", href: "https://www.facebook.com/" },
    { name: "Instagram", icon: "fab fa-instagram", href: "https://www.instagram.com/" },
   { name: "TikTok", icon: "fab fa-tiktok", href: "https://www.tiktok.com/" },
    { name: "YouTube", icon: "fab fa-youtube", href: "https://www.youtube.com/" }
  ];

  return (
    <footer className="bg-black text-gray-400">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-b border-gray-800 pb-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <i className="fas fa-leaf text-white"></i>
            </div>
            <h2 className="text-white text-2xl font-bold">GreenLeaf Farm</h2>
          </div>

          {/* Social Links */}
          <div className="flex space-x-6">
            {socialLinks.map((social, index) => (
              <motion.a
                key={index}
                href={social.href}
                className="text-gray-400 hover:text-green-500 transition-colors duration-300"
                whileHover={{ scale: 1.2, y: -2 }}
              >
                <i className={`${social.icon} text-lg`}></i>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Bottom Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">About Us</h3>
            <p className="text-sm leading-relaxed">
              Providing fresh, organic farm products with sustainable
              practices. From our fields to your table with love and care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/"
                  className="hover:text-green-500 transition-colors duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/store"
                  className="hover:text-green-500 transition-colors duration-300"
                >
                  Store
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-green-500 transition-colors duration-300"
                >
                  About Us
                </a>
              </li>
              
              <li>
                <a
                  href="/contact"
                  className="hover:text-green-500 transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <i className="fas fa-map-marker-alt text-green-500"></i>
                10/F, Ginimellagaha, Baddegama, Sri Lanka
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-phone text-green-500"></i>
                +94 91 227 6246
              </li>
              <li className="flex items-center gap-2">
                <i className="fas fa-envelope text-green-500"></i>
                info@greenleaffarm.com
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-8 text-center text-sm text-gray-500 border-t border-gray-800 pt-4">
          © {new Date().getFullYear()} GreenLeaf Farm. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
