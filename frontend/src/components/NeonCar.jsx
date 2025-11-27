import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Fuel, Car, Sparkles, Zap, Wind, TrendingUp, Activity } from "lucide-react";

// ===== NEON CAR COMPONENT (120 SECONDS DURATION, IMMEDIATE START) =====
const NeonCar = () => {
  // Color constants for consistent theming throughout the car design
  const NEON_BLUE = "#00F9FF";
  const BODY_COLOR = "#0A0D15";
  const CHROME_COLOR = "#E0E0E0";
  const SMOKE_COLOR = "rgba(140, 140, 140, 0.6)"; 
  
  // Dimensional constants for car size and animation timing
  const CAR_WIDTH = 400;
  // DURATION: Set to 120 seconds (2 minutes).
  const DURATION = 120; 
  
  // State to manage actively displayed smoke puffs
  const [puffs, setPuffs] = useState([]);

  
  const drivePathVariants = useMemo(() => ({
    animate: {
      // X: Horizontal travel (0% to 99.99%) and instant jump back (100%).
      x: [
        "-250vw", // 0.0% (Start far off-screen left)
        "-150vw", // 10.0% 
        "-50vw",  // 20.0% 
        "50vw",   // 30.0% 
        "150vw",  // 40.0% 
        "250vw",  // 50.0% 
        "350vw",  // 60.0% (Exits wave motion, far off-screen right)
        "350vw",  // 99.98% (Hold off-screen)
        "350vw",  // 99.99% (Hold off-screen)
        "-250vw"  // 100% (Invisible jump back to start position)
      ],
      
      // Y: Noticeable wave motion (vertical peaks and valleys)
      y: [
        "-55vh", // 0.0% (Start Low/Level)
        "20vh",  // 10.0% (Peak 1 - Taller)
        "-35vh", // 20.0% (Valley 1 - Deeper)
        "20vh",  // 30.0% (Peak 2 - Taller)
        "-35vh", // 40.0% (Valley 2 - Deeper)
        "20vh",  // 50.0% (Peak 3 - Taller)
        "-55vh", // 60.0% (Valley 3 / Level-out height) 
        "-55vh", // 99.98% (Maintain low height)
        "-55vh", // 99.99% (Maintain low height)
        "-55vh"  // 100% (Jump position)
      ],
      
      // Rotation: Increased tilt to match the more extreme vertical path, leveling out at 60.0%
      rotate: [
        -15,   // 0.0%
        15,    // 10.0% (Tilted Up)
        -15,   // 20.0% (Tilted Down)
        15,    // 30.0% (Tilted Up)
        -15,   // 40.0% (Tilted Down)
        15,    // 50.0% (Tilted Up)
        -15,   // 60.0% (Level out) 
        -15,   // 99.98% (Hold Level)
        -15,   // 99.99% (Hold Level)
        -15    // 100%
      ],
      
      transition: {
        // Times array for 10 keyframes. Seamless reset relies on the last steps: 0.9998 -> 0.9999 -> 1.
        times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.9998, 0.9999, 1],
        
        // All axes share the same duration and timing for coordinated motion.
        x: { 
          duration: DURATION, 
          ease: "linear",
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.9998, 0.9999, 1], 
          repeat: Infinity 
        },
        y: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.9998, 0.9999, 1], 
          repeat: Infinity 
        },
        rotate: { 
          duration: DURATION, 
          ease: "easeInOut",
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.9998, 0.9999, 1], 
          repeat: Infinity 
        },
      }
    }
  }), [DURATION]);


  // Wheel spinning animation
  const wheelSpinVariants = {
    animate: {
      rotate: 360,
      transition: { 
        duration: 0.5,
        ease: "linear",
        repeat: Infinity
      }
    }
  };

  // Smoke Puff Logic
  const emitPuff = useCallback(() => {
    const newId = Date.now() + Math.random();
    const offset = Math.random() > 0.5 ? 1 : 2;
    const randomRotation = Math.random() * 20 - 10;

    setPuffs(prevPuffs => [...prevPuffs, { id: newId, offset, randomRotation }]);

    setTimeout(() => {
      setPuffs(prevPuffs => prevPuffs.filter(puff => puff.id !== newId));
    }, 4500);
  }, []);

  // Continuous Puff Emission
  useEffect(() => {
    const intervalId = setInterval(emitPuff, 450);
    return () => clearInterval(intervalId);
  }, [emitPuff]);

  // Smoke Animation Definition
  const puffVariants = {
    initial: { 
      opacity: 0.95,
      scale: 0.3,
      x: 0,
      y: 0
    },
    animate: {
      opacity: [0.95, 0.6, 0.2, 0.0],
      scale: [0.3, 1.5, 3.0, 5.0],
      x: [0, -40, -70, -100],
      y: [0, -30, -55, -80],
      transition: { 
        duration: 4.0,
        ease: "easeOut"
      }
    }
  };

  // Smoke Positions
  const PUFF_TOP_OFFSET = '44px';
  const PUFF_LEFT_OUTER = '8px';
  const PUFF_LEFT_INNER = '28px';

  // ---

  return (
    // Main container
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      
      {/* Animated car container with undulating motion */}
      <motion.div
        className="absolute w-[400px] h-[150px] top-1/2 left-0 transform -translate-y-1/2"
        style={{ marginLeft: `-${CAR_WIDTH / 2}px` }}
        variants={drivePathVariants}
        // These properties ensure the animation starts immediately upon load:
        initial={{ x: drivePathVariants.animate.x[0], y: drivePathVariants.animate.y[0], rotate: drivePathVariants.animate.rotate[0] }}
        animate="animate"
      >
        {/* ===== EXHAUST SMOKE PUFFS (RETAINED) ===== */}
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
              background: `radial-gradient(circle at center, ${SMOKE_COLOR} 0%, transparent 70%)`,
              filter: 'blur(5px)',
              transform: `rotate(${puff.randomRotation}deg)`,
            }}
          >
            <span
              className="text-base font-black text-white whitespace-nowrap"
              style={{ 
                filter: 'none',
                opacity: 1,
                textShadow: '0 0 10px rgba(0,0,0,1), 0 0 6px #FFFFFF, 0 0 3px #000000' 
              }}
            >
              CO₂
            </span>
          </motion.div>
        ))}

        {/* ===== CAR SVG GRAPHIC (RETAINED) ===== */}
        <svg width={CAR_WIDTH} height="150" viewBox="0 0 350 100" className="drop-shadow-2xl absolute">
          <defs>
            <filter id="luxuryNeon" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="bodyGradientLuxury" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#004C4C" />
              <stop offset="100%" stopColor={BODY_COLOR} />
            </linearGradient>
          </defs>

          <g filter="url(#luxuryNeon)">
            <path d="M 30 75 L 80 55 H 280 L 330 75 Z" 
              fill="url(#bodyGradientLuxury)" 
              stroke={NEON_BLUE} 
              strokeWidth="2.5" />
            
            <rect x="100" y="40" width="150" height="15" rx="3" 
              fill="#000" 
              stroke={NEON_BLUE} 
              strokeWidth="1" 
              opacity="0.8"/>
            
            <rect x="330" y="50" width="8" height="30" rx="2" 
              fill={CHROME_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1"/>
            
            <g>
              <motion.circle cx="80" cy="80" r="15" 
                fill={BODY_COLOR} 
                stroke={CHROME_COLOR} 
                strokeWidth="2.5"
                variants={wheelSpinVariants} 
                animate="animate" 
                style={{ transformOrigin: '80px 80px' }}/>
              
              <motion.circle cx="280" cy="80" r="15" 
                fill={BODY_COLOR} 
                stroke={CHROME_COLOR} 
                strokeWidth="2.5"
                variants={wheelSpinVariants} 
                animate="animate" 
                style={{ transformOrigin: '280px 80px' }}/>
            </g>

            <rect x="335" y="60" width="5" height="10" rx="1" 
              fill="#FFF" 
              style={{ filter: "drop-shadow(0 0 10px #FFF)" }}/>
            
            <path d="M 30 80 L 330 80" 
              fill="none" 
              stroke={NEON_BLUE} 
              strokeWidth="3" 
              opacity="0.8"/>
            
            <rect x="40" y="73" width="12" height="7" rx="2" 
              fill={BODY_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1.5"/>
            
            <rect x="60" y="73" width="12" height="7" rx="2" 
              fill={BODY_COLOR} 
              stroke={NEON_BLUE} 
              strokeWidth="1.5"/>
          </g>
        </svg>
      </motion.div>

      {/* ===== BACKGROUND PARTICLES (RETAINED) ===== */}
      {[...Array(40)].map((_, i) => {
        const size = Math.random() * 8 + 3;
        const startX = Math.random() * 100;
        const startY = Math.random() * 100;
        const floatDistance = Math.random() * 120 + 60; 
        const drift = Math.random() * 40 - 20; 
        const duration = Math.random() * 12 + 10;
        const delay = Math.random() * 8;
        
        let particleColor;
        if (i % 4 === 0) {
          particleColor = `rgba(16, 185, 129, ${Math.random() * 0.15 + 0.1})`;
        } else if (i % 4 === 1) {
          particleColor = `rgba(6, 182, 212, ${Math.random() * 0.15 + 0.1})`;
        } else if (i % 4 === 2) {
          particleColor = `rgba(132, 204, 22, ${Math.random() * 0.15 + 0.1})`;
        } else {
          particleColor = `rgba(20, 184, 166, ${Math.random() * 0.15 + 0.1})`;
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
              boxShadow: `0 0 ${size}px ${particleColor}`,
              filter: 'blur(1px)'
            }}
            animate={{ 
              y: [0, -floatDistance, 0],
              x: [0, drift, -drift, 0],
              opacity: [0.1, 0.25, 0.1], 
              scale: [1, 1.2, 1] 
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

      {/* ===== FLOATING SPARKLE EFFECTS (RETAINED) ===== */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: 0.15,
          }}
          animate={{
            opacity: [0.15, 0.3, 0.15],
            scale: [0.8, 1.1, 0.8],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: Math.random() * 4 + 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        >
          <Sparkles 
            className="text-emerald-400" 
            size={Math.random() * 10 + 5} 
            style={{ filter: 'drop-shadow(0 0 2px rgba(16, 185, 129, 0.4))' }}
          />
        </motion.div>
      ))}
    </div>
  );
};
export default NeonCar;