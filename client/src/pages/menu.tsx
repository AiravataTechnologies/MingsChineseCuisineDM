import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Menu as MenuIcon,
  X,
  Phone,
  Clock,
  MapPin,
  Mic,
  MicOff,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DishCard from "@/components/dish-card";
import type { MenuItem } from "@shared/schema";

// Type declarations for Speech Recognition API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

// Coupon data for the coupon carousel
const coupons = [
  {
    id: 1,
    discount: "100",
    subtitle: "Above ₹999",
    code: "SAVE100",
    bgColor: "#dc2626",
    validUntil: "December 2025"
  },
  {
    id: 2,
    discount: "150",
    subtitle: "Above ₹1499",
    code: "SAVE150",
    bgColor: "#f59e0b",
    validUntil: "December 2025"
  },
  {
    id: 3,
    discount: "200",
    subtitle: "Above ₹1999",
    code: "MEGA200",
    bgColor: "#0891b2",
    validUntil: "December 2025"
  },
  {
    id: 4,
    discount: "75",
    subtitle: "Above ₹699",
    code: "FIRST75",
    bgColor: "#059669",
    validUntil: "December 2025"
  },
  {
    id: 5,
    discount: "300",
    subtitle: "Above ₹2999",
    code: "ROYAL300",
    bgColor: "#7c3aed",
    validUntil: "December 2025"
  }
];

// Promotional images for the carousel - Updated with new images without tint/overlay
const promotionalImages = [
  {
    id: 1,
    src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=200&fit=crop",
    alt: "Delicious Chinese Cuisine"
  },
  {
    id: 2,
    src: "https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg?auto=compress&cs=tinysrgb&w=800&h=200&fit=crop",
    alt: "Elegant Dining Experience"
  },
  {
    id: 3,
    src: "https://images.pexels.com/photos/3184192/pexels-photo-3184192.jpeg?auto=compress&cs=tinysrgb&w=800&h=200&fit=crop",
    alt: "Fresh Beverages"
  },
  {
    id: 4,
    src: "https://images.pexels.com/photos/1059943/pexels-photo-1059943.jpeg?auto=compress&cs=tinysrgb&w=800&h=200&fit=crop",
    alt: "Authentic Chinese Fritters"
  },
  {
    id: 5,
    src: "https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=800&h=200&fit=crop",
    alt: "Traditional Chinese Cuisine"
  }
];

// Now each category has both a display label and the actual MongoDB category name
const categories = [
  { id: "soups", displayLabel: "Soups", dbCategory: "soups" },
  { id: "vegstarter", displayLabel: "Veg Starter", dbCategory: "vegstarter" },
  { id: "chickenstarter", displayLabel: "Chicken Starter", dbCategory: "chickenstarter" },
  { id: "prawnsstarter", displayLabel: "Prawns Starter", dbCategory: "prawnsstarter" },
  { id: "seafood", displayLabel: "Sea Food", dbCategory: "seafood" },
  { id: "springrolls", displayLabel: "Spring Rolls", dbCategory: "springrolls" },
  { id: "momos", displayLabel: "Momos", dbCategory: "momos" },
  { id: "gravies", displayLabel: "Gravies", dbCategory: "gravies" },
  { id: "potrice", displayLabel: "Pot Rice", dbCategory: "potrice" },
  { id: "rice", displayLabel: "Rice", dbCategory: "rice" },
  { id: "ricewithgravy", displayLabel: "Rice with Gravy", dbCategory: "ricewithgravy" },
  { id: "noodle", displayLabel: "Noodle", dbCategory: "noodle" },
  { id: "noodlewithgravy", displayLabel: "Noodle with Gravy", dbCategory: "noodlewithgravy" },
  { id: "thai", displayLabel: "Thai", dbCategory: "thai" },
  { id: "chopsuey", displayLabel: "Chop Suey", dbCategory: "chopsuey" },
  { id: "desserts", displayLabel: "Desserts", dbCategory: "desserts" },
  { id: "beverages", displayLabel: "Beverages", dbCategory: "beverages" },
  { id: "extra", displayLabel: "Extra", dbCategory: "extra" }
];

const filterTypes = [
  { id: "all", label: "All", color: "var(--royal-gold)" },
  { id: "veg", label: "Veg", color: "var(--royal-emerald)" },
  { id: "non-veg", label: "Non-Veg", color: "var(--royal-maroon)" },
];

