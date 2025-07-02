import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlus, FaTrash, FaPhone, FaArrowLeft, FaArrowRight, FaMapMarkerAlt, FaMap, FaSignInAlt, FaPills, FaFileAlt, FaUser, FaPlay } from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';

// إصلاح أيقونات Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// إنشاء أيقونة مخصصة للدبوس الأحمر
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});
interface Pharmacy {
  id: number;
  name: string;
  city: string;
  location: string;
  latitude: string;
  longitude: string;
  license_number: string;
  phone?: string;
}
const LocationMarker = ({ setSelectedLocation }: { setSelectedLocation: (loc: { lat: number; lng: number }) => void }) => {
  const map = useMapEvents({
    click(e) {
      setSelectedLocation(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return null;
};
const AvailableMedicine: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [newPharmacy, setNewPharmacy] = useState({
    name: "",
    city: "",
    latitude: "0", 
    longitude: "0",
    license_number: "",
    password: "",
    confirm_password: "",
    address: "",

  });
  const [currentPage, setCurrentPage] = useState<number>(1);
  // @ts-ignore

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const itemsPerPage: number = 10;
  const navigate = useNavigate();
  

  useEffect(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('pharmacyName');
    localStorage.removeItem("pharmacy_id");


    if (!isLoggedIn()) {
      toast.error("You need to log in first.");
      navigate("/login");
    } else {
      fetchPharmacies();
    }
  }, [navigate]);
  const handleOpenMap = () => {
    setIsMapOpen(true);
    // جلب الموقع الحالي إذا لم يكن هناك موقع محدد مسبقاً
    if (!selectedLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSelectedLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Could not get your location");
          // تعيين موقع افتراضي إذا فشل جلب الموقع الحالي
          setSelectedLocation({ lat: 30.0444, lng: 31.2357 }); // القاهرة كمثال
        }
      );
    } else if (!selectedLocation) {
      // تعيين موقع افتراضي إذا لم يكن هناك موقع محدد ولم يتم دعم geolocation
      setSelectedLocation({ lat: 30.0444, lng: 31.2357 }); // القاهرة كمثال
    }
  };
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      return data.display_name || '';
    } catch (error) {
      console.error("Error getting address:", error);
      return '';
    }
  };

  const handleSelectLocation = async () => {
    if (selectedLocation) {
      const address = await getAddressFromCoordinates(selectedLocation.lat, selectedLocation.lng);
      
      // حفظ الموقع في localStorage
      localStorage.setItem('selectedPharmacyLocation', JSON.stringify({
        lat: selectedLocation.lat,
        lng: selectedLocation.lng
      }));
      
      setNewPharmacy({
        ...newPharmacy,
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString(),
        address: address || ''
      });
      
      setIsMapOpen(false);
      toast.success("Location selected successfully!");
    }
  };

  const isLoggedIn = () => {
    const token = localStorage.getItem("token");
    return !!token;
  };

  const refreshToken = async (): Promise<string | null> => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        toast.error("Session expired. Please login again.");
        navigate("/signin");
        return null;
      }
  
      const response = await fetch("https://smart-pharma-net.vercel.app/account/token/refresh/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }
  
      const data = await response.json();
      localStorage.setItem("token", data.access); // حفظ التوكن الجديد
      return data.access; // إرجاع التوكن الجديد لاستخدامه فوراً
    } catch (error) {
      console.error("Refresh token error:", error);
      toast.error("Session expired. Please login again.");
      navigate("/signin");
      return null;
    }
  };
  useEffect(() => {
    refreshToken();
    
    const interval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchPharmacies = async (): Promise<void> => {
    if (!isLoggedIn()) {
      toast.error("You need to log in first.");
      navigate("/signin");
      return;
    }
  
    setIsLoading(true);
    let token = localStorage.getItem("token");
  
    try {
      let response = await fetch("https://smart-pharma-net.vercel.app/account/pharmacy/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
  
      if (response.status === 401) {
        await refreshToken();
        token = localStorage.getItem("token");
        response = await fetch("https://smart-pharma-net.vercel.app/account/pharmacy/", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
  
      if (!response.ok) {
        throw new Error("Failed to fetch pharmacies");
      }
  
      const data: Pharmacy[] = await response.json();
      setPharmacies(data);
    } catch (error) {
      console.error("Error fetching pharmacies:", error);
      toast.error("Failed to fetch pharmacies. Please try again.");
      if (error instanceof Error && error.message.includes("401")) {
        navigate("/signin");
      }
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleAddPharmacy = async (): Promise<void> => {
    if (!isLoggedIn()) {
      toast.error("You need to log in first.");
      navigate("/signin");
      return;
    }
  
    const savedLocation = localStorage.getItem('selectedPharmacyLocation');
    const coordinates = savedLocation ? JSON.parse(savedLocation) : null;
  
    if (!coordinates) {
      toast.error("Please select a location first");
      return;
    }
  
    // تحويل الإحداثيات والتأكد من صحتها
    const latNumber = parseFloat(coordinates.lat.toFixed(6));
    const lngNumber = parseFloat(coordinates.lng.toFixed(6));
    
    if (isNaN(latNumber) || isNaN(lngNumber)) {
      toast.error("Invalid coordinates values");
      return;
    }
  
    if (newPharmacy.password !== newPharmacy.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }
  
    let token = localStorage.getItem("token");
  
    try {
      // إعداد البيلود مع التنسيق الصحيح للإحداثيات
      const payload = {
        name: newPharmacy.name,
        city: newPharmacy.city,
        latitude: latNumber.toString(), // أرسل القيمة كما هي
        longitude: lngNumber.toString(),
        license_number: newPharmacy.license_number,
        password: newPharmacy.password,
        confirm_password: newPharmacy.confirm_password
      };

      console.log("Sending payload:", payload); // لأغراض debugging

      let response = await fetch("https://smart-pharma-net.vercel.app/account/pharmacy/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
  
      if (response.status === 401) {
        await refreshToken();
        token = localStorage.getItem("token");
        response = await fetch("https://smart-pharma-net.vercel.app/account/pharmacy/", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error adding pharmacy:", errorData);
        toast.error(`Failed to add pharmacy: ${errorData.message || "Unknown error"}`);
        return;
      }
 
      const data: Pharmacy = await response.json();
       if (data.id) {
      localStorage.setItem("pharmacy_id", data.id.toString());
    }
      setPharmacies([...pharmacies, data]);
      setIsModalOpen(false);
      setNewPharmacy({
        name: "",
        city: "",
        latitude: ".000",
        longitude: "0",
        license_number: "",
        password: "",
        confirm_password: "",
          address: "", 
      });
      toast.success("Pharmacy added successfully!");
    } catch (error) {
      console.error("Error adding pharmacy:", error);
      toast.error("Failed to add pharmacy. Please try again.");
    }
  };

  const handleDeletePharmacy = async (id: number): Promise<void> => {
    if (!isLoggedIn()) {
      toast.error("You need to log in first.");
      navigate("/signin");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Authentication token not found.");
      return;
    }
  
    try {
      const response = await fetch(
        `https://smart-pharma-net.vercel.app/account/pharmacy/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error response:", errorData);
        throw new Error(
          errorData.message || 
          `Failed to delete pharmacy. Status: ${response.status}`
        );
      }
  
      setPharmacies(pharmacies.filter((pharmacy) => pharmacy.id !== id));
      toast.success("Pharmacy deleted successfully!");
    } catch (error) {
      console.error("Error deleting pharmacy:", error);
      toast.error(
        error instanceof Error ? 
        error.message : 
        "Failed to delete pharmacy. Please try again."
      );
    }
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPharmacies = pharmacies.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(pharmacies.length / itemsPerPage);

  const handleNextPage = (): void => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = (): void => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
    {/* Hero Section with Animation */}
<motion.section 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.8 }}
  className="relative bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-6 sm:p-8 mb-12 overflow-hidden mt-7"
>
  <div className="absolute inset-0 opacity-10">
    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-300 rounded-full filter blur-3xl"></div>
    <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-300 rounded-full filter blur-3xl"></div>
  </div>
  
  <div className="relative z-10">
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col md:flex-row items-center justify-between gap-8"
    >
      <div className="flex-1">
        <h1 className="text-3xl sm:text-4xl font-bold text-indigo-900 mb-4 flex items-center">
          <span className="mr-4">Discover and Manage Pharmacies</span>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="p-3 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all duration-300 shadow-lg"
          >
            <FaPlus className="text-xl" />
          </motion.button>
        </h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-gray-700 text-lg mb-6 max-w-2xl"
        >
          Explore the best pharmacies in your area. Our platform connects you with licensed pharmacies, ensuring safe and reliable medication access.
        </motion.p>
        
        <div className="flex gap-4">
        <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(79, 70, 229, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md flex items-center gap-2"
          >
            <motion.span 
              animate={{ x: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <FaArrowRight />
            </motion.span>
          
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 5px 15px rgba(255, 255, 255, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsDemoModalOpen(true)}
            className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-all duration-300 flex items-center gap-2"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <FaPlay className="text-indigo-600" />
            </motion.div>
            <span>Watch Demo</span>
          </motion.button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="hidden md:block flex-1"
      >
        <img 
          src="https://img.freepik.com/free-vector/pharmacy-concept-illustration_114360-7290.jpg" 
          alt="Pharmacy illustration"
          className="w-full h-auto max-w-md mx-auto"
        />
      </motion.div>
    </motion.div>
  </div>
</motion.section>

{/* Stats Cards */}
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 0.8, duration: 0.8 }}
  className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
>
  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center">
      <div className="p-3 bg-indigo-100 rounded-full mr-4">
        <FaMapMarkerAlt className="text-indigo-600 text-xl" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">120+</h3>
        <p className="text-gray-600">Locations Covered</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center">
      <div className="p-3 bg-blue-100 rounded-full mr-4">
        <FaPlus className="text-blue-600 text-xl" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">500+</h3>
        <p className="text-gray-600">Medicines Available</p>
      </div>
    </div>
  </div>
  
  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300">
    <div className="flex items-center">
      <div className="p-3 bg-green-100 rounded-full mr-4">
        <FaUser className="text-green-600 text-xl" />
      </div>
      <div>
        <h3 className="text-2xl font-bold text-gray-800">10K+</h3>
        <p className="text-gray-600">Happy Customers</p>
      </div>
    </div>
  </div>
</motion.div>

{/* Available Pharmacies Section */}
<motion.section
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ delay: 1, duration: 0.8 }}
  className="mb-16"
>
  <div className="text-center mb-12">
    <motion.h2
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.2, duration: 0.5 }}
      className="text-3xl font-bold text-indigo-900 mb-4 relative inline-block"
    >
      Available Pharmacies
      <span className="absolute bottom-0 left-0 w-full h-1 bg-indigo-200 transform translate-y-2"></span>
    </motion.h2>
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.4, duration: 0.8 }}
      className="text-gray-600 max-w-2xl mx-auto"
    >
      Browse through our network of trusted pharmacies. Each pharmacy is carefully verified to ensure quality service.
    </motion.p>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
  {pharmacies.length === 0 ? (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="col-span-full text-center py-12"
      >
        <img 
          src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-616.jpg" 
          alt="No pharmacies"
          className="w-64 mx-auto mb-4"
        />
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Pharmacies Found</h3>
        <p className="text-gray-500 mb-4">Add new pharmacies to the system</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
        >
          Add First Pharmacy
        </motion.button>
      </motion.div>
    ) : (
    
    currentPharmacies.map((pharmacy, index) => (
      <motion.div
        key={pharmacy.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 + index * 0.1, duration: 0.5 }}
        whileHover={{ y: -5 }}
        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
      >
        <div className="h-40 bg-gradient-to-r from-indigo-500 to-blue-500 relative">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="absolute bottom-4 left-4">
            <h3 className="text-xl font-bold text-white drop-shadow-md">{pharmacy.name}</h3>
            <div className="flex items-center text-white text-sm">
              <FaMapMarkerAlt className="mr-1" />
              <span>{pharmacy.city}</span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="bg-indigo-100 p-2 rounded-full mr-3">
              <FaFileAlt className="text-indigo-600" />
            </div>
            <span className="text-gray-700">License: {pharmacy.license_number}</span>
          </div>
          
          <div className="flex items-center mb-6">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <FaPhone className="text-blue-600" />
            </div>
            <span className="text-gray-700">{pharmacy.phone || 'Phone: N/A'}</span>
          </div>
          
          <div className="flex justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              
 onClick={() => {
    localStorage.setItem("pharmacy_id", pharmacy.id.toString()); // حفظ ID الصيدلية
    navigate("/medicine", { state: { pharmacyName: pharmacy.name } }); // التنقل
  }}              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center text-sm"
            >
              <FaPills className="mr-2" />
              <span>View Medicines</span>
            </motion.button>
            
            <div className="flex gap-2">
              {!isLoggedIn() && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/login")}
                  className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all duration-300"
                  title="Login"
                >
                  <FaSignInAlt />
                </motion.button>
              )}
              
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleDeletePharmacy(pharmacy.id)}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-300"
                title="Delete"
              >
                <FaTrash />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
       ))
    )}
  </div>

  {/* Pagination Controls */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 2, duration: 0.8 }}
    className="flex justify-center mt-12"
  >
    <div className="flex items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        className={`p-3 rounded-full ${currentPage === 1 ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'} transition-all duration-300 shadow-md`}
      >
        <FaArrowLeft />
      </motion.button>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <motion.button
            key={page}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setCurrentPage(page)}
            className={`w-10 h-10 rounded-full flex items-center justify-center ${currentPage === page ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} transition-all duration-300`}
          >
            {page}
          </motion.button>
        ))}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        className={`p-3 rounded-full ${currentPage === totalPages ? 'bg-gray-200 text-gray-400' : 'bg-indigo-600 text-white hover:bg-indigo-700'} transition-all duration-300 shadow-md`}
      >
        <FaArrowRight />
      </motion.button>
    </div>
  </motion.div>
</motion.section>
    {/* Modal for Adding New Pharmacy */}
{isModalOpen && (
  <div className="fixed inset-0  bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
    <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg w-full max-w-xs sm:max-w-md mx-auto border border-indigo-100">
      {/* Modal Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-indigo-900 text-center">Add New Pharmacy</h2>
        <div className="w-10 sm:w-16 h-1 bg-indigo-200 mx-auto mt-2 rounded-full"></div>
      </div>

      <form onSubmit={(e) => {
        e.preventDefault();
        handleAddPharmacy();
      }}>
        {/* Grid Layout for Form Fields */}
        <div className="grid grid-cols-1 gap-2 sm:gap-4 mb-3 sm:mb-6">
          {/* Name Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Pharmacy Name*</label>
            <input
              type="text"
              value={newPharmacy.name}
              onChange={(e) => setNewPharmacy({ ...newPharmacy, name: e.target.value })}
              className="w-full p-2 sm:p-3 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Pharmacy name"
              required
            />
          </div>

          {/* City Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">City*</label>
            <input
              type="text"
              value={newPharmacy.city}
              onChange={(e) => setNewPharmacy({ ...newPharmacy, city: e.target.value })}
              className="w-full p-2 sm:p-3 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="City"
              required
            />
          </div>

          {/* License Number Field */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">License Number*</label>
            <input
              type="text"
              value={newPharmacy.license_number}
              onChange={(e) => setNewPharmacy({ ...newPharmacy, license_number: e.target.value })}
              className="w-full p-2 sm:p-3 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="License number"
              required
            />
          </div>
        </div>

        {/* Location Section */}
        <div className="mb-3 sm:mb-6 bg-indigo-50 p-2 sm:p-4 rounded-lg">
          <h3 className="text-xs sm:text-sm font-semibold text-indigo-800 mb-2 sm:mb-3 flex items-center">
            <FaMapMarkerAlt className="mr-1 sm:mr-2" /> Location Information
          </h3>

          {/* Address Field */}
          <div className="mb-2 sm:mb-4">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Address*</label>
            <div className="flex">
              <input
                type="text"
                value={newPharmacy.address || ''}
                onChange={(e) => setNewPharmacy({ ...newPharmacy, address: e.target.value })}
                className="flex-1 p-2 sm:p-3 text-xs sm:text-base border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Full address"
                required
              />
              <button
                type="button"
                onClick={handleOpenMap}
                className="bg-indigo-600 text-white p-2 sm:p-3 rounded-r-lg hover:bg-indigo-700 transition flex items-center justify-center"
                title="Pick from map"
              >
                <FaMap className="text-xs sm:text-base" />
              </button>
            </div>
          </div>

          {/* Coordinates Grid */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="text"
                value={newPharmacy.latitude || ''}
                readOnly
                className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="text"
                value={newPharmacy.longitude || ''}
                readOnly
                className="w-full p-2 sm:p-3 text-xs sm:text-sm bg-gray-100 border border-gray-300 rounded-lg text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Password*</label>
            <input
              type="password"
              value={newPharmacy.password}
              onChange={(e) => setNewPharmacy({ ...newPharmacy, password: e.target.value })}
              className="w-full p-2 sm:p-3 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Confirm Password*</label>
            <input
              type="password"
              value={newPharmacy.confirm_password}
              onChange={(e) => setNewPharmacy({ ...newPharmacy, confirm_password: e.target.value })}
              className="w-full p-2 sm:p-3 text-xs sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 sm:px-6 py-2 text-sm sm:text-base bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
          >
            Add Pharmacy
          </button>
        </div>
      </form>
    </div>
  </div>
)}

{isMapOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-900">
                <FaMapMarkerAlt className="inline mr-2" />
                Select Pharmacy Location
              </h2>
              <button 
                onClick={() => setIsMapOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                &times;
              </button>
            </div>
            
            <div className="flex-1 rounded-lg overflow-hidden relative">
              {selectedLocation && (
                <MapContainer
                  center={[selectedLocation.lat, selectedLocation.lng]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <LocationMarker setSelectedLocation={setSelectedLocation} />
                  
                  {selectedLocation && (
  <Marker 
    position={[selectedLocation.lat, selectedLocation.lng]}
    icon={redIcon} // هنا نستخدم الأيقونة الحمراء
  >
    <Popup>
      <div className="text-center">
        <strong>Selected Location</strong><br />
        Lat: {selectedLocation.lat.toFixed(6)}<br />
        Lng: {selectedLocation.lng.toFixed(6)}
      </div>
    </Popup>
  </Marker>
)}
                </MapContainer>
              )}
              
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md z-[1000]">
                <div className="text-sm font-medium text-gray-700">
                  <div className="mb-1">
                    <span className="font-semibold">Latitude:</span> {selectedLocation?.lat.toFixed(6) || 'N/A'}
                  </div>
                  <div>
                    <span className="font-semibold">Longitude:</span> {selectedLocation?.lng.toFixed(6) || 'N/A'}
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (position) => {
                        setSelectedLocation({
                          lat: position.coords.latitude,
                          lng: position.coords.longitude
                        });
                      },
                      () => {
                        toast.error("Could not get your location");
                      }
                    );
                  }
                }}
                className="absolute bottom-4 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition z-[1000]"
                title="Use my current location"
              >
                <FaMapMarkerAlt />
              </button>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <FaMapMarkerAlt className="inline mr-1" />
                Click on the map to select location
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setIsMapOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSelectLocation}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  disabled={!selectedLocation}
                >
                  Confirm Location
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
  {/* Demo Modal */}
{isDemoModalOpen && (
  <div className="fixed inset-0 bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="bg-white p-3 sm:p-6 rounded-xl shadow-2xl w-full max-w-[90%] sm:max-w-lg md:max-w-2xl lg:max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
      <button 
        onClick={() => setIsDemoModalOpen(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl"
      >
        &times;
      </button>
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-indigo-900 mb-2">
          <FaPills className="inline mr-2 text-indigo-600" />
          Pharmacy Management Demo
        </h3>
        <p className="text-gray-600">See how our platform can help you manage pharmacies efficiently</p>
      </div>
      
      <div className="bg-gray-100 rounded-lg p-2 sm:p-4 mb-4 h-40 sm:h-64 flex items-center justify-center relative overflow-hidden">
      {/* Pharmacy Building */}
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="absolute bottom-0 left-1/2 transform -translate-x-1/2"
  >
    <div className="relative">
      {/* Pharmacy Sign */}
      <motion.div 
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-bold"
      >
        <div className="flex items-center">
          <FaPlus className="mr-1" />
          <span>PHARMACY</span>
        </div>
      </motion.div>
      
      {/* Building */}
      <div className="w-32 h-20 bg-blue-600 rounded-t-lg relative">
        {/* Windows */}
        <div className="flex justify-around pt-2">
          <div className="w-6 h-6 bg-yellow-300 rounded-sm"></div>
          <div className="w-6 h-6 bg-yellow-300 rounded-sm"></div>
          <div className="w-6 h-6 bg-yellow-300 rounded-sm"></div>
        </div>
        
        {/* Door */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-blue-700 rounded-t-md">
          <div className="absolute top-1/2 left-2 w-1 h-1 bg-yellow-300 rounded-full"></div>
        </div>
      </div>
    </div>
  </motion.div>
  
  {/* Medicine Bottles */}
  <motion.div
    initial={{ x: -50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ delay: 0.5, duration: 0.5 }}
    className="absolute left-10 bottom-0"
  >
    <div className="flex space-x-2">
      {[1, 2, 3].map((item) => (
        <motion.div
          key={item}
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 + item, delay: item * 0.3 }}
          className="w-6 h-8 bg-green-500 rounded-t-full relative"
        >
          <div className="absolute top-1 w-5 h-1 bg-green-600 left-1/2 transform -translate-x-1/2"></div>
          <div className="absolute bottom-0 w-full h-2 bg-green-700 rounded-b-sm"></div>
        </motion.div>
      ))}
    </div>
  </motion.div>
  
  {/* Pills Animation */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1, duration: 0.5 }}
    className="absolute top-10 left-1/2 transform -translate-x-1/2"
  >
    {[1, 2, 3, 4].map((item) => (
      <motion.div
        key={item}
        animate={{
          x: [0, 50, 0, -50, 0],
          y: [0, 20, 40, 20, 0],
          rotate: [0, 180, 360]
        }}
        transition={{
          repeat: Infinity,
          duration: 8 + item,
          ease: "linear"
        }}
        className={`w-4 h-4 rounded-full absolute ${item % 2 === 0 ? 'bg-red-500' : 'bg-blue-500'}`}
        style={{
          left: `${item * 30}px`,
          top: `${item * 5}px`
        }}
      ></motion.div>
    ))}
  </motion.div>
  
  {/* Medical Cross */}
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1, rotate: 360 }}
    transition={{ delay: 1.5, duration: 1, type: "spring" }}
    className="absolute top-1/2 right-10 text-red-500 text-4xl"
  >
    <FaPlus />
  </motion.div>
  
  {/* Pulse Animation */}
  <motion.div
    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0] }}
    transition={{ repeat: Infinity, duration: 3 }}
    className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"    >
      
    </motion.div>
  
 
</div>
      
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-indigo-50 p-4 rounded-lg border border-indigo-100"
        >
          <div className="bg-indigo-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto">
            <FaPlus className="text-indigo-600" />
          </div>
          <h4 className="font-semibold text-center mb-2">Add Pharmacies</h4>
          <p className="text-sm text-gray-600 text-center">Easily add new pharmacies to your network</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-blue-50 p-4 rounded-lg border border-blue-100"
        >
          <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto">
            <FaMapMarkerAlt className="text-blue-600" />
          </div>
          <h4 className="font-semibold text-center mb-2">Location Tracking</h4>
          <p className="text-sm text-gray-600 text-center">Pinpoint exact locations on interactive maps</p>
        </motion.div>
        
        <motion.div 
          whileHover={{ y: -5 }}
          className="bg-green-50 p-4 rounded-lg border border-green-100"
        >
          <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-3 mx-auto">
            <FaFileAlt className="text-green-600" />
          </div>
          <h4 className="font-semibold text-center mb-2">License Management</h4>
          <p className="text-sm text-gray-600 text-center">Keep track of all pharmacy licenses</p>
        </motion.div>
      </div>
      
      <button
        onClick={() => setIsDemoModalOpen(false)}
        className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
      >
        Got it, thanks!
      </button>
    </motion.div>
  </div>
)}
 
    </div>
  );
};

export default AvailableMedicine;