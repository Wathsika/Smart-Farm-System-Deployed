import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

// --- Reusable UI Components (Inline for simplicity) ---

const Card = ({ children, className = "" }) => (
  <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);
const CardHeader = ({ children }) => <div className="p-6 pb-4">{children}</div>;
const CardTitle = ({ children, className = "" }) => <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>{children}</h3>;
const CardContent = ({ children, className = "" }) => <div className={`p-6 pt-0 ${className}`}>{children}</div>;

const Button = ({ children, variant = "default", ...props }) => {
  const variants = {
    default: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-green-600 text-green-600 bg-white hover:bg-green-50",
  };
  return <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 transition-colors ${variants[variant]}`} {...props}>{children}</button>;
};

const Badge = ({ children }) => (
  <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800">
    {children}
  </span>
);


// --- Main User Profile Page Component ---

export default function UserProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate(); // Hook for programmatic navigation

  // --- MOCK DATA (will be replaced by real data from AuthContext and API calls) ---
  const [userInfo, setUserInfo] = useState({
    name: "Savindu Weerarathna",
    email: "savindu@example.com",
    phone: "+94 77 123 4567",
    address: "123 Farm Valley Road, Green County",
    memberSince: "January 2024",
    customerType: "Premium Member"
  });

  // This is a placeholder; it should do nothing when "Edit" is clicked for now.
  const handleEdit = () => console.log("Edit button clicked");
  
  // --- This is the key navigation function ---
  const handleTabClick = (tabId) => {
      if (tabId === 'orders') {
          // If the "Order History" tab is clicked, navigate to the MyOrdersPage.
          navigate('/my-orders');
      } else {
          // For other tabs, just update the local state to show the content.
          setActiveTab(tabId);
      }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account settings and view your activity.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
          
          {/* --- LEFT SIDEBAR --- */}
          <motion.div className="lg:col-span-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
            <Card className="p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <span className="text-white text-3xl font-bold">{userInfo.name.split(' ').map(n=>n[0]).join('')}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{userInfo.name}</h2>
                <Badge><i className="fas fa-crown mr-1"></i>{userInfo.customerType}</Badge>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: 'fas fa-tachometer-alt' },
                  { id: 'orders', label: 'Order History', icon: 'fas fa-shopping-bag' },
                  { id: 'preferences', label: 'Preferences', icon: 'fas fa-cog' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    className={`w-full text-left p-3 rounded-lg transition-all flex items-center gap-3 ${
                      activeTab === tab.id
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-green-50'
                    }`}
                    onClick={() => handleTabClick(tab.id)}
                  >
                    <i className={`${tab.icon} w-5 text-center`}></i>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* --- MAIN CONTENT AREA --- */}
          <motion.div className="lg:col-span-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {/* Show content based on the active tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Personal Information</CardTitle>
                            <Button variant="outline" onClick={handleEdit}><i className="fas fa-edit mr-2"></i>Edit</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                          <div><strong className="block text-gray-500">Full Name</strong><p>{userInfo.name}</p></div>
                          <div><strong className="block text-gray-500">Email</strong><p>{userInfo.email}</p></div>
                          <div><strong className="block text-gray-500">Phone</strong><p>{userInfo.phone}</p></div>
                          <div><strong className="block text-gray-500">Member Since</strong><p>{userInfo.memberSince}</p></div>
                          <div className="md:col-span-2"><strong className="block text-gray-500">Address</strong><p>{userInfo.address}</p></div>
                      </div>
                    </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'preferences' && (
              <Card>
                <CardHeader><CardTitle>Shopping Preferences</CardTitle></CardHeader>
                <CardContent>
                  <p>This is where users can manage their preferences. (Content to be built)</p>
                </CardContent>
              </Card>
            )}

             {/* The Order History content is now on its own page at /my-orders */}
             
          </motion.div>
        </div>
      </div>
    </div>
  );
};