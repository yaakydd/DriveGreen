import { fuelLabels } from '../data/knowledgeBase';

// Generate context-aware response based on prediction data
const generatePredictionResponse = (input, predictionData) => {
  // Check if prediction data exists when needed
  if (!predictionData) {
    return "Please run a prediction first to get your vehicle's emissions score. Then I can help you understand and improve it!";
  }

  const lowerInput = input.toLowerCase();
  const { predicted_co2_emissions, category, interpretation, vehicleData } = predictionData;
  const { fuel_type, cylinders, engine_size } = vehicleData;

  // Multi-intent detection
  const intents = detectPredictionIntents(lowerInput);

  // Handle multi-intent queries
  if (intents.length > 1) {
    return handleMultiPredictionIntent(intents, {
      emissions: predicted_co2_emissions,
      category,
      interpretation,
      fuelType: fuel_type,
      cylinders,
      engineSize: engine_size,
      predictionData
    });
  }

  // Single intent handling
  if (intents.includes('RESULTS') || lowerInput.includes("my result") || 
      lowerInput.includes("my prediction") || lowerInput.includes("my score") || 
      lowerInput.includes("my emission") || lowerInput.includes("my vehicle") || 
      lowerInput.includes("show my results")) {
    return getResultsResponse(predicted_co2_emissions, category, interpretation, fuel_type, cylinders, engine_size);
  }

  if (intents.includes('EXPLAIN') || lowerInput.includes("explain") || 
      lowerInput.includes("understand") || lowerInput.includes("mean") || 
      lowerInput.includes("what does")) {
    return getExplanationResponse(predicted_co2_emissions, fuel_type, cylinders, engine_size);
  }

  if (intents.includes('IMPROVE') || lowerInput.includes("improve") || 
      lowerInput.includes("better") || lowerInput.includes("reduce my") || 
      lowerInput.includes("lower my") || lowerInput.includes("how do i improve")) {
    return getImprovementResponse(predicted_co2_emissions);
  }

  if (intents.includes('RATING') || lowerInput.includes("good") || 
      lowerInput.includes("bad") || lowerInput.includes("average") || 
      lowerInput.includes("is my score")) {
    return getRatingResponse(predicted_co2_emissions);
  }

  if (intents.includes('COMPARE') || lowerInput.includes("compare") || 
      lowerInput.includes("comparison") || lowerInput.includes("versus") || 
      lowerInput.includes("vs")) {
    return getComparisonResponse(predicted_co2_emissions);
  }

  // Fallback for unclear prediction-related queries
  if (lowerInput.includes('prediction') || lowerInput.includes('result') || 
      lowerInput.includes('score') || lowerInput.includes('emission')) {
    return `I see you're asking about your prediction result. Try asking me:
• "Explain my result"
• "How do I improve my score?"
• "Is my result good?"
• "Compare my vehicle to others"

What would you like to know about your ${predicted_co2_emissions} g/km result?`;
  }

  return null;
};

// Intent detection for prediction-related queries
const detectPredictionIntents = (input) => {
  const intents = [];
  
  if (input.includes('my result') || input.includes('my prediction') || 
      input.includes('my score') || input.includes('my emission') || 
      input.includes('show my')) {
    intents.push('RESULTS');
  }
  
  if (input.includes('explain') || input.includes('understand') || 
      input.includes('mean') || input.includes('what does')) {
    intents.push('EXPLAIN');
  }
  
  if (input.includes('improve') || input.includes('better') || 
      input.includes('reduce') || input.includes('lower')) {
    intents.push('IMPROVE');
  }
  
  if (input.includes('good') || input.includes('bad') || 
      input.includes('average') || input.includes('rating') || 
      input.includes('is my')) {
    intents.push('RATING');
  }
  
  if (input.includes('compare') || input.includes('vs') || 
      input.includes('versus') || input.includes('comparison')) {
    intents.push('COMPARE');
  }
  
  return intents;
};

