// src/components/Chatbot/hooks/useAnimations.js
import { useMemo } from 'react';

const useAnimations = () => {
  const animations = useMemo(() => ({
    chatWindow: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { duration: 0.2 }
    },
    messageAnimation: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3 }
    }
  }), []);

  return animations;
};

export default useAnimations;
