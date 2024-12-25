import React, { useEffect, useState } from 'react';
import { getDatabase, ref, onValue, update } from 'firebase/database';
import { 
  Package, 
  Clock, 
  Truck, 
  CreditCard,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  X
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

const Loader = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32"></div>
  </div>
);

const TrackOrder = () => {
  const [orders, setOrders] = useState({});
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllOrders = () => {
      const db = getDatabase();
      const ordersRef = ref(db, 'orders');
      const uid = localStorage.getItem('uid');
      console.log('UID from localStorage:', uid); // Debugging UID

      if (!uid) {
        console.error('No UID found in localStorage');
        setLoading(false);
        return;
      }

      onValue(ordersRef, (snapshot) => {
        if (snapshot.exists()) {
          const allOrders = snapshot.val();
          console.log('All Orders:', allOrders); // Debugging all orders
          const userOrders = Object.fromEntries(
            Object.entries(allOrders).filter(([orderId, order]) => {
              console.log(`Order ID: ${orderId}, Order UID: ${order.uid}`); // Debugging each order's UID
              return order.uid === uid;
            })
          );
          console.log('Filtered User Orders:', userOrders); // Debugging filtered orders
          setOrders(userOrders);
        } else {
          console.log('No orders found in the database');
        }
        setLoading(false);
      });
    };

    fetchAllOrders();
  }, []);

  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation();
    try {
      const db = getDatabase();
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, {
        status: 'cancelled',
        deliveryStatus: 'cancelled'
      });
      
      setOrders(prev => ({
        ...prev,
        [orderId]: {
          ...prev[orderId],
          status: 'cancelled',
          deliveryStatus: 'cancelled'
        }
      }));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusDot = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      cod: 'bg-purple-500',
    };

    const bgColor = colors[status.toLowerCase()] || 'bg-gray-500';

    return (
      <span className={`w-3 h-3 rounded-full ${bgColor}`} />
    );
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-500',
      processing: 'bg-blue-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500',
      cod: 'bg-purple-500',
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      processing: <Package className="w-4 h-4" />,
      cod: <CreditCard className="w-4 h-4" />,
      delivering: <Truck className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };

    const bgColor = colors[status.toLowerCase()] || 'bg-gray-500';
    const icon = icons[status.toLowerCase()] || <AlertCircle className="w-4 h-4" />;

    return (
      <span className={`${bgColor} text-white px-3 py-1 text-sm flex items-center gap-1 transition-all duration-300 hover:opacity-90`}>
        {icon}
        {status}
      </span>
    );
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Orders</h1>

      <div className="grid gap-6">
        {Object.entries(orders).map(([orderId, order]) => (
          <motion.div 
            key={orderId} 
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              bg-white shadow-sm border border-gray-100 
              transition-all duration-300 ease-in-out 
              hover:shadow-lg hover:border-gray-200
              ${expandedOrder === orderId ? 'fixed inset-0 z-50 p-6 bg-white overflow-auto rounded-lg' : 'rounded-lg'}
            `}
            onClick={() => setExpandedOrder(expandedOrder === orderId ? null : orderId)}
          >
            {/* Preview Card */}
            <div className="p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 overflow-hidden">
                  <img 
                    src={order.items[0].image || 'https://via.placeholder.com/150'}
                    alt={order.items[0].name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-gray-800">#{order.id?.slice(-8)}</h3>
                    {getStatusDot(order.status)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {formatDate(order.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-4 sm:mt-0">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">${order.total.toFixed(2)}</p>
                  <p className="text-sm text-gray-500">{order.items.length} items</p>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            <AnimatePresence>
              {expandedOrder === orderId && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="overflow-hidden transition-all duration-300 ease-in-out"
                >
                  <div className="border-t p-5 space-y-6 transition-all duration-300 ease-in-out">
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-800">Order Details</h2>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedOrder(null);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    {/* Order Details Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Status Information</h3>
                          <div className="flex flex-wrap gap-2">
                            {getStatusBadge(order.deliveryStatus)}
                            {getStatusBadge(order.paymentMethod)}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-sm font-semibold text-gray-600 mb-2">Price Summary</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subtotal:</span>
                              <span className="font-medium">${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Shipping:</span>
                              <span className="font-medium">${order.shippingFee.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between pt-2 border-t">
                              <span className="font-semibold">Total:</span>
                              <span className="font-bold text-blue-600">${order.total.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Detailed Items */}
                      <div className="space-y-3">
                        {order.items.map((item, index) => (
                          <div 
                            key={index} 
                            className="flex gap-3 p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200 transition-all duration-300 ease-in-out"
                          >
                            <div className="w-16 h-16 overflow-hidden">
                              <img 
                                src={item.image || 'https://via.placeholder.com/150'}
                                alt={item.name}
                                className="w-full h-full object-cover transform transition-transform duration-300 hover:scale-110"
                                onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150'; }}
                              />
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-gray-800">{item.name}</h4>
                              <div className="mt-1 text-sm text-gray-600">
                                <span className="inline-block px-2 py-0.5 bg-gray-200 text-xs mr-2">
                                  {item.color}
                                </span>
                                <span className="inline-block px-2 py-0.5 bg-gray-200 text-xs">
                                  Size: {item.size}
                                </span>
                              </div>
                              <p className="mt-1 text-sm font-medium text-gray-700">
                                ${item.price.toFixed(2)} × {item.quantity}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Cancel Button */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={(e) => handleCancelOrder(orderId, e)}
                        disabled={order.status === 'cancelled' || order.status === 'completed'}
                        className={`
                          px-4 py-2 text-white flex items-center gap-2
                          transition-all duration-300 transform hover:scale-105
                          ${order.status === 'cancelled' || order.status === 'completed'
                            ? 'bg-gray-400 cursor-not-allowed opacity-50'
                            : 'bg-red-500 hover:bg-red-600 hover:shadow-md'}
                        `}
                      >
                        <XCircle className="w-4 h-4" />
                        Cancel Order
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrackOrder;