import React from 'react'; // Removed `useState` as it's no longer needed here
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, ShoppingBag } from 'lucide-react'; // Modern icons

// --- THIS IS THE FIX ---
// Add the missing reusable UI component definitions at the top.
const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      {children}
    </div>
);
const CardHeader = ({ children }) => <div className="p-6">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-xl font-bold text-gray-800">{children}</h3>;
const CardContent = ({ children }) => <div className="p-6 pt-0">{children}</div>;
// --- END OF FIX ---


// --- Main User Profile Page Component ---
export default function UserProfilePage() {
    const { user, logout } = useAuth(); // Get the real user and logout function
    const navigate = useNavigate();
    
    // Safety check: If the page loads before the auth state is ready,
    // or if the user logs out, show a loading/logged-out message.
    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <p className="text-gray-500">Loading profile or please log in.</p>
            </div>
        );
    }

    const handleLogout = () => {
        logout(); // Use the logout function from context
        navigate('/'); // Redirect to homepage after logging out
    };
    
    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* --- Profile Header --- */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5 mb-10">
                    <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-md">
                        {/* Use real user's initials */}
                        {user.fullName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.fullName}!</h1>
                        <p className="text-gray-600">{user.email}</p>
                    </div>
                </motion.div>

                {/* --- Profile Content --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Sidebar: Navigation */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-1 space-y-4">
                        <h2 className="font-semibold text-gray-500 px-4">My Account</h2>
                        <Link to="/my-orders" className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-green-100 hover:text-green-700">
                           <ShoppingBag size={20} /> My Orders
                        </Link>
                         <Link to="/profile" className="flex items-center gap-3 px-4 py-3 text-gray-700 font-medium rounded-lg hover:bg-green-100 hover:text-green-700">
                           <Settings size={20} /> Account Settings
                        </Link>
                         <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 font-medium rounded-lg hover:bg-red-100">
                           <LogOut size={20} /> Logout
                        </button>
                    </motion.div>
                    
                    {/* Right Side: Main Content */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <strong className="block text-gray-500 mb-1">Full Name</strong>
                                        <p className="p-3 bg-gray-50 rounded-lg">{user.fullName}</p>
                                    </div>
                                    <div>
                                        <strong className="block text-gray-500 mb-1">Email Address</strong>
                                        <p className="p-3 bg-gray-50 rounded-lg">{user.email}</p>
                                    </div>
                                    <div>
                                        <strong className="block text-gray-500 mb-1">Account Role</strong>
                                        <p className="p-3 bg-gray-50 rounded-lg">{user.role}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                </div>
            </div>
        </div>
    );
};