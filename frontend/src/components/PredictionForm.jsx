// ===== IMPORTS =====
// Import React library - needed for creating React components
import React, { useState } from "react";

// Import animation libraries from Framer Motion
// - motion: Creates animated HTML elements
// - AnimatePresence: Handles animations when components appear/disappear
import { motion, AnimatePresence } from "framer-motion";

// Import icons from Lucide React icon library
// These are SVG icons that can be styled with CSS
import { Leaf, Gauge, Settings, Fuel, Car } from "lucide-react";

// Import custom components we created
import Spinner from "./Spinner";           // Loading animation component
import AnimationCard from "./AnimationCard"; // Results display component

// Import toast notifications library for success/error messages
import toast from "react-hot-toast";

// ===== API CONFIGURATION =====
// Get API URL from environment variable, or use localhost as fallback
// import.meta.env.VITE_API_URL comes from .env file
// || means "OR" - if left side is empty, use right side
const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

/**
 * ===== MAIN COMPONENT =====
 * PredictionForm Component (Arrow Function)
 * 
 * Purpose: Main form for CO2 emissions prediction
 * Features:
 * - Collects vehicle data from user
 * - Sends data to backend API
 * - Displays results
 * - Shows animated vehicle in background
 */
const PredictionForm = () => {
  
  // ===== STATE MANAGEMENT =====
  // useState creates state variables that trigger re-renders when changed
  
  // form state: Stores all form input values
  // setForm: Function to update form state
  // Initial value: Object with empty strings for each field
  const [form, setForm] = useState({
    fuel_type: "",    // Selected fuel type (X, Z, E, D, or N)
    cylinders: "",    // Number of cylinders (2-16)
    engine_size: ""   // Engine size in liters (0.1-10)
  });
  
  // prediction state: Stores API response data
  // null means no prediction yet
  const [prediction, setPrediction] = useState(null);
  
  // loading state: Controls spinner visibility
  // false means not loading initially
  const [loading, setLoading] = useState(false);

  // ===== EVENT HANDLERS =====
  
  /**
   * handleChange - Updates form state when user types
   * 
   * @param {Event} e - Browser event object containing input information
   * 
   * How it works:
   * 1. User types in input field
   * 2. Browser creates event object with input details
   * 3. This function extracts name and value from event
   * 4. Updates only that specific field in form state
   */
  const handleChange = (e) => {
    // setForm takes a function that receives previous state (prev)
    // ...prev spreads (copies) all existing values
    // [e.target.name]: value updates specific field by name
    // e.target.name is the "name" attribute of the input (e.g., "fuel_type")
    // e.target.value is what user typed
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /**
   * handleSubmit - Sends prediction request to backend
   * 
   * @param {Event} e - Form submit event
   * 
   * Flow:
   * 1. Prevent page reload
   * 2. Show spinner
   * 3. Send data to API
   * 4. Display results or error
   */
  const handleSubmit = async (e) => {
    // Prevent default form submission (which would reload page)
    e.preventDefault();
    
    // Show loading spinner
    setLoading(true);
    
    // Clear any previous prediction
    setPrediction(null);

    // try-catch: Handle errors gracefully
    try {
      // ===== PREPARE DATA FOR API =====
      // Create object with properly formatted data
      const payload = {
        fuel_type: form.fuel_type,                    // String: "X", "Z", etc.
        cylinders: parseInt(form.cylinders, 10),      // Convert string to integer (base 10)
        engine_size: parseFloat(form.engine_size)     // Convert string to decimal number
      };

      // ===== SEND REQUEST TO BACKEND =====
      // fetch: Modern way to make HTTP requests
      // await: Wait for response before continuing
      const res = await fetch(`${API_URL}/api/predict`, {
        method: "POST",                              // POST = sending data
        headers: { "Content-Type": "application/json" }, // Tell server we're sending JSON
        body: JSON.stringify(payload)                // Convert JavaScript object to JSON string
      });

      // ===== CHECK IF REQUEST SUCCEEDED =====
      // res.ok is false if status code is 400-599 (error)
      if (!res.ok) {
        // Parse error response from server
        const error = await res.json();
        
        // throw: Stop execution and jump to catch block
        // Create Error object with message from server or default message
        throw new Error(error.detail || "Prediction failed");
      }

      // ===== PARSE SUCCESSFUL RESPONSE =====
      // Convert JSON response to JavaScript object
      const data = await res.json();
      
      // ⚡ NO DELAY - Results appear immediately
      // (Previously had: await new Promise(resolve => setTimeout(resolve, 1500));)
      
      // Store prediction data in state (triggers re-render to show results)
      setPrediction(data);
      
      // ✅ CRITICAL FIX: Set loading to false so AnimationCard appears
      setLoading(false);
      
      // Show success notification
      toast.success("Prediction successful!", {
        icon: '🌍',                    // Custom icon
        style: {
          background: '#10b981',       // Green background
          color: '#fff',               // White text
        }
      });
      
    } catch (err) {
      // ===== HANDLE ERRORS =====
      // Log error to browser console for debugging
      console.error(err);
      
      // Show error notification to user
      toast.error(err.message || "Prediction failed. Check your inputs.", {
        icon: '⚠️',                    // Warning icon
      });
      
      // Hide loading spinner
      setLoading(false);
    }
    // Note: If successful, loading stays true until AnimationCard appears
  };

  /**
   * handleReset - Resets form to initial state
   * 
   * Called when user clicks "Make Another Prediction"
   */
  const handleReset = () => {
    // Clear prediction data (hides result card)
    setPrediction(null);
    
    // Hide loading spinner
    setLoading(false);
    
    // Reset all form fields to empty strings
    setForm({
      fuel_type: "",
      cylinders: "",
      engine_size: ""
    });
  };

  // ===== JSX RETURN (UI STRUCTURE) =====
  return (
    // Main container
    // min-h-screen: Minimum height = full viewport height
    // relative: Position context for absolute children
    // overflow-hidden: Hide content that goes outside boundaries
    // bg-gradient-to-br: Background gradient from top-left to bottom-right
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      
      {/* ===== BACKGROUND ANIMATIONS ===== */}
      {/* This section creates the animated vehicle and smoke */}
      
      {/* Container for all background animations */}
      {/* absolute: Positioned relative to parent */}
      {/* inset-0: top:0, right:0, bottom:0, left:0 (fills entire parent) */}
      {/* pointer-events-none: Can't be clicked (allows clicking through to form) */}
      {/* opacity-40: 40% transparent */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        
        {/* ===== ANIMATED VEHICLE ===== */}
        {/* motion.div: Animated div from Framer Motion */}
        <motion.div
          className="absolute"              // Positioned absolutely
          style={{ 
            top: '15%',                      // 15% from top of screen
            left: '-150px'                   // Start 150px off left edge (invisible)
          }}
          // animate: Target animation values
          animate={{
            x: ['0vw', '110vw']              // Move from 0% to 110% of viewport width
            // Array means: start at first value, end at second value
            // vw = viewport width (responsive to screen size)
          }}
          // transition: How animation behaves
          transition={{
            duration: 20,                    // Takes 20 seconds to complete
            repeat: Infinity,                // Loop forever
            ease: "linear",                  // Constant speed (no acceleration)
            repeatDelay: 2                   // Wait 2 seconds before restarting
          }}
        >
          {/* ===== VEHICLE SVG (Car Drawing) ===== */}
          {/* SVG: Scalable Vector Graphics - drawn with code, not pixels */}
          <svg 
            width="140"                      // SVG canvas width
            height="70"                      // SVG canvas height
            viewBox="0 0 140 70"            // Coordinate system (left top right bottom)
            className="drop-shadow-2xl"     // Add shadow for depth
          >
            {/* g: Group element - groups shapes together */}
            {/* opacity="0.8": 80% opaque (slightly transparent) */}
            <g opacity="0.8">
              
              {/* Car Body - Main rectangle */}
              {/* rect: Rectangle shape */}
              <rect 
                x="20"                       // X position (20 pixels from left)
                y="35"                       // Y position (35 pixels from top)
                width="100"                  // Width in pixels
                height="22"                  // Height in pixels
                rx="3"                       // Border radius (rounded corners)
                fill="#EF4444"              // Fill color (red)
                stroke="#DC2626"            // Border color (darker red)
                strokeWidth="2"             // Border thickness
              />
              
              {/* Car Roof - Polygon shape */}
              {/* path: Complex shape defined by coordinates */}
              {/* d: Drawing commands (M=move, L=line) */}
              <path 
                d="M 35 35 L 42 20 L 88 20 L 95 35 Z"  // M=start, L=line to, Z=close path
                // Creates trapezoid shape for roof
                fill="#F87171"              // Light red
                stroke="#EF4444"            // Border
                strokeWidth="2"
              />
              
              {/* Front Window */}
              <path 
                d="M 45 23 L 50 32 L 65 32 L 65 23 Z"  // Polygon for window
                fill="#93C5FD"              // Light blue (glass)
                opacity="0.5"               // 50% transparent
              />
              
              {/* Back Window - FIXED: Changed coordinates to match roof */}
              <path 
                d="M 70 23 L 70 32 L 85 32 L 82 23 Z"
                fill="#93C5FD"
                opacity="0.5"
              />
              
              {/* Wheels - Circles */}
              {/* cx, cy: Center X and Y coordinates */}
              {/* r: Radius */}
              
              {/* Front wheel outer */}
              <circle 
                cx="40"                      // Center X
                cy="57"                      // Center Y
                r="10"                       // Radius (size)
                fill="#1F2937"              // Dark gray
                stroke="#111827"            // Darker border
                strokeWidth="2"
              />
              
              {/* Front wheel inner (rim) */}
              <circle 
                cx="40" 
                cy="57" 
                r="5"                        // Smaller radius
                fill="#4B5563"              // Medium gray
              />
              
              {/* Back wheel outer */}
              <circle 
                cx="100" 
                cy="57" 
                r="10" 
                fill="#1F2937" 
                stroke="#111827" 
                strokeWidth="2"
              />
              
              {/* Back wheel inner */}
              <circle 
                cx="100" 
                cy="57" 
                r="5" 
                fill="#4B5563"
              />
              
              {/* Headlight */}
              <circle 
                cx="118"                     // Near front of car
                cy="45" 
                r="3"                        // Small circle
                fill="#FDE047"              // Yellow
              />
              
              {/* ===== EXHAUST PIPE (WHERE CO2 COMES FROM) ===== */}
              <rect 
                x="15"                       // Back of car
                y="48"                       // Bottom area
                width="8"                    // Small rectangle
                height="5" 
                rx="2"                       // Slightly rounded
                fill="#374151"              // Dark gray
                stroke="#1F2937"
                strokeWidth="1"
              />
            </g>
          </svg>

          {/* ===== CO2 EMISSIONS FROM EXHAUST ===== */}
          {/* Container positioned at exhaust pipe location */}
          <div 
            className="absolute"            // Position relative to vehicle
            style={{ 
              left: '15px',                  // Match exhaust pipe X position
              top: '48px'                    // Match exhaust pipe Y position
            }}
          >
            
            {/* ===== SMOKE PUFFS ===== */}
            {/* Create array of 10 items, map over them to create 10 smoke puffs */}
            {/* [...Array(10)]: Creates array [undefined, undefined, ...] with 10 items */}
            {/* .map((_, i) => ...): Loop through array, i = index (0, 1, 2, ...) */}
            {[...Array(10)].map((_, i) => (
              // Each smoke puff is animated div
              <motion.div
                key={`smoke-${i}`}           // Unique key required by React for lists
                className="absolute"
                // animate: Animation keyframes
                animate={{
                  // x: Horizontal position
                  // Moves backward from car, each puff slightly further
                  x: [
                    -10,                     // Start position
                    -35 - (i * 15),         // Middle position (further for later puffs)
                    -60 - (i * 25)          // End position
                  ],
                  // y: Vertical position (upward float)
                  y: [0, -12, -22],
                  // opacity: Visibility (fade in then out)
                  opacity: [0, 0.6, 0.3, 0],
                  // scale: Size (starts small, expands)
                  scale: [0.4, 1, 1.5, 2]
                }}
                // transition: Animation timing
                transition={{
                  duration: 2.5,             // Takes 2.5 seconds
                  repeat: Infinity,          // Loop forever
                  ease: "easeOut",          // Slow down at end
                  delay: i * 0.25           // Each puff starts 0.25s after previous
                  // i=0: 0s delay, i=1: 0.25s delay, i=2: 0.5s delay, etc.
                }}
              >
                {/* Actual smoke cloud visual */}
                {/* w-8 h-8: 32px x 32px */}
                {/* bg-gray-600/70: Gray color at 70% opacity */}
                {/* rounded-full: Perfect circle */}
                {/* blur-lg: Large blur effect */}
                <div className="w-8 h-8 bg-gray-600/70 rounded-full blur-lg"></div>
              </motion.div>
            ))}

            {/* ===== CO2 TEXT LABELS ===== */}
            {/* Similar to smoke puffs but shows "CO₂" text */}
            {/* Only 5 labels (fewer than smoke puffs) */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`co2-${i}`}
                className="absolute"
                animate={{
                  // Follows smoke trail
                  x: [-15, -45 - (i * 20), -80 - (i * 30)],
                  y: [0, -18, -28],
                  opacity: [0, 0.7, 0.4, 0],
                  scale: [0.6, 1.1, 1.4]
                }}
                transition={{
                  duration: 3,               // Slightly slower than smoke
                  repeat: Infinity,
                  ease: "easeOut",
                  delay: i * 0.5            // More delay between labels
                }}
              >
                {/* CO₂ text */}
                {/* text-orange-400/80: Orange at 80% opacity */}
                {/* font-bold: Bold weight */}
                {/* text-base: 16px size */}
                {/* whitespace-nowrap: Don't break to new line */}
                {/* select-none: Can't be selected/copied */}
                <span className="text-orange-400/80 font-bold text-base select-none">
                  CO₂
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ===== AMBIENT BACKGROUND PARTICLES ===== */}
        {/* Small floating dots for atmosphere */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className="absolute rounded-full"
            style={{
              // Random size between 3-9 pixels
              width: Math.random() * 6 + 3,
              height: Math.random() * 6 + 3,
              // Random position across screen
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              // Random gray color with transparency
              // rgba(red, green, blue, alpha)
              // Math.random() creates number between 0-1
              background: `rgba(${156 + Math.random() * 50}, ${163 + Math.random() * 50}, ${175}, 0.2)`
            }}
            animate={{
              y: [0, -100, 0],             // Float up and down
              opacity: [0.2, 0.4, 0.2],    // Pulse visibility
              scale: [1, 1.3, 1]           // Grow and shrink
            }}
            transition={{
              duration: 5 + Math.random() * 5,  // 5-10 seconds
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 3     // 0-3 seconds start delay
            }}
          />
        ))}
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      {/* Container for form/spinner/results */}
      {/* relative z-10: Above background (z-index stacking) */}
      {/* flex items-center justify-center: Center content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        
        {/* ===== ANIMATED CONTENT SWITCHING ===== */}
        {/* AnimatePresence: Handles animations when switching between components */}
        {/* mode="wait": Wait for exit animation before enter animation */}
        <AnimatePresence mode="wait">
          
          {/* ===== CONDITIONAL RENDERING ===== */}
          {/* JavaScript ternary: condition ? ifTrue : ifFalse */}
          {/* Shows different content based on state */}
          
          {/* CASE 1: LOADING STATE - Show Spinner */}
          {loading ? (
            <motion.div
              key="spinner"                  // Unique key for AnimatePresence
              // initial: Starting state (invisible, small)
              initial={{ opacity: 0, scale: 0.8 }}
              // animate: Target state (visible, normal size)
              animate={{ opacity: 1, scale: 1 }}
              // exit: State when removing (invisible, small)
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }} // Animation takes 0.3 seconds
            >
              {/* Render Spinner component */}
              <Spinner />
            </motion.div>
          
          // CASE 2: PREDICTION EXISTS - Show Results
          ) : prediction ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 50 }}    // Start below, invisible
              animate={{ opacity: 1, y: 0 }}     // End at position, visible
              exit={{ opacity: 0, y: -50 }}      // Exit upward, invisible
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"       // Full width, max 672px
            >
              {/* Render AnimationCard with prediction data */}
              {/* Pass prediction data and reset function as props */}
              <AnimationCard 
                prediction={prediction}          // Data to display
                onReset={handleReset}           // Function to call on reset
              />
            </motion.div>
          
          // CASE 3: DEFAULT - Show Form
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}    // Start slightly below
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}  // Exit shrinking
              transition={{ duration: 0.3 }}
              className="w-full max-w-md"        // Full width, max 448px
            >
              
              {/* ===== FORM CONTAINER ===== */}
              {/* relative: Position context for absolute children */}
              {/* bg-gradient-to-br: Diagonal gradient background */}
              {/* /95: 95% opacity */}
              {/* backdrop-blur-xl: Blur background behind */}
              {/* rounded-3xl: Very rounded corners */}
              {/* p-8: 32px padding */}
              {/* shadow-2xl: Large shadow */}
              {/* border: 1px border */}
              {/* border-orange-500/20: Orange border at 20% opacity */}
              <div className="relative bg-gradient-to-br from-gray-800/95 via-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-orange-500/20">
                
                {/* ===== GLOWING BORDER EFFECT ===== */}
                {/* Creates glow around form */}
                {/* absolute inset-0: Covers entire parent */}
                {/* rounded-3xl: Match parent corners */}
                {/* blur-xl: Large blur */}
                {/* -z-10: Behind content (negative z-index) */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-yellow-500/20 blur-xl -z-10"></div>
                
                {/* ===== HEADER SECTION ===== */}
                {/* text-center: Center align text */}
                {/* mb-8: 32px bottom margin */}
                {/* space-y-5: 20px vertical gap between children */}
                <div className="text-center mb-8 space-y-5">
                  
                  {/* ===== ANIMATED ICON ===== */}
                  <motion.div
                    // Start invisible and rotated
                    initial={{ scale: 0, rotate: -180 }}
                    // End visible and upright
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ 
                      type: "spring",        // Bouncy animation
                      stiffness: 200,        // How "springy"
                      delay: 0.1             // Start after 0.1s
                    }}
                    // relative: Position context
                    // inline-block: Inline but can have dimensions
                    className="relative inline-block"
                  >
                    {/* Glow effect behind icon */}
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-xl opacity-50"></div>
                    
                    {/* Icon container */}
                    {/* w-20 h-20: 80px x 80px */}
                    {/* mx-auto: Center horizontally */}
                    {/* border-2: 2px border */}
                    <div className="relative w-20 h-20 bg-gradient-to-br from-orange-500/30 to-red-500/30 rounded-full flex items-center justify-center mx-auto border-2 border-orange-500/50">
                      {/* Car icon from Lucide */}
                      {/* w-10 h-10: 40px x 40px */}
                      {/* text-orange-400: Orange color */}
                      <Car className="w-10 h-10 text-orange-400" />
                    </div>
                  </motion.div>

                  {/* ===== TITLE AND SUBTITLE ===== */}
                  <div className="space-y-3">
                    {/* Main title */}
                    {/* text-4xl: 36px font size */}
                    {/* font-bold: Bold weight */}
                    {/* bg-gradient-to-r: Horizontal gradient */}
                    {/* bg-clip-text: Clip gradient to text */}
                    {/* text-transparent: Make text transparent (shows gradient) */}
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-yellow-400 bg-clip-text text-transparent">
                      CO₂ Emissions Calculator
                    </h1>
                    
                    {/* Subtitle */}
                    {/* text-gray-400: Gray color */}
                    {/* text-sm: 14px font size */}
                    {/* flex items-center justify-center gap-2: Flexbox layout with 8px gap */}
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      {/* Leaf icon */}
                      <Leaf className="w-4 h-4 text-green-400" />
                      Track your vehicle's carbon footprint
                    </p>
                  </div>
                </div>

                {/* ===== FORM ELEMENT ===== */}
                {/* onSubmit: Called when form is submitted */}
                {/* space-y-6: 24px vertical gap between children */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* ===== FUEL TYPE INPUT ===== */}
                  {/* motion.div: Animated div */}
                  <motion.div 
                    className="space-y-2"            // 8px gap between label and input
                    // Slide in from left
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}      // Animate after 0.2s
                  >
                    {/* Label */}
                    {/* flex items-center gap-2: Icon and text in row with 8px gap */}
                    {/* text-sm: 14px */}
                    {/* font-semibold: Semi-bold weight */}
                    {/* text-orange-400: Orange color */}
                    <label className="flex items-center gap-2 text-sm font-semibold text-orange-400">
                      <Fuel className="w-4 h-4" />
                      Fuel Type
                    </label>
                    
                    {/* Select dropdown */}
                    <select
                      name="fuel_type"               // Name attribute (used in handleChange)
                      value={form.fuel_type}         // Controlled input (value from state)
                      onChange={handleChange}        // Update state on change
                      required                       // HTML5 validation (must select)
                      // w-full: 100% width
                      // p-4: 16px padding
                      // bg-gray-900/80: Dark background at 80% opacity
                      // border-2: 2px border
                      // border-orange-500/30: Orange border at 30% opacity
                      // rounded-xl: Rounded corners
                      // focus:ring-2: Add 2px ring on focus
                      // focus:ring-orange-500: Orange ring
                      // transition-all: Animate all properties
                      // hover:border-orange-500/50: Brighter border on hover
                      // cursor-pointer: Show pointer cursor
                      className="w-full p-4 bg-gray-900/80 border-2 border-orange-500/30 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all hover:border-orange-500/50 cursor-pointer"
                    >
                      {/* Options */}
                      {/* value="": Empty value (no selection) */}
                      <option value="" className="text-gray-400 bg-gray-900">Select fuel type...</option>
                      <option value="X" className="bg-gray-900">⛽ X - Regular Gasoline</option>
                      <option value="Z" className="bg-gray-900">⭐ Z - Premium Gasoline</option>
                      <option value="E" className="bg-gray-900">🌽 E - Ethanol (E85)</option>
                      <option value="D" className="bg-gray-900">🚛 D - Diesel</option>
                      <option value="N" className="bg-gray-900">💨 N - Natural Gas</option>
                    </select>
                  </motion.div>

                  {/* ===== CYLINDERS INPUT ===== */}
                  {/* Similar structure to fuel type */}
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}      // Slightly later delay
                  >
                    {/* Red theme instead of orange */}
                    <label className="flex items-center gap-2 text-sm font-semibold text-red-400">
                      <Settings className="w-4 h-4" />
                      Number of Cylinders
                    </label>
                    
                    {/* Number input */}
                    <input
                      name="cylinders"
                      value={form.cylinders}
                      onChange={handleChange}
                      required
                      type="number"                  // Only allows numbers
                      min="3"                        // Minimum value (matches dataset)
                      max="16"                       // Maximum value (matches dataset)
                      // placeholder: Hint text when empty
                      // placeholder-gray-500: Gray placeholder
                      className="w-full p-4 bg-gray-900/80 border-2 border-red-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all hover:border-red-500/50"
                      placeholder="e.g., 6 cylinders"
                    />
                  </motion.div>

                  {/* ===== ENGINE SIZE INPUT ===== */}
                  {/* 
                    Motion wrapper for the engine size input field
                    - Adds fade-in and slide-in animation from the left
                    - Creates staggered animation effect (delay: 0.4s)
                  */}
                  <motion.div 
                    className="space-y-2" // Adds vertical spacing between label and input
                    initial={{ opacity: 0, x: -20 }} // Starting state: invisible and shifted left
                    animate={{ opacity: 1, x: 0 }} // Ending state: fully visible and centered
                    transition={{ delay: 0.4 }} // Delay animation by 0.4 seconds for stagger effect
                  >
                    {/* 
                      Label for engine size input
                      - Displays icon and text side by side
                      - Styled with yellow theme to match carbon/emissions color scheme
                    */}
                    <label className="flex items-center gap-2 text-sm font-semibold text-yellow-400">
                      {/* Gauge icon from lucide-react representing engine measurement */}
                      <Gauge className="w-4 h-4" />
                      Engine Size (Liters) {/* Label text explaining what user should enter */}
                    </label>
                    
                    {/* 
                      Number input field for engine size
                      - Accepts decimal values (step="0.1")
                      - Validates input between 0.1 and 10 liters
                      - Styled with dark background and yellow accent border
                    */}
                    <input
                      name="engine_size" // Form field name used in state management
                      value={form.engine_size} // Controlled component - value comes from React state
                      onChange={handleChange} // Updates state when user types
                      required // Makes field mandatory for form submission
                      type="number" // Restricts input to numeric values only
                      step="0.1" // Allows decimal increments of 0.1 (e.g., 2.0, 2.1, 2.2)
                      min="0.9" // Minimum allowed value (matches dataset minimum)
                      max="8.4" // Maximum allowed value (matches dataset maximum)
                      // Styling classes:
                      // - w-full: Takes full width of parent container
                      // - p-4: Adds padding inside input for better UX
                      // - bg-gray-900/80: Dark background with 80% opacity
                      // - border-2 border-yellow-500/30: 2px yellow border with 30% opacity
                      // - rounded-xl: Large rounded corners for modern look
                      // - text-white: White text color for dark background
                      // - placeholder-gray-500: Gray placeholder text
                      // - focus:ring-2 focus:ring-yellow-500: Adds yellow glow ring when focused
                      // - focus:border-yellow-500: Changes border to solid yellow on focus
                      // - transition-all: Smooth animation for all property changes
                      // - hover:border-yellow-500/50: Semi-transparent yellow border on hover
                      className="w-full p-4 bg-gray-900/80 border-2 border-yellow-500/30 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all hover:border-yellow-500/50"
                      placeholder="e.g., 2.0 liters" // Example text shown when field is empty
                    />
                  </motion.div>

                  {/* ===== SUBMIT BUTTON ===== */}
                  {/* 
                    Animated submit button with gradient background
                    - Triggers form submission and API call
                    - Includes hover and tap animations for better UX
                  */}
                  <motion.button
                    // Hover animation: slightly enlarges button and adds glowing shadow
                    whileHover={{ 
                      scale: 1.03, // Scales button to 103% of original size
                      boxShadow: "0 20px 40px rgba(249, 115, 22, 0.4)" // Orange glow effect
                    }}
                    // Tap animation: slightly shrinks button for tactile feedback
                    whileTap={{ scale: 0.98 }} // Scales down to 98% when clicked
                    type="submit" // Triggers form onSubmit handler when clicked
                    // Styling classes:
                    // - w-full: Button spans full width
                    // - bg-gradient-to-r: Horizontal gradient background
                    // - from-orange-500 via-red-500 to-yellow-500: Gradient colors (fire theme)
                    // - text-white: White text for contrast
                    // - py-4: Vertical padding for comfortable click target
                    // - rounded-xl: Rounded corners matching input fields
                    // - font-bold text-lg: Large, bold text for emphasis
                    // - shadow-2xl: Large shadow for depth
                    // - hover:shadow-orange-500/50: Orange shadow intensifies on hover
                    // - transition-all: Smooth transitions for all changes
                    // - flex items-center justify-center gap-3: Centers content with spacing
                    // - mt-8: Top margin to separate from inputs
                    // - border border-orange-400/50: Subtle orange border
                    className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-yellow-500 text-white py-4 rounded-xl font-bold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all flex items-center justify-center gap-3 mt-8 border border-orange-400/50"
                  >
                    {/* Car icon on the left side of button text */}
                    <Car className="w-6 h-6" />
                    
                    {/* Main button text */}
                    Calculate Emissions
                    
                    {/* Arrow symbol on the right - indicates forward action */}
                    <span className="text-sm opacity-80">→</span>
                  </motion.button>
                </form>

                {/* ===== FOOTER INFO ===== */}
                {/* 
                  Footer section with branding and status indicator
                  - Shows that app is powered by AI
                  - Includes animated status dot
                */}
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                  {/* 
                    Divider line at top (border-t) separates footer from form
                    - mt-6: Margin top for spacing
                    - pt-6: Padding top for content spacing
                    - border-gray-700/50: Semi-transparent gray border
                  */}
                  
                  {/* 
                    Footer text centered with icon
                    - Displays app capabilities and branding
                  */}
                  <p className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                    {/* 
                      Animated status indicator dot
                      - Shows app is "live" or "active"
                      - animate-pulse: Pulsing animation from Tailwind
                    */}
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    
                    {/* Footer text */}
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

// ===== EXPORT =====
// Export component as default export so it can be imported elsewhere
// Usage: import PredictionForm from './components/PredictionForm'
export default PredictionForm;