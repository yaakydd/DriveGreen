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
 * Updates:
 * - Removed artificial delay (faster response)
 * - Added proper spacing/padding
 * - CO2 molecules animation background
 * - Vehicle icon at top
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
      
      // ✅ REMOVED ARTIFICIAL DELAY - Now instant!
      // await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      {/* 🌫️ CO2 Molecules Animation (Left to Right) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* CO2 Molecules floating across screen */}
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`co2-${i}`}
            className="absolute text-green-400/20 font-bold text-2xl"
            style={{
              top: `${Math.random() * 100}%`,
              left: '-10%'
            }}
            animate={{
              x: ['0vw', '110vw'],  // Move from left to right across screen
              y: [0, Math.random() * 50 - 25, 0],  // Slight up/down float
            }}
            transition={{
              duration: 15 + Math.random() * 10,  // Vary speed
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10  // Stagger start times
            }}
          >
            CO₂
          </motion.div>
        ))}

        {/* Animated Carbon Particles (Original) */}
        {[...Array(25)].map((_, i) => (
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
              {/* ✅ ADDED PROPER SPACING with p-8 and space-y-6 */}
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                
                {/* Header Section with Vehicle Icon */}
                <div className="text-center mb-8 space-y-4">
                  {/* 🚗 Vehicle Icon at Top */}
                  <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ 
                      type: "spring", 
                      stiffness: 100,
                      delay: 0.2 
                    }}
                    className="flex justify-center"
                  >
                    <div className="relative">
                      {/* Car Icon with Exhaust Animation */}
                      <motion.div
                        animate={{ 
                          x: [0, 5, 0],  // Slight shake
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      >
                        <Car className="w-16 h-16 text-blue-400" />
                      </motion.div>
                      
                      {/* Exhaust Smoke Animation */}
                      <motion.div
                        className="absolute -right-8 top-1/2 transform -translate-y-1/2"
                        animate={{ 
                          x: [0, 20, 40],
                          opacity: [0.6, 0.3, 0],
                          scale: [0.5, 1, 1.5]
                        }}
                        transition={{ 
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      >
                        <div className="text-gray-400/50 text-xl">💨</div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Eco Icon with Animation */}
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

                {/* ✅ FORM WITH PROPER SPACING */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Fuel Type Input - ✅ Added spacing */}
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

                  {/* Cylinders Input - ✅ Added spacing */}
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

                  {/* Engine Size Input - ✅ Added spacing */}
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

                  {/* Submit Button - ✅ Added top margin */}
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