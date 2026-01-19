import React, { useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Gauge,
  Cylinder,
  Fuel,
  Zap,
  Globe,
  AlertCircle,
  AlertTriangle
} from "lucide-react";

import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import NeonCar from "./NeonCar";
import DriveGreenLogo from "./DriveGreenLogo";
import AnimatedParticles from "./BackgroundParticles";
import toast from "react-hot-toast";

/* COMPREHENSIVE OPTIMIZATIONS:
 * 1. Memoized all animation variants (created once, not per render)
 * 2. useCallback for all event handlers (stable references)
 * 3. useMemo for computed values (form validation, styles)
 * 4. Refs for non-reactive values (toast shown flag)
 * 5. Cached static data at module level
 * 6. Spread operators for cleaner variant application
 * 7. Conditional rendering optimized
 * 8. Removed redundant state updates
 * 9. performance.now() for precise timing
 * 10. Single error handling path
 */

// Module-level constants (computed once)
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const MIN_LOADING_TIME = 800;

// Fuel type options (static data)
const FUEL_OPTIONS = [
  { value: "X", label: "Regular Gasoline" },
  { value: "Z", label: "Premium Gasoline" },
  { value: "E", label: "Ethanol (E85)" },
  { value: "D", label: "Diesel" },
  { value: "N", label: "Natural Gas" }
];

