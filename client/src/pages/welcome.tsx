import { motion } from "framer-motion";
import { Clock, MapPin, Phone, Utensils, Star, Sparkles, Instagram, Facebook } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect, useRef } from "react";
import FloatingParticles from "@/components/floating-particles";
import GoogleReview from "@/components/google-review";
import QuickStarRating from "@/components/quick-star-rating";
import mingsLogo from "@assets/Mings New Logo 2023 copy_1755081324843.png";

export default function Welcome() {
  const [, setLocation] = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Check if audio has already been played in this session
    const hasPlayedInSession = sessionStorage.getItem('welcomeAudioPlayed');
    
    if (!hasPlayedInSession && !hasPlayedRef.current) {
      // Try the muted autoplay technique first
      const attemptMutedAutoplay = async () => {
        const audio = new Audio('/Welcome.mp3');
        audioRef.current = audio;
        
        // Set properties for better autoplay success
        audio.preload = 'auto';
        audio.muted = true; // Start muted to bypass autoplay restrictions
        audio.loop = false;
        
        try {
          // Play muted first (this usually works)
          await audio.play();
          console.log('Muted audio started successfully');
          
          // Now try to unmute after a brief delay
          setTimeout(() => {
            audio.muted = false;
            audio.volume = 0.5;
            console.log('Audio unmuted');
            sessionStorage.setItem('welcomeAudioPlayed', 'true');
            hasPlayedRef.current = true;
          }, 100);
          
        } catch (error) {
          console.log('Even muted autoplay failed, setting up interaction listeners');
          setupInteractionListeners(audio);
        }
      };

      const setupInteractionListeners = (audio: HTMLAudioElement) => {
        const playOnInteraction = async (event: Event) => {
          console.log(`User interaction detected: ${event.type}`);
          try {
            audio.muted = false;
            audio.volume = 0.5;
            await audio.play();
            sessionStorage.setItem('welcomeAudioPlayed', 'true');
            hasPlayedRef.current = true;
            console.log('Audio started playing after user interaction');
            
            // Remove all event listeners
            removeAllListeners();
          } catch (err) {
            console.log('Could not play audio even after interaction:', err);
          }
        };

        const removeAllListeners = () => {
          document.removeEventListener('click', playOnInteraction);
          document.removeEventListener('touchstart', playOnInteraction);
          document.removeEventListener('keydown', playOnInteraction);
          document.removeEventListener('mousemove', playOnInteraction);
          document.removeEventListener('scroll', playOnInteraction);
          document.removeEventListener('mouseenter', playOnInteraction);
          window.removeEventListener('focus', playOnInteraction);
        };

        // Add comprehensive event listeners
        document.addEventListener('click', playOnInteraction, { once: true, passive: true });
        document.addEventListener('touchstart', playOnInteraction, { once: true, passive: true });
        document.addEventListener('keydown', playOnInteraction, { once: true, passive: true });
        document.addEventListener('mousemove', playOnInteraction, { once: true, passive: true });
        document.addEventListener('scroll', playOnInteraction, { once: true, passive: true });
        document.addEventListener('mouseenter', playOnInteraction, { once: true, passive: true });
        window.addEventListener('focus', playOnInteraction, { once: true, passive: true });
        
        // Show a subtle notification that sound is ready
        console.log('🔊 Audio ready - any interaction will start playback');
      };

      // Try Web Audio API approach as fallback
      const tryWebAudioAPI = () => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          if (audioContext.state === 'suspended') {
            const resumeOnInteraction = () => {
              audioContext.resume().then(() => {
                console.log('AudioContext resumed, trying to play audio');
                attemptMutedAutoplay();
                document.removeEventListener('click', resumeOnInteraction);
                document.removeEventListener('touchstart', resumeOnInteraction);
              });
            };
            
            document.addEventListener('click', resumeOnInteraction, { once: true });
            document.addEventListener('touchstart', resumeOnInteraction, { once: true });
          } else {
            attemptMutedAutoplay();
          }
        } catch (error) {
          console.log('Web Audio API not available, using standard approach');
          attemptMutedAutoplay();
        }
      };

      // Start the audio attempt
      tryWebAudioAPI();
    }

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen mings-bg-gradient relative overflow-hidden">
      <FloatingParticles />

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-20 opacity-30">
        <Sparkles style={{ color: 'var(--mings-black)' }} className="text-3xl" />
      </div>

      {/* Social Media Icons - Positioned away from logo on mobile */}
      <div className="absolute top-6 right-6 z-30 flex space-x-3">
        <motion.a
          href="https://instagram.com/mingschinesecuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all duration-300 elegant-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Instagram className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--mings-orange)' }} />
        </motion.a>
        <motion.a
          href="https://facebook.com/mingschinesecuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all duration-300 elegant-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Facebook className="w-5 h-5 md:w-6 md:h-6" style={{ color: 'var(--mings-orange)' }} />
        </motion.a>
      </div>

      <div className="relative z-20 min-h-screen flex items-center justify-center p-1 md:p-4">
        <div className="text-center max-w-5xl mx-auto w-full">
          {/* Logo and Restaurant Name */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Restaurant Logo */}
            <motion.div
              className="w-48 h-48 mx-auto mb-8 rounded-full bg-white p-6 flex items-center justify-center elegant-shadow"
              animate={{
                y: [0, -8, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <img 
                src={mingsLogo} 
                alt="Mings Chinese Cuisine Logo" 
                className="w-full h-full object-contain"
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="mb-6"
            >
              <h1
                className="font-serif text-8xl md:text-10xl font-bold drop-shadow-lg mb-2"
                style={{ color: 'var(--mings-white)', fontFamily: 'Times, serif' }}
              >
                MING'S
              </h1>
              <h2
                className="font-serif text-5xl md:text-7xl font-semibold drop-shadow-lg"
                style={{ color: 'var(--mings-white)', fontFamily: 'Times, serif' }}
              >
                Chinese Cuisine
              </h2>
            </motion.div>
            <motion.p
              className="font-cormorant text-lg md:text-3xl italic mt-4 font-medium px-4 md:px-0"
              style={{ color: 'var(--mings-white)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Where Authentic Flavors Meet Traditional Excellence
            </motion.p>
          </motion.div>

          {/* View Menu Button */}
          <motion.button
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.2 }
            }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setLocation("/menu")}
            className="px-12 py-4 rounded-full font-cinzel text-xl font-bold transition-all duration-300 elegant-shadow border-4 mb-12"
            style={{
              color: 'var(--mings-white)',
              borderColor: 'var(--mings-white)',
              backgroundColor: 'var(--mings-orange)'
            }}
          >
            <span className="flex items-center">
              <Utensils className="inline-block mr-3 text-xl" />
              Explore Our Menu
            </span>
          </motion.button>

          {/* Quick 5-Star Rating */}
          <QuickStarRating className="mb-12" />

          {/* About Section - Wider card for mobile with minimal margins */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
            className="mings-card rounded-2xl md:rounded-3xl p-4 md:p-16 elegant-shadow border-2 md:border-3 mx-1 md:mx-auto max-w-none md:max-w-5xl w-auto md:w-auto"
            style={{ 
              borderColor: 'var(--mings-black)',
              backgroundColor: 'var(--mings-white)'
            }}
          >
            <motion.h2
              className="font-cinzel text-2xl md:text-5xl font-bold mb-4 md:mb-8"
              style={{ color: 'var(--mings-black)' }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
            >
              Authentic Heritage
            </motion.h2>
            <motion.p
              className="font-cormorant text-base md:text-2xl leading-snug md:leading-relaxed mb-6 md:mb-10 font-medium"
              style={{ color: 'var(--mings-black)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2, ease: "easeOut" }}
            >
              Experience the authentic flavors of traditional Chinese cuisine at Mings Chinese Cuisine, where
              time-honored recipes meet modern culinary artistry. Our master chefs craft each dish with
              passion and precision, creating an unforgettable dining experience that celebrates the rich
              heritage of Chinese gastronomy.
            </motion.p>

            <style>
{`
  .force-normal-font {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    font-weight: 400 !important;
    font-style: normal !important;
  }
  
  .force-normal-font * {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
    font-weight: 400 !important;
    font-style: normal !important;
  }
`}
</style>

{/* Restaurant Details */}
<motion.div
  className="grid md:grid-cols-3 gap-3 md:gap-8"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}
>
  <motion.div
    className="text-center p-3 md:p-6 rounded-xl md:rounded-2xl border-2 md:border-3 min-h-[140px] md:min-h-[200px] flex flex-col justify-center"
    style={{ 
      borderColor: 'var(--mings-black)',
      backgroundColor: 'var(--mings-white)'
    }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <Clock className="text-xl md:text-3xl mx-auto mb-2 md:mb-4" style={{ color: 'var(--mings-orange)' }} />
    <h3 className="font-playfair text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--mings-black)' }}>
      Timings
    </h3>
    <p className="font-cormorant text-sm md:text-lg force-normal-font" style={{ color: 'var(--mings-black)' }}>Mon - Sun<br />11:00 AM - 11:00 PM</p>
  </motion.div>
  <motion.div
    className="text-center p-3 md:p-6 rounded-xl md:rounded-2xl border-2 md:border-3 min-h-[140px] md:min-h-[200px] flex flex-col justify-center"
    style={{ 
      borderColor: 'var(--mings-black)',
      backgroundColor: 'var(--mings-white)'
    }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <MapPin className="text-xl md:text-3xl mx-auto mb-2 md:mb-4" style={{ color: 'var(--mings-orange)' }} />
    <h3 className="font-playfair text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--mings-black)' }}>
      Address
    </h3>
    <p className="font-cormorant text-sm md:text-lg force-normal-font" style={{ color: 'var(--mings-black)' }}>123 Food Street<br />Culinary District, City</p>
  </motion.div>
  <motion.div
    className="text-center p-3 md:p-6 rounded-xl md:rounded-2xl border-2 md:border-3 min-h-[140px] md:min-h-[200px] flex flex-col justify-center"
    style={{ 
      borderColor: 'var(--mings-black)',
      backgroundColor: 'var(--mings-white)'
    }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <Phone className="text-xl md:text-3xl mx-auto mb-2 md:mb-4" style={{ color: 'var(--mings-orange)' }} />
    <h3 className="font-playfair text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--mings-black)' }}>
      Contact
    </h3>
    <p className="font-cormorant text-sm md:text-lg force-normal-font" style={{ color: 'var(--mings-black)' }}>+91 98765 43210<br />info@mingsrestaurant.com</p>
  </motion.div>
</motion.div>
          </motion.div>

          {/* Spacer div for better separation */}
          <div className="h-8 md:h-12"></div>

          {/* Google Review Section */}
          <GoogleReview className="mt-8 md:mt-12" />
        </div>
      </div>
    </div>
  );
}