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

      {/* ===== ANIMATED BACKGROUND PARTICLES (always visible) ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatedParticles />
        {/* Renders floating particle animations in background
            Always visible regardless of form/loading/results state */}
      </div>

      {/* ===== NEON CAR BACKGROUND (conditional) ===== */}
      {!loading && !prediction && <NeonCar />}
      {/* Conditional rendering: Only shows car when:
          - NOT in loading state (!loading)
          - AND NOT showing prediction results (!prediction)
          - Hides during loading/results to reduce visual clutter */}

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {/* relative z-10: Positions above background layers (z-index: 10)
            flex: Enables flexbox layout
            items-center: Vertically centers flex children
            justify-center: Horizontally centers flex children
            min-h-screen: Minimum height of 100vh (full viewport)
            p-6: Padding of 1.5rem (24px) on all sides */}
            
        <AnimatePresence mode="wait">
          {/* AnimatePresence: Enables exit animations for children
              mode="wait": Only one child visible at a time, waits for exit before entering */}
          
          {/* ===== LOADING STATE ===== */}
          {loading ? (
            <motion.div
              key="spinner" // Unique key for AnimatePresence to track component
              initial={{ opacity: 0, scale: 0.9 }} // Starting animation state
              animate={{ opacity: 1, scale: 1 }} // Active/visible state
              exit={{ opacity: 0, scale: 0.9 }} // Exiting animation state
              transition={{ duration: 0.25 }} // Animation duration (250ms)
              className="flex items-center justify-center w-full max-w-2xl"
              // flex items-center justify-center: Centers spinner
              // w-full: Full width of parent
              // max-w-2xl: Maximum width of 42rem (672px)
              >
                <Spinner /> {/* Imported loading spinner component */}
              </motion.div>

          // ===== RESULTS STATE =====
          ) : prediction ? (
            <motion.div
              key="result" // Unique key for AnimatePresence
              initial={{ opacity: 0, y: 40 }} // Start invisible, 40px below
              animate={{ opacity: 1, y: 0 }} // Fade in and slide to position
              exit={{ opacity: 0, y: -40 }} // Fade out and slide up
              transition={{ duration: 0.4 }} // 400ms transition
              className="w-full max-w-2xl" // w-full: Full width of parent  
            >
              <AnimationCard 
                prediction={prediction} // Pass prediction data as prop
                onReset={handleReset} // Pass reset handler as prop
              />
              {/* Imported results display component */}
            </motion.div>

          // ===== FORM STATE (default) =====
          ) : (
            <motion.div
              key="form" // Unique key for AnimatePresence
              initial={{ opacity: 0, y: 30 }} // Start invisible, 30px below
              animate={{ opacity: 1, y: 0 }} // Fade in and slide to position
              exit={{ opacity: 0, scale: 0.75 }} // Fade out and shrink to 75%
              transition={{ duration: 0.35 }} // 350ms transition
              className="w-full max-w-3xl mx-auto justify-center"
              // w-full: Full width
              // max-w-3xl: Maximum width of 48rem (768px) - wider for better form layout
            >
              {/* ===== FORM CARD WRAPPER ===== */}
              <div className="relative group">
                {/* relative: Positioning context for absolute children
                    group: Enables group-hover utilities for child elements */}
                    
                {/* Animated glowing border effect (positioned behind card) */}
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-teal-500/70 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />
                {/* absolute: Absolute positioning
                    -inset-3: Negative inset extends element 0.75rem (12px) outside parent
                    bg-gradient-to-r: Horizontal gradient (left to right)
                    from-emerald-500/70 via-cyan-500/70 to-teal-500/70: Gradient colors at 70% opacity
                    rounded-3xl: Border radius of 1.5rem (24px)
                    blur-xl: Blur filter of 24px for glow effect
                    opacity-30: 30% opacity in default state
                    group-hover:opacity-60: 60% opacity when parent is hovered
                    transition duration-1000: 1 second smooth transition */}

                {/* Main form card (white background) */}
                <div className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 pt-20 pb-20 px-6 overflow-hidden">

                  {/* relative: Stacks above the glow effect
                      bg-white: White background (#ffffff)
                      rounded-3xl: Border radius of 1.5rem (24px)
                      p-12: Padding of 3rem (48px) on all sides
                      shadow-2xl: Extra large shadow for depth
                      border border-gray-100: Light gray border (1px solid) */}
                      
                                            {/* ===== HEADER SECTION ===== */}
                  <div className=" flex flex-col items-center mb-12 px-8  border border-blue-900 overflow-hidden">
                    {/* flex flex-col: Vertical flex layout
                        items-center: Horizontally center children
                        mb-12: Bottom margin of 3rem (48px)
                        px-8: Horizontal padding of 2rem (32px) - KEEPS content within borders */}
                    
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }} // Start tiny and rotated
                      animate={{ scale: 1, rotate: 0 }} // Grow to full size and straighten
                      transition={{ 
                        type: "spring", // Spring physics animation
                        stiffness: 150, // Spring stiffness (150 is moderate)
                        delay: 0.1 // 100ms delay before animation starts
                      }}
                    >
                      <DriveGreenLogo size="large" /> {/* Imported logo component */}
                    </motion.div>

                    <h2 className="mt-4 text-2xl font-extrabold text-slate-900 tracking-tight text-center">
                      Vehicle Carbon Emissions Predictor
                    </h2>
                    {/* mt-7: Top margin of 1.75rem (28px)
                        text-5xl: Font size of 3rem (48px)
                        font-extrabold: Font weight of 800
                        text-slate-900: Very dark gray color (#0f172a)
                        tracking-tight: Slightly tighter letter spacing
                        text-center: Center-aligned text */}
                  </div>

                  {/* Subtitle */}
                  <div className="flex justify-center items-center mb-10 px-8 border-2 border-black-900">
                    {/* text-center: Center-align text
                        mb-12: Bottom margin of 3rem (48px)
                        px-8: Horizontal padding of 2rem (32px) */}
                    
                    <p className="text-slate-600 text-lg font-medium flex items-center justify-center gap-3">
                      {/* text-slate-600: Medium gray color (#475569)
                          text-xl: Font size of 1.25rem (20px)
                          font-medium: Font weight of 500
                          flex items-center justify-center: Centered flex layout
                          gap-3: Gap of 0.75rem (12px) between flex children */}
                      
                      <Leaf className="w-5 h-5 text-emerald-600" /> {/* Leaf icon, 20px, emerald color */}
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
