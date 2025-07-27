import React, { useState } from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    shop: [
      { name: 'Fresh Dairy', href: '/products/dairy' },
      { name: 'Organic Vegetables', href: '/products/vegetables' },
      { name: 'Farm Fresh Eggs', href: '/products/eggs' },
      { name: 'Seasonal Fruits', href: '/products/fruits' },
      { name: 'Pantry Items', href: '/products/pantry' }
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Our Story', href: '/story' },
      { name: 'Sustainability', href: '/sustainability' },
      { name: 'Farm Tours', href: '/tours' },
      { name: 'Careers', href: '/careers' }
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Shipping Info', href: '/shipping' },
      { name: 'Returns', href: '/returns' },
      { name: 'Track Order', href: '/track' }
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Refund Policy', href: '/refunds' }
    ]
  };

  const socialLinks = [
    { name: 'Facebook', icon: 'fab fa-facebook-f', href: '#', color: 'hover:text-blue-600' },
    { name: 'Instagram', icon: 'fab fa-instagram', href: '#', color: 'hover:text-pink-600' },
    { name: 'Twitter', icon: 'fab fa-twitter', href: '#', color: 'hover:text-blue-400' },
    { name: 'YouTube', icon: 'fab fa-youtube', href: '#', color: 'hover:text-red-600' },
    { name: 'LinkedIn', icon: 'fab fa-linkedin-in', href: '#', color: 'hover:text-blue-700' }
  ];

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Newsletter Section */}
      <motion.div 
        className="bg-green-600 py-12"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h3 
              className="text-2xl sm:text-3xl font-bold text-white mb-4"
              {...fadeInUp}
            >
              Stay Fresh with Our Newsletter
            </motion.h3>
            <motion.p 
              className="text-green-100 mb-8 max-w-2xl mx-auto"
              {...fadeInUp}
              transition={{ delay: 0.2 }}
            >
              Get the latest updates on fresh produce, seasonal specials, and farm news delivered straight to your inbox.
            </motion.p>
            
            <motion.form 
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-green-300 focus:outline-none text-gray-900"
                required
              />
              <motion.button
                type="submit"
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <i className="fas fa-paper-plane mr-2"></i>
                Subscribe
              </motion.button>
            </motion.form>

            {subscribed && (
              <motion.div
                className="mt-4 text-green-100 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <i className="fas fa-check-circle mr-2"></i>
                Thank you for subscribing!
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main Footer Content */}
      <motion.div 
        className="py-16"
        variants={staggerContainer}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Brand Section */}
            <motion.div 
              className="lg:col-span-2"
              variants={fadeInUp}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                  <i className="fas fa-leaf text-white text-lg"></i>
                </div>
                <h2 className="text-2xl font-bold text-white">GreenLeaf Farm</h2>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Committed to providing the freshest, highest-quality organic produce and dairy products. 
                From our farm to your table, we ensure sustainability and excellence in everything we grow.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-map-marker-alt text-green-500 mr-3 w-4"></i>
                  <span>123 Farm Valley Road, Green County, State 12345</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-phone text-green-500 mr-3 w-4"></i>
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-envelope text-green-500 mr-3 w-4"></i>
                  <span>info@greenleaffarm.com</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <i className="fas fa-clock text-green-500 mr-3 w-4"></i>
                  <span>Mon-Sat: 7AM-6PM, Sun: 8AM-4PM</span>
                </div>
              </div>
            </motion.div>

            {/* Shop Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-shopping-basket text-green-500 mr-2"></i>
                Shop
              </h3>
              <ul className="space-y-3">
                {footerLinks.shop.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2 opacity-50"></i>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Company Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-building text-green-500 mr-2"></i>
                Company
              </h3>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2 opacity-50"></i>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Support Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-headset text-green-500 mr-2"></i>
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2 opacity-50"></i>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Legal Links */}
            <motion.div variants={fadeInUp}>
              <h3 className="text-lg font-semibold text-white mb-6 flex items-center">
                <i className="fas fa-gavel text-green-500 mr-2"></i>
                Legal
              </h3>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <motion.li 
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <a 
                      href={link.href}
                      className="text-gray-400 hover:text-green-400 transition-colors duration-300 flex items-center"
                    >
                      <i className="fas fa-chevron-right text-xs mr-2 opacity-50"></i>
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>

          {/* Certifications & Trust Badges */}
          <motion.div 
            className="mt-12 pt-8 border-t border-gray-800"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-6">Our Certifications</h4>
              <div className="flex flex-wrap justify-center items-center gap-8">
                {[
                  { name: 'USDA Organic', icon: 'fas fa-leaf' },
                  { name: 'Non-GMO', icon: 'fas fa-seedling' },
                  { name: 'Fair Trade', icon: 'fas fa-handshake' },
                  { name: 'Sustainable', icon: 'fas fa-recycle' },
                  { name: 'Local Farm', icon: 'fas fa-map-marker-alt' }
                ].map((cert, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center text-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mb-2">
                      <i className={`${cert.icon} text-white`}></i>
                    </div>
                    <span className="text-sm text-gray-400">{cert.name}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Footer */}
      <motion.div 
        className="border-t border-gray-800 py-8"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            {/* Copyright */}
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              <p>&copy; 2024 GreenLeaf Farm. All rights reserved.</p>
              <p className="mt-1">Made with <i className="fas fa-heart text-red-500 mx-1"></i> for sustainable farming</p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-6">
              <span className="text-gray-400 text-sm mr-4">Follow us:</span>
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  className={`text-gray-400 ${social.color} transition-colors duration-300`}
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  title={social.name}
                >
                  <i className={`${social.icon} text-lg`}></i>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Payment Methods */}
          <motion.div 
            className="mt-6 pt-6 border-t border-gray-800 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
              <div className="flex items-center text-gray-400 text-sm">
                <i className="fas fa-lock mr-2 text-green-500"></i>
                <span>Secure SSL Encrypted Checkout</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-400 text-sm">We Accept:</span>
                <div className="flex space-x-3">
                  {['fab fa-cc-visa', 'fab fa-cc-mastercard', 'fab fa-cc-paypal', 'fab fa-cc-apple-pay', 'fab fa-cc-stripe'].map((icon, index) => (
                    <motion.i
                      key={index}
                      className={`${icon} text-2xl text-gray-500 hover:text-gray-300 transition-colors duration-300`}
                      whileHover={{ scale: 1.1 }}
                    ></motion.i>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </footer>
  );
};

export default Footer;