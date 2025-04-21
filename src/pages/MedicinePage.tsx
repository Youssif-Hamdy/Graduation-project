import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaSearch, FaPills, FaTags, FaShieldAlt, FaShippingFast } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

interface Medicine {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  quantity: number;
  exp_date: string;
}

const MedicinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pharmacyName } = location.state || { pharmacyName: "Unknown Pharmacy" };
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, "id">>({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: 0,
    exp_date: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);


  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You need to login first.");
      navigate("/pharmacy-login");
      return; // Ensure the code stops here if no token is found
    } else {
      fetchMedicines();
    }
  }, [navigate]);

  const refreshToken = async (): Promise<void> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      toast.error("No refresh token available.");
      navigate("/pharmacy-login");
      return;
    }
    try {
      const response = await fetch("https://smart-pharma-net.vercel.app/account/token/refresh/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (!response.ok) {
        throw new Error("Failed to refresh token");
      }
      const data = await response.json();
      localStorage.setItem("accessToken", data.access);
      toast.success("Token refreshed successfully!");
    } catch (error) {
      console.error("Error refreshing token:", error);
      toast.error("Failed to refresh token. Please log in again.");
      navigate("/pharmacy-login");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      refreshToken();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  const fetchMedicines = async (): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You need to log in first.");
      navigate("/pharmacy-login");
      return;
    }

    try {
      const response = await fetch("https://smart-pharma-net.vercel.app/medicine/medicines/", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        if (errorResponse.code === "token_not_valid") {
          await refreshToken();
          const newToken = localStorage.getItem("accessToken");
          if (!newToken) {
            toast.error("Failed to refresh token. Please log in again.");
            navigate("/pharmacy-login");
            return;
          }
          const retryResponse = await fetch("https://smartpharmanet-production.up.railway.app/medicine/medicines/", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${newToken}`,
              "Content-Type": "application/json",
            },
          });
          if (!retryResponse.ok) {
            throw new Error(`Failed to fetch medicines after token refresh. Status: ${retryResponse.status}`);
          }
          const data: Medicine[] = await retryResponse.json();
          setMedicines(data);
        } else {
          throw new Error(`Failed to fetch medicines. Status: ${response.status}`);
        }
      } else {
        const data: Medicine[] = await response.json();
        setMedicines(data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to fetch medicines. Please try again.");
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleAddMedicine = async (): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You need to log in first.");
      return;
    }

    const payload = {
      name: newMedicine.name,
      category: newMedicine.category,
      description: newMedicine.description,
      price: parseFloat(newMedicine.price),
      quantity: parseInt(newMedicine.quantity.toString(), 10),
      exp_date: newMedicine.exp_date,
    };

    try {
      const response = await fetch("https://smart-pharma-net.vercel.app/medicine/medicines/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        console.error("Error response from API:", errorResponse);
        throw new Error(`Failed to add medicine. Status: ${response.status}`);
      }

      const data: Medicine = await response.json();
      setMedicines([...medicines, data]);
      toast.success("Medicine added successfully!");
      setNewMedicine({
        name: "",
        category: "",
        description: "",
        price: "",
        quantity: 0,
        exp_date: "",
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast.error("Failed to add medicine. Please try again.");
    }
  };

  const handleUpdateMedicine = async (id: number, updatedMedicine: Medicine): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You need to log in first.");
      return;
    }
    try {
      const response = await fetch(`https://smart-pharma-net.vercel.app/medicine/medicines/${id}/`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedMedicine),
      });
      if (!response.ok) {
        throw new Error("Failed to update medicine");
      }
      const data: Medicine = await response.json();
      setMedicines(medicines.map(med => med.id === id ? data : med));
      toast.success("Medicine updated successfully!");
      setIsModalOpen(false);
      setEditingMedicine(null);
    } catch (error) {
      console.error("Error updating medicine:", error);
      toast.error("Failed to update medicine. Please try again.");
    }
  };

  const handleDeleteMedicine = async (id: number): Promise<void> => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You need to log in first.");
      return;
    }
    try {
      const response = await fetch(`https://smart-pharma-net.vercel.app/medicine/medicines/${id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error("Failed to delete medicine");
      }
      setMedicines(medicines.filter(med => med.id !== id));
      toast.success("Medicine deleted successfully!");
    } catch (error) {
      console.error("Error deleting medicine:", error);
      toast.error("Failed to delete medicine. Please try again.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    if (editingMedicine) {
      setEditingMedicine((prev) => ({
        ...prev!,
        [name]: value,
      }));
    } else {
      setNewMedicine((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const openEditModal = (medicine: Medicine): void => {
    setEditingMedicine(medicine);
    setIsModalOpen(true);
  };

  const performLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = localStorage.getItem('accessToken'); // استخدام accessToken بدلاً من token
      console.log('Refresh Token:', refreshToken);
      console.log('Access Token:', accessToken);
  
      if (!refreshToken || !accessToken) {
        throw new Error('No tokens found');
      }
  
      const response = await fetch('https://smart-pharma-net.vercel.app/account/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`, // استخدام accessToken هنا
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });
  
      const data = await response.json();
      console.log("Logout response:", data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to log out');
      }
  
      // حذف جميع الـ tokens من localStorage
      localStorage.removeItem('accessToken'); // إذا كان token موجودًا
  
      // تحديث حالة تسجيل الدخول
      setIsLoggedIn(false);
      toast.success('Logged out successfully!');
  
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      navigate('/pharmacy-login');
    } catch (err: any) {
      console.error('Logout error:', err);
      toast.error(err.message || 'An error occurred during logout. Please try again.');
  
      // حذف الـ tokens حتى إذا فشل الطلب
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
  
      // إعادة توجيه المستخدم إلى صفحة تسجيل الدخول
      navigate('/pharmacy-login');
    }
  };


  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <div className="container mx-auto">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pt-16 sm:pt-20 gap-4"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900">Medicines - {pharmacyName}</h1>
            <p className="text-gray-600 mt-1">Manage your pharmacy's medicine inventory</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <FaPlus className="mr-2" /> Add Medicine
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={performLogout}
              className="bg-red-600 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 flex items-center justify-center shadow-md"
            >
              <FaSignOutAlt className="mr-2" /> Logout
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 bg-white p-4 rounded-xl shadow-sm"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option value="">All Categories</option>
              <option value="antibiotics">Antibiotics</option>
              <option value="painkillers">Painkillers</option>
              <option value="vitamins">Vitamins</option>
            </select>
          </div>
        </motion.div>

        {/* Medicines Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 mb-6 flex items-center">
            <FaPills className="mr-2 text-indigo-600" /> Available Medicines
            <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
              {medicines.length} items
            </span>
          </h2>

          {medicines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-sm text-center"
            >
              <img 
                src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-616.jpg" 
                alt="No medicines"
                className="w-64 mx-auto mb-4"
              />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Medicines Found</h3>
              <p className="text-gray-500 mb-4">Add new medicines to your inventory</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Add First Medicine
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {medicines.map((medicine, index) => (
                <motion.div
                  key={medicine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index, duration: 0.3 }}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img
                      src={medicine.imageUrl || "https://www.creativefabrica.com/wp-content/uploads/2020/07/17/Medicine-Logo-Graphics-4647232-1-1-580x386.jpg"}
                      alt={medicine.name}
                      className="w-full h-full object-cover"
                    />
                    {medicine.exp_date && new Date(medicine.exp_date) < new Date() && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        Expired
                      </span>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-800">{medicine.name}</h3>
                      <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                        {medicine.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{medicine.description}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="font-medium">${medicine.price}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Quantity</p>
                        <p className={`font-medium ${medicine.quantity < 10 ? 'text-red-500' : 'text-green-500'}`}>
                          {medicine.quantity} {medicine.quantity < 10 && '(Low)'}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Expiry Date</p>
                        <p className={`font-medium ${new Date(medicine.exp_date) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>
                          {new Date(medicine.exp_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openEditModal(medicine)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-all duration-300 flex items-center justify-center text-sm"
                      >
                        <FaEdit className="mr-1" /> Edit
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteMedicine(medicine.id)}
                        className="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-all duration-300 flex items-center justify-center text-sm"
                      >
                        <FaTrash className="mr-1" /> Delete
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Add/Edit Medicine Modal */}
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 backdrop-blur-sm  bg-opacity-30 flex justify-center items-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {editingMedicine ? "Update Medicine" : "Add New Medicine"}
                  </h3>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingMedicine(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name*</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Medicine name"
                      value={editingMedicine ? editingMedicine.name : newMedicine.name}
                      onChange={handleInputChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category*</label>
                      <select
                        name="category"
                        value={editingMedicine ? editingMedicine.category : newMedicine.category}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select Category</option>
                        <option value="Dental and oral agents">Dental and oral agents</option>
                        <option value="Blood products">Blood products</option>
                        <option value="Antibiotics">Antibiotics</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price*</label>
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        value={editingMedicine ? editingMedicine.price : newMedicine.price}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      placeholder="Medicine description"
                      value={editingMedicine ? editingMedicine.description : newMedicine.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quantity*</label>
                      <input
                        type="number"
                        name="quantity"
                        placeholder="0"
                        value={editingMedicine ? editingMedicine.quantity : newMedicine.quantity}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date*</label>
                      <input
                        type="date"
                        name="exp_date"
                        value={editingMedicine ? editingMedicine.exp_date : newMedicine.exp_date}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingMedicine(null);
                      }}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => editingMedicine ? handleUpdateMedicine(editingMedicine.id, editingMedicine) : handleAddMedicine()}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
                    >
                      {editingMedicine ? "Update Medicine" : "Add Medicine"}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
            
          </motion.div>

        )}
        
        {/* Promotional Cards Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 mb-8"
        >
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Why Choose Our Pharmacy?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/fast-delivery-concept-illustration_114360-7430.jpg" 
                  alt="Fast Delivery"
                  className="w-full h-full object-cover opacity-90"
                />
                <FaShippingFast className="absolute text-white text-5xl opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Fast Delivery</h3>
                <p className="text-gray-600">
                  Get your medicines delivered within 24 hours. We partner with trusted logistics providers for timely delivery.
                </p>
              </div>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-r from-green-500 to-teal-600 relative flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/quality-control-concept-illustration_114360-1903.jpg" 
                  alt="Quality Guarantee"
                  className="w-full h-full object-cover opacity-90"
                />
                <FaShieldAlt className="absolute text-white text-5xl opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Quality Guaranteed</h3>
                <p className="text-gray-600">
                  All medicines are sourced directly from manufacturers and stored under optimal conditions for maximum efficacy.
                </p>
              </div>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-600 relative flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/special-offer-sale-banner_52683-57378.jpg" 
                  alt="Special Offers"
                  className="w-full h-full object-cover opacity-90"
                />
                <FaTags className="absolute text-white text-5xl opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Special Offers</h3>
                <p className="text-gray-600">
                  Regular discounts and loyalty programs for our customers. Subscribe to get notified about our weekly deals.
                </p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12 mb-8 bg-indigo-50 rounded-2xl p-8"
        >
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 text-center">What Our Customers Say</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/43.jpg" 
                  alt="Customer"
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The delivery was incredibly fast and the medicines were well-packaged. I appreciate the expiration date checking feature!"
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/32.jpg" 
                  alt="Customer"
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">Michael Chen</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "As someone with chronic conditions, I rely on this pharmacy for consistent quality and reliable auto-refills. Highly recommended!"
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Health Tips Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Health Tips & Articles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tip 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img 
                src="https://img.freepik.com/free-vector/summer-healthy-lifestyle-poster_1284-15234.jpg" 
                alt="Health Tip"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Summer Health Tips</h3>
                <p className="text-sm text-gray-600">Stay hydrated and protect yourself from heat stroke this summer.</p>
              </div>
            </motion.div>

            {/* Tip 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img 
                src="https://img.freepik.com/free-vector/hand-drawn-coronavirus-prevention-background_23-2148847348.jpg" 
                alt="Health Tip"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Cold & Flu Prevention</h3>
                <p className="text-sm text-gray-600">Simple steps to boost your immunity during flu season.</p>
              </div>
            </motion.div>

            {/* Tip 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img 
                src="https://img.freepik.com/free-vector/healthy-lifestyle-infographic_1284-17962.jpg" 
                alt="Health Tip"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Medication Management</h3>
                <p className="text-sm text-gray-600">Best practices for organizing and taking your medications.</p>
              </div>
            </motion.div>

            {/* Tip 4 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300"
            >
              <img 
                src="https://img.freepik.com/free-vector/world-diabetes-day-poster_1284-45418.jpg" 
                alt="Health Tip"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Chronic Condition Care</h3>
                <p className="text-sm text-gray-600">Managing diabetes and other chronic conditions effectively.</p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MedicinePage;