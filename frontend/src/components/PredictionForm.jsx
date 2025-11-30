// ===== FINAL MERGED PREDICTION FORM - FIXED & COMMENTED =====
// File: frontend/src/components/PredictionForm.jsx

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* icons: all from lucide-react */
import {
  Leaf, // Icon for eco-friendliness
  Gauge, // Icon for engine size/measurement
  Settings, // Icon for cylinders/configuration
  Fuel, // Icon for fuel type
  Car, // Icon (unused but kept for context)
  Sparkles, // Icon for emphasis/special feature
  Activity, // Icon for real-time analysis
  Zap, // Icon for speed/calculation
  TrendingUp // Icon for prediction/trend
} from "lucide-react";

/* Local components (FIXED: Added AnimatedParticles import) */
import Spinner from "./Spinner"; // Loading spinner component
import AnimationCard from "./AnimationCard"; // Component to display the final prediction result
import NeonCar from "./NeonCar"; // Animated background car component (previously fixed)
import DriveGreenLogo from "./DriveGreenLogo"; // Logo component
import AnimatedParticles from "./BackgroundParticles"; // FIX: Import the missing particle background component
import toast from "react-hot-toast"; // External library for clean notifications

/* API URL (env fallback) - Defines the backend endpoint */
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * ===== COLOR SCHEME GUIDE =====
 * - emerald-600/500/etc: Primary green (e.g., #10B981) - Use for eco focus, success.
 * - teal-500/600/etc: Secondary teal (e.g., #14B8A6) - Use for supporting elements.
 * - cyan-500/etc: Accent blue (e.g., #06B6D4) - Use for contrast, highlights.
 * - slate-900/gray-950: Background dark shades - Use for dark mode theme.
 * - text-white/slate-600: Text colors.
 */

const PredictionForm = () => {
  // ===== STATE MANAGEMENT LOGIC =====
  
  // State for form inputs. The keys match the API's expected payload structure.
  const [form, setForm] = useState({
    fuel_type: "", // String for the selected fuel code (e.g., "X", "Z")
    cylinders: "", // String (will be converted to Int before API call)
    engine_size: "" // String (will be converted to Float before API call)
  });

  // State to store the result from the API call (e.g., { co2_emissions: 250.5 })
  const [prediction, setPrediction] = useState(null); 
  
  // State to manage the loading status (true when API request is active)
  const [loading, setLoading] = useState(false); 

  // ===== HANDLERS =====
  
  // Generic handler for all form inputs (select and text)
  const handleChange = (e) => {
    // Updates the `form` state by spreading previous values and overwriting
    // the field whose `name` attribute matches the input's name (e.g., 'fuel_type').
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Handler for form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents default browser form submission

    // Basic client-side validation check
    if (!form.fuel_type || !form.cylinders || !form.engine_size) {
      toast.error("Please fill all fields.", { icon: "🚨" });
      return; // Stop submission if validation fails
    }

    setLoading(true); // Start loading state
    setPrediction(null); // Clear previous prediction

    try {
      // Construct the payload, converting input strings to required numeric types
      const payload = {
        fuel_type: form.fuel_type,
        cylinders: parseInt(form.cylinders, 10), // Convert string to integer
        engine_size: parseFloat(form.engine_size) // Convert string to floating-point number
      };

      // API call to the backend
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST", // HTTP method
        headers: { "Content-Type": "application/json" }, // Specify JSON content
        body: JSON.stringify(payload) // Send payload as JSON string
      });

      if (!res.ok) {
        // Handle HTTP error statuses (4xx, 5xx)
        let errMsg = "Prediction failed";
        try {
          const errBody = await res.json();
          // Extract specific error message if available
          errMsg = errBody.detail || errBody.message || errMsg;
        } catch (parseErr) {
          // Fallback if response isn't readable JSON
        }
        throw new Error(errMsg); // Throw error to be caught below
      }

      const data = await res.json(); // Parse the successful JSON response
      setPrediction(data); // Store the prediction result

      // Show success notification
      toast.success("Prediction successful!", {
        icon: "🌍",
        style: {
          background: "#10b981", // Emerald-600 color
          color: "#fff"
        }
      });
    } catch (err) {
      console.error(err);
      // Show error notification with message from the error object
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: "⚠️"
      });
    } finally {
      setLoading(false); // End loading state, regardless of success or failure
    }
  };

  // Handler to clear results and reset the form
  const handleReset = () => {
    setPrediction(null); // Clear prediction
    setLoading(false); // Ensure loading is false
    setForm({ // Reset form inputs to initial empty state
      fuel_type: "",
      cylinders: "",
      engine_size: ""
    });
  };

  // ===== JSX RENDERING =====
  return (
    // Outer container for the entire page
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 font-sans">
      {/* min-h-screen: Ensures div takes full viewport height
          relative: Establishes context for absolute child elements
          overflow-hidden: Prevents scrollbars from background elements
          bg-gradient-to-br: Dark background gradient (bottom-right direction)
          from-gray-950/via-slate-900/to-gray-950: Colors for the dark gradient
          font-sans: Use the system's default sans-serif font (Change to a custom font like `font-mono` or a custom class if needed) */}

      {/* ===== AMBIENT BACKGROUND GLOWS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* absolute: Positioned relative to parent
            inset-0: Top, right, bottom, left are all 0 (covers entire parent)
            pointer-events-none: Ensures clicks pass through to content below */}
        <div
          className="absolute inset-0 bg-emerald-600/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 20% 50%)" }}
        />
        {/* bg-emerald-600/20: Background color is emerald at 20% opacity
            blur-[150px]: Large blur radius for a glow effect
            opacity-15: Low visibility
            clipPath: CSS property for shaping the element (ellipse for a circular/oval glow on the left) */}
        <div
          className="absolute inset-0 bg-cyan-500/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 80% 50%)" }}
        />
        {/* bg-cyan-500/20: Cyan background color
            clipPath: Ellipse for a glow on the right side */}
      </div>

      {/* ===== ANIMATED BACKGROUND PARTICLES (always present) ===== */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatedParticles />
        {/* The component for the constantly running background particle animation */}
      </div>

      {/* ===== NEON CAR BACKGROUND ===== */}
      {/* Show NeonCar only when NOT loading and when no prediction is displayed */}
      {!loading && !prediction && <NeonCar />} 
      {/* Conditionally renders the NeonCar component */}

      {/* ===== MAIN CONTENT AREA (Form/Spinner/Results) ===== */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        {/* relative z-10: Puts content layer above the background elements (z-index 10)
            flex items-center justify-center: Centers the content both vertically and horizontally
            p-6: Padding on all sides for spacing */}
            
        <AnimatePresence mode="wait">
          {/* AnimatePresence: Required for exit animations.
              mode="wait": Ensures only one child is present at a time, making transitions cleaner. */}
          
          {/* Conditional Rendering based on state (loading -> prediction -> form) */}
          
          {/* ===== LOADING STATE ===== */}
          {loading ? (
            <motion.div
              key="spinner" // Unique key for AnimatePresence to track this element
              initial={{ opacity: 0, scale: 0.9 }} // Start state (fades up slightly)
              animate={{ opacity: 1, scale: 1 }} // End/active state
              exit={{ opacity: 0, scale: 0.9 }} // Exit state (fades down slightly)
              transition={{ duration: 0.25 }} // Quick transition duration
              className="flex items-center justify-center w-full max-w-2xl"
            >
              <Spinner /> {/* Shows the loading spinner */}
            </motion.div>

            // ===== RESULTS STATE =====
          ) : prediction ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 40 }} // Starts transparent and below position
              animate={{ opacity: 1, y: 0 }} // Fades in and moves up
              exit={{ opacity: 0, y: -40 }} // Fades out and moves up when replaced
              transition={{ duration: 0.4 }} // Smooth transition duration
              className="w-full max-w-2xl"
            >
              {/* Displays the prediction result and the reset button */}
              <AnimationCard prediction={prediction} onReset={handleReset} /> 
            </motion.div>

            // ===== FORM STATE (Default) =====
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 30 }} // Starts transparent and slightly below
              animate={{ opacity: 1, y: 0 }} // Fades in and moves up
              exit={{ opacity: 0, scale: 0.95 }} // Fades out and shrinks slightly when replaced
              transition={{ duration: 0.35 }} // Transition duration
              className="w-full max-w-2xl" // Full width up to a max width of 2xl (48rem)
            >
              {/* ===== FORM CARD CONTAINER ===== */}
              <div className="relative group">
                {/* relative: Context for absolute children
                    group: Enables group-hover utility for children */}
                    
                {/* Animated glowing border effect (Behind the card) */}
                <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/70 via-cyan-500/70 to-teal-500/70 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-1000" />
                {/* -inset-3: Extends the border 3 units outside the card
                    bg-gradient-to-r: Rainbow-like gradient background
                    rounded-3xl: Large rounded corners
                    blur-xl: Extreme blur for glow effect
                    opacity-30/group-hover:opacity-60: Fades the glow in on hover
                    transition duration-1000: Long transition for smooth fade */}

                {/* Main form card (White background) */}
                <div className="relative bg-white rounded-3xl p-10 sm:p-14 shadow-2xl border border-gray-100">
                  {/* bg-white: White background
                      rounded-3xl: Large rounded corners
                      p-10 sm:p-14: Responsive padding (p-10 for small, p-14 for larger screens)
                      shadow-2xl: Large shadow for depth */}
                      
                  {/* ===== HEADER SECTION ===== */}
                  <div className="flex flex-col items-center mb-10">
                    {/* flex flex-col items-center: Stacked elements, centered horizontally */}
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }} // Starts tiny and rotated
                      animate={{ scale: 1, rotate: 0 }} // Springs into place
                      transition={{ type: "spring", stiffness: 150, delay: 0.1 }} // Spring animation for bounce effect
                    >
                      <DriveGreenLogo size="large" /> {/* Logo component */}
                    </motion.div>

                    <h2 className="mt-6 text-5xl font-extrabold text-slate-900 tracking-tight">
                      Eco-Score Calculator
                    </h2>
                    {/* mt-6: Top margin
                        text-5xl: Large font size
                        font-extrabold: Very bold text
                        text-slate-900: Dark text color */}
                  </div>

                  {/* Subtitle */}
                  <div className="text-center mb-10">
                    <p className="text-slate-600 text-xl font-medium flex items-center justify-center gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-500" /> {/* Sparkles icon */}
                      Predict CO₂ Emissions Using Advanced Metrics
                      <Leaf className="w-5 h-5 text-emerald-600" /> {/* Leaf icon */}
                    </p>
                    {/* text-slate-600: Medium gray text
                        text-xl font-medium: Large, semi-bold text
                        flex items-center justify-center gap-3: Centers and adds spacing between text and icons */}
                  </div>

                  {/* ===== FORM ===== */}
                  <form onSubmit={handleSubmit} className="space-y-8">
                    {/* space-y-8: Adds 8 units of vertical space between direct children */}
                    
                    {/* ===== FUEL TYPE INPUT (SELECT) ===== */}
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: -30 }} // Animation: Start off-screen left
                      animate={{ opacity: 1, x: 0 }} // Animation: Slide in
                      transition={{ delay: 0.15 }} // Staggered delay
                    >
                      <label className="flex items-center gap-3 text-lg font-bold text-emerald-600">
                        <Fuel className="w-6 h-6" />
                        Fuel Type
                      </label>
                      {/* text-emerald-600: Highlight color for label */}

                      <select
                        name="fuel_type"
                        value={form.fuel_type}
                        onChange={handleChange}
                        required
                        className="w-full p-5 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner hover:border-emerald-400 cursor-pointer appearance-none"
                        style={{
                          // Custom SVG for the dropdown arrow, styled with emerald color
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 1.5rem center",
                          backgroundSize: "1.2em"
                        }}
                      >
                        <option value="" disabled>Select fuel type</option> {/* Disabled placeholder option */}
                        <option value="X"> Regular Gasoline</option>
                        <option value="Z"> Premium Gasoline</option>
                        <option value="E"> Ethanol (E85)</option>
                        <option value="D"> Diesel</option>
                        <option value="N"> Natural Gas</option>
                      </select>
                      {/* appearance-none: Hides the native browser dropdown arrow */}
                    </motion.div>

                    {/* ===== CYLINDERS INPUT (NUMBER) ===== */}
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 }} // Increased stagger delay
                    >
                      <label className="flex items-center gap-3 text-xl font-bold text-slate-700">
                        <Settings className="w-7 h-7" />
                        Number of Cylinders
                      </label>

                      <input
                        name="cylinders"
                        value={form.cylinders}
                        onChange={handleChange}
                        required
                        type="number"
                        min="3" // Minimum allowed value
                        max="16" // Maximum allowed value
                        placeholder="e.g., 6 cylinders"
                        className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-3 border-gray-300 rounded-2xl text-slate-800 text-xl font-medium placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-lg"
                      />
                      {/* bg-gradient-to-r: Light background gradient
                          border-3: Medium border width
                          focus:ring-4/focus:border-cyan-500: Cyan focus ring/border */}
                    </motion.div>

                    {/* ===== ENGINE SIZE INPUT (NUMBER) ===== */}
                    <motion.div
                      className="space-y-3"
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 }} // Increased stagger delay
                    >
                      <label className="flex items-center gap-3 text-xl font-bold text-slate-700">
                        <Gauge className="w-7 h-7" />
                        Engine Size (Liters)
                      </label>

                      <input
                        name="engine_size"
                        value={form.engine_size}
                        onChange={handleChange}
                        required
                        type="number"
                        step="0.1" // Allows decimal input (e.g., 2.5)
                        min="0.9"
                        max="8.4"
                        placeholder="e.g., 2.0 liters"
                        className="w-full p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-3 border-gray-300 rounded-2xl text-slate-800 text-xl font-medium placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-lg"
                      />
                    </motion.div>

                    {/* ===== SUBMIT BUTTON ===== */}
                    <motion.button
                      type="submit"
                      // Framer motion properties for hover/tap effects
                      whileHover={{
                        scale: 1.03, // Slight enlargement on hover
                        boxShadow: "0 25px 50px rgba(16, 185, 129, 0.6)" // Large, colored shadow on hover
                      }}
                      whileTap={{ scale: 0.97 }} // Slight shrink on press
                      // Disable button if any required field is empty
                      disabled={!form.fuel_type || !form.cylinders || !form.engine_size} 
                      className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-7 rounded-2xl font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 mt-6 group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {/* bg-gradient-to-r: Green/Teal gradient background
                          py-7: Large vertical padding
                          rounded-2xl: Medium rounded corners
                          group: Enables group-hover utility */}
                          
                      {/* Animated shine effect on hover (white/transparent stripe) */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      {/* translate-x-[-200%]: Starts off-screen to the left
                          group-hover:translate-x-[200%]: Slides across the button on hover */}

                      <motion.div 
                        // Icon pulse animation
                        animate={{ scale: [1, 1.15, 1] }} 
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Zap className="w-8 h-8 relative z-10" />
                      </motion.div>

                      <span className="relative z-10">Calculate Emissions</span>
                      <TrendingUp className="w-8 h-8 relative z-10" />
                    </motion.button>
                  </form>

                  {/* ===== FOOTER INFO SECTION ===== */}
                  <div className="mt-10 pt-8 border-t-2 border-gray-200">
                    {/* mt-10/pt-8: Large vertical spacing
                        border-t-2: Top border for visual separation */}
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      {/* Left info badge */}
                      <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full">
                        <motion.div 
                          // Dot pulse animation
                          animate={{ scale: [1, 1.3, 1] }} 
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <span className="w-3 h-3 bg-green-600 rounded-full block" />
                        </motion.div>
                        <span className="font-semibold">AI-Powered Prediction</span>
                      </div>
                      {/* bg-green-50: Very light green background
                          px-4 py-2: Padding for the badge
                          rounded-full: Pill shape */}

                      {/* Right info badge */}
                      <div className="flex items-center gap-3 bg-cyan-50 px-4 py-2 rounded-full">
                        <Activity className="w-4 h-4 text-cyan-600" />
                        <span className="font-semibold">Real-time Analysis</span>
                      </div>
                      {/* bg-cyan-50: Very light cyan background */}
                    </div>
                  </div>

                  {/* ===== DECORATIVE CORNER ELEMENTS (Framer Motion) ===== */}
                  <motion.div
                    className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-emerald-500/50 rounded-tl-2xl"
                    // Animation: Fades in and out
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  {/* absolute top-6 left-6: Positioned near the top-left corner
                      border-l-4/border-t-4: Corner border styling
                      border-emerald-500/50: Semi-transparent emerald border */}
                      
                  <motion.div
                    className="absolute top-6 right-6 w-16 h-16 border-r-4 border-t-4 border-cyan-500/50 rounded-tr-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 0.5 }} // Staggered delay
                  />
                  {/* border-cyan-500/50: Semi-transparent cyan border */}
                  
                  <motion.div
                    className="absolute bottom-6 left-6 w-16 h-16 border-l-4 border-b-4 border-emerald-500/50 rounded-bl-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1 }} // Staggered delay
                  />
                  
                  <motion.div
                    className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-cyan-500/50 rounded-br-2xl"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }} // Staggered delay
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