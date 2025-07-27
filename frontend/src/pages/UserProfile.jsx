import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Shadcn UI Components (inline for compatibility)
const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6 pb-4">
    {children}
  </div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "default", size = "default", className = "", onClick, disabled = false }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";
  
  const variants = {
    default: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-green-600 text-green-600 hover:bg-green-50",
    ghost: "hover:bg-green-50 hover:text-green-600",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  };
  
  const sizes = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3",
    lg: "h-11 px-8"
  };
  
  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-green-100 text-green-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [userInfo, setUserInfo] = useState({
    name: "John Farmer",
    email: "john.farmer@email.com",
    phone: "+1 (555) 123-4567",
    address: "123 Farm Valley Road, Green County, State 12345",
    memberSince: "January 2022",
    customerType: "Premium Member"
  });

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
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
    transition: { duration: 0.3 }
  };

  // Sample data
  const recentOrders = [
    { id: "#ORD-001", date: "2024-01-15", total: "$45.99", status: "Delivered", items: "Fresh Milk, Eggs, Honey" },
    { id: "#ORD-002", date: "2024-01-10", total: "$32.50", status: "Delivered", items: "Organic Vegetables, Cheese" },
    { id: "#ORD-003", date: "2024-01-05", total: "$28.75", status: "Processing", items: "Tomatoes, Carrots, Herbs" }
  ];

  const preferences = [
    { category: "Dairy Products", preference: "Organic Only" },
    { category: "Vegetables", preference: "Seasonal Picks" },
    { category: "Delivery", preference: "Weekend Preferred" },
    { category: "Notifications", preference: "Email & SMS" }
  ];

  const loyaltyStats = {
    totalOrders: 24,
    totalSpent: "$1,247.50",
    pointsEarned: 1248,
    currentTier: "Premium"
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="mb-8"
          {...fadeInUp}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and view your activity</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Profile Sidebar */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="p-6">
              {/* Profile Picture */}
              <motion.div 
                className="text-center mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="relative inline-block">
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                    <i className="fas fa-user text-white text-3xl"></i>
                  </div>
                  <motion.button
                    className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <i className="fas fa-camera text-xs"></i>
                  </motion.button>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{userInfo.name}</h2>
                <Badge variant="success" className="mt-2">
                  <i className="fas fa-crown mr-1"></i>
                  {userInfo.customerType}
                </Badge>
              </motion.div>

              {/* Navigation Tabs */}
              <motion.div 
                className="space-y-2"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {[
                  { id: 'overview', label: 'Overview', icon: 'fas fa-tachometer-alt' },
                  { id: 'orders', label: 'Order History', icon: 'fas fa-shopping-bag' },
                  { id: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
                  { id: 'loyalty', label: 'Loyalty Program', icon: 'fas fa-star' }
                ].map((tab) => (
                  <motion.button
                    key={tab.id}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-300 flex items-center space-x-3 ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                    }`}
                    onClick={() => setActiveTab(tab.id)}
                    variants={scaleIn}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className={tab.icon}></i>
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            </Card>
          </motion.div>

          {/* Main Content */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div 
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {/* Personal Information */}
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center space-x-2">
                          <i className="fas fa-user-circle text-green-600"></i>
                          <span>Personal Information</span>
                        </CardTitle>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditing(!isEditing)}
                        >
                          <i className={`fas ${isEditing ? 'fa-save' : 'fa-edit'} mr-2`}></i>
                          {isEditing ? 'Save' : 'Edit'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-user mr-2 text-green-600"></i>
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={userInfo.name}
                              onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{userInfo.name}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-envelope mr-2 text-green-600"></i>
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              type="email"
                              value={userInfo.email}
                              onChange={(e) => setUserInfo({...userInfo, email: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{userInfo.email}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-phone mr-2 text-green-600"></i>
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              type="tel"
                              value={userInfo.phone}
                              onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{userInfo.phone}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-calendar mr-2 text-green-600"></i>
                            Member Since
                          </label>
                          <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{userInfo.memberSince}</p>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            <i className="fas fa-map-marker-alt mr-2 text-green-600"></i>
                            Address
                          </label>
                          {isEditing ? (
                            <textarea
                              value={userInfo.address}
                              onChange={(e) => setUserInfo({...userInfo, address: e.target.value})}
                              rows="3"
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          ) : (
                            <p className="text-gray-900 p-3 bg-gray-50 rounded-lg">{userInfo.address}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <i className="fas fa-chart-line text-green-600"></i>
                        <span>Account Summary</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                          { label: 'Total Orders', value: loyaltyStats.totalOrders, icon: 'fas fa-shopping-cart', color: 'text-blue-600' },
                          { label: 'Total Spent', value: loyaltyStats.totalSpent, icon: 'fas fa-dollar-sign', color: 'text-green-600' },
                          { label: 'Loyalty Points', value: loyaltyStats.pointsEarned, icon: 'fas fa-star', color: 'text-yellow-600' },
                          { label: 'Current Tier', value: loyaltyStats.currentTier, icon: 'fas fa-crown', color: 'text-purple-600' }
                        ].map((stat, index) => (
                          <motion.div
                            key={index}
                            className="text-center p-4 bg-gray-50 rounded-lg"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.3 }}
                          >
                            <i className={`${stat.icon} ${stat.color} text-2xl mb-2`}></i>
                            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            <p className="text-sm text-gray-600">{stat.label}</p>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {/* Order History Tab */}
            {activeTab === 'orders' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-shopping-bag text-green-600"></i>
                      <span>Recent Orders</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentOrders.map((order, index) => (
                        <motion.div
                          key={order.id}
                          className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-semibold text-gray-900">{order.id}</h3>
                              <p className="text-sm text-gray-600">{order.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">{order.total}</p>
                              <Badge variant={order.status === 'Delivered' ? 'success' : 'warning'}>
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-gray-700">{order.items}</p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-cog text-green-600"></i>
                      <span>Shopping Preferences</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {preferences.map((pref, index) => (
                        <motion.div
                          key={index}
                          className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                          <div>
                            <h3 className="font-medium text-gray-900">{pref.category}</h3>
                            <p className="text-sm text-gray-600">{pref.preference}</p>
                          </div>
                          <Button variant="outline" size="sm">
                            <i className="fas fa-edit mr-2"></i>
                            Edit
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Loyalty Program Tab */}
            {activeTab === 'loyalty' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <i className="fas fa-star text-green-600"></i>
                      <span>Loyalty Program</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Progress Bar */}
                      <div className="bg-gray-200 rounded-full h-4">
                        <motion.div
                          className="bg-green-600 h-4 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '75%' }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        ></motion.div>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-gray-900">Premium Member</p>
                        <p className="text-sm text-gray-600">752 points to next tier (Platinum)</p>
                      </div>

                      {/* Benefits */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                          { benefit: '10% discount on all orders', icon: 'fas fa-percentage' },
                          { benefit: 'Free delivery on orders over $30', icon: 'fas fa-truck' },
                          { benefit: 'Early access to seasonal products', icon: 'fas fa-clock' },
                          { benefit: 'Birthday month special offers', icon: 'fas fa-gift' }
                        ].map((item, index) => (
                          <motion.div
                            key={index}
                            className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                          >
                            <i className={`${item.icon} text-green-600`}></i>
                            <span className="text-gray-700">{item.benefit}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;