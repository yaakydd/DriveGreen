import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";

/**
 * Vehicle component (Luxury Cruiser)
 * - Features a dramatic, high-altitude entrance and a full-screen, elegant S-curve path.
 * - Slower, 60-second duration for a majestic cruise.
 * - Includes a sophisticated, neon-accented SVG and realistic, spinning wheels.
 */
const NeonCar = () => {
  // --- Constants for Design and Puffs ---
  const ACCENT_TEAL = "#00CED1"; // Sophisticated Deep Teal/Cyan for neon glow
  const BODY_COLOR = "#0A0D15";   // Near-black for main body
  const CHROME_COLOR = "#E0E0E0"; // Light gray/silver for grille/accents
  
  const SMOKE_COLOR = "rgba(100, 100, 100, 0.7)"; 
  const CAR_WIDTH = 260; 
  const DURATION = 60; // Majestic 60-second cruise

  const [puffs, setPuffs] = useState([]);

  // --- Animation Path Definition (Dramatic Entrance & Elegant S-Curve) ---
  const drivePathVariants = useMemo(() => ({
    animate: {
      // X-coordinates: Define the journey across the screen
      x: [
        "-20vw",  // 0. Start (High off-screen left)
        "30vw",   // 1. **Noticeable Entrance Point** (Mid-screen top)
        "10vw",   // 2. Dip down towards the left edge
        "50vw",   // 3. Center Sweep (Horizontal mid-point)
        "80vw",   // 4. Rise up center-right
        "120vw",  // 5. Descend towards exit
        "150vw",  // 6. Exit Right (Fully off-screen right)
        "-20vw"   // 7. Loop back to start (instantaneous reset)
      ],
      // Y-coordinates: Defines the vertical path (Expanded Vh values for full screen usage)
      y: [
        "-60vh",  // 0. Start (High off-screen top)
        "-15vh",  // 1. Descent to high cruising altitude
        "20vh",   // 2. Deepest dip (Low screen altitude)
        "0vh",    // 3. Level out at vertical center
        "-25vh",  // 4. Highest rise (High screen altitude)
        "10vh",   // 5. Descent towards the exit
        "20vh",   // 6. Exit at low altitude
        "-60vh"   // 7. Loop back Y reset
      ],
      // Rotational keyframes: Small rotations to follow the curves naturally
      rotate: [
        -5,      // Starting tilt down
        10,      // Tilt right while leveling out
        -15,     // Sharp tilt left at the bottom of the dip
        5,       // Leveling off
        -10,     // Tilt left for the high rise
        10,      // Tilt right on descent
        0,       // Exit straight
        -5       // Loop reset
      ],
      transition: {
        duration: DURATION,
        ease: "linear", // Using linear for fine control via 'times'
        // Define when each keyframe point occurs (smoother transitions between points)
        times: [0, 0.10, 0.30, 0.50, 0.70, 0.90, 0.999, 1], 
        repeat: Infinity,
      }
    }
  }), []);

  // Wheel Spin Animation
  const wheelSpinVariants = {
    animate: {
      rotate: 360,
      transition: {
        duration: 1, // Full rotation every second
        ease: "linear",
        repeat: Infinity,
      }
    }
  };


  // --- Puff Emission Logic ---
  const emitPuff = useCallback(() => {
    const newId = Date.now();
    const offset = Math.random() > 0.5 ? 1 : 2;

    setPuffs(prevPuffs => [...prevPuffs, { id: newId, offset, randomRotation: Math.random() * 10 - 5 }]);

    setTimeout(() => {
      setPuffs(prevPuffs => prevPuffs.filter(puff => puff.id !== newId));
    }, 4500); 

  }, []);

  // Continuous Smoke Effect
  useEffect(() => {
    const intervalId = setInterval(emitPuff, 500); 
    return () => clearInterval(intervalId);
  }, [emitPuff]);


  // 2. Individual Puff Animation (Realistic Smoke)
  const puffVariants = {
    initial: { opacity: 0.8, scale: 0.1, x: 0, y: 0 },
    animate: {
      opacity: [0.8, 0.5, 0], 
      scale: [0.1, 1.5, 3.0], 
      x: [0, -40],           
      y: [0, -30],            
      transition: {
        duration: 4.0, 
        ease: "easeOut",
      }
    }
  };


  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* Driving Container (Car and Puffs move together) */}
      <motion.div
        className="absolute w-[260px] h-[120px] top-1/2 left-0 transform -translate-y-1/2" 
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }} 
        variants={drivePathVariants}
        initial={{ x: "-20vw", y: "-60vh", rotate: -5 }}
        animate="animate"
      >
        {/* === INDIVIDUAL SMOKE PUFFS (Emission) === */}
        {puffs.map(puff => (
          <motion.div
            key={puff.id}
            variants={puffVariants}
            initial="initial"
            animate="animate"
            className={`absolute top-[88px] w-8 h-8 flex items-center justify-center rounded-full`}
            style={{
              left: puff.offset === 1 ? '5px' : '30px', 
              background: `radial-gradient(circle at center, ${SMOKE_COLOR} 0%, transparent 70%)`,
              filter: 'blur(3px)',
              transform: `rotate(${puff.randomRotation}deg)`,
            }}
          >
            <span
              className="text-[8px] font-mono font-black whitespace-nowrap"
              style={{ color: "#000", filter: 'none', opacity: 1 }}
            >
              CO₂
            </span>
          </motion.div>
        ))}

        {/* === NEON ROLLS ROYCE STYLE SVG === */}
        <svg
          width={CAR_WIDTH}
          height="120"
          viewBox="0 0 350 100" 
          preserveAspectRatio="xMinYMin meet"
          className="drop-shadow-2xl absolute"
          style={{ transform: 'scale(0.75) translate(0, 0)' }}
        >
          <defs>
            {/* Neon Glow Filter - Teal */}
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            {/* Main Body Gradient */}
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1E293B" />
              <stop offset="100%" stopColor={BODY_COLOR} />
            </linearGradient>
          </defs>

          <g filter="url(#luxuryNeon)">

            {/* Main Body - Boxy, classic silhouette */}
            <rect x="50" y="55" width="280" height="25" rx="5" fill="url(#bodyGradientLuxury)" stroke={ACCENT_TEAL} strokeWidth="1.5"/>

            {/* Cabin/Canopy - Distinctly separate from the hood */}
            <rect x="100" y="40" width="150" height="15" rx="3" fill="#000" stroke={ACCENT_TEAL} strokeWidth="0.5" opacity="0.8"/>

            {/* Imposing Grille - Vertical and Chrome-like */}
            <rect x="330" y="50" width="8" height="35" rx="2" fill={CHROME_COLOR} stroke={ACCENT_TEAL} strokeWidth="1"/>

            {/* Wheels - Grouped for spinning animation */}
            <g>
              {/* Front Wheel */}
              <motion.circle 
                cx="80" 
                cy="80" 
                r="12" 
                fill={BODY_COLOR} 
                stroke={CHROME_COLOR} 
                strokeWidth="2"
                variants={wheelSpinVariants}
                animate="animate"
                style={{ transformOrigin: '80px 80px' }}
              />
              {/* Rear Wheel */}
              <motion.circle 
                cx="280" 
                cy="80" 
                r="12" 
                fill={BODY_COLOR} 
                stroke={CHROME_COLOR} 
                strokeWidth="2"
                variants={wheelSpinVariants}
                animate="animate"
                style={{ transformOrigin: '280px 80px' }}
              />
            </g>


            {/* Headlights - Rectangular and Bright */}
            <rect x="335" y="60" width="5" height="10" rx="1" fill="#FFF" style={{ filter: "drop-shadow(0 0 8px #FFF)" }}/>

            {/* Neon Underglow Line */}
            <path
              d="M 50 85 L 330 85"
              fill="none"
              stroke={ACCENT_TEAL}
              strokeWidth="2.5"
              opacity="0.8"
            />

            {/* Twin Exhaust Ports */}
            <rect x="15" y="75" width="10" height="5" rx="1.5" fill={BODY_COLOR} stroke={ACCENT_TEAL} strokeWidth="1"/>
            <rect x="40" y="75" width="10" height="5" rx="1.5" fill={BODY_COLOR} stroke={ACCENT_TEAL} strokeWidth="1"/>

          </g>
        </svg>
      </motion.div>

      {/* ambient particles */}
      {[...Array(18)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 6 + 2,
            height: Math.random() * 6 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `rgba(0, 206, 209, ${Math.random() * 0.26 + 0.06})` // Using the new Teal color
          }}
          animate={{ y: [0, -100, 0], opacity: [0.1, 0.45, 0.1], scale: [1, 1.3, 1] }}
          transition={{ duration: 5 + Math.random() * 5, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 3 }}
        />
      ))}
    </div>
  );
}

export default NeonCar;