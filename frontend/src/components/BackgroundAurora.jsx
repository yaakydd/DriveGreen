import React from "react";
import { motion } from "framer-motion";

const BackgroundAurora = () => {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-lum-base selection:bg-lum-accent/30 pointer-events-none">
      
      {/* 1. Main Atmosphere Gradient (Static base) */}
      <div className="absolute inset-0 bg-aurora-gradient opacity-60" />

      {/* 2. Moving Aurora Blobs */}
      <motion.div 
        className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] bg-emerald-900/40 rounded-full blur-[120px] mix-blend-screen"
        animate={{ 
          x: [0, 50, 0],
          y: [0, 30, 0],
          scale: [1, 1.1, 1] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div 
        className="absolute top-[40%] -right-[20%] w-[60vw] h-[60vw] bg-teal-900/30 rounded-full blur-[100px] mix-blend-screen"
        animate={{ 
          x: [0, -30, 0], 
          y: [0, -50, 0],
          scale: [1, 1.2, 1]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      <motion.div 
        className="absolute -bottom-[20%] left-[20%] w-[50vw] h-[50vw] bg-blue-900/20 rounded-full blur-[100px] mix-blend-screen"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* 3. Central Glow for depth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-lum-deep/50 rounded-full blur-[100px] mix-blend-overlay" />

      {/* 4. Noise Texture for "Film Grain" look (Premium feel) */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
    </div>
  );
};

export default BackgroundAurora;
