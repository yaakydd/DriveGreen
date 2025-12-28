import React from "react";
import { motion } from "framer-motion";
import { FileDown, RefreshCw, FileText } from "lucide-react";
import jsPDF from "jspdf";
import toast, { Toaster } from "react-hot-toast";

// ===== GAUGE COMPONENT =====
const EmissionGauge = ({ value, color, max = 350 }) => {
  const radius = 80;
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
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
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

const AnimationCard = ({ prediction, onReset }) => {
  const { predicted_co2_emissions, interpretation, category } = prediction;
  
  // ===== HELPER FUNCTIONS =====
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
      case "Excellent": return "#085e41ff";
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

  // ===== PDF GENERATION (Complete Logic from First Code) =====
  const generateAndSharePDF = () => {
    try {
      const toastId = toast.loading("Generating PDF...");
      const doc = new jsPDF();
      const [r, g, b] = getCategoryColor();

      // ===== HEADER SECTION =====
      doc.setFillColor(71, 85, 105);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("CO₂ Emissions Report", 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text("Your Vehicle Carbon's Footprint Analysis", 105, 30, { align: 'center' });

      // ===== DATE =====
      const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Generated: ${date}`, 105, 50, { align: 'center' });

      // ===== MAIN RESULT BOX =====
      doc.setFillColor(r, g, b, 0.1);
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(2);
      doc.roundedRect(20, 60, 170, 50, 5, 5, 'FD');
      doc.setTextColor(r, g, b);
      doc.setFontSize(48);
      doc.setFont(undefined, 'bold');
      doc.text(`${predicted_co2_emissions}`, 105, 90, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("g/km", 105, 100, { align: 'center' });

      // ===== CATEGORY BADGE =====
      doc.setFillColor(r, g, b);
      doc.roundedRect(70, 115, 70, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(category, 105, 123, { align: 'center' });

      // ===== INTERPRETATION SECTION =====
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Environmental Impact Assessment:", 20, 145);
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      const splitText = doc.splitTextToSize(interpretation, 170);
      doc.text(splitText, 20, 155);

      // ===== RECOMMENDATIONS SECTION =====
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Recommendations:", 20, 190);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);
      
      const recommendations = getRecommendations(category);
      let yPosition = 200;
      
      recommendations.forEach((rec, index) => {
        const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 165);
        doc.text(recText, 25, yPosition);
        yPosition += recText.length * 6;
      });

      // ===== COMPARISON CHART =====
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Emission Comparison:", 20, yPosition + 5);
      
      yPosition += 15;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      const comparisons = [
        { label: "Excellent (<120 g/km)", bar: category === "Excellent", color: [16, 185, 129] },
        { label: "Good (120-160 g/km)", bar: category === "Good", color: [34, 197, 94] },
        { label: "Average (160-200 g/km)", bar: category === "Average", color: [245, 158, 11] },
        { label: "High (200-250 g/km)", bar: category === "High", color: [239, 68, 68] },
        { label: "Very High (>250 g/km)", bar: category === "Very High", color: [220, 38, 38] }
      ];

      comparisons.forEach((comp) => {
        doc.setTextColor(60, 60, 60);
        doc.text(comp.label, 25, yPosition);
        
        if (comp.bar) {
          doc.setFillColor(...comp.color);
          doc.rect(100, yPosition - 3, 60, 4, 'F');
          doc.setFontSize(8);
          doc.setTextColor(...comp.color);
          doc.text("← YOUR VEHICLE", 165, yPosition);
          doc.setFontSize(9);
        } else {
          doc.setFillColor(220, 220, 220);
          doc.rect(100, yPosition - 3, 30, 4, 'F');
        }
        yPosition += 8;
      });

      // ===== FOOTER =====
      doc.setFillColor(71, 85, 105);
      doc.rect(0, 280, 210, 17, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text("DriveGreen | Helping You Track Your Vehicle's Carbon Footprint", 105, 290, { align: 'center' });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `co2-emission-report-${timestamp}.pdf`;
      
      doc.save(filename);

      toast.dismiss(toastId);
      toast.success("Downloading PDF...", {
        icon: <FileText size={20} className="text-green-500" />,
        duration: 4000,
        style: {
          background: "#10b981",
          color: "#fff"
        }
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF. Please try again.", {
        icon: "❌"
      });
    }
  };

  // ===== ANIMATION VARIANTS =====
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
          backgroundColor: '#171717' // fallback
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