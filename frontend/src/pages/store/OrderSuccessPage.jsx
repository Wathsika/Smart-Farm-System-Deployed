import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const OrderSuccessPage = () => {
    const { clearCart } = useCart();  

    // මෙම පිටුවට ආ විගස cart එක clear කරනවා.
    useEffect(() => {
        clearCart();
    }, [clearCart]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-lg">
                 <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-check text-4xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Thank You!</h1>
                <p className="text-gray-600 mt-2">Your order has been placed successfully.</p>
                <p className="text-gray-500 text-sm mt-1">You will receive an email confirmation shortly.</p>
                <Link to="/store" className="mt-8 inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccessPage;