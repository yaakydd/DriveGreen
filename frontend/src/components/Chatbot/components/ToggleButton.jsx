import React from "react";
import { motion } from "framer-motion";
import { X, Cpu } from "lucide-react";

const ToggleButton = ({ isOpen, onClick, predictionData }) => {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all z-50 ${
        isOpen ? "bg-gray-900 text-white" : 
        predictionData ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white animate-pulse" : 
        "bg-emerald-600 text-white hover:bg-emerald-700"
      }`}
    >
      {isOpen ? <X size={24} /> : <Cpu size={24} />}
      
      {/* Notification badge when prediction is ready */}
      {predictionData && !isOpen && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
      )}
    </motion.button>
  );
};

export default ToggleButton;
