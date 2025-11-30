// File: BackgroundParticles.jsx

// Import the React library essentials.
import React, { memo } from "react"; 
// Import 'memo' which is crucial for performance. It's a Higher-Order Component 
// that prevents the component from re-rendering when its parent component re-renders (like when typing in the form), 
// provided its props haven't changed. This stops the animation from pausing/resetting.

// Import the motion components from Framer Motion, used to handle advanced, declarative animations.
import { motion } from "framer-motion"; 

// Define the core color palette. These hexadecimal color codes are used for the glow effect.
const COLORS = [
  '#10B981', // Emerald (Primary Green)
  '#06B6D4', // Cyan (Accent Blue)
  '#14B8A6', // Teal (Secondary Blue-Green)
  '#84CC16', // Lime (Sub-accent Green)
];

// Define the functional component. It is named 'AnimatedParticles'.
const AnimatedParticles = () => { // <-- Function definition starts here
  
  // Constants for defining the particle start position and travel path
  
  // Particles start 50% of the viewport height (VH) *above* the screen. 
  // This ensures they float down from the very top edge.
  const START_OFFSET_VH = -50; 
  
  // Total vertical distance the particles will travel (150vh ensures they travel far past the bottom edge).
  const TRAVEL_VH = 150; 
  
  // Base color for the "CO₂" text elements (pure white).
  const CO2_BASE_COLOR = "#FFF"; 
  
  // Glow color for the "CO₂" text, creating a neon effect.
  const CO2_GLOW_COLOR = "#00F9FF"; 

  // The component returns JSX wrapped in a React Fragment (<>...</>).
  return (
    <>
      {/* ==================================================================== */}
      {/* 1. FLOATING PARTICLE RENDERING LOGIC                 */}
      {/* ==================================================================== */}

      {/* Create an array of 35 items and map over it to render 35 individual particles. */}
      {[...Array(35)].map((_, i) => {
        
        // Randomly set the size of the particle between 4px and 12px (8 + 4).
        const size = Math.random() * 8 + 4;
        
        // Randomly set the starting horizontal position across the screen (0% to 100%).
        const startX = Math.random() * 100;
        
        // Randomly set a slight horizontal drift during motion (-10 to +10 pixels).
        const driftAmount = Math.random() * 20 - 10;
        
        // Randomly set the total duration of one animation cycle (12 to 27 seconds) for slow, floating movement.
        const duration = Math.random() * 15 + 12;
        
        // Randomly stagger the start of each particle's animation (0 to 8 seconds).
        const delay = Math.random() * 8;
        
        // Cycle through the predefined COLORS array using the index 'i'.
        const baseColor = COLORS[i % COLORS.length];
        
        // Generates a semi-transparent color for the glow effect. The opacity is between 30% and 70%.
        const particleColor = baseColor + `${Math.floor((Math.random() * 0.4 + 0.3) * 255).toString(16).padStart(2, '0')}`;
        
        // Start rendering the individual particle using Framer Motion's motion.div
        return (
          <motion.div
            key={`particle-${i}`} // Unique key required by React for lists
            className="absolute rounded-full" // Tailwind classes: Absolute positioning, perfectly round shape
            style={{
              width: size,       // Set width based on the random size
              height: size,      // Set height based on the random size
              left: `${startX}%`,// Horizontal starting position
              top: `${START_OFFSET_VH}vh`,  // Vertical starting position (off-screen high)
              background: baseColor, // Solid background color
              // Create the glow effect using boxShadow, blurring the particle's color
              boxShadow: `0 0 ${size * 2}px ${particleColor}`,
              opacity: 0, // Starts invisible (will fade in via the 'animate' prop)
            }}
            // Define the animation properties for the motion.div
            animate={{ 
              // Y-axis movement: Starts at 0 relative position, travels downwards by TRAVEL_VH distance + random variance
              y: [0, TRAVEL_VH * (Math.random() * 0.2 + 1)], 
              // X-axis movement: Drifts horizontally then returns to center (relative to startX)
              x: [0, driftAmount, 0],
              // Rotation: Stays static
              rotate: [0, 0], 
              // Opacity cycle: Starts 0 (invisible), fades to 0.6, holds, then fades back to 0 (off-screen)
              opacity: [0, 0.6, 0.6, 0], 
              // Scale cycle: Pulsates slightly for a subtle twinkling effect
              scale: [0.8, 1.2, 1, 0.8] 
            }}
            // Define the animation transition parameters
            transition={{ 
              duration: duration,        // Use the random duration (12-27s)
              repeat: Infinity,          // Loop the animation forever
              ease: "linear",            // Consistent speed throughout the animation
              delay: delay,              // Use the random start delay
              times: [0, 0.1, 0.85, 1]   // Keyframes for opacity/scale (fade in fast, hold long, fade out fast)
            }}
          />
        );
      })}

      {/* ==================================================================== */}
      {/* 2. CO2 ICON RENDERING LOGIC                      */}
      {/* ==================================================================== */}

      {/* Create an array of 12 items to render 12 twinkling "CO₂" icons. */}
      {[...Array(12)].map((_, i) => {
        // Randomly set the size of the icon container (12px to 22px).
        const size = Math.random() * 10 + 12;
        
        // Start rendering the icon container
        return (
          <motion.div
            key={`co2-icon-${i}`} // Unique key
            className="absolute flex items-center justify-center font-bold text-xs"
            style={{
              width: size,
              height: size,
              // Randomly place the icon horizontally across the screen (0% to 100%)
              left: `${Math.random() * 100}%`,
              // Randomly place the icon vertically across the screen (0% to 100%)
              top: `${Math.random() * 100}%`,
            }}
            // Define the animation (twinkle effect)
            animate={{
              // Opacity cycle: Fades in, holds briefly, fades out (twinkle)
              opacity: [0, 0.8, 0],
              // Scale cycle: Shrinks, expands slightly, returns to normal
              scale: [0.5, 1.3, 0.5],
              rotate: [0, 0, 0], 
            }}
            transition={{
              duration: Math.random() * 4 + 3, // Duration of one twinkle cycle (3-7s)
              repeat: Infinity,
              ease: "easeInOut", // Smooth transition for a soft pulse
              delay: Math.random() * 5, // Staggered start delay
            }}
          >
            {/* The actual "CO₂" text span */}
            <span 
              style={{ 
                color: CO2_BASE_COLOR, // White text color
                fontSize: size * 0.65, // Font size proportional to container size
                // Drop shadow creates the bright, neon glow effect
                filter: `drop-shadow(0 0 4px ${CO2_GLOW_COLOR})`, 
                lineHeight: 1, // Ensures text is centered well
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
// Use React.memo to prevent the component from re-rendering and resetting the animation 
// whenever the parent component's state (e.g., form input) changes.
export default memo(AnimatedParticles); // <-- EXPORT THE MEMOIZED COMPONENT