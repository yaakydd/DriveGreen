import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* icons: all from lucide-react */
import {
  Leaf,
  Gauge,
  Settings,
  Fuel,
  TrendingUp,
  Globe,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

/* Local components */
import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import NeonCar from "./NeonCar";
import DriveGreenLogo from "./DriveGreenLogo";
import AnimatedParticles from "./BackgroundParticles";
import toast from "react-hot-toast";

/* API URL (env fallback) - Defines the backend endpoint */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const PredictionForm = () => {
  // State management
  const [form, setForm] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: ""
  });

  const [prediction, setPrediction] = useState(null); 
  const [loading, setLoading] = useState(false); 

  // Handlers
  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fuel_type || !form.cylinders || !form.engine_size) {
      toast.error("Please fill all fields.", { icon: <AlertCircle className="w-5 h-5 text-red-500" /> });
      return;
    }

    //  Reset flow: Clear prediction first, then set loading
    // This ensures a clean state transition
    setPrediction(null);

    // setTimeout is used to ensure state update completes before setting loading
    setTimeout(() => {
      setLoading(true);
    }, 0);

    try {
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: parseInt(form.cylinders, 10),
        engine_size: parseFloat(form.engine_size)
      };

      // Track both API call and minimum display time
      const minimumLoadingTime = 800; // Show spinner for at least 800ms
      const startTime = Date.now();

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        let errMsg = "Prediction failed";
        try {
          const errBody = await res.json();
          errMsg = errBody.detail || errBody.message || errMsg;
        } catch (parseErr) {
          // Fallback if response isn't readable JSON
        }
        throw new Error(errMsg);
      }

      const data = await res.json();

      // Calculate elapsed time and wait if needed
      const elapsedTime = Date.now() - startTime;
      const remainingTime = minimumLoadingTime - elapsedTime;

      if (remainingTime > 0) {
        // Wait for the remaining time to ensure smooth UX
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      // Prediction is set only after ensuring minimum loading time
      setPrediction(data);

      toast.success("Prediction successful!", {
        icon: <Globe className="w-5 h-5 text-blue-700" />,
        style: {
          background: "#10b981",
          color: "#fff"
        }
      });
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
      });

      // When there's an error, still clear loading state
      setLoading(false);
    } finally {
      // Only set loading to false in the finally block
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset in the correct order
    // First clear prediction and loading state
    setPrediction(null);
    setLoading(false);
    
    // Then reset form
    setForm({
      fuel_type: "",
      cylinders: "",
      engine_size: ""
    });
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 font-sans">
      {/* Background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 bg-emerald-600/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 20% 50%)" }}
        />
        <div
          className="absolute inset-0 bg-cyan-500/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 80% 50%)" }}
        />
      </div>

      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatedParticles />
      </div>

      {/* Neon car background */}
      {!loading && !prediction && <NeonCar />}

      {/* Main content area */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6">
        <AnimatePresence mode="wait">
          {/* Loading state */}
          {loading ? (
            <motion.div
              key="spinner"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-center w-full max-w-3xl"
            >
              <Spinner />
            </motion.div>

          ) : prediction ? (
            // Results state
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-2xl"
            >
              <AnimationCard 
                prediction={prediction}
                onReset={handleReset}
              />
            </motion.div>

          ) : (
            // Form state (default)
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.75 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-2xl mx-auto"
            >
              {/* Form card wrapper */}
              <div className="relative group">
                {/* Animated glowing border */}
                <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-teal-500/70 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />

                {/* Main form card */}
                <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 py-4 px-5 md:py-6 md:px-8 overflow-hidden">

                  {/* Header section */}
                  <div className="flex flex-col items-center mb-4 md:mb-6">
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        type: "spring",
                        stiffness: 150,
                        delay: 0.1
                      }}
                    >
                      <DriveGreenLogo size="large" />
                    </motion.div>

                    <h2 className="mt-3 text-lg md:text-xl font-bold text-slate-900 tracking-tight text-center">
                      Vehicle Carbon Emissions Predictor
                    </h2>

                    {/* Subtitle */}
                      <p className="mt-1 md:mt-2 text-slate-600 text-sm md:text-base font-medium flex items-center gap-2">
                        <Leaf className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                        Determines your vehicle's carbon emissions value
                      </p>
                  </div>

                  {/* Form section */}
                  <div>
                    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                      
                      {/* Fuel type input */}
                      <motion.div
                        className="space-y-1 md:space-y-2"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 }}
                      >
                        <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                          <Fuel className="w-4 h-4 md:w-5 md:h-5" />
                          Fuel Type
                        </label>

                        <select
                          name="fuel_type"
                          value={form.fuel_type}
                          onChange={handleChange}
                          required
                          className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm hover:border-emerald-400 cursor-pointer appearance-none"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.75rem center",
                            backgroundSize: "1em",
                            paddingRight: "2.5rem"
                          }}
                        >
                          <option value="" disabled>Select fuel type</option>
                          <option value="X">Regular Gasoline</option>
                          <option value="Z">Premium Gasoline</option>
                          <option value="E">Ethanol (E85)</option>
                          <option value="D">Diesel</option>
                          <option value="N">Natural Gas</option>
                        </select>
                      </motion.div>

                      {/* Cylinders input */}
                      <motion.div
                        className="space-y-2 md:space-y-2"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                          <Settings className="w-4 h-4 md:w-5 md:h-5" />
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
                          placeholder="Enter value between 3-16"
                          className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-sm"
                        />
                      </motion.div>

                      {/* Engine size input */}
                      <motion.div
                        className="space-y-2 md:space-y-2"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.35 }}
                      >
                        <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                          <Gauge className="w-4 h-4 md:w-5 md:h-5" />
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
                          placeholder="Enter value between 0.9-8.4"
                          className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base placeholder-gray-400 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-sm"
                        />
                      </motion.div>

                      {/* Submit button */}
                      <motion.button
                        type="submit"
                        whileHover={{
                          scale: 1.02,
                          boxShadow: "0 20px 40px rgba(15, 141, 99, 0.7)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!form.fuel_type || !form.cylinders || !form.engine_size}
                        className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-sm transition-all flex items-center justify-center gap-2 mt-3 md:mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {/* Animated shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                        <motion.div 
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ 
                            duration: 1.5,
                            repeat: Infinity
                          }}
                        >
                        </motion.div>

                        <span className="relative z-10">Calculate Emission</span>
                        
                        <TrendingUp className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
                      </motion.button>
                    </form>
                  </div>

                  {/* Footer info section - INLINE LAYOUT */}
                  <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-slate-600 gap-2 sm:gap-4">
                      {/* Left: AI-Powered Prediction */}
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ 
                            duration: 2,
                            repeat: Infinity
                          }}
                        >
                          <span className="w-3 h-3 bg-green-600 rounded-full block" />
                        </motion.div>
                        
                        <span className="font-medium">AI-Powered Prediction</span>
                      </div>
                      
                      {/* Gap between components */}
                      <div className="hidden sm:block w-px h-4 bg-gray-300 mx-2" />
                      
                      {/* Right: Data provided by */}
                      <div className="text-xs md:text-sm text-slate-500 text-center sm:text-right whitespace-nowrap">
                        Data provided by EPA & Transport Canada standards.
                      </div>
                    </div>
                  </div>

                  {/* Decorative corner elements */}
                  {/* Top-left corner */}
                  <motion.div
                    className="absolute top-4 left-4 w-14 h-14 md:top-4 md:left-4 md:w-16 md:h-16 border-l-5 border-t-5 border-emerald-400/70 rounded-tl-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 120,
                      delay: 0.5
                    }}
                  />

                  {/* Bottom-right corner */}
                  <motion.div
                    className="absolute bottom-4 right-4 w-14 h-14 md:bottom-4 md:right-4 md:w-16 md:h-16 border-r-5 border-b-5 border-emerald-400/70 rounded-br-2xl"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 120,
                      delay: 0.6
                    }}
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

export default PredictionForm;