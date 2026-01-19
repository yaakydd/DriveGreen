import React from "react";
import { motion } from "framer-motion";
import { useState, useMemo, useCallback, useRef } from "react";

// OPTIMIZED NEON CAR COMPONENT
// Key optimizations:
// 1. Reduced puff emission frequency and duration
// 2. Smaller puff pool with reuse strategy
// 3. Memoized constants and variants
// 4. Simplified SVG structure
// 5. Single useEffect cleanup

const NeonCar = () => {
  // Memoized color constants (computed once)
  const COLORS = useMemo(() => ({
    NEON_BLUE: "#00F9FF",
    BODY_COLOR: "#0A0D15",
    CHROME_COLOR: "#E0E0E0",
    SMOKE_COLOR: "rgba(140, 140, 140, 0.9)"
  }), []);
  
  // Animation constants
  const CAR_WIDTH = 350;
  const DURATION = 35;
  const MAX_PUFFS = 8; // Limit concurrent puffs (was unlimited)
  const PUFF_INTERVAL = 600; // Increased from 450ms
  const PUFF_DURATION = 3500; // Reduced from 4500ms
  
  // State: Limited puff pool
  const [puffs, setPuffs] = useState([]);
  const puffIdRef = useRef(0); // Use ref instead of Date.now() for IDs

  // Memoized drive path variants
  const drivePathVariants = useMemo(() => ({
    animate: {
      x: ["-30vw", "-60vw", "-20vw", "40vw", "100vw", "150vw"],
      y: ["-40vh", "-30vh", "-10vh", "5vh", "-15vh", "-40vh"],
      rotate: [-8, -3, 2, -1, -5, -10],
      transition: {
        x: { 
          duration: DURATION, 
          ease: "linear",
          times: [0, 0.15, 0.30, 0.50, 0.75, 1], 
          repeat: Infinity,
          repeatType: "loop"
        },
        y: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.15, 0.30, 0.50, 0.75, 1], 
          repeat: Infinity,
          repeatType: "loop"
        },
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

  // Memoized wheel variants
  const wheelSpinVariants = useMemo(() => ({
    animate: {
      rotate: 360,
      transition: { 
        duration: 0.5,
        ease: "linear",
        repeat: Infinity
      }
    }
  }), []);

  // Optimized puff emission with pool limit
  const emitPuff = useCallback(() => {
    setPuffs(prev => {
      // Limit concurrent puffs to reduce memory
      if (prev.length >= MAX_PUFFS) {
        return prev; // Don't add new puff if at limit
      }
      
      const newId = puffIdRef.current++;
      const offset = Math.random() > 0.5 ? 1 : 2;
      const randomRotation = Math.random() * 20 - 10;
      
      return [...prev, { id: newId, offset, randomRotation }];
    });
  }, [MAX_PUFFS]);

  // Auto-cleanup puffs after animation
  const removePuff = useCallback((id) => {
    setPuffs(prev => prev.filter(p => p.id !== id));
  }, []);

  // Single useEffect for emission interval
  React.useEffect(() => {
    const interval = setInterval(emitPuff, PUFF_INTERVAL);
    return () => clearInterval(interval);
  }, [emitPuff, PUFF_INTERVAL]);

  // Memoized puff variants
  const puffVariants = useMemo(() => ({
    initial: { opacity: 0.95, scale: 0.3, x: 0, y: 0 },
    animate: {
      opacity: [0.95, 0.7, 0.3, 0.0],
      scale: [0.3, 1.5, 3.0, 4.5], // Reduced from 5.0
      x: [0, -40, -70, -90], // Reduced from -100
      y: [0, -30, -55, -70], // Reduced from -80
      transition: { duration: PUFF_DURATION / 1000, ease: "easeOut" }
    }
  }), [PUFF_DURATION]);

  // Positioning constants
  const PUFF_TOP_OFFSET = '44px';
  const PUFF_LEFT_OUTER = '8px';
  const PUFF_LEFT_INNER = '28px';

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <motion.div
        className="absolute w-[280px] sm:w-[350px] md:w-[400px] h-[105px] sm:h-[130px] md:h-[150px] top-1/2 left-0 transform -translate-y-1/2 origin-center"
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }}
        variants={drivePathVariants}
        initial={{ x: "-30vw", y: "-40vh", rotate: -8 }}
        animate="animate"
      >
        {/* Optimized puffs with auto-cleanup */}
        {puffs.map(puff => (
          <motion.div
            key={puff.id}
            variants={puffVariants}
            initial="initial"
            animate="animate"
            onAnimationComplete={() => removePuff(puff.id)}
            className="absolute w-16 h-16 flex items-center justify-center rounded-full"
            style={{
              left: puff.offset === 1 ? PUFF_LEFT_OUTER : PUFF_LEFT_INNER,
              top: PUFF_TOP_OFFSET,
              background: `radial-gradient(circle, ${COLORS.SMOKE_COLOR} 0%, transparent 70%)`,
              filter: 'blur(5px)',
              transform: `rotate(${puff.randomRotation}deg)`
            }}
          >
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

        {/* Simplified SVG with reduced filter complexity */}
        <svg width="100%" height="100%" viewBox="0 0 350 100" className="drop-shadow-2xl absolute">
          <defs>
            {/* Optimized neon glow filter */}
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            {/* Body gradient */}
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004C4C" />
              <stop offset="100%" stopColor={COLORS.BODY_COLOR} />
            </linearGradient>
          </defs>

          <g filter="url(#luxuryNeon)">
            {/* Car body */}
            <path 
              d="M 30 75 L 80 55 H 280 L 330 75 Z"
              fill="url(#bodyGradientLuxury)"
              stroke={COLORS.NEON_BLUE}
              strokeWidth="2.5"
            />

            {/* Windshield */}
            <rect x="100" y="40" width="150" height="15" rx="3" 
              fill="#000" stroke={COLORS.NEON_BLUE} strokeWidth="1" opacity="0.8" />

            {/* Rear spoiler */}
            <rect x="330" y="50" width="8" height="30" rx="2" 
              fill={COLORS.CHROME_COLOR} stroke={COLORS.NEON_BLUE} strokeWidth="1" />

            {/* Wheels with memoized variants */}
            <g>
              <motion.circle cx="80" cy="80" r="15"
                fill={COLORS.BODY_COLOR} stroke={COLORS.CHROME_COLOR} strokeWidth="2.5"
                variants={wheelSpinVariants} animate="animate"
                style={{ transformOrigin: '80px 80px' }}
              />
              <motion.circle cx="280" cy="80" r="15"
                fill={COLORS.BODY_COLOR} stroke={COLORS.CHROME_COLOR} strokeWidth="2.5"
                variants={wheelSpinVariants} animate="animate"
                style={{ transformOrigin: '280px 80px' }}
              />
            </g>

            {/* Headlight */}
            <rect x="335" y="60" width="5" height="10" rx="1"
              fill="#FFF" style={{ filter: "drop-shadow(0 0 10px #FFF)" }} />

            {/* Bottom chassis line */}
            <path d="M 30 80 L 330 80"
              fill="none" stroke={COLORS.NEON_BLUE} strokeWidth="3" opacity="0.8" />

            {/* Exhaust pipes */}
            <rect x="40" y="73" width="12" height="7" rx="2"
              fill={COLORS.BODY_COLOR} stroke={COLORS.NEON_BLUE} strokeWidth="1.5" />
            <rect x="60" y="73" width="12" height="7" rx="2"
              fill={COLORS.BODY_COLOR} stroke={COLORS.NEON_BLUE} strokeWidth="1.5" />
          </g>
        </svg>
      </motion.div>
    </div>
  );
};

export default NeonCar;