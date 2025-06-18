import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Start: React.FC = () => {
  const navigate = useNavigate();
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);

  const [ref, inView] = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [controls, inView]);

  // Navigation paths
  const PATHS = {
    HOME: "/home",
    SIGN_IN: "/signin",
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
        ease: "easeInOut"
      }
    }
  };
  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: { duration: 0.3 }
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { 
        duration: 0.4,
        type: "spring",
        damping: 25,
        stiffness: 500
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: { duration: 0.2 }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.6, -0.05, 0.01, 0.99] 
      },
    },
  };

  const slideIn = {
    left: {
      hidden: { opacity: 0, x: -80 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.8,
          ease: [0.6, -0.05, 0.01, 0.99]
        }
      },
    },
    right: {
      hidden: { opacity: 0, x: 80 },
      visible: { 
        opacity: 1, 
        x: 0,
        transition: { 
          duration: 0.8,
          ease: [0.6, -0.05, 0.01, 0.99]
        }
      },
    },
  };

  const pulse = {
    hidden: { scale: 1 },
    visible: {
      scale: [1, 1.03, 1],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "mirror",
        ease: "easeInOut",
      },
    },
  };
// @ts-ignore

  const floating = {
    hidden: { y: 0 },
    visible: {
      y: [0, -15, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const rotate3D = {
    hidden: { rotateY: 0 },
    visible: {
      rotateY: [0, 15, 0, -15, 0],
      transition: {
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const IMAGE_SECTIONS = [
    {
      image: "https://tse1.mm.bing.net/th/id/OIP._UmT_NIxybJxHirIos4tXwHaEu?w=555&h=354&rs=1&pid=ImgDetMain",
      title: "Modern Pharmacy Experience",
      text: "Our system connects you with fully-equipped pharmacies offering comprehensive medication services",
      reverse: false,
    },
    {
      image: "https://i1.wp.com/ajp.com.au/wp-content/uploads/2016/06/Dispensing2.jpg?resize=1024%2C687&ssl=1",
      title: "Advanced Pharmacy System",
      text: "Complete digital management of medication inventory and prescription tracking",
      reverse: true,
    },
  ];
  
  const CARDS = [
    {
      image: "https://penbodisplay.com/wp-content/uploads/2023/11/pharmacy-gondola-shelving.jpg",
      title: "Medication Shelves",
      description: "Browse our extensive collection of pharmaceuticals and medical supplies",
      badge: "New",
    },
    {
      image: "https://amamedicalgroup.com/wp-content/uploads/2021/02/Pharmacist-Counseling-Services.png",
      title: "Pharmacist Service",
      description: "Professional medication verification using advanced systems",
      badge: "Featured",
    },
    {
      image: "https://st4.depositphotos.com/26922084/39200/v/600/depositphotos_392008384-stock-illustration-customer-service-concept-with-online.jpg",
      title: "Customer Care",
      description: "Dedicated service with the highest professional standards",
      badge: "Popular",
    },
  ];
  
  const FEATURES = [
    {
      icon: "🔍",
      title: "Medication Search",
      description: "Search our comprehensive drug database",
      image: "https://www.ema.europa.eu/en/annual-report-2020/sites/default/files/media/2021-06/card-human-medicines.jpg",
    },
    {
      icon: "🛡️",
      title: "Quality Assurance",
      description: "Medications approved by health authorities",
      image: "https://tse2.mm.bing.net/th/id/OIP.S-AQXcMjzEHQWQDwKQ1fIgHaEi?rs=1&pid=ImgDetMain",
    },
    {
      icon: "⚡",
      title: "Fast Service",
      description: "Quick prescription filling and delivery",
      image: "https://fastfarepharmacy.co.uk/wp-content/uploads/2022/02/fast-flare-about-300x265.jpg",
    },
  ];
  const pharmacyFeatures = [
    {
      icon: "💊",
      title: "Comprehensive Medication Database",
      description: "Access to thousands of FDA-approved medications with detailed information"
    },
    {
      icon: "🏥",
      title: "Pharmacy Network Integration",
      description: "Connected with over 5,000 pharmacies nationwide for seamless service"
    },
    {
      icon: "🔍",
      title: "Advanced Search",
      description: "Find medications by name, condition, or active ingredient"
    },
    {
      icon: "🛡️",
      title: "Safety Checks",
      description: "Automatic drug interaction and allergy alerts"
    }
  ];

  const medicineFacts = [
    "Over 4 billion prescriptions are filled in the U.S. annually",
    "The global pharmaceutical market is worth over $1.2 trillion",
    "The first pharmacy was established in Baghdad in the 8th century",
    "90% of Americans live within 5 miles of a pharmacy"
  ];

  // Handle navigation with smooth exit animation
  const handleNavigation = async (path: string) => {
    await controls.start("exit");
    navigate(path);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gray-900">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 to-purple-900/80" />
        
        {/* Floating particles */}
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${Math.random() * 8 + 4}px`,
              height: `${Math.random() * 8 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, (Math.random() - 0.5) * 80],
              x: [0, (Math.random() - 0.5) * 80],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "linear",
            }}
          />
        ))}

        {/* Animated grid pattern */}
        <motion.div 
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 2, delay: 1 }}
        >
          <div className="absolute inset-0 bg-grid-white/[0.05] [mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        </motion.div>
      </motion.div>

      {/* Main Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key="main-content"
          ref={ref}
          className="relative z-10 flex flex-col items-center justify-between min-h-screen px-4 py-12 sm:px-6 lg:px-8"
          initial="hidden"
          animate={controls}
          exit="exit"
          variants={container}
        >
          {/* Header with CTA Buttons */}
          <div className="w-full max-w-6xl">
            <div className="flex flex-col md:flex-row justify-between items-center">
              {/* Logo */}
              <motion.div
                className="flex items-center z-20 mb-4 md:mb-0"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                <motion.img
                  src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
                  alt="Logo"
                  className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 mr-2"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.span
                  className="text-xl sm:text-2xl md:text-3xl font-bold text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8 }}
                >
                  smart <span className="text-indigo-300">pharmaNet</span>
                </motion.span>
              </motion.div>

              {/* CTA Buttons - Moved to top */}
              <motion.div
                className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
                variants={container}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  onClick={() => handleNavigation(PATHS.HOME)}
                  className="relative px-6 py-3 text-sm sm:text-base font-medium text-white transition-all duration-300 rounded-xl group"
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 5px 15px -5px rgba(99, 102, 241, 0.5)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Sign Up as User</span>
                  <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-500 transition-all duration-300" />
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 blur-md bg-gradient-to-r from-indigo-400 to-purple-400 transition-all duration-300" />
                </motion.button>

                <motion.button
                  onClick={() => handleNavigation(PATHS.SIGN_IN)}
                  className="relative px-6 py-3 text-sm sm:text-base font-medium text-white transition-all duration-300 bg-transparent border-2 rounded-xl border-indigo-400/30 group hover:border-indigo-300/70"
                  variants={fadeInUp}
                  whileHover={{ 
                    scale: 1.03,
                    boxShadow: "0 5px 15px -5px rgba(99, 102, 241, 0.3)"
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="relative z-10">Sign Up as Admin</span>
                  <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-indigo-900/20 transition-all duration-300" />
                </motion.button>
              </motion.div>
            </div>
          </div>

          {/* Hero Section */}
          <div className="w-full max-w-6xl text-center mt-8 md:mt-16">
            {/* Title */}
            <motion.div className="mb-12" variants={container}>
              <motion.h1
                className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
                variants={slideIn.left}
              >
                <motion.span className="block" variants={fadeInUp}>
                  Welcome to{" "}
                </motion.span>
                <motion.span
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300"
                  variants={slideIn.right}
                >
                  Smart Pharmacy
                </motion.span>
              </motion.h1>

              <motion.p
                className="max-w-3xl mx-auto mt-6 text-lg text-indigo-100 sm:text-xl"
                variants={fadeInUp}
              >
                Revolutionizing pharmacy services with <span className="font-semibold text-indigo-300">AI-powered</span> solutions for patients, pharmacists, and healthcare providers.
              </motion.p>

              {/* Animated scroll indicator */}
              <motion.div
                className="mt-12 flex justify-center"
                variants={fadeInUp}
                animate={{
                  y: [0, 10, 0],
                  opacity: [0.6, 1, 0.6]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-8 h-12 border-2 border-indigo-300 rounded-full flex justify-center">
                  <motion.div 
                    className="w-1 h-2 bg-indigo-300 rounded-full mt-2"
                    animate={{ y: [0, 6, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Image with Text Sections */}
            {IMAGE_SECTIONS.map((section, index) => (
              <motion.div 
                key={index}
                className={`flex flex-col ${section.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-8 my-20`}
                variants={container}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
              >
                <motion.div 
                  className="w-full md:w-1/2"
                  variants={section.reverse ? slideIn.right : slideIn.left}
                >
                  <motion.div
                    className="relative overflow-hidden rounded-xl shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <motion.img
                      src={section.image}
                      alt={section.title}
                      className="object-cover w-full h-64 md:h-96"
                      initial={{ scale: 1.1 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 1.5 }}
                    />
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8 }}
                      viewport={{ once: true }}
                    />
                  </motion.div>
                </motion.div>
                
                <motion.div 
                  className="w-full md:w-1/2 text-left"
                  variants={section.reverse ? slideIn.left : slideIn.right}
                >
                  <motion.h2 
                    className="text-3xl font-bold text-white mb-4"
                    variants={fadeInUp}
                  >
                    {section.title}
                  </motion.h2>
                  <motion.p 
                    className="text-lg text-indigo-100"
                    variants={fadeInUp}
                  >
                    {section.text}
                  </motion.p>
                  <motion.button
                    onClick={() => setIsOpen(true)}
                    className="mt-6 px-6 py-2 text-sm font-medium text-indigo-100 border border-indigo-300/30 rounded-lg hover:bg-indigo-900/30 hover:border-indigo-300/50 transition-all"
                    whileHover={{ 
                      scale: 1.05,
                      backgroundColor: "rgba(99, 102, 241, 0.2)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Learn more
                  </motion.button>
                </motion.div>
              </motion.div>
            ))}

            {/* Feature Cards with Images */}
            <motion.div 
              className="mt-16"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              <motion.h2 
                className="text-3xl font-bold text-white mb-12 text-center"
                variants={fadeInUp}
              >
                Our Smart Services
              </motion.h2>
              
              <motion.div 
                className="grid grid-cols-1 gap-8 md:grid-cols-3"
                variants={container}
              >
                {CARDS.map((card, index) => (
                  <motion.div
                    key={index}
                    className="overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-300/30 transition-all duration-300"
                    variants={fadeInUp}
                    whileHover={{ 
                      y: -10,
                      boxShadow: "0 20px 25px -5px rgba(129, 140, 248, 0.2)",
                    }}
                    custom={index}
                  >
                    <motion.div 
                      className="relative h-48 overflow-hidden"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.5 }}
                    >
                      <motion.img 
                        src={card.image} 
                        alt={card.title}
                        className="w-full h-full object-cover"
                        initial={{ opacity: 0.7 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8 }}
                      />
                      {card.badge && (
                        <motion.span 
                          className="absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600 text-white"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.3 + index * 0.1 }}
                        >
                          {card.badge}
                        </motion.span>
                      )}
                    </motion.div>
                    <div className="p-6">
                      <motion.h3 
                        className="text-xl font-semibold text-white mb-2"
                        whileHover={{ color: "#a5b4fc" }}
                      >
                        {card.title}
                      </motion.h3>
                      <motion.p className="text-indigo-100">
                        {card.description}
                      </motion.p>
                      <motion.button
                        className="mt-4 text-sm text-indigo-300 hover:text-indigo-200 flex items-center"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        Explore service
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-1 gap-6 mt-16 sm:grid-cols-2 lg:grid-cols-3"
              variants={container}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  className="p-6 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-300/30 transition-all duration-300"
                  variants={fadeInUp}
                  whileHover={{
                    y: -5,
                    boxShadow: "0 10px 25px -5px rgba(129, 140, 248, 0.2)",
                  }}
                >
                  <motion.div
                    className="flex flex-col items-center"
                  >
                    <motion.div 
                      className="relative w-20 h-20 mb-4 overflow-hidden rounded-lg"
                      variants={rotate3D}
                    >
                      <img 
                        src={feature.image}
                        alt={feature.title}
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                    <motion.div
                      className="flex items-center justify-center w-16 h-16 mx-auto mb-4 text-3xl rounded-full bg-indigo-500/10"
                      // @ts-ignore

                      variants={pulse}
                    >
                      {feature.icon}
                    </motion.div>
                  </motion.div>
                  <motion.h3 className="mb-2 text-xl font-semibold text-center text-white">
                    {feature.title}
                  </motion.h3>
                  <motion.p className="text-center text-indigo-100">
                    {feature.description}
                  </motion.p>
                </motion.div>
              ))}
            </motion.div>

            {/* CTA Section */}
            <motion.div
              className="mt-24 p-8 rounded-xl bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-300/20"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <div className="max-w-3xl mx-auto text-center">
                <motion.h2 
                  className="text-3xl font-bold text-white mb-4"
                  whileInView={{ 
                    scale: [1, 1.02, 1],
                    transition: { duration: 1 }
                  }}
                  viewport={{ once: true }}
                >
                  Ready to transform your pharmacy experience?
                </motion.h2>
                <motion.p className="text-lg text-indigo-100 mb-8">
                  Join thousands of satisfied users and pharmacies already using our platform.
                </motion.p>
                <motion.div
                  className="flex flex-col sm:flex-row justify-center gap-4"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  viewport={{ once: true }}
                >
                  <motion.button
                    onClick={() => handleNavigation(PATHS.HOME)}
                    className="px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Get Started Now
                  </motion.button>
                  <motion.button
                    onClick={() => handleNavigation(PATHS.SIGN_IN)}
                    className="px-8 py-3 text-base font-medium text-white border border-indigo-300/50 rounded-lg hover:bg-indigo-900/30 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Learn More
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.footer 
            className="w-full max-w-6xl mt-20 py-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center">
                  <img
                    src="https://raw.githubusercontent.com/Youssif-Hamdy/logo/refs/heads/main/logo.png"
                    alt="Logo"
                    className="h-8 w-8 mr-2"
                  />
                  <span className="text-xl font-bold text-white">
                    smart <span className="text-indigo-300">pharmaNet</span>
                  </span>
                </div>
                <p className="mt-4 text-sm text-indigo-100">
                  Revolutionizing pharmacy management with smart solutions for everyone.
                </p>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold tracking-wider text-indigo-300 uppercase">
                  Quick Links
                </h3>
                <div className="mt-4 space-y-2">
                  {['Home', 'Features', 'About', 'Contact'].map((item, i) => (
                    <motion.a
                      key={item}
                      href="#"
                      className="block text-sm text-indigo-100 hover:text-white"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      {item}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold tracking-wider text-indigo-300 uppercase">
                  Support
                </h3>
                <div className="mt-4 space-y-2">
                  {['Help Center', 'Privacy Policy', 'Terms of Service', 'FAQ'].map((item, i) => (
                    <motion.a
                      key={item}
                      href="#"
                      className="block text-sm text-indigo-100 hover:text-white"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      {item}
                    </motion.a>
                  ))}
                </div>
              </motion.div>

              <motion.div
                whileHover={{ y: -3 }}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3 className="text-sm font-semibold tracking-wider text-indigo-300 uppercase">
                  Connect With Us
                </h3>
                <div className="flex mt-4 space-x-4">
                    {[
                      { 
                        name: 'LinkedIn',
                        icon: 'https://cdn-icons-png.flaticon.com/512/174/174857.png'
                      },
                      {
                        name: 'Twitter',
                        icon: 'https://cdn-icons-png.flaticon.com/512/733/733579.png'
                      },
                      {
                        name: 'Facebook',
                        icon: 'https://cdn-icons-png.flaticon.com/512/124/124010.png'
                      },
                      {
                        name: 'Instagram',
                        icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png'
                      }
                    ].map((social, i) => (
                      <motion.a
                        key={social.name}
                        href="#"
                        className="text-indigo-100 hover:text-white"
                        whileHover={{ scale: 1.2 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <span className="sr-only">{social.name}</span>
                        <img 
                          src={social.icon} 
                          alt={social.name} 
                          className="w-6 h-6"
                        />
                      </motion.a>
                    ))}
                  </div>
                <p className="mt-4 text-sm text-indigo-100">
                  Subscribe to our newsletter for updates
                </p>
                <div className="flex mt-2">
                  <input 
                    type="email" 
                    placeholder="Your email" 
                    className="px-3 py-2 text-sm text-white bg-indigo-900/30 border border-indigo-300/30 rounded-l focus:outline-none focus:ring-1 focus:ring-indigo-300"
                  />
                  <motion.button 
                    className="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-r hover:bg-indigo-500"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Subscribe
                  </motion.button>
                </div>
              </motion.div>
            </div>

            <div className="mt-12 text-center">
              <p className="text-xs text-indigo-100/50">
                &copy; {new Date().getFullYear()} Smart PharmaNet. All rights reserved.
              </p>
            </div>
          </motion.footer>
        </motion.div>
      </AnimatePresence>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Overlay */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              variants={overlayVariants}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal Content */}
            <motion.div
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 rounded-2xl border border-indigo-300/20 shadow-2xl"
              variants={modalVariants}
            >
              {/* Close Button */}
              <motion.button
                className="absolute top-4 right-4 z-10 p-2 text-indigo-100 hover:text-white rounded-full hover:bg-indigo-900/30 transition-colors"
                onClick={() => setIsOpen(false)}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>

              {/* Modal Body */}
              <div className="p-8">
                {/* Header */}
                <motion.div 
                  className="text-center mb-10"
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                >
                  <motion.div
                    className="flex justify-center mb-6"
                    variants={fadeInUp}
                  >
                    <motion.div
                     
                     className="flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg"
                                       // @ts-ignore 

                      variants={pulse}

                    >
                      <span className="text-3xl">🏥</span>
                    </motion.div>
                  </motion.div>

                  <motion.h2 
                    className="text-3xl font-bold text-white mb-2"
                    variants={fadeInUp}
                  >
                    Modern Pharmacy Solutions
                  </motion.h2>
                  <motion.p 
                    className="text-lg text-indigo-100 max-w-2xl mx-auto"
                    variants={fadeInUp}
                  >
                    Connecting patients with advanced pharmaceutical services and medication management
                  </motion.p>
                </motion.div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Features */}
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h3 
                      className="text-xl font-semibold text-white mb-6 border-b border-indigo-300/20 pb-2"
                      variants={fadeInUp}
                    >
                      Our Pharmacy Services
                    </motion.h3>

                    <div className="space-y-6">
                      {pharmacyFeatures.map((feature, index) => (
                        <motion.div
                          key={index}
                          className="flex items-start p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-indigo-300/30 transition-all"
                          variants={fadeInUp}
                          whileHover={{ y: -3 }}
                        >
                          <div className="flex-shrink-0 mr-4">
                            <motion.div 
                              className="flex items-center justify-center w-12 h-12 rounded-lg bg-indigo-500/10 text-xl"
                              whileHover={{ rotate: [0, 10, -10, 0] }}
                              transition={{ duration: 0.5 }}
                            >
                              {feature.icon}
                            </motion.div>
                          </div>
                          <div>
                            <motion.h4 
                              className="text-lg font-medium text-white mb-1"
                              whileHover={{ color: "#a5b4fc" }}
                            >
                              {feature.title}
                            </motion.h4>
                            <motion.p className="text-indigo-100">
                              {feature.description}
                            </motion.p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Right Column - Medicine Info */}
                  <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                  >
                    <motion.h3 
                      className="text-xl font-semibold text-white mb-6 border-b border-indigo-300/20 pb-2"
                      variants={fadeInUp}
                    >
                      About Medications
                    </motion.h3>

                    <motion.div 
                      className="relative h-64 rounded-xl overflow-hidden mb-6"
                      variants={fadeInUp}
                      whileHover={{ scale: 1.02 }}
                    >
                      <img 
                        src="https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80" 
                        alt="Pharmacy shelves" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 p-6">
                        <motion.h4 
                          className="text-xl font-bold text-white mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          Medication Safety
                        </motion.h4>
                        <motion.p 
                          className="text-indigo-100"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 }}
                        >
                          Our system ensures proper dosage, interactions, and allergy checks
                        </motion.p>
                      </div>
                    </motion.div>

                    <motion.div 
                      className="p-6 rounded-xl bg-indigo-900/20 border border-indigo-300/20"
                      variants={fadeInUp}
                    >
                      <motion.h4 
                        className="text-lg font-semibold text-white mb-4 flex items-center"
                        whileHover={{ x: 5 }}
                      >
                        <svg className="w-5 h-5 mr-2 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Did You Know?
                      </motion.h4>
                      <ul className="space-y-3">
                        {medicineFacts.map((fact, index) => (
                          <motion.li 
                            key={index}
                            className="flex items-start text-indigo-100"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                          >
                            <svg className="w-4 h-4 mt-1 mr-2 text-indigo-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            {fact}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </motion.div>
                </div>

                {/* CTA */}
                <motion.div 
                  className="mt-12 text-center"
                  variants={fadeInUp}
                >
                  <motion.button
                    onClick={() => setIsOpen(false)}
                    className="px-8 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Got it, thanks!
                  </motion.button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Start;