// Handle multi-intent prediction queries
const handleMultiPredictionIntent = (intents, data) => {
  const responses = [];
  
  if (intents.includes('EXPLAIN') || intents.includes('RESULTS')) {
    responses.push(getExplanationResponse(
      data.emissions, 
      data.fuelType, 
      data.cylinders, 
      data.engineSize
    ));
  }
  
  if (intents.includes('IMPROVE')) {
    responses.push(getImprovementResponse(data.emissions));
  }
  
  if (intents.includes('RATING')) {
    responses.push(getRatingResponse(data.emissions));
  }
  
  if (intents.includes('COMPARE')) {
    responses.push(getComparisonResponse(data.emissions));
  }
  
  if (responses.length > 1) {
    return `**I'll break this down for you:**\n\n${responses.join('\n\n---\n\n')}\n\n**Follow-up questions you might have:**\n• What specific actions should I take first?\n• How accurate is this prediction?\n• Are there incentives for switching vehicles?`;
  }
  
  return responses[0] || getResultsResponse(
    data.emissions, 
    data.category, 
    data.interpretation, 
    data.fuelType, 
    data.cylinders, 
    data.engineSize
  );
};

// Response generators (keep your existing functions with minor improvements)
const getResultsResponse = (emissions, category, interpretation, fuelType, cylinders, engineSize) => {
  const ratingEmoji = category === "Excellent" ? "🟢" : 
                     category === "Good" ? "🟡" : "🔴";
  
  const followUp = emissions < 160 ? 
    "Great job! Your vehicle has relatively low emissions." : 
    emissions < 200 ? 
    "Your vehicle is in the average range. There's room for improvement through eco-driving techniques." : 
    "This is on the higher end. Consider exploring hybrid or electric options for your next vehicle, or focus on reducing miles driven.";

  return `**Your Vehicle's Emissions Report:**

**Prediction:** ${emissions.toFixed(1)} g/km
**Category:** ${category}
**Rating:** ${ratingEmoji}

**Vehicle Specifications:**
- Fuel Type: ${fuelLabels[fuelType] || fuelType}
- Engine Size: ${engineSize}L
- Cylinders: ${cylinders}

**Interpretation:**
${interpretation}

${followUp}

**Next steps:** Ask me to "explain this in detail" or "show me how to improve".`;
};

const getExplanationResponse = (emissions, fuelType, cylinders, engineSize) => {
  const fuelLabel = fuelLabels[fuelType] || fuelType;
  const annualCO2 = Math.round(emissions * 13500 * 1.60934 / 1000);
  const annualCost = Math.round(emissions * 13500 * 1.60934 / 1000 * 0.25);

  return `**Understanding Your ${emissions.toFixed(1)} g/km Result:**

Your **${fuelLabel}** vehicle with a **${engineSize}L ${cylinders}-cylinder** engine produces **${emissions.toFixed(1)} grams of CO2 per kilometer** driven.

**What this means in context:**
${getEmissionsPerspective(emissions)}

**Annual Impact** (assuming 13,500 miles/year):
- **CO2 emissions:** ~${annualCO2} kg/year (${(annualCO2/1000).toFixed(1)} metric tons)
- **Fuel cost:** ~$${annualCost} annually
- **Equivalent to:** ${Math.round(annualCO2 / 20)} tree seedlings grown for 10 years

**Key factors affecting your score:**
1. **Fuel type:** ${fuelLabel} has inherent carbon intensity
2. **Engine size:** Larger engines typically consume more fuel
3. **Cylinders:** More cylinders often mean higher emissions

Want more details or tips to reduce this?`;
};

