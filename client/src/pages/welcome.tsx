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
      const attemptMutedAutoplay = async (useTimestamp: boolean = true) => {
        // First, verify the audio file exists using fetch (for Vercel compatibility)
        try {
          const response = await fetch('/Welcome.mp3', { method: 'HEAD' });
          if (!response.ok) {
            console.error('Audio file not accessible:', response.status);
            return;
          }
          console.log('Audio file verified as accessible');
        } catch (fetchError) {
          console.error('Could not verify audio file existence:', fetchError);
          return;
        }
        
        // Add timestamp to bypass potential caching issues in Vercel (optional)
        const audioSrc = useTimestamp ? `/Welcome.mp3?v=${Date.now()}` : '/Welcome.mp3';
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        
        // Set properties for better autoplay success
        audio.preload = 'auto';
        audio.muted = true; // Start muted to bypass autoplay restrictions
        audio.loop = false;
        audio.crossOrigin = 'anonymous'; // Add for better Vercel compatibility
        
        // Add error handling for file loading
        audio.onerror = (e) => {
          console.error('Audio file failed to load with timestamp, trying fallback without timestamp:', e);
          // Recursively try without timestamp
          if (useTimestamp) {
            attemptMutedAutoplay(false);
          } else {
            console.error('Both timestamped and non-timestamped audio loading failed');
            console.log('Audio file not available, skipping audio playback');
          }
        };
        
        // Add load event to ensure file is ready
        audio.oncanplay = () => {
          console.log('Audio file loaded and ready to play');
        };
        
        // Add network state logging for debugging
        audio.onloadstart = () => console.log('Audio loading started');
        audio.onloadeddata = () => console.log('Audio data loaded');
        audio.oncanplaythrough = () => console.log('Audio can play through completely');
        
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
                attemptMutedAutoplay(true);
                document.removeEventListener('click', resumeOnInteraction);
                document.removeEventListener('touchstart', resumeOnInteraction);
              });
            };
            
            document.addEventListener('click', resumeOnInteraction, { once: true });
            document.addEventListener('touchstart', resumeOnInteraction, { once: true });
          } else {
            attemptMutedAutoplay(true);
          }
        } catch (error) {
          console.log('Web Audio API not available, using standard approach');
          attemptMutedAutoplay(true);
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
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--mings-black)' }}>
      <FloatingParticles />

      {/* Decorative Elements */}
      <div className="absolute bottom-10 left-20 opacity-30">
        <Sparkles style={{ color: 'var(--mings-black)' }} className="text-3xl" />
      </div>

      {/* Social Media Icons - Responsive positioning to avoid logo collision */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-30 flex space-x-2 sm:space-x-3">
        <motion.a
          href="https://instagram.com/mingschinesecuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all duration-300 elegant-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Instagram className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: 'var(--mings-orange)' }} />
        </motion.a>
        <motion.a
          href="https://facebook.com/mingschinesecuisine"
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-all duration-300 elegant-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <Facebook className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: 'var(--mings-orange)' }} />
        </motion.a>
      </div>

      <div className="relative z-20 min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-6">
        <div className="text-center max-w-5xl mx-auto w-full">
          {/* Logo and Restaurant Name */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            {/* Restaurant Logo - Responsive sizing to prevent overlap */}
            <motion.div
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 mx-auto mb-6 sm:mb-8 rounded-full bg-white p-4 sm:p-5 md:p-6 flex items-center justify-center elegant-shadow"
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
                className="font-serif text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-bold drop-shadow-lg mb-2"
                style={{ color: 'var(--mings-orange)', fontFamily: 'Times, serif' }}
              >
                MING'S
              </h1>
              <h2
                className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-semibold drop-shadow-lg"
                style={{ color: 'var(--mings-white)', fontFamily: 'Times, serif' }}
              >
                Chinese Cuisine
              </h2>
            </motion.div>
            <motion.p
              className="font-cormorant text-lg sm:text-xl md:text-3xl lg:text-4xl xl:text-5xl italic mt-2 sm:mt-4 font-medium px-2 sm:px-4 md:px-0"
              style={{ color: 'var(--mings-white)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Where Authentic Flavors Meet Traditional Excellence
            </motion.p>
          </motion.div>

          {/* View Menu Button - Responsive sizing */}
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
            className="px-6 sm:px-10 md:px-12 py-3 sm:py-4 rounded-full font-cinzel text-lg sm:text-xl font-bold transition-all duration-300 elegant-shadow border-2 sm:border-3 md:border-4 mb-8 sm:mb-12"
            style={{
              color: 'var(--mings-white)',
              borderColor: 'var(--mings-white)',
              backgroundColor: 'var(--mings-orange)'
            }}
          >
            <span className="flex items-center justify-center">
              <Utensils className="inline-block mr-2 sm:mr-3 text-lg sm:text-xl" />
              Explore Our Menu
            </span>
          </motion.button>

          {/* Quick 5-Star Rating */}
          <QuickStarRating className="mb-8 sm:mb-12" />

          {/* About Section - Fully responsive design */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0, ease: "easeOut" }}
            className="mings-card rounded-xl sm:rounded-2xl md:rounded-3xl p-3 sm:p-6 md:p-12 lg:p-16 elegant-shadow border-2 md:border-3 mx-2 sm:mx-4 md:mx-auto max-w-none md:max-w-5xl"
            style={{ 
              borderColor: 'var(--mings-black)',
              backgroundColor: 'var(--mings-white)'
            }}
          >
            <motion.h2
              className="font-cinzel text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-8"
              style={{ color: 'var(--mings-black)' }}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 1.1, ease: "easeOut" }}
            >
              Authentic Heritage
            </motion.h2>
            <motion.p
              className="font-cormorant text-sm sm:text-base md:text-xl lg:text-2xl leading-relaxed mb-4 sm:mb-6 md:mb-10 font-medium"
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

