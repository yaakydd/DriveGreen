import React from "react";
import { motion } from "framer-motion";
import Spinner from "../Spinner";

const LoadingView = ({ variants }) => {
  return (
    <motion.div
      key="spinner"
      {...variants.spinner}
      className="flex items-center justify-center w-full max-w-3xl"
    >
      <Spinner />
    </motion.div>
  );
};

export default LoadingView;
