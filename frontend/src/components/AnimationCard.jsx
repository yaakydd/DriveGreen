import React from "react";
import { motion } from "framer-motion";
import { FileDown, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

//  GAUGE COMPONENT
const EmissionGauge = ({ value, color, max = 350 }) => {
  const radius = 77;
  const stroke = 9;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Effect */}
      <div 
        className="absolute inset-0 rounded-full blur-[40px] opacity-20"
        style={{ backgroundColor: color }}
      ></div>

      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 relative z-10"
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
          transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
        />
      </svg>
      {/* Center Text */}
      <div className="absolute flex flex-col items-center z-20">
        <motion.span 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
          className="text-3xl sm:text-4xl font-bold text-white drop-shadow-lg"
          style={{ textShadow: `0 0 20px ${color}80` }}
        >
          {value}
        </motion.span>
        <span className="text-xs text-gray-500 uppercase tracking-wider">g/km</span>
      </div>
    </div>
  );
};

const AnimationCard = ({ prediction, formData, onReset }) => {
  const { predicted_co2_emissions, interpretation, category } = prediction;
  
  //  HELPER FUNCTIONS 
  const getCategoryColor = () => {
    switch(category) {
      case "Excellent": return [16, 185, 129];
      case "Good": return [34, 197, 94];
      case "Average": return [245, 158, 11];
      case "High": return [239, 68, 68];
      case "Very High": return [220, 38, 38];
      default: return [0, 0, 0];
    }
  };

  const getCategoryHex = () => {
    switch(category) {
      case "Excellent": return "#055037ff";
      case "Good": return "#34d399";
      case "Average": return "#facc15";
      case "High": return "#f87171";
      case "Very High": return "#ef4444";
      default: return "#94a3b8";
    }
  };

  const getRecommendations = (category) => {
    switch(category) {
      case "Excellent":
        return [
          "Maintain regular vehicle servicing to keep emissions low",
          "Continue using eco-friendly driving habits",
          "Consider sharing your fuel-efficient choices with others"
        ];
      case "Good":
        return [
          "Maintain steady speeds and avoid rapid acceleration",
          "Keep tires properly inflated to improve efficiency",
          "Remove unnecessary weight from your vehicle"
        ];
      case "Average":
        return [
          "Consider carpooling or public transport when possible",
          "Plan routes to minimize unnecessary driving",
          "Look into hybrid or electric vehicles for your next purchase"
        ];
      case "High":
        return [
          "Evaluate if a more fuel-efficient vehicle suits your needs",
          "Combine multiple errands into single trips",
          "Consider offsetting emissions through carbon credits"
        ];
      case "Very High":
        return [
          "Strongly consider switching to a more efficient vehicle",
          "Explore electric or hybrid alternatives",
          "Use alternative transportation methods whenever possible"
        ];
      default:
        return ["Regular maintenance and efficient driving can help reduce emissions"];
    }
  };

  const activeColor = getCategoryHex();

const generateAndSharePDF = () => {
  try {
    const toastId = toast.loading("Generating Report...");
    const doc = new jsPDF();
    
    // FIX: Standardize all text to ASCII to prevent crashes
    const safeText = (str) => str ? str.replace(/₂/g, "2").replace(/[^\x20-\x7E]/g, "") : "";

    const [r, g, b] = getCategoryColor();

    // COVER PAGE
    doc.setFillColor(2, 6, 23); // Dark background
    doc.rect(0, 0, 210, 297, "F");

    // FIX: Instead of GState (transparency), use thin outlined circles for the glow effect
    doc.setDrawColor(16, 185, 129);
    doc.setLineWidth(0.1);
    doc.circle(0, 0, 80, "S"); 
    doc.circle(210, 120, 60, "S");

    // Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(40);
    doc.setTextColor(248, 250, 252);
    doc.text("DRIVE", 35, 120);
    doc.text("GREEN", 35, 135);

    // CONTENT PAGE
    doc.addPage();
    doc.setTextColor(15, 23, 42); // Reset to dark text for white page
    
    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(16, 185, 129);
    doc.text("DriveGreen AI Report", 20, 25);

    // Results
    doc.setFontSize(30);
    doc.setTextColor(r, g, b);
    doc.text(`${predicted_co2_emissions} g/km`, 20, 70);

    // Analysis (Wrapped Text)
    doc.setFontSize(12);
    doc.setTextColor(50, 50, 50);
    const splitText = doc.splitTextToSize(safeText(interpretation), 170);
    doc.text(splitText, 20, 90);

    doc.save(`DriveGreen_Report.pdf`);
    toast.dismiss(toastId);
    toast.success("Downloaded!");
  } catch (error) {
    console.error("PDF Detail Error:", error); // This shows exactly why it failed
    toast.dismiss();
    toast.error("PDF format error. Check console.");
  }
};

  // ANIMATION VARIANTS 
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
          backgroundColor: '#171717' // fallback color
        }}
      >
        
        <div className="p-5 sm:p-6 md:p-10 flex flex-col items-center text-center relative z-10">
          
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-5">
            <h2 className="text-2xl font-heading font-bold text-white mb-1">
              Analysis Complete
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              Your vehicle's environmental footprint
            </p>
          </motion.div>

          {/* Main Visual: Gauge */}
          <motion.div 
            className="mb-5 relative"
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