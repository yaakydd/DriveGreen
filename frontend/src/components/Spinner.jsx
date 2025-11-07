import React from "react";
import { motion } from "framer-motion";

const Spinner = () => {
  return (
    <div className="flex justify-center mt-4">
      <motion.div
        className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "linear",
        }}
      ></motion.div>
    </div>
  );
};

export default Spinner;
