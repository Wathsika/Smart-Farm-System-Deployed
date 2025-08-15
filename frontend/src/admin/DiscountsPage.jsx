import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api'; // Correct path from src/admin/ to src/lib/
import { PlusCircle, Search, Edit, Trash2, Loader2, Tag } from 'lucide-react';
import DiscountModal from './DiscountModal'; // Correct path for file in same directory

const Badge = ({ text, type }) => {
    const types = { ACTIVE: 'bg-green-100 text-green-800', EXPIRED: 'bg-gray-200 text-gray-800' };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${types[type]}`}>{text}</span>;
};

export default function AdminDiscountsPage() { // Renamed to match import in App.jsx
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['discounts'],
        queryFn: async () => (await api.get('/discounts')).data
    });
    const discounts = data?.items || [];
    
    const { mutate: saveDiscount, isLoading: isSaving } = useMutation({
        mutationFn: ({ payload, id }) => id ? api.put(`/discounts/${id}`, payload) : api.post('/discounts', payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts'] });
            handleCloseModal();
        },
        onError: (error) => alert(error.response?.data?.message || "Failed to save discount."),
    });

    const { mutate: deleteDiscount } = useMutation({
        mutationFn: (id) => api.delete(`/discounts/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discounts'] });
        },
        onError: (error) => alert(error.response?.data?.message || "Failed to delete discount."),
    });

    const handleOpenModal = (discount = null) => {
        setEditingDiscount(discount);
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingDiscount(null);
    };
    const handleSave = (payload, id = null) => {
        saveDiscount({ payload, id });
    };
    const handleDelete = (id) => {
        if (window.confirm("Are you sure? This will permanently delete the discount code.")) {
            deleteDiscount(id);
        }
    };
    
    const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
    const getStatus = (discount) => {
        const now = new Date();
        const endDate = new Date(discount.endDate);
        if (!discount.isActive || now > endDate) return "Expired";
        return "Active";
    };

    if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;
    if (isError) return <div className="p-8 text-red-500 text-center">Failed to load discounts.</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <header className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Discounts</h1>
                    <p className="text-gray-500">Create and manage coupon codes for your store.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                    <PlusCircle size={20} /> Create Discount
                </button>
            </header>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">All Discounts</h2>
                    <div className="relative"><input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 border rounded-md" /><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50"><tr><th className="p-3 text-left">Name</th><th className="p-3 text-left">Code</th><th className="p-3 text-left">Value</th><th className="p-3 text-left">Min Purchase</th><th className="p-3 text-left">Start Date</th><th className="p-3 text-left">End Date</th><th className="p-3 text-left">Status</th><th className="p-3 text-right">Actions</th></tr></thead>
                        <tbody className="divide-y">
                            {discounts.map(discount => (
                                <tr key={discount._id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">{discount.name}</td>
                                    <td className="p-3"><span className="font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded">{discount.code}</span></td>
                                    <td className="p-3">{discount.type === 'PERCENTAGE' ? `${discount.value}%` : `Rs ${discount.value.toFixed(2)}`}</td>
                                    <td className="p-3">{discount.minPurchase > 0 ? `Rs ${discount.minPurchase.toFixed(2)}` : '–'}</td>
                                    <td className="p-3 text-gray-500">{formatDate(discount.startDate)}</td>
                                    <td className="p-3 text-gray-500">{formatDate(discount.endDate)}</td>
                                    <td className="p-3"><Badge text={getStatus(discount)} type={getStatus(discount) === 'Active' ? 'ACTIVE' : 'EXPIRED'} /></td>
                                    <td className="p-3 text-right">
                                        <div className="flex gap-4 justify-end">
                                            <button onClick={() => handleOpenModal(discount)} className="text-gray-500 hover:text-blue-600" title="Edit"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(discount._id)} className="text-gray-500 hover:text-red-600" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {discounts.length === 0 && !isLoading && <div className="text-center py-12 text-gray-500"><Tag className="mx-auto mb-2 text-gray-400" size={48} /> No discounts found.</div>}
            </div>
            <DiscountModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSave} discountToEdit={editingDiscount} isSaving={isSaving}/>
        </div>
    );
}