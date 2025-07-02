import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// SVG Icons
const MedicineIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9h14m0 0l-4-4m4 4l-4 4M5 15h14m0 0l-4 4m4-4l-4-4" />
  </svg>
);

const HospitalIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const QuantityIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const PriceIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const RefreshIcon = ({ spinning }: { spinning: boolean }) => (
  <motion.svg
    animate={{ rotate: spinning ? 360 : 0 }}
    transition={{ duration: 1, repeat: spinning ? Infinity : 0, ease: "linear" }}
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </motion.svg>
);

const StatusPendingIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StatusCompletedIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const StatusCancelledIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ErrorIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

interface Order {
  id: number;
  med_name: string;
  price: string;
  quantity: number;
  pharma_buyer: string;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Processing';
  created_at: string;
  updated_at: string;
}

const OrdersDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

const fetchOrders = async () => {
  const ownerToken = localStorage.getItem('token');
  const userToken = localStorage.getItem('accessToken');

  let token = '';
  let apiUrl = '';

  if (ownerToken) {
    const pharmacyId = localStorage.getItem('pharmacy_id');
    if (!pharmacyId) {
      setError('Pharmacy ID not found.');
      toast.error('Pharmacy ID missing');
      return;
    }
    apiUrl = `https://smart-pharma-net.vercel.app/exchange/get/pharmcy_seller/orders/${pharmacyId}/`;
    token = ownerToken;
  } else if (userToken) {
    apiUrl = `https://smart-pharma-net.vercel.app/exchange/get/pharmcy_seller/orders`;
    token = userToken;
  } else {
    setError('Authentication required. Please login again.');
    toast.error('You need to login first');
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch orders: ${response.status}`);
    }

    const data = await response.json();
    setOrders(data);
    setError(null);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Network error occurred');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  const confirmComplete = (id: number) => {
    toast.info(
      <div className="p-2">
        <p className="font-medium">Are you sure you want to complete this order?</p>
        <p className="text-sm mt-1">By completing, you confirm the purchase and this action cannot be undone.</p>
        <div className="flex justify-end space-x-2 mt-3">
          <button 
            onClick={() => {
              toast.dismiss();
              updateOrderStatus(id, 'Completed');
            }}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            Confirm
          </button>
          <button 
            onClick={() => toast.dismiss()} 
            className="px-3 py-1 bg-gray-300 text-gray-800 rounded text-sm hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

const updateOrderStatus = async (
  id: number,
  newStatus: 'Pending' | 'Completed' | 'Cancelled'
) => {
  try {
    setUpdatingId(id);

    // الحصول على التوكن - تم تبسيط العملية
    const token = localStorage.getItem('token') 
    if (!token) {
      throw new Error('Authentication token not found');
    }

    console.log('Using token:', token); // لأغراض debugging

    const response = await fetch(
      `https://smart-pharma-net.vercel.app/exchange/update_status/${id}/`, // إضافة slash في النهاية
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      }
    );

    console.log('Response status:', response.status); // لأغراض debugging

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.error("API Error Details:", errorData);
      } catch (e) {
        console.error("Failed to parse error response");
      }
      
      throw new Error(
        errorData?.detail || 
        errorData?.message || 
        `Failed to update status: ${response.status} ${response.statusText}`
      );
    }

    // قراءة البيانات فقط إذا كان هناك محتوى
    const data = response.status !== 204 ? await response.json() : null;
    console.log('Update successful, response:', data);

    // تحديث الواجهة
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );

    toast.success(`Order #${id} status updated to ${newStatus} successfully!`, {
      position: "top-right",
      autoClose: 3000,
    });

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update status';
    console.error("Update error:", errorMessage);
    
    setError(errorMessage);
    toast.error(`Failed to update order status: ${errorMessage}`, {
      position: "top-right",
      autoClose: 3000,
    });
    
  } finally {
    setUpdatingId(null);
  }
};

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending':
        return { 
          bg: 'bg-indigo-100', 
          text: 'text-indigo-800', 
          icon: <StatusPendingIcon /> 
        };
      case 'Completed':
        return { 
          bg: 'bg-green-100', 
          text: 'text-green-800', 
          icon: <StatusCompletedIcon /> 
        };
      case 'Processing':
        return { 
          bg: 'bg-yellow-100', 
          text: 'text-yellow-800', 
          icon: <RefreshIcon spinning={true} /> 
        };
      case 'Cancelled':
        return { 
          bg: 'bg-red-100', 
          text: 'text-red-800', 
          icon: <StatusCancelledIcon /> 
        };
      default:
        return { 
          bg: 'bg-gray-100', 
          text: 'text-gray-800', 
          icon: <StatusPendingIcon /> 
        };
    }
  };

  const formatPrice = (price: string) => {
    const amount = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(isNaN(amount) ? 0 : amount);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4"
      >
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 1.5, 
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full flex items-center justify-center"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ 
              repeat: Infinity,
              duration: 1.5,
              delay: 0.2
            }}
          >
            <MedicineIcon />
          </motion.div>
        </motion.div>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 text-gray-700 font-medium text-lg"
        >
          Loading your pharmacy orders...
        </motion.p>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer />
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: 1,
          transition: { duration: 0.5, ease: "easeOut" }
        }}
        className="p-4 md:p-8 max-w-7xl mx-auto  "
      >
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            transition: { 
              type: 'spring', 
              stiffness: 300,
              damping: 20
            }
          }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pt-20"
        >
          <div>
            <motion.h1 
              initial={{ x: -20 }}
              animate={{ x: 0 }}
              className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center"
            >
              <motion.span
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  transition: { 
                    duration: 0.6,
                    repeat: 1 
                  }
                }}
                className="inline-block mr-3"
              >
                <MedicineIcon />
              </motion.span>
              Pharmacy Orders Dashboard
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: 1,
                transition: { delay: 0.3 }
              }}
              className="text-gray-600 mt-1 text-sm md:text-base"
            >
              {orders.length} {orders.length === 1 ? 'order' : 'orders'} found
            </motion.p>
          </div>
          
          <motion.button
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
            }}
            whileTap={{ 
              scale: 0.95,
              boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.1)'
            }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-all text-sm md:text-base"
          >
            <RefreshIcon spinning={refreshing} />
            <span className="ml-2">
              {refreshing ? 'Refreshing...' : 'Refresh Orders'}
            </span>
          </motion.button>
        </motion.header>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                transition: { 
                  type: 'spring', 
                  stiffness: 500,
                  damping: 20
                }
              }}
              exit={{ opacity: 0 }}
              className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-lg shadow"
              role="alert"
            >
              <div className="flex items-center">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: 2, duration: 0.5 }}
                >
                  <ErrorIcon />
                </motion.div>
                <div className="ml-3">
                  <strong className="font-bold">Error: </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Orders Table */}
        {orders.length === 0 ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ 
              scale: 1, 
              opacity: 1,
              transition: { 
                type: 'spring', 
                bounce: 0.4,
                duration: 0.6
              }
            }}
            className="bg-white rounded-xl shadow-lg p-8 text-center"
          >
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                transition: { 
                  repeat: Infinity,
                  duration: 3,
                  ease: "easeInOut"
                }
              }}
            >
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.div>
            <h3 className="mt-4 text-lg md:text-xl font-medium text-gray-900">No orders found</h3>
            <p className="mt-2 text-gray-500 text-sm md:text-base">Your pharmacy doesn't have any orders yet.</p>
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <RefreshIcon spinning={false} />
                <span className="ml-2">Refresh Orders</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: 1,
              transition: { delay: 0.2 }
            }}
            className="bg-white shadow-lg rounded-xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Medicine</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {orders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                          opacity: 1, 
                          y: 0,
                          transition: { 
                            type: 'spring', 
                            stiffness: 300,
                            damping: 15
                          }
                        }}
                        exit={{ opacity: 0 }}
                        whileHover={{ 
                          scale: 1.01,
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                          zIndex: 10
                        }}
                        className="relative hover:shadow-md"
                      >
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <motion.div 
                              whileHover={{ rotate: 15 }}
                              className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center"
                            >
                              <MedicineIcon />
                            </motion.div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{order.med_name}</div>
                              <div className="text-sm text-gray-500">ID: {order.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <HospitalIcon />
                            <div className="ml-2 text-sm text-gray-900 font-medium">{order.pharma_buyer}</div>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <QuantityIcon />
                            <span className="ml-1">{order.quantity}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 flex items-center">
                            <PriceIcon />
                            <span className="ml-1">{formatPrice(order.price)}</span>
                          </div>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                          <motion.span 
                            whileHover={{ scale: 1.1 }}
                            className={`px-2 md:px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status).bg} ${getStatusColor(order.status).text}`}
                          >
                            <span className="mr-1">
                              {getStatusColor(order.status).icon}
                            </span>
                            {order.status}
                          </motion.span>
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => confirmComplete(order.id)}
                              disabled={order.status === 'Completed' || updatingId === order.id}
                              className={`px-2 md:px-3 py-1 rounded-md text-xs ${order.status === 'Completed' ? 'bg-green-200 text-green-800 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}
                            >
                              {updatingId === order.id && order.status !== 'Completed' ? (
                                <motion.span
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="inline-block w-3 h-3 border-2 border-green-500 border-t-transparent rounded-full"
                                />
                              ) : (
                                'Complete'
                              )}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => updateOrderStatus(order.id, 'Cancelled')}
                              disabled={order.status === 'Cancelled' || updatingId === order.id}
                              className={`px-2 md:px-3 py-1 rounded-md text-xs ${order.status === 'Cancelled' ? 'bg-red-200 text-red-800 cursor-not-allowed' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default OrdersDashboard;