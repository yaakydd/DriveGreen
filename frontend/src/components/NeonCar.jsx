// ===== NEON CAR COMPONENT (Separate File) =====
// File: frontend/src/components/NeonCar.jsx

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * NeonCar Component
 * 
 * A futuristic neon-styled vehicle that drives across the screen
 * emitting CO2 smoke puffs with visible text
 * 
 * Features:
 * - Neon blue/cyan (#00F9FF) glow effects
 * - Curved driving path animation
 * - Realistic exhaust emissions with CO₂ text
 * - Spinning wheels
 * - Atmospheric particles
 */
const NeonCar = () => {
  // ===== COLOR CONSTANTS =====
  const NEON_BLUE = "#00F9FF";        // Vibrant Neon Blue/Cyan
  const BODY_COLOR = "#0A0D15";       // Near-black for main body
  const CHROME_COLOR = "#E0E0E0";     // Light gray/silver for accents
  const SMOKE_COLOR = "rgba(100, 100, 100, 0.9)"; // Visible cloud-like grey
  
  // ===== ANIMATION CONSTANTS =====
  const CAR_WIDTH = 400;
  const DURATION = 60; // 60 seconds for complete path

  // ===== STATE =====
  const [puffs, setPuffs] = useState([]);

  // ===== ANIMATION PATH VARIANTS =====
  // useMemo prevents recreation on every render
  const drivePathVariants = useMemo(() => ({
    animate: {
      x: [
        "-30vw",   // Start off-screen left
        "30vw",    // Enter screen
        "10vw",    // Curve down
        "50vw",    // Middle screen
        "80vw",    // Move right
        "120vw",   // Exit right
        "150vw",   // Far off-screen
        "-30vw"    // Loop back to start
      ],
      y: [
        "-60vh",   // Top
        "-15vh",   // Come down
        "20vh",    // Below center
        "0vh",     // Center
        "-25vh",   // Go up
        "10vh",    // Come down
        "20vh",    // Lower
        "-60vh"    // Back to top
      ],
      rotate: [
        -5, 10, -15, 5, -10, 10, 0, -5
      ],
      transition: {
        duration: DURATION,
        ease: "linear",
        times: [0, 0.10, 0.30, 0.50, 0.70, 0.90, 0.999, 1],
        repeat: Infinity,
      }
    }
  }), [DURATION]);

  // ===== WHEEL SPIN ANIMATION =====
  const wheelSpinVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 0.5,
        ease: "linear",
        repeat: Infinity,
      }
    }
  };

  // ===== PUFF EMISSION LOGIC =====
  // useCallback prevents function recreation
  const emitPuff = useCallback(() => {
    const newId = Date.now() + Math.random(); // Ensure unique ID
    const offset = Math.random() > 0.5 ? 1 : 2; // Two exhaust pipes
    const randomRotation = Math.random() * 15 - 7; // -7 to +7 degrees

    // Add new puff to state
    setPuffs(prevPuffs => [
      ...prevPuffs, 
      { id: newId, offset, randomRotation }
    ]);

    // Remove puff after animation completes
    setTimeout(() => {
      setPuffs(prevPuffs => prevPuffs.filter(puff => puff.id !== newId));
    }, 4500);
  }, []);

  // ===== EMIT PUFFS CONTINUOUSLY =====
  useEffect(() => {
    const intervalId = setInterval(emitPuff, 500); // Every 500ms
    return () => clearInterval(intervalId); // Cleanup
  }, [emitPuff]);

  // ===== PUFF ANIMATION VARIANTS =====
  const puffVariants = {
    initial: { 
      opacity: 0.9, 
      scale: 0.2, 
      x: 0, 
      y: 0 
    },
    animate: {
      opacity: [0.9, 0.7, 0.0],
      scale: [0.2, 2.0, 4.5],
      x: [0, -60],
      y: [0, -40],
      transition: {
        duration: 4.0,
        ease: "easeOut",
      }
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {/* ===== ANIMATED CAR CONTAINER ===== */}
      <motion.div
        className="absolute w-[400px] h-[150px] top-1/2 left-0 transform -translate-y-1/2"
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }}
        variants={drivePathVariants}
        initial={{ x: "-30vw", y: "-60vh", rotate: -5 }}
        animate="animate"
      >
        {/* ===== EXHAUST PUFFS WITH CO2 TEXT ===== */}
        {puffs.map(puff => (
          <motion.div
            key={puff.id}
            variants={puffVariants}
            initial="initial"
            animate="animate"
            className="absolute top-[105px] w-12 h-12 flex items-center justify-center rounded-full"
            style={{
              left: puff.offset === 1 ? '10px' : '35px',
              background: `radial-gradient(circle at center, ${SMOKE_COLOR} 0%, transparent 70%)`,
              filter: 'blur(3px)',
              transform: `rotate(${puff.randomRotation}deg)`,
            }}
          >
            {/* CO₂ Text - Highly visible */}
            <span
              className="text-xs font-black text-gray-900 whitespace-nowrap"
              style={{ 
                filter: 'none', 
                opacity: 1,
                textShadow: '0 0 2px white' 
              }}
            >
              CO₂
            </span>
          </motion.div>
        ))}

        {/* ===== SVG CAR ===== */}
        <svg
          width={CAR_WIDTH}
          height="150"
          viewBox="0 0 350 100"
          preserveAspectRatio="xMinYMin meet"
          className="drop-shadow-2xl absolute"
          style={{ transform: 'scale(1.0) translate(0, 0)' }}
        >
          {/* ===== FILTERS AND GRADIENTS ===== */}
          <defs>
            {/* Neon glow filter */}
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Body gradient (dark teal to black) */}
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004C4C" />
              <stop offset="100%" stopColor={BODY_COLOR} />
            </linearGradient>
          </defs>

          {/* ===== CAR BODY WITH NEON GLOW ===== */}
          <g filter="url(#luxuryNeon)">
            {/* Main Body Shape */}
            <path 
              d="M 30 75 L 80 55 H 280 L 330 75 Z" 
              fill="url(#bodyGradientLuxury)" 
              stroke={NEON_BLUE} 
              strokeWidth="2.5" 
            />
            
            {/* Cabin/Windshield */}
            <rect 
              x="100" 
              y="40" 
              width="150" 
              height="15" 
              rx="3" 
              fill="#000" 
              stroke={NEON_BLUE} 
              strokeWidth="1" 
              opacity="0.8"
            />
            
            {/* Rear Spoiler/Light bar */}
            <rect 
              x="330" 
              y="50" 
              width="8" 
              height="30" 
              rx="2" 
              fill={CHROME_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1"
            />
            
            {/* ===== WHEELS ===== */}
            <g>
              {/* Front wheel */}
              <motion.circle
                cx="80"
                cy="80"
                r="15"
                fill={BODY_COLOR}
                stroke={CHROME_COLOR}
                strokeWidth="2.5"
                variants={wheelSpinVariants}
                animate="animate"
                style={{ transformOrigin: '80px 80px' }}
              />
              
              {/* Rear wheel */}
              <motion.circle
                cx="280"
                cy="80"
                r="15"
                fill={BODY_COLOR}
                stroke={CHROME_COLOR}
                strokeWidth="2.5"
                variants={wheelSpinVariants}
                animate="animate"
                style={{ transformOrigin: '280px 80px' }}
              />
            </g>

            {/* Headlights (White Neon) */}
            <rect 
              x="335" 
              y="60" 
              width="5" 
              height="10" 
              rx="1" 
              fill="#FFF" 
              style={{ filter: "drop-shadow(0 0 10px #FFF)" }}
            />
            
            {/* Bottom ground line */}
            <path 
              d="M 30 85 L 330 85" 
              fill="none" 
              stroke={NEON_BLUE} 
              strokeWidth="3" 
              opacity="0.8"
            />
            
            {/* Dual Exhaust Pipes */}
            <rect 
              x="25" 
              y="75" 
              width="10" 
              height="8" 
              rx="2" 
              fill={BODY_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1.5"
            />
            <rect 
              x="40" 
              y="75" 
              width="10" 
              height="8" 
              rx="2" 
              fill={BODY_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </motion.div>

      {/* ===== BACKGROUND PARTICLES (Cyan/Teal) ===== */}
      {[...Array(25)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(0, 255, 255, ${Math.random() * 0.3 + 0.1})` // Cyan/Teal
          }}
          animate={{ 
            y: [0, -100, 0], 
            opacity: [0.1, 0.45, 0.1], 
            scale: [1, 1.3, 1] 
          }}
          transition={{ 
            duration: 5 + Math.random() * 5, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: Math.random() * 3 
          }}
        />
      ))}
    </div>
  );
};

export default NeonCar;