import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiSearch, FiShoppingCart, FiMapPin, FiDollarSign, 
  FiPackage, FiHome, FiChevronLeft, FiChevronRight,
  FiPlus, FiMinus, FiHeart, FiShare2, FiX,
  FiArrowLeft,
  FiInfo
} from 'react-icons/fi';
// @ts-ignore

import L, { TileLayer } from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet
const DefaultIcon = L.icon({
  iconUrl: '/images/marker-icon.png',
  iconRetinaUrl: '/images/marker-icon-2x.png',
  shadowUrl: '/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Dynamically import the map component to avoid SSR issues
const MapWithNoSSR = lazy(() => import('./PharmacyMap'));

      
      


interface Medicine {
  id: string;
  medicine_name: string;
  medicine_id: number;
  medicine_price_to_sell: string;
  medicine_quantity_to_sell: string;
  pharmacy_name: string;
  pharmacy_id: number; 
  pharmacy_latitude: string;
  pharmacy_longitude: string;
}
const Exchange: React.FC = () => {
 const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedMedicineForDetails, setSelectedMedicineForDetails] = useState<Medicine | null>(null);
  const [selectedMedicineForBuy, setSelectedMedicineForBuy] = useState<Medicine | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [showMap, setShowMap] = useState<boolean>(false);
  const [showBuyModal, setShowBuyModal] = useState<boolean>(false);
  const itemsPerPage = 6;
  const navigate = useNavigate();
 
 
  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      toast.error('Session expired. Please login again.');
      navigate('/pharmacy-login');
      return false;
    }

    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/account/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      localStorage.setItem('accessToken', data.access);
      return true;
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('Session expired. Please login again.');
      navigate('/pharmacy-login');
      return false;
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      await refreshToken();
    }, 10 * 60 * 1000); 

    return () => clearInterval(interval);
  }, []);

  const fetchMedicines = async (): Promise<void> => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setError('Authentication required - Please login first');
      setLoading(false);
      toast.error('You need to login first');
      navigate('/pharmacy-login');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/exchange/exchange_list/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshed = await refreshToken();
          if (refreshed) {
            // Retry with new token
            const newToken = localStorage.getItem('accessToken');
            const retryResponse = await fetch('https://smart-pharma-net.vercel.app/exchange/exchange_list/', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json',
              },
            });

            if (!retryResponse.ok) {
              throw new Error(`HTTP error! status: ${retryResponse.status}`);
            }

            const data: Medicine[] = await retryResponse.json();
            const dataWithIds = data.map((item, index) => ({
              ...item,
              id: `${item.medicine_name}-${index}-${Date.now()}`
            }));
            setMedicines(dataWithIds);
            setError(null);
            return;
          }
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: Medicine[] = await response.json();
      const dataWithIds = data.map((item, index) => ({
        ...item,
        id: `${item.medicine_name}-${index}-${Date.now()}`
      }));
      setMedicines(dataWithIds);
      setError(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);    
    






  useEffect(() => {
    const fetchMedicines = async () => {
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        setError('Authentication required - Please login first');
        setLoading(false);
        toast.error('You need to login first');
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('https://smart-pharma-net.vercel.app/exchange/exchange_list/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Session expired - Please login again');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Medicine[] = await response.json();
        const dataWithIds = data.map((item, index) => ({
          ...item,
          id: `${item.medicine_name}-${index}-${Date.now()}`
        }));
        setMedicines(dataWithIds);
        setError(null);
      } catch (err) {
        const error = err as Error;
        setError(error.message);
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);
 const handleBuyClick = (medicine: Medicine) => {
    setSelectedMedicineForBuy(medicine);
    setSelectedMedicineForDetails(null);
    setQuantity(1);
    setShowBuyModal(true);
  };



const handleBuyOrder = async () => {
  if (!selectedMedicineForBuy) return;
    const pharmacyBuyer = localStorage.getItem('pharmacyName') || 'Unknown Buyer';


 const orderData = {
  medicine_name: selectedMedicineForBuy.medicine_name,
  price: selectedMedicineForBuy.medicine_price_to_sell,
  quantity: quantity,
  pharmacy_seller: selectedMedicineForBuy.pharmacy_name,
  pharmacy_buyer: pharmacyBuyer, 

  status: "Pending"
};


  console.log("Order Data Being Sent:", orderData);

  try {
    const response = await fetch('https://smart-pharma-net.vercel.app/exchange/buy/order', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Request failed");
    }

    toast.success("Purchase completed successfully!");
    setShowBuyModal(false);
  } catch (error) {
    console.error("Order Error Details:", {
      error: error,
      requestData: orderData
    });
    toast.error(error.message || "An error occurred while trying to complete the purchase");
  }
};


  const filteredMedicines = medicines.filter(medicine =>
    medicine.medicine_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.pharmacy_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

   const openDetails = (medicine: Medicine) => {
    setSelectedMedicineForDetails(medicine);
    setSelectedMedicineForBuy(null); // إغلاق مودال الشراء إذا كان مفتوحاً
    setQuantity(1);
  };
  const openMap = (medicine: Medicine) => {
   setSelectedMedicineForDetails(medicine);
    setShowMap(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="w-20 h-20 border-4 border-indigo-600 border-t-transparent rounded-full mb-4"
        />
        <motion.p 
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-indigo-800 font-medium text-lg"
        >
          Loading medicines...
        </motion.p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-8 bg-white rounded-2xl shadow-xl text-center max-w-md mx-4"
        >
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <FiPackage className="text-red-500 text-2xl" />
          </motion.div>
          <h2 className="text-2xl font-bold text-indigo-800 mb-3">Authentication Required</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <motion.a
            href="/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center shadow-lg hover:shadow-xl transition-all"
          >
            <FiHome className="mr-2" />
            Go to Login
          </motion.a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4 sm:px-6 lg:px-8 pt-25" >
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.button
        onClick={() => navigate('/medicine')}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-4 left-4 z-50 bg-white p-3 rounded-full shadow-lg flex items-center justify-center"
        aria-label="Back to medicine page"
      >
        <FiArrowLeft className="text-indigo-600 text-xl" />
      </motion.button>
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16 relative overflow-hidden rounded-2xl bg-white shadow-lg mx-auto max-w-6xl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              x: [0, 100, 0],
              y: [0, 50, 0],
              rotate: [0, 5, 0]
            }}
            transition={{ 
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -left-20 -top-20 w-64 h-64 bg-indigo-100 rounded-full opacity-20"
          />
          <motion.div 
            animate={{ 
              x: [0, -100, 0],
              y: [0, -50, 0],
              rotate: [0, -5, 0]
            }}
            transition={{ 
              duration: 20,
              repeat: Infinity,
              repeatType: "reverse"
            }}
            className="absolute -right-20 -bottom-20 w-72 h-72 bg-purple-100 rounded-full opacity-20"
          />
        </div>
        
        <div className="relative z-10 py-12 px-6">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="inline-flex items-center justify-center mb-6 p-4 bg-indigo-100 rounded-full"
          >
            <FiShoppingCart className="text-indigo-600 text-4xl" />
          </motion.div>
          
          <h1 className="text-4xl font-extrabold text-indigo-900 sm:text-5xl sm:tracking-tight lg:text-5xl mb-4">
            Medicine <span className="text-purple-600">Exchange</span>
          </h1>
          
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-600">
            Discover and exchange medicines with trusted pharmacies across the network
          </p>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 0.5 }}
            className="h-1 bg-gradient-to-r from-indigo-400 to-purple-500 mx-auto mt-6 rounded-full"
          />
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-3xl mx-auto mb-16"
      >
        <div className="relative">
          <motion.div
            animate={{ 
              x: [-5, 5, -5],
              transition: { duration: 4, repeat: Infinity } 
            }}
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
          >
            <FiSearch className="text-indigo-400 text-xl" />
          </motion.div>
          <input
            type="text"
            placeholder="Search medicines or pharmacies..."
            className="block w-full pl-12 pr-4 py-4 border-0 rounded-xl bg-white shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-12 bg-white rounded-2xl shadow-md p-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-indigo-50 p-4 rounded-xl flex items-center"
            >
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <FiPackage className="text-indigo-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600">Total Medicines</p>
                <p className="text-2xl font-bold text-indigo-800">{medicines.length}</p>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-purple-50 p-4 rounded-xl flex items-center"
            >
              <div className="bg-purple-100 p-3 rounded-full mr-4">
                <FiHome className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-gray-600">Participating Pharmacies</p>
                <p className="text-2xl font-bold text-purple-800">
                  {[...new Set(medicines.map(m => m.pharmacy_name))].length}
                </p>
              </div>
            </motion.div>
                      </div>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center"
        >
          <div className="mb-4 sm:mb-0">
            <h2 className="text-2xl font-bold text-indigo-900">Available Medicines</h2>
            <p className="text-gray-600">
              Showing {paginatedMedicines.length} of {filteredMedicines.length} results
            </p>
          </div>
          
          
          {filteredMedicines.length > itemsPerPage && (
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-xl shadow-sm">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
            </div>
          )}
        </motion.div>


       {/* Medicine Cards Grid */}
{paginatedMedicines.length > 0 ? (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    <AnimatePresence>
      {paginatedMedicines.map((medicine, index) => (
        <motion.div
          key={medicine.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -8, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 transition-all relative"
        >
          {/* Details Button - Added in top right corner */}
          <div className="absolute top-4 right-4 z-10">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                openDetails(medicine);
              }}
              className="p-2 bg-white bg-opacity-90 rounded-full shadow-md"
              aria-label="View details"
            >
              <FiInfo className="text-indigo-600 text-lg" />
            </motion.button>
          </div>

          {/* Medicine Image Placeholder */}
          <div className="h-48 bg-gradient-to-r from-indigo-200 to-purple-200 relative overflow-hidden">
            <motion.div
              animate={{
                backgroundPosition: ['0% 0%', '100% 100%'],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 opacity-50"
              style={{
                backgroundSize: '200% 200%',
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <FiPackage className="text-white text-6xl opacity-80" />
            </div>
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium text-indigo-800 shadow-sm">
              {medicine.medicine_quantity_to_sell} available
            </div>
          </div>
          
          <div className="p-6">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                {medicine.medicine_name}
              </h3>
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to favorites logic
                }}
              >
                <FiHeart />
              </motion.button>
            </div>
            
            <div className="flex items-center text-gray-600 mb-4">
              <FiHome className="mr-2" />
              <span className="line-clamp-1">{medicine.pharmacy_name}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-2xl font-bold text-indigo-600">
                {medicine.medicine_price_to_sell} EGP
              </div>
            <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              handleBuyClick(medicine);
            }}
          >
            <FiShoppingCart className="mr-2" />
            Buy
          </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
) : (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="text-center py-16 bg-white rounded-2xl shadow-sm"
  >
    <motion.div
      animate={{ 
        rotate: [0, 10, -10, 0],
        y: [0, -10, 0]
      }}
      transition={{ 
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <FiSearch className="mx-auto text-5xl text-gray-400 mb-4" />
    </motion.div>
    <h3 className="text-2xl font-medium text-gray-700 mb-3">
      {searchTerm ? 'No matching medicines found' : 'No medicines available'}
    </h3>
    <p className="text-gray-500 max-w-md mx-auto mb-6">
      {searchTerm ? 'Try adjusting your search or check back later' : 'New medicines are added regularly. Please check back soon!'}
    </p>
    {searchTerm && (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSearchTerm('')}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium"
      >
        Clear Search
      </motion.button>
    )}
  </motion.div>
)}

        {/* Pagination Controls */}
        {filteredMedicines.length > itemsPerPage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 flex items-center justify-center space-x-2"
          >
            <motion.button
              whileHover={{ backgroundColor: "#e0e7ff" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-3 rounded-full ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
            >
              <FiChevronLeft className="text-xl" />
            </motion.button>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <motion.button
                  key={pageNum}
                  whileHover={{ backgroundColor: "#e0e7ff" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => goToPage(pageNum)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${currentPage === pageNum 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                    : 'text-indigo-600 hover:bg-indigo-50'}`}
                >
                  {pageNum}
                </motion.button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2 text-gray-500">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <motion.button
                whileHover={{ backgroundColor: "#e0e7ff" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => goToPage(totalPages)}
                className={`w-12 h-12 rounded-full flex items-center justify-center ${currentPage === totalPages 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' 
                  : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                {totalPages}
              </motion.button>
            )}

            <motion.button
              whileHover={{ backgroundColor: "#e0e7ff" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-3 rounded-full ${currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-indigo-600 hover:bg-indigo-50'}`}
            >
              <FiChevronRight className="text-xl" />
            </motion.button>
          </motion.div>
        )}
      </div>
        {/* Medicine Exchange Explanation Section */}
        <motion.section 
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto mt-24 mb-16 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl overflow-hidden shadow-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-bold text-indigo-900 mb-6">
              How Our Medicine Exchange Works
            </h2>
            
            <div className="space-y-6">
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start"
              >
                <div className="bg-indigo-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <FiSearch className="text-indigo-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Find Your Medicine</h3>
                  <p className="text-gray-600">
                    Search for medications you need across our network of partner pharmacies.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start"
              >
                <div className="bg-purple-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <FiMapPin className="text-purple-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Check Availability</h3>
                  <p className="text-gray-600">
                    View real-time stock levels and pharmacy locations near you.
                  </p>
                </div>
              </motion.div>
              
              <motion.div 
                whileHover={{ x: 5 }}
                className="flex items-start"
              >
                <div className="bg-blue-100 p-3 rounded-full mr-4 flex-shrink-0">
                  <FiShoppingCart className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Secure Exchange</h3>
                  <p className="text-gray-600">
                    Complete your purchase with our safe transaction system.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="relative hidden lg:flex items-center justify-center p-8">
            {/* Animated Medicine Bottle */}
            <motion.div
              animate={{
                y: [0, -15, 0],
                rotate: [0, 3, -3, 0]
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute left-20 top-20 z-10"
            >
              <svg width="80" height="120" viewBox="0 0 80 120" fill="none">
                <motion.rect 
                  x="10" y="30" width="60" height="90" rx="5" 
                  fill="#6366F1"
                  animate={{
                    fill: ["#6366F1", "#8B5CF6", "#6366F1"]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity
                  }}
                />
                <rect x="25" y="40" width="30" height="20" rx="2" fill="white" fillOpacity="0.8"/>
                <path d="M20 30L60 30L65 15H15L20 30Z" fill="#4F46E5"/>
                <motion.path 
                  d="M30 70H50M30 80H50M30 90H50" 
                  stroke="white" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </svg>
            </motion.div>
            
            {/* Animated Pills */}
            <motion.div
              animate={{
                x: [0, 10, -10, 0],
                y: [0, 15, 0]
              }}
              transition={{
                duration: 7,
                repeat: Infinity,
                repeatType: "reverse",
                delay: 0.5
              }}
              className="absolute right-20 top-32 z-10"
            >
              <svg width="100" height="60" viewBox="0 0 100 60" fill="none">
                <motion.circle 
                  cx="30" cy="30" r="15" 
                  fill="#EC4899"
                  animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity
                  }}
                />
                <motion.circle 
                  cx="70" cy="30" r="12" 
                  fill="#10B981"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 5,
                    repeat: Infinity,
                    delay: 0.3
                  }}
                />
                <path d="M25 30H35M65 30H75" stroke="white" strokeWidth="2"/>
              </svg>
            </motion.div>
            
            {/* Animated Shopping Cart */}
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -2, 2, 0]
              }}
              transition={{
                duration: 8,
                repeat: Infinity
              }}
              className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-10"
            >
              <svg width="120" height="100" viewBox="0 0 120 100" fill="none">
                <motion.path 
                  d="M30 40L20 10H5M50 40L60 10H95M25 40H85C90 40 92 42 92 47L85 80H25C20 80 15 75 15 70L20 20" 
                  stroke="#4F46E5" 
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 3 }}
                />
                <motion.circle 
                  cx="35" cy="85" r="10" 
                  fill="#6B7280" 
                  fillOpacity="0.2"
                  stroke="#4F46E5"
                  strokeWidth="2"
                />
                <motion.circle 
                  cx="75" cy="85" r="10" 
                  fill="#6B7280" 
                  fillOpacity="0.2"
                  stroke="#4F46E5"
                  strokeWidth="2"
                />
                <motion.rect 
                  x="40" y="25" width="40" height="20" rx="2" 
                  fill="#8B5CF6"
                  animate={{
                    y: [25, 15, 25],
                    fill: ["#8B5CF6", "#EC4899", "#8B5CF6"]
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity
                  }}
                />
              </svg>
            </motion.div>
            
            {/* Background Circles Animation */}
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.1, 0.15, 0.1]
              }}
              transition={{
                duration: 10,
                repeat: Infinity
              }}
              className="absolute w-64 h-64 rounded-full bg-indigo-200"
            />
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.05, 0.1, 0.05]
              }}
              transition={{
                duration: 12,
                repeat: Infinity,
                delay: 2
              }}
              className="absolute w-80 h-80 rounded-full bg-purple-200"
            />
          </div>
        </div>
      </motion.section>

   {/* Medicine Detail Modal */}
