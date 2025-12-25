import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Zap } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

// ===== GAUGE COMPONENT =====
// A reusable radial gauge for the score
// ===== GAUGE COMPONENT =====
// A reusable radial gauge for the score
const EmissionGauge = ({ value, color, max = 350 }) => {
  const radius = 75;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Effect behind the gauge - simplified for white bg */}
      <div 
        className="absolute inset-0 rounded-full blur-[40px] opacity-10"
        style={{ backgroundColor: color }}
      ></div>

      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 relative z-10"
      >
        {/* Background Circle */}
        <circle
          stroke="rgba(255,255,255,0.1)" // visible on dark bg
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Circle */}
        <motion.circle
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-2xl font-bold font-heading text-white"
        >
          {value}
        </motion.span>
        <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold mt-1">g/km</span>
      </div>
    </div>
  );
};

const AnimationCard = ({ prediction, onReset }) => {
  const { predicted_co2_emissions, interpretation, category } = prediction;
  
  const getCategoryHex = () => {
    switch(category) {
      case "Excellent": return "#10b981"; // Emerald-500
      case "Good": return "#34d399"; // Emerald-400
      case "Average": return "#facc15"; // Yellow-400
      case "High": return "#f87171"; // Red-400
      case "Very High": return "#ef4444"; // Red-500
      default: return "#94a3b8";
    }
  };

  const activeColor = getCategoryHex();

  // Basic variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } 
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };
  
   const generateAndSharePDF = () => {
      try {
        const toastId = toast.loading("Generating Crystal Report...");
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.text(`Emission Report: ${category}`, 20, 20);
        doc.text(`Value: ${predicted_co2_emissions} g/km`, 20, 30);
        doc.save("emission-report.pdf");

        toast.success("Report downloaded!", { id: toastId });
      } catch (e) {
        console.error(e);
        toast.error("Error generating PDF");
      }
    };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative w-full max-w-lg mx-auto"
    >
      {/* White Card Container */}
      {/* Dynamic Gradient Card Container */}
      <div 
        className="relative overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl shadow-black/50"
        style={{
          background: `radial-gradient(circle at top right, ${activeColor}40, #171717 60%)`, // localized glow + dark base
          backgroundColor: '#171717' // fallback
        }}
      >
        
        <div className="p-6 sm:p-8 md:p-10 flex flex-col items-center text-center relative z-10">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-white mb-1">
              Analysis Complete
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              Your vehicle's environmental footprint
            </p>
          </motion.div>

          {/* Main Visual: Gauge */}
          <motion.div 
            className="mb-8 relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <EmissionGauge 
              value={predicted_co2_emissions} 
              color={activeColor} 
            />
            
            {/* Category Badge Floating Below - heavily modified for dark theme */}
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-5 px-5 py-2 rounded-full border border-white/10 flex items-center gap-2 mx-auto w-fit shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: `${activeColor}20` }}
            >
              <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-[0_0_10px_currentColor]" style={{ backgroundColor: activeColor, color: activeColor }}></div>
              <span className="text-sm font-bold tracking-wide text-white">{category}</span>
            </motion.div>
          </motion.div>

          {/* Interpretation - Dark glassmorphism */}
          <motion.div variants={itemVariants} className="mb-8 w-full">
             <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-left flex items-stretch gap-4">
                <div className="w-1.5 rounded-full shrink-0" style={{ backgroundColor: activeColor }}></div>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {interpretation}
                </p>
             </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onReset}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            
            <button
              onClick={generateAndSharePDF}
              className="flex-[1.5] py-3.5 px-4 rounded-xl font-bold text-sm text-white transition-all shadow-lg flex items-center justify-center gap-2 relative overflow-hidden group"
              style={{ 
                  background: `linear-gradient(135deg, ${activeColor}, ${activeColor}dd)`,
                  boxShadow: `0 8px 20px -6px ${activeColor}66`
              }}
            >
              <FileDown size={18} className="relative z-10" />
              <span className="relative z-10">Download Report</span>
            </button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default AnimationCard;
