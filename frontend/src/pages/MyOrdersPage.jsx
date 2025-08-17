import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

// Import necessary components and icons
import { Package, XCircle, FileText, Loader2, Check } from 'lucide-react';
import InvoiceModal from '../components/common/InvoiceModal'; // The new modal for receipts


// --- Reusable Component for the Order Status Tracker ---
const StatusTracker = ({ status }) => {
    const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentStatusIndex = statuses.indexOf(status);

    if (status === 'CANCELLED') {
        return <div className="text-red-600 font-bold flex items-center gap-2"><XCircle size={18} /> Order Cancelled</div>
    }

    return (
        <div className="flex items-center w-full">
            {statuses.map((s, index) => (
                <React.Fragment key={s}>
                    <div className="flex flex-col items-center text-center w-1/3">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                            index <= currentStatusIndex ? 'bg-green-600 border-green-600' : 'bg-white border-gray-300'
                        }`}>
                           {index <= currentStatusIndex && <Check className="text-white" size={16} />}
                        </div>
                        <span className={`text-xs mt-2 font-semibold ${
                            index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'
                        }`}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </span>
                    </div>
                    {index < statuses.length - 1 && (
                         <div className={`flex-1 h-1 transition-colors duration-300 mx-2 ${
                            index < currentStatusIndex ? 'bg-green-600' : 'bg-gray-300'
                         }`}></div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};


// --- Main My Orders Page Component ---
export default function MyOrdersPage() {
    const queryClient = useQueryClient();
    const { user } = useAuth(); // Get the currently logged-in user

    // --- State for the UI ---
    // This state will hold the order object that the user wants to view in the modal.
    // If it's `null`, the modal is closed.
    const [viewingOrder, setViewingOrder] = useState(null);
 const [autoPrint, setAutoPrint] = useState(false);

    // --- DATA FETCHING with React Query ---
    // Fetches data from the protected `/api/orders/myorders` route.
    // React Query handles all loading, error, and caching logic for us.
    const { data: orders = [], isLoading, isError } = useQuery({
        queryKey: ['myOrders', user?.email], // Query is unique to the logged-in user
        queryFn: async () => {
            const { data } = await api.get('/orders/myorders');
            return data;
        },
        enabled: !!user, // The query will only run if the user is logged in
    });
    
    const { data: products = [] } = useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const { data } = await api.get('/products');
            return data.items || data;
        }
    });

    const productStock = useMemo(() => {
        const map = {};
        products.forEach(p => { map[p._id] = p.stock?.qty ?? 0; });
        return map;
    }, [products]);

    // --- API MUTATION for Cancelling an Order ---
    // `useMutation` is used for any action that changes data (Create, Update, Delete).
    const { mutate: cancelOrder, isLoading: isCancelling } = useMutation({
        mutationFn: (orderId) => api.put(`/orders/${orderId}/cancel`),
        onSuccess: () => {
            // After a successful cancellation, tell React Query to refetch the 'myOrders' data.
            // This ensures the UI updates instantly to show the "Cancelled" status.
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
             queryClient.invalidateQueries({ queryKey: ['products'] });
            alert("Your order has been successfully cancelled.");
        },
        onError: (error) => {
            alert(error.response?.data?.message || "Failed to cancel the order.");
        }
    });

    useEffect(() => {
        if (!user) return;
        const eventsUrl = `${api.defaults.baseURL}/orders/events`;
        const eventSource = new EventSource(eventsUrl);
        eventSource.onmessage = (e) => {
            try {
                const payload = JSON.parse(e.data);
                queryClient.setQueryData(['myOrders', user.email], (old = []) =>
                    old.map(o => o._id === payload.orderId ? { ...o, status: payload.status } : o)
                );
            } catch {
                /* ignore malformed events */
            }
        };
        return () => eventSource.close();
    }, [queryClient, user]);

    // --- EVENT HANDLERS ---
    const handleCancelOrder = (orderId) => {
        if (window.confirm("Are you sure you want to cancel this order? This will restock the items and cannot be undone.")) {
            cancelOrder(orderId);
        }
    };

    const handleDownloadInvoice = (order) => {
        setViewingOrder(order);
        setAutoPrint(true);
    };

    // --- RENDER STATES ---
    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>;
    }
    if (isError) {
        return <div className="p-8 text-center text-red-500">Could not load your orders. Please ensure you are logged in and try again.</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
                    <p className="text-gray-600">View the history and status of all your past purchases.</p>
                </header>

                <div className="space-y-6">
                    {orders.length === 0 ? (
                        <div className="text-center bg-white p-12 rounded-xl shadow-sm">
                            <Package size={48} className="mx-auto text-gray-400 mb-4" />
                            <h2 className="text-xl font-semibold text-gray-800">You haven't placed any orders yet.</h2>
                            <p className="text-gray-500 mt-2">All your future purchases will appear here.</p>
                            <Link to="/store" className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                                Start Shopping
                            </Link>
                        </div>
                    ) : (
                        orders.map(order => (
                            <div key={order._id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b">
                                    <div>
                                        <h2 className="font-bold text-lg text-gray-800">Order #{order.stripeSessionId?.slice(-10).toUpperCase() || order._id.slice(-6)}</h2>
                                        <p className="text-sm text-gray-500">
                                            Placed on: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="font-bold text-lg mt-2 md:mt-0 text-gray-900">
                                        Total: Rs {order.totalPrice.toFixed(2)}
                                    </div>
                                </div>
                                <div className="mb-6"><StatusTracker status={order.status} /></div>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-t pt-4">
                                    <div className="text-sm text-gray-600 mb-4 md:mb-0">
                                      Contains {order.orderItems.length} item(s): {order.orderItems.map(i => `${i.name} (Stock: ${productStock[i.product] ?? 0})`).join(', ')}
                                    </div>
                                    <div className="flex gap-3">
                                          <button
                                            onClick={() => handleDownloadInvoice(order)}
                                             className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">
                                            <FileText size={16} /> Download Invoice
                                        </button>
                                       {order.status !== 'CANCELLED' && (
                                            <button
                                                onClick={() => handleCancelOrder(order._id)}
                                                disabled={isCancelling || ['SHIPPED', 'DELIVERED'].includes(order.status)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
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
            
            {/* Render the InvoiceModal when an order is selected for viewing */}
           <InvoiceModal
                isOpen={!!viewingOrder}
                onClose={() => { setViewingOrder(null); setAutoPrint(false); }}
                order={viewingOrder}
                autoPrint={autoPrint}
            />
        </div>
    );
};