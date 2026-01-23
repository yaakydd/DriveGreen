/**
 * Get context-aware quick prompts based on prediction data
 * @param {Object} predictionData - Prediction results
 * @returns {Array<string>} Quick prompt suggestions
 */
export const getQuickPrompts = (predictionData) => {
  if (predictionData) {
    return [
      "Explain my result",
      "How do I improve?",
      "Compare to other vehicles"
    ];
  }
  
  return [
    "How to reduce emissions",
    "How does the website work",
    "What do the colors mean?"
  ];
};

/**
 * Get all available quick prompts
 * @returns {Object} All quick prompt categories
 */
export const getAllQuickPrompts = () => {
  return {
    withPrediction: [
      "Explain my result",
      "How do I improve?",
      "Compare to other vehicles",
      "Is my score good?",
      "What does my category mean?"
    ],
    withoutPrediction: [
      "How to reduce emissions",
      "How does the website work",
      "What do the colors mean?",
      "Tell me about electric cars",
      "What fuel type is best?"
    ],
    general: [
      "How does this work?",
      "What can you help me with?",
      "Tell me about EVs",
      "How to save money on fuel"
    ]
  };
};