const getEmissionsPerspective = (emissions) => {
  if (emissions < 120) {
    return `**Excellent Performance!** 
• Top 15% of all vehicles
• Comparable to efficient hybrids
• 30-40% better than average vehicles
• Minimal environmental impact`;
  } else if (emissions < 160) {
    return `**Good Performance**
• Better than 60% of vehicles on the road
• Similar to modern compact cars
• About 15-20% better than average
• Room for optimization`;
  } else if (emissions < 200) {
    return `**Average Performance**
• Typical for mid-size sedans and small SUVs
• Room for 20-30% improvement through eco-driving
• Consider maintenance and tire pressure optimization
• Significant reduction opportunities available`;
  } else {
    return `**High Emissions**
• Typical for large SUVs, trucks, or older vehicles
• 40-60% higher than efficient alternatives
• Significant cost and environmental impact
• Major improvement opportunities`;
  }
};

const getImprovementResponse = (emissions) => {
  const quickWins = getQuickWins(emissions);
  const potentialSavings = getPotentialSavings(emissions);
  
  return `**Personalized Improvement Plan for Your ${emissions.toFixed(1)} g/km Vehicle:**

${quickWins.join("\n")}

**Potential Impact:**
${potentialSavings}

**Recommended Priority:**
${getPriorityActions(emissions)}

**Track your progress:** Try implementing one change at a time and check back in a month!`;
};

const getQuickWins = (emissions) => {
  if (emissions < 160) {
    return [
      "**1. Maintenance Excellence:**",
      "   • Monthly tire pressure checks (maintains 3% efficiency)",
      "   • Regular oil changes with recommended grade",
      "   • Air filter replacement every 15,000 miles",
      "",
      "**2. Driving Optimization:**",
      "   • Smooth acceleration and braking (saves 5-10%)",
      "   • Use cruise control on highways",
      "   • Plan routes to avoid traffic and idling",
      "",
      "**3. Vehicle Care:**",
      "   • Remove unnecessary weight",
      "   • Keep windows closed at high speeds",
      "   • Use AC efficiently"
    ];
  } else if (emissions < 200) {
    return [
      "**1. Immediate Actions (This Week):**",
      "   • Check and adjust tire pressure (saves 3%)",
      "   • Remove roof racks and excess cargo (1-2% per 100 lbs)",
      "   • Clean air filter or replace if dirty",
      "",
      "**2. Driving Habits (Next Month):**",
      "   • Practice gentle acceleration",
      "   • Maintain steady speeds",
      "   • Anticipate stops to coast",
      "   • Avoid unnecessary idling",
      "",
      "**3. Future Considerations:**",
      "   • Hybrid or EV for next vehicle (50-100% reduction)",
      "   • Regular maintenance schedule",
      "   • Consider carpooling for commute"
    ];
  } else {
    return [
      "**1. Critical Actions (Today):**",
      "   • Check tire pressure weekly (3-5% improvement)",
      "   • Remove all unnecessary items from vehicle",
      "   • Take off roof racks when not in use",
      "",
      "**2. Driving Transformation (Next 2 Weeks):**",
      "   • Accelerate gradually (saves 20-30%)",
      "   • Use cruise control consistently",
      "   • Coast to stops instead of braking late",
      "   • Combine trips to reduce cold starts",
      "",
      "**3. Strategic Changes (Next 6 Months):**",
      "   • Consider trading for hybrid (40-50% reduction)",
      "   • Evaluate full EV option (80-100% reduction)",
      "   • Explore carpooling, biking, or public transit",
      "   • Research vehicle incentives and tax credits"
    ];
  }
};

const getPotentialSavings = (emissions) => {
  if (emissions < 160) {
    return "• Fuel savings: $200-300/year\n• CO2 reduction: 0.5-0.8 tons/year\n• Maintenance savings: $100-150/year";
  } else if (emissions < 200) {
    return "• Fuel savings: $400-600/year\n• CO2 reduction: 1.0-1.5 tons/year\n• Potential resale value increase: $500-1000";
  } else {
    return "• Fuel savings: $800-1200/year (eco-driving)\n• CO2 reduction: 2.0-3.0 tons/year\n• Hybrid switch savings: $1500-2000/year\n• EV switch savings: $2000-3000/year";
  }
};

