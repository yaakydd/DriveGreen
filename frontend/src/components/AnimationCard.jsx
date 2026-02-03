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

  // PREMIUM PDF GENERATION (REVERTED & REFINED) 
 const generateAndSharePDF = () => {
  try {
    const toastId = toast.loading("Generating Report...");
    
    // FIX 1: Explicitly initialize with units and format for production stability
    const doc = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4"
    });

    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;

    const themeColors = {
      bg: [2, 6, 23],
      cardBg: [15, 23, 42],
      accent: [16, 185, 129],
      text: [248, 250, 252],
      textDim: [148, 163, 184]
    };

    const [r, g, b] = getCategoryColor();

    // FIX 2: Enhanced Sanitization
    // Standard PDF fonts don't support the '₂' character. This replaces it safely.
    const sanitizeText = (str) => {
      if (!str) return "";
      return str
        .replace(/₂/g, "2") 
        .replace(/[\u2013\u2014]/g, "-") // En/Em dashes
        .replace(/[^\x20-\x7E]/g, "");   // Remove non-ASCII characters that crash jsPDF
    };

    // --- COVER PAGE (Maintained Design) ---
    const drawCover = () => {
      doc.setFillColor(...themeColors.bg);
      doc.rect(0, 0, pageWidth, pageHeight, "F");

      // FIX 3: Replaced GState with layered circles using lowered fill opacity
      // This achieves the 'glow' effect without using the unstable GState function
      doc.setFillColor(16, 185, 129);
      doc.setDrawColor(16, 185, 129);
      
      // Decorative corner glow (simulated)
      doc.setLineWidth(0.1);
      doc.circle(0, 0, 80, "S"); 
      doc.circle(pageWidth, pageHeight * 0.4, 60, "S");

      doc.setFillColor(...themeColors.accent);
      doc.rect(margin, margin, 1.5, pageHeight - (margin * 2), "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(48);
      doc.setTextColor(...themeColors.text);
      doc.text("DRIVE", margin + 15, 120);
      doc.text("GREEN", margin + 15, 140);

      const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
      doc.setFontSize(14);
      doc.setTextColor(...themeColors.textDim);
      doc.text(`Generated on ${date}`, margin + 15, 180);

      doc.setFontSize(16);
      doc.setTextColor(...themeColors.text);
      doc.text("DRIVEGREEN AI", margin + 15, pageHeight - margin - 10);
    };

    // --- CONTENT PAGE (Maintained Design) ---
    const drawContent = () => {
      doc.addPage();
      
      // Header
      doc.setFillColor(...themeColors.cardBg);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setFontSize(18);
      doc.setTextColor(...themeColors.accent);
      doc.text("DriveGreen", margin, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(...themeColors.textDim);
      doc.text("Carbon Footprint Report", margin, 26);

      const textDark = "#0f172a"; 
      const textGray = "#64748b";
      let cursorY = 75;

      // 1. SCORE CARD
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), 55, 4, 4, "S");
      doc.setFillColor(r, g, b);
      doc.rect(margin, cursorY, 4, 55, "F"); 

      doc.setFontSize(42);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(`${predicted_co2_emissions}`, margin + 20, cursorY + 25);
      
      doc.setFontSize(12);
      doc.setTextColor(textGray);
      doc.text("g/km", margin + 20, cursorY + 40);

      // Badge
      doc.setFillColor(r, g, b);
      doc.roundedRect(pageWidth - margin - 60, cursorY + 15, 40, 10, 5, 5, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(sanitizeText(category).toUpperCase(), pageWidth - margin - 40, cursorY + 21, { align: "center" });

      cursorY += 75;

      // 2. VEHICLE SPECS
      doc.setFontSize(14);
      doc.setTextColor(textDark);
      doc.text("Vehicle Specifications", margin, cursorY);
      cursorY += 10;

      const specs = [
          { l: "FUEL TYPE", v: formData.fuel_type },
          { l: "CYLINDERS", v: formData.cylinders },
          { l: "ENGINE", v: formData.engine_size + " L" }
      ];

      specs.forEach((item, i) => {
          doc.setFillColor(248, 250, 252);
          doc.roundedRect(margin + (i * 60), cursorY, 50, 20, 2, 2, "F");
          doc.setFontSize(8);
          doc.setTextColor(textGray);
          doc.text(item.l, margin + (i * 60) + 5, cursorY + 8);
          doc.setFontSize(11);
          doc.setTextColor(textDark);
          doc.text(String(item.v), margin + (i * 60) + 5, cursorY + 16);
      });

      cursorY += 40;

      // 3. ANALYSIS
      doc.setFontSize(14);
      doc.setTextColor(textDark);
      doc.setFont("helvetica", "bold");
      doc.text("Analysis Result", margin, cursorY);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#334155");
      const cleanInterpretation = sanitizeText(interpretation);
      const splitText = doc.splitTextToSize(cleanInterpretation, pageWidth - (margin * 2));
      doc.text(splitText, margin, cursorY + 10);
      
      cursorY += (splitText.length * 6) + 20;

      // 4. RECOMMENDATIONS
      doc.setFontSize(14);
      doc.setTextColor(textDark);
      doc.setFont("helvetica", "bold");
      doc.text("Recommendations", margin, cursorY);
      
      const recs = getRecommendations(category);
      recs.forEach((rec, i) => {
          doc.setFillColor(...themeColors.accent);
          doc.circle(margin + 2, cursorY + 10 + (i * 8), 1, "F");
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(sanitizeText(rec), margin + 8, cursorY + 11 + (i * 8));
      });
    };

    // Execution
    drawCover();
    drawContent();

    const timestamp = new Date().getTime();
    doc.save(`DriveGreen_Report_${timestamp}.pdf`);
    
    toast.dismiss(toastId);
    toast.success("Report Downloaded!");

  } catch (error) {
    console.error("PDF Error:", error);
    toast.dismiss();
    toast.error("Failed to generate PDF. Check console for details.");
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