// src/components/Chatbot/data/quickPrompts.js

/**
 * Get context-aware quick prompts based on prediction data and conversation stage
 * @param {Object} predictionData - Prediction results
 * @param {number} messageCount - Number of messages in conversation
 * @returns {Array<string>} Quick prompt suggestions
 */
export const getQuickPrompts = (predictionData, messageCount = 0) => {
  // After first exchange, show context-aware prompts
  if (predictionData && messageCount > 1) {
    return [
      "Explain my result",
      "How do I improve?",
      "Compare to other vehicles"
    ];
  }
  
  // Default prompts when no prediction
  if (messageCount > 1) {
    return [
      "How to reduce emissions",
      "How does the website work",
      "What do the colors mean?"
    ];
  }
  
  // Don't show prompts initially
  return [];
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