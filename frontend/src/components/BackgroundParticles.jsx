import React, { memo, useMemo } from "react";
import { motion } from "framer-motion";

/* OPTIMIZATIONS APPLIED TO THIS COMPONENT:
 * 1. Reduced particle count from 35 to 20 (43% reduction)
 * 2. Reduced CO2 icons from 12 to 6 (50% reduction)
 * 3. Pre-computed random values in useMemo (no recalculation on re-render)
 * 4. Cached color calculations
 * 5. Simplified animation keyframes
 * 6. Static style objects to prevent recreation
 */

// Static color palette (computed once at module level)
const COLORS = ['#10B981', '#06B6D4', '#14B8A6', '#84CC16'];
const START_OFFSET_VH = -50;
const TRAVEL_VH = 150;
const CO2_BASE_COLOR = "#FFF";
const CO2_GLOW_COLOR = "#00F9FF";

// Particle count reduced for performance
const PARTICLE_COUNT = 20; // Reduced from 35
const CO2_ICON_COUNT = 6;  // Reduced from 12

const AnimatedParticles = () => {
  // Pre-compute all random values once using useMemo
  // This prevents recalculation on every render
  const particleConfigs = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => {
      const size = Math.random() * 8 + 4;
      const baseColor = COLORS[i % COLORS.length];
      const opacity = Math.random() * 0.4 + 0.3;
      const opacityHex = Math.floor(opacity * 255).toString(16).padStart(2, '0');
      
      return {
        size,
        startX: Math.random() * 100,
        driftAmount: Math.random() * 20 - 10,
        duration: Math.random() * 15 + 12,
        delay: Math.random() * 8,
        baseColor,
        particleColor: baseColor + opacityHex,
        travelDistance: TRAVEL_VH * (Math.random() * 0.2 + 1)
      };
    });
  }, []); // Empty dependency array - compute once

  // Pre-compute CO2 icon configurations
  const co2Configs = useMemo(() => {
    return Array.from({ length: CO2_ICON_COUNT }, () => {
      const size = Math.random() * 10 + 12;
      return {
        size,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 5,
        fontSize: size * 0.65
      };
    });
  }, []);

  // Memoized drop shadow style (static)
  const dropShadowStyle = useMemo(() => 
    `drop-shadow(0 0 4px ${CO2_GLOW_COLOR})`, 
  []);

  return (
    <>
      {/* FLOATING PARTICLES */}
      {particleConfigs.map((config, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full"
          style={{
            width: config.size,
            height: config.size,
            left: `${config.startX}%`,
            top: `${START_OFFSET_VH}vh`,
            background: config.baseColor,
            boxShadow: `0 0 ${config.size * 2}px ${config.particleColor}`,
            opacity: 0,
          }}
          animate={{
            y: [0, config.travelDistance],
            x: [0, config.driftAmount, 0],
            opacity: [0, 0.6, 0.6, 0],
            scale: [0.8, 1.2, 1, 0.8]
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "linear",
            delay: config.delay,
            times: [0, 0.1, 0.85, 1]
          }}
        />
      ))}

      {/* CO2 ICONS */}
      {co2Configs.map((config, i) => (
        <motion.div
          key={`co2-icon-${i}`}
          className="absolute flex items-center justify-center font-bold text-xs"
          style={{
            width: config.size,
            height: config.size,
            left: `${config.left}%`,
            top: `${config.top}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1.3, 0.5],
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: config.delay,
          }}
        >
          <span
            style={{
              color: CO2_BASE_COLOR,
              fontSize: config.fontSize,
              filter: dropShadowStyle,
              lineHeight: 1,
            }}
          >
            CO₂
          </span>
        </motion.div>
      ))}
    </>
  );
};

export default memo(AnimatedParticles);