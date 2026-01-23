export const getQuickPrompts = (predictionData) => {
  if (predictionData) {
    return [
      "Explain my result",
      "How do I improve?",
      "Compare to other vehicles",
      "Is my score good?",
      "Show my results"
    ];
  }
  return [
    "How to reduce emissions",
    "How does the website work",
    "What do the colors mean?",
    "Best fuel type for environment",
    "Electric vs hybrid"
  ];
};
