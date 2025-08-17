import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../lib/api';
import InvoiceModal from '../../components/common/InvoiceModal';
import { useCart } from '../../context/CartContext';

const OrderSuccessPage = () => {
    const { clearCart } = useCart();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [order, setOrder] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);
    const [autoPrint, setAutoPrint] = useState(false);

     // Clear the cart when the success page loads
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    // මෙම පිටුවට ආ විගස cart එක clear කරනවා.
    useEffect(() => {
        const fetchOrder = async () => {
            if (!sessionId) return;
            try {
                const { data } = await api.get('/orders/myorders');
                const found = data.find(o => o.stripeSessionId === sessionId);
                setOrder(found);
            } catch (err) {
                console.error('Failed to fetch order', err);
            }
        };
        fetchOrder();
    }, [sessionId]);

    const handleDownloadInvoice = () => {
        setShowInvoice(true);
        setAutoPrint(true);
    };


    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-lg">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-4xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Thank You!</h1>
                <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
                <p className="text-gray-500 text-sm mt-1">You will receive an email confirmation shortly.</p>
                {order && (
                    <button
                        onClick={handleDownloadInvoice}
                        className="mt-6 inline-block bg-gray-100 text-gray-800 px-6 py-2 rounded-lg font-semibold hover:bg-gray-200"
                    >
                        Download Invoice
                    </button>
                )}
                <Link to="/store" className="mt-4 inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                    Continue Shopping
                </Link>
            </div>
            {order && (
                <InvoiceModal
                    order={order}
                    isOpen={showInvoice}
                    onClose={() => { setShowInvoice(false); setAutoPrint(false); }}
                    autoPrint={autoPrint}
                />
            )}
        </div>
    );
};

export default OrderSuccessPage;