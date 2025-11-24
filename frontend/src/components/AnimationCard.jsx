import React from "react";
import { motion } from "framer-motion";
import { FileDown, RefreshCw, CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

/**
 * ===== ANIMATION CARD COMPONENT =====
 * 
 * Purpose: Display CO2 prediction results with PDF export
 * 
 * Features:
 * - Animated result display
 * - Color-coded categories (green=good, red=bad)
 * - PDF export with recommendations
 * - Reset button for new predictions
 * 
 * Props:
 * - prediction: Object containing CO2 data from API
 * - onReset: Function to call when user wants new prediction
 */
const AnimationCard = ({ prediction, onReset }) => {
  // ===== EXTRACT DATA FROM PREDICTION =====
  const { predicted_co2_emissions, interpretation, category, color } = prediction;

  /**
   * ===== DIRECT PDF DOWNLOAD (NO ALERT) =====
   * 
   * What this function does:
   * =======================
   * 1. Creates PDF document with jsPDF
   * 2. Adds header with title and date
   * 3. Displays CO2 value with color-coded styling
   * 4. Shows category badge
   * 5. Includes interpretation text
   * 6. Adds recommendations based on category
   * 7. Creates comparison chart
   * 8. Saves PDF with timestamp filename
   * 9. ✅ DIRECTLY triggers browser download (NO ALERT)
   * 
   * User Experience:
   * ================
   * Click "Share Result (PDF)" 
   *   ↓
   * Toast: "Generating PDF..."
   *   ↓
   * Browser "Save As" dialog appears
   *   ↓
   * User chooses location → clicks "Save"
   *   ↓
   * PDF downloads
   *   ↓
   * Toast: "PDF downloaded successfully!"
   * 
   * ✅ NO annoying "OK" alert!
   */
  const generateAndSharePDF = () => {
    try {
      // Show loading toast
      const toastId = toast.loading("Generating PDF...");

      // ===== CREATE NEW PDF DOCUMENT =====
      // jsPDF creates A4 size (210mm x 297mm) by default
      const doc = new jsPDF();
      
      // ===== HELPER: GET COLOR FOR CATEGORY =====
      // Converts category string to RGB color array for jsPDF
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
      // Dark gray header bar across top
      doc.setFillColor(71, 85, 105);  // RGB: Dark gray
      doc.rect(0, 0, 210, 40, 'F');   // x, y, width, height, 'F'=filled
      
      // Title text (white, centered)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont(undefined, 'bold');
      doc.text("CO₂ Emissions Report", 105, 20, { align: 'center' });
      
      // Subtitle
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text("Vehicle Carbon Footprint Analysis", 105, 30, { align: 'center' });

      // ===== DATE =====
      // Format: "January 15, 2024"
      const date = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      doc.setTextColor(100, 100, 100);  // Gray
      doc.setFontSize(10);
      doc.text(`Generated: ${date}`, 105, 50, { align: 'center' });

      // ===== MAIN RESULT BOX =====
      // Large box showing CO2 value
      const [r, g, b] = getCategoryColor();
      
      // Draw rounded rectangle with category color
      doc.setFillColor(r, g, b, 0.1);      // 10% opacity background
      doc.setDrawColor(r, g, b);            // Border color
      doc.setLineWidth(2);                  // 2pt border
      doc.roundedRect(20, 60, 170, 50, 5, 5, 'FD');  // 'FD' = Fill + Draw
      
      // CO2 value (large, colored number)
      doc.setTextColor(r, g, b);
      doc.setFontSize(48);
      doc.setFont(undefined, 'bold');
      doc.text(`${predicted_co2_emissions}`, 105, 90, { align: 'center' });
      
      // Unit (smaller, gray)
      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("g/km", 105, 100, { align: 'center' });

      // ===== CATEGORY BADGE =====
      // Rounded badge showing "Excellent", "Good", etc.
      doc.setFillColor(r, g, b);           // Solid category color
      doc.roundedRect(70, 115, 70, 12, 3, 3, 'F');
      doc.setTextColor(255, 255, 255);     // White text
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(category, 105, 123, { align: 'center' });

      // ===== INTERPRETATION SECTION =====
      doc.setTextColor(0, 0, 0);           // Black
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text("Environmental Impact Assessment:", 20, 145);
      
      // Interpretation text (wrapped to fit page)
      doc.setFontSize(11);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(60, 60, 60);        // Dark gray
      
      // splitTextToSize() wraps long text to fit width
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
      
      // Get recommendations based on category
      const recommendations = getRecommendations(category);
      let yPosition = 200;
      
      // Add each recommendation as numbered list
      recommendations.forEach((rec, index) => {
        const recText = doc.splitTextToSize(`${index + 1}. ${rec}`, 165);
        doc.text(recText, 25, yPosition);
        yPosition += recText.length * 6;  // Move down for next item
      });

      // ===== COMPARISON CHART =====
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text("Emission Comparison:", 20, yPosition + 5);
      
      yPosition += 15;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      
      // Define comparison categories
      const comparisons = [
        { label: "Excellent (<120 g/km)", bar: category === "Excellent", color: [16, 185, 129] },
        { label: "Good (120-160 g/km)", bar: category === "Good", color: [34, 197, 94] },
        { label: "Average (160-200 g/km)", bar: category === "Average", color: [245, 158, 11] },
        { label: "High (200-250 g/km)", bar: category === "High", color: [239, 68, 68] },
        { label: "Very High (>250 g/km)", bar: category === "Very High", color: [220, 38, 38] }
      ];

      // Draw bars for each category
      comparisons.forEach((comp) => {
        doc.setTextColor(60, 60, 60);
        doc.text(comp.label, 25, yPosition);
        
        if (comp.bar) {
          // This is the user's category - draw long colored bar
          doc.setFillColor(...comp.color);
          doc.rect(100, yPosition - 3, 60, 4, 'F');
          doc.setFontSize(8);
          doc.setTextColor(...comp.color);
          doc.text("← YOUR VEHICLE", 165, yPosition);
          doc.setFontSize(9);
        } else {
          // Other categories - draw short gray bar
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

      // ===== SAVE PDF (DIRECT DOWNLOAD) =====
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
      const filename = `co2-emission-report-${timestamp}.pdf`;
      
      // ✅ DIRECT DOWNLOAD - NO ALERT!
      // save() triggers browser's "Save As" dialog immediately
      doc.save(filename);

      // Dismiss loading toast
      toast.dismiss(toastId);

      // Show success toast
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

  /**
   * ===== GET RECOMMENDATIONS =====
   * 
   * Returns array of recommendations based on emission category
   * 
   * Logic:
   * ======
   * - Excellent: Maintain good habits
   * - Good: Minor improvements
   * - Average: Consider efficiency upgrades
   * - High: Evaluate vehicle choice
   * - Very High: Switch to efficient vehicle
   */
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

  /**
   * ===== GET CATEGORY ICON =====
   * 
   * Returns appropriate icon based on category
   * 
   * Icons:
   * ======
   * - Excellent/Good: CheckCircle (green checkmark)
   * - Average: AlertTriangle (yellow warning)
   * - High/Very High: AlertCircle (red alert)
   */
  const getCategoryIcon = () => {
    if (category === "Excellent" || category === "Good") {
      return <CheckCircle2 className="w-12 h-12 text-green-400" />;
    } else if (category === "Average") {
      return <AlertTriangle className="w-12 h-12 text-yellow-400" />;
    } else {
      return <AlertCircle className="w-12 h-12 text-red-400" />;
    }
  };

  // ===== JSX RETURN (UI) =====
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="text-center"
      >
        {/* ===== ANIMATED ICON ===== */}
        <motion.div
          className="inline-block mb-6"
          animate={{ 
            scale: [1, 1.1, 1],      // Pulse effect
            rotate: [0, 5, -5, 0]    // Wiggle effect
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3           // 3 second pause between animations
          }}
        >
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center">
            {getCategoryIcon()}
          </div>
        </motion.div>

        {/* ===== HEADER TEXT ===== */}
        <h2 className="text-2xl font-bold text-white mb-2">
          Prediction Complete!
        </h2>
        <p className="text-gray-300 text-sm mb-6">
          Here's your vehicle's estimated carbon footprint
        </p>

        {/* ===== CO2 VALUE BOX ===== */}
        <motion.div
          className="my-8 p-6 rounded-xl bg-white/5"
          // Pulsing glow effect using the category color
          animate={{ 
            boxShadow: [
              `0 0 20px ${color}40`,  // 40 = 40% opacity
              `0 0 40px ${color}60`,  // 60 = 60% opacity
              `0 0 20px ${color}40`
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {/* CO2 number with gentle scale animation */}
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <div className="text-7xl font-bold mb-2" style={{ color }}>
              {predicted_co2_emissions}
            </div>
            <div className="text-gray-300 text-xl">g/km</div>
          </motion.div>
        </motion.div>

        {/* ===== CATEGORY BADGE ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-block px-6 py-2 rounded-full mb-6"
          style={{ 
            backgroundColor: `${color}20`,  // 20% opacity background
            border: `2px solid ${color}`
          }}
        >
          <span className="font-semibold text-lg" style={{ color }}>
            {category}
          </span>
        </motion.div>

        {/* ===== INTERPRETATION BOX ===== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-xl mb-6 bg-white/5 border-l-4"
          style={{ borderColor: color }}
        >
          <p className="text-gray-200 text-base leading-relaxed">
            {interpretation}
          </p>
        </motion.div>

        {/* ===== ACTION BUTTONS ===== */}
        <div className="space-y-3">
          {/* Reset Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-5 h-5" />
            Make Another Prediction
          </motion.button>
          
          {/* PDF Download Button - ✅ NO ALERT */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateAndSharePDF}  // ← Direct download function
            className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-semibold border border-white/30 transition-all flex items-center justify-center gap-2"
          >
            <FileDown className="w-5 h-5" />
            Share Result (PDF)
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimationCard;

/**
 * ===== WHAT THIS FILE DOES =====
 * 
 * High-Level Overview:
 * ====================
 * This component displays CO2 prediction results from the backend API
 * and allows users to download a detailed PDF report.
 * 
 * Main Features:
 * ==============
 * 1. Animated result display with category-specific colors
 * 2. Category badge (Excellent, Good, Average, High, Very High)
 * 3. Interpretation text explaining the result
 * 4. PDF generation with comprehensive report
 * 5. Direct download (no alert popups)
 * 
 * User Flow:
 * ==========
 * 1. User fills form → submits → sees spinner
 * 2. API returns prediction → AnimationCard appears
 * 3. Shows CO2 value with animated effects
 * 4. User can:
 *    a) Click "Make Another Prediction" → resets form
 *    b) Click "Share Result (PDF)" → downloads PDF report
 * 
 * PDF Report Contents:
 * ====================
 * - Header with title and date
 * - Large CO2 value display
 * - Category badge
 * - Environmental impact assessment
 * - Personalized recommendations
 * - Comparison chart showing where vehicle falls
 * - Footer with branding
 * 
 * Technical Details:
 * ==================
 * - Uses jsPDF library for PDF generation
 * - Framer Motion for animations
 * - Lucide React for icons
 * - React Hot Toast for notifications
 * - No external API calls (all client-side PDF generation)
 * 
 * Props:
 * ======
 * prediction: {
 *   predicted_co2_emissions: 139.86,
 *   category: "Good",
 *   interpretation: "Good! This vehicle...",
 *   color: "#22c55e"
 * }
 * onReset: () => { // function to reset form }
 * 
 * Dependencies:
 * =============
 * npm install jspdf framer-motion lucide-react react-hot-toast
 */