// ===== BackgroundParticles.jsx (Required Modification) =====

import React, { memo } from "react"; // <-- IMPORT 'memo'
import { motion } from "framer-motion"; 

// Define the core color palette
const COLORS = [
  '#10B981', 
  '#06B6D4', 
  '#14B8A6', 
  '#84CC16', 
];

const AnimatedParticles = () => { // <-- Rename to fit the memo wrapper
  
  // Constants for defining the particle start position and travel path
  const START_OFFSET_VH = -50; 
  const TRAVEL_VH = 150; 
  const CO2_BASE_COLOR = "#FFF"; 
  const CO2_GLOW_COLOR = "#00F9FF"; 

  return (
    <>
      {/* Particle rendering logic */}
      {[...Array(35)].map((_, i) => {
        // ... (particle logic remains the same) ...
        const size = Math.random() * 8 + 4;
        const startX = Math.random() * 100;
        const driftAmount = Math.random() * 20 - 10;
        const duration = Math.random() * 15 + 12;
        const delay = Math.random() * 8;
        const baseColor = COLORS[i % COLORS.length];
        const particleColor = baseColor + `${Math.floor((Math.random() * 0.4 + 0.3) * 255).toString(16).padStart(2, '0')}`;
        
        return (
          <motion.div
            key={`particle-${i}`} 
            className="absolute rounded-full" 
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              top: `${START_OFFSET_VH}vh`,  
              background: baseColor, 
              boxShadow: `0 0 ${size * 2}px ${particleColor}`,
              opacity: 0, 
            }}
            animate={{ 
              y: [0, TRAVEL_VH * (Math.random() * 0.2 + 1)], 
              x: [0, driftAmount, 0],
              rotate: [0, 0], 
              opacity: [0, 0.6, 0.6, 0], 
              scale: [0.8, 1.2, 1, 0.8] 
            }}
            transition={{ 
              duration: duration,        
              repeat: Infinity,          
              ease: "linear",            
              delay: delay,              
              times: [0, 0.1, 0.85, 1]   
            }}
          />
        );
      })}

      {/* CO2 Icon rendering logic */}
      {[...Array(12)].map((_, i) => {
        const size = Math.random() * 10 + 12;
        
        return (
          <motion.div
            key={`co2-icon-${i}`}
            className="absolute flex items-center justify-center font-bold text-xs"
            style={{
              width: size,
              height: size,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.3, 0.5],
              rotate: [0, 0, 0], 
            }}
            transition={{
              duration: Math.random() * 4 + 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          >
            <span 
              style={{ 
                color: CO2_BASE_COLOR, 
                fontSize: size * 0.65, 
                filter: `drop-shadow(0 0 4px ${CO2_GLOW_COLOR})`, 
                lineHeight: 1, 
              }}
            >
              CO₂
            </span>
          </motion.div>
        );
      })}
    </>
  );
};

// <--- THIS IS THE CRITICAL CHANGE!
export default memo(AnimatedParticles); // <-- EXPORT THE MEMOIZED COMPONENT