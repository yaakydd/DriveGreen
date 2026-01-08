import React from "react";
import { motion } from "framer-motion";
import {  Leaf } from "lucide-react";

/**
 * Spinner Component (Arrow Function)
 * 
 * Purpose: Loading animation during prediction
 */
const Spinner = () => {
  return (
    <div className="flex flex-col items-center justify-center">
      <motion.div
        className="relative w-24 h-24"
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Outer Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-green-400/30 rounded-full"
        />
        
        {/* Spinning Ring */}
        <motion.div
          className="absolute inset-0 border-4 border-green-400 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ 
            repeat: Infinity,
            duration: 1,
            ease: "linear"
          }}
        />
        
        {/* Center Icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              repeat: Infinity,
              duration: 2,
              ease: "easeInOut"
            }}
          >
            <Leaf className="w-10 h-10 text-green-400" />
          </motion.div>
        </div>
      </motion.div>
      
      {/* Loading Text */}
      <motion.div
        className="mt-6 text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ 
          repeat: Infinity,
          duration: 2,
          ease: "easeInOut"
        }}
      >
        <p className="text-white text-xl font-semibold flex items-center justify-center gap-2">
          Analyzing emissions
        </p>
        <p className="text-gray-300 text-sm mt-2">
          Processing your vehicle data
        </p>

        {/* Progress Dots 
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-green-400 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                repeat: Infinity,
                duration: 1.5,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
        */}
      </motion.div>
    </div>
    
  );
};

export default Spinner;