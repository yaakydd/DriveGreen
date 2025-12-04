import { motion} from 'framer-motion'; // Import Framer Motion for animations

// Define the functional component, accepting 'size' prop with a default value of "normal"
const DriveGreenLogo = ({ size = "normal" }) => {
  // Define configuration objects for different logo sizes (in Tailwind utility units)
  const sizes = {
    small: { logo: 40, text: "text-2xl" }, // 40px logo width/height, text size 2xl
    normal: { logo: 56, text: "text-3xl" }, // 56px logo width/height, text size 3xl
    large: { logo: 72, text: "text-5xl" }  // 72px logo width/height, text size 5xl
  };

  // Destructure the logo size and text size based on the 'size' prop
  const { logo, text } = sizes[size];
  // Define a utility class for the primary green color
  const colorClass = "text-green-600";

  // The component returns a container that centers the icon and text
  return (
    <div className="flex items-center gap-3">
      {/* flex: Enable flexbox, items-center: Vertically align items, gap-3: Space between icon and text */}
      
      {/* ===== LOGO ICON (Animated SVG) ===== */}
      <motion.div
        className="relative flex items-center justify-center flex-shrink-0" // relative: Context for absolute children, flex-shrink-0: Prevents icon from shrinking
        style={{ width: logo, height: logo }} // Set the specific pixel dimensions for the container
        whileHover={{ scale: 1.05 }} // Framer Motion: Scale up 5% on hover
        transition={{ type: "spring", stiffness: 300 }} // Framer Motion: Use a spring animation for a natural, bouncy feel
      >
        {/* Outer Circle - Emerald Glow (Creates the background light effect) */}
        <div 
          className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg"
          // absolute inset-0: Stretches div to cover the parent motion.div
          // rounded-full: Perfect circle
          // bg-gradient-to-br: Gradient from top-left to bottom-right
          // shadow-lg: Standard Tailwind shadow
          style={{
            // Custom CSS box shadow to enhance the glow effect using the emerald color (16, 185, 129 is the RGB for emerald-500)
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)'
          }}
        />
        
        {/* Inner Circle - White (Creates the white circular mask) */}
        <div className="absolute inset-2 rounded-full bg-white" />
        {/* inset-2: Creates a 2-unit margin around the outer circle, making it appear as a border */}
        
        {/* Leaf Icon - Stylized SVG (The actual logo design) */}
        <svg
          viewBox="0 0 24 24" // Standard SVG viewport size
          className="relative z-10" // relative z-10: Brings the leaf above the background circles
          style={{ width: logo * 0.5, height: logo * 0.5 }} // Sets the SVG size to half the container size
          fill="none" // No default fill
          stroke="currentColor" // Default stroke color (will be overridden by path colors)
        >
          {/* Leaf shape (A stylized circle/drop) */}
          <path
            d="M12 3C7 3 3 7 3 12c0 2.5 1 4.5 2.5 6C7 19.5 9.5 21 12 21c5 0 9-4 9-9 0-5-4-9-9-9z"
            fill="#10b981" // Fill color (Emerald-500)
            stroke="#059669" // Stroke color (Emerald-600)
            strokeWidth="1.5" // Thickness of the outline
          />
          {/* Leaf vein (The line across the center) */}
          <path
            d="M12 3v18M12 12c2-2 5-3 7-3" // Defines the path for the vein
            stroke="#ffffff" // White color for contrast
            strokeWidth="2"
            strokeLinecap="round" // Smooth rounded ends for the line
          />
        </svg>

        {/* Pulsing animation ring (Adds a dynamic, attention-grabbing effect) */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-emerald-400"
          // inset-0 rounded-full: Matches the size and shape of the outer circle
          // border-2 border-emerald-400: Defines the color and thickness of the border
          animate={{
            scale: [1, 1.2, 1], // Animates the scale from normal (1) to larger (1.2) and back
            opacity: [0.5, 0, 0.5] // Animates opacity from visible (0.5) to fully transparent (0) and back
          }}
          transition={{
            duration: 2, // The total animation cycle takes 2 seconds
            repeat: Infinity, // Repeats forever
            ease: "easeInOut" // Smooth easing function
          }}
        />
      </motion.div>

      {/* ===== TEXT LOGO (The words "Drive Green") ===== */}
      <div className={`flex items-center font-bold tracking-tight ${text} `}>
        {/* flex items-center: Aligns text vertically, font-bold tracking-tight: Style for the text, ${text}: Inserts the dynamic text size class (e.g., text-3xl) */}
        <span className="text-slate-800">Drive</span>
        {/* The first word in dark gray */}
        <span className={colorClass}>Green</span>
        {/* The second word uses the defined green highlight color */}
      </div>
    </div>
  );
};

export default DriveGreenLogo;