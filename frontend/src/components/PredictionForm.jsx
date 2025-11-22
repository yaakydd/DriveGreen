import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Sparkles } from "lucide-react";
import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * PredictionForm Component (Arrow Function)
 * 
 * Features:
 * - Vehicle in BACKGROUND emitting CO2 from exhaust
 * - CO2 trail moves left-to-right across screen
 * - Continuous loop animation
 */
const PredictionForm = () => {
  const [form, setForm] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: ""
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

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
      toast.success("Prediction successful!");
      
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Prediction failed. Check your inputs.");
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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* 🚗💨 BACKGROUND VEHICLE ANIMATION WITH CO2 EMISSIONS */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* VEHICLE + CO2 EMISSIONS (Moves as one unit) */}
        <motion.div
          className="absolute"
          style={{ 
            top: '20%',      // Position in background (not on form)
            left: '-150px'    // Start off-screen left
          }}
          animate={{
            x: ['0vw', '110vw']  // Move from left to right edge
          }}
          transition={{
            duration: 25,        // 25 seconds to cross screen
            repeat: Infinity,    // Loop forever
            ease: "linear",      // Constant speed
            repeatDelay: 1       // 1 second pause before restart
          }}
        >
          {/* VEHICLE SVG */}
          <svg 
            width="120" 
            height="60" 
            viewBox="0 0 120 60" 
            className="drop-shadow-2xl"
          >
            {/* Car Body - Main structure */}
            <g opacity="0.9">
              {/* Bottom body */}
              <rect x="15" y="30" width="90" height="20" rx="4" fill="#3B82F6" stroke="#2563EB" strokeWidth="2"/>
              
              {/* Top cabin */}
              <path d="M 30 30 L 35 15 L 75 15 L 80 30 Z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="2"/>
              
              {/* Front window */}
              <path d="M 38 18 L 42 28 L 55 28 L 55 18 Z" fill="#DBEAFE" opacity="0.7"/>
              
              {/* Back window */}
              <path d="M 60 18 L 60 28 L 73 28 L 70 18 Z" fill="#DBEAFE" opacity="0.7"/>
              
              {/* Front bumper */}
              <rect x="100" y="35" width="8" height="10" rx="2" fill="#2563EB"/>
              
              {/* Back bumper */}
              <rect x="12" y="35" width="8" height="10" rx="2" fill="#2563EB"/>
              
              {/* Wheels */}
              <circle cx="35" cy="50" r="8" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
              <circle cx="35" cy="50" r="4" fill="#6B7280"/>
              <circle cx="85" cy="50" r="8" fill="#1F2937" stroke="#374151" strokeWidth="2"/>
              <circle cx="85" cy="50" r="4" fill="#6B7280"/>
              
              {/* Headlight */}
              <circle cx="104" cy="40" r="3" fill="#FEF3C7" opacity="0.8"/>
              
              {/* EXHAUST PIPE - Where CO2 comes from */}
              <rect x="10" y="42" width="6" height="4" rx="1" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
            </g>
          </svg>

          {/* CO2 EMISSIONS FROM EXHAUST PIPE */}
          <div className="absolute" style={{ left: '10px', top: '42px' }}>
            
            {/* CO2 Smoke Puffs - Coming from exhaust */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={`smoke-${i}`}
                className="absolute"
                style={{
                  left: '0px',
                  top: '0px',
                }}
                initial={{ opacity: 0 }}
                animate={{
                  x: [-10, -30 - (i * 20), -50 - (i * 30)],  // Trail behind car
                  y: [0, -10, -20],                           // Float upward
                  opacity: [0, 0.7, 0.4, 0],                  // Fade in then out
                  scale: [0.3, 0.8, 1.2, 1.8]                 // Expand as it disperses
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.2  // Stagger each puff
                }}
              >
                {/* Gray smoke cloud */}
                <div className="w-6 h-6 bg-gray-400/60 rounded-full blur-md"></div>
              </motion.div>
            ))}

            {/* CO2 Text Labels - Following smoke */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`co2-${i}`}
                className="absolute"
                style={{
                  left: '5px',
                  top: '-5px',
                }}
                initial={{ opacity: 0 }}
                animate={{
                  x: [-15, -40 - (i * 25), -70 - (i * 35)],  // Follow smoke trail
                  y: [0, -15, -25],                           // Float up
                  opacity: [0, 0.8, 0.5, 0],                  // Fade
                  scale: [0.5, 1, 1.3]                        // Grow
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.4  // Stagger
                }}
              >
                <span className="text-gray-300/80 font-bold text-sm whitespace-nowrap select-none">
                  CO₂
                </span>
              </motion.div>
            ))}

            {/* Dense Exhaust Particles - Right at exhaust */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                className="absolute"
                style={{
                  left: '-2px',
                  top: '2px',
                }}
                animate={{
                  x: [-5, -15 - (i * 8)],
                  y: [0, -8, -12],
                  opacity: [0, 0.6, 0],
                  scale: [0.2, 0.5, 0.8]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.15
                }}
              >
                <div className="w-3 h-3 bg-gray-500/50 rounded-full blur-sm"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Ambient Background Particles */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`ambient-${i}`}
            className="absolute rounded-full bg-green-400/20"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -80, 0],
              opacity: [0.2, 0.5, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* Main Content - FORM STAYS IN CENTER */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <AnimatePresence mode="wait">
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
          ) : prediction ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <AnimationCard prediction={prediction} onReset={handleReset} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                
                {/* Header Section */}
                <div className="text-center mb-8 space-y-4">
                  
                  {/* Eco Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    className="inline-block"
                  >
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                      <Leaf className="w-8 h-8 text-green-400" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-white">
                      CO₂ Emissions Predictor
                    </h1>
                    <p className="text-gray-300 text-sm">
                      Estimate your vehicle's carbon footprint
                    </p>
                  </div>
                </div>

                {/* Form with Proper Spacing */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Fuel Type Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                      Fuel Type
                    </label>
                    <select
                      name="fuel_type"
                      value={form.fuel_type}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    >
                      <option value="" className="text-gray-900">Choose fuel type</option>
                      <option value="X" className="text-gray-900">X - Regular Gasoline</option>
                      <option value="Z" className="text-gray-900">Z - Premium Gasoline</option>
                      <option value="E" className="text-gray-900">E - Ethanol (E85)</option>
                      <option value="D" className="text-gray-900">D - Diesel</option>
                      <option value="N" className="text-gray-900">N - Natural Gas</option>
                    </select>
                  </div>

                  {/* Cylinders Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Settings className="w-4 h-4 text-blue-400" />
                      Number of Cylinders
                    </label>
                    <input
                      name="cylinders"
                      value={form.cylinders}
                      onChange={handleChange}
                      required
                      type="number"
                      min="2"
                      max="16"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., 4"
                    />
                  </div>

                  {/* Engine Size Input */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-200">
                      <Gauge className="w-4 h-4 text-red-400" />
                      Engine Size (Liters)
                    </label>
                    <input
                      name="engine_size"
                      value={form.engine_size}
                      onChange={handleChange}
                      required
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10"
                      className="w-full p-3 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      placeholder="e.g., 2.0"
                    />
                  </div>

                  {/* Submit Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-semibold shadow-lg hover:shadow-green-500/50 transition-all flex items-center justify-center gap-2 mt-8"
                  >
                    <Leaf className="w-5 h-5" />
                    Predict CO₂ Emissions
                  </motion.button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PredictionForm;
