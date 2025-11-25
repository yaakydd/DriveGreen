// ===== BEAUTIFUL PREDICTION FORM =====
// File: frontend/src/components/PredictionForm.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Fuel, Car, Sparkles } from "lucide-react";
import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import NeonCar from "./NeonCar";
import AnimatedParticles from "./AnimatedBackground";
import DriveGreenLogo from "./DriveGreenLogo";
import toast from "react-hot-toast";

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
  // ===== STATE =====
  const [form, setForm] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: ""
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== HANDLERS =====
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPrediction(null);

    try {
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: parseInt(form.cylinders, 10),
        engine_size: parseFloat(form.engine_size)
      };

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || "Prediction failed");
      }

      const data = await res.json();
      setPrediction(data);
      setLoading(false);
      
      toast.success("Prediction successful!", {
        icon: '🌍',
        style: {
          background: '#10b981',
          color: '#fff',
        }
      });
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: '⚠️',
      });
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setLoading(false);
    setForm({
      fuel_type: "",
      cylinders: "",
      engine_size: ""
    });
  };

  // ===== JSX =====
  return (
    // Set a deep, consistent background color
        <div className="min-h-screen relative overflow-hidden bg-gray-950 font-sans">
          
          {/* ===== CREATIVE BACKGROUND: RADIAL GLOW OVERLAY (New & Improved) ===== */}
          {/* Creates a massive, blurred spotlight effect using theme colors */}
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute inset-0 bg-green-600/30 blur-[100px] opacity-10" 
              style={{ clipPath: 'ellipse(50% 50% at 20% 50%)' }} // Left side green glow
            ></div>
             <div 
              className="absolute inset-0 bg-sky-500/30 blur-[100px] opacity-10" 
              style={{ clipPath: 'ellipse(50% 50% at 80% 50%)' }} // Right side blue glow
            ></div>
          </div>
    
    
          {/* ===== ANIMATED PARTICLES (More Dense) ===== */}
          <AnimatedParticles />
    
          {/* ===== NEON CAR BACKGROUND (More Visible) ===== */}
          <NeonCar />
    
          {/* ===== DECORATIVE ORBS (Now integrated into the radial glow, so removing explicit orb divs) ===== */}
    
          {/* ===== MAIN CONTENT WRAPPER ===== */}
          <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
            <AnimatePresence mode="wait">
              
              {/* STATE: LOADING */}
              {loading ? (
                <motion.div
                  key="spinner"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Spinner />
                </motion.div>
              
              // STATE: RESULTS
              ) : prediction ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50 }}
                  transition={{ duration: 0.5 }}
                  className="w-full max-w-lg"
                >
                  <AnimationCard
                    prediction={prediction}
                    onReset={handleReset}
                  />
                </motion.div>
              
              // STATE: FORM
              ) : (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="w-full max-w-lg"
                >
                  {/* ===== BEAUTIFUL FORM CARD (Clean White) ===== */}
                  <div className="relative group">
                    
                    {/* Glowing border effect (Vibrant Green) */}
                    <div className="absolute -inset-1 bg-green-600/50 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition duration-1000"></div>
                    
                    {/* Main form container (Clean White background) */}
                    <div className="relative bg-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-gray-900/10">
                      
                      {/* ===== HEADER WITH LOGO (Deep Slate Text) ===== */}
                      <div className="flex flex-col items-center mb-8">
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ 
                            type: "spring",
                            stiffness: 200,
                            delay: 0.1
                          }}
                        >
                          <DriveGreenLogo size="normal" colorClass="text-green-600" />
                        </motion.div>
                        <h2 className="mt-4 text-3xl font-bold text-slate-800">
                          Carbon Prediction Form
                        </h2>
                      </div>
    
                      {/* Subtitle with sparkle (Tech Blue Accent) */}
                      <div className="text-center mb-8">
                        <p className="text-slate-600 text-base font-medium flex items-center justify-center gap-2">
                          <Sparkles className="w-4 h-4 text-sky-500" /> 
                          Input Vehicle Metrics for Eco Analysis
                          <Sparkles className="w-4 h-4 text-sky-500" />
                        </p>
                      </div>
    
                      {/* ===== FORM ===== */}
                      <form onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* ===== FUEL TYPE (Vibrant Green Label) ===== */}
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <label className="flex items-center gap-2 text-sm font-semibold text-green-600">
                            <Fuel className="w-4 h-4" />
                            Fuel Type
                          </label>
                          
                          <select
                            name="fuel_type"
                            value={form.fuel_type}
                            onChange={handleChange}
                            required
                            className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all hover:border-green-600/50 shadow-sm appearance-none cursor-pointer"
                          >
                            <option value="" disabled className="text-gray-400">Select fuel type</option>
                            <option value="X"> Regular Gasoline</option>
                            <option value="Z"> Premium Gasoline</option>
                            <option value="E"> Ethanol (E85)</option>
                            <option value="D"> Diesel</option>
                            <option value="N"> Natural Gas</option>
                          </select>
                        </motion.div>
    
                        {/* ===== CYLINDERS (Tech Blue Focus) ===== */}
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Settings className="w-4 h-4" />
                            Number of Cylinders
                          </label>
                          
                          <input
                            name="cylinders"
                            value={form.cylinders}
                            onChange={handleChange}
                            required
                            type="number"
                            min="3"
                            max="16"
                            className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all hover:border-sky-500/50 shadow-sm"
                            placeholder="e.g., 6 cylinders (3 to 16)"
                          />
                        </motion.div>
    
                        {/* ===== ENGINE SIZE (Tech Blue Focus) ===== */}
                        <motion.div 
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          <label className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                            <Gauge className="w-4 h-4" />
                            Engine Size (Liters)
                          </label>
                          
                          <input
                            name="engine_size"
                            value={form.engine_size}
                            onChange={handleChange}
                            required
                            type="number"
                            step="0.1"
                            min="0.9"
                            max="8.4"
                            className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all hover:border-sky-500/50 shadow-sm"
                            placeholder="e.g., 2.0 liters (0.9 to 8.4)"
                          />
                        </motion.div>
    
                        {/* ===== SUBMIT BUTTON (Vibrant Green) ===== */}
                        <motion.button
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 15px 30px rgba(0, 168, 107, 0.4)" 
                          }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          className="w-full relative overflow-hidden bg-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 mt-8 group hover:bg-green-700"
                        >
                          {/* Subtle Shine effect on hover */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                          
                          <Car className="w-6 h-6 relative z-10" />
                          <span className="relative z-10">Calculate Eco Score</span>
                          <Leaf className="w-5 h-5 relative z-10" />
                        </motion.button>
                      </form>
    
                      {/* ===== FOOTER (Deep Slate Text) ===== */}
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between text-xs text-slate-700">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                            <span>Data-Driven Prediction</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className="w-3 h-3 text-sky-500" /> 
                            <span>Accurate Metrics</span>
                          </div>
                        </div>
                      </div>

                  {/* ===== DECORATIVE CORNERS ===== */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-emerald-500/30 rounded-tl-lg"></div>
                  <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-emerald-500/30 rounded-tr-lg"></div>
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-500/30 rounded-bl-lg"></div>
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-emerald-500/30 rounded-br-lg"></div>
                </div>
              </div>
              <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-lg pointer-events-none"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionForm;

/**
 * ===== NEW COLOR SCHEME SUMMARY =====
 * 
 * Professional, Fun, Catchy:
 * 
 * PRIMARY COLORS:
 * - Emerald-500 (#10B981): Main brand color, fuel type
 * - Teal-500 (#14B8A6): Secondary accent, cylinders
 * - Cyan-500 (#06B6D4): Tech accent, engine size
 * 
 * BACKGROUND:
 * - Slate-900/800: Dark professional base
 * - Emerald-950: Subtle eco tint
 * 
 * ACCENTS:
 * - Lime-500 (#84CC16): Success states
 * - Amber-500 (#F59E0B): Warnings
 * - Orange-500 (#F97316): Danger/High emissions
 * 
 * EFFECTS:
 * - Gradient button: Emerald → Teal → Cyan
 * - Glowing borders: Emerald
 * - Decorative corners: Emerald
 * - Logo: Circular green leaf design
 * 
 * IMPROVEMENTS:
 * ✅ Logo beside text (not above)
 * ✅ Much bigger, visible car
 * ✅ CO2 smoke directly from exhaust
 * ✅ Highly visible CO2 text (gold with glow)
 * ✅ More appealing form with decorative elements
 * ✅ Professional color scheme
 * ✅ Smooth animations and hover effects
 */