const getPriorityActions = (emissions) => {
  if (emissions < 160) {
    return "1. Maintain current habits\n2. Fine-tune driving style\n3. Regular maintenance";
  } else if (emissions < 200) {
    return "1. Tire pressure and weight reduction\n2. Eco-driving techniques\n3. Consider efficient next vehicle";
  } else {
    return "1. Immediate tire/weight fixes\n2. Transform driving style\n3. Seriously consider vehicle change";
  }
};

const getRatingResponse = (emissions) => {
  const ratingInfo = getRatingInfo(emissions);
  
  return `**How Your ${emissions.toFixed(1)} g/km Result Compares:**

${ratingInfo.description}

**Benchmark Scale (g/km):**
• Excellent: <120 (Top 15%)
• Good: 120-160 (Better than 60%)
• Average: 160-200 (Typical range)
• High: 200-250 (Above average)
• Very High: >250 (Top 25% emitters)

**Your Position:** ${emissions.toFixed(1)} g/km → **${ratingInfo.rating}**

**Industry Averages:**
• Best hybrid: ~80 g/km
• Average vehicle: ~180 g/km
• Large SUV/Truck: 250-350 g/km

${emissions < 160 ? "**Keep up the excellent work!** You're already making a positive impact." : "**Improvement opportunity:** Significant reductions are possible with the right changes."}`;
};

const getRatingInfo = (emissions) => {
  if (emissions < 120) {
    return {
      rating: "Excellent!",
      description: `**Outstanding Performance!** 
• You're in the **top 15%** of all vehicles
• Comparable to: Toyota Prius, Honda Insight, Nissan Leaf
• Environmental impact: Minimal
• You're a climate champion!`
    };
  } else if (emissions < 160) {
    return {
      rating: "Good!",
      description: `**Solid Performance**
• Better than **60%** of vehicles on the road
• Comparable to: Honda Civic, Toyota Corolla, Mazda3
• Environmental impact: Moderate
• You're on the right track!`
    };
  } else if (emissions < 200) {
    return {
      rating: "Average.",
      description: `**Typical Performance**
• In the **average range** for modern vehicles
• Comparable to: Honda CR-V, Ford Escape, Subaru Outback
• Environmental impact: Significant
• Room for improvement through focused changes`
    };
  } else if (emissions < 250) {
    return {
      rating: "High.",
      description: `**Above Average Emissions**
• In the **top 35%** of emitters
• Comparable to: Mid-size SUVs, some trucks
• Environmental impact: High
• Major improvement opportunities available`
    };
  } else {
    return {
      rating: "Very High.",
      description: `**Among Highest Emitters**
• In the **top 25%** of emitters
• Comparable to: Ford F-150, Chevy Tahoe, large SUVs
• Environmental impact: Very high
• Immediate action recommended`
    };
  }
};

