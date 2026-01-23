// src/components/Chatbot/services/predictionContextService.js

// Fuel type labels mapping
const FUEL_LABELS = {
  "X": "Regular Gasoline",
  "Z": "Premium Gasoline",
  "E": "Ethanol (E85)",
  "D": "Diesel",
  "N": "Natural Gas"
};

/**
 * Generate context-aware response based on prediction data
 * @param {string} input - User input
 * @param {Object} predictionData - Prediction results
 * @returns {string|null} Context-specific response or null
 */
export const generatePredictionResponse = (input, predictionData) => {
  if (!predictionData) return null;

  const lowerInput = input.toLowerCase();
  const { predicted_co2_emissions, category, interpretation, vehicleData } = predictionData;
  const { fuel_type, cylinders, engine_size } = vehicleData;

  // MY RESULT / MY PREDICTION
  if (lowerInput.includes("my result") || lowerInput.includes("my prediction") || 
      lowerInput.includes("my score") || lowerInput.includes("my emission") || 
      lowerInput.includes("my vehicle")) {
    return generateMyResultResponse(predicted_co2_emissions, category, interpretation, fuel_type, engine_size, cylinders);
  }

  // EXPLAIN MY RESULT
  if (lowerInput.includes("explain") || lowerInput.includes("understand") || lowerInput.includes("mean")) {
    return generateExplanationResponse(predicted_co2_emissions, fuel_type, engine_size, cylinders);
  }

  // HOW TO IMPROVE
  if (lowerInput.includes("improve") || lowerInput.includes("better") || 
      lowerInput.includes("reduce my") || lowerInput.includes("lower my")) {
    return generateImprovementResponse(predicted_co2_emissions);
  }

  // IS MY RESULT GOOD/BAD
  if (lowerInput.includes("good") || lowerInput.includes("bad") || lowerInput.includes("average")) {
    return generateBenchmarkResponse(predicted_co2_emissions);
  }

  // COMPARE TO OTHER VEHICLES
  if (lowerInput.includes("compare") || lowerInput.includes("comparison") || 
      lowerInput.includes("versus") || lowerInput.includes("vs")) {
    return generateComparisonResponse(predicted_co2_emissions);
  }

  return null;
};

/**
 * Generate "my result" response
 */
const generateMyResultResponse = (emissions, category, interpretation, fuel_type, engine_size, cylinders) => {
  return `**Your Vehicle's Emissions Report:**

**Prediction:** ${emissions} g/km
**Category:** ${category}
**Rating:** ${category === "Excellent" ? "🟢" : category === "Good" ? "🟡" : "🔴"}

**Vehicle Specs:**
- Fuel: ${FUEL_LABELS[fuel_type] || fuel_type}
- Engine: ${engine_size}L
- Cylinders: ${cylinders}

**What This Means:**
${interpretation}

${emissions < 160 ? "Great job! Your vehicle has relatively low emissions. " : 
  emissions < 200 ? "Your vehicle is in the average range. There's room for improvement through eco-driving techniques." : 
  "This is on the higher end. Consider exploring hybrid or electric options for your next vehicle, or focus on reducing miles driven."}

Ask me how to improve your score or compare your result!`;
};

/**
 * Generate explanation response
 */
const generateExplanationResponse = (emissions, fuel_type, engine_size, cylinders) => {
  const performanceCategory = emissions < 120 ? 'excellent' : emissions < 160 ? 'good' : emissions < 200 ? 'average' : 'high';
  
  const performanceText = {
    excellent: `**Excellent Performance!** 
- You're in the top 15% of vehicles
- Comparable to efficient hybrids
- 30-40% better than average vehicles`,
    good: `**Good Performance**
- Better than 60% of vehicles on the road
- Similar to modern compact cars
- About 15-20% better than average`,
    average: `**Average Performance**
- Typical for mid-size sedans and small SUVs
- Room for 20-30% improvement through eco-driving
- Consider maintenance and tire pressure optimization`,
    high: `**High Emissions**
- Typical for large SUVs, trucks, or older vehicles
- 40-60% higher than efficient alternatives
- Significant cost and environmental impact`
  };

  return `**Understanding Your ${emissions} g/km Result:**

Your **${FUEL_LABELS[fuel_type] || fuel_type}** vehicle with a **${engine_size}L ${cylinders}-cylinder** engine produces **${emissions} grams of CO2 per kilometer** driven.

**Put in Perspective:**
${performanceText[performanceCategory]}

**Annual Impact** (assuming 13,500 miles/year):
- **CO2 emissions:** ~${Math.round(emissions * 13500 * 1.60934 / 1000)} kg/year
- **Fuel cost:** ~$${Math.round(emissions * 13500 * 1.60934 / 1000 * 0.25)} annually

Want tips on reducing this? Just ask!`;
};

/**
 * Generate improvement response
 */
