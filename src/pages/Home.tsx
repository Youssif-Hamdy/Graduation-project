import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaAllergies, FaBox, FaCalendarAlt, FaCamera, FaCapsules, FaChevronLeft, FaChevronRight, FaDollarSign, FaFileAlt, FaFlask, FaHeadset, FaHeartbeat, FaImage, FaInfoCircle, FaMapMarkerAlt, FaMicrophone, FaPills, FaPrescriptionBottleAlt, FaSearch, FaShieldAlt, FaSyringe, FaTimes, FaTruck } from "react-icons/fa";
import Tesseract from 'tesseract.js';

interface PharmacyLocation {
  latitude: number;
  longitude: number;
  pharmacy_name: string;
  city: string;
}

interface Medicine {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string;
  quantity: number;
  exp_date: string;
  pharmacy: number;
  pharmacy_location: PharmacyLocation;
  distance?: number;
  dosage?: string;
  batch?: string;
  manufacturer?: string;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

// دالة حساب المسافة بين إحداثياتين باستخدام صيغة Haversine
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function Home() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isListening, setIsListening] = useState(false); // حالة للتعرف على ما إذا كان الميكروفون يعمل
  const recognitionRef = useRef<any>(null); // reference للتعرف على الصوت
  const [interimResult, setInterimResult] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  



  const [showMap, setShowMap] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      processImage(file);
    }
  };

  // دالة لمعالجة الصورة باستخدام OCR
  const processImage = async (file: File) => {
    setIsProcessingImage(true);
    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng+ara', 
        {
          logger: m => console.log(m)
        }
      );
      
      // تحسين النص المقروء
      const cleanedText = cleanOCRText(text);
      setSearchQuery(cleanedText);
      
      // البحث عن أفضل تطابق للأدوية
      findBestMedicineMatch(cleanedText);
      
    } catch (error) {
      console.error("Error processing image:", error);
      toast.error("Failed to read text from image");
    } finally {
      setIsProcessingImage(false);
    }
  };

  // تنظيف النص المقروء من OCR
  const cleanOCRText = (text: string): string => {
    // قائمة بالكلمات التي تريد إزالتها (يمكنك إضافة المزيد)
    const sensitiveWords = [
      'اسم', 'الاسم', 'مريض', 'patient', 'name', 'رقم', 'number', 
      'تاريخ', 'date', 'طبيب', 'doctor', 'عيادة', 'clinic'
    ];
    
    // 1. إزالة الأحرف الخاصة والأرقام غير المرغوب فيها
    let cleaned = text.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, '');
    
    // 2. إزالة الأسطر الفارغة والمسافات الزائدة
    cleaned = cleaned.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .join(' ');
    
    // 3. إزالة المسافات الزائدة
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    // 4. إزالة الكلمات الحساسة
    sensitiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleaned = cleaned.replace(regex, '');
    });
    
    // 5. إزالة أي كلمات قد تكون أسماء (اختياري - حسب الحاجة)
    // هذه خطوة إضافية قد تحتاج إلى ضبط حسب السياق
    cleaned = cleaned.split(' ')
      .filter(word => word.length > 3) // تجاهل الكلمات القصيرة التي قد تكون أسماء
      .join(' ');
    
    return cleaned.trim();
  };
  // البحث عن أفضل تطابق للأدوية
  const findBestMedicineMatch = (text: string) => {
    if (!medicines.length) return;
    
    // تحويل النص للأحرف الصغيرة للمقارنة
    const searchLower = text.toLowerCase();
    
    // 1. البحث عن تطابق تام
    const exactMatch = medicines.find(med => 
      med.name.toLowerCase() === searchLower
    );
    
    if (exactMatch) {
      setSelectedMedicine(exactMatch);
      return;
    }
    
    // 2. البحث عن تطابق جزئي
    const partialMatches = medicines.filter(med => 
      med.name.toLowerCase().includes(searchLower) ||
      searchLower.includes(med.name.toLowerCase())
    );
    
    if (partialMatches.length > 0) {
      // إذا وجدنا تطابق جزئي واحد، نعرضه مباشرة
      if (partialMatches.length === 1) {
        setSelectedMedicine(partialMatches[0]);
      } else {
        // إذا وجدنا عدة تطابقات، نعرضها في قائمة
        toast.info(
          <div>
            <p>Multiple matches found:</p>
            <ul className="mt-2">
              {partialMatches.slice(0, 3).map((med, idx) => (
                <li key={idx} className="mb-1">
                  <button 
                    onClick={() => {
                      setSelectedMedicine(med);
                      toast.dismiss();
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {med.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>,
          { autoClose: false }
        );
      }
      return;
    }
    
    // 3. إذا لم نجد تطابق، نستخدم خوارزمية Levenshtein للبحث التقريبي
    const matchesWithDistance = medicines.map(med => ({
      medicine: med,
      distance: levenshteinDistance(searchLower, med.name.toLowerCase())
    }));
    
    // تصفية النتائج لمسافة أقل من 5
    const closeMatches = matchesWithDistance
      .filter(m => m.distance <= 5)
      .sort((a, b) => a.distance - b.distance);
    
    if (closeMatches.length > 0) {
      // عرض أفضل 3 نتائج
      toast.info(
        <div>
          <p>Did you mean:</p>
          <ul className="mt-2">
            {closeMatches.slice(0, 3).map((match, idx) => (
              <li key={idx} className="mb-1">
                <button 
                  onClick={() => {
                    setSelectedMedicine(match.medicine);
                    toast.dismiss();
                  }}
                  className="text-blue-600 hover:underline"
                >
                  {match.medicine.name} (accuracy: {100 - match.distance * 10}%)
                </button>
              </li>
            ))}
          </ul>
        </div>,
        { autoClose: false }
      );
    } else {
      toast.warning("No matching medicine found for the text in the image");
    }
  };









  useEffect(() => {
    const fetchUserLocation = async () => {
      const token = localStorage.getItem('token'); // Check auth state
      
  
      // Case 1: No token (user logged out) → Clear location data
      if (!token) {
        localStorage.removeItem('userLocation');
        localStorage.removeItem('askedForLocation'); // Reset permission flag
        return;
      }
      const savedLocation = localStorage.getItem('userLocation');
      const hasAsked = localStorage.getItem('askedForLocation'); // Check if we've asked before
      // Case 2: Token exists + never asked before → Ask for location
      if (!hasAsked) {
        askForLocation();
      }
      // Case 3: Token exists + already asked → Use saved location (or force refresh if needed)
      else if (savedLocation) {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
        // Optional: Add a button to "Refresh Location" if needed
      }
    };
  
    const askForLocation = () => {
      toast.info(
        <div>
          <p>Allow access to your current location for accurate results?</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button 
              onClick={async () => {
                toast.dismiss();
                localStorage.setItem('askedForLocation', 'true'); // Mark as asked
                await handleLocationAccess();
              }}
              style={{ padding: '5px 10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Allow
            </button>
            <button 
              onClick={() => {
                toast.dismiss();
                localStorage.setItem('askedForLocation', 'true'); // Mark as asked
                toast.warning("Location access denied. You can enable it later in settings.");
              }}
              style={{ padding: '5px 10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px' }}
            >
              Deny
            </button>
          </div>
        </div>,
        { autoClose: false, closeButton: false }
      );
    };
  
    const handleLocationAccess = async () => {
      try {
        if (!navigator.geolocation) {
          toast.warning("Your browser doesn’t support geolocation.");
          return;
        }
  
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await response.json();
            const address = data.display_name || "Current location";
  
            const location = { latitude, longitude, address };
            localStorage.setItem('userLocation', JSON.stringify(location));
            setUserLocation(location);
            toast.success("Location updated!");
          },
          (error) => {
            console.error("Location error:", error);
            toast.warning("Failed to fetch your current location.");
          }
        );
      } catch (error) {
        console.error("Error:", error);
        toast.error("An error occurred.");
      }
    };
  
    fetchUserLocation();
    fetchMedicines();
  }, []); // Add `token` as dependency if using state
  const findClosestMedicineMatch = (spokenText: string): string => {
    if (!medicines.length) return spokenText;
    
    // Convert to lowercase for case-insensitive comparison
    const spokenLower = spokenText.toLowerCase();
    
    // Exact match check
    const exactMatch = medicines.find(med => 
      med.name.toLowerCase() === spokenLower
    );
    if (exactMatch) return exactMatch.name;
    
    // Partial match check (contains)
    const partialMatch = medicines.find(med => 
      med.name.toLowerCase().includes(spokenLower) ||
      spokenLower.includes(med.name.toLowerCase())
    );
    if (partialMatch) return partialMatch.name;
    
    // Fuzzy match using Levenshtein distance
    const medicineNames = medicines.map(med => med.name.toLowerCase());
    const distances = medicineNames.map(name => ({
      name,
      distance: levenshteinDistance(spokenLower, name)
    }));
    
    // Sort by distance and get the closest match
    distances.sort((a, b) => a.distance - b.distance);
    
    // Return the closest match if it's reasonably close
    if (distances[0].distance <= 3) { // threshold of 3 character differences
      return medicines.find(med => 
        med.name.toLowerCase() === distances[0].name
      )?.name || spokenText;
    }
    
    return spokenText;
  };

  // Levenshtein distance function for fuzzy matching
  const levenshteinDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = [];
    
    // Increment along the first column of each row
    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }
    
    // Increment each column in the first row
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill in the rest of the matrix
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i-1) === a.charAt(j-1)) {
          matrix[i][j] = matrix[i-1][j-1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i-1][j-1] + 1, // substitution
            matrix[i][j-1] + 1,    // insertion
            matrix[i-1][j] + 1     // deletion
          );
        }
      }
    }
    
    return matrix[b.length][a.length];
  };

  useEffect(() => {
    const initSpeechRecognition = () => {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                              (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        toast.warn("Speech recognition not supported in your browser");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 5; // Get more alternatives for better matching

      recognition.onstart = () => {
        setIsListening(true);
        setInterimResult("Listening...");
        toast.info("Listening... Please speak now", {
          position: "top-left",
          autoClose: 3000,
        });
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let alternatives = [];
        
        // Get all alternatives from all results
        for (let i = 0; i < event.results.length; i++) {
          for (let j = 0; j < event.results[i].length; j++) {
            alternatives.push(event.results[i][j].transcript);
          }
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        // Process when we have final results
        if (finalTranscript) {
          // Find the best match among all alternatives
          let bestMatch = finalTranscript;
          let lowestDistance = Infinity;
          
          for (const alternative of alternatives) {
            const closestMatch = findClosestMedicineMatch(alternative);
            const distance = levenshteinDistance(
              closestMatch.toLowerCase(), 
              alternative.toLowerCase()
            );
            
            if (distance < lowestDistance) {
              lowestDistance = distance;
              bestMatch = closestMatch;
            }
          }
          
          setSearchQuery(bestMatch);
          setInterimResult("");
          toast.success(`Searching for: ${bestMatch}`, {
            position: "top-left",
            autoClose: 3000,
          });
          
          // Trigger search immediately
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 500);
        } else if (event.results[0] && !event.results[0].isFinal) {
          // Show interim results
          setInterimResult(event.results[0][0].transcript);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        setInterimResult("");
        if (event.error === 'no-speech') {
          toast.warn("No speech was detected");
        } else {
          toast.error(`Error occurred: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    };

    initSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [medicines]); // Add medicines as dependency to update matching function

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast.warn("Voice search not available");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setInterimResult("");
    } else {
      try {
        recognitionRef.current.start();
      } catch (error) {
        toast.error("Please allow microphone access first");
      }
    }
  };

  
  useEffect(() => {
    if (userLocation) {
      fetchMedicines();
    }
  }, [userLocation]);

  const fetchMedicines = async (): Promise<void> => {
    setIsLoading(true);

    try {
      const response = await fetch("https://smart-pharma-net.vercel.app/search_medicine/");
      if (!response.ok) throw new Error("Failed to fetch medicines");
      
      const data: Medicine[] = await response.json();

      // إذا كان موقع المستخدم متاحاً، احسب المسافات
      if (userLocation) {
        const medicinesWithDistance = data.map(medicine => ({
          ...medicine,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            medicine.pharmacy_location.latitude,
            medicine.pharmacy_location.longitude
          )
        }));
        setMedicines(medicinesWithDistance);
      } else {
        setMedicines(data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
      toast.error("Failed to fetch medicines. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const sortByNearest = () => {
    if (!userLocation) {
      toast.warning("Please enable location services to sort by distance");
      return;
    }
    
    setMedicines(prev => [...prev].sort((a, b) => {
      if (a.distance === undefined) return 1;
      if (b.distance === undefined) return -1;
      return a.distance - b.distance;
    }));
  };

  const toggleMap = () => {
    setShowMap(!showMap);
    if (!showMap && userLocation?.address) {
      toast.info(`Your current location: ${userLocation.address}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    medicine.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMedicines = filteredMedicines.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const openModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
  };

  const closeModal = () => {
    setSelectedMedicine(null);
  };

  return (
    <div className="relative min-h-screen flex flex-col text-white overflow-hidden bg-white">
      {/* زر تحديد الموقع */}
      <motion.button
        onClick={toggleMap}
        className="fixed top-25 right-4 sm:right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-xl transition-all flex items-center gap-2 group border-2 border-indigo-400/30"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, type: "spring", stiffness: 300 }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: "0 5px 15px rgba(99, 102, 241, 0.4)"
        }}
        whileTap={{ scale: 0.95 }}
      >
        <FaMapMarkerAlt className="text-indigo-100 group-hover:text-white transition-colors" />
        <span className="text-sm font-medium hidden sm:inline">Find Pharmacies</span>
      </motion.button>

      {/* قسم الهيرو */}
      <motion.div 
        className="relative h-[60vh] min-h-[400px] w-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=2000&q=80&auto=format&fit=crop)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: "brightness(0.7)",
          }}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        
        <motion.div 
          className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-indigo-900/70 to-indigo-900/30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 1 }}
        />
        
        <div className="relative z-10 h-full flex flex-col justify-center items-center px-4">
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-indigo-100">
              Find Rare
            </span> Medicines
          </motion.h1>
        </div>
      </motion.div>
  
      {/* شريط البحث */}
      <div className="relative z-20 mt-5 px-4 sm:px-6 lg:px-8">
    <div className="max-w-4xl mx-auto">
      <motion.div
        className="bg-white p-4 rounded-xl shadow-xl border border-gray-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search for medicines, vitamins, or health products..."
              value={isListening ? interimResult : searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full p-3 sm:p-4 pr-16 rounded-lg bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-400 border border-gray-200 placeholder-gray-400"
            />
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
            <button 
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-2 rounded-full ${
                      isProcessingImage 
                        ? 'bg-indigo-100 text-indigo-600 animate-pulse' 
                        : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'
                    }`}
                    title="Search by image"
                    disabled={isProcessingImage}
                  >
                    {isProcessingImage ? <FaImage /> : <FaCamera />}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                    capture="environment"
                  />
              <button 
                onClick={toggleVoiceSearch}
                className={`p-2 rounded-full ${
                  isListening 
                    ? 'bg-red-100 text-red-600 animate-pulse' 
                    : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'
                }`}
                title="Voice search"
              >
                <FaMicrophone />
              </button>
              <FaSearch className="text-indigo-600" />
            </div>
            {isListening && (
              <div className="absolute left-4 top-4 text-xs text-indigo-600">
                Listening...
              </div>
            )}
          </div>
          <button 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 sm:px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 500);
            }}
          >
            <FaSearch />
            <span className="hidden sm:inline">Search</span>
          </button>
          
        </div>

     {/* معاينة الصورة المختارة */}
            {imagePreview && (
              <div className="mt-3 flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={imagePreview} 
                    alt="Medicine preview" 
                    className="h-16 w-16 object-contain border border-gray-200 rounded"
                  />
                  {isProcessingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
  
      {/* قسم كروت الأدوية */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <motion.h2 
              className="text-3xl font-bold text-gray-800"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              {searchQuery ? (
                <>Results for <span className="text-indigo-600">"{searchQuery}"</span></>
              ) : (
                <>Available Medications</>
              )}
            </motion.h2>
            
            <button 
              onClick={sortByNearest}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg"
            >
              <FaMapMarkerAlt />
              <span>Sort by Nearest</span>
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="text-center py-16 bg-gray-100 rounded-xl max-w-3xl mx-auto">
              <FaPills className="mx-auto text-5xl text-indigo-400 mb-4" />
              <h3 className="text-2xl text-gray-700 mb-2">No medications found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? "Try a different search term"
                  : "Browse our catalog of available medications"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {currentMedicines.map((medicine, index) => (
                  <motion.div
                    key={medicine.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => openModal(medicine)}
                  >
                    <div className="bg-indigo-100 h-40 flex items-center justify-center relative">
                      <FaPills className="text-6xl text-indigo-500 opacity-30" />
                      <div className="absolute bottom-4 right-4 bg-indigo-800/90 text-white text-xs px-2 py-1 rounded-full shadow">
                        {medicine.category}
                      </div>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-800 line-clamp-2">{medicine.name}</h3>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-sm">
                          ${medicine.price}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-gray-600 text-sm">
                        <div className="flex items-center">
                          <FaBox className="mr-2 text-indigo-500" />
                          <span>Stock: {medicine.quantity} units</span>
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className="mr-2 text-indigo-500" />
                          <span>Exp: {medicine.exp_date}</span>
                        </div>
                        {medicine.distance !== undefined && (
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                            <span>{medicine.distance.toFixed(1)} km away</span>
                          </div>
                        )}
                      </div>
                      
                      <button className="mt-4 w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-2 rounded-lg transition-colors text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* عناصر التصفح */}
              {filteredMedicines.length > itemsPerPage && (
                <motion.div 
                  className="mt-12 flex justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => paginate(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronLeft />
                    </button>
                    
                    <div className="flex gap-1">
                      {Array.from({ length: Math.ceil(filteredMedicines.length / itemsPerPage) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => paginate(index + 1)}
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            currentPage === index + 1
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => paginate(Math.min(Math.ceil(filteredMedicines.length / itemsPerPage), currentPage + 1))}
                      disabled={currentPage === Math.ceil(filteredMedicines.length / itemsPerPage)}
                      className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <FaChevronRight />
                    </button>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </div>
  
      {/* قسم الخدمات */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <FaShieldAlt className="text-3xl" />,
                title: "Quality Guarantee",
                description: "All our medications are sourced from certified manufacturers with strict quality control."
              },
              {
                icon: <FaTruck className="text-3xl" />,
                title: "Fast Delivery",
                description: "Get your medications delivered to your doorstep within 24 hours."
              },
              {
                icon: <FaHeadset className="text-3xl" />,
                title: "24/7 Support",
                description: "Our pharmacists are available round the clock for consultations."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="bg-indigo-100 w-14 h-14 rounded-full flex items-center justify-center mb-4 text-indigo-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
  
      {/* قسم التصنيفات */}
      <div className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Medication Categories</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "Pain Relief", icon: <FaPrescriptionBottleAlt /> },
              { name: "Vitamins", icon: <FaCapsules /> },
              { name: "Antibiotics", icon: <FaFlask /> },
              { name: "Diabetes", icon: <FaSyringe /> },
              { name: "Heart Health", icon: <FaHeartbeat /> },
              { name: "Allergy", icon: <FaAllergies /> }
            ].map((category, index) => (
              <motion.button
                key={index}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-indigo-50 transition-colors border border-gray-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchQuery(category.name);
                  setCurrentPage(1);
                }}
              >
                <span className="text-2xl text-indigo-600 mb-2">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700">{category.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </div>
  
      {/* نافذة الخريطة */}
      <AnimatePresence>
        {showMap && userLocation && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={toggleMap}
            />
            
            <motion.div 
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col z-10"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
            >
              <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-500 text-white">
                <div className="flex items-center space-x-3">
                  <FaMapMarkerAlt className="text-xl" />
                  <h2 className="text-xl font-bold">Nearby Pharmacies</h2>
                </div>
                <button
                  onClick={toggleMap}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="p-4 sm:p-5 text-gray-600 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800">{userLocation.address}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Coordinates: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg text-sm transition-colors">
                      <span className="flex items-center gap-1.5">
                        <FaSearch className="text-xs" /> Search Area
                      </span>
                    </button>
                    <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors">
                      <span className="flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-xs" /> My Location
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow relative h-[50vh] min-h-[300px]">
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight={0}
                  marginWidth={0}
                  src={`https://maps.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}&z=15&output=embed`}
                  className="absolute inset-0"
                  title="Pharmacy locations map"
                />
              </div>
              
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-gray-500">
                    Showing pharmacies within 5km radius
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={toggleMap}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <FaTimes className="text-sm" />
                      <span>Close</span>
                    </button>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2">
                      <FaMapMarkerAlt className="text-sm" />
                      <span>Get Directions</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
  
      {/* نافذة تفاصيل الدواء */}
      <AnimatePresence>
        {selectedMedicine && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
              onClick={closeModal}
            />
            
            <motion.div
              className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="sticky top-0 p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-500 text-white z-10">
                <div className="flex items-center space-x-3">
                  <FaPills className="text-xl" />
                  <h2 className="text-xl font-bold">{selectedMedicine.name}</h2>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 p-1 rounded-full hover:bg-indigo-700 transition-colors"
                >
                  <FaTimes className="text-lg" />
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-xl p-5">
                    <h3 className="font-semibold text-indigo-800 mb-3 flex items-center text-lg">
                      <FaInfoCircle className="mr-2" /> Product Details
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Category</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Dosage Form</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.dosage || "As prescribed by physician"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Manufacturer</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.manufacturer || "Not specified"}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-indigo-50 rounded-xl p-5">
                    <h3 className="font-semibold text-indigo-800 mb-3 flex items-center text-lg">
                      <FaDollarSign className="mr-2" /> Pricing & Availability
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Price</p>
                        <p className="text-2xl font-bold text-indigo-700">${selectedMedicine.price}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">In Stock</p>
                        <p className="text-2xl font-bold text-indigo-700">{selectedMedicine.quantity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Expiry Date</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.exp_date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Batch Number</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.batch || "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* قسم معلومات الصيدلية */}
                  <div className="bg-indigo-50 rounded-xl p-5">
                    <h3 className="font-semibold text-indigo-800 mb-3 flex items-center text-lg">
                      <FaMapMarkerAlt className="mr-2" /> Pharmacy Information
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Pharmacy Name</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.pharmacy_location.pharmacy_name}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-1">City</p>
                        <p className="text-gray-800 font-medium">{selectedMedicine.pharmacy_location.city}</p>
                      </div>
                      {selectedMedicine.distance !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Distance</p>
                          <p className="text-gray-800 font-medium">{selectedMedicine.distance.toFixed(1)} km away</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="bg-indigo-50 rounded-xl p-5">
                  <h3 className="font-semibold text-indigo-800 mb-3 flex items-center text-lg">
                    <FaFileAlt className="mr-2" /> Description & Usage
                  </h3>
                  <div className="prose max-w-none text-gray-800">
                    {selectedMedicine.description ? (
                      <p>{selectedMedicine.description}</p>
                    ) : (
                      <div className="space-y-3">
                        <p>Comprehensive information available at your nearest pharmacy.</p>
                        <p className="text-sm text-gray-600">Always consult with a healthcare professional before using this medication.</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <button className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white px-6 py-4 rounded-xl transition-all flex items-center justify-center space-x-3 shadow-md">
                    <FaMapMarkerAlt />
                    <span>Find Nearest Pharmacy</span>
                  </button>
                  <button 
                    onClick={closeModal}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-4 rounded-xl transition-all flex items-center justify-center space-x-3"
                  >
                    <FaTimes />
                    <span>Close Details</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Home;