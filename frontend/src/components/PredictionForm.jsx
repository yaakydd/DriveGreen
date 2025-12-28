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

/* Local components */
import Spinner from "./Spinner"; // Loading spinner component
import AnimationCard from "./AnimationCard"; // Component to display the final prediction result
import NeonCar from "./NeonCar"; // Animated background car component (previously fixed)
import DriveGreenLogo from "./DriveGreenLogo"; // Logo component
import AnimatedParticles from "./BackgroundParticles"; // Background particle animation component
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 font-mono">
      {/* min-h-screen: Ensures div takes full viewport height (100vh)
          relative: Establishes positioning context for absolute children
          overflow-hidden: Prevents scrollbars from background animations
          bg-gradient-to-br: Background gradient direction (bottom-right)
          from-gray-950 via-slate-900 to-gray-950: Dark gradient colors
          font-sans: Uses system's sans-serif font family */}

      {/* ===== AMBIENT BACKGROUND GLOWS ===== */}
      <div className="absolute inset-0 pointer-events-none">
        {/* absolute: Positioned relative to nearest relative parent
            inset-0: Sets top, right, bottom, left all to 0 (full coverage)
            pointer-events-none: Allows clicks to pass through to elements below */}
        
        {/* Left emerald glow */}
        <div
          className="absolute inset-0 bg-emerald-600/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 20% 50%)" }}
        />
        {/* bg-emerald-600/20: Emerald color at 20% opacity
            blur-[150px]: Large blur radius (150px) for soft glow effect
            opacity-15: Additional 15% opacity (combined with /20)
            clipPath: CSS shape - creates ellipse glow on left side of screen */}
        
        {/* Right cyan glow */}
        <div
          className="absolute inset-0 bg-cyan-500/20 blur-[150px] opacity-15"
          style={{ clipPath: "ellipse(60% 70% at 80% 50%)" }}
        />
        {/* bg-cyan-500/20: Cyan color at 20% opacity
            clipPath: Creates ellipse glow on right side of screen */}
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
                  <div className=" flex flex-col items-center border border-blue-900  top-12 border border-blue-900 ">
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

                    <h2 className="mt-0 pt-4 text-2xl font-extrabold text-slate-900 tracking-tight text-center">
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

                  {/* ===== FORM SECTION ===== */}
                  <div className="flex justify-center">
                    {/* px-8: Horizontal padding of 2rem (32px) - ENSURES all form content stays within borders */}

                    <form onSubmit={handleSubmit} className="space-y-10 w-full max-w-md">
                      {/* onSubmit: Calls handleSubmit when form is submitted
                          space-y-7: Vertical spacing of 1.75rem (28px) between form children - NICE spacing */}

                      
                      {/* ===== FUEL TYPE INPUT ===== */}
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, x: -30 }} // Start invisible, 30px left
                        animate={{ opacity: 1, x: 0 }} // Fade in and slide to position
                        transition={{ delay: 0.15 }} // 150ms delay
                      >
                        {/* space-y-3: Vertical spacing of 0.75rem (12px) between label and input */}
                        
                        <label className="flex items-center gap-3 text-lg font-bold text-emerald-600">
                          {/* flex items-center: Horizontal flex with vertical centering
                              gap-3: Gap of 0.75rem (12px) between icon and text
                              text-lg: Font size of 1.125rem (18px)
                              font-bold: Font weight of 700
                              text-emerald-600: Emerald green color (#10b981) */}
                          
                          <Fuel className="w-6 h-6" /> {/* Fuel icon, 24px */}
                          Fuel Type
                        </label>

                        <select
                          name="fuel_type" // Form field name (matches state key)
                          value={form.fuel_type} // Controlled input value from state
                          onChange={handleChange} // Calls handleChange on selection
                          required // HTML5 validation - field must be filled
                          className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg focus:ring-4 focus:ring-teal-500/50 focus:border-teal-500 transition-all shadow-inner hover:border-emerald-400 cursor-pointer appearance-none"
                          // w-full: Full width of parent
                          // p-5: Padding of 1.25rem (20px) on all sides
                          // bg-gray-50: Very light gray background (#f9fafb)
                          // border border-gray-300: Gray border 1px solid (#d1d5db)
                          // rounded-xl: Border radius of 0.75rem (12px)
                          // text-slate-800: Dark gray text (#1e293b)
                          // text-lg: Font size of 1.125rem (18px)
                             // focus:ring-4: 4px ring appears on focus
                              // focus:ring-teal-500/50: Teal ring at 50% opacity
                              // focus:border-teal-500: Teal border on focus (#14b8a6)
                              // transition-all: Smooth transitions for all properties
                              // shadow-inner: Inset shadow for depth
                              // hover:border-emerald-400: Emerald border on hover
                              // cursor-pointer: Pointer cursor on hover
                              // appearance-none: Removes default browser dropdown styling
        

                          style={{
                            // Custom dropdown arrow SVG
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2310B981' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat", // Don't repeat the arrow
                            backgroundPosition: "right 1.5rem center", // Position 24px from right, centered vertically
                            backgroundSize: "1.2em" // Arrow size relative to font size
                          }}
                        >
                          <option value="" disabled>Select fuel type</option> 
                          {/* Placeholder option, disabled so it can't be re-selected */}
                          
                          <option value="X">Regular Gasoline</option>
                          <option value="Z">Premium Gasoline</option>
                          <option value="E">Ethanol (E85)</option>
                          <option value="D">Diesel</option>
                          <option value="N">Natural Gas</option>
                        </select>
                      </motion.div>

                      {/* ===== CYLINDERS INPUT ===== */}
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, x: -30 }} // Start invisible, 30px left
                        animate={{ opacity: 1, x: 0 }} // Fade in and slide to position
                        transition={{ delay: 0.25 }} // 250ms delay (staggered after fuel type)
                      >
                        <label className="flex items-center gap-3 text-md font-bold text-slate-700">
                          {/* text-slate-700: Dark gray color (#334155) */}
                          
                          <Settings className="w-6 h-6" /> {/* Settings icon, 24px */}
                          Number of Cylinders
                        </label>

                        <input
                          name="cylinders" // Form field name
                          value={form.cylinders} // Controlled input value
                          onChange={handleChange} // Calls handleChange on input
                          required // HTML5 validation
                          type="number" // Number input type (shows numeric keyboard on mobile)
                          min="3" // Minimum value constraint
                          max="16" // Maximum value constraint
                          placeholder="e.g., 7" // Hint text when empty
                          className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-inner"
                          // w-full: Full width of parent
                          // p-5: Padding of 1.25rem (20px) on all sides
                          // bg-gray-50: Very light gray background (#f9fafb)
                          // border border-gray-300: Gray border 1px solid (#d1d5db)
                          // rounded-xl: Border radius of 0.75rem (12px)
                          // text-slate-800: Dark gray text (#1e293b)
                          // text-lg: Font size of 1.125rem (18px)
                          // placeholder-gray-400: Gray placeholder text (#9ca3af)
                          // focus:ring-cyan-500/50: Cyan ring at 50% opacity on focus
                          // focus:border-cyan-500: Cyan border on focus (#06b6d4)
                          // hover:border-cyan-400: Cyan border on hover
                        />
                      </motion.div>

                      {/* ===== ENGINE SIZE INPUT ===== */}
                      <motion.div
                        className="space-y-3"
                        initial={{ opacity: 0, x: -30 }} // Start invisible, 30px left
                        animate={{ opacity: 1, x: 0 }} // Fade in and slide to position
                        transition={{ delay: 0.35 }} // 350ms delay (staggered after cylinders)
                      >
                        <label className="flex items-center gap-3 text-lg font-bold text-slate-700">
                          <Gauge className="w-6 h-6" /> {/* Gauge icon, 24px */}
                          Engine Size (Liters)
                        </label>

                        <input
                          name="engine_size" // Form field name
                          value={form.engine_size} // Controlled input value
                          onChange={handleChange} // Calls handleChange on input
                          required // HTML5 validation
                          type="number" // Number input type
                          step="0.1" // Allows decimal values in increments of 0.1
                          min="0.9" // Minimum value
                          max="8.4" // Maximum value
                          placeholder="e.g. 1.0 " // Hint text
                          className="min-w-sm p-4 bg-gray-50 border border-gray-300 rounded-xl text-slate-800 text-lg placeholder-gray-400 focus:ring-4 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all hover:border-cyan-400 shadow-inner"
                        />
                      </motion.div>

                      {/* ===== SUBMIT BUTTON ===== */}
                      <motion.button
                        type="submit" // Submit button type
                        whileHover={{
                          scale: 1.03, // Grow to 103% on hover
                          boxShadow: "0 25px 50px rgba(15, 141, 99, 0.6)" // Large emerald shadow
                        }}
                        whileTap={{ scale: 0.90 }} // Shrink to 97% when clicked
                        disabled={!form.fuel_type || !form.cylinders || !form.engine_size}
                        // Disabled when any required field is empty
                           // Uses logical NOT (!) to check for empty strings 
                        
                        className="w-full relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500 text-white py-7 rounded-2xl font-black text-2xl shadow-2xl transition-all flex items-center justify-center gap-4 mt-13 group disabled:opacity-50 disabled:cursor-not-allowed"
                        // w-full: Full width
                        // relative: Positioning context for shine effect
                        // overflow-hidden: Clips shine effect within button
                        // bg-gradient-to-r: Horizontal gradient
                        // from-green-600 via-emerald-500 to-teal-500: Green gradient colors
                        // text-white: White text
                        // py-7: Vertical padding of 1.75rem (28px)
                        // rounded-2xl: Border radius of 1rem (16px)
                        // font-black: Font weight of 900 (heaviest)
                        // text-2xl: Font size of 1.5rem (24px)
                        // shadow-2xl: Extra large shadow
                        // transition-all: Smooth transitions
                        // flex items-center justify-center: Centered flex layout
                        // gap-4: Gap of 1rem (16px) between flex children
                        // mt-10: Top margin of 2.5rem (40px) - EXTRA spacing from inputs
                        // group: Enables group-hover utilities
                        // disabled:opacity-50: 50% opacity when disabled
                        // disabled:cursor-not-allowed: "Not allowed" cursor when disabled
                      >
                        {/* Animated shine effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        {/* absolute inset-0: Covers entire button
                            bg-gradient-to-r from-transparent via-white/30 to-transparent: White stripe
                            translate-x-[-200%]: Start 200% left (off-screen)
                            group-hover:translate-x-[200%]: Move 200% right on hover (across button)
                            transition-transform duration-1000: 1 second smooth slide */}

                        <motion.div 
                          animate={{ scale: [1, 1.15, 1] }} // Pulse animation
                          transition={{ 
                            duration: 1.5, // 1.5 second cycle
                            repeat: Infinity // Loop forever
                          }}
                        >
                          <Zap className="w-8 h-8 relative z-10" /> 
                          {/* Zap icon, 32px
                              relative z-10: Above shine effect */}
                        </motion.div>

                        <span className="relative z-10">Calculate Emission</span>
                        {/* relative z-10: Above shine effect */}
                        
                        <TrendingUp className="w-8 h-8 relative z-10" />
                        {/* TrendingUp icon, 32px, above shine effect */}
                      </motion.button>
                    </form>
                  </div>

                  {/* ===== FOOTER INFO SECTION ===== */}
                  <div className="mt-12 pt-8 border-t-2 border-gray-200 px-8">
                    {/* mt-12: Top margin of 3rem (48px)
                        pt-8: Top padding of 2rem (32px)
                        border-t-2: Top border 2px solid
                        border-gray-200: Light gray border (#e5e7eb)
                        px-8: Horizontal padding of 2rem (32px) - KEEPS footer within borders */}
                    
                    <div className="flex items-center justify-between text-sl text-slate-600">
                      {/* flex items-center justify-between: Flex layout with space between
                          text-sm: Font size of 0.875rem (14px)
                          text-slate-600: Medium gray text */}
                      
                      {/* Left info badge */}
                      <div className="flex items-center gap-3 bg-green-50 px-4 py-2 rounded-full">
                        {/* flex items-center gap-3: Horizontal flex with 12px gap
                            bg-green-50: Very light green background (#f0fdf4)
                            px-4: Horizontal padding of 1rem (16px)
                            py-2: Vertical padding of 0.5rem (8px)
                            rounded-full: Fully rounded (pill shape) */}
                        
                        <motion.div 
                          animate={{ scale: [1, 1.3, 1] }} // Pulse animation
                          transition={{ 
                            duration: 2, // 2 second cycle
                            repeat: Infinity // Loop forever
                          }}
                        >
                          <span className="w-5 h-5 bg-green-600 rounded-full block" />
                          {/* w-3 h-3: 12px x 12px
                              bg-green-600: Emerald green dot (#16a34a)
                              rounded-full: Circular
                              block: Block display for dimensions */}
                        </motion.div>
                        
                        <span className="font-semibold">AI-Powered Prediction</span>
                        <p className="text-xs text-slate-400">Data provided by EPA & Transport Canada standards.</p>
                   
                        {/* font-semibold: Font weight of 600 */}
                      </div>
                    </div>
                  </div>

                  {/* ===== DECORATIVE CORNER ELEMENTS ===== */}
                  {/* Top-left corner */}
                  <motion.div
                    className="absolute top-6 left-6 w-16 h-16 border-l-4 border-t-4 border-emerald-700/50 rounded-tl-2xl"
                    // absolute top-6 left-6: Positioned 24px from top and left
                    // w-16 h-16: 64px x 64px
                    // border-l-4: Left border 4px solid
                    // border-t-4: Top border 4px solid
                    // border-emerald-500/50: Emerald border at
                    // rounded-tl-2xl: Rounded top-left corner (16px)
                    initial={{ scale: 0 }} // Start scaled down
                    animate={{ scale: 1 }} // Scale up to normal size
                    transition={{ 
                      type: "spring", // Spring animation
                      stiffness: 120, // Moderate stiffness
                      delay: 0.5 // 500ms delay
                    }}
                  />

                  {/* Bottom-right corner */}
                  <motion.div
                    className="absolute bottom-6 right-6 w-16 h-16 border-r-4 border-b-4 border-teal-700/50 rounded-br-2xl"
                    // absolute bottom-6 right-6: Positioned 24px from bottom and right
                    // border-r-4: Right border 4px solid
                    // border-b-4: Bottom border 4px solid
                    // border-teal-500/50: Teal border at 50% opacity
                    // rounded-br-2xl: Rounded bottom-right corner (16px)
                    // corrected the errors here
                    initial={{ scale: 0 }} // Start scaled down
                    animate={{ scale: 1 }} // Scale up to normal size
                    transition={{ 
                      type: "spring", // Spring animation
                      stiffness: 120, // Moderate stiffness
                      delay: 0.6 // 600ms delay
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