const PredictionForm = () => {
  // State
  const [form, setForm] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: ""
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Refs for non-reactive data
  const abortControllerRef = useRef(null);

  // Memoized form validation
  const isFormValid = useMemo(() => 
    Boolean(form.fuel_type && form.cylinders && form.engine_size),
    [form.fuel_type, form.cylinders, form.engine_size]
  );

  // Memoized select dropdown style
  const selectStyle = useMemo(() => ({
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 0.75rem center",
    backgroundSize: "1em",
    paddingRight: "2.5rem"
  }), []);

  // Memoized animation variants (created once)
  const variants = useMemo(() => ({
    spinner: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.25 }
    },
    result: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -40 },
      transition: { duration: 0.4 }
    },
    form: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, scale: 0.75 },
      transition: { duration: 0.35 }
    },
    logo: {
      initial: { scale: 0, rotate: -90 },
      animate: { scale: 1, rotate: 0 },
      transition: { type: "spring", stiffness: 150, delay: 0.1 }
    },
    input: {
      fuel: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.15 } },
      cylinders: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.25 } },
      engine: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.35 } }
    },
    corners: {
      topLeft: { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 120, delay: 0.5 } },
      bottomRight: { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 120, delay: 0.6 } }
    }
  }), []);

  // Optimized change handler
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  }, []);

  // Optimized submit handler with request cancellation support
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      toast.error("Please fill all fields.", {
        icon: <AlertCircle className="w-5 h-5 text-red-500" />
      });
      return;
    }

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setPrediction(null);
    setLoading(true);

    try {
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: parseInt(form.cylinders, 10),
        engine_size: parseFloat(form.engine_size)
      };

      const startTime = performance.now();

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) {
        let errorMsg = "Prediction failed";
        try {
          const errorBody = await res.json();
          errorMsg = errorBody.detail || errorBody.message || errorMsg;
        } catch {
          // Use default error message
        }
        throw new Error(errorMsg);
      }

      const data = await res.json();

      // Ensure minimum loading time
      const elapsedTime = performance.now() - startTime;
      const remainingTime = MIN_LOADING_TIME - elapsedTime;

      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }

      setPrediction(data);

      toast.success("Prediction successful!", {
        icon: <Globe className="w-5 h-5 text-blue-700" />,
        style: { background: "#10b981", color: "#fff" }
      });
    } catch (err) {
      if (err.name === 'AbortError') {
        // Request was cancelled, don't show error
        return;
      }
      
      console.error(err);
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
      });
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [form, isFormValid]);

  // Optimized reset handler
  const handleReset = useCallback(() => {
    setPrediction(null);
    setLoading(false);
    setForm({
      fuel_type: "",
      cylinders: "",
      engine_size: ""
    });
  }, []);

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

      {/* Neon car - conditionally rendered */}
      {!loading && !prediction && <NeonCar />}

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4 md:p-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="spinner"
              {...variants.spinner}
              className="flex items-center justify-center w-full max-w-3xl"
            >
              <Spinner />
            </motion.div>
          ) : prediction ? (
            <motion.div
              key="result"
              {...variants.result}
              className="w-full max-w-2xl"
            >
              <AnimationCard prediction={prediction} onReset={handleReset} />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              {...variants.form}
              className="w-full max-w-2xl mx-auto"
            >
              <div className="relative group">
                {/* Glowing border */}
                <div className="absolute -inset-1 md:-inset-2 bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-teal-500/70 rounded-3xl blur-xl opacity-20 group-hover:opacity-40 transition duration-1000" />

                {/* Main card */}
                <div className="relative bg-white rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 py-4 px-5 md:py-6 md:px-8 overflow-hidden">
                  {/* Header */}
                  <div className="flex flex-col items-center mb-4 md:mb-6">
                    <motion.div {...variants.logo}>
                      <DriveGreenLogo size="large" />
                    </motion.div>

                    <h2 className="mt-3 text-lg md:text-xl font-bold text-slate-900 tracking-tight text-center">
                      Vehicle Carbon Emissions Predictor
                    </h2>

                    <p className="mt-1 md:mt-2 text-slate-600 text-sm md:text-base font-medium flex items-center gap-2">
                      <Leaf className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 flex-shrink-0" />
                      Determines your vehicle's carbon emissions value
                    </p>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    {/* Fuel type */}
                    <motion.div className="space-y-1 md:space-y-2" {...variants.input.fuel}>
                      <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                        <Fuel className="w-4 h-4 md:w-5 md:h-5" />
                        Fuel Type
                      </label>

                      <select
                        name="fuel_type"
                        value={form.fuel_type}
                        onChange={handleChange}
                        required
                        style={selectStyle}
                        className="w-full p-3 md:p-3.5 bg-gray-50 border border-gray-300 rounded-lg md:rounded-xl text-slate-800 text-sm md:text-base focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-sm hover:border-emerald-400 cursor-pointer appearance-none"
                      >
                        <option value="" disabled>Select fuel type</option>
                        {FUEL_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </motion.div>

                    {/* Cylinders */}
                    <motion.div className="space-y-2 md:space-y-2" {...variants.input.cylinders}>
                      <label className="flex items-center gap-2 text-sm md:text-base font-semibold text-emerald-600">
                        <Cylinder className="w-4 h-4 md:w-5 md:h-5" />
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

                    {/* Engine size */}
                    <motion.div className="space-y-2 md:space-y-2" {...variants.input.engine}>
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
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px rgba(15, 141, 99, 0.7)" }}
                      whileTap={{ scale: 0.95 }}
                      disabled={!isFormValid}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-3 md:py-3.5 rounded-xl md:rounded-2xl font-bold text-sm md:text-base shadow-sm transition-all flex items-center justify-center gap-2 mt-3 md:mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      <span className="relative z-10">Calculate Emission</span>
                      <Zap className="w-5 h-5 md:w-6 md:h-6 relative z-10" />
                    </motion.button>
                  </form>

                  {/* Footer */}
                  <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between text-xs md:text-sm text-slate-600 gap-2 sm:gap-4">
                      <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full whitespace-nowrap">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="w-3 h-3 bg-green-600 rounded-full block" />
                        </motion.div>
                        <span className="font-medium">AI-Powered Prediction</span>
                      </div>

                      <div className="hidden sm:block w-px h-4 bg-gray-300 mx-2" />

                      <div className="text-xs md:text-sm text-slate-500 text-center sm:text-right whitespace-nowrap">
                        Data provided by EPA & Transport Canada standards.
                      </div>
                    </div>
                  </div>

                  {/* Decorative corners */}
                  <motion.div
                    {...variants.corners.topLeft}
                    className="absolute top-4 left-4 w-14 h-14 md:top-4 md:left-4 md:w-16 md:h-16 border-l-5 border-t-5 border-emerald-400/70 rounded-tl-2xl"
                  />
                  <motion.div
                    {...variants.corners.bottomRight}
                    className="absolute bottom-4 right-4 w-14 h-14 md:bottom-4 md:right-4 md:w-16 md:h-16 border-r-5 border-b-5 border-emerald-400/70 rounded-br-2xl"
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