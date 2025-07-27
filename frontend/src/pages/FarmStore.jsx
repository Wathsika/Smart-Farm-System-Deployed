import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FarmStore = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCart, setShowCart] = useState(false);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: "easeOut" }
  };

  // Sample products data
  const products = [
    {
      id: 1,
      name: "Fresh Whole Milk",
      category: "dairy",
      price: 4.99,
      unit: "1 Gallon",
      image: "https://img.freepik.com/free-photo/glass-fresh-milk_144627-16251.jpg",
      description: "Farm-fresh whole milk from our grass-fed cows",
      inStock: true,
      organic: true
    },
    {
      id: 2,
      name: "Organic Tomatoes",
      category: "vegetables",
      price: 3.50,
      unit: "1 lb",
      image: "https://img.freepik.com/free-photo/fresh-tomatoes_144627-15982.jpg",
      description: "Vine-ripened organic tomatoes, perfect for salads",
      inStock: true,
      organic: true
    },
    {
      id: 3,
      name: "Free-Range Eggs",
      category: "dairy",
      price: 5.99,
      unit: "1 Dozen",
      image: "https://img.freepik.com/free-photo/brown-eggs-bowl_144627-16089.jpg",
      description: "Fresh eggs from our free-range chickens",
      inStock: true,
      organic: true
    },
    {
      id: 4,
      name: "Sweet Corn",
      category: "vegetables",
      price: 2.99,
      unit: "4 ears",
      image: "https://img.freepik.com/free-photo/corn-cob_144627-15896.jpg",
      description: "Sweet, tender corn picked fresh daily",
      inStock: true,
      organic: false
    },
    {
      id: 5,
      name: "Organic Carrots",
      category: "vegetables",
      price: 2.49,
      unit: "1 bunch",
      image: "https://img.freepik.com/free-photo/fresh-carrots_144627-15743.jpg",
      description: "Crisp, sweet organic carrots",
      inStock: false,
      organic: true
    },
    {
      id: 6,
      name: "Farm Honey",
      category: "pantry",
      price: 8.99,
      unit: "12 oz jar",
      image: "https://img.freepik.com/free-photo/honey-jar_144627-15234.jpg",
      description: "Pure, raw honey from our beehives",
      inStock: true,
      organic: true
    },
    {
      id: 7,
      name: "Artisan Cheese",
      category: "dairy",
      price: 12.99,
      unit: "8 oz",
      image: "https://img.freepik.com/free-photo/cheese-board_144627-16754.jpg",
      description: "Handcrafted cheese made from our farm milk",
      inStock: true,
      organic: true
    },
    {
      id: 8,
      name: "Mixed Greens",
      category: "vegetables",
      price: 4.99,
      unit: "5 oz bag",
      image: "https://img.freepik.com/free-photo/fresh-salad_144627-15324.jpg",
      description: "Fresh mixed greens and lettuce",
      inStock: true,
      organic: true
    }
  ];

  const categories = [
    { id: 'all', name: 'All Products', icon: 'fas fa-th-large' },
    { id: 'dairy', name: 'Dairy', icon: 'fas fa-cheese' },
    { id: 'vegetables', name: 'Vegetables', icon: 'fas fa-carrot' },
    { id: 'pantry', name: 'Pantry', icon: 'fas fa-jar' }
  ];

  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart functions
  const addToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.header 
        className="bg-white shadow-md sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <motion.div 
              className="flex items-center"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-leaf text-white text-lg"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">
                GreenLeaf <span className="text-green-600">Store</span>
              </h1>
            </motion.div>

            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <motion.div 
                className="relative hidden md:block"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </motion.div>

              {/* Cart Button */}
              <motion.button
                className="relative bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-300 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCart(!showCart)}
              >
                <i className="fas fa-shopping-cart"></i>
                <span className="hidden sm:inline">Cart</span>
                {getTotalItems() > 0 && (
                  <motion.span
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500 }}
                  >
                    {getTotalItems()}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Banner */}
      <motion.section 
        className="bg-gradient-to-r from-green-600 to-green-700 text-white py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-4xl md:text-5xl font-bold mb-4"
            {...fadeInUp}
          >
            Fresh from Our Farm to Your Table
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 opacity-90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Discover the finest organic produce, dairy, and farm-fresh goods
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
              <i className="fas fa-truck mr-2"></i>
              Free Delivery Over $50
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
              <i className="fas fa-leaf mr-2"></i>
              100% Organic
            </div>
            <div className="bg-white bg-opacity-20 px-4 py-2 rounded-full backdrop-blur-sm">
              <i className="fas fa-heart mr-2"></i>
              Farm Fresh Daily
            </div>
          </motion.div>
        </div>
      </motion.section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Categories */}
          <motion.aside 
            className="lg:w-64"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
              <motion.div 
                className="space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      selectedCategory === category.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                    variants={scaleIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className={category.icon}></i>
                    <span>{category.name}</span>
                  </motion.button>
                ))}
              </motion.div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Search */}
            <motion.div 
              className="md:hidden mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              </div>
            </motion.div>

            {/* Products Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence>
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300"
                    variants={{
                      initial: { opacity: 0, y: 50 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: -50 }
                    }}
                    layout
                    whileHover={{ y: -5 }}
                  >
                    <div className="relative">
                      <motion.img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {product.organic && (
                        <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          Organic
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <span className="text-2xl font-bold text-green-600">${product.price}</span>
                          <span className="text-gray-500 text-sm ml-1">/{product.unit}</span>
                        </div>
                      </div>

                      <motion.button
                        className={`w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 ${
                          product.inStock
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!product.inStock}
                        onClick={() => addToCart(product)}
                        whileHover={product.inStock ? { scale: 1.02 } : {}}
                        whileTap={product.inStock ? { scale: 0.98 } : {}}
                      >
                        <i className="fas fa-cart-plus mr-2"></i>
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredProducts.length === 0 && (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <i className="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p className="text-gray-500">Try adjusting your search or filter criteria</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
            />
            <motion.div
              className="fixed right-0 top-0 h-full w-96 bg-white shadow-xl z-50 overflow-y-auto"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Shopping Cart</h2>
                  <button
                    onClick={() => setShowCart(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-8">
                    <i className="fas fa-shopping-cart text-4xl text-gray-400 mb-4"></i>
                    <p className="text-gray-500">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                        >
                          <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm">{item.name}</h4>
                            <p className="text-green-600 font-bold">${item.price}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              <i className="fas fa-minus text-xs"></i>
                            </button>
                            <span className="font-semibold">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300"
                            >
                              <i className="fas fa-plus text-xs"></i>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-2xl font-bold text-green-600">${getTotalPrice()}</span>
                      </div>
                      <motion.button
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <i className="fas fa-credit-card mr-2"></i>
                        Checkout
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FarmStore;