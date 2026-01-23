import { useCallback } from "react";
import { findBestMatch } from '../services/responseService';

const useMessageMatching = (predictionData) => {
  const getBotResponse = useCallback((input) => {
    return findBestMatch(input, predictionData);
  }, [predictionData]);

  return { getBotResponse };
};

export default useMessageMatching
