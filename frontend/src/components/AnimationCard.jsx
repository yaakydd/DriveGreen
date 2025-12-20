import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileDown, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle, Zap } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

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
      {/* Glow Effect behind the gauge */}
      <div 
        className="absolute inset-0 rounded-full blur-[30px] opacity-20"
        style={{ backgroundColor: color }}
      ></div>

      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          stroke="rgba(255,255,255,0.1)"
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
      <div className="absolute flex flex-col items-center">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-4xl font-bold font-heading text-white"
        >
          {value}
        </motion.span>
        <span className="text-xs text-lum-text-dim uppercase tracking-wider">g/km</span>
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
      className="relative w-full max-w-md mx-auto"
    >
      {/* Glass Container */}
      <div className="relative overflow-hidden rounded-3xl bg-lum-deep/40 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/50">
        
        {/* Top Decorative Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lum-accent to-transparent opacity-50"></div>

        <div className="p-8 flex flex-col items-center text-center">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <h2 className="text-2xl font-heading font-bold text-white mb-1">
              Analysis Complete
            </h2>
            <p className="text-sm text-lum-text-dim">
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
              className="mt-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 flex items-center gap-2 mx-auto w-fit"
            >
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeColor }}></div>
              <span className="text-sm font-semibold tracking-wide text-white" style={{ color: activeColor }}>{category}</span>
            </motion.div>
          </motion.div>

          {/* Interpretation */}
          <motion.div variants={itemVariants} className="mb-8 w-full">
             <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-left relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: activeColor }}></div>
                <p className="text-lum-text-dim text-sm leading-relaxed relative z-10">
                  {interpretation}
                </p>
                {/* Subtle hover sheen */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
             </div>
          </motion.div>

          {/* Actions */}
          <motion.div variants={itemVariants} className="flex gap-3 w-full">
            <button
              onClick={onReset}
              className="flex-1 py-3.5 px-4 rounded-xl font-medium text-sm text-lum-text-dim hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} />
              Reset
            </button>
            
            <button
              onClick={generateAndSharePDF}
              className="flex-[2] py-3.5 px-4 rounded-xl font-medium text-sm text-lum-base bg-lum-accent hover:bg-emerald-300 transition-all shadow-[0_0_20px_rgba(52,211,153,0.3)] hover:shadow-[0_0_30px_rgba(52,211,153,0.5)] flex items-center justify-center gap-2"
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
