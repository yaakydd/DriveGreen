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
  ChevronDown,
} from "lucide-react";

import Spinner from "./Spinner";
import AnimationCard from "./AnimationCard";
import DriveGreenLogo from "./DriveGreenLogo";
import toast from "react-hot-toast";
import AnimatedParticles from "./BackgroundParticles";
import NeonCar from "./NeonCar";

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
      toast.error("Please fill all fields for an accurate prediction.", {
        icon: "🌱",
      });
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
      <label className="flex items-center gap-3 text-sm font-bold text-emerald-700 uppercase tracking-widest pl-1">
        <Icon className="w-4 h-4 text-emerald-600" />
        {label}
      </label>
      <div className="relative group perspective-1000 w-full">
        {children}
        <div className="absolute inset-0 rounded-2xl ring-1 ring-emerald-500/20 group-hover:ring-emerald-500/40 pointer-events-none transition-all duration-300" />
      </div>
    </div>
  );

  // Common styling for inputs/selects
  // Adjusted padding for better fit
  const inputClasses =
    "w-full p-3 bg-gray-50 border-[1.5px] border-emerald-100 rounded-2xl text-gray-900 text-base placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all duration-300 shadow-inner hover:bg-white";

  return (
    <div className="w-full max-w-[95%] sm:max-w-xl md:max-w-2xl mx-auto py-4 md:py-8 relative z-20">
      {/* Reduced to max-w-xl for a cleaner, tighter card */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="spinner"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-[2rem] border border-gray-100 shadow-xl"
          >
            <Spinner />
            <p className="mt-8 text-emerald-600 animate-pulse font-heading text-xl tracking-wide">
              Analyzing Carbon Data...
            </p>
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
            {/* White Card - Main Container */}
            <div className="relative overflow-hidden bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-emerald-900/10">
              
              {/* Decorative Curved Corner - Top Left */}
              <div className="absolute top-6 left-6 w-24 h-24 border-t-[6px] border-l-[6px] border-emerald-400 rounded-tl-3xl pointer-events-none opacity-80" />
              
              {/* Decorative Curved Corner - Bottom Right */}
              <div className="absolute bottom-6 right-6 w-24 h-24 border-b-[6px] border-r-[6px] border-emerald-400 rounded-br-3xl pointer-events-none opacity-80" />

              {/* Content Wrapper with padding */}
              <div className="p-5 sm:p-8 md:p-10 relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="text-center mb-6 w-full">
                  <motion.div
                    className="inline-block mb-4 scale-100"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <DriveGreenLogo />
                  </motion.div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-gray-900 mb-2 tracking-tight">
                    Vehicle Carbon Emissions Predictor
                  </h1>
                  <p className="text-emerald-700/80 text-sm font-medium flex items-center justify-center gap-2">
                    <Leaf size={14} className="text-emerald-500" />
                    Determines your car's carbon emissions value
                  </p>
                </div>

                {/* Form - with explicit width constraint */}
                <form onSubmit={handleSubmit} className="space-y-5 w-full">
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="w-full"
                  >
                    <InputGroup label="Fuel Type" icon={Fuel}>
                      <div className="relative w-full">
                        <select
                          name="fuel_type"
                          value={form.fuel_type}
                          onChange={handleChange}
                          required
                          className={`${inputClasses} appearance-none cursor-pointer text-gray-700`}
                        >
                          <option
                            value=""
                            disabled
                            className="text-gray-400"
                          >
                            Select fuel type
                          </option>
                          <option value="X" className="text-gray-900">
                            Regular Gasoline
                          </option>
                          <option value="Z" className="text-gray-900">
                            Premium Gasoline
                          </option>
                          <option value="E" className="text-gray-900">
                            Ethanol (E85)
                          </option>
                          <option value="D" className="text-gray-900">
                            Diesel
                          </option>
                          <option value="N" className="text-gray-900">
                            Natural Gas
                          </option>
                        </select>
                        <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none w-5 h-5" />
                      </div>
                    </InputGroup>
                  </motion.div>

                  <div className="grid grid-cols-1 gap-5 w-full">
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <InputGroup label="Number of Cylinders" icon={Settings}>
                        <input
                          name="cylinders"
                          type="number"
                          min="3"
                          max="16"
                          placeholder="e.g. 7"
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
                      <InputGroup label="Engine Size (Liters)" icon={Gauge}>
                        <input
                          name="engine_size"
                          type="number"
                          step="0.1"
                          min="0.9"
                          max="8.4"
                          placeholder="e.g. 1.0"
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
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 10px 30px -10px rgba(52, 211, 153, 0.5)",
                    }}
                    whileTap={{ scale: 0.98 }}
                    disabled={
                      !form.fuel_type || !form.cylinders || !form.engine_size
                    }
                    className="w-full mt-4 py-3.5 rounded-full bg-[#6EE7B7] hover:bg-[#34D399] text-white font-bold font-heading text-lg shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed transition-all relative overflow-hidden"
                  >
                    <Zap className="w-6 h-6 fill-white stroke-white relative z-10" />
                    <span className="relative z-10 text-white drop-shadow-sm">Calculate Emission</span>
                    <TrendingUp className="w-5 h-5 text-white relative z-10 ml-1" />
                  </motion.button>
                </form>
              </div>

              {/* No more blurred background blobs, kept it clean white as requested */}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-start gap-3 w-full max-w-[95%] mx-auto pl-4">
              <div className="w-8 h-8 rounded-full bg-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/30">
                 <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="text-left">
                <span className="font-bold text-gray-700 text-sm block">AI-Powered Prediction</span>
                <span className="text-[10px] text-gray-400 font-medium">Data provided by EPA & Transport Canada standards.</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictionForm;
