import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import ReviewModal from '../pages/ReviewModal.jsx';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Icons & Modals
import { Package, XCircle, FileText, Loader2, Check } from 'lucide-react';
import InvoiceModal from '../components/common/InvoiceModal';

const getOrderDisplayId = (order) => {
  if (!order) return '#ORDER';
  if (order.orderNumber) return order.orderNumber;
  const fallback =
    order.stripeSessionId?.slice(-10)?.toUpperCase() ||
    (order._id ? String(order._id).slice(-6).toUpperCase() : undefined);
  return fallback ? `#${fallback}` : '#ORDER';
};

// Status tracker
const StatusTracker = ({ status }) => {
  const statuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
  const currentStatusIndex = statuses.indexOf(status);

  if (status === 'CANCELLED') {
    return (
      <div className="text-red-600 font-bold flex items-center gap-2">
        <XCircle size={18} /> Order Cancelled
      </div>
    );
  }

  return (
    <div className="flex items-center w-full">
      {statuses.map((s, index) => (
        <React.Fragment key={s}>
          <div className="flex flex-col items-center text-center w-1/3">
            <div
              className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                index <= currentStatusIndex
                  ? 'bg-green-600 border-green-600'
                  : 'bg-white border-gray-300'
              }`}
            >
              {index <= currentStatusIndex && <Check className="text-white" size={16} />}
            </div>
            <span
              className={`text-xs mt-2 font-semibold ${
                index <= currentStatusIndex ? 'text-gray-800' : 'text-gray-400'
              }`}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </span>
          </div>
          {index < statuses.length - 1 && (
            <div
              className={`flex-1 h-1 transition-colors duration-300 mx-2 ${
                index < currentStatusIndex ? 'bg-green-600' : 'bg-gray-300'
              }`}
            ></div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function MyOrdersPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [viewingOrder, setViewingOrder] = useState(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [selectedReviewItem, setSelectedReviewItem] = useState(null);

  // Fetch orders
  const { data: orders = [], isLoading, isError } = useQuery({
    queryKey: ['myOrders', user?.email],
    queryFn: async () => {
      const { data } = await api.get('/orders/myorders');
      return data;
    },
    enabled: !!user,
  });

  // Cancel order
  const { mutate: cancelOrder, isLoading: isCancelling } = useMutation({
    mutationFn: (orderId) => api.put(`/orders/${orderId}/cancel`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders', user?.email] });
      alert('Your order has been successfully cancelled.');
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to cancel the order.');
    },
  });

  // Reviews
  const { mutate: submitReview, isLoading: isSubmittingReview } = useMutation({
    mutationFn: ({ orderId, orderItemId, rating, comment }) =>
      api.post(`/orders/${orderId}/reviews`, { orderItemId, rating, comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myOrders', user?.email] });
      alert('Your review has been saved.');
      setSelectedReviewItem(null);
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to save the review.');
    },
  });

  // Live status updates via SSE
  useEffect(() => {
    if (!user) return;
    const eventsUrl = `${api.defaults.baseURL}/orders/events`;
    const eventSource = new EventSource(eventsUrl);
    eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        queryClient.setQueryData(['myOrders', user.email], (old = []) =>
          old.map((o) => (o._id === payload.orderId ? { ...o, status: payload.status } : o))
        );
      } catch {
        /* ignore malformed events */
      }
    };
    return () => eventSource.close();
  }, [queryClient, user]);

  // Handlers
  const handleCancelOrder = (orderId) => {
    if (
      window.confirm(
        'Are you sure you want to cancel this order? This will restock the items and cannot be undone.'
      )
    ) {
      cancelOrder(orderId);
    }
  };

  const handleDownloadInvoice = (order) => {
    setViewingOrder(order);
    setAutoPrint(true);
  };

  const handleOpenReview = (order, item) => {
    setSelectedReviewItem({
      orderId: order._id,
      orderItemId: item._id || item.product,
      itemName: item.name,
      existingReview: item.review || null,
    });
  };

  const handleCloseReview = () => setSelectedReviewItem(null);

  const handleSubmitReview = ({ rating, comment }) => {
    if (!selectedReviewItem) return;
    submitReview({
      orderId: selectedReviewItem.orderId,
      orderItemId: selectedReviewItem.orderItemId,
      rating,
      comment,
    });
  };

  // Loading/Error
  if (isLoading) {
    return (
      <>
        <Header />
        <div className="flex justify-center items-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
        <Footer />
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header />
        <div className="p-8 text-center text-red-500 min-h-[60vh]">
          Could not load your orders. Please ensure you are logged in and try again.
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
            <p className="text-gray-600">View the history and status of all your past purchases.</p>
          </header>

          <div className="space-y-6">
            {orders.length === 0 ? (
              <div className="text-center bg-white p-12 rounded-xl shadow-sm">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800">
                  You haven&apos;t placed any orders yet.
                </h2>
                <p className="text-gray-500 mt-2">All your future purchases will appear here.</p>
                <Link
                  to="/store"
                  className="mt-6 inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order._id}
                  className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b">
                    <div>
                      <h2 className="font-bold text-lg text-gray-800">
                        Order {getOrderDisplayId(order)}
                      </h2>
                      <p className="text-sm text-gray-500">
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="font-bold text-lg mt-2 md:mt-0 text-gray-900">
                      Total: Rs {Number(order.totalPrice || 0).toFixed(2)}
                    </div>
                  </div>

                  <div className="mb-6">
                    <StatusTracker status={order.status} />
                  </div>

                  <div className="flex flex-col gap-6 border-t pt-4">
                    <div className="space-y-4">
                      {order.orderItems.map((item) => (
                        <div
                          key={item._id || item.product}
                          className="flex flex-col md:flex-row gap-4 border border-gray-200 rounded-lg p-4 bg-gray-50"
                        >
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-24 h-24 object-cover rounded-md border"
                            />
                          )}

                          <div className="flex-1 space-y-2">
                            <div>
                              <h3 className="text-base font-semibold text-gray-800">{item.name}</h3>
                              <p className="text-sm text-gray-500">
                                Qty: {item.qty} &bull; Unit Price: Rs{' '}
                                {Number(item.price ?? 0).toFixed(2)}
                              </p>
                              {/* Removed current stock display as requested */}
                            </div>

                            {item.review ? (
                              <div className="bg-white border border-green-200 rounded-lg p-3 text-sm text-gray-700">
                                <p className="font-semibold text-green-700">Your review</p>
                                <p className="mt-1">Rating: {item.review.rating} / 5</p>
                                {item.review.comment && (
                                  <p className="mt-2 text-gray-600 whitespace-pre-line">
                                    {item.review.comment}
                                  </p>
                                )}
                                {order.status === 'DELIVERED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleOpenReview(order, item)}
                                    className="mt-3 inline-flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-green-700 bg-green-100 rounded-md hover:bg-green-200"
                                  >
                                    Edit review
                                  </button>
                                )}
                              </div>
                            ) : (
                              order.status === 'DELIVERED' && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenReview(order, item)}
                                  className="inline-flex items-center justify-center self-start px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700"
                                >
                                  Leave review
                                </button>
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                      <div className="text-sm text-gray-500">
                        Contains {order.orderItems.length} item(s)
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleDownloadInvoice(order)}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200"
                        >
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
                </div>
              ))
            )}
          </div>
        </div>

        {/* Modals */}
        <InvoiceModal
          isOpen={!!viewingOrder}
          onClose={() => {
            setViewingOrder(null);
            setAutoPrint(false);
          }}
          order={viewingOrder}
          autoPrint={autoPrint}
        />

        <ReviewModal
          isOpen={!!selectedReviewItem}
          onClose={handleCloseReview}
          onSubmit={handleSubmitReview}
          itemName={selectedReviewItem?.itemName}
          isSubmitting={isSubmittingReview}
          initialReview={selectedReviewItem?.existingReview}
        />
      </div>
      <Footer />
    </>
  );
}