export default function Menu() {
  const [, setLocation] = useLocation();
  const [activeCategory, setActiveCategory] = useState("soups");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentCouponIndex, setCurrentCouponIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState(null);
  const [voiceSearchSupported, setVoiceSearchSupported] = useState(false);

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu-items"],
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ["/api/cart"],
  });


  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        // Show user-friendly error message
        if (event.error === 'not-allowed') {
          alert('Voice search permission denied. Please allow microphone access and try again.');
        } else if (event.error === 'no-speech') {
          alert('No speech detected. Please try speaking again.');
        } else {
          alert('Voice search failed. Please try again or type your search.');
        }
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      setSpeechRecognition(recognition);
      setVoiceSearchSupported(true);
    } else {
      setVoiceSearchSupported(false);
    }
  }, []);

  // Voice Search Function
  const startVoiceSearch = () => {
    if (speechRecognition && voiceSearchSupported) {
      try {
        speechRecognition.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        alert('Voice search failed to start. Please try again.');
      }
    } else {
      alert('Voice search is not supported in your browser. Please use Chrome or Safari for the best experience.');
    }
  };

  // Stop Voice Search
  const stopVoiceSearch = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
    }
  };


  // Create a mapping from category IDs to MongoDB category names
  const categoryIdToDbCategory = categories.reduce(
    (acc, category) => {
      acc[category.id] = category.dbCategory;
      return acc;
    },
    {} as Record<string, string>,
  );

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      // Convert activeCategory ID to actual MongoDB category name for comparison
      const activeCategoryDbName = categoryIdToDbCategory[activeCategory];

      // If there's a search query, search across all categories
      const matchesCategory = searchQuery.trim()
        ? true
        : item.category === activeCategoryDbName;

      const matchesFilter =
        filterType === "all" ||
        (filterType === "veg" && item.isVeg) ||
        (filterType === "non-veg" && !item.isVeg);

      const matchesSearch =
        searchQuery.trim() === "" ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesFilter && matchesSearch;
    });
  }, [menuItems, activeCategory, filterType, searchQuery, categoryIdToDbCategory]);

  const cartItemCount = Array.isArray(cartItems) ? cartItems.length : 0;

  const currentFilter = filterTypes.find((f) => f.id === filterType);

  // Auto-scroll carousel effect for images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % promotionalImages.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll carousel effect for coupons
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentCouponIndex((prevIndex) => 
        (prevIndex + 1) % coupons.length
      );
    }, 3000); // Change coupon every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Clear search when category changes (if you want this behavior)
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId);
    // Optionally clear search when switching categories
    // setSearchQuery("");
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--elegant-cream)" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-30 bg-white border-b elegant-shadow"
        style={{ borderColor: "var(--elegant-light-gray)" }}
      >
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className="hover:bg-transparent flex-shrink-0"
                style={{ color: "var(--elegant-gold)" }}
              >
                <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>
              <h1
                className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold truncate"
                style={{ color: "var(--elegant-gold)" }}
              >
                Mings Chinese Cuisine
              </h1>
            </div>

            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3 flex-shrink-0">
              {/* Instagram Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.open("https://instagram.com/mingschinesecuisine", "_blank", "noopener,noreferrer")}
                className="hover:bg-transparent"
                style={{ color: "var(--elegant-gold)" }}
              >
                <FaInstagram className="h-5 w-5 sm:h-6 sm:w-6" />
              </Button>

              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                className="hover:bg-transparent"
                style={{ color: "var(--elegant-gold)" }}
              >
                {showHamburgerMenu ? (
                  <X className="h-7 w-7 sm:h-8 sm:w-8 md:h-6 md:w-6" />
                ) : (
                  <MenuIcon className="h-7 w-7 sm:h-8 sm:w-8 md:h-6 md:w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Hamburger Menu Dropdown */}
        {showHamburgerMenu && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 bottom-0 bg-white z-50 overflow-y-auto"
          >
            <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-bold" style={{ color: "var(--elegant-gold)" }}>
                  Menu Categories
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowHamburgerMenu(false)}
                  className="hover:bg-transparent"
                  style={{ color: "var(--elegant-gold)" }}
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </Button>
              </div>

              {/* Categories */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-6 sm:mb-8">
                {categories.map((category) => (
                  <motion.button
                    key={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      handleCategoryChange(category.id);
                      setShowHamburgerMenu(false);
                    }}
                    className={`p-3 sm:p-4 rounded-lg text-xs sm:text-sm font-serif font-semibold transition-all duration-200 border-2 ${
                      activeCategory === category.id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 bg-white hover:border-yellow-300 hover:bg-yellow-25"
                    }`}
                    style={{ 
                      color: activeCategory === category.id ? "var(--elegant-gold)" : "var(--elegant-black)"
                    }}
                  >
                    {category.displayLabel}
                  </motion.button>
                ))}
              </div>

              {/* Restaurant Information */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-6">
                <h3 className="font-serif text-lg sm:text-xl font-bold mb-3 sm:mb-4" style={{ color: "var(--elegant-gold)" }}>
                  Restaurant Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Mings Chinese Cuisine</p>
                      <p className="text-sm text-gray-600">123 Golden Street, Royal District</p>
                      <p className="text-sm text-gray-600">New Delhi - 110001</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">+91 98765 43210</p>
                      <p className="text-sm text-gray-600">For reservations & orders</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-semibold text-gray-800">11:00 AM - 11:00 PM</p>
                      <p className="text-sm text-gray-600">Open all days</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FaInstagram className="h-5 w-5 text-gray-600" />
                    <div>
                      <button
                        onClick={() => window.open("https://instagram.com/mingschinesecuisine", "_blank", "noopener,noreferrer")}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        @mingschinesecuisine
                      </button>
                      <p className="text-sm text-gray-600">Follow us for updates</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Search Bar with Filter and Voice Search */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        <div className="flex justify-center">
          <div className="relative max-w-2xl w-full">
            <div className="relative flex items-center">
              <Input
                type="text"
                placeholder="Search royal dishes across all categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-2 border-gray-300 focus-visible:ring-2 focus-visible:ring-yellow-400/50 h-12 sm:h-14 text-sm sm:text-lg font-sans pr-32 sm:pr-44 pl-10 sm:pl-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                style={{ color: "var(--elegant-black)" }}
              />
              <div className="absolute left-3 sm:left-5 top-1/2 transform -translate-y-1/2">
                <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              </div>

              {/* Voice Search Button */}
              {voiceSearchSupported && (
                <div className="absolute right-24 sm:right-32 top-1/2 transform -translate-y-1/2 z-20">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={isListening ? stopVoiceSearch : startVoiceSearch}
                    className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full transition-all duration-300 ${
                      isListening 
                        ? "bg-red-100 hover:bg-red-200 text-red-600" 
                        : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                    }`}
                    title={isListening ? "Stop voice search" : "Start voice search"}
                  >
                    {isListening ? (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      >
                        <MicOff className="h-3 w-3 sm:h-4 sm:w-4" />
                      </motion.div>
                    ) : (
                      <Mic className="h-3 w-3 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </div>
              )}

              {/* Filter Button */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 z-20">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowFilterDropdown(!showFilterDropdown);
                  }}
                  className="bg-white border-2 border-gray-300 hover:border-yellow-400 focus-visible:ring-2 focus-visible:ring-yellow-400/50 h-8 sm:h-10 px-2 sm:px-4 text-xs sm:text-sm font-serif font-semibold flex items-center gap-1 sm:gap-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                  style={{ color: "var(--elegant-black)" }}
                >
                  <SlidersHorizontal className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  {currentFilter?.id !== "all" && (
                    <div
                      className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border border-white shadow-sm"
                      style={{
                        backgroundColor:
                          currentFilter?.id === "veg" ? "#22c55e" : "#ef4444",
                      }}
                    />
                  )}
                  <span className="hidden sm:inline">{currentFilter?.label}</span>
                  <ChevronDown
                    className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-400 transition-transform duration-200 ${showFilterDropdown ? "rotate-180" : ""}`}
                  />
                </Button>

                {/* Filter Dropdown */}
                {showFilterDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-40 bg-white border-2 border-gray-300 rounded-2xl shadow-xl z-50 overflow-hidden"
                  >
                    {filterTypes.map((type, index) => (
                      <button
                        key={type.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setFilterType(type.id);
                          setShowFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center gap-3 font-serif font-semibold transition-all duration-200 ${filterType === type.id ? "bg-gray-100" : ""
                          } ${index === 0 ? "rounded-t-2xl" : ""} ${index === filterTypes.length - 1 ? "rounded-b-2xl" : ""}`}
                        style={{ color: "var(--elegant-black)" }}
                      >
                        {type.id !== "all" && (
                          <div
                            className="w-3 h-3 rounded-full border border-white shadow-sm"
                            style={{
                              backgroundColor:
                                type.id === "veg" ? "#22c55e" : "#ef4444",
                            }}
                          />
                        )}
                        {type.id === "all" && (
                          <div className="w-3 h-3 rounded-full bg-gray-400 border border-white shadow-sm" />
                        )}
                        {type.label}
                        {filterType === type.id && (
                          <div className="ml-auto">
                            <div className="w-2 h-2 rounded-full bg-gray-600"></div>
                          </div>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </div>
            
            {/* Voice Search Status */}
            {/* {isListening && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                  <span>Listening... Speak now!</span>
                </div>
              </motion.div>
            )} */}
          </div>
        </div>
      </div>

      {/* Promotional Image Carousel */}
      <div className="container mx-auto px-3 sm:px-4 mb-3 sm:mb-4">
        <div className="relative w-full h-32 sm:h-40 md:h-48 rounded-lg sm:rounded-xl overflow-hidden shadow-lg">
          <motion.div
            className="flex transition-transform duration-1000 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentImageIndex * 100}%)`,
            }}
          >
            {promotionalImages.map((image) => (
              <div
                key={image.id}
                className="min-w-full h-full relative"
                style={{ flexShrink: 0 }}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </motion.div>
          
          {/* Indicator dots */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1 sm:space-x-2">
            {promotionalImages.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex 
                    ? "bg-white shadow-lg scale-125" 
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Coupon Carousel */}
      <div className="container mx-auto px-3 sm:px-4 mb-6 sm:mb-8">
        <div className="relative w-full h-16 sm:h-20 overflow-hidden">
          <motion.div
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{
              transform: `translateX(-${currentCouponIndex * 100}%)`,
            }}
          >
            {coupons.map((coupon) => (
              <motion.div
                key={coupon.id}
                className="min-w-full h-full relative flex items-center justify-center"
                style={{ flexShrink: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-full max-w-sm mx-4 h-16 relative flex overflow-hidden shadow-lg">
                  {/* Left white section with perforations */}
                  <div className="bg-white w-16 flex flex-col justify-center items-center relative border-dashed border-r-2 border-gray-300">
                    {/* Top perforation circles */}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-200 rounded-full"></div>
                    
                    {/* Discount amount */}
                    <div className="text-center">
                      <div className="text-lg font-bold" style={{ color: coupon.bgColor }}>
                        ₹{coupon.discount}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right colored section */}
                  <div 
                    className="flex-1 flex flex-col justify-center px-4 text-white relative"
                    style={{ backgroundColor: coupon.bgColor }}
                  >
                    {/* Side perforations */}
                    <div className="absolute -left-1 top-2 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute -left-1 bottom-2 w-2 h-2 bg-white rounded-full"></div>
                    <div className="absolute -right-1 top-2 w-2 h-2 bg-gray-200 rounded-full"></div>
                    <div className="absolute -right-1 bottom-2 w-2 h-2 bg-gray-200 rounded-full"></div>
                    
                    <div className="text-center">
                      <div className="text-lg font-bold font-serif">COUPON</div>
                      <div className="text-xs opacity-90">{coupon.subtitle}</div>
                      <div className="text-xs opacity-75 mt-1">VALID UNTIL {coupon.validUntil.toUpperCase()}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="container mx-auto px-3 sm:px-4 mb-6 sm:mb-8 md:mb-10">
        <div className="flex space-x-2 sm:space-x-3 md:space-x-4 overflow-x-auto pb-3 sm:pb-4">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-shrink-0"
            >
              <Button
                variant="outline"
                onClick={() => handleCategoryChange(category.id)}
                className={`bg-white border-2 font-serif font-bold transition-all duration-300 px-3 sm:px-4 md:px-6 py-2 sm:py-3 text-xs sm:text-sm md:text-base text-black hover:scale-102 whitespace-nowrap ${activeCategory === category.id ? "shadow-lg scale-105" : ""
                  }`}
                style={{
                  borderColor:
                    activeCategory === category.id
                      ? "var(--elegant-gold)"
                      : "var(--elegant-light-gray)",
                  backgroundColor: "white",
                }}
              >
                {category.displayLabel}
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Search Results Header */}
      {searchQuery.trim() && (
        <div className="container mx-auto px-3 sm:px-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 elegant-shadow">
            <p
              className="font-serif text-sm sm:text-base md:text-lg"
              style={{ color: "var(--elegant-gold)" }}
            >
              Search results for "{searchQuery}" ({filteredItems.length} items
              found)
            </p>
          </div>
        </div>
      )}

      {/* Dishes Grid - Responsive grid with proper alignment */}
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12">
        {isLoading ? (
          <div className="text-center py-12 sm:py-20">
            <div className="relative mx-auto w-12 h-12 sm:w-16 sm:h-16 mb-6 sm:mb-8">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-gray-300"></div>
              <div
                className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-t-transparent absolute top-0 left-0"
                style={{ borderColor: "var(--elegant-gold)" }}
              ></div>
            </div>
            <p
              className="font-sans text-lg sm:text-xl md:text-2xl"
              style={{ color: "var(--elegant-gray)" }}
            >
              Loading royal delicacies...
            </p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 max-w-sm sm:max-w-md mx-auto elegant-shadow">
              <p
                className="font-serif text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4"
                style={{ color: "var(--elegant-gold)" }}
              >
                {searchQuery.trim()
                  ? "No dishes found for your search"
                  : "No Royal Dishes Found"}
              </p>
              <p
                className="font-sans text-sm sm:text-base md:text-lg"
                style={{ color: "var(--elegant-gray)" }}
              >
                {searchQuery.trim()
                  ? "Try searching with different keywords"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            style={{
              alignItems: "stretch", // This stretches all cards to equal height
            }}
          >
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id.toString()}
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full" // Ensures each grid item takes full height
              >
                <DishCard item={item} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {showFilterDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowFilterDropdown(false)}
        />
      )}
    </div>
  );
}