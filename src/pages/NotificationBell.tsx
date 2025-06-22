import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaTimes } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

interface Notification {
  id: string;
  med_name: string;
  price: string;
  quantity: number;
  pharma_buyer: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface HistoryNotification {
  id: number;
  message: string;
  created_at: string;
  pharmacy: number;
  order: number;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [actionHistory, setActionHistory] = useState<{med_name: string; action: string; timestamp: string}[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<HistoryNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'history'>('notifications');

  const fetchNotifications = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error('No access token found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/exchange/get/pharmcy_seller/orders', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => n.status === 'Pending').length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

 const fetchHistoryNotifications = async () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.error('No access token found');
    toast.error('Authentication required');
    return;
  }

  setIsHistoryLoading(true);
  try {
    const response = await fetch('https://smart-pharma-net.vercel.app/exchange/get_notification/', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      toast.error(errorData.message || 'Failed to fetch notifications');
      return;
    }

    const data = await response.json();
    console.log('History notifications data:', data); // لأغراض debugging
    setHistoryNotifications(data);
  } catch (error) {
    console.error('Error fetching history notifications:', error);
    toast.error('Failed to load history notifications');
  } finally {
    setIsHistoryLoading(false);
  }
};



  const updateNotificationStatus = async (id: string, newStatus: 'Pending' | 'Completed' | 'Cancelled', med_name: string) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      const response = await fetch(`https://smart-pharma-net.vercel.app/exchange/update_status/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to update status');
      }

      // Add to action history
      const actionText = newStatus === 'Completed' ? 'completed' : 'cancelled';
      setActionHistory(prev => [
        {
          med_name: med_name,
          action: actionText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        ...prev
      ]);

      toast.success(`${med_name} marked as ${actionText}`);

      // Optimistically update the local state
      setNotifications(prev => prev.map(n => 
        n.id === id ? {...n, status: newStatus} : n
      ));
      setUnreadCount(prev => newStatus === 'Pending' ? prev + 1 : prev);
      
    } catch (error) {
      console.error('Error updating notification status:', error);
      toast.error(`Failed to update status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchHistoryNotifications();
    
    const interval = setInterval(() => {
      fetchNotifications();
      fetchHistoryNotifications();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const markAsRead = () => {
    setUnreadCount(0);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <motion.button 
          onClick={() => {
            setIsOpen(!isOpen);
            if (unreadCount > 0 && isOpen === false) {
              markAsRead();
            }
          }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors relative"
        >
          <FaBell className="text-gray-700 text-xl" />
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
            >
              {unreadCount}
            </motion.span>
          )}
        </motion.button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200"
          >
            <div className="flex border-b border-gray-200">
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'notifications' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => setActiveTab('notifications')}
              >
                Orders ({notifications.length})
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                onClick={() => {
                  setActiveTab('history');
                  fetchHistoryNotifications();
                }}
              >
                Important({historyNotifications.length})
              </button>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {isLoading && activeTab === 'notifications' ? (
                <div className="p-4 text-center text-gray-500">Loading...</div>
              ) : isHistoryLoading && activeTab === 'history' ? (
                <div className="p-4 text-center text-gray-500">Loading history...</div>
              ) : activeTab === 'notifications' ? (
                notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No pending orders</div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-3 border-b border-gray-100 ${
                        notification.status === 'Pending' ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <h4 className="font-medium text-gray-800">
                          {notification.med_name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.status === 'Pending' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : notification.status === 'Completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                        }`}>
                          {notification.status}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-600">
                        <span className="font-semibold">Qty:</span> {notification.quantity} | 
                        <span className="font-semibold"> Price:</span> {notification.price}
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-500">
                        <span className="font-semibold">From:</span> {notification.pharma_buyer}
                      </div>
                      
                      <div className="mt-1 text-xs text-gray-400">
                        {formatTime(notification.created_at)}
                      </div>
                      
                     
                    </motion.div>
                  ))
                )
              ) : (
                historyNotifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  historyNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-3 border-b border-gray-100"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                          <FaBell />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            Order #{notification.order} • {formatTime(notification.created_at)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )
              )}
            </div>
            
            <div className="p-2 border-t border-gray-200 bg-gray-50 text-center">
              <button 
                onClick={() => setIsOpen(false)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default NotificationBell;