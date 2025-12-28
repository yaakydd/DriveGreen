import React from "react";
import { motion } from "framer-motion";
import { FileDown, RefreshCw, FileText } from "lucide-react";
import jsPDF from "jspdf";
import toast, { Toaster } from "react-hot-toast";

// ===== GAUGE COMPONENT =====
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

  // ===== PREMIUM PDF GENERATION (REVERTED & REFINED) =====
  const generateAndSharePDF = () => {
    try {
      const toastId = toast.loading("Generating Report...");
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;

      // --- THEME ---
      // Original Dark/Green Theme
      const themeColors = {
        bg: [2, 6, 23],        // #020617
        cardBg: [15, 23, 42],  // #0f172a
        accent: [16, 185, 129],// #10b981
        text: [248, 250, 252], // #f8fafc
        textDim: [148, 163, 184] // #94a3b8
      };

      const [r, g, b] = getCategoryColor();

      const sanitizeText = (str) => {
        if (!str) return "";
        return str.replace(/₂/g, "2").replace(/[^\x20-\x7E]/g, "");
      };

      // --- COVER PAGE ---
      const drawCover = () => {
        doc.setFillColor(...themeColors.bg);
        doc.rect(0, 0, pageWidth, pageHeight, "F");

        // Accents
        doc.setFillColor(...themeColors.accent);
        doc.setGState(new doc.GState({ opacity: 0.1 }));
        doc.circle(0, 0, 100, "F");
        doc.circle(pageWidth, pageHeight * 0.4, 80, "F");
        doc.circle(0, pageHeight, 120, "F");
        doc.setGState(new doc.GState({ opacity: 1.0 }));

        // Strip
        doc.setFillColor(...themeColors.accent);
        doc.rect(margin, margin, 4, pageHeight - (margin * 2), "F");

        // Title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(48);
        doc.setTextColor(...themeColors.text);
        doc.text("DRIVE", margin + 15, 120);
        doc.text("GREEN", margin + 15, 140);

        // Date
        const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        doc.setFontSize(14);
        doc.setTextColor(...themeColors.textDim);
        doc.text(`Generated on ${date}`, margin + 15, 180);

        // Footer
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...themeColors.text);
        doc.text("DRIVEGREEN AI", margin + 15, pageHeight - margin - 10);
      };

      // --- CONTENT PAGE ---
      const drawContent = () => {
        doc.addPage();
        
        // Header
        doc.setFillColor(...themeColors.cardBg);
        doc.rect(0, 0, pageWidth, 40, "F");
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...themeColors.accent);
        doc.text("DriveGreen", margin, 20);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...themeColors.textDim);
        doc.text("Carbon Footprint Report", margin, 26);
        
        const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
        doc.text(date, pageWidth - margin, 20, { align: "right" });

        // Colors for body
        const textDark = "#0f172a"; 
        const textGray = "#64748b";

        // Main Title
        doc.setFontSize(24);
        doc.setTextColor(textDark);
        doc.text("Carbon Footprint Report", pageWidth / 2, 60, { align: "center" });

        let cursorY = 75;

        // 1. SCORE CARD
        const cardHeight = 55; // Reduced height
        doc.setFillColor(255, 255, 255); 
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.5);
        doc.roundedRect(margin, cursorY, pageWidth - (margin * 2), cardHeight, 4, 4, "FD");
        
        doc.setFillColor(r, g, b);
        doc.rect(margin, cursorY, 4, cardHeight, "F"); 

        doc.setFontSize(42); // Slightly smaller
        doc.setFont("helvetica", "bold");
        doc.setTextColor(r, g, b);
        doc.text(`${predicted_co2_emissions}`, margin + 25, cursorY + 25);
        
        doc.setFontSize(12);
        doc.setTextColor(textGray);
        doc.text("g/km", margin + 25, cursorY + 40);

        // Badge
        doc.setFillColor(r, g, b);
        doc.roundedRect(pageWidth - margin - 65, cursorY + 15, 45, 10, 5, 5, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(sanitizeText(category).toUpperCase(), pageWidth - margin - 42.5, cursorY + 21, { align: "center" });

        doc.setTextColor(textGray);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        const statusText = category === "Excellent" || category === "Good" ? "Performing well!" : "Optimization needed.";
        doc.text(statusText, pageWidth - margin - 42.5, cursorY + 35, { align: "center" });

        cursorY += cardHeight + 15;

        // 2. VEHICLE SPECS (New Grid Design) - Placed BEFORE Analysis
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textDark);
        doc.text("Vehicle Specifications", margin, cursorY);
        cursorY += 8;

        const getFuelLabel = (code) => {
            const map = { "X": "Regular Gas", "Z": "Premium Gas", "E": "Ethanol", "D": "Diesel", "N": "Natural Gas" };
            return map[code] || code;
        };
        const specs = [
            { l: "FUEL TYPE", v: getFuelLabel(formData.fuel_type) },
            { l: "CYLINDERS", v: formData.cylinders },
            { l: "ENGINE SIZE", v: formData.engine_size + " L" }
        ];

        let gridX = margin;
        const boxWidth = (pageWidth - (margin * 2) - 10) / 3; // Tight spacing
        
        specs.forEach((item) => {
            doc.setFillColor(248, 250, 252); // Light gray
            doc.roundedRect(gridX, cursorY, boxWidth, 20, 2, 2, "F");
            
            doc.setFontSize(8);
            doc.setTextColor(textGray);
            doc.text(item.l, gridX + 5, cursorY + 8);
            
            doc.setFontSize(11);
            doc.setTextColor(textDark);
            doc.setFont("helvetica", "bold");
            doc.text(String(item.v), gridX + 5, cursorY + 16);
            
            gridX += boxWidth + 5;
        });
        cursorY += 30;

        // 3. ANALYSIS RESULT
        doc.setFontSize(14);
        doc.setTextColor(textDark);
        doc.setFont("helvetica", "bold");
        doc.text("Analysis Result", margin, cursorY);
        cursorY += 8;
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor("#334155");
        const cleanInterpretation = sanitizeText(interpretation);
        const splitText = doc.splitTextToSize(cleanInterpretation, pageWidth - (margin * 2));
        doc.text(splitText, margin, cursorY);
        cursorY += (splitText.length * 5) + 15; 

        // 4. RECOMMENDATIONS
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textDark);
        doc.text("Recommendations", margin, cursorY);
        cursorY += 8;

        const recs = getRecommendations(category);
        recs.forEach(rec => {
            doc.setFillColor(...themeColors.accent);
            doc.circle(margin + 2, cursorY - 1.5, 1.5, "F");
            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.setTextColor("#334155");
            doc.text(sanitizeText(rec), margin + 8, cursorY);
            cursorY += 6; // Tight spacing
        });
        cursorY += 10;

        // 5. EMISSION BENCHMARKS (Placed AFTER Recommendations)
        // Ensure it fits
        if (cursorY + 40 > pageHeight) { 
            // If strictly one page, we might squash it or it sits at bottom
            // Let's rely on concise spacing above.
        }

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(textDark);
        doc.text("Emission Benchmarks", margin, cursorY);
        cursorY += 10;

        const ranges = [
            { l: "Exc (<120)", w: 30, c: [16, 185, 129] },
            { l: "Good", w: 20, c: [34, 197, 94] },
            { l: "Avg", w: 20, c: [245, 158, 11] },
            { l: "High", w: 15, c: [239, 68, 68] },
            { l: "V.High", w: 15, c: [220, 38, 38] }
        ];

        let barX = margin;
        const totalBarWidth = pageWidth - (margin * 2);
        
        ranges.forEach((range, i) => {
             const segWidth = (totalBarWidth * range.w) / 100;
             doc.setFillColor(...range.c);
             doc.rect(barX, cursorY, segWidth, 6, "F");
             
             // Legend below bar
             doc.setFontSize(7);
             doc.setTextColor(textGray);
             doc.text(range.l, barX, cursorY + 9);
             
             barX += segWidth;
        });

        // Marker
        const percentage = Math.min(Math.max(predicted_co2_emissions, 0), 350) / 350;
        const markerX = margin + (totalBarWidth * percentage);
        doc.setFillColor(r, g, b);
        doc.triangle(markerX, cursorY - 1, markerX - 3, cursorY - 5, markerX + 3, cursorY - 5, "F");
        doc.setFontSize(8);
        doc.setTextColor(r, g, b);
        doc.text("YOU", markerX, cursorY - 7, { align: "center" });

        // Footer
        doc.setDrawColor(226, 232, 240);
        doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        doc.setFontSize(8);
        doc.setTextColor("#94a3b8");
        doc.text("DriveGreen AI Analysis - Drive towards a greener future.", margin, pageHeight - 10);
      };

      // --- BACK PAGE ---
      const drawBackPage = () => {
        doc.addPage();
        drawCover(); // Use same style as cover
        
        // Overlay to change text
        doc.setFillColor(...themeColors.bg);
        doc.rect(margin, 100, pageWidth - (margin * 2), 200, "F"); // Mask previous text areas
        
        // Re-draw center text
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
      };

      // --- EXECUTE ---
      drawCover();
      drawContent(); // Single page content
      drawBackPage(); // Restored Back Page

      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      doc.save(`DriveGreen_Report_${timestamp}.pdf`);
      
      toast.dismiss(toastId);
      toast.success("Report Ready!");

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