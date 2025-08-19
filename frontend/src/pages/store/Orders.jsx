import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import { Eye, FileText, X, Loader2, Package, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- THIS IS THE FIX ---
// Add the missing reusable component definitions at the top of the file.

const Badge = ({ text }) => {
    const types = {
        PROCESSING: "bg-yellow-100 text-yellow-800",
        SHIPPED: "bg-blue-100 text-blue-800",
        DELIVERED: "bg-green-100 text-green-800",
        CANCELLED: "bg-red-100 text-red-800",
        PAID: "bg-green-100 text-green-800 border border-green-200",
        PENDING: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    };
    return (
        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${types[text] || "bg-gray-100"}`}>
            {text}
        </span>
    );
};

const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;
    const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;
    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <motion.div
                    initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
                    className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <header className="flex items-center justify-between p-4 border-b">
                        <div>
                            <h2 className="text-xl font-bold">Order #{order.stripeSessionId?.slice(-10).toUpperCase()}</h2>
                            <p className="text-sm text-gray-500">Placed: {new Date(order.createdAt).toLocaleString()}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100"><X size={20} /></button>
                    </header>
                    <main className="p-6 overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div><h3 className="font-semibold mb-1">Customer</h3><p className="text-sm">{order.customer?.name}<br />{order.customer?.email}</p></div>
                            <div><h3 className="font-semibold mb-1">Shipping Address</h3><p className="text-sm">{order.shippingAddress?.addressLine1}<br />{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p></div>
                        </div>
                        <h3 className="font-semibold mb-2">Order Items</h3>
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Product</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Unit Price</th><th className="p-2 text-right">Total</th></tr></thead>
                            <tbody className="divide-y">{order.orderItems?.map((item, i) => (<tr key={i}><td className="p-2">{item.name}</td><td className="p-2 text-center">{item.qty}</td><td className="p-2 text-right">{formatCurrency(item.price)}</td><td className="p-2 text-right font-semibold">{formatCurrency(item.price * item.qty)}</td></tr>))}</tbody>
                            <tfoot className="font-bold border-t-2"><tr><td colSpan="3" className="p-2 text-right">Grand Total</td><td className="p-2 text-right">{formatCurrency(order.totalPrice)}</td></tr></tfoot>
                        </table>
                    </main>
                    <footer className="flex justify-end p-4 bg-gray-50 border-t"><button onClick={onClose} className="px-4 py-2 text-sm bg-white border rounded-lg hover:bg-gray-100">Close</button></footer>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const StatusDropdown = ({ order, onStatusChange, isUpdating }) => (
    <select
        value={order.status}
        disabled={isUpdating}
        onChange={(e) => onStatusChange(order._id, e.target.value)}
        className="p-1.5 text-xs border rounded-md focus:ring-green-500 focus:border-green-500 disabled:opacity-70 disabled:bg-gray-100"
    >
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
    </select>
);
// --- END OF FIX ---


export default function AdminOrdersPage() {
    const queryClient = useQueryClient();
    const { isAuthenticated } = useAuth();

    const [selectedOrder, setSelectedOrder] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const { data: orders = [], isLoading, isError, error } = useQuery({
        queryKey: ['adminAllOrders'],
        queryFn: async () => {
            const { data } = await api.get('/orders');
            return Array.isArray(data) ? data : [];
        },
        enabled: isAuthenticated,
    });

    const { mutate: updateStatus } = useMutation({
        mutationFn: async ({ orderId, status }) => {
            setUpdatingId(orderId);
            return api.put(`/orders/${orderId}/status`, { status });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminAllOrders'] }),
        onError: (err) => alert(`Update Failed: ${err?.response?.data?.message || err.message}`),
        onSettled: () => setUpdatingId(null),
    });

    const handleStatusChange = (orderId, status) => {
        updateStatus({ orderId, status });
    };

    const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    
    // The rest of the component logic and JSX is correct as you had it.
    if (!isAuthenticated) { /* ... return login message ... */ }
    if (isLoading) { /* ... return loading spinner ... */ }
    if (isError) { /* ... return error message ... */ }

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <header className="mb-6"><h1 className="text-3xl font-bold text-gray-900">Orders</h1></header>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b"><h2 className="text-xl font-semibold text-gray-800">Order Management</h2></div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr><th className="p-3 text-left">Order ID</th><th className="p-3 text-left">Customer</th><th className="p-3 text-left">Date</th><th className="p-3 text-left">Total</th><th className="p-3 text-left">Status</th><th className="p-3 text-left">Payment</th><th className="p-3 text-left">Actions</th></tr>
                        </thead>
                        <tbody className="divide-y">
                            {orders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="p-3 font-mono">#{order.stripeSessionId?.slice(-10).toUpperCase()}</td>
                                    <td className="p-3 font-medium">{order.customer?.name}</td>
                                    <td className="p-3 text-gray-500">{formatDate(order.createdAt)}</td>
                                    <td className="p-3 font-medium">{formatCurrency(order.totalPrice)}</td>
                                    <td className="p-3">
                                        <StatusDropdown order={order} onStatusChange={handleStatusChange} isUpdating={updatingId === order._id} />
                                    </td>
                                    <td className="p-3"><Badge text={order.isPaid ? "PAID" : "PENDING"} /></td>
                                    <td className="p-3"><button onClick={() => setSelectedOrder(order)} className="flex items-center gap-2 text-gray-600 hover:text-blue-600"><Eye size={16} /> View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.length === 0 && (<div className="text-center py-12 text-gray-500"><Package /> No orders found.</div>)}
            </div>
            {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
        </div>
    );
}