const getComparisonResponse = (emissions) => {
  // Calculate reduction percentages
  const evReduction = emissions > 70 ? Math.round((1 - 70/emissions) * 100) : 0;
  const phevReduction = emissions > 120 ? Math.round((1 - 105/emissions) * 100) : 0;
  const hybridReduction = emissions > 130 ? Math.round((1 - 115/emissions) * 100) : 0;
  const efficientGasReduction = emissions > 160 ? Math.round((1 - 150/emissions) * 100) : 0;

  // Calculate savings
  const calculateSavings = (targetEmissions) => {
    if (emissions <= targetEmissions) return 0;
    return Math.round((emissions - targetEmissions) * 13500 * 1.60934 / 1000 * 0.25);
  };

  const evSavings = calculateSavings(70);
  const phevSavings = calculateSavings(105);
  const hybridSavings = calculateSavings(115);
  const efficientGasSavings = calculateSavings(150);
  const currentAnnualCost = Math.round(emissions * 13500 * 1.60934 / 1000 * 0.25);
  const currentAnnualCO2 = Math.round(emissions * 13500 * 1.60934 / 1000);

  return `**Your ${emissions.toFixed(1)} g/km vs Other Vehicle Types:**

**Comparison Chart:**
• **Your Current:** ${emissions.toFixed(1)} g/km | $${currentAnnualCost}/year
• **Electric Vehicle:** 50-80 g/km | **${evReduction}% reduction** | Save $${evSavings}/year
• **Plug-in Hybrid:** 90-120 g/km | **${phevReduction}% reduction** | Save $${phevSavings}/year
• **Standard Hybrid:** 100-130 g/km | **${hybridReduction}% reduction** | Save $${hybridSavings}/year
• **Efficient Gas:** 140-160 g/km | **${efficientGasReduction}% reduction** | Save $${efficientGasSavings}/year

**Detailed Breakdown:**

**Electric Vehicle** (Tesla Model 3, Nissan Leaf)
• Emissions: 50-80 g/km (depends on electricity source)
• Reduction: **${evReduction}%** (${(emissions - 70).toFixed(1)} g/km less)
• Annual savings: ~$${evSavings}
• Benefits: Zero tailpipe emissions, lowest maintenance, tax credits
• Considerations: Charging access, upfront cost

**Plug-in Hybrid** (Toyota RAV4 Prime, Ford Escape PHEV)
• Emissions: 90-120 g/km
• Reduction: **${phevReduction}%** (${(emissions - 105).toFixed(1)} g/km less)
• Annual savings: ~$${phevSavings}
• Benefits: Electric for short trips, gas for long, no range anxiety
• Considerations: Need charging access for full benefits

**Standard Hybrid** (Toyota Prius, Honda Accord Hybrid)
• Emissions: 100-130 g/km
• Reduction: **${hybridReduction}%** (${(emissions - 115).toFixed(1)} g/km less)
• Annual savings: ~$${hybridSavings}
• Benefits: No charging needed, proven reliability, good resale
• Considerations: Less reduction than PHEV/EV

**Efficient Gas Car** (Honda Civic, Mazda3)
• Emissions: 140-160 g/km
• Reduction: **${efficientGasReduction}%** (${(emissions - 150).toFixed(1)} g/km less)
• Annual savings: ~$${efficientGasSavings}
• Benefits: Lowest upfront cost, widely available
• Considerations: Still uses gas, higher long-term costs

**Your Current Impact:**
• Annual CO2: ~${currentAnnualCO2} kg (${(currentAnnualCO2/1000).toFixed(1)} tons)
• Annual fuel cost: ~$${currentAnnualCost}
• 5-year total: ~$${currentAnnualCost * 5} and ${currentAnnualCO2 * 5} kg CO2

${getComparisonAnalysis(emissions, evReduction, evSavings)}

*Assumptions: $3.50/gallon gas, $0.13/kWh electricity, 13,500 miles/year. Actual savings vary.*

**Next step:** Want help choosing the best option for your specific situation?`;
};

const getComparisonAnalysis = (emissions, evReduction, evSavings) => {
  if (emissions < 120) {
    return `**Analysis:** You're already in excellent territory! While an EV would reduce emissions by ${evReduction}%, your current vehicle is very efficient. Focus on maintenance and consider an EV for your next vehicle in 5+ years.`;
  } else if (emissions < 160) {
    return `**Analysis:** A hybrid could cut your emissions by 30-50% with moderate investment. An EV offers the most savings ($${evSavings}/year) if charging is available. Consider your daily driving needs and budget.`;
  } else if (emissions < 200) {
    return `**Analysis:** Significant savings available! An EV could save you $${evSavings}/year while cutting emissions by ${evReduction}%. Even a hybrid would save $${Math.round((emissions - 115) * 13500 * 1.60934 / 1000 * 0.25)}/year. Worth serious consideration.`;
  } else {
    return `**Analysis:** Major opportunity! An EV would transform your environmental impact (${evReduction}% reduction) and save $${evSavings}/year. The payback period for the price difference could be just 3-5 years. Strongly recommended to explore.`;
  }
};

export default generatePredictionResponse ;
