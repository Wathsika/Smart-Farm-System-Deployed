// frontend/src/components/common/InvoiceTemplate.jsx
import React from 'react';

// This is the component that will be printed to PDF
export const InvoiceTemplate = React.forwardRef(({ order }, ref) => {
    
    if (!order) return null;
    const formatCurrency = (amount) => `Rs ${Number(amount || 0).toFixed(2)}`;

     // Calculate subtotal before discount and final total
    const discountAmount = order.discount?.amount || 0;
    const subTotal = Number(order.totalPrice || 0) + discountAmount;

    return (
        <div ref={ref} className="p-8 bg-white text-gray-800">
            {/* --- Header Section --- */}
            <header className="flex justify-between items-start pb-4 border-b-2 border-green-600">
                <div>
                    <h1 className="text-3xl font-bold text-green-700">GreenLeaf Farm</h1>
                    <p className="text-sm">123 Farm Valley Road, Green County, Sri Lanka</p>
                    <p className="text-sm">contact@greenleaffarm.com | +94 11 234 5678</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-semibold uppercase text-gray-500">Invoice</h2>
                    <p className="text-sm">Invoice #: {order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm">Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
            </header>

            {/* --- Customer Information --- */}
            <section className="grid grid-cols-2 gap-8 my-8">
                <div>
                    <h3 className="font-semibold mb-1">Bill To:</h3>
                    <p>{order.customer.name}</p>
                    <p>{order.shippingAddress.addressLine1}</p>
                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                    <p>{order.customer.email}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">Order Status: <span className="font-normal">{order.status}</span></p>
                    <p className="font-semibold">Payment Method: <span className="font-normal">Stripe (Credit Card)</span></p>
                </div>
            </section>

            {/* --- Order Items Table --- */}
            <section>
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-3 text-left font-semibold">Item Description</th>
                            <th className="p-3 text-center font-semibold">Quantity</th>
                            <th className="p-3 text-right font-semibold">Unit Price</th>
                            <th className="p-3 text-right font-semibold">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {order.orderItems.map((item, index) => (
                            <tr key={index}>
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-center">{item.qty}</td>
                                <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                                <td className="p-3 text-right font-medium">{formatCurrency(item.price * item.qty)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="border-t-2 border-gray-300">
                        <tr>
                            <td colSpan="3" className="p-3 text-right font-semibold">Subtotal</td>
                           <td className="p-3 text-right">{formatCurrency(subTotal)}</td>
                        </tr>
                          {discountAmount > 0 && (
                            <tr>
                                <td colSpan="3" className="p-3 text-right font-semibold">Discount</td>
                                <td className="p-3 text-right text-red-600">- {formatCurrency(discountAmount)}</td>
                            </tr>
                        )}
                        <tr className="bg-gray-100">
                                <td colSpan="3" className="p-3 text-right text-xl font-bold">Total</td>
                            <td className="p-3 text-right text-xl font-bold">{formatCurrency(order.totalPrice)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            {/* --- Footer / Thank You Note --- */}
            <footer className="mt-12 text-center text-gray-500 text-sm">
                <p>Thank you for your business!</p>
                <p>If you have any questions about this invoice, please contact us.</p>
            </footer>
        </div>
    );
});