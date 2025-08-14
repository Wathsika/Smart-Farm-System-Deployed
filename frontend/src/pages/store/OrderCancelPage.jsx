import React from 'react';
import { Link } from 'react-router-dom';

const OrderCancelPage = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-lg">
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-times text-4xl"></i>
                </div>
                <h1 className="text-3xl font-bold text-gray-800">Order Cancelled</h1>
                <p className="text-gray-600 mt-2">Your order was not processed.</p>
                <p className="text-gray-500 text-sm mt-1">Your cart has been saved if you'd like to try again.</p>
                <Link to="/cart" className="mt-8 inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700">
                    Back to Cart
                </Link>
            </div>
        </div>
    );
};

export default OrderCancelPage;