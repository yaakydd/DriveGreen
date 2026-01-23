import React from "react";
import { motion } from "framer-motion";
import AnimationCard from "../AnimationCard";

const ResultView = ({ prediction, onReset, variants }) => {
  return (
    <motion.div
      key="result"
      {...variants.result}
      className="w-full max-w-2xl"
    >
      <AnimationCard prediction={prediction} onReset={onReset} />
    </motion.div>
  );
};

export default ResultView;
