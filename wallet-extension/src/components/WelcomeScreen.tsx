import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

// Import SVGs directly
let frames = [];
for (let i = 1; i <= 16; i++) {
  frames.push(new URL(`../assets/IconAnim/${i}.svg`, import.meta.url).href);
}

interface WelcomeScreenProps {
  onComplete: () => void;
}
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onComplete }) => {
  const [currentFrame, setCurrentFrame] = useState(0);

useEffect(() => {
  let frameInterval: NodeJS.Timeout | null = null;
  
  frameInterval = setInterval(() => {
    setCurrentFrame((prev) => {
      // Stop at last frame
      if (prev >= frames.length - 1) {
        if (frameInterval) clearInterval(frameInterval);
        return frames.length - 1;
      }
      return prev + 1;
    });
  }, 150);

  const timer = setTimeout(() => {
    onComplete();
  }, 3000);

  return () => {
    if (frameInterval) clearInterval(frameInterval);
    clearTimeout(timer);
  };
}, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 bg-gradient-to-br from-orange-50 via-white to-amber-50 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ 
          scale: [0.5, 1.2, 1],
          opacity: 1,
          transition: { 
            duration: 1,
            ease: "easeInOut"
          }
        }}
        className="mb-8 relative w-96 h-96"
      >
        {/* Single image element with changing src - no AnimatePresence needed */}
        <img
          src={frames[currentFrame]}
          alt="SunByte Animation"
          className="w-96 h-96 absolute inset-0 object-contain"
        />
      </motion.div>
      
      <motion.h1 
        className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent mb-2"
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: { 
            delay: 0.5,
            duration: 0.5
          }
        }}
      >
        Welcome to SunByte
      </motion.h1>
      
      <motion.p 
        className="text-gray-600 text-lg"
        initial={{ y: 20, opacity: 0 }}
        animate={{ 
          y: 0, 
          opacity: 1,
          transition: { 
            delay: 0.8,
            duration: 0.5
          }
        }}
      >
        Your secure crypto wallet
      </motion.p>
      
      <motion.div 
        className="mt-12 w-64 h-1 bg-orange-100 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ 
          width: '16rem',
          transition: { 
            duration: 3,
            ease: "linear"
          }
        }}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-orange-400 to-amber-500 shadow-lg"
          initial={{ width: 0 }}
          animate={{ 
            width: '100%',
            transition: { 
              duration: 2.8,
              ease: "linear"
            }
          }}
        />
      </motion.div>
    </motion.div>
  );
}