import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// @ts-ignore
import { FaPlus, FaEdit, FaTrash, FaSignOutAlt, FaSearch, FaPills, FaTags, FaShieldAlt, FaShippingFast, FaExchangeAlt, FaRetweet, FaRegCalendarAlt, FaBoxOpen, FaClinicMedical, FaRegClock, FaPercentage } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import NotificationBell from "./NotificationBell";


interface Medicine {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  quantity: number;
  exp_date: string;
  can_be_sell: boolean;
  quantity_to_sell: number;
  price_sell: string;
  image_url: string; 

}

const MedicinePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
    // @ts-ignore
const [pharmacyName, setPharmacyName] = useState(
  location.state?.pharmacyName || localStorage.getItem('pharmacyName') || "Unknown Pharmacy"
);

useEffect(() => {
  if (location.state?.pharmacyName) {
    localStorage.setItem('pharmacyName', location.state.pharmacyName);
  }
}, [location.state]);
  // @ts-ignore

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [newMedicine, setNewMedicine] = useState<Omit<Medicine, "id">>({
    name: "",
    category: "",
    description: "",
    price: "",
    quantity: 0,
    exp_date: "",
    can_be_sell: true,
    quantity_to_sell: 0,
    price_sell: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
   const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

useEffect(() => {
  const ownerToken = localStorage.getItem("token");
  const userToken = localStorage.getItem("accessToken");

  if (!ownerToken && !userToken) {
    toast.error("You need to login first.");
    navigate("/pharmacy-login");
    return;
  }

  fetchMedicines();
}, [navigate]);

useEffect(() => {
  setCurrentPage(1);
}, [medicines]);


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
    }, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

 const fetchMedicines = async (): Promise<void> => {
  const ownerToken = localStorage.getItem("token");
  const userToken = localStorage.getItem("accessToken");

  let apiUrl = "";
  let token = "";

  if (ownerToken) {
    const pharmacyId = localStorage.getItem("pharmacy_id");
    if (!pharmacyId) {
      toast.error("Pharmacy ID not found.");
      return;
    }
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/owner/pharmacies/${pharmacyId}/medicines/`;
    token = ownerToken;
  } else if (userToken) {
    apiUrl = "https://smart-pharma-net.vercel.app/medicine/medicines/";
    token = userToken;
  } else {
    toast.error("You need to log in first.");
    navigate("/pharmacy-login");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorResponse = await response.json();

      if (errorResponse.code === "token_not_valid" && !ownerToken) {
        // فقط جرّب تعمل refresh لو كنا بنستخدم accessToken مش token
        await refreshToken();
        const newToken = localStorage.getItem("accessToken");

        if (!newToken) {
          toast.error("Failed to refresh token. Please log in again.");
          navigate("/pharmacy-login");
          return;
        }

        const retryResponse = await fetch(apiUrl, {
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

  const validateMedicine = (medicine: Omit<Medicine, "id"> | Medicine): boolean => {
    if (!medicine.name || !medicine.category || !medicine.price || !medicine.exp_date) {
      toast.error("Please fill all required fields");
      return false;
    }
    
    if (parseFloat(medicine.price) <= 0) {
      toast.error("Price must be greater than 0");
      return false;
    }
    
    if (medicine.quantity <= 0) {
      toast.error("Quantity must be greater than 0");
      return false;
    }
    
    if (medicine.can_be_sell && (medicine.quantity_to_sell <= 0 || parseFloat(medicine.price_sell || "0") <= 0)) {
      toast.error("If medicine can be sell, selling quantity and price must be greater than 0");
      return false;
    }
    
    return true;
  };

 const handleToggleCanBeSell = async (id: number, newValue: boolean): Promise<void> => {
  const ownerToken = localStorage.getItem("token");
  const userToken = localStorage.getItem("accessToken");

  let token = "";
  let apiUrl = "";

  if (ownerToken) {
    const pharmacyId = localStorage.getItem("pharmacy_id");
    if (!pharmacyId) {
      toast.error("Pharmacy ID not found.");
      return;
    }
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/owner/pharmacies/${pharmacyId}/medicines/${id}/`;
    token = ownerToken;
  } else if (userToken) {
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/medicines/${id}/`;
    token = userToken;
  } else {
    toast.error("You need to log in first.");
    return;
  }

  try {
    const medicineToUpdate = medicines.find(med => med.id === id);
    if (!medicineToUpdate) {
      toast.error("Medicine not found");
      return;
    }

    const payload = {
      ...medicineToUpdate,
      can_be_sell: newValue,
      quantity_to_sell: newValue ? (medicineToUpdate.quantity_to_sell || 1) : 0,
      price_sell: newValue ? (medicineToUpdate.price_sell || medicineToUpdate.price) : "0",
      price: parseFloat(medicineToUpdate.price),
      quantity: parseInt(medicineToUpdate.quantity.toString(), 10),
    };

    // إزالة الـ ID من الـ payload
    // @ts-ignore
    delete payload.id;

    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Details:", errorData);

      if (errorData.quantity_to_sell) {
        throw new Error(errorData.quantity_to_sell[0]);
      }

      throw new Error(errorData.message || "Failed to update medicine");
    }

    const data: Medicine = await response.json();

    setMedicines(medicines.map(med =>
      med.id === id ? {
        ...med,
        can_be_sell: data.can_be_sell,
        quantity_to_sell: data.quantity_to_sell,
        price_sell: data.price_sell
      } : med
    ));

    toast.success(`Medicine marked as ${newValue ? "can be sold" : "cannot be sold"}`);
  } catch (error) {
    console.error("Error updating medicine:", error);
    // @ts-ignore
    toast.error(error.message || "Failed to update medicine. Please try again.");

    // إعادة القيمة القديمة في حالة الفشل
    setMedicines(medicines.map(med =>
      med.id === id ? { ...med, can_be_sell: !newValue } : med
    ));
  }
};


  const handleAddMedicine = async (): Promise<void> => {
  const ownerToken = localStorage.getItem("token");
  const userToken = localStorage.getItem("accessToken");

  let apiUrl = "";
  let token = "";

  if (ownerToken) {
    const pharmacyId = localStorage.getItem("pharmacy_id");
    if (!pharmacyId) {
      toast.error("Pharmacy ID not found.");
      return;
    }
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/owner/pharmacies/${pharmacyId}/medicines/`;
    token = ownerToken;
  } else if (userToken) {
    apiUrl = "https://smart-pharma-net.vercel.app/medicine/medicines/";
    token = userToken;
  } else {
    toast.error("You need to log in first.");
    return;
  }

  if (!validateMedicine(newMedicine)) {
    return;
  }

  const payload = {
    name: newMedicine.name,
    category: newMedicine.category,
    description: newMedicine.description,
    price: parseFloat(newMedicine.price),
    quantity: parseInt(newMedicine.quantity.toString(), 10),
    exp_date: newMedicine.exp_date,
    can_be_sell: newMedicine.can_be_sell,
    quantity_to_sell: parseInt(newMedicine.quantity_to_sell.toString(), 10),
    price_sell: parseFloat(newMedicine.price_sell || "0"),
  };

  try {
    const response = await fetch(apiUrl, {
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
      can_be_sell: true,
      quantity_to_sell: 0,
      price_sell: "",
    });
    setIsModalOpen(false);
  } catch (error) {
    console.error("Error adding medicine:", error);
    toast.error("Failed to add medicine. Please try again.");
  }
};


 const handleUpdateMedicine = async (id: number, updatedMedicine: Medicine): Promise<void> => {
  const ownerToken = localStorage.getItem("token");
  const userToken = localStorage.getItem("accessToken");

  let token = "";
  let apiUrl = "";

  if (ownerToken) {
    const pharmacyId = localStorage.getItem("pharmacy_id");
    if (!pharmacyId) {
      toast.error("Pharmacy ID not found.");
      return;
    }
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/owner/pharmacies/${pharmacyId}/medicines/${id}/`;
    token = ownerToken;
  } else if (userToken) {
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/medicines/${id}/`;
    token = userToken;
  } else {
    toast.error("You need to log in first.");
    return;
  }

  if (!validateMedicine(updatedMedicine)) {
    return;
  }

  const payload = {
    ...updatedMedicine,
    price: parseFloat(updatedMedicine.price),
    quantity: parseInt(updatedMedicine.quantity.toString(), 10),
    quantity_to_sell: parseInt(updatedMedicine.quantity_to_sell.toString(), 10),
    price_sell: parseFloat(updatedMedicine.price_sell || "0"),
  };

  try {
    const response = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
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
  const ownerToken = localStorage.getItem("token");
  const userToken = localStorage.getItem("accessToken");

  let apiUrl = "";
  let token = "";

  if (ownerToken) {
    const pharmacyId = localStorage.getItem("pharmacy_id");
    if (!pharmacyId) {
      toast.error("Pharmacy ID not found.");
      return;
    }
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/owner/pharmacies/${pharmacyId}/medicines/${id}/`;
    token = ownerToken;
  } else if (userToken) {
    apiUrl = `https://smart-pharma-net.vercel.app/medicine/medicines/${id}/`;
    token = userToken;
  } else {
    toast.error("You need to log in first.");
    return;
  }

  try {
    const response = await fetch(apiUrl, {
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
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    navigate("/availablemedicine");
    return;
  }

  try {
    const refreshToken = localStorage.getItem("refreshToken");
    console.log("Access Token:", accessToken);

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await fetch("https://smart-pharma-net.vercel.app/account/logout/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    const data = await response.json();
    console.log("Logout response:", data);

    if (!response.ok) {
      throw new Error(data.message || "Failed to log out");
    }

    setIsLoggedIn(false);
    localStorage.removeItem("accessToken");
    toast.success("Logged out successfully!");
    navigate("/pharmacy-login");
  } catch (err: any) {
    console.error("Logout error:", err);
    toast.error(err.message || "An error occurred during logout. Please try again.");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("pharmacy_id");

    navigate("/pharmacy-login");
  }
};


  
    const filteredMedicines = medicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory ? medicine.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = medicines.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(medicines.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="p-4 sm:p-8 bg-white min-h-screen">
      <NotificationBell />
      <div className="container mx-auto">
        {/* Header Section with Animated Background */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative mb-8 pt-16 sm:pt-20"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-blue-500 rounded-2xl opacity-10 -z-1"></div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative z-10">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-indigo-900">
                <FaPills className="inline mr-2" />
                Medicine Inventory - {pharmacyName}
              </h1>
              <p className="text-gray-600 mt-1">Manage your pharmacy's medicine stock efficiently</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.03, boxShadow: "0 5px 15px rgba(79, 70, 229, 0.3)" }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-300 flex items-center justify-center shadow-md flex-1 sm:flex-none"
              >
                <FaPlus className="mr-2 text-sm" /> 
                <span className="text-sm sm:text-base">Add Medicine</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={performLogout}
                className="bg-red-500 text-white p-2.5 rounded-lg hover:bg-red-600 transition-all duration-300 flex items-center justify-center shadow-md"
                aria-label="Logout"
              >
                <FaSignOutAlt className="text-lg" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search medicines by name or description..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Painkillers">Painkillers</option>
              <option value="Vitamins">Vitamins</option>
              <option value="Antihistamines">Antihistamines</option>
              <option value="Antidepressants">Antidepressants</option>
            </select>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-3">
                <FaBoxOpen className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Medicines</p>
                <p className="text-2xl font-bold">{medicines.length}</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-3">
                <FaPercentage className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Available for Sale</p>
                <p className="text-2xl font-bold">
                  {medicines.filter(m => m.can_be_sell).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                <FaRegClock className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Expiring Soon</p>
                <p className="text-2xl font-bold">
                  {medicines.filter(m => {
                    const expDate = new Date(m.exp_date);
                    const today = new Date();
                    const diffTime = expDate.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays <= 30 && diffDays >= 0;
                  }).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600 mr-3">
                <FaRegCalendarAlt className="text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Expired</p>
                <p className="text-2xl font-bold">
                  {medicines.filter(m => new Date(m.exp_date) < new Date()).length}
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Medicines Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-indigo-900 flex items-center">
              <FaClinicMedical className="mr-2 text-indigo-600" /> 
              Medicine Stock
              <span className="ml-2 text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                {filteredMedicines.length} items
              </span>
            </h2>
            
            {filteredMedicines.length > itemsPerPage && (
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Page:</span>
                <select
                  value={currentPage}
                  onChange={(e) => paginate(Number(e.target.value))}
                  className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>
                <span className="text-sm text-gray-600 ml-2">of {totalPages}</span>
              </div>
            )}
          </div>

          {filteredMedicines.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-200"
            >
              <img 
                src="https://img.freepik.com/free-vector/no-data-concept-illustration_114360-616.jpg" 
                alt="No medicines"
                className="w-64 mx-auto mb-4"
              />
              <h3 className="text-xl font-medium text-gray-700 mb-2">No Medicines Found</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || selectedCategory 
                  ? "Try adjusting your search or filter criteria"
                  : "Add new medicines to your inventory"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsModalOpen(true);
                  setSearchTerm("");
                  setSelectedCategory("");
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
              >
                Add New Medicine
              </motion.button>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {currentItems.map((medicine, index) => (
  <motion.div
    key={medicine.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 * index }}
    className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col"
  >
    {/* Image Section */}
   {/* Medicine Image */}
<div className="relative h-40 bg-gray-100 overflow-hidden">
  <img
    src={medicine.image_url || "https://www.creativefabrica.com/wp-content/uploads/2020/07/17/Medicine-Logo-Graphics-4647232-1-1-580x386.jpg"}
    alt={medicine.name}
    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
    onError={(e) => {
      (e.target as HTMLImageElement).src = "https://www.creativefabrica.com/wp-content/uploads/2020/07/17/Medicine-Logo-Graphics-4647232-1-1-580x386.jpg";
    }}
  />
  {medicine.exp_date && new Date(medicine.exp_date) < new Date() && (
    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
      Expired
    </span>
  )}
  {medicine.quantity < 10 && (
    <span className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full shadow-sm">
      Low Stock
    </span>
  )}
</div>

    {/* Content Section */}
    <div className="p-4 flex flex-col flex-grow">
      {/* Title Row */}
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
          {medicine.name}
        </h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
          {medicine.category}
        </span>
      </div>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {medicine.description || "No description available"}
      </p>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Price */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Price</p>
          <p className="font-medium text-blue-600">${medicine.price}</p>
        </div>
        
        {/* Quantity */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500">In Stock</p>
          <p className={`font-medium ${medicine.quantity < 10 ? 'text-amber-600' : 'text-green-600'}`}>
            {medicine.quantity}
          </p>
        </div>
        
        {/* Expiry */}
        <div className="space-y-1">
          <p className="text-xs text-gray-500">Expires</p>
          <p className={`text-sm ${new Date(medicine.exp_date) < new Date() ? 'text-red-500' : 'text-gray-700'}`}>
            {new Date(medicine.exp_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Selling Info (conditional) */}
      {medicine.can_be_sell && (
        <div className="bg-gray-50 p-3 rounded-lg mb-4">
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-gray-500">Selling Price</p>
              <p className="font-medium">${medicine.price_sell}</p>
            </div>
            <div>
              <p className="text-gray-500">Available Qty</p>
              <p className="font-medium">{medicine.quantity_to_sell}</p>
            </div>
          </div>
        </div>
      )}

      {/* Toggle and Actions */}
      <div className="mt-auto pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Available for sale</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={medicine.can_be_sell}
              onChange={() => handleToggleCanBeSell(medicine.id, !medicine.can_be_sell)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => openEditModal(medicine)}
            className="flex-1 bg-white border border-blue-500 text-blue-500 hover:bg-blue-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaEdit size={14} /> Edit
          </button>
          <button
            onClick={() => handleDeleteMedicine(medicine.id)}
            className="flex-1 bg-white border border-red-500 text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <FaTrash size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  </motion.div>
))}
              </div>

              {/* Pagination Controls */}
              {filteredMedicines.length > itemsPerPage && (
                <div className="flex justify-center mt-8">
                  <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
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
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                            currentPage === pageNum 
                              ? 'bg-indigo-600 text-white border-indigo-600' 
                              : 'bg-white text-indigo-600 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                        ...
                      </span>
                    )}
                    
                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <button
                        onClick={() => paginate(totalPages)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                          currentPage === totalPages 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-white text-indigo-600 hover:bg-gray-50'
                        }`}
                      >
                        {totalPages}
                      </button>
                    )}
                    
                    <button
                      onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-indigo-600 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Add/Edit Medicine Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 backdrop-blur-sm  bg-opacity-30 flex justify-center items-center p-2 sm:p-4 z-50"
            >
              <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="bg-white rounded-xl shadow-2xl w-full mx-2 sm:mx-0 sm:w-[95%] md:w-[90%] lg:max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      {editingMedicine ? "Update Medicine" : "Add New Medicine"}
                    </h3>
                    <button
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingMedicine(null);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-xl"
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {/* Form Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Name Field */}
                      <div className="col-span-2">
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Name*</label>
                        <input
                          type="text"
                          name="name"
                          placeholder="Medicine name"
                          value={editingMedicine ? editingMedicine.name : newMedicine.name}
                          onChange={handleInputChange}
                          className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      
                      {/* Category */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Category*</label>
                        <select
                          name="category"
                          value={editingMedicine ? editingMedicine.category : newMedicine.category}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (editingMedicine) {
                              setEditingMedicine({...editingMedicine, category: value});
                            } else {
                              setNewMedicine({...newMedicine, category: value});
                            }
                          }}
                          className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        >
                          <option value="">Select Category</option>
                          <option value="Dental and oral agents">Dental and oral agents</option>
                          <option value="Blood products">Blood products</option>
                          <option value="Antibiotics">Antibiotics</option>
                          
                        </select>
                      </div>
                      
                      {/* Price */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Price*</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                          <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            value={editingMedicine ? editingMedicine.price : newMedicine.price}
                            onChange={handleInputChange}
                            className="w-full pl-8 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      </div>
                      
                      {/* Quantity */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Quantity*</label>
                        <input
                          type="number"
                          name="quantity"
                          placeholder="0"
                          min="1"
                          value={editingMedicine ? editingMedicine.quantity : newMedicine.quantity}
                          onChange={handleInputChange}
                          className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      
                      {/* Expiry Date */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Expiry Date*</label>
                        <input
                          type="date"
                          name="exp_date"
                          value={editingMedicine ? editingMedicine.exp_date : newMedicine.exp_date}
                          onChange={handleInputChange}
                          className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          required
                        />
                      </div>
                      
                      {/* Can Be Sell */}
                      <div>
                        <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Available for Sale</label>
                        <select
                          name="can_be_sell"
                          value={editingMedicine ? editingMedicine.can_be_sell.toString() : newMedicine.can_be_sell.toString()}
                          onChange={(e) => {
                            const value = e.target.value === 'true';
                            if (editingMedicine) {
                              setEditingMedicine({...editingMedicine, can_be_sell: value});
                            } else {
                              setNewMedicine({...newMedicine, can_be_sell: value});
                            }
                          }}
                          className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="true">Yes</option>
                          <option value="false">No</option>
                        </select>
                      </div>
                      
                      {/* Quantity to Sell */}
                      {((editingMedicine && editingMedicine.can_be_sell) || (!editingMedicine && newMedicine.can_be_sell)) && (
                        <div>
                          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Quantity to Sell*</label>
                          <input
                            type="number"
                            name="quantity_to_sell"
                            placeholder="0"
                            min="1"
                            value={editingMedicine ? editingMedicine.quantity_to_sell : newMedicine.quantity_to_sell}
                            onChange={handleInputChange}
                            className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            required
                          />
                        </div>
                      )}
                      
                      {/* Selling Price */}
                      {((editingMedicine && editingMedicine.can_be_sell) || (!editingMedicine && newMedicine.can_be_sell)) && (
                        <div>
                          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Selling Price*</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"></span>
                            <input
                              type="number"
                              name="price_sell"
                              placeholder="0.00"
                              step="0.01"
                              min="0"
                              value={editingMedicine ? editingMedicine.price_sell : newMedicine.price_sell}
                              onChange={handleInputChange}
                              className="w-full pl-8 p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              required
                            />
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        name="description"
                        placeholder="Medicine description, dosage instructions, etc."
                        value={editingMedicine ? editingMedicine.description : newMedicine.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-3 sm:pt-4">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setIsModalOpen(false);
                          setEditingMedicine(null);
                        }}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-300 text-sm sm:text-base"
                      >
                        Cancel
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => editingMedicine ? handleUpdateMedicine(editingMedicine.id, editingMedicine) : handleAddMedicine()}
                        className="px-4 py-2 sm:px-5 sm:py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md text-sm sm:text-base"
                      >
                        {editingMedicine ? "Update Medicine" : "Add Medicine"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 mb-8"
        >
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Pharmacy Management Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="h-40 bg-gradient-to-r from-blue-500 to-indigo-600 relative flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/hand-drawn-flat-design-api-illustration_23-2149365021.jpg" 
                  alt="Real-time Sync"
                  className="w-full h-full object-cover opacity-90"
                />
                <FaExchangeAlt className="absolute text-white text-5xl opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Real-time Inventory Sync</h3>
                <p className="text-gray-600">
                  Automatic synchronization across all devices ensures your inventory is always up-to-date, preventing overselling.
                </p>
              </div>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="h-40 bg-gradient-to-r from-green-500 to-teal-600 relative flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/business-analytics-concept-illustration_114360-1554.jpg" 
                  alt="Expiry Alerts"
                  className="w-full h-full object-cover opacity-90"
                />
                <FaRegCalendarAlt className="absolute text-white text-5xl opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Expiry Date Monitoring</h3>
                <p className="text-gray-600">
                  Get automatic alerts for medicines approaching expiration, helping you manage stock rotation and reduce waste.
                </p>
              </div>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <div className="h-40 bg-gradient-to-r from-purple-500 to-pink-600 relative flex items-center justify-center">
                <img 
                  src="https://img.freepik.com/free-vector/business-report-concept-illustration_114360-1566.jpg" 
                  alt="Sales Reports"
                  className="w-full h-full object-cover opacity-90"
                />
                <FaTags className="absolute text-white text-5xl opacity-80" />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-3 text-gray-800">Sales Analytics</h3>
                <p className="text-gray-600">
                  Comprehensive reports help you identify best-selling items, profit margins, and inventory turnover rates.
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
          className="mt-12 mb-8 bg-indigo-50 rounded-2xl p-8 border border-indigo-100"
        >
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 text-center">What Pharmacists Say About Our System</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/women/65.jpg" 
                  alt="Pharmacist"
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-indigo-200"
                />
                <div>
                  <h4 className="font-semibold">Dr. Sarah Johnson</h4>
                  <p className="text-sm text-gray-500">Owner, Green Valley Pharmacy</p>
                  <div className="flex text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "This system has transformed how we manage our inventory. The expiry date alerts alone have saved us thousands in wasted stock."
              </p>
            </motion.div>

            {/* Testimonial 2 */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex items-center mb-4">
                <img 
                  src="https://randomuser.me/api/portraits/men/42.jpg" 
                  alt="Pharmacist"
                  className="w-12 h-12 rounded-full mr-4 object-cover border-2 border-indigo-200"
                />
                <div>
                  <h4 className="font-semibold">Michael Chen, RPh</h4>
                  <p className="text-sm text-gray-500">Manager, City Center Pharmacy</p>
                  <div className="flex text-yellow-400 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "The intuitive interface and powerful features have reduced our medication errors by 40%. Our staff training time was cut in half."
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
          <h2 className="text-2xl font-bold text-indigo-900 mb-6 text-center">Pharmacy Management Tips</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tip 1 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <img 
                src="https://img.freepik.com/free-vector/inventory-management-abstract-concept-illustration_335657-2058.jpg" 
                alt="Inventory Tip"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Inventory Best Practices</h3>
                <p className="text-sm text-gray-600">Learn how to optimize your stock levels and reduce carrying costs.</p>
              </div>
            </motion.div>

            {/* Tip 2 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <img 
                src="https://img.freepik.com/free-vector/organic-flat-people-medical-store-pharmacy_23-2148893663.jpg" 
                alt="Customer Service"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Enhancing Customer Service</h3>
                <p className="text-sm text-gray-600">Strategies to improve patient satisfaction and build loyalty.</p>
              </div>
            </motion.div>

            {/* Tip 3 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <img 
                src="https://img.freepik.com/free-vector/medicine-bottle-pills-capsules_74855-5290.jpg" 
                alt="Expiry Management"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Expiry Date Management</h3>
                <p className="text-sm text-gray-600">Reduce waste by implementing a first-expired-first-out system.</p>
              </div>
            </motion.div>

            {/* Tip 4 */}
            <motion.div
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-100"
            >
              <img 
                src="https://img.freepik.com/free-vector/pharmacist-giving-medicine-patient-pharmacy_74855-5292.jpg" 
                alt="Staff Training"
                className="w-full h-40 object-cover"
              />
              <div className="p-4">
                <h3 className="font-semibold mb-2">Staff Training Techniques</h3>
                <p className="text-sm text-gray-600">Effective ways to train your team on new systems and protocols.</p>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

export default MedicinePage;