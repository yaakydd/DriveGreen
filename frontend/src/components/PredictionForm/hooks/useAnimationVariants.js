import { useMemo } from "react";

const useAnimationVariants = () => {
  return useMemo(() => ({
    spinner: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
      transition: { duration: 0.25 }
    },
    result: {
      initial: { opacity: 0, y: 40 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -40 },
      transition: { duration: 0.4 }
    },
    form: {
      initial: { opacity: 0, y: 30 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, scale: 0.75 },
      transition: { duration: 0.35 }
    },
    logo: {
      initial: { scale: 0, rotate: -90 },
      animate: { scale: 1, rotate: 0 },
      transition: { type: "spring", stiffness: 150, delay: 0.1 }
    },
    input: {
      fuel: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.15 } },
      cylinders: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.25 } },
      engine: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { delay: 0.35 } }
    },
    corners: {
      topLeft: { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 120, delay: 0.5 } },
      bottomRight: { initial: { scale: 0 }, animate: { scale: 1 }, transition: { type: "spring", stiffness: 120, delay: 0.6 } }
    }
  }), []);
};

export default useAnimationVariants;
