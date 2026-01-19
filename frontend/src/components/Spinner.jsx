import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";
import { Leaf } from "lucide-react";

/* OPTIMIZATIONS APPLIED:
 * 1. Memoized animation variants (computed once)
 * 2. Wrapped in React.memo to prevent unnecessary re-renders
 * 3. Removed redundant rotate animation on outer ring
 * 4. Simplified animation timings
 * 5. Static className strings
 */

const Spinner = () => {
  // Memoize all animation variants
  const animations = useMemo(() => ({
    container: {
      initial: { opacity: 0, scale: 0.5 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.3 }
    },
    spinningRing: {
      animate: { rotate: 360 },
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear"
      }
    },
    centerIcon: {
      animate: {
        scale: [1, 1.2, 1],
        rotate: [0, 5, -5, 0]
      },
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    },
    text: {
      animate: { opacity: [0.5, 1, 0.5] },
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "easeInOut"
      }
    }
  }), []);

  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="relative w-24 h-24"
        {...animations.container}
      >
        {/* Outer Ring - Static */}
        <div className="absolute inset-0 border-4 border-green-400/30 rounded-full" />
        
        {/* Spinning Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-green-400 border-t-transparent rounded-full"
          {...animations.spinningRing}
        />
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div {...animations.centerIcon}>
            <Leaf className="w-10 h-10 text-green-400" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Loading Text */}
      <motion.div
        className="mt-6 text-center"
        {...animations.text}
      >
        <p className="text-white text-xl font-semibold flex items-center justify-center gap-2">
          Analyzing emissions
        </p>
        <p className="text-gray-300 text-sm mt-2">
          Processing your vehicle data
        </p>
      </motion.div>
    </div>
  );
};

export default memo(Spinner);