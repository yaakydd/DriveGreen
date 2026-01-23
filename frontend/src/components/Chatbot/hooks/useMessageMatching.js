import { useCallback } from "react";
import { findBestMatch } from '../services/responseService';

export const useMessageMatching = (predictionData) => {
  const getBotResponse = useCallback((input) => {
    console.log(' Getting bot response for:', input);
    const response = findBestMatch(input, predictionData);
    console.log(' Bot response length:', response?.length || 0);
    return response;
  }, [predictionData]);

  return { getBotResponse };
};