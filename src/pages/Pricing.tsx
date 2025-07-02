import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion, AnimatePresence } from 'framer-motion';

const Pricing: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [showUpbar, setShowUpbar] = useState(true);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Pro' | 'Max' | null>(null);
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: ''
  });
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
    } else {
      const timer = setTimeout(() => {
        setIsPageLoaded(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const handleUpgradeClick = (planType: 'Pro' | 'Max') => {
    setSelectedPlan(planType);
    setShowPaymentModal(true);
  };

 const handlePaymentSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  // Simulate payment processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  const ownerToken = localStorage.getItem('token');
  const userToken = localStorage.getItem('accessToken');
  const pharmacyName = localStorage.getItem('pharmacyName') || "Unknown Pharmacy";

  let token = '';
  let apiUrl = '';

  if (ownerToken) {
    const pharmacyId = localStorage.getItem('pharmacy_id');
    if (!pharmacyId) {
      toast.error("Pharmacy ID is missing.");
      setIsLoading(false);
      return;
    }
    token = ownerToken;
    apiUrl = `https://smart-pharma-net.vercel.app/exchange/subscripe/pharmacy/${pharmacyId}/`;
  } else if (userToken) {
    token = userToken;
    apiUrl = `https://smart-pharma-net.vercel.app/exchange/subscripe/`;
  } else {
    toast.error("Authentication required.");
    setIsLoading(false);
    return;
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        type: selectedPlan,
        pharmacy: pharmacyName
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to subscribe');
    }

    const data = await response.json();
    toast.success(`Subscribed to ${selectedPlan} plan successfully!`);
    console.log('Subscription data:', data);
    setShowPaymentModal(false);
  } catch (error) {
    console.error('Subscription error:', error);
    // @ts-ignore
    toast.error(error.message || 'Failed to subscribe. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  const handlePaymentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces every 4 digits
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setPaymentInfo(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    // Format expiry date with slash
    if (name === 'expiryDate') {
      const formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2');
      setPaymentInfo(prev => ({
        ...prev,
        [name]: formattedValue
      }));
      return;
    }
    
    setPaymentInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeUpbar = () => {
    setShowUpbar(false);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut"
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
        ease: "easeOut"
      }
    })
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const getPlanPrice = () => {
    if (!selectedPlan) return '0';
    if (selectedPlan === 'Pro') {
      return activeTab === 'monthly' ? '29' : '25';
    }
    return activeTab === 'monthly' ? '99' : '79';
  };

  return (
    <motion.div 
      initial="hidden"
      animate={isPageLoaded ? "visible" : "hidden"}
      variants={containerVariants}
      className="min-h-screen bg-gray-50 pb-20"
      ref={pageRef}
    >
      <ToastContainer />
      
      {/* Upbar with animation */}
      <AnimatePresence>
        {showUpbar && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="bg-indigo-600 text-white py-3 px-4 shadow-lg"
          >
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="font-medium">Choose the plan that fits your pharmacy needs</span>
              </div>
              <button 
                onClick={closeUpbar}
                className="p-1 rounded-full hover:bg-indigo-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4  backdrop-blur-sm bg-opacity-30">
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    Upgrade to {selectedPlan} Plan
                  </h3>
                  <button 
                    onClick={() => setShowPaymentModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Plan:</span>
                    <span className="font-medium">{selectedPlan} Plan</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Billing:</span>
                    <span className="font-medium">{activeTab === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${getPlanPrice()}</span>
                  </div>
                </div>
                
                <form onSubmit={handlePaymentSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      name="cardNumber"
                      value={paymentInfo.cardNumber}
                      onChange={handlePaymentInputChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        name="expiryDate"
                        value={paymentInfo.expiryDate}
                        onChange={handlePaymentInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        name="cvv"
                        value={paymentInfo.cvv}
                        onChange={handlePaymentInputChange}
                        placeholder="123"
                        maxLength={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={paymentInfo.name}
                      onChange={handlePaymentInputChange}
                      placeholder="John Doe"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Payment...
                      </>
                    ) : (
                      `Pay $${getPlanPrice()}`
                    )}
                  </button>
                </form>
                
                <div className="mt-4 flex items-center justify-center">
                  <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                  <span className="text-xs text-gray-500">Payments are secure and encrypted</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title section with animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
            Pricing Plans
          </h1>
          <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
            Simple, transparent pricing for pharmacies of all sizes
          </p>
          
          {/* Toggle Switch with animation */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-8 flex items-center justify-center"
          >
            <span className={`mr-4 font-medium ${activeTab === 'monthly' ? 'text-indigo-600' : 'text-gray-500'}`}>Monthly</span>
            <button
              type="button"
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setActiveTab(activeTab === 'monthly' ? 'yearly' : 'monthly')}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  activeTab === 'monthly' ? 'translate-x-1' : 'translate-x-6'
                }`}
              />
            </button>
            <span className={`ml-4 font-medium ${activeTab === 'yearly' ? 'text-indigo-600' : 'text-gray-500'}`}>Yearly</span>
          </motion.div>
        </motion.div>

        {/* Pricing Cards with staggered animation */}
        <motion.div 
          className="mt-16 grid gap-8 md:grid-cols-3 md:gap-10 lg:gap-12"
        >
          {/* Free Plan */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="relative flex flex-col p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Free</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl font-semibold">/month</span>
              </p>
              <p className="mt-6 text-gray-500">Perfect for small pharmacies just getting started</p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Up to 50 products</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Basic inventory management</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Email support</span>
                </li>
              </ul>
            </div>
            
            <button
              className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors cursor-default"
            >
              Current Plan
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            custom={1}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="relative flex flex-col p-6 bg-white border-2 border-indigo-500 rounded-2xl shadow-lg shadow-indigo-100 hover:shadow-xl transition-shadow"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.7, type: "spring" }}
              className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full"
            >
              Popular
            </motion.div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">
                  {activeTab === 'monthly' ? '$29' : '$25'}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  /{activeTab === 'monthly' ? 'month' : 'year'}
                </span>
              </p>
              <p className="mt-6 text-gray-500">For growing pharmacies with more needs</p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Up to 500 products</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Advanced inventory management</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Priority email support</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Basic analytics</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleUpgradeClick('Pro')}
              className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Pro
            </button>
          </motion.div>

          {/* Max Plan */}
          <motion.div
            custom={2}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            className="relative flex flex-col p-6 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Max</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">
                  {activeTab === 'monthly' ? '$99' : '$79'}
                </span>
                <span className="ml-1 text-xl font-semibold">
                  /{activeTab === 'monthly' ? 'month' : 'year'}
                </span>
              </p>
              <p className="mt-6 text-gray-500">For large pharmacies with complex needs</p>
              
              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Unlimited products</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Premium inventory management</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">24/7 phone & email support</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-6 w-6 flex-shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span className="ml-3 text-gray-500">API access</span>
                </li>
              </ul>
            </div>
            
            <button
              onClick={() => handleUpgradeClick('Max')}
              className="mt-8 block w-full py-3 px-6 border border-transparent rounded-md text-center font-medium bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Upgrade to Max
            </button>
          </motion.div>
        </motion.div>

        {/* FAQ Section with animation */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-24 max-w-4xl mx-auto"
        >
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">Frequently asked questions</h2>
          <div className="mt-12 space-y-6">
            {[
              {
                question: "Can I change plans later?",
                answer: "Yes, you can upgrade or downgrade your plan at any time."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards and PayPal."
              },
              {
                question: "Is there a contract or long-term commitment?",
                answer: "No, all plans are month-to-month or year-to-year with no long-term commitment."
              },
              {
                question: "Do you offer discounts for non-profits?",
                answer: "Yes, we offer special pricing for non-profit organizations. Please contact us for more information."
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.5 }}
                className="bg-white shadow overflow-hidden rounded-lg"
              >
                <details className="group">
                  <summary className="list-none">
                    <div className="px-6 py-5 flex items-center justify-between cursor-pointer hover:bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900">{faq.question}</h3>
                      <svg className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </summary>
                  <div className="px-6 pb-5">
                    <p className="text-gray-500">{faq.answer}</p>
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Pricing;