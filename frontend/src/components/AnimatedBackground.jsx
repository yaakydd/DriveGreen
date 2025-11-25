import React from 'react';

/**
 * AnimatedParticles Component
 * 
 * Renders floating particles that rise and rotate, simulating
 * atmospheric effects in the background.
 * 
 * Features:
 * - Randomized starting positions
 * - Varying sizes and colors (green and blue)
 * - Smooth upward floating animation with rotation
 */
const AnimatedParticles = () => {
    // Generate 20 particles with randomized attributes
    const particles = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      // Randomize starting X position (0% to 100vw)
      x: `${Math.random() * 100}vw`,
      // Randomize animation duration (15s to 30s)
      duration: `${15 + Math.random() * 15}s`, 
      // Randomize animation delay (0s to 10s)
      delay: `${Math.random() * 10}s`,
      // Randomize size (w-1 to w-4) and color (green or blue)
      sizeClass: `w-${Math.floor(Math.random() * 4) + 1} h-auto`,
      color: Math.random() > 0.5 ? 'bg-green-400' : 'bg-sky-400', // Brighter colors
      opacity: `opacity-${Math.floor(Math.random() * 3) * 10 + 40}`, // Min opacity 40
    }));

    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Inject CSS keyframes for floating animation */}
        <style jsx>{`
          @keyframes floatUp {
            0% { 
              transform: translateY(0) rotate(0deg); 
              opacity: 0.2; 
            }
            50% { 
              opacity: 0.5;
            }
            100% { 
              transform: translateY(-100vh) rotate(360deg); 
              opacity: 0; 
            }
          }
        `}</style>
        
        {particles.map(p => (
          <div
            key={p.id}
            className={`absolute aspect-square rounded-full blur-sm ${p.color} ${p.sizeClass} ${p.opacity}`}
            style={{
              left: p.x,
              bottom: '-10vh', // Start below the viewport
              animation: `floatUp ${p.duration} linear ${p.delay} infinite`,
            }}
          ></div>
        ))}
      </div>
    );
};
export default AnimatedParticles;