{/* Restaurant Details - Responsive grid */}
<motion.div
  className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-8"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 1.3, ease: "easeOut" }}
>
  <motion.div
    className="text-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 md:border-3 min-h-[120px] sm:min-h-[140px] md:min-h-[200px] flex flex-col justify-center"
    style={{ 
      borderColor: 'var(--mings-black)',
      backgroundColor: 'var(--mings-white)'
    }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <Clock className="text-lg sm:text-xl md:text-3xl mx-auto mb-2 md:mb-4" style={{ color: 'var(--mings-orange)' }} />
    <h3 className="font-playfair text-base sm:text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--mings-black)' }}>
      Timings
    </h3>
    <p className="font-cormorant text-xs sm:text-sm md:text-lg force-normal-font" style={{ color: 'var(--mings-black)' }}>Mon - Sun<br />11:00 AM - 11:00 PM</p>
  </motion.div>
  <motion.div
    className="text-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 md:border-3 min-h-[120px] sm:min-h-[140px] md:min-h-[200px] flex flex-col justify-center"
    style={{ 
      borderColor: 'var(--mings-black)',
      backgroundColor: 'var(--mings-white)'
    }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <MapPin className="text-lg sm:text-xl md:text-3xl mx-auto mb-2 md:mb-4" style={{ color: 'var(--mings-orange)' }} />
    <h3 className="font-playfair text-base sm:text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--mings-black)' }}>
      Address
    </h3>
    <p className="font-cormorant text-xs sm:text-sm md:text-lg force-normal-font" style={{ color: 'var(--mings-black)' }}>123 Food Street<br />Culinary District, City</p>
  </motion.div>
  <motion.div
    className="text-center p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl md:rounded-2xl border-2 md:border-3 min-h-[120px] sm:min-h-[140px] md:min-h-[200px] flex flex-col justify-center"
    style={{ 
      borderColor: 'var(--mings-black)',
      backgroundColor: 'var(--mings-white)'
    }}
    whileHover={{ scale: 1.02 }}
    transition={{ duration: 0.3 }}
  >
    <Phone className="text-lg sm:text-xl md:text-3xl mx-auto mb-2 md:mb-4" style={{ color: 'var(--mings-orange)' }} />
    <h3 className="font-playfair text-base sm:text-lg md:text-2xl font-bold mb-1 md:mb-3" style={{ color: 'var(--mings-black)' }}>
      Contact
    </h3>
    <p className="font-cormorant text-xs sm:text-sm md:text-lg force-normal-font" style={{ color: 'var(--mings-black)' }}>+91 98765 43210<br />info@mingsrestaurant.com</p>
  </motion.div>
</motion.div>
          </motion.div>

          {/* Spacer div for better separation */}
          <div className="h-8 md:h-12"></div>

          {/* Google Review Section */}
          <GoogleReview className="mt-8 md:mt-12" />

          {/* Developer Attribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.5, ease: "easeOut" }}
            className="mt-8 sm:mt-12 text-center"
          >
            <p className="text-sm sm:text-base font-medium" style={{ color: 'var(--mings-white)' }}>
              Developed by{' '}
              <motion.a
                href="https://www.airavatatechnologies.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold underline decoration-2 underline-offset-4 transition-all duration-300"
                style={{ color: 'var(--mings-white)' }}
                whileHover={{ 
                  scale: 1.05,
                  textShadow: "0 0 8px rgba(255, 255, 255, 0.8)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                AIRAVATA TECHNOLOGIES
              </motion.a>
              {' '}
              <motion.span
                className="text-yellow-400 text-lg sm:text-xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                💛
              </motion.span>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}