<AnimatePresence>
  {selectedMedicineForDetails && !showMap && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={() => setSelectedMedicineForDetails(null)}
    >
      <motion.div
        initial={{ scale: 0.9, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 50 }}
        className="bg-white rounded-xl sm:rounded-2xl overflow-hidden w-full max-w-xs sm:max-w-md md:max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with image - reduced height */}
        <div className="relative h-40 sm:h-48 md:h-64 bg-gradient-to-r from-indigo-300 to-purple-300">
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute inset-0 bg-gradient-to-r from-indigo-200 to-purple-200 opacity-70"
            style={{
              backgroundSize: '200% 200%',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiPackage className="text-white text-5xl sm:text-6xl md:text-8xl opacity-80" />
          </div>
          <button 
            className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-white bg-opacity-90 p-1 rounded-full shadow"
            onClick={() => setSelectedMedicineForDetails(null)}
          >
            <FiX className="text-gray-600 text-base sm:text-lg" />
          </button>
        </div>
        
        {/* Content - reduced padding */}
        <div className="p-3 sm:p-4 md:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start mb-3 sm:mb-4 gap-1 sm:gap-2">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">
                {selectedMedicineForDetails.medicine_name}
              </h2>
              <div className="flex items-center text-gray-600 mt-1 text-xs sm:text-sm md:text-base">
                <FiHome className="mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">{selectedMedicineForDetails.pharmacy_name}</span>
              </div>
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap">
              {selectedMedicineForDetails.medicine_quantity_to_sell} available
            </div>
          </div>
          
          {/* Grid sections - tighter spacing */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 mb-3 sm:mb-4 md:mb-6">
            {/* Pricing Information */}
            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl">
              <h3 className="font-medium text-gray-700 mb-1 sm:mb-2 md:mb-3 flex items-center text-xs sm:text-sm md:text-base">
                <FiDollarSign className="mr-1 sm:mr-2 text-green-500 flex-shrink-0" />
                Pricing Information
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Unit Price:</span>
                  <span className="font-medium">{selectedMedicineForDetails.medicine_price_to_sell} EGP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Quantity:</span>
                  <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                    <button 
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-200 rounded-full"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    >
                      <FiMinus className="text-gray-600 text-xs" />
                    </button>
                    <span className="font-medium text-sm sm:text-base">{quantity}</span>
                    <button 
                      className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 flex items-center justify-center bg-gray-200 rounded-full"
                      onClick={() => setQuantity(quantity + 1)}
                    >
                      <FiPlus className="text-gray-600 text-xs" />
                    </button>
                  </div>
                </div>
                <div className="border-t border-gray-200 my-1"></div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-indigo-600 text-sm sm:text-base md:text-lg">
                    {(parseFloat(selectedMedicineForDetails.medicine_price_to_sell) * quantity).toFixed(2)} EGP
                  </span>
                </div>
              </div>
            </div>
            
            {/* Pharmacy Location */}
            <div className="bg-gray-50 p-2 sm:p-3 md:p-4 rounded-lg sm:rounded-xl">
              <h3 className="font-medium text-gray-700 mb-1 sm:mb-2 md:mb-3 flex items-center text-xs sm:text-sm md:text-base">
                <FiMapPin className="mr-1 sm:mr-2 text-red-500 flex-shrink-0" />
                Pharmacy Location
              </h3>
              <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-gray-600">Latitude:</span>
                  <span className="font-medium">{selectedMedicineForDetails.pharmacy_latitude}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Longitude:</span>
                  <span className="font-medium">{selectedMedicineForDetails.pharmacy_longitude}</span>
                </div>
                <div className="mt-2 sm:mt-3 md:mt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openMap(selectedMedicineForDetails)}
                    className="w-full bg-indigo-600 text-white py-1 sm:py-2 rounded-md sm:rounded-lg font-medium flex items-center justify-center text-xs sm:text-sm md:text-base"
                  >
                    <FiMapPin className="mr-1 sm:mr-2" />
                    View on Map
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons - smaller on mobile */}
          <div className="flex flex-col space-y-2 sm:space-y-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-1.5 sm:py-2 md:py-3 px-3 sm:px-4 md:px-6 rounded-md sm:rounded-lg font-medium shadow hover:shadow-md transition-all flex items-center justify-center text-xs sm:text-sm md:text-base"
            >
              <FiShoppingCart className="mr-1 sm:mr-2" />
              Proceed to Checkout
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-white border border-gray-300 text-gray-700 py-1.5 sm:py-2 md:py-3 px-3 sm:px-4 md:px-6 rounded-md sm:rounded-lg font-medium shadow-sm hover:bg-gray-50 transition-all flex items-center justify-center text-xs sm:text-sm md:text-base"
            >
              <FiShare2 className="mr-1 sm:mr-2" />
              Share Details
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
      {/* Map Modal */}
      <AnimatePresence>
      {showMap && selectedMedicineForDetails && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-black/50 backdrop-blur-sm bg-opacity-50 flex items-center justify-center p-4 z-50"
    onClick={() => setShowMap(false)}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl h-[80vh]"
      onClick={(e) => e.stopPropagation()}
    >
      <Suspense fallback={<div className="flex items-center justify-center h-full">Loading map...</div>}>
        <MapWithNoSSR
          latitude={parseFloat(selectedMedicineForDetails.pharmacy_latitude)}
          longitude={parseFloat(selectedMedicineForDetails.pharmacy_longitude)}
          pharmacyName={selectedMedicineForDetails.pharmacy_name}
          medicineName={selectedMedicineForDetails.medicine_name}
          onClose={() => setShowMap(false)}
        />
      </Suspense>
    </motion.div>
  </motion.div>
)}
      </AnimatePresence>
      {/* Buy Order Modal */}
{/* Buy Only Modal */}
<AnimatePresence>
  {showBuyModal && selectedMedicineForBuy && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/30 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={() => {
        setShowBuyModal(false);
        setSelectedMedicineForBuy(null);
      }}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center">
              <FiShoppingCart className="mr-2" />
              Confirm Purchase
            </h3>
            <button 
              className="text-white/80 hover:text-white transition-colors"
              onClick={() => {
                setShowBuyModal(false);
                setSelectedMedicineForBuy(null);
              }}
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Medicine Info */}
          <div className="flex items-start mb-6">
            <div className="bg-indigo-100 p-3 rounded-lg mr-4">
              <FiPackage className="text-indigo-600 text-2xl" />
            </div>
            <div>
              <h4 className="font-bold text-lg text-gray-800">
                {selectedMedicineForBuy.medicine_name}
              </h4>
              <p className="text-gray-600 flex items-center">
                <FiHome className="mr-1" />
                {selectedMedicineForBuy.pharmacy_name}
              </p>
              <div className="mt-2 text-indigo-600 font-semibold">
                {selectedMedicineForBuy.medicine_price_to_sell} EGP
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Quantity</label>
            <div className="flex items-center">
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-l-lg border border-gray-300"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <FiMinus />
              </motion.button>
              
              <div className="flex-1 border-t border-b border-gray-300 h-10 flex items-center justify-center bg-white font-medium">
                {quantity}
              </div>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-r-lg border border-gray-300"
                onClick={() => setQuantity(quantity + 1)}
              >
                <FiPlus />
              </motion.button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Unit Price:</span>
              <span>{selectedMedicineForBuy.medicine_price_to_sell} EGP</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="border-t border-gray-200 my-2 pt-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-indigo-600">
                  {(parseFloat(selectedMedicineForBuy.medicine_price_to_sell) * quantity).toFixed(2)} EGP
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors flex items-center justify-center"
              onClick={() => {
                setShowBuyModal(false);
                setSelectedMedicineForBuy(null);
              }}
            >
              Cancel
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              onClick={handleBuyOrder}
            >
              <FiShoppingCart className="mr-2" />
              Confirm Order
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
    </div>
  );
};

export default Exchange;