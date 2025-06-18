import { motion } from 'framer-motion';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaRobot, FaTimes } from 'react-icons/fa';
import Chatbot from 'react-chatbot-kit';
import ActionProvider from '../component/Chatbot/ActionProvider';
import MessageParser from '../component/Chatbot/MessageParser';
import config from '../component/Chatbot/config';
import { useState } from 'react';

function About() {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1 } },
  };

  const slideInLeft = {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 1 } },
  };

  const slideInRight = {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 1 } },
  };

  const robotAnimation = {
    float: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const dotsAnimation = {
    float: {
      y: [0, -5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const [showChatbot, setShowChatbot] = useState(false);
  // @ts-ignore

  const [showMessage, setShowMessage] = useState(false);

  const pharmacyImage1 = 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
  const pharmacyImage2 = 'https://thumbs.dreamstime.com/b/happy-pharmacist-holding-clipboard-hospital-pharmacy-49901362.jpg';
  const medicineImage = 'https://th.bing.com/th/id/OIP.pp-A-xo8970LI43RYe2JZAHaEo?rs=1&pid=ImgDetMain';

  return (
    <div className="min-h-screen bg-white pt-20 px-4 sm:px-6 lg:px-8">
      <div style={{ position: 'fixed', bottom: '100px', right: '20px', zIndex: 1000 }}>
        <motion.div
          animate="float"
          variants={robotAnimation}
          style={{ cursor: 'pointer', textAlign: 'center' }}
        >
          <FaRobot className="text-6xl text-indigo-600" />
        </motion.div>

        <motion.div
          animate="float"
          variants={dotsAnimation}
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}
          onClick={() => {
            setShowChatbot(true);
            setShowMessage(true);
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4F46E5' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4F46E5' }}></div>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#4F46E5' }}></div>
        </motion.div>

        {showChatbot && (
         <div
         style={{
           position: 'absolute',
           bottom: '120px',
           right: '0',
           width: '350px',
           backgroundColor: '#ffffff',
           borderRadius: '10px',
           boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
           overflow: 'hidden',
           border: '1px solid #e0e0e0',
           transition: 'transform 0.3s ease, box-shadow 0.3s ease',
           transform: showChatbot ? 'translateY(0)' : 'translateY(20px)',
           opacity: showChatbot ? 1 : 0,
           visibility: showChatbot ? 'visible' : 'hidden',
         }}
       >
         <div
           style={{
             position: 'absolute',
             top: '10px',
             right: '10px',
             cursor: 'pointer',
             fontSize: '15px',
             color: '#4F46E5', 
             transition: 'color 0.2s ease', 
           }}
           onClick={() => setShowChatbot(false)} 
           onMouseEnter={(e) => (e.currentTarget.style.color = '#3730A3')} 
           onMouseLeave={(e) => (e.currentTarget.style.color = '#4F46E5')} 
         >
           <FaTimes />
         </div>
            <Chatbot
              config={config}
              actionProvider={ActionProvider}
              messageParser={MessageParser}
            />
          </div>
        )}
      </div>

      <div className="container mx-auto">
        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center">
          <h1 className="text-5xl font-bold text-indigo-900 mb-4">About Us</h1>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Welcome to <span className="font-semibold text-indigo-600">Smart PharmaNet</span>, your trusted partner in healthcare and pharmaceutical solutions. We are dedicated to providing high-quality medicines and healthcare services to improve lives.
          </p>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={slideInLeft} className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <img src={pharmacyImage1} alt="Pharmacy Interior" className="w-full h-64 object-cover rounded-lg shadow-lg" />
          <img src={pharmacyImage2} alt="Pharmacist at Work" className="w-full h-64 object-cover rounded-lg shadow-lg" />
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={slideInRight} className="mt-16 bg-indigo-50 p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-semibold text-indigo-900 mb-4">Our Medicines</h2>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img src={medicineImage} alt="Pharmaceutical Products" className="w-full md:w-1/2 h-64 object-cover rounded-lg" />
            <p className="text-lg text-gray-700">
              At <span className="font-semibold text-indigo-600">Smart PharmaNet</span>, we ensure that all our medicines are sourced from trusted manufacturers and meet the highest standards of quality and safety. Our team of experts is always available to provide you with the best advice and support.
            </p>
          </div>
        </motion.div>

        <motion.div initial="hidden" animate="visible" variants={fadeIn} className="mt-16 text-center">
          <h2 className="text-3xl font-semibold text-indigo-900 mb-4">Visit Us</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-5">
            We are located in the heart of Egypt, ready to serve you with the best pharmaceutical care. Visit us today and experience the difference!
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8 mb-4">
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <FaMapMarkerAlt className="text-4xl text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-indigo-900">Location</h3>
              <p className="text-gray-700 text-center">123 Pharma Street, Cairo, Egypt</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <FaPhone className="text-4xl text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-indigo-900">Call Us</h3>
              <p className="text-gray-700 text-center">+20 123 456 7890</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <FaEnvelope className="text-4xl text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-indigo-900">Email Us</h3>
              <p className="text-gray-700 text-center">info@smartpharmanet.com</p>
            </div>
            <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
              <FaClock className="text-4xl text-indigo-600 mb-4" />
              <h3 className="text-xl font-semibold text-indigo-900">Working Hours</h3>
              <p className="text-gray-700 text-center">Mon - Sun: 8 AM - 10 PM</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default About;