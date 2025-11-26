// ===== FIXED PREDICTION FORM =====
// File: frontend/src/components/PredictionForm.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Fuel, Car, Sparkles } from "lucide-react";
//import Spinner from "./Spinner";
//import AnimationCard from "./AnimationCard";
import NeonCar from "./NeonCar";
import DriveGreenLogo from "./DriveGreenLogo";
//import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * ===== NEW COLOR SCHEME =====
 * 
 * Fun, Catchy, Professional:
 * - Primary: Emerald (#10B981) - Eco-friendly, vibrant
 * - Secondary: Teal (#14B8A6) - Fresh, modern
 * - Accent: Cyan (#06B6D4) - Tech, futuristic
 * - Success: Lime (#84CC16) - Positive results
 * - Warning: Amber (#F59E0B) - Attention
 * - Danger: Orange-Red (#F97316) - High emissions
 * 
 * Background: Dark gradient (professional)
 * Text: White/Gray (high contrast)
 */

const PredictionForm = () => {
  // State for form input values
  const [formData, setFormData] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: ""
  });
  
  // State for prediction results
  const [prediction, setPrediction] = useState(null);
  
  // State for loading indicator
  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handle form submission (simulated with timeout)
  const handleSubmit = () => {
    // Validate all fields are filled
    if (!formData.fuel_type || !formData.cylinders || !formData.engine_size) {
      return; // Exit if validation fails
    }
    
    setLoading(true);      // Show loading state
    setPrediction(null);   // Clear previous results

    // Simulate API call with 2-second delay
    setTimeout(() => {
      setPrediction({
        co2_emissions: 245.7,
        rating: "Moderate"
      });
      setLoading(false);  // Hide loading state
    }, 2000);
  };

  // Reset form to initial state
  const handleReset = () => {
    setPrediction(null);
    setFormData({ fuel_type: "", cylinders: "", engine_size: "" });
  };

  return (
    // Main container: Full screen with dark gradient background
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-gray-900 to-slate-950">
      
      {/* ===== AMBIENT BACKGROUND GLOWS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Left green glow */}
        <div 
          className="absolute inset-0 bg-emerald-600/25 blur-[140px] opacity-20" 
          style={{ clipPath: 'ellipse(55% 65% at 25% 45%)' }}
        />
        
        {/* Right cyan glow */}
        <div 
          className="absolute inset-0 bg-cyan-500/25 blur-[140px] opacity-20" 
          style={{ clipPath: 'ellipse(55% 65% at 75% 55%)' }}
        />
        
        {/* Top teal accent */}
        <div 
          className="absolute inset-0 bg-teal-400/20 blur-[120px] opacity-15" 
          style={{ clipPath: 'ellipse(60% 40% at 50% 15%)' }}
        />
      </div>

      {/* Animated car background */}
      <NeonCar />

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {/* AnimatePresence enables exit animations */}
        <AnimatePresence mode="wait">
          
          {/* ===== LOADING STATE ===== */}
          {loading ? (
            <motion.div 
              key="spinner" 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-white text-3xl font-bold flex flex-col items-center gap-6"
            >
              {/* Rotating icon animation */}
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Activity className="w-20 h-20 text-emerald-400" />
              </motion.div>
              
              {/* Loading text with subtle pulse */}
              <motion.span
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                Analyzing Vehicle Data...
              </motion.span>
            </motion.div>
          
          // ===== RESULTS STATE =====
          ) : prediction ? (
            <motion.div 
              key="result" 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-14 max-w-2xl w-full text-center shadow-2xl"
            >
              {/* Success icon with bounce animation */}
              <motion.div 
                animate={{ scale: [1, 1.15, 1] }} 
                transition={{ duration: 0.6, repeat: 2 }}
              >
                <Leaf className="w-24 h-24 text-green-600 mx-auto mb-6" />
              </motion.div>
              
              {/* Results heading */}
              <h2 className="text-5xl font-black text-green-600 mb-6">
                Emission Analysis
              </h2>
              
              {/* Large emission value display */}
              <p className="text-8xl font-black text-slate-800 mb-3">
                {prediction.co2_emissions}
              </p>
              
              {/* Unit label */}
              <p className="text-3xl text-slate-600 mb-10">
                g/km CO₂ Emissions
              </p>
              
              {/* Reset button */}
              <motion.button 
                onClick={handleReset} 
                whileHover={{ scale: 1.05 }} 
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-12 py-6 rounded-2xl font-bold text-xl hover:shadow-2xl transition-all"
              >
                Calculate Again
              </motion.button>
            </motion.div>
          
          // ===== FORM STATE (DEFAULT) =====
          ) : (
            <motion.div 
              key="form" 
              initial={{ opacity: 0, y: 30 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl"
            >
              {/* Form card wrapper */}
              <div className="relative group">
                {/* Animated gradient border glow */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition duration-1000 animate-pulse"/>
                
                {/* Main form card */}
                <div className="relative bg-white rounded-3xl p-14 shadow-2xl">
                  
                  {/* ===== HEADER SECTION ===== */}
                  <motion.div 
                    className="flex flex-col items-center mb-12"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  >
                    {/* Logo component */}
                    <DriveGreenLogo size="large" />
                    
                    {/* Main title */}
                    <h1 className="mt-8 text-6xl font-black text-slate-900 tracking-tight">
                      CO₂ Calculator
                    </h1>
                    
                    {/* Subtitle with icons */}
                    <div className="mt-5 flex items-center gap-3 text-slate-600 text-xl">
                      <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Sparkles className="w-6 h-6 text-emerald-500" />
                      </motion.div>
                      <span className="font-semibold">Advanced Vehicle Emission Analysis</span>
                      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Leaf className="w-6 h-6 text-green-600" />
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* ===== FORM FIELDS SECTION ===== */}
                  <div className="space-y-9">
                    
                    {/* FUEL TYPE INPUT */}
                    <motion.div 
                      initial={{ opacity: 0, x: -40 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.2 }}
                    >
                      {/* Label with icon */}
                      <label className="flex items-center gap-3 text-xl font-bold text-green-600 mb-4">
                        <Fuel className="w-7 h-7" />
                        Fuel Type
                      </label>
                      
                      {/* Dropdown select */}
                      <select 
                        name="fuel_type" 
                        value={formData.fuel_type} 
                        onChange={handleChange}
                        className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-3 border-gray-300 rounded-2xl text-slate-800 text-xl font-medium focus:ring-4 focus:ring-green-500/50 focus:border-green-500 transition-all hover:border-green-400 shadow-lg cursor-pointer"
                      >
                        <option value="">Select fuel type</option>
                        <option value="X">⛽ Regular Gasoline</option>
                        <option value="Z">⭐ Premium Gasoline</option>
                        <option value="E">🌽 Ethanol (E85)</option>
                        <option value="D">🚛 Diesel</option>
                        <option value="N">💨 Natural Gas</option>
                      </select>
                    </motion.div>

                    {/* CYLINDERS INPUT */}
                    <motion.div 
                      initial={{ opacity: 0, x: -40 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.3 }}
                    >
                      {/* Label with icon */}
                      <label className="flex items-center gap-3 text-xl font-bold text-slate-700 mb-4">
                        <Settings className="w-7 h-7" />
                        Number of Cylinders
                      </label>
                      
                      {/* Number input field */}
                      <input 
                        name="cylinders" 
                        value={formData.cylinders} 
                        onChange={handleChange}
                        type="number" 
                        min="3" 
                        max="16" 
                        placeholder="e.g., 6 cylinders"
                        className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-3 border-gray-300 rounded-2xl text-slate-800 text-xl font-medium placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-lg"
                      />
                    </motion.div>

                    {/* ENGINE SIZE INPUT */}
                    <motion.div 
                      initial={{ opacity: 0, x: -40 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: 0.4 }}
                    >
                      {/* Label with icon */}
                      <label className="flex items-center gap-3 text-xl font-bold text-slate-700 mb-4">
                        <Gauge className="w-7 h-7" />
                        Engine Size (Liters)
                      </label>
                      
                      {/* Decimal number input */}
                      <input 
                        name="engine_size" 
                        value={formData.engine_size} 
                        onChange={handleChange}
                        type="number" 
                        step="0.1" 
                        min="0.9" 
                        max="8.4" 
                        placeholder="e.g., 2.0 liters"
                        className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-3 border-gray-300 rounded-2xl text-slate-800 text-xl font-medium placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-lg"
                      />
                    </motion.div>

                    {/* ===== SUBMIT BUTTON ===== */}
                    <motion.button 
                      onClick={handleSubmit} 
                      whileHover={{ 
                        scale: 1.03, 
                        boxShadow: "0 25px 50px rgba(16, 185, 129, 0.6)" 
                      }}
                      whileTap={{ scale: 0.97 }}
                      // Disable button if form is incomplete
                      disabled={!formData.fuel_type || !formData.cylinders || !formData.engine_size}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-7 rounded-2xl font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 mt-12 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* Animated shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"/>
                      
                      {/* Button icons and text */}
                      <motion.div 
                        animate={{ scale: [1, 1.2, 1] }} 
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-8 h-8 relative z-10" />
                      </motion.div>
                      <span className="relative z-10">Calculate Emissions</span>
                      <TrendingUp className="w-8 h-8 relative z-10" />
                    </motion.button>
                  </div>

                  {/* ===== FOOTER INFO SECTION ===== */}
                  <div className="mt-12 pt-8 border-t-2 border-gray-200">
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      {/* Left info badge */}
                      <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full">
                        <motion.div 
                          animate={{ scale: [1, 1.3, 1] }} 
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="w-3 h-3 bg-green-600 rounded-full block"></span>
                        </motion.div>
                        <span className="font-semibold">AI-Powered Prediction</span>
                      </div>
                      
                      {/* Right info badge */}
                      <div className="flex items-center gap-3 bg-cyan-50 px-4 py-2 rounded-full">
                        <Activity className="w-4 h-4 text-cyan-600" /> 
                        <span className="font-semibold">Real-time Analysis</span>
                      </div>
                    </div>
                  </div>

                  {/* ===== DECORATIVE CORNER ELEMENTS ===== */}
                  {/* Top-left corner accent */}
                  <motion.div 
                    className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-emerald-500/50 rounded-tl-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Top-right corner accent */}
                  <motion.div 
                    className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-cyan-500/50 rounded-tr-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                  />
                  
                  {/* Bottom-left corner accent */}
                  <motion.div 
                    className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-emerald-500/50 rounded-bl-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                  />
                  
                  {/* Bottom-right corner accent */}
                  <motion.div 
                    className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-cyan-500/50 rounded-br-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Export the main component for use in the application
export default PredictionForm;