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
  const radius = 60;
  const stroke = 8;
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
          stroke="#e5e7eb" // gray-200
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
      <div className="absolute flex flex-col items-center z-20">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-4xl font-bold font-heading text-gray-900"
        >
          {value}
        </motion.span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">g/km</span>
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
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white border border-gray-100 shadow-2xl shadow-emerald-900/10">
        
        {/* Decorative Curved Corner - Top Left */}
        <div className="absolute top-6 left-6 w-20 h-20 border-t-[6px] border-l-[6px] border-emerald-400 rounded-tl-3xl pointer-events-none opacity-80" />
        
        {/* Decorative Curved Corner - Bottom Right */}
        <div className="absolute bottom-6 right-6 w-20 h-20 border-b-[6px] border-r-[6px] border-emerald-400 rounded-br-3xl pointer-events-none opacity-80" />

        <div className="p-8 md:p-10 flex flex-col items-center text-center relative z-10">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-gray-900 mb-1">
              Analysis Complete
            </h2>
            <p className="text-sm text-gray-500 font-medium">
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
            
            {/* Category Badge Floating Below */}
            <motion.div 
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-5 px-5 py-2 rounded-full bg-gray-50 border border-gray-100 flex items-center gap-2 mx-auto w-fit shadow-sm"
            >
              <div className="w-2.5 h-2.5 rounded-full animate-pulse shadow-sm" style={{ backgroundColor: activeColor }}></div>
              <span className="text-sm font-bold tracking-wide" style={{ color: activeColor }}>{category}</span>
            </motion.div>
          </motion.div>

          {/* Interpretation */}
          <motion.div variants={itemVariants} className="mb-8 w-full">
             <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-left relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl" style={{ backgroundColor: activeColor }}></div>
                <p className="text-gray-600 text-sm leading-relaxed relative z-10 pl-2">
                  {interpretation}
                </p>
             </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={onReset}
              className="flex-1 py-3.5 px-4 rounded-xl font-bold text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            
            <button
              onClick={generateAndSharePDF}
              className="flex-[1.5] py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#6EE7B7] hover:bg-[#34D399] transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <FileDown size={18} />
              Download Report
            </button>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

export default AnimationCard;
