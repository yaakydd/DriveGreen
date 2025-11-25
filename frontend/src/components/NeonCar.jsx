import React, { useState, useEffect, useCallback, useMemo } from "react";
// Imports core React hooks for state, effects, memoization, and callback optimization.
import { motion, AnimatePresence } from "framer-motion";
// Imports Framer Motion components for handling complex animations.
import { Leaf, Gauge, Settings, Fuel, Car, Sparkles, Zap, Wind } from "lucide-react";
// Imports Lucide icons (used mainly for visual context, not directly rendered in the car).

// ===== NEON CAR COMPONENT (REAR EXHAUST & SEAMLESS LOOP) =====
const NeonCar = () => {
  // Define constant color variables for easy adjustment of the theme.
  const NEON_BLUE = "#00F9FF";
  const BODY_COLOR = "#0A0D15";
  const CHROME_COLOR = "#E0E0E0";
  const SMOKE_COLOR = "rgba(120, 120, 120, 0.85)";
  
  // Define constant dimension variables.
  const CAR_WIDTH = 400;
  const DURATION = 30; // Time in seconds for one full horizontal travel (seamless loop).
  const PUFF_SIZE = 64; // Size of the smoke puff container (w-16 = 4rem = 64px).

  // State to hold the list of currently visible smoke puffs.
  const [puffs, setPuffs] = useState([]);

  // --- 1. SEAMLESS LOOP FIX ---
  // useMemo caches the animation variants, recalculating only if DURATION changes.
  const drivePathVariants = useMemo(() => ({
    animate: {
      // X animation: Defines the car's horizontal movement for a seamless loop.
      // Starts far off-screen left (-150vw), moves across to far off-screen right (150vw),
      // then instantly jumps back to the start state (-150vw) at the end.
      x: ["-150vw", "150vw", "-150vw"], 
      // Y animation: Defines vertical movement, previously complex, now simplified.
      y: ["-60vh", "20vh", "-60vh"], // Original oscillating Y path.
      // Rotation animation: Defines the car's tilt.
      rotate: [-5, 5, -5],
      transition: {
        // Horizontal transition: Uses linear ease for constant speed, and the times [0, 0.999, 1]
        // ensure the jump back happens in the last tiny fraction of a second, hiding the reset.
        x: { duration: DURATION, ease: "linear", times: [0, 0.999, 1], repeat: Infinity },
        // Y transition: Runs for the full duration.
        y: { duration: DURATION, ease: "easeInOut", times: [0, 0.999, 1], repeat: Infinity },
        // Rotation transition: Runs for the full duration.
        rotate: { duration: DURATION, ease: "easeInOut", times: [0, 0.999, 1], repeat: Infinity },
      }
    }
  }), [DURATION]); // Dependency array: Recalculates if DURATION changes.

  // Framer Motion variants for spinning the car's wheels.
  const wheelSpinVariants = {
    animate: {
      rotate: 360, // Rotates 360 degrees.
      transition: { duration: 0.5, ease: "linear", repeat: Infinity } // Repeats continuously at a constant speed.
    }
  };

  // useCallback memoizes the function responsible for creating a smoke puff.
  const emitPuff = useCallback(() => {
    const newId = Date.now() + Math.random(); // Unique ID for the puff.
    // Randomly chooses which of the two exhaust pipes (offset 1 or 2) the puff comes from.
    const offset = Math.random() > 0.5 ? 1 : 2; 
    // Adds a slight random rotation for visual variety.
    const randomRotation = Math.random() * 15 - 7;

    // Adds the new puff object to the state array.
    setPuffs(prevPuffs => [...prevPuffs, { id: newId, offset, randomRotation }]);

    // Sets a timeout to remove the puff after 4.5 seconds (its animation duration is 4.0s).
    setTimeout(() => {
      setPuffs(prevPuffs => prevPuffs.filter(puff => puff.id !== newId));
    }, 4500);
  }, []); // Dependency array is empty, ensuring the function reference remains constant.

  // useEffect hook to set up the smoke puff emission interval.
  useEffect(() => {
    // Sets an interval to call emitPuff every 500 milliseconds.
    const intervalId = setInterval(emitPuff, 500);
    // Cleanup function: Clears the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [emitPuff]); // Dependency array: Recalculates if emitPuff changes (it's memoized, so it won't).

  // Framer Motion variants defining the puff's animation (expansion, fading, and drift).
  const puffVariants = {
    initial: { opacity: 0.9, scale: 0.2, x: 0, y: 0 }, // Starting state (small, slightly visible).
    animate: {
      opacity: [0.9, 0.7, 0.0], // Fades out.
      scale: [0.2, 2.0, 4.5], // Grows significantly.
      // Smoke drifts back (negative X) and up (negative Y) relative to the car.
      x: [0, -50], 
      y: [0, -60], 
      transition: { duration: 4.0, ease: "easeOut" } // Slow transition speed.
    }
  };

  // --- CALCULATE SMOKE POSITION FOR LEFT END OF THE BODY ---
  // These constants calculate the exact CSS position needed to center the 64px smoke puff
  // over the small SVG exhaust pipe rectangles located at x=3 and x=23 in the SVG's coordinate system (viewBox).
  
  // Y calculation: 82 (SVG pipe y-coord) - 32 (half of PUFF_SIZE) = 50.
  const PUFF_TOP_OFFSET = '50px'; 
  
  // X calculation 1 (Outer pipe): 3 (SVG x-coord) - 32 = -29.
  const PUFF_LEFT_OUTER = '-29px';

  // X calculation 2 (Inner pipe): 23 (SVG x-coord) - 32 = -9.
  const PUFF_LEFT_INNER = '-9px';
  // --------------------------------

  // Main component render function.
  return (
    // Outer div for the entire scene, hiding anything that leaves its bounds.
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* Motion div for the car assembly, responsible for the global driving animation. */}
      <motion.div
        className="absolute w-[400px] h-[150px] top-1/2 left-0 transform -translate-y-1/2"
        // Adjusts the car's starting position so the center of the car is at the animation's starting X/Y point.
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }} 
        variants={drivePathVariants}
        // Sets the starting position (off-screen left).
        initial={{ x: "-150vw", y: "-60vh", rotate: -5 }} 
        animate="animate" // Starts the primary animation loop.
      >
        {/* EXHAUST PUFFS - Dynamically rendered smoke based on 'puffs' state. */}
        {puffs.map(puff => (
          // Framer Motion div for each smoke puff.
          <motion.div
            key={puff.id}
            variants={puffVariants}
            initial="initial"
            animate="animate"
            className="absolute w-16 h-16 flex items-center justify-center rounded-full"
            style={{
              // Positions the puff based on which pipe it came from (offset 1 or 2).
              left: puff.offset === 1 ? PUFF_LEFT_OUTER : PUFF_LEFT_INNER,
              top: PUFF_TOP_OFFSET,
              // Creates the smoke look (radial gradient and blur filter).
              background: `radial-gradient(circle at center, ${SMOKE_COLOR} 0%, transparent 70%)`,
              filter: 'blur(4px)',
              // Applies the slight random rotation.
              transform: `rotate(${puff.randomRotation}deg)`,
            }}
          >
            {/* 3. VISIBLE CO₂ TEXT FIX */}
            <span
              className="text-lg font-extrabold text-white whitespace-nowrap"
              style={{ 
                filter: 'none', // Prevents the parent's blur from affecting the text.
                opacity: 1,
                // Enhanced text shadow to make CO₂ clearly visible.
                textShadow: '0 0 8px rgba(0,0,0,1.0), 0 0 5px #FFFFFF' 
              }}
            >
              CO₂ {/* The text clearly identifying the exhaust as carbon dioxide. */}
            </span>
          </motion.div>
        ))}

        {/* SVG CAR BODY: The vector graphics defining the car's appearance. */}
        <svg width={CAR_WIDTH} height="150" viewBox="0 0 350 100" className="drop-shadow-2xl absolute">
          <defs>
            {/* Filter definition for the luxury neon glow effect. */}
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Gradient definition for the main car body color. */}
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004C4C" />
              <stop offset="100%" stopColor={BODY_COLOR} />
            </linearGradient>
          </defs>

          {/* Group applying the neon filter to all car elements. */}
          <g filter="url(#luxuryNeon)">
            {/* CAR BODY (main trapezoid shape) */}
            <path d="M 30 75 L 80 55 H 280 L 330 75 Z" fill="url(#bodyGradientLuxury)" stroke={NEON_BLUE} strokeWidth="2.5" />
            {/* WINDOW (black rectangle) */}
            <rect x="100" y="40" width="150" height="15" rx="3" fill="#000" stroke={NEON_BLUE} strokeWidth="1" opacity="0.8"/>
            {/* REAR LIGHT/DETAIL (right side) */}
            <rect x="330" y="50" width="8" height="30" rx="2" fill={CHROME_COLOR} stroke={NEON_BLUE} strokeWidth="1"/>
            
            {/* WHEELS group */}
            <g>
              {/* Front wheel: Framer Motion circle applying the spin variant. */}
              <motion.circle cx="80" cy="80" r="15" fill={BODY_COLOR} stroke={CHROME_COLOR} strokeWidth="2.5"
                variants={wheelSpinVariants} animate="animate" style={{ transformOrigin: '80px 80px' }}/>
              {/* Rear wheel: Framer Motion circle applying the spin variant. */}
              <motion.circle cx="280" cy="80" r="15" fill={BODY_COLOR} stroke={CHROME_COLOR} strokeWidth="2.5"
                variants={wheelSpinVariants} animate="animate" style={{ transformOrigin: '280px 80px' }}/>
            </g>

            {/* Small light detail (top right) */}
            <rect x="335" y="60" width="5" height="10" rx="1" fill="#FFF" style={{ filter: "drop-shadow(0 0 10px #FFF)" }}/>
            {/* Bottom neon light strip */}
            <path d="M 30 85 L 330 85" fill="none" stroke={NEON_BLUE} strokeWidth="3" opacity="0.8"/>
            
            {/* 1. EXHAUST PIPES - REPOSITIONED TO THE LEFT END OF THE CAR BODY */}
            {/* Pipe 1 (Outer/Left) - Placed just outside the main body shape (x=30). */}
            <rect x="3" y="82" width="12" height="6" rx="2" fill={BODY_COLOR} stroke={NEON_BLUE} strokeWidth="1.5"/>
            {/* Pipe 2 (Inner/Right) - Placed just inside the main body shape. */}
            <rect x="23" y="82" width="12" height="6" rx="2" fill={BODY_COLOR} stroke={NEON_BLUE} strokeWidth="1.5"/>
          </g>
        </svg>
      </motion.div>

      {/* ENHANCED BACKGROUND PARTICLES (Decorative elements) */}
      {[...Array(30)].map((_, i) => ( // Creates 30 decorative background particles.
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 8 + 3,
            height: Math.random() * 8 + 3,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            // Randomly assigns one of three neon-like colors.
            background: i % 3 === 0 
              ? `rgba(16, 185, 129, ${Math.random() * 0.4 + 0.2})` 
              : i % 3 === 1
              ? `rgba(6, 182, 212, ${Math.random() * 0.4 + 0.2})`
              : `rgba(132, 204, 22, ${Math.random() * 0.4 + 0.2})`,
          }}
          // Defines a subtle floating/pulsing animation for the particles.
          animate={{ 
            y: [0, -120, 0], 
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.2, 0.6, 0.2], 
            scale: [1, 1.5, 1] 
          }}
          // Sets long, random durations and delays for a non-uniform, ambient effect.
          transition={{ 
            duration: 6 + Math.random() * 4, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: Math.random() * 3 
          }}
        />
      ))}
    </div>
  );
};

export default NeonCar; // Exports the component for use in other parts of the application.