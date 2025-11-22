import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Sparkles, Car } from "lucide-react";
import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * PredictionForm Component (Arrow Function)
 * 
 * Features:
 * - Animated vehicle emitting CO2 across screen
 * - CO2 smoke trail following vehicle
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
      
      {/* 🚗💨 ANIMATED VEHICLE EMITTING CO2 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Vehicle Animation - Moves from left to right */}
        <motion.div
          className="absolute"
          style={{ 
            top: '15%',
            left: '-100px'
          }}
          animate={{
            x: ['0vw', '110vw']  // Move across entire screen
          }}
          transition={{
            duration: 20,        // 20 seconds to cross screen
            repeat: Infinity,    // Loop forever
            ease: "linear",      // Constant speed
            repeatDelay: 2       // 2 second pause before restarting
          }}
        >
          {/* Car Icon */}
          <div className="relative">
            <svg 
              width="80" 
              height="40" 
              viewBox="0 0 80 40" 
              className="drop-shadow-lg"
            >
              {/* Car Body */}
              <rect x="10" y="20" width="60" height="15" rx="3" fill="#3B82F6" />
              <rect x="20" y="10" width="40" height="15" rx="3" fill="#60A5FA" />
              
              {/* Windows */}
              <rect x="25" y="13" width="15" height="10" rx="2" fill="#93C5FD" opacity="0.6" />
              <rect x="45" y="13" width="15" height="10" rx="2" fill="#93C5FD" opacity="0.6" />
              
              {/* Wheels */}
              <circle cx="25" cy="35" r="5" fill="#1F2937" />
              <circle cx="25" cy="35" r="3" fill="#6B7280" />
              <circle cx="55" cy="35" r="5" fill="#1F2937" />
              <circle cx="55" cy="35" r="3" fill="#6B7280" />
              
              {/* Exhaust Pipe */}
              <rect x="8" y="28" width="4" height="3" rx="1" fill="#374151" />
            </svg>

            {/* CO2 Emission Trail - Multiple puffs coming from exhaust */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  left: '-30px',
                  top: '25px',
                }}
                animate={{
                  x: [-20 * i, -20 * i - 80],  // Move backward from car
                  y: [0, -20, -30],              // Float upward
                  opacity: [0, 0.6, 0.3, 0],     // Fade in and out
                  scale: [0.5, 1, 1.5, 2]        // Expand as it dissipates
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.3  // Stagger each puff
                }}
              >
                <div className="text-gray-400/60 font-bold text-lg select-none">
                  CO₂
                </div>
              </motion.div>
            ))}

            {/* Smoke Puffs - Gray clouds */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`smoke-${i}`}
                className="absolute"
                style={{
                  left: '-25px',
                  top: '22px',
                }}
                animate={{
                  x: [-15 * i, -15 * i - 60],
                  y: [0, -15, -25],
                  opacity: [0, 0.4, 0.2, 0],
                  scale: [0.3, 0.8, 1.2]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.25
                }}
              >
                <div className="w-8 h-8 bg-gray-500/30 rounded-full blur-sm"></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Additional Floating CO2 Particles in Background */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full bg-green-400/20"
            style={{
              width: Math.random() * 4 + 2,
              height: Math.random() * 4 + 2,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      {/* Main Content */}
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