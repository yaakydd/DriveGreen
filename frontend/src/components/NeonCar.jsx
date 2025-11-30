// ===== NEON CAR COMPONENT WITH SEAMLESS LOOP =====
// This component renders an animated neon car with:
// - Continuous horizontal movement (looped path)
// - Vertical wave motion
// - Wheel spinning animation
// - Smoke puffs emitted from exhaust pipes
// - SVG graphic styled with neon glow effects

import React from "react";
import { motion } from "framer-motion";

const NeonCar = () => {
  // Define color constants for consistent styling
  const NEON_BLUE = "#00F9FF";              // Primary neon accent
  const BODY_COLOR = "#0A0D15";             // Dark car body
  const CHROME_COLOR = "#E0E0E0";           // Metallic accents
  const SMOKE_COLOR = "rgba(140, 140, 140, 0.9)"; // Exhaust smoke
  
  // Animation and sizing constants
  const CAR_WIDTH = 400;                    // Width of SVG container
  const DURATION = 35;                      // Total animation duration (seconds)
  const PUFF_SIZE = 64;                     // Smoke puff size (64px)

  // State: Tracks all active smoke puffs currently being animated
  const [puffs, setPuffs] = React.useState([]);

  // ===== SEAMLESS HORIZONTAL LOOP WITH VERTICAL WAVE =====
  // useMemo: Prevents recalculating the animation sequence on every render
  const drivePathVariants = React.useMemo(() => ({
    animate: {
      // Horizontal movement: Travels across full viewport width
      // FIX 1: Start closer to the screen edge (-50vw instead of -150vw)
      x: ["-50vw", "-80vw", "-20vw", "40vw", "100vw", "150vw"],
      
      // Vertical wave motion
      y: ["-50vh", "-30vh", "-10vh", "5vh", "-15vh", "-40vh"],
      
      // Car tilt based on motion curve
      rotate: [-8, -3, 2, -1, -5, -10],
      
      transition: {
        // Smooth continuous horizontal travel
        x: { 
          duration: DURATION, 
          ease: "linear",
          times: [0, 0.15, 0.30, 0.50, 0.75, 1], 
          repeat: Infinity,
          repeatType: "loop"
        },
        // Vertical oscillation
        y: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.15, 0.30, 0.50, 0.75, 1], 
          repeat: Infinity,
          repeatType: "loop"
        },
        // Rotation synchronized with wave
        rotate: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.15, 0.30, 0.50, 0.75, 1], 
          repeat: Infinity,
          repeatType: "loop"
        },
      }
    }
  }), [DURATION]);

  // ===== WHEEL SPINNING ANIMATION =====
  const wheelSpinVariants = {
    animate: {
      rotate: 360,                     // Full rotation
      transition: { 
        duration: 0.5,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // ===== FUNCTION: Emit a smoke puff =====
  // useCallback ensures stable reference for interval
  const emitPuff = React.useCallback(() => {
    const newId = Date.now() + Math.random();     // Unique ID per puff
    const offset = Math.random() > 0.5 ? 1 : 2;   // Random exhaust pipe
    const randomRotation = Math.random() * 20 - 10; // -10° to +10°

    setPuffs(prev => [...prev, { id: newId, offset, randomRotation }]);

    // Remove puff after animation ends (4.5 sec)
    setTimeout(() => {
      setPuffs(prev => prev.filter(p => p.id !== newId));
    }, 4500);
  }, []);

  // ===== AUTO-EMISSION INTERVAL =====
  React.useEffect(() => {
    const interval = setInterval(emitPuff, 450); // New puff every 450ms
    return () => clearInterval(interval);        // Cleanup on unmount
  }, [emitPuff]);

  // ===== SMOKE ANIMATION =====
  const puffVariants = {
    initial: { opacity: 0.95, scale: 0.3, x: 0, y: 0 },
    animate: {
      opacity: [0.95, 0.7, 0.3, 0.0],   // Fade out
      scale: [0.3, 1.5, 3.0, 5.0],      // Expand outward
      x: [0, -40, -70, -100],           // Drift backward
      y: [0, -30, -55, -80],            // Rise upward
      transition: { duration: 4.0, ease: "easeOut" }
    }
  };

  // Precise alignment of smoke with exhaust
  const PUFF_TOP_OFFSET = '44px';
  const PUFF_LEFT_OUTER = '8px';
  const PUFF_LEFT_INNER = '28px';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">

      {/* Animated neon car wrapper */}
      <motion.div
        className="absolute w-[400px] h-[150px] top-1/2 left-0 transform -translate-y-1/2"
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }}  // Center horizontally
        variants={drivePathVariants}
        // FIX 2: Set initial position to match the new start of the animation path
        initial={{ x: "-50vw", y: "-50vh", rotate: -8 }}
        animate="animate"
      >

        {/* Render animated smoke puffs */}
        {puffs.map(puff => (
          <motion.div
            key={puff.id}
            variants={puffVariants}
            initial="initial"
            animate="animate"
            className="absolute w-16 h-16 flex items-center justify-center rounded-full"
            style={{
              left: puff.offset === 1 ? PUFF_LEFT_OUTER : PUFF_LEFT_INNER,
              top: PUFF_TOP_OFFSET,
              background: `radial-gradient(circle, ${SMOKE_COLOR} 0%, transparent 70%)`,
              filter: 'blur(5px)',
              transform: `rotate(${puff.randomRotation}deg)`
            }}
          >
            {/* CO₂ Label */}
            <span
              className="text-base font-black text-white"
              style={{
                filter: 'none',
                textShadow: '0 0 10px rgba(0,0,0,1), 0 0 6px #FFFFFF'
              }}
            >
              CO₂
            </span>
          </motion.div>
        ))}

        {/* ===== SVG CAR GRAPHIC ===== */}
        <svg width={CAR_WIDTH} height="150" viewBox="0 0 350 100" className="drop-shadow-2xl absolute">
          <defs>
            {/* Neon glow filter */}
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Body gradient */}
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004C4C" />
              <stop offset="100%" stopColor={BODY_COLOR} />
            </linearGradient>
          </defs>

          <g filter="url(#luxuryNeon)">
            {/* Car body */}
            <path 
              d="M 30 75 L 80 55 H 280 L 330 75 Z"
              fill="url(#bodyGradientLuxury)"
              stroke={NEON_BLUE}
              strokeWidth="2.5"
            />

            {/* Windshield */}
            <rect x="100" y="40" width="150" height="15" rx="3" 
              fill="#000" stroke={NEON_BLUE} strokeWidth="1" opacity="0.8" />

            {/* Rear spoiler */}
            <rect x="330" y="50" width="8" height="30" rx="2" 
              fill={CHROME_COLOR} stroke={NEON_BLUE} strokeWidth="1" />

            {/* Wheels */}
            <g>
              <motion.circle cx="80" cy="80" r="15"
                fill={BODY_COLOR} stroke={CHROME_COLOR} strokeWidth="2.5"
                variants={wheelSpinVariants} animate="animate"
                style={{ transformOrigin: '80px 80px' }}
              />
              <motion.circle cx="280" cy="80" r="15"
                fill={BODY_COLOR} stroke={CHROME_COLOR} strokeWidth="2.5"
                variants={wheelSpinVariants} animate="animate"
                style={{ transformOrigin: '280px 80px' }}
              />
            </g>

            {/* Headlight */}
            <rect x="335" y="60" width="5" height="10" rx="1"
              fill="#FFF" style={{ filter: "drop-shadow(0 0 10px #FFF)" }} />

            {/* Bottom chassis line */}
            <path d="M 30 80 L 330 80"
              fill="none" stroke={NEON_BLUE} strokeWidth="3" opacity="0.8" />

            {/* Exhaust pipes */}
            <rect x="40" y="73" width="12" height="7" rx="2"
              fill={BODY_COLOR} stroke={NEON_BLUE} strokeWidth="1.5" />
            <rect x="60" y="73" width="12" height="7" rx="2"
              fill={BODY_COLOR} stroke={NEON_BLUE} strokeWidth="1.5" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default NeonCar;