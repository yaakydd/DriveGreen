import { motion } from 'framer-motion';

const DriveGreenLogo = ({ size = "normal" }) => {
  const sizes = {
    small: { logo: 40, text: "text-2xl" },
    normal: { logo: 56, text: "text-3xl" },
    large: { logo: 72, text: "text-4xl" }
  };

  const { logo, text } = sizes[size];
  const colorClass = "text-green-600";

  return (
    <div className="flex items-center gap-3">
      {/* ===== LOGO ICON (Animated SVG) ===== */}
      <motion.div
        className="relative flex items-center justify-center flex-shrink-0"
        style={{ width: logo, height: logo }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {/* Outer Circle - Emerald Glow */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg"
          style={{
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
          }}
        />
        
        {/* Inner Circle - White */}
        <div className="absolute inset-2 rounded-full bg-white" />
        
        {/* Leaf Icon - Stylized SVG */}
        <svg
          viewBox="0 0 24 24"
          className="relative z-10"
          style={{ width: logo * 0.5, height: logo * 0.5 }}
          fill="none"
          stroke="currentColor"
        >
          {/* Leaf shape */}
          <path
            d="M12 3C7 3 3 7 3 12c0 2.5 1 4.5 2.5 6C7 19.5 9.5 21 12 21c5 0 9-4 9-9 0-5-4-9-9-9z"
            fill="#10b981"
            stroke="#059669" 
            strokeWidth="1.5"
          />
          {/* Leaf vein */}
          <path
            d="M12 3v18M12 12c2-2 5-3 7-3"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Pulsing animation ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-400"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* ===== TEXT LOGO ===== */}
      <div className={`flex items-center font-bold tracking-tight ${text}`}>
        <span className="text-slate-800">Drive</span>
        <span className={colorClass}>Green</span>
      </div>
    </div>
  );
};

export default DriveGreenLogo;