const generateImprovementResponse = (emissions) => {
  const quickWins = emissions < 160 ? [
    "**Fine-tune:** You're already doing well! Focus on maintaining tire pressure and regular oil changes.",
    "**Drive smooth:** Avoid rapid acceleration—it can save another 5-10%.",
    "**Route optimization:** Use GPS to avoid traffic and reduce idling."
  ] : emissions < 200 ? [
    "**Quick wins:** Proper tire inflation (saves 3%), remove excess weight (1-2% per 100 lbs).",
    "**Eco-driving:** Gentle acceleration, maintain steady speeds, coast to stops.",
    "**Maintenance:** Regular air filter changes, use recommended oil grade.",
    "**Consider:** Hybrid or EV for next vehicle (can cut emissions 50-100%)."
  ] : [
    "**Immediate actions:**",
    "  - Check tire pressure weekly (can improve 3-5%)",
    "  - Remove roof racks and excess cargo",
    "  - Combine trips and reduce cold starts",
    "**Driving style (saves 20-30%):**",
    "  - Accelerate gradually",
    "  - Use cruise control on highways",
    "  - Anticipate stops to coast",
    "**Long-term solutions:**",
    "  - Trade for a hybrid (40-50% reduction)",
    "  - Consider full EV (80-100% reduction)",
    "  - Reduce miles: carpool, bike, transit"
  ];

  const savings = emissions < 160 ? "$200-300" : emissions < 200 ? "$400-600" : "$800-1200";

  return `**Personalized Improvement Plan for Your ${emissions} g/km Vehicle:**

${quickWins.join("\n")}

**Potential Savings:**
${emissions < 160 ? 
  `Even small improvements could save ${savings}/year in fuel.` : 
  emissions < 200 ?
  `With these changes, expect ${savings}/year in fuel savings.` :
  `Eco-driving alone could save ${savings}/year. Switching to hybrid: $1500-2000/year.`}

Ready to track your progress? I can help with that!`;
};

/**
 * Generate benchmark response
 */
const generateBenchmarkResponse = (emissions) => {
  const rating = emissions < 120 ? 'excellent' : emissions < 160 ? 'good' : emissions < 200 ? 'average' : 'high';
  
  const ratingText = {
    excellent: `**Excellent!** Your result is **better than 85%** of vehicles.
- Comparable to: Toyota Prius, Honda Insight, Nissan Leaf
- You're a climate champion!`,
    good: `**Good!** Your result is **better than 60%** of vehicles.
- Comparable to: Honda Civic, Toyota Corolla, Mazda3
- You're on the right track!`,
    average: `**Average.** Your result is **typical** for mid-size vehicles.
- Comparable to: Honda CR-V, Ford Escape, Subaru Outback
- Room for improvement through eco-driving.`,
    high: `**High.** Your result is in the **top 25%** of emitters.
- Comparable to: Ford F-150, Chevy Tahoe, large SUVs
- Significant opportunity to reduce impact.`
  };

  return `**How Your ${emissions} g/km Stacks Up:**

${ratingText[rating]}

**Benchmark Comparison:**
- Best-in-class: ~80 g/km (hybrid)
- Your vehicle: ${emissions} g/km
- Average vehicle: ~180 g/km
- Worst: ~300+ g/km (large trucks/SUVs)

${emissions < 160 ? "Keep up the great work!" : "Want tips to improve? Just ask!"}`;
};

/**
 * Generate comparison response
 */
const generateComparisonResponse = (emissions) => {
  const evReduction = emissions > 70 ? Math.round((1 - 70/emissions) * 100) : 0;
  const phevReduction = emissions > 105 ? Math.round((1 - 105/emissions) * 100) : 0;
  const hybridReduction = emissions > 115 ? Math.round((1 - 115/emissions) * 100) : 0;
  const efficientReduction = emissions > 150 ? Math.round((1 - 150/emissions) * 100) : 0;

  return `**Your ${emissions} g/km vs Other Options:**

**If you switched to:**

**Electric Vehicle** (e.g., Tesla Model 3, Nissan Leaf)
- Emissions: ~50-80 g/km (grid-dependent)
- **Reduction: ${evReduction}%**
- Annual savings: ~$${Math.round((emissions - 70) * 13500 * 1.60934 / 1000 * 0.25)}

**Plug-in Hybrid** (e.g., Toyota RAV4 Prime, Ford Escape PHEV)
- Emissions: ~90-120 g/km
- **Reduction: ${phevReduction}%**
- Annual savings: ~$${emissions > 105 ? Math.round((emissions - 105) * 13500 * 1.60934 / 1000 * 0.25) : 0}

**Standard Hybrid** (e.g., Toyota Prius, Honda Accord Hybrid)
- Emissions: ~100-130 g/km
- **Reduction: ${hybridReduction}%**
- Annual savings: ~$${emissions > 115 ? Math.round((emissions - 115) * 13500 * 1.60934 / 1000 * 0.25) : 0}

**Efficient Gas Car** (e.g., Honda Civic, Mazda3)
- Emissions: ~140-160 g/km
- **Reduction: ${efficientReduction}%**
- Annual savings: ~$${emissions > 150 ? Math.round((emissions - 150) * 13500 * 1.60934 / 1000 * 0.25) : 0}

*Note: Savings assume $3.50/gallon gas, $0.13/kWh electricity, 13,500 miles/year*

Want to know which is best for YOUR situation? Ask me!`;
};
