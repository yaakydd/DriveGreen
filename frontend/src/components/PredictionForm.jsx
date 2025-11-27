// ===== FINAL REFINED PREDICTION FORM UI - MATCHING LOGIC =====
// File: frontend/src/components/PredictionForm.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Ensure all necessary icons are imported
import { Leaf, Gauge, Settings, Fuel, Car, Sparkles, Activity, Zap, TrendingUp } from "lucide-react";
// Assuming these components are correctly defined and imported
import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import NeonCar from "./NeonCar";
import DriveGreenLogo from "./DriveGreenLogo";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const PredictionForm = () => {
  // ===== STATE (LOGIC RETAINED) =====
  const [form, setForm] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: ""
  });
  
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== HANDLERS (LOGIC RETAINED) =====
  const handleChange = (e) => {
    // Uses 'form' state object
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Simple validation before API call
    if (!form.fuel_type || !form.cylinders || !form.engine_size) {
        toast.error("Please fill all fields.", { icon: '🚨' });
        return;
    }
    
    setLoading(true);
    setPrediction(null);

    try {
      const payload = {
        fuel_type: form.fuel_type,
        // Ensure inputs are correctly parsed
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
      
      toast.success("Prediction successful!", {
        icon: '🌍',
        style: {
          background: '#10b981', // Emerald success background
          color: '#fff',
        }
      });
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: '⚠️',
      });
    } finally {
        setLoading(false); // Ensure loading is turned off in all cases
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

  // Check if form is complete for button disabling (LOGIC RETAINED)
  const isFormComplete = form.fuel_type && form.cylinders && form.engine_size;

  // ===== JSX (REFINED UI) =====
  return (
    // Dark, professional background
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 font-sans">
      
      {/* ===== BACKGROUND GLOW EFFECTS (Subtle) ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-emerald-600/20 blur-[150px] opacity-15" 
          style={{ clipPath: 'ellipse(60% 70% at 20% 50%)' }}
        ></div>
        <div 
          className="absolute inset-0 bg-cyan-500/20 blur-[150px] opacity-15" 
          style={{ clipPath: 'ellipse(60% 70% at 80% 50%)' }}
        ></div>
      </div>

      {/* ===== NEON CAR BACKGROUND (Retained) ===== */}
      <NeonCar />

      {/* ===== MAIN CONTENT ===== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <AnimatePresence mode="wait">
          
          {/* LOADING STATE (Uses external Spinner component) */}
          {loading ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="text-white text-3xl"
            >
              <Spinner /> {/* RETAINS Spinner component */}
            </motion.div>
          
          // RESULTS STATE (Uses external AnimationCard component)
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
                onReset={handleReset} // RETAINS handleReset logic
              /> {/* RETAINS AnimationCard component */}
            </motion.div>
          
          // FORM STATE
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              {/* ===== FORM CARD WRAPPER (Enhanced Glow) ===== */}
              <div className="relative group">
                
                {/* Glowing border effect (Subtle, slow pulse) */}
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-teal-500/70 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000 animate-[pulse_5s_infinite]"></div>
                
                {/* Main form container (Clean White Card) */}
                <div className="relative bg-white rounded-3xl p-10 sm:p-14 shadow-2xl border border-gray-100">
                  
                  {/* ===== HEADER WITH LOGO ===== */}
                  <div className="flex flex-col items-center mb-10">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 150, delay: 0.1 }}
                    >
                      <DriveGreenLogo size="large" />
                    </motion.div>
                    <h2 className="mt-6 text-5xl font-extrabold text-slate-900 tracking-tight">
                      Eco-Score Calculator
                    </h2>
                  </div>

                  {/* Subtitle */}
                  <div className="text-center mb-10">
                    <p className="text-slate-600 text-xl font-medium flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-500" /> 
                      Predict CO₂ Emissions Using Advanced Metrics
                      <Leaf className="w-5 h-5 text-emerald-600" />
                    </p>
                  </div>

                  {/* ===== FORM (RETAINS handleSubmit logic) ===== */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* FUEL TYPE */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <label className="flex items-center gap-3 text-lg font-bold text-emerald-600">
                        <Fuel className="w-6 h-6" />
                        Fuel Type
                      </label>
                      
                      <select
                        name="fuel_type"
                        value={form.fuel_type}
                        onChange={handleChange}
                        required
                        className="w-full p-5 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner hover:border-emerald-400 cursor-pointer appearance-none"
                        // Custom Select Arrow for a cleaner look
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2em' }}
                      >
                        <option value="" disabled className="text-gray-400">Select fuel type</option>
                        <option value="X">⛽ Regular Gasoline</option>
                        <option value="Z">⭐ Premium Gasoline</option>
                        <option value="E">🌽 Ethanol (E85)</option>
                        <option value="D">🚛 Diesel</option>
                        <option value="N">💨 Natural Gas</option>
                      </select>
                    </motion.div>

                    {/* CYLINDERS */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="flex items-center gap-3 text-lg font-bold text-slate-700">
                        <Settings className="w-6 h-6" />
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
                        className="w-full p-5 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg placeholder-gray-500 shadow-inner focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400"
                        placeholder="e.g., 6 cylinders (3 to 16)"
                      />
                    </motion.div>

                    {/* ENGINE SIZE */}
                    <motion.div 
                      className="space-y-3"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="flex items-center gap-3 text-lg font-bold text-slate-700">
                        <Gauge className="w-6 h-6" />
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
                        className="w-full p-5 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg placeholder-gray-500 shadow-inner focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400"
                        placeholder="e.g., 2.0 liters (0.9 to 8.4)"
                      />
                    </motion.div>

                    {/* SUBMIT BUTTON */}
                    <motion.button
                      whileHover={{ 
                        scale: 1.02,
                        boxShadow: "0 20px 40px rgba(16, 185, 129, 0.5)" // Enhanced shadow on hover
                      }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!isFormComplete} // RETAINS complete form check
                      className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white py-6 rounded-xl font-extrabold text-2xl shadow-xl transition-all flex items-center justify-center gap-4 mt-12 group disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {/* Shine effect (Slightly faster) */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                      
                      <Car className="w-7 h-7 relative z-10" />
                      <span className="relative z-10 tracking-wide">Predict Emissions</span>
                      <TrendingUp className="w-7 h-7 relative z-10" />
                    </motion.button>
                  </form>

                  {/* ===== FOOTER ===== */}
                  <div className="mt-10 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-slate-500 font-light">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full block animate-ping-slow"></span>
                        <span>AI-Powered Analysis</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-cyan-500" /> 
                        <span>Real-time API Connection</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionForm;