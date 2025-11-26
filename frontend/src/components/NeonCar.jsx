
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Fuel, Car, Sparkles, Zap, Wind, TrendingUp, Activity } from "lucide-react";

// ===== NEON CAR COMPONENT WITH UNDULATING MOTION =====
const NeonCar = () => {
  // Color constants for consistent theming throughout the car design
  const NEON_BLUE = "#00F9FF";        // Primary neon accent color
  const BODY_COLOR = "#0A0D15";       // Dark body color for contrast
  const CHROME_COLOR = "#E0E0E0";     // Metallic accent color
  const SMOKE_COLOR = "rgba(140, 140, 140, 0.9)"; // Semi-transparent smoke
  
  // Dimensional constants for car size and animation timing
  const CAR_WIDTH = 400;              // Width of the car SVG container
  const DURATION = 35;                // Total animation duration in seconds
  const PUFF_SIZE = 64;               // Size of smoke puff (64px = 4rem)

  // State to manage actively displayed smoke puffs
  const [puffs, setPuffs] = useState([]);

  // ===== UNDULATING MOTION PATH =====
  // useMemo caches the animation to prevent unnecessary recalculations
  const drivePathVariants = useMemo(() => ({
    animate: {
      // Horizontal movement: Smooth travel from left to right with seamless loop
      x: ["-150vw", "-80vw", "-20vw", "40vw", "100vw", "150vw", "-150vw"],
      
      // Vertical movement: Creates wave-like undulating motion (up and down)
      y: ["-50vh", "-30vh", "-10vh", "5vh", "-15vh", "-40vh", "-50vh"],
      
      // Rotation: Tilts the car to follow the curves naturally
      rotate: [-8, -3, 2, -1, -5, -10, -8],
      
      transition: {
        // X-axis: Linear motion for constant horizontal speed
        x: { 
          duration: DURATION, 
          ease: "linear",
          times: [0, 0.15, 0.30, 0.50, 0.75, 0.995, 1], 
          repeat: Infinity 
        },
        // Y-axis: Smooth easing for natural wave motion
        y: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.15, 0.30, 0.50, 0.75, 0.995, 1], 
          repeat: Infinity 
        },
        // Rotation: Matches the Y-axis timing for coordinated tilting
        rotate: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.15, 0.30, 0.50, 0.75, 0.995, 1], 
          repeat: Infinity 
        },
      }
    }
  }), [DURATION]);

  // ===== WHEEL SPINNING ANIMATION =====
  // Creates continuous rotation for realistic wheel movement
  const wheelSpinVariants = {
    animate: {
      rotate: 360,  // Full 360-degree rotation
      transition: { 
        duration: 0.5,          // Fast spin speed
        ease: "linear",         // Constant rotation speed
        repeat: Infinity        // Never stops spinning
      }
    }
  };

  // ===== SMOKE PUFF EMISSION LOGIC =====
  // useCallback prevents function recreation on every render
  const emitPuff = useCallback(() => {
    // Generate unique ID using timestamp and random number
    const newId = Date.now() + Math.random();
    
    // Randomly select which exhaust pipe (1 = left, 2 = right)
    const offset = Math.random() > 0.5 ? 1 : 2;
    
    // Add slight random rotation for natural smoke variation
    const randomRotation = Math.random() * 20 - 10; // Range: -10 to +10 degrees

    // Add new puff to the state array
    setPuffs(prevPuffs => [...prevPuffs, { id: newId, offset, randomRotation }]);

    // Auto-remove puff after animation completes (4.5s)
    setTimeout(() => {
      setPuffs(prevPuffs => prevPuffs.filter(puff => puff.id !== newId));
    }, 4500);
  }, []);

  // ===== CONTINUOUS PUFF EMISSION =====
  // useEffect sets up interval for regular smoke emission
  useEffect(() => {
    // Emit a new puff every 450ms for realistic exhaust
    const intervalId = setInterval(emitPuff, 450);
    
    // Cleanup: Clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, [emitPuff]);

  // ===== SMOKE ANIMATION DEFINITION =====
  // Defines how each puff expands, fades, and drifts
  const puffVariants = {
    initial: { 
      opacity: 0.95,    // Start nearly opaque
      scale: 0.3,       // Start small
      x: 0,             // No horizontal offset initially
      y: 0              // No vertical offset initially
    },
    animate: {
      // Fade out gradually
      opacity: [0.95, 0.7, 0.3, 0.0],
      
      // Expand significantly as smoke disperses
      scale: [0.3, 1.5, 3.0, 5.0],
      
      // Drift backward relative to car motion
      x: [0, -40, -70, -100],
      
      // Rise upward as hot smoke naturally does
      y: [0, -30, -55, -80],
      
      transition: { 
        duration: 4.0,    // 4-second animation
        ease: "easeOut"   // Slow deceleration
      }
    }
  };

  // ===== CALCULATE PRECISE SMOKE POSITIONS =====
  // Position calculations to center 64px puffs over 12px exhaust rectangles
  
  // Y-position: Pipe center (76) minus half puff size (32) = 44px
  const PUFF_TOP_OFFSET = '44px';
  
  // Left pipe: SVG x-coord (40) minus half puff size (32) = 8px
  const PUFF_LEFT_OUTER = '8px';
  
  // Right pipe: SVG x-coord (60) minus half puff size (32) = 28px
  const PUFF_LEFT_INNER = '28px';

  return (
    // Main container: Full screen, clips overflow, non-interactive
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* Animated car container with undulating motion */}
      <motion.div
        className="absolute w-[400px] h-[150px] top-1/2 left-0 transform -translate-y-1/2"
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }}  // Center the car horizontally
        variants={drivePathVariants}                     // Apply motion variants
        initial={{ x: "-150vw", y: "-50vh", rotate: -8 }} // Starting position
        animate="animate"                                // Trigger animation
      >
        {/* ===== EXHAUST SMOKE PUFFS ===== */}
        {/* Map through puffs array to render each smoke cloud */}
        {puffs.map(puff => (
          <motion.div
            key={puff.id}                    // Unique key for React reconciliation
            variants={puffVariants}          // Apply smoke animation
            initial="initial"                // Start from initial state
            animate="animate"                // Animate to final state
            className="absolute w-16 h-16 flex items-center justify-center rounded-full"
            style={{
              // Position based on which exhaust pipe emitted this puff
              left: puff.offset === 1 ? PUFF_LEFT_OUTER : PUFF_LEFT_INNER,
              top: PUFF_TOP_OFFSET,
              
              // Radial gradient for realistic smoke appearance
              background: `radial-gradient(circle at center, ${SMOKE_COLOR} 0%, transparent 70%)`,
              
              // Blur for soft cloud effect
              filter: 'blur(5px)',
              
              // Apply random rotation for variety
              transform: `rotate(${puff.randomRotation}deg)`,
            }}
          >
            {/* CO₂ text label inside smoke */}
            <span
              className="text-base font-black text-white whitespace-nowrap"
              style={{ 
                filter: 'none',  // Override parent blur
                opacity: 1,
                // Strong shadow for visibility against smoke
                textShadow: '0 0 10px rgba(0,0,0,1), 0 0 6px #FFFFFF, 0 0 3px #000000' 
              }}
            >
              CO₂
            </span>
          </motion.div>
        ))}

        {/* ===== CAR SVG GRAPHIC ===== */}
        <svg width={CAR_WIDTH} height="150" viewBox="0 0 350 100" className="drop-shadow-2xl absolute">
          <defs>
            {/* Neon glow filter for futuristic effect */}
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Gradient for car body depth */}
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004C4C" />
              <stop offset="100%" stopColor={BODY_COLOR} />
            </linearGradient>
          </defs>

          {/* Group with neon filter applied */}
          <g filter="url(#luxuryNeon)">
            {/* Main car body trapezoid */}
            <path d="M 30 75 L 80 55 H 280 L 330 75 Z" 
              fill="url(#bodyGradientLuxury)" 
              stroke={NEON_BLUE} 
              strokeWidth="2.5" />
            
            {/* Windshield/cabin window */}
            <rect x="100" y="40" width="150" height="15" rx="3" 
              fill="#000" 
              stroke={NEON_BLUE} 
              strokeWidth="1" 
              opacity="0.8"/>
            
            {/* Rear spoiler detail */}
            <rect x="330" y="50" width="8" height="30" rx="2" 
              fill={CHROME_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1"/>
            
            {/* ===== WHEELS ===== */}
            <g>
              {/* Front wheel with continuous spin */}
              <motion.circle cx="80" cy="80" r="15" 
                fill={BODY_COLOR} 
                stroke={CHROME_COLOR} 
                strokeWidth="2.5"
                variants={wheelSpinVariants} 
                animate="animate" 
                style={{ transformOrigin: '80px 80px' }}/>
              
              {/* Rear wheel with continuous spin */}
              <motion.circle cx="280" cy="80" r="15" 
                fill={BODY_COLOR} 
                stroke={CHROME_COLOR} 
                strokeWidth="2.5"
                variants={wheelSpinVariants} 
                animate="animate" 
                style={{ transformOrigin: '280px 80px' }}/>
            </g>

            {/* Bright headlight */}
            <rect x="335" y="60" width="5" height="10" rx="1" 
              fill="#FFF" 
              style={{ filter: "drop-shadow(0 0 10px #FFF)" }}/>
            
            {/* Bottom chassis neon strip */}
            <path d="M 30 80 L 330 80" 
              fill="none" 
              stroke={NEON_BLUE} 
              strokeWidth="3" 
              opacity="0.8"/>
            
            {/* ===== EXHAUST PIPES (POSITIONED BETWEEN BODY AND BOTTOM LINE) ===== */}
            {/* Left exhaust pipe - positioned at x=40, y=73 (between body at y=75 and line at y=80) */}
            <rect x="40" y="73" width="12" height="7" rx="2" 
              fill={BODY_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1.5"/>
            
            {/* Right exhaust pipe - positioned at x=60, y=73 */}
            <rect x="60" y="73" width="12" height="7" rx="2" 
              fill={BODY_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1.5"/>
          </g>
        </svg>
      </motion.div>

      {/* ===== ENHANCED BACKGROUND PARTICLES ===== */}
      {/* Create 40 floating particles with varied animations */}
      {[...Array(40)].map((_, i) => {
        // Calculate random properties for each particle
        const size = Math.random() * 10 + 4;           // Size: 4-14px
        const startX = Math.random() * 100;            // Random horizontal position
        const startY = Math.random() * 100;            // Random vertical position
        const floatDistance = Math.random() * 150 + 80; // How far it floats: 80-230px
        const drift = Math.random() * 60 - 30;         // Horizontal drift: -30 to +30px
        const duration = Math.random() * 8 + 6;        // Animation duration: 6-14s
        const delay = Math.random() * 5;               // Stagger start: 0-5s
        
        // Assign color based on index (cycle through 4 eco-themed colors)
        let particleColor;
        if (i % 4 === 0) {
          particleColor = `rgba(16, 185, 129, ${Math.random() * 0.5 + 0.3})`; // Emerald
        } else if (i % 4 === 1) {
          particleColor = `rgba(6, 182, 212, ${Math.random() * 0.5 + 0.3})`;  // Cyan
        } else if (i % 4 === 2) {
          particleColor = `rgba(132, 204, 22, ${Math.random() * 0.5 + 0.3})`; // Lime
        } else {
          particleColor = `rgba(20, 184, 166, ${Math.random() * 0.5 + 0.3})`; // Teal
        }
        
        return (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size,
              left: `${startX}%`,
              top: `${startY}%`,
              background: particleColor,
              // Add soft glow to particles
              boxShadow: `0 0 ${size * 2}px ${particleColor}`,
            }}
            animate={{ 
              // Vertical float
              y: [0, -floatDistance, 0],
              
              // Horizontal drift for organic movement
              x: [0, drift, -drift, 0],
              
              // Pulse opacity
              opacity: [0.3, 0.8, 0.3],
              
              // Subtle scale pulse
              scale: [1, 1.4, 1] 
            }}
            transition={{ 
              duration: duration,
              repeat: Infinity,
              ease: "easeInOut",
              delay: delay
            }}
          />
        );
      })}

      {/* ===== FLOATING SPARKLE EFFECTS ===== */}
      {/* Add 15 sparkle particles for extra visual interest */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            // Twinkle effect
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.2, 0.5],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 3 + 2,  // 2-5 seconds
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 4,
          }}
        >
          {/* Star-shaped sparkle */}
          <Sparkles 
            className="text-emerald-400" 
            size={Math.random() * 12 + 6}  // Size: 6-18px
            style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.8))' }}
          />
        </motion.div>
      ))}
    </div>
  );
};
export default NeonCar;