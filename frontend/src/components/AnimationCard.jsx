import React from "react";
import { motion } from "framer-motion";
import { FileDown, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

// Define stagger duration for children elements
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Stagger children by 0.1 seconds
      delayChildren: 0.1,   // Start staggering after 0.1 seconds
    },
  },
};

// Define animation for individual elements
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

/**
 * ===== ANIMATION CARD COMPONENT (Enhanced Design) =====
 * * Purpose: Display CO2 prediction results with enhanced, punchy animations.
 */
const AnimationCard = ({ prediction, onReset }) => {
  const { predicted_co2_emissions, interpretation, category, color } = prediction;

  // ... [getCategoryColor, getRecommendations, getCategoryIcon functions remain unchanged] ...
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

  const getCategoryIcon = () => {
    if (category === "Excellent" || category === "Good") {
      return <CheckCircle2 className="w-12 h-12 text-green-400" />;
    } else if (category === "Average") {
      return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
    } else {
      return <AlertCircle className="w-12 h-12 text-red-400" />;
    }
  };

  // The PDF generation function is complex and should remain outside of the card's animation focus.
  const generateAndSharePDF = () => {
    try {
      const toastId = toast.loading("Generating PDF...");
      const doc = new jsPDF();
      const [r, g, b] = getCategoryColor();

      // [ ... PDF content generation logic remains the same ... ]
      // ===== HELPER: GET COLOR FOR CATEGORY (copied from original) =====
      const getCategoryColor = () => {
        switch(category) {
          case "Excellent": return [16, 185, 129];   // Green
          case "Good": return [34, 197, 94];         // Light green
          case "Average": return [245, 158, 11];     // Orange
          case "High": return [239, 68, 68];         // Red
          case "Very High": return [220, 38, 38];    // Dark red
          default: return [0, 0, 0];                 // Black (fallback)
        }
      };

      // ===== HEADER SECTION =====
      doc.setFillColor(71, 85, 105);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("CO₂ Emissions Report", 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text("Vehicle Carbon Footprint Analysis", 105, 30, { align: 'center' });

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
      doc.text("CO₂ Emissions Predictor | Helping You Track Your Carbon Footprint", 105, 290, { align: 'center' });
      // [ ... End PDF content generation logic ... ]

      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `co2-emission-report-${timestamp}.pdf`;
      
      doc.save(filename);

      toast.dismiss(toastId);
      toast.success("PDF downloaded successfully! Check your downloads folder.", {
        icon: "📄",
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


  // ===== JSX RETURN (UI) - APPLYING ENHANCED ANIMATIONS =====
  return (
    <motion.div // Outer container animation for overall entrance
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
        className="text-center"
      >
        {/* ===== ANIMATED ICON (Item 1) ===== */}
        <motion.div
          variants={itemVariants}
          className="inline-block mb-6"
          animate={{ 
            scale: [1, 1.1, 1],      // Pulse effect
            rotate: [0, 5, -5, 0]    // Wiggle effect
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3           
          }}
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            {getCategoryIcon()}
          </div>
        </motion.div>

        {/* ===== HEADER TEXT (Item 2 & 3) ===== */}
        <motion.h2 
          variants={itemVariants}
          className="text-2xl font-bold text-white mb-2"
        >
          Prediction Complete!
        </motion.h2>
        <motion.p 
          variants={itemVariants}
          className="text-gray-300 text-sm mb-6"
        >
          Here's your vehicle's estimated carbon footprint
        </motion.p>

        {/* ===== CO2 VALUE BOX (Item 4) ===== */}
        <motion.div
          variants={itemVariants}
          className="my-8 p-6 rounded-xl bg-white/5"
          // Pulsing glow effect using the category color
          animate={{ 
            boxShadow: [
              `0 0 20px ${color}40`,  
              `0 0 40px ${color}60`,  
              `0 0 20px ${color}40`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4 }} // Start glow later
        >
          {/* CO2 number with punchier scale animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 10, delay: 0.5 }} // Over-shoot effect (stiffer spring)
          >
            <div className="text-7xl font-bold mb-2" style={{ color }}>
              {predicted_co2_emissions}
            </div>
            <div className="text-gray-300 text-xl">g/km</div>
          </motion.div>
        </motion.div>

        {/* ===== CATEGORY BADGE (Item 5) ===== */}
        <motion.div
          variants={itemVariants}
          className="inline-block px-6 py-2 rounded-full mb-6"
          style={{ 
            backgroundColor: `${color}20`,  
            border: `2px solid ${color}`
          }}
        >
          <span className="font-semibold text-lg" style={{ color }}>
            {category}
          </span>
        </motion.div>

        {/* ===== INTERPRETATION BOX (Item 6) ===== */}
        <motion.div
          variants={itemVariants}
          className="p-6 rounded-xl mb-6 bg-white/5 border-l-4"
          style={{ borderColor: color }}
        >
          <p className="text-gray-200 text-base leading-relaxed">
            {interpretation}
          </p>
        </motion.div>

        {/* ===== ACTION BUTTONS (Item 7 & 8) ===== */}
        <motion.div 
          className="space-y-3"
          variants={containerVariants} // Use container for button stagger
        >
          {/* Reset Button */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Make Another Prediction
          </motion.button>
          
          {/* PDF Download Button - Added Ping Effect on Click */}
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateAndSharePDF} 
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold border border-white/30 transition-all flex items-center justify-center gap-2 relative overflow-hidden"
          >
            <FileDown className="w-5 h-5" />
            Share Result (PDF)
            {/* Ping effect overlay */}
            <motion.div 
              className="absolute inset-0 bg-white/50 rounded-lg"
              initial={{ scale: 0, opacity: 0 }}
              whileTap={{ 
                scale: 2, 
                opacity: 0, 
                transition: { duration: 0.5, ease: "easeOut" } 
              }}
            />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnimationCard;