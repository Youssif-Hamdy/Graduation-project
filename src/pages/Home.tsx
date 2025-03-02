import { motion } from "framer-motion";

const variants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  initialLarge: { x: -400, opacity: 0 },
  animateLarge: { x: -300, opacity: 1 },
};
function Home() {
  const isLargeScreen = window.innerWidth >= 768; 

  return (
    <div className="relative min-h-screen flex flex-col justify-center text-white">
      <motion.div
        className="absolute inset-0 bg-cover bg-center h-[75vh] w-full"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1576602976047-174e57a47881?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)`,
          filter: 'brightness(60%)', 
          backdropFilter: 'blur(10px)', 
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        transition={{ duration: 1.5 }}
      />
      
      {/* النص فوق الصورة */}
      <motion.div
      className="relative z-10 text-left p-4 md:p-8 rounded-lg w-full max-w-[90%] md:max-w-3xl mx-auto mt-[35%] md:mt-[20%]"
      initial={isLargeScreen ? "initialLarge" : "initial"}
      animate={isLargeScreen ? "animateLarge" : "animate"}
      transition={{ duration: 1.5 }}
      variants={variants}
    >
      <h1 className="text-3xl md:text-5xl font-bold">Find Rare Medicine</h1>
      <p className="mt-2 text-base md:text-lg">Your trusted source for hard-to-find medications</p>
    </motion.div>

      {/* مربع البحث تحت الصورة */}
      <div className="mt-[40vh] lg:mt-[20vh] w-full flex justify-center">
      <motion.div
          className="relative z-10 w-full max-w-md flex items-center gap-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.5 }} 
        >
          <div className="w-full flex items-center gap-4 mt-15">
            <input
              type="text"
              placeholder="Enter medicine name or upload image..."
              className="w-full p-3 border-2 border-indigo-500 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button className="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors">
              Search
            </button>
          </div>
        </motion.div>
      </div>

      {/* قسم الكاردات */}
      <div className="mt-16 mb-4 w-full flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl px-4">
          {/* كارد 1 */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">Thalidomide</h2>
              <p className="mt-2 text-gray-600">Dosage: Capsule 50mg</p>
              <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                Find
              </button>
            </div>
          </motion.div>

          {/* كارد 2 */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">Colchicine</h2>
              <p className="mt-2 text-gray-600">Dosage: Tablet 0.6mg</p>
              <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                Find
              </button>
            </div>
          </motion.div>

          {/* كارد 3 */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">Hydroxyurea</h2>
              <p className="mt-2 text-gray-600">Dosage: Capsule 500mg</p>
              <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                Find
              </button>
            </div>
          </motion.div>

          {/* كارد 4 */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">Amifampridine</h2>
              <p className="mt-2 text-gray-600">Dosage: Tablet 10mg</p>
              <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                Find
              </button>
            </div>
          </motion.div>

          {/* كارد 5 */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">Nitisinone</h2>
              <p className="mt-2 text-gray-600">Dosage: Capsule 10mg</p>
              <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                Find
              </button>
            </div>
          </motion.div>

          {/* كارد 6 */}
          <motion.div
            className="bg-white rounded-lg shadow-lg overflow-hidden"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-800">Icatibant</h2>
              <p className="mt-2 text-gray-600">Dosage: Injection 30mg</p>
              <button className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors">
                Find
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Home;