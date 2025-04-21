import React, { useState, useEffect } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiFillGithub, AiFillEye, AiFillEyeInvisible, AiOutlineArrowLeft } from "react-icons/ai";
import { motion } from "framer-motion";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';



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
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [isForgetPasswordModalOpen, setIsForgetPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  // Function to check if token is valid
  const isTokenValid = (token: string | null): boolean => {
    if (!token) return false;

    try {
      const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decode token payload
      const expirationTime = decodedToken.exp * 1000; // Convert to milliseconds
      return Date.now() < expirationTime; // Check if token is still valid
    } catch (error) {
      console.error("Error decoding token:", error);
      return false;
    }
  };

  // Function to refresh the token
  const refreshToken = async (): Promise<string | null> => {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      toast.error("No refresh token found. Please log in again.");
      navigate("/signin");
      return null;
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
      localStorage.setItem('token', data.access); // Update the access token
      setToken(data.access); // Update the token state
      toast.success("Token refreshed successfully!");
      return data.access;
    } catch (err: any) {
      console.error("Token refresh error:", err);
      toast.error("Failed to refresh token. Please log in again.");
      navigate("/login");
      return null;
    }
  };

  // Automatically refresh the token every 15 minutes if it's invalid
  useEffect(() => {
    const interval = setInterval(async () => {
      const currentToken = localStorage.getItem("token");
      if (!isTokenValid(currentToken)) {
        await refreshToken();
      }
    }, 10 * 60 * 1000); // 15 minutes

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, []);

  // Fetch location and initialize map

 

  // Validate form inputs
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

  // Handle user registration
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

    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/account/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

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

  // Handle user login
  const handleLogin = async () => {
    const payload = {
      email: email,
      password: password,
    };

    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/account/owner/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Login failed');
      }

      // Save tokens and username in localStorage
      localStorage.setItem('token', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      localStorage.setItem('Email', email); // Save the email as the username
      setToken(data.access); // Update token state
      toast.success("Login successful!");

      // Redirect to home page
      window.location.href = '/home';
    } catch (err: any) {
      console.error("Login error:", err);
      setError("An error occurred during login. Please check your credentials and try again.");
      toast.error("An error occurred during login. Please check your credentials and try again.");
    }
  };

  // Handle forget password
  const handleForgetPassword = async () => {
    if (!email) {
      toast.error("Please enter your email.");
      return;
    }

    try {
      const response = await fetch('https://smart-pharma-net.vercel.app/auth/users/reset_password/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset password email');
      }

      toast.success("Reset password email sent successfully!");
      setIsForgetPasswordModalOpen(false);
    } catch (err: any) {
      console.error("Forget password error:", err);
      toast.error(err.message || "An error occurred. Please try again.");
    }
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    if (isSignUp) {
      await handleRegister();
    } else {
      await handleLogin();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-indigo-50">
      {/* Animated Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-white shadow-sm py-4 px-6 sticky top-0 z-50"
      >
         {/* زر الرجوع إلى الصفحة الرئيسية */}
      <motion.button
        onClick={() => navigate('/start')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed top-4 left-4 z-50 bg-white p-2 rounded-full shadow-lg"
        aria-label="Back to home"
      >
        <AiOutlineArrowLeft className="text-xl text-indigo-600" />
      </motion.button>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <img
              src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
              alt="Logo"
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold">
              <span className="text-gray-800">smart </span>
              <span className="text-indigo-600">pharmaNet</span>
            </h1>
          </motion.div>
          
          <div className="hidden md:flex items-center space-x-8">
            <motion.a 
              whileHover={{ scale: 1.05, color: "#4f46e5" }}
              className="text-gray-600 hover:text-indigo-600 font-medium"
              href="#features"
            >
              Features
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05, color: "#4f46e5" }}
              className="text-gray-600 hover:text-indigo-600 font-medium"
              href="#how-it-works"
            >
              How It Works
            </motion.a>
            <motion.a 
              whileHover={{ scale: 1.05, color: "#4f46e5" }}
              className="text-gray-600 hover:text-indigo-600 font-medium"
              href="#testimonials"
            >
              Testimonials
            </motion.a>
            <motion.button
              onClick={() => setIsSignUp(!isSignUp)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 shadow-md"
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </motion.button>
          </div>
          
          <button className="md:hidden text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </motion.nav>
  
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex-1 flex flex-col items-center justify-center py-12 px-4"
      >
        <div className="max-w-7xl w-full flex flex-col items-center">
          {/* Simple Intro Content Before Form */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12 w-full max-w-3xl"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Your <span className="text-indigo-600">Health</span> Matters
            </h1>
            <p className="text-lg text-gray-600">
              Connecting you with trusted pharmacies for all your medication needs. 
              Fast, reliable, and secure - experience healthcare reimagined.
            </p>
          </motion.div>
  
          {/* Main Form Container - Kept Exactly As You Had It */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative flex flex-col md:flex-row w-full max-w-4xl h-auto md:h-[600px] bg-white shadow-2xl rounded-lg overflow-hidden mb-16"
          >
            <motion.div
  initial={{ opacity: 0, x: -100 }}
  animate={{ opacity: 1, x: 0 }}
  transition={{ duration: 0.7, ease: "easeOut" }}
  className={`w-full md:w-1/2 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white flex flex-col items-center justify-center p-8 md:p-0 transition-all duration-700 ease-in-out ${isSignUp ? "md:translate-x-full" : "md:translate-x-0"}`}
>
  {/* Added Image Here */}
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: 0.2 }}
    className="mb-6"
  >
    <img 
      src="https://xianrise.com/assets/templates/basic/assets/images/login.gif" 
      alt="Welcome Animation"
      className="h-32 w-32 object-contain rounded-full border-4 border-white shadow-lg"
    />
  </motion.div>

  <motion.h1
    initial={{ opacity: 0, x: -100 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="text-2xl md:text-3xl font-bold mb-4"
  >
    {isSignUp ? "Hello, Friend!" : "Welcome Back!"}
  </motion.h1>
  <motion.p
    initial={{ opacity: 0, x: 30 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="mt-2 text-center text-sm md:text-base px-4 md:px-8"
  >
    {isSignUp
      ? "Sign up today and unlock exclusive offers, personalized recommendations, and seamless communication with smart pharmaNet."
      : "Sign in to access exclusive deals, track your orders, and stay updated with the latest from smart pharmaNet."}
  </motion.p>
  <motion.button
    onClick={() => setIsSignUp(!isSignUp)}
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="mt-6 px-6 py-2 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition duration-300 shadow-lg"
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
              <form onSubmit={handleSubmit} className="w-full md:w-3/4 space-y-4">
                <motion.h2
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="text-2xl font-bold text-indigo-600 mb-4"
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
                         <option value="choose">Choose</option>
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
  
                <div className="flex items-center justify-center space-x-4 mt-4">
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
  
          {/* Expanded Content Below Form */}
          <div id="features" className="w-full max-w-6xl mb-24">
            {/* Features Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              {/* Feature 1 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md border border-indigo-100"
              >
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Verified Network</h3>
                <p className="text-gray-600">All pharmacies in our network undergo strict verification for quality assurance.</p>
              </motion.div>
  
              {/* Feature 2 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md border border-indigo-100"
              >
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Get your medications delivered quickly with our efficient logistics network.</p>
              </motion.div>
  
              {/* Feature 3 */}
              <motion.div 
                whileHover={{ y: -5 }}
                className="bg-white p-6 rounded-xl shadow-md border border-indigo-100"
              >
                <div className="bg-indigo-100 text-indigo-600 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Digital Prescriptions</h3>
                <p className="text-gray-600">Upload and manage your prescriptions securely through our platform.</p>
              </motion.div>
            </motion.div>
  
            {/* How It Works Section */}
            <div id="how-it-works" className="bg-white rounded-xl shadow-lg p-8 mb-16 border border-indigo-100">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-2xl md:text-3xl font-bold text-center text-indigo-700 mb-12"
              >
                Simple Steps to Get Started
              </motion.h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Step 1 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="text-center"
                >
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">1</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Create Account</h3>
                  <p className="text-gray-600">Register with your basic information to access our services.</p>
                </motion.div>
                
                {/* Step 2 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">2</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Find Pharmacies</h3>
                  <p className="text-gray-600">Discover trusted pharmacies near you or nationwide.</p>
                </motion.div>
                
                {/* Step 3 */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <div className="bg-indigo-100 text-indigo-600 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">3</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Get Medications</h3>
                  <p className="text-gray-600">Receive your prescriptions through delivery or pickup.</p>
                </motion.div>
              </div>
            </div>
  
            {/* Stats Section */}
            <motion.div 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
            >
              {/* Stat 1 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-indigo-600 text-white p-6 rounded-lg text-center"
              >
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-indigo-100">Partner Pharmacies</div>
              </motion.div>
              
              {/* Stat 2 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ delay: 0.1 }}
                className="bg-indigo-500 text-white p-6 rounded-lg text-center"
              >
                <div className="text-3xl font-bold mb-2">10K+</div>
                <div className="text-indigo-100">Monthly Users</div>
              </motion.div>
              
              {/* Stat 3 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ delay: 0.2 }}
                className="bg-indigo-400 text-white p-6 rounded-lg text-center"
              >
                <div className="text-3xl font-bold mb-2">24/7</div>
                <div className="text-indigo-100">Support</div>
              </motion.div>
              
              {/* Stat 4 */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ delay: 0.3 }}
                className="bg-indigo-300 text-white p-6 rounded-lg text-center"
              >
                <div className="text-3xl font-bold mb-2">98%</div>
                <div className="text-indigo-100">Satisfaction</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.div>
  
      {/* Animated Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gray-800 text-white py-12"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and About */}
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <img
                  src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
                  alt="Logo"
                  className="h-8 w-8"
                />
                <h2 className="text-xl font-bold">
                  <span className="text-white">smart </span>
                  <span className="text-indigo-400">pharmaNet</span>
                </h2>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting patients with trusted pharmacies for better healthcare solutions.
              </p>
            </div>
  
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition">Home</a></li>
                <li><a href="#features" className="text-gray-400 hover:text-indigo-400 transition">Features</a></li>
                <li><a href="#how-it-works" className="text-gray-400 hover:text-indigo-400 transition">How It Works</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition">Contact Us</a></li>
              </ul>
            </div>
  
            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Services</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition">Medicine Delivery</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition">Prescription Management</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition">Pharmacy Locator</a></li>
                <li><a href="#" className="text-gray-400 hover:text-indigo-400 transition">Health Tips</a></li>
              </ul>
            </div>
  
            {/* Contact */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Contact Us</h3>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +123 456 7890
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@smartpharmanet.com
                </li>
                <li className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  123 Health St, Medical City
                </li>
              </ul>
            </div>
          </div>
  
          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} smart pharmaNet. All rights reserved.
          </div>
        </div>
      </motion.footer>
  
      
  
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