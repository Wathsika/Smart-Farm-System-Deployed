import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

// This is a simple badge to show the order status
const OrderStatusBadge = ({ status }) => {
    const statusMap = {
      PENDING: "bg-yellow-100 text-yellow-800",
      PROCESSING: "bg-blue-100 text-blue-800",
      SHIPPED: "bg-indigo-100 text-indigo-800",
      DELIVERED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return (
        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${statusMap[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
};

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const formatCurrency = (amount) => `Rs ${amount.toFixed(2)}`;
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // We need to create this backend endpoint next
                const res = await api.get('/orders');
                setOrders(res.data.items || []);
            } catch (err) {
                setError("Failed to fetch orders.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    if (loading) return <div className="p-6">Loading orders...</div>;
    if (error) return <div className="p-6 text-red-500">{error}</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Order Management</h1>
                    <p className="text-sm text-gray-500">View and manage all incoming orders.</p>
                </div>

                {/* Orders Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                            <tr>
                                <th className="px-4 py-3 font-semibold text-gray-600">Date</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Customer</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Total</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Status</th>
                                <th className="px-4 py-3 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {orders.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-10 text-gray-500">
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map(order => (
                                    <tr key={order._id}>
                                        <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800">{order.customer.name}</td>
                                        <td className="px-4 py-3">{formatCurrency(order.totals.totalPrice)}</td>
                                        <td className="px-4 py-3"><OrderStatusBadge status={order.orderStatus} /></td>
                                        <td className="px-4 py-3">
                                            {/* We will add update status functionality here later */}
                                            <button className="text-blue-600 hover:underline">View Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}