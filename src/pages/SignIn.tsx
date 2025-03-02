import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub, AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface Location {
  latitude: number;
  longitude: number;
}

const App: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [location, setLocation] = useState<Location | null>(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [map, setMap] = useState<L.Map | null>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isForgetPasswordModalOpen, setIsForgetPasswordModalOpen] = useState(false);


  useEffect(() => {
    if (isMapModalOpen && location) {
      const leafletMap = L.map('map').setView([location.latitude, location.longitude], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(leafletMap);

      const newMarker = L.marker([location.latitude, location.longitude], { icon: defaultIcon }).addTo(leafletMap);
      setMap(leafletMap);
      setMarker(newMarker);
    }
  }, [isMapModalOpen, location]);

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          toast.success('Location fetched successfully!');
        },
        () => {
          toast.error('Failed to fetch location. Please allow location access.');
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (isSignUp) {
      if (!firstName) errors.firstName = "First Name is required";
      if (!lastName) errors.lastName = "Last Name is required";
      if (!username) errors.username = "Username is required";
      if (!gender) errors.gender = "Gender is required";
      if (!phone) errors.phone = "Phone is required";
      if (!nationalId) errors.nationalId = "National ID is required";
    }

    if (!email) errors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errors.email = "Email is invalid";

    if (!password) errors.password = "Password is required";
    else if (password.length < 6) errors.password = "Password must be at least 6 characters";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    const payload = {
      user: {
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        password: password,
      },
      gender: gender,
      phone: phone,
      nationalID: nationalId,
    };

    console.log("Sending registration request with payload:", payload);

    try {
      const response = await fetch('https://smartpharmanet-production.up.railway.app/account/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log("Registration response data:", data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success("Registration successful! Please log in.");
      setIsSignUp(false);
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "An error occurred during registration. Please check your details and try again.");
      toast.error(err.message || "An error occurred during registration. Please check your details and try again.");
    }
  };

  const handleLogin = async () => {
    const payload = {
      email: email,
      password: password,
    };
  
    try {
      const response = await fetch('https://smartpharmanet-production.up.railway.app/account/token/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      console.log("Login response data:", data);
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      // حفظ التوكن في localStorage
      localStorage.setItem('token', data.access); // access token
      localStorage.setItem('refreshToken', data.refresh); // refresh token
      toast.success("Login successful!");
  
      // إعادة تحميل الصفحة والتوجيه إلى صفحة الهوم
      window.location.href = '/';
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please check your credentials and try again.");
      toast.error("An error occurred during login. Please check your credentials and try again.");
    }
  };

  const refreshToken = async () => {
    try {
      const response = await fetch('https://smartpharmanet-production.up.railway.app/account/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: localStorage.getItem('token') }),
      });

      console.log("Refresh token response status:", response.status);

      const data = await response.json();
      console.log("Refresh token response data:", data);

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      setToken(data.token);
      localStorage.setItem('token', data.token);
    } catch (err: any) {
      console.error("Token refresh error:", err);
      setError("Failed to refresh token. Please log in again.");
      toast.error("Failed to refresh token. Please log in again.");
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (token) {
        refreshToken();
      }
    }, 15 * 60 * 1000);

    return () => clearInterval(interval);
  }, [token]);

  const handleForgetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }
  
    try {
      const response = await fetch('https://smartpharmanet-production.up.railway.app/auth/users/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
  
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        console.log("Forget password response:", data);
  
        if (!response.ok) {
          throw new Error(data.message || 'Failed to send reset password email');
        }
  
        toast.success("Reset password email sent successfully!");
        setIsForgetPasswordModalOpen(false);
      } else {
        const textResponse = await response.text();
        console.error("Server returned non-JSON response:", textResponse);
        throw new Error("Server error. Please try again later.");
      }
    } catch (err: any) {
      console.error("Forget password error:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    if (isSignUp) {
      console.log("Attempting to register...");
      await handleRegister();
    } else {
      console.log("Attempting to login...");
      await handleLogin();
    }
  };

  return (
    <div className="flex flex-col items-center pt-20 justify-center min-h-screen bg-gray-100 p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center space-x-3">
          <img
            src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
            alt="Logo"
            className="h-16 w-16"
          />
          <h1 className="text-3xl font-bold">
            <span className="text-black">smart </span>
            <span className="text-indigo-600">pharmaNet</span>
          </h1>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-sm md:text-lg text-gray-600 max-w-2xl mx-auto"
        >
          {isSignUp
            ? "Join smart pharmaNet today and unlock a world of exclusive offers, personalized recommendations, and seamless communication. Sign up now to start your journey!"
            : "Sign in to continue exploring smart pharmaNet's services, track your orders, and stay updated with our latest offers. Your next step is just a click away!"}
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative flex flex-col md:flex-row w-full md:w-[900px] h-auto md:h-[650px] bg-white shadow-2xl rounded-lg overflow-hidden"
      >
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`w-full md:w-1/2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex flex-col items-center justify-center p-8 md:p-0 transition-all duration-700 ease-in-out ${isSignUp ? "md:translate-x-full" : "md:translate-x-0"}`}
        >
          <motion.h1
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="text-2xl md:text-4xl font-bold mb-4"
          >
            {isSignUp ? "Hello, Friend!" : "Welcome Back!"}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-2 text-center text-sm md:text-lg px-4 md:px-8"
          >
            {isSignUp
              ? "Sign up today and unlock exclusive offers, personalized recommendations, and seamless communication with smart pharmaNet. Join our community and let us serve you better!"
              : "Sign in to access exclusive deals, track your orders, and stay updated with the latest from smart pharmaNet. Your next step is just a click away!"}
          </motion.p>
          <motion.button
            onClick={() => setIsSignUp(!isSignUp)}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="mt-6 md:mt-8 px-6 md:px-8 py-2 md:py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </motion.button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={`w-full md:w-1/2 bg-white flex flex-col items-center justify-center p-8 md:p-0 transition-all duration-700 ease-in-out ${isSignUp ? "md:-translate-x-full" : "md:translate-x-0"}`}
        >
          <form onSubmit={handleSubmit} className="w-full md:w-3/4 space-y-4 md:space-y-6">
            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-2xl md:text-3xl font-bold text-indigo-600 mb-4 md:mb-6"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </motion.h2>
            {isSignUp && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                  />
                  {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                  />
                  {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                  />
                  {formErrors.username && <p className="text-red-500 text-sm mt-1">{formErrors.username}</p>}
                </div>
                <div>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                  >
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                  </select>
                  {formErrors.gender && <p className="text-red-500 text-sm mt-1">{formErrors.gender}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                  />
                  {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                </div>
                <div>
                  <input
                    type="text"
                    placeholder="National ID"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    className="w-full px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
                  />
                  {formErrors.nationalId && <p className="text-red-500 text-sm mt-1">{formErrors.nationalId}</p>}
                </div>
              </div>
            )}
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 md:py-3 border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300`}
              />
              {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 md:py-3 border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-500 hover:text-indigo-600"
              >
                {showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
              </button>
              {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
            </div>
            {!isSignUp && (
              <button
                type="button"
                onClick={() => setIsForgetPasswordModalOpen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Forgot Password?
              </button>
            )}
            {isSignUp && (
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="w-full py-2 md:py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg"
              >
                Select Location
              </button>
            )}
            <motion.button
              type="submit"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="w-full py-2 md:py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition duration-300 shadow-lg"
            >
              {isSignUp ? "Sign Up" : "Sign In"}
            </motion.button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

            <div className="flex items-center justify-center space-x-4 mt-4 md:mt-6">
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 shadow-sm"
              >
                <FcGoogle className="text-xl md:text-2xl" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition duration-300 shadow-sm"
              >
                <AiFillGithub className="text-xl md:text-2xl" />
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      {isMapModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg w-11/12 md:w-3/4 lg:w-1/2 h-3/4 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Select Location</h2>
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 text-lg"
              >
                &times;
              </button>
            </div>
            <div id="map" className="flex-grow rounded-lg overflow-hidden" style={{ height: '100%', width: '100%' }}></div>
            <button
              onClick={fetchLocation}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
            >
              Fetch My Location
            </button>
          </div>
        </div>
      )}

      {isForgetPasswordModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 md:w-1/3">
            <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsForgetPasswordModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleForgetPassword}
                className="ml-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default App;