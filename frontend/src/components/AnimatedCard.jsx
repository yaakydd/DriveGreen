import React from "react";
import { motion } from "framer-motion";

const AnimatedCard = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mt-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-lg text-green-800 text-center text-lg"
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
