import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, XCircle, FileText, ChevronRight } from 'lucide-react'; // Modern icons

// --- MOCK DATA ---
// This is fake data to simulate what we'll get from the backend.
// We have different statuses to test our UI.
const fakeOrders = [
    {
        _id: '60c72b2f4f1a2c001f8e4d1a',
        createdAt: '2025-08-10T10:00:00.000Z',
        totalPrice: 25.98,
        status: 'DELIVERED', // This one is complete
        orderItems: [{ name: 'Organic Carrots' }, { name: 'Farm Fresh Eggs' }],
    },
    {
        _id: '60c72b2f4f1a2c001f8e4d1b',
        createdAt: '2025-08-11T11:30:00.000Z',
        totalPrice: 12.99,
        status: 'SHIPPED', // This one is on the way
        orderItems: [{ name: 'Grass-fed Beef' }],
    },
    {
        _id: '60c72b2f4f1a2c001f8e4d1c',
        createdAt: '2025-08-12T09:00:00.000Z',
        totalPrice: 8.98,
        status: 'PROCESSING', // This one can be cancelled
        orderItems: [{ name: 'Organic Milk' }, { name: 'Fresh Bread' }],
    },
    {
        _id: '60c72b2f4f1a2c001f8e4d1d',
        createdAt: '2025-07-20T14:00:00.000Z',
        totalPrice: 15.45,
        status: 'CANCELLED', // This one was cancelled
        orderItems: [{ name: 'Strawberries' }],
    },
];
// --- END MOCK DATA ---


// --- Reusable Component for the Status Tracker ---
const StatusTracker = ({ status }) => {
    const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statuses.indexOf(status);

    const getStatusClass = (index) => {
        if (index < currentStatusIndex) return 'bg-green-600 border-green-600'; // Completed
        if (index === currentStatusIndex) return 'bg-green-600 border-green-600 animate-pulse'; // Current
        return 'bg-gray-300 border-gray-300'; // Pending
    };

    if (status === 'CANCELLED') {
        return <div className="text-red-600 font-bold">Order Cancelled</div>
    }

    return (
        <div className="flex items-center space-x-2">
            {statuses.map((s, index) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center">
                        <div className={`w-6 h-6 rounded-full border-2 ${getStatusClass(index)} flex items-center justify-center`}>
                           {index <= currentStatusIndex && <i className="fas fa-check text-white text-xs"></i>}
                        </div>
                        <span className={`text-xs mt-1 ${index <= currentStatusIndex ? 'text-gray-700 font-semibold' : 'text-gray-500'}`}>{s}</span>
                    </div>
                    {index < statuses.length - 1 && (
                         <div className={`flex-1 h-1 ${index < currentStatusIndex ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};


// --- Main My Orders Page Component ---
const MyOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    // When the page loads, simulate fetching data from an API
    useEffect(() => {
        setLoading(true);
        // We use a timeout to simulate a real network request delay
        setTimeout(() => {
            // Later, this will be: `const { data } = await api.get('/api/orders/myorders');`
            setOrders(fakeOrders);

            setLoading(false);
        }, 1000); // 1 second delay
    }, []);

    // Placeholder function for cancelling an order
    const handleCancelOrder = (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
            console.log("Cancelling order:", orderId);
            // Later, this will be an API call:
            // await api.put(`/api/orders/${orderId}/cancel`);
            // And then we would refresh the orders list.
            
            // For now, we'll just update the fake data to show the change instantly
            setOrders(prevOrders => prevOrders.map(order => 
                order._id === orderId ? { ...order, status: 'CANCELLED' } : order
            ));
        }
    };

    if (loading) {
        return <div className="text-center py-20">Loading your orders...</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600">View the history and status of your past orders.</p>
                </header>

                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="text-center bg-white p-10 rounded-lg shadow-sm">
                            <p>You have no past orders.</p>
                            <Link to="/store" className="text-green-600 font-semibold mt-2 inline-block">Start Shopping</Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                                    <div>
                                        <h2 className="font-bold text-lg">Order #{order._id.slice(-6)}</h2>
                                        <p className="text-sm text-gray-500">
                                            Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="font-bold text-lg mt-2 md:mt-0">
                                        Total: Rs {order.totalPrice.toFixed(2)}
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <StatusTracker status={order.status} />
                                </div>
                                
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t pt-4">
                                    <div className="text-sm text-gray-600 mb-4 md:mb-0">
                                       Contains {order.orderItems.length} item(s): {order.orderItems.map(i => i.name).join(', ')}
                                    </div>

                                    <div className="flex gap-3">
                                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                                            <FileText size={16} /> Download Receipt
                                        </button>

                                        {/* Cancel button is only shown if the order is still being processed */}
                                        {order.status === 'PROCESSING' && (
                                            <button 
                                                onClick={() => handleCancelOrder(order._id)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                            >
                                               <XCircle size={16} /> Cancel Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MyOrdersPage;