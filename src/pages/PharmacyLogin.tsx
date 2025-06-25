import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaLock,FaPills, FaShieldAlt, FaChartLine, FaMobileAlt } from 'react-icons/fa';
import { MdHealthAndSafety, MdLocalPharmacy } from 'react-icons/md';

// Type definitions
type InputFieldProps = {
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  label: string;
};

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

// Reusable components
const InputField: React.FC<InputFieldProps> = ({ 
  icon, 
  type, 
  value, 
  onChange, 
  placeholder, 
}) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="relative my-6"
  >
    <div className="flex items-center border-b-2 border-indigo-300 py-2">
      <motion.div
        whileHover={{ scale: 1.1 }}
        className="text-indigo-600 mr-3"
      >
        {icon}
      </motion.div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required
        placeholder={placeholder}
        className="appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
      />
    </div>
  </motion.div>
);

const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon, 
  title, 
  description 
}) => (
  <motion.div
    whileHover={{ y: -5 }}
    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
  >
    <div className="text-indigo-600 text-3xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </motion.div>
);

const PharmacyLogin: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const payload = {
      name: name,
      password: password,
    };

    try {
      const response = await axios.post(
        'https://smart-pharma-net.vercel.app/account/pharmacy/login/',
        payload
      );

      localStorage.setItem('accessToken', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
      localStorage.setItem('pharmacyName', name);
  if (response.data.pharmacy && response.data.pharmacy.id) {
      localStorage.setItem('pharmacyId', response.data.pharmacy.id.toString());
    }
      

      navigate('/medicine', { state: { pharmacyName: name } });
    } catch (err: any) {
      console.error('Error details:', err.response?.data || err.message);
      setError('Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white mt-10">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 ">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col lg:flex-row items-center justify-center "
        >
          {/* Login Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full lg:w-1/2 px-6 py-8 bg-white rounded-xl shadow-lg mb-8 lg:mb-0 lg:mr-8"
          >
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ rotate: 5 }}
                className="inline-block mb-4"
              >
                <MdLocalPharmacy className="text-5xl text-indigo-600" />
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Pharmacy Portal
              </h1>
              <p className="text-gray-600">
                Sign in to manage your pharmacy inventory
              </p>
            </div>

            <form onSubmit={handleLogin} className="max-w-md mx-auto">
              <InputField
                icon={<FaUser className="text-indigo-600" />}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pharmacy Name"
                label="Pharmacy Name"
              />
              <InputField
                icon={<FaLock className="text-indigo-600" />}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                label="Password"
              />

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-red-600 mb-4"
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
                <a
                  href="/forget-password"
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70' : ''}`}
              >
                {isLoading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Sign in'}
              </motion.button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

           
            </div>

            <div className="mt-8 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <a
                href="/register"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Sign up
              </a>
            </div>
          </motion.div>

          {/* Info Section with Original GIF */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full lg:w-1/2 px-6 py-8"
          >
            <div className="bg-indigo-50 rounded-xl p-8 h-full flex flex-col">
              <div className="flex-1 mb-8">
                <div
                  className="w-full h-64 bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: "url('https://www.datamanagements.in/wp-content/uploads/2022/01/gif.gif')"
                  }}
                ></div>
              </div>
              
              <h2 className="text-2xl font-bold text-indigo-800 mb-4">
                Smart PharmaNet Management System
              </h2>
              <p className="text-gray-700 mb-6">
                Our platform helps pharmacies streamline operations, manage inventory, and provide better patient care through innovative technology solutions.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <FeatureCard
                  icon={<FaPills />}
                  title="Inventory Management"
                  description="Track and manage your medication inventory in real-time"
                />
                <FeatureCard
                  icon={<MdHealthAndSafety />}
                  title="Patient Safety"
                  description="Reduce medication errors with our safety features"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-indigo-800 mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<FaChartLine />}
              title="Advanced Analytics"
              description="Get detailed reports and insights about your pharmacy operations"
            />
            <FeatureCard
              icon={<FaShieldAlt />}
              title="Secure Platform"
              description="Enterprise-grade security to protect your sensitive data"
            />
            <FeatureCard
              icon={<FaMobileAlt />}
              title="Mobile Access"
              description="Manage your pharmacy from anywhere with our mobile-friendly interface"
            />
          </div>
        </div>
      </div>

      {/* Testimonials (Generic) */}
      <div className="bg-indigo-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-indigo-800 mb-6">
            Trusted by Pharmacies Nationwide
          </h2>
          <div className="grid gap-8">
            {[
              "This system transformed our pharmacy operations completely.",
              "The inventory management features saved us countless hours each week.",
              "Excellent customer support and constantly improving features."
            ].map((quote, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-lg shadow-md"
              >
                <div className="text-indigo-500 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 italic">"{quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-indigo-700 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8 text-indigo-100">
            Join our network of pharmacies using Smart PharmaNet today.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/register"
              className="bg-white text-indigo-700 font-bold py-3 px-8 rounded-full shadow-lg"
            >
              Register Now
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/demo"
              className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-full shadow-lg"
            >
              Request Demo
            </motion.a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyLogin;