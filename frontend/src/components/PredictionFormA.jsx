import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Gauge, Settings, Fuel, Car } from "lucide-react";
import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * PredictionForm Component (Arrow Function)
 * 
 * NEW FEATURES:
 * ✅ Realistic carbon emission color theme (blacks, grays, oranges, greens)
 * ✅ Faster loading (removed artificial delay)
 * ✅ Vehicle animation in background
 * ✅ Eye-catching gradients and shadows
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
      
      // ✅ REMOVED DELAY - Results appear instantly!
      setPrediction(data);
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

  return (
    // 🎨 NEW: Dark smoky background (represents pollution)
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      
      {/* 🚗💨 ANIMATED VEHICLE WITH EMISSIONS */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        
        {/* VEHICLE MOVING ACROSS SCREEN */}
        <motion.div
          className="absolute"
          style={{ 
            top: '15%',
            left: '-150px'
          }}
          animate={{
            x: ['0vw', '110vw']
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 2
          }}
        >
          {/* VEHICLE SVG - Realistic car */}
          <svg 
            width="140" 
            height="70" 
            viewBox="0 0 140 70" 
            className="drop-shadow-2xl"
          >
            <g opacity="0.8">
              {/* Car Body */}
              <rect x="20" y="35" width="100" height="22" rx="3" fill="#EF4444" stroke="#DC2626" strokeWidth="2"/>
              
              {/* Car Roof */}
              <path d="M 35 35 L 42 20 L 88 20 L 95 35 Z" fill="#F87171" stroke="#EF4444" strokeWidth="2"/>
              
              {/* Windows */}
              <path d="M 45 23 L 50 32 L 65 32 L 65 23 Z" fill="#93C5FD" opacity="0.5"/>
              <path d="M 70 23 L 70 32 L 85 32 L 82 23 Z" fill="#93C5FD" opacity="0.5"/>
              
              {/* Wheels */}
              <circle cx="40" cy="57" r="10" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
              <circle cx="40" cy="57" r="5" fill="#4B5563"/>
              <circle cx="100" cy="57" r="10" fill="#1F2937" stroke="#111827" strokeWidth="2"/>
              <circle cx="100" cy="57" r="5" fill="#4B5563"/>
              
              {/* Headlight */}
              <circle cx="118" cy="45" r="3" fill="#FDE047"/>
              
              {/* Exhaust Pipe */}
              <rect x="15" y="48" width="8" height="5" rx="2" fill="#374151" stroke="#1F2937" strokeWidth="1"/>
            </g>
          </svg>

          {/* CO2 EMISSIONS FROM EXHAUST */}
          <div className="absolute" style={{ left: '15px', top: '48px' }}>
            
            {/* Smoke Puffs */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={`smoke-${i}`}
                className="absolute"
                animate={{
                  x: [-10, -35 - (i * 15), -60 - (i * 25)],
                  y: [0, -12, -22],
                  opacity: [0, 0.6, 0.3, 0],
                  scale: [0.4, 1, 1.5, 2]
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.25
                }}
              >
                <div className="w-8 h-8 bg-gray-600/70 rounded-full blur-lg"></div>
              </motion.div>
            ))}

            {/* CO2 Text */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`co2-${i}`}
                className="absolute"
                animate={{
                  x: [-15, -45 - (i * 20), -80 - (i * 30)],
                  y: [0, -18, -28],
                  opacity: [0, 0.7, 0.4, 0],
                  scale: [0.6, 1.1, 1.4]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.5
                }}
              >
                <span className="text-orange-400/80 font-bold text-base select-none">
                  CO₂
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Floating Pollution Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 3,
              height: Math.random() * 6 + 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `rgba(${156 + Math.random() * 50}, ${163 + Math.random() * 50}, ${175}, 0.2)`
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.4, 0.2],
              scale: [1, 1.3, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3
            }}
          />
        ))}
      </div>

      {/* MAIN CONTENT */}
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
              {/* 🎨 NEW: Attractive form with carbon-themed colors */}
              <div className="relative bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-500/20">
                
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 blur-xl -z-10"></div>
                
                {/* Header Section */}
                <div className="text-center mb-8 space-y-5">
                  
                  {/* Icon with Glow */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 200,
                      delay: 0.1 
                    }}
                    className="relative inline-block"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full flex items-center justify-center mx-auto border-2 border-orange-500/50">
                      <Car className="w-10 h-10 text-orange-400" />
                    </div>
                  </motion.div>

                  {/* Title with Gradient */}
                  <div className="space-y-3">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                      CO₂ Emissions Calculator
                    </h1>
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      <Leaf className="w-4 h-4 text-green-400" />
                      Track your vehicle's carbon footprint
                    </p>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Fuel Type - Orange theme */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                      <Fuel className="w-4 h-4" />
                      Fuel Type
                    </label>
                    <select
                      name="fuel_type"
                      value={form.fuel_type}
                      onChange={handleChange}
                      required
                      className="w-full p-4 bg-gray-900/80 border-2 border-orange-500/30 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-orange-500/50 cursor-pointer"
                    >
                      <option value="" className="text-gray-400 bg-gray-900">Select fuel type...</option>
                      <option value="X" className="bg-gray-900">⛽ X - Regular Gasoline</option>
                      <option value="Z" className="bg-gray-900">⭐ Z - Premium Gasoline</option>
                      <option value="E" className="bg-gray-900">🌽 E - Ethanol (E85)</option>
                      <option value="D" className="bg-gray-900">🚛 D - Diesel</option>
                      <option value="N" className="bg-gray-900">💨 N - Natural Gas</option>
                    </select>
                  </motion.div>

                  {/* Cylinders - Red theme */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-red-400">
                      <Settings className="w-4 h-4" />
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
                      className="w-full p-4 bg-gray-900/80 border-2 border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-500/50"
                      placeholder="e.g., 4 cylinders"
                    />
                  </motion.div>

                  {/* Engine Size - Yellow theme */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
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
                      min="0.1"
                      max="10"
                      className="w-full p-4 bg-gray-900/80 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all hover:border-yellow-500/50"
                      placeholder="e.g., 2.0 liters"
                    />
                  </motion.div>

                  {/* Submit Button - Gradient */}
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-3 mt-8 border border-orange-400/50"
                  >
                    <Car className="w-6 h-6" />
                    Calculate Emissions
                    <span className="text-sm opacity-80">→</span>
                  </motion.button>
                </form>

                {/* Footer Info */}
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Powered by AI · Real-time Analysis
                  </p>
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
