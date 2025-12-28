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
  // ===== PREMIUM PDF GENERATION =====
  const generateAndSharePDF = () => {
    try {
      const toastId = toast.loading("Generating Premium Report...");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // Theme Colors
      const themeColors = {
        bg: [2, 6, 23],        // #020617 (Deepest Night)
        cardBg: [15, 23, 42],  // #0f172a (Slate 900)
        accent: [16, 185, 129],// #10b981 (Emerald 500) - Primary
        accentLight: [52, 211, 153], // #34d399 (Emerald 400)
        text: [248, 250, 252], // #f8fafc (Slate 50)
        textDim: [148, 163, 184] // #94a3b8 (Slate 400)
      };

      const [r, g, b] = getCategoryColor();

      // Sanitizer
      const sanitizeText = (str) => {
        if (!str) return "";
        return str.replace(/₂/g, "2").replace(/[^\x20-\x7E]/g, "");
      };

      // Helper: Draw Background
      const drawDarkBackground = () => {
        doc.setFillColor(...themeColors.bg);
        doc.rect(0, 0, pageWidth, pageHeight, "F");
      };

      // Helper: Draw Decorative Accents
      const drawAccents = () => {
        // Abstract Curves/Circles
        doc.setFillColor(...themeColors.accent);
        doc.setGState(new doc.GState({ opacity: 0.1 })); // Low opacity
        doc.circle(0, 0, 100, "F"); // Top-left corner
        doc.circle(pageWidth, pageHeight * 0.4, 80, "F"); // Right side
        doc.circle(0, pageHeight, 120, "F"); // Bottom-left
        doc.setGState(new doc.GState({ opacity: 1.0 })); // Reset opacity
      };

      // ===== COVER PAGE =====
      drawDarkBackground();
      drawAccents();

      // Decorative Strip
      doc.setFillColor(...themeColors.accent);
      doc.rect(margin, margin, 4, pageHeight - (margin * 2), "F");

      // Title Section
      doc.setFont("helvetica", "bold");
      doc.setFontSize(48);
      doc.setTextColor(...themeColors.text);
      doc.text("CARBON", margin + 15, 120);
      doc.text("FOOTPRINT", margin + 15, 140);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(32);
      doc.setTextColor(...themeColors.accentLight);
      doc.text("REPORT", margin + 15, 160);

      // Date & Meta
      const date = new Date().toLocaleDateString("en-US", { 
        year: "numeric", month: "long", day: "numeric" 
      });
      doc.setFontSize(14);
      doc.setTextColor(...themeColors.textDim);
      doc.text(`Generated on ${date}`, margin + 15, 180);

      // Bottom Branding
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...themeColors.text);
      doc.text("DRIVEGREEN AI", margin + 15, pageHeight - margin - 10);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...themeColors.textDim);
      doc.text("Advanced Environmental Analysis", margin + 15, pageHeight - margin - 5);

      // ===== INTERNAL CONTENT PAGE =====
      doc.addPage();
      
      // Header Background (Slightly Lighter Dark)
      doc.setFillColor(...themeColors.cardBg);
      doc.rect(0, 0, pageWidth, 40, "F");
      
      // Header Text
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...themeColors.accent);
      doc.text("DriveGreen", margin, 20);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...themeColors.textDim);
      doc.text("Carbon Footprint Report", margin, 26);
      
      doc.text(date, pageWidth - margin, 20, { align: "right" });

      // Title
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(23, 23, 23); // Dark Text for white body usually, but let's keep it standard PDF white theme mostly or customizing?
      // Wait, standard PDF usually has white background for readability. 
      // User asked for "match design of project" which is dark.
      // Let's TRY to make the PDF content pages "Light Mode" for printability BUT heavily branded, 
      // OR full Dark Mode. 
      // Standard reports are white. Let's stick to WHITE body for readability but GREEN/DARK accents.
      // Re-reading user request: "match the design of the project". Project is DARK mode.
      // RISK: Printing dark PDFs uses tons of ink. 
      // COMPROMISE: White background for content, but deep headers/footers.
      // Actually, let's stick to the previous white-bg content logic but use the new colors.
      
      // Reset logic for white content page to be safe & readable
      const textDark = "#0f172a"; 
      const textGray = "#64748b";
      
      doc.setFontSize(24);
      doc.setTextColor(textDark);
      doc.text("Vehicle Emissions Analysis", pageWidth / 2, 60, { align: "center" });

      // ===== MAIN SCORE CARD =====
      const cardTop = 75;
      const cardHeight = 60;
      
      // Card Container
      // White fill, Colored Border
      doc.setFillColor(255, 255, 255); 
      doc.setDrawColor(r, g, b); // Border matches category color
      doc.setLineWidth(0.5);
      doc.roundedRect(margin, cardTop, pageWidth - (margin * 2), cardHeight, 4, 4, "FD"); // Fill and Draw
      
      // Thick Left Accent Strip
      doc.setFillColor(r, g, b); // Category color
      doc.rect(margin, cardTop, 4, cardHeight, "F"); 
      // Note: "F" fills without border, effectively overlaying the left side of the rounded rect. 
      // To keep rounded corners on the left, we might need a clip path or just overlay a rect. 
      // Ideally, for a "strip" look, a simple rect on top of the left edge works fine visually.

      // Score Value
      doc.setFontSize(48);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(r, g, b); // Colored Score
      doc.text(`${predicted_co2_emissions}`, margin + 25, cardTop + 28);
      
      // Score Unit
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold"); // Slightly bolder for readability
      doc.setTextColor(textGray);
      doc.text("g/km CO2", margin + 25, cardTop + 45);

      // Category Badge (Right side of card)
      doc.setFillColor(r, g, b);
      doc.roundedRect(pageWidth - margin - 75, cardTop + 20, 55, 12, 6, 6, "F"); // Pill shape
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text(sanitizeText(category).toUpperCase(), pageWidth - margin - 47.5, cardTop + 28, { align: "center" });

      // Short status text
      const statusText = category === "Excellent" || category === "Good" 
        ? "Your vehicle performs well!" 
        : "Optimization recommended.";
        
      doc.setTextColor(textGray);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(statusText, pageWidth - margin - 47.5, cardTop + 42, { align: "center" });

      // ===== INTERPRETATION =====
      let cursorY = cardTop + cardHeight + 20;
      doc.setFontSize(16);
      doc.setTextColor(textDark);
      doc.setFont("helvetica", "bold");
      doc.text("Analysis Result", margin, cursorY);
      
      cursorY += 10;
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor("#334155");
      const cleanInterpretation = sanitizeText(interpretation);
      const splitText = doc.splitTextToSize(cleanInterpretation, pageWidth - (margin * 2));
      doc.text(splitText, margin, cursorY);
      
      cursorY += (splitText.length * 6) + 10;

      // Specs
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Vehicle Specifications", margin, cursorY);
      cursorY += 10;
      
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

      const fuel = formData?.fuel_type ? getFuelLabel(formData.fuel_type) : "N/A";
      const engine = formData?.engine_size ? formData.engine_size + "L" : "N/A";
      const cyl = formData?.cylinders ? formData.cylinders + " Cylinders" : "N/A";
      
      const specs = [
        { l: "Fuel Type", v: fuel },
        { l: "Engine Size", v: engine },
        { l: "Cylinders", v: cyl }
      ];
      
      specs.forEach((item, i) => {
         const x = margin + (i * 55); // Increased spacing
         doc.setFontSize(10);
         doc.setTextColor("#64748b");
         doc.text(item.l, x, cursorY);
         doc.setFontSize(12);
         doc.setTextColor(textDark);
         doc.text(sanitizeText(String(item.v)), x, cursorY + 6);
      });
      cursorY += 25;

      // ===== BENCHMARKS CHART =====
      if (cursorY > pageHeight - 100) { doc.addPage(); cursorY = 20; }

      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Emission Benchmarks", margin, cursorY);
      cursorY += 12;

      const comparisons = [
        { label: "Excellent (<120)", range: [0, 120], color: [16, 185, 129] },
        { label: "Good (120-160)", range: [120, 160], color: [34, 197, 94] },
        { label: "Average (160-200)", range: [160, 200], color: [245, 158, 11] },
        { label: "High (200-250)", range: [200, 250], color: [239, 68, 68] },
        { label: "Very High (>250)", range: [250, 350], color: [220, 38, 38] }
      ];

      const chartWidth = 110; 
      const chartStartX = margin + 45; 
      
      comparisons.forEach((comp, i) => {
         const isActive = category.startsWith(comp.label.split(" ")[0]);
         
         doc.setFontSize(9); 
         doc.setFont("helvetica", isActive ? "bold" : "normal");
         doc.setTextColor(isActive ? textDark : "#94a3b8");
         doc.text(comp.label, margin, cursorY);

         // Bar Background
         doc.setFillColor(241, 245, 249); 
         doc.roundedRect(chartStartX, cursorY - 3, chartWidth, 4, 1, 1, "F"); 

         // Progress Bar
         const barColor = isActive ? comp.color : [203, 213, 225];
         doc.setFillColor(...barColor);
         const widthPercent = ((i + 1) * 20); 
         const barWidth = (chartWidth * widthPercent) / 100;
         doc.roundedRect(chartStartX, cursorY - 3, barWidth, 4, 1, 1, "F");

         // "YOU" Indicator
         if (isActive) {
            doc.setFillColor(...comp.color);
            doc.circle(chartStartX + barWidth, cursorY - 1, 3, "F");
            doc.setFontSize(8);
            doc.setTextColor(...comp.color);
            doc.text("YOU", chartStartX + barWidth + 5, cursorY);
         }

         cursorY += 12; 
      });

      cursorY += 10;

      // Recommendations
      if (cursorY > pageHeight - 60) { doc.addPage(); cursorY = 20; }
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(textDark);
      doc.text("Recommendations", margin, cursorY);
      cursorY += 10;

      const recs = getRecommendations(category);
      recs.forEach(rec => {
        doc.setFillColor(...themeColors.accent);
        doc.circle(margin + 2, cursorY - 2, 2, "F");
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#334155");
        doc.text(sanitizeText(rec), margin + 8, cursorY);
        cursorY += 8;
      });

      // Footer
      const footerY = pageHeight - 15;
      doc.setDrawColor(226, 232, 240);
      doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
      doc.setFontSize(9);
      doc.setTextColor("#94a3b8");
      doc.text("DriveGreen AI Analysis", margin, footerY);

      // ===== BACK PAGE =====
      doc.addPage();
      drawDarkBackground();
      drawAccents(); // Re-apply background
      
      // Centered Message
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...themeColors.text);
      doc.text("Driving Towards", pageWidth / 2, pageHeight / 2 - 10, { align: "center" });
      
      doc.setTextColor(...themeColors.accent);
      doc.text("A Greener Future", pageWidth / 2, pageHeight / 2 + 5, { align: "center" });

      // URL
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...themeColors.textDim);
      doc.text("www.drivegreen.com", pageWidth / 2, pageHeight - 30, { align: "center" });

      // Save
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      doc.save(`DriveGreen_Report_${timestamp}.pdf`);
      
      toast.dismiss(toastId);
      toast.success("Report Downloaded Successfully!");

    } catch (error) {
      console.error(error);
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