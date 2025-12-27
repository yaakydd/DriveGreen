import React from "react";
import { motion } from "framer-motion";
import { FileDown, RefreshCw } from "lucide-react";
import jsPDF from "jspdf";
import toast, { Toaster } from "react-hot-toast";

// ===== GAUGE COMPONENT =====
const EmissionGauge = ({ value, color, max = 350 }) => {
  const radius = 75;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (Math.min(value, max) / max) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      {/* Glow Effect */}
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

const AnimationCard = ({ prediction, formData, onReset }) => {
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
      case "Excellent": return "#10b981";
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

  // ===== PREMIUM PDF GENERATION =====
  const generateAndSharePDF = () => {
    try {
      const toastId = toast.loading("Generating Premium Report...");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // Colors
      const activeColorHex = getCategoryHex();
      const [r, g, b] = getCategoryColor();
      const darkColor = "#1e293b"; // Slate 800
      const lightGray = "#f8fafc"; // Slate 50
      const textDark = "#0f172a"; // Slate 900
      const textGray = "#64748b"; // Slate 500

      // Helper for centered text
      const centerText = (text, y, size = 12, style = "normal", color = textDark) => {
        doc.setFontSize(size);
        doc.setFont("helvetica", style);
        doc.setTextColor(color);
        doc.text(text, pageWidth / 2, y, { align: "center" });
      };

      // Helper to sanitize text for jsPDF (removes unsupported chars)
      const sanitizeText = (str) => {
        if (!str) return "";
        return str
          .replace(/₂/g, "2") // Replace subscript 2
          .replace(/[^\x20-\x7E]/g, ""); // Remove non-printable ASCII
      };

      // ===== HEADER =====
      // Background header stripe
      doc.setFillColor(lightGray);
      doc.rect(0, 0, pageWidth, 60, "F");

      // App Logo / Branding
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(16, 185, 129); // Emerald 500
      doc.text("DriveGreen", margin, 25);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(textGray);
      doc.text("AI-Powered Carbon Footprint Analysis", margin, 32);

      // Date Top Right
      const date = new Date().toLocaleDateString("en-US", { 
        year: "numeric", month: "long", day: "numeric" 
      });
      doc.setFontSize(10);
      doc.text(date, pageWidth - margin, 25, { align: "right" });

      // Title
      centerText("Vehicle Emissions Report", 50, 24, "bold", textDark);

      // ===== MAIN SCORE CARD =====
      const cardTop = 75;
      const cardHeight = 55;
      
      // Card Background (Light Color Tint)
      doc.setFillColor(r, g, b); // Active classification color
      doc.setDrawColor(r, g, b); // Border color
      doc.roundedRect(margin, cardTop, pageWidth - (margin * 2), cardHeight, 3, 3, "S"); // Border
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(margin + 0.5, cardTop + 0.5, pageWidth - (margin * 2) - 1, cardHeight - 1, 3, 3, "F"); // White Fill

      // Decorative left strip
      doc.setFillColor(r, g, b);
      doc.rect(margin, cardTop, 2, cardHeight, "F"); // Small strip

      // Score Value
      doc.setFontSize(42);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b);
      doc.text(`${predicted_co2_emissions}`, margin + 20, cardTop + 25);

      // Score Unit
      doc.setFontSize(14);
      doc.setTextColor(textGray);
      doc.text("g/km CO2", margin + 20, cardTop + 40); // Fixed CO2 symbol

      // Category Badge (Right side of card)
      doc.setFillColor(r, g, b);
      doc.roundedRect(pageWidth - margin - 60, cardTop + 15, 40, 10, 2, 2, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(sanitizeText(category).toUpperCase(), pageWidth - margin - 40, cardTop + 21.5, { align: "center" });

      // Short status text
      doc.setTextColor(textGray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(category === "Excellent" || category === "Good" 
        ? "Your vehicle performs well!" 
        : "Optimization recommended.", 
        pageWidth - margin - 20, cardTop + 35, { align: "right" }
      );

      // ===== INTERPRETATION =====
      let cursorY = cardTop + cardHeight + 15;
      
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Analysis Result", margin, cursorY);
      
      cursorY += 8;
      doc.setFontSize(10); 
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#334155"); 
      
      // Clean interpretation text
      const cleanInterpretation = sanitizeText(interpretation);
      const splitInterpretation = doc.splitTextToSize(cleanInterpretation, pageWidth - (margin * 2));
      doc.text(splitInterpretation, margin, cursorY);
      cursorY += (splitInterpretation.length * 5) + 15;

      // ===== VEHICLE SPECIFICATIONS (NEW SECTION) =====
      const getFuelLabel = (code) => {
        const map = {
          "X": "Regular Gasoline",
          "Z": "Premium Gasoline",
          "E": "Ethanol (E85)",
          "D": "Diesel",
          "N": "Natural Gas"
        };
        return map[code] || "Unknown";
      };

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Vehicle Specifications", margin, cursorY);
      cursorY += 8;

      // Check if formData is available
      const fuelType = formData?.fuel_type ? getFuelLabel(formData.fuel_type) : "N/A";
      const engineSize = formData?.engine_size ? `${formData.engine_size} Liters` : "N/A";
      const cylinders = formData?.cylinders ? `${formData.cylinders} Cylinders` : "N/A";

      const specs = [
        { label: "Fuel Type", value: fuelType },
        { label: "Engine Size", value: engineSize },
        { label: "Cylinders", value: cylinders }
      ];

      doc.setFontSize(10);
      const colWidth = (pageWidth - (margin * 2)) / 3;
      
      specs.forEach((spec, i) => {
        const xPos = margin + (i * colWidth);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(textGray);
        doc.text(spec.label, xPos, cursorY);
        
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textDark);
        doc.text(sanitizeText(spec.value), xPos, cursorY + 5);
      });

      cursorY += 20;

      // ===== COMPARISON CHART =====
      if (cursorY > pageHeight - 80) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Emission Benchmarks", margin, cursorY);
      cursorY += 10;

      const comparisons = [
        { label: "Excellent (<120)", range: [0, 120], color: [16, 185, 129] },
        { label: "Good (120-160)", range: [120, 160], color: [34, 197, 94] },
        { label: "Average (160-200)", range: [160, 200], color: [245, 158, 11] },
        { label: "High (200-250)", range: [200, 250], color: [239, 68, 68] },
        { label: "Very High (>250)", range: [250, 350], color: [220, 38, 38] }
      ];

      const chartWidth = 110; 
      const chartStartX = margin + 35; 
      
      comparisons.forEach((comp, i) => {
         const isActive = category.startsWith(comp.label.split(" ")[0]);
         
         doc.setFontSize(8); 
         doc.setFont("helvetica", isActive ? "bold" : "normal");
         doc.setTextColor(isActive ? textDark : textGray);
         doc.text(comp.label, margin, cursorY);

         doc.setFillColor(241, 245, 249); 
         doc.roundedRect(chartStartX, cursorY - 3, chartWidth, 3, 1, 1, "F"); 

         const barColor = isActive ? comp.color : [203, 213, 225];
         doc.setFillColor(...barColor);
         
         const widthPercent = ((i + 1) * 20); 
         const barWidth = (chartWidth * widthPercent) / 100;
         doc.roundedRect(chartStartX, cursorY - 3, barWidth, 3, 1, 1, "F");

         if (isActive) {
            doc.setFillColor(...comp.color);
            doc.circle(chartStartX + barWidth, cursorY - 1.5, 2, "F");
            doc.setFontSize(7);
            doc.setTextColor(...comp.color);
            doc.text("YOU", chartStartX + barWidth + 4, cursorY);
         }

         cursorY += 10; 
      });

      cursorY += 10;

      // ===== RECOMMENDATIONS =====
      if (cursorY > pageHeight - 60) {
        doc.addPage();
        cursorY = 20;
      }

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Recommendations", margin, cursorY);
      cursorY += 8;

      const recommendations = getRecommendations(category);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#334155");

      recommendations.forEach((rec) => {
        doc.setFillColor(r, g, b);
        doc.circle(margin + 2, cursorY - 1, 1, "F");
        doc.text(sanitizeText(rec), margin + 8, cursorY); // Clean each recommendation
        cursorY += 6; 
      });
      
      // ===== FOOTER =====
      const footerY = pageHeight - 20;
      doc.setDrawColor(226, 232, 240); 
      doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
      
      doc.setFontSize(8);
      doc.setTextColor(textGray);
      doc.text("Generated by DriveGreen AI", margin, footerY);
      doc.text("www.drivegreen.com", pageWidth - margin, footerY, { align: "right" });

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      doc.save(`DriveGreen_Report_${timestamp}.pdf`);

      toast.dismiss(toastId);
      toast.success("Premium Report Downloaded!", {
        icon: "📄",
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
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

  // ===== UI RENDER (Second Code UI) =====
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

// Export AnimationCard as the default component to avoid wrapper background issues.
export default AnimationCard;