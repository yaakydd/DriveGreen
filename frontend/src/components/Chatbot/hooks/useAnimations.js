import { useMemo } from "react";

const useAnimations = () => {
  return useMemo(() => ({
    chatWindow: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { duration: 0.2 }
    },
    message: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 }
    }
  }), []);
};

export default useAnimations;
