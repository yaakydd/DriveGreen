import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Leaf,
  Gauge,
  Settings,
  Fuel,
  Zap,
  TrendingUp,
  Info,
  ChevronDown
} from "lucide-react";

import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import DriveGreenLogo from "./DriveGreenLogo";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const PredictionForm = () => {
  const [form, setForm] = useState({
    fuel_type: "",
    cylinders: "",
    engine_size: "",
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fuel_type || !form.cylinders || !form.engine_size) {
      toast.error("Please fill all fields for an accurate prediction.", { icon: "🌱" });
      return;
    }

    setLoading(true);
    setPrediction(null);

    try {
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: parseInt(form.cylinders, 10),
        engine_size: parseFloat(form.engine_size),
      };

      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Prediction failed. Please try again.");
      }

      const data = await res.json();
      setPrediction(data);
      toast.success("Carbon footprint analysis complete!");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to calculate emissions.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPrediction(null);
    setLoading(false);
    setForm({
      fuel_type: "",
      cylinders: "",
      engine_size: "",
    });
  };

  // Reusable Input Component
  const InputGroup = ({ label, icon: Icon, children }) => (
    <div className="space-y-3 w-full">
      <label className="flex items-center gap-3 text-sm font-bold text-lum-highlight uppercase tracking-widest pl-1">
        <Icon className="w-4 h-4" />
        {label}
      </label>
      <div className="relative group perspective-1000 w-full">
        {children}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-white/30 pointer-events-none transition-all duration-300" />
      </div>
    </div>
  );

  // Common styling for inputs/selects
  // Adjusted padding for better fit
  const inputClasses = "w-full p-4 bg-lum-deep/40 backdrop-blur-md border-[1.5px] border-white/10 rounded-2xl text-white text-lg placeholder-white/20 focus:outline-none focus:ring-4 focus:ring-lum-accent/20 focus:border-lum-accent transition-all duration-300 shadow-inner hover:bg-lum-deep/60";

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-8"> 
      {/* Reduced to max-w-xl for a cleaner, tighter card */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-[500px] bg-lum-deep/40 backdrop-blur-2xl rounded-[2rem] border border-white/10"
          >
            <Spinner />
            <p className="mt-8 text-lum-highlight animate-pulse font-heading text-xl tracking-wide">Analyzing Carbon Data...</p>
          </motion.div>
        ) : prediction ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <AnimationCard prediction={prediction} onReset={handleReset} />
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            className="relative w-full"
          >
            {/* Glass Card - Main Container */}
            <div className="relative overflow-hidden bg-lum-deep/70 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50">
              
              {/* Content Wrapper with padding */}
              <div className="p-8 md:p-12 relative z-10 flex flex-col items-center">

                  {/* Header */}
                  <div className="text-center mb-10 w-full">
                    <motion.div 
                      className="inline-block mb-6 p-4 rounded-3xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 shadow-lg"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <DriveGreenLogo />
                    </motion.div>
                    <h1 className="text-3xl md:text-4xl font-heading font-bold text-white mb-3 tracking-tight">Emission Analyzer</h1>
                    <p className="text-lum-text-dim text-base leading-relaxed">AI-powered carbon impact calculation</p>
                  </div>

                  {/* Form - with explicit width constraint */}
                  <form onSubmit={handleSubmit} className="space-y-8 w-full">
                    
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-full"
                    >
                        <InputGroup label="Fuel Source" icon={Fuel}>
                        <div className="relative w-full">
                            <select
                            name="fuel_type"
                            value={form.fuel_type}
                            onChange={handleChange}
                            required
                            className={`${inputClasses} appearance-none cursor-pointer`}
                            >
                            <option value="" disabled className="bg-lum-base text-gray-500">Select Power Source</option>
                            <option value="X" className="bg-lum-base">Regular Gasoline</option>
                            <option value="Z" className="bg-lum-base">Premium Gasoline</option>
                            <option value="E" className="bg-lum-base">Ethanol (E85)</option>
                            <option value="D" className="bg-lum-base">Diesel</option>
                            <option value="N" className="bg-lum-base">Natural Gas</option>
                            </select>
                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-lum-highlight/70 pointer-events-none w-5 h-5" />
                        </div>
                        </InputGroup>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                            <InputGroup label="Cylinders" icon={Settings}>
                                <input
                                name="cylinders"
                                type="number"
                                min="3"
                                max="16"
                                placeholder="e.g. 4"
                                required
                                value={form.cylinders}
                                onChange={handleChange}
                                className={inputClasses}
                                />
                            </InputGroup>
                      </motion.div>

                      <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                            <InputGroup label="Engine Size (L)" icon={Gauge}>
                                <input
                                name="engine_size"
                                type="number"
                                step="0.1"
                                min="0.9"
                                max="8.4"
                                placeholder="e.g. 2.0"
                                required
                                value={form.engine_size}
                                onChange={handleChange}
                                className={inputClasses}
                                />
                            </InputGroup>
                      </motion.div>
                    </div>

                    <motion.button
                      type="submit"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 0 40px rgba(52, 211, 153, 0.4)" }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!form.fuel_type || !form.cylinders || !form.engine_size}
                      className="w-full mt-6 py-5 rounded-2xl bg-gradient-to-r from-lum-accent to-teal-400 text-lum-base font-bold font-heading text-xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
                        <Zap className="w-6 h-6 fill-current relative z-10" />
                        <span className="relative z-10">Calculate Footprint</span>
                    </motion.button>

                  </form>
              
              </div>

              {/* Decorative Glows */}
              <div className="absolute -top-32 -right-32 w-80 h-80 bg-lum-accent/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />
              <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen" />

            </div>
            
            {/* Footer */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-xs text-lum-text-dim">
                <Info className="w-3 h-3 text-lum-highlight" />
                <span>Powered by EPA & Transport Canada Data</span>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionForm;
