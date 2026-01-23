import { fuelLabels } from '../data/knowledgeBase';

// Generate context-aware response based on prediction data
const generatePredictionResponse = (input, predictionData) => {
  
  // Check if prediction data exists
  if (!predictionData) {
    console.log('No prediction data - returning null');
    return null;
  }

  const lowerInput = input.toLowerCase().trim();
  const { predicted_co2_emissions, category, interpretation, vehicleData } = predictionData;
  const { fuel_type, cylinders, engine_size } = vehicleData;

  console.log('Checking for prediction-specific phrases...');
  
  // **CRITICAL FIX: Check for "my" + prediction words**
  const hasMyPrediction = 
    lowerInput.includes('my result') || 
    lowerInput.includes('my prediction') || 
    lowerInput.includes('my score') || 
    lowerInput.includes('my emission') ||
    lowerInput.includes('my vehicle') ||
    lowerInput.includes('show my') ||
    (lowerInput.includes('my') && (
      lowerInput.includes('result') || 
      lowerInput.includes('prediction') || 
      lowerInput.includes('score') || 
      lowerInput.includes('emission')
    ));

  console.log('Has "my prediction" phrase?', hasMyPrediction);

  // **CRITICAL FIX: Order matters - check most specific first**
  
  // 1. "explain my result" - MOST SPECIFIC
  if ((lowerInput.includes('explain') || lowerInput.includes('understand') || 
       lowerInput.includes('mean') || lowerInput.includes('what does')) && 
      hasMyPrediction) {
    console.log('✅ Matched: EXPLAIN MY RESULT');
    return getExplanationResponse(predicted_co2_emissions, fuel_type, cylinders, engine_size);
  }
  
  // 2. "improve my result"
  if ((lowerInput.includes('improve') || lowerInput.includes('better') || 
       lowerInput.includes('reduce') || lowerInput.includes('lower')) && 
      (hasMyPrediction || lowerInput.includes('my'))) {
    console.log('✅ Matched: IMPROVE MY RESULT');
    return getImprovementResponse(predicted_co2_emissions);
  }
  
  // 3. "is my result good/bad"
  if ((lowerInput.includes('good') || lowerInput.includes('bad') || 
       lowerInput.includes('average') || lowerInput.includes('rating') ||
       lowerInput.includes('is my')) && 
      hasMyPrediction) {
    console.log('✅ Matched: RATE MY RESULT');
    return getRatingResponse(predicted_co2_emissions);
  }
  
  // 4. "compare my result"
  if ((lowerInput.includes('compare') || lowerInput.includes('vs') || 
       lowerInput.includes('versus') || lowerInput.includes('comparison')) && 
      (hasMyPrediction || lowerInput.includes('my'))) {
    console.log('✅ Matched: COMPARE MY RESULT');
    return getComparisonResponse(predicted_co2_emissions);
  }
  
  // 5. General "my result" (show full report)
  if (hasMyPrediction) {
    console.log('✅ Matched: SHOW MY RESULT');
    return getResultsResponse(predicted_co2_emissions, category, interpretation, fuel_type, cylinders, engine_size);
  }
  
  // 6. Fallback for prediction-related queries without "my"
  if (lowerInput.includes('prediction') || lowerInput.includes('result') || 
      lowerInput.includes('score') || lowerInput.includes('emission')) {
    console.log('⚠️ Matched: GENERAL PREDICTION QUERY');
    return getPredictionFallback(predicted_co2_emissions);
  }

  console.log('❌ No prediction match - returning null');
  return null;
};

// Response generators
const getResultsResponse = (emissions, category, interpretation, fuelType, cylinders, engineSize) => {
  const ratingEmoji = category === "Excellent" ? "🟢" : 
                     category === "Good" ? "🟡" : "🔴";
  
  const followUp = emissions < 160 ? 
    "**Great job!** Your vehicle has relatively low emissions compared to average." : 
    emissions < 200 ? 
    "**Room for improvement:** Your vehicle is in the average range. Eco-driving techniques could help." : 
    "**Consider alternatives:** This is on the higher end. Hybrid or electric options could significantly reduce emissions.";

  return `**Your Vehicle's Emissions Report** 📊

**Prediction:** ${emissions.toFixed(1)} g/km
**Category:** ${category}
**Rating:** ${ratingEmoji}

**Vehicle Specifications:**
• **Fuel Type:** ${fuelLabels[fuelType] || fuelType}
• **Engine Size:** ${engineSize}L
• **Cylinders:** ${cylinders}

**Interpretation:**
${interpretation}

${followUp}

**Ask me:**
• "Explain this in detail"
• "How can I improve?"
• "Compare to other vehicles"
• "Is this score good?"`;
};

const getExplanationResponse = (emissions, fuelType, cylinders, engineSize) => {
  const fuelLabel = fuelLabels[fuelType] || fuelType;
  const annualCO2 = Math.round(emissions * 13500 * 1.60934 / 1000);
  const annualCost = Math.round(emissions * 13500 * 1.60934 / 1000 * 0.25);

  return `**Understanding Your ${emissions.toFixed(1)} g/km Result** 🧠

Your **${fuelLabel}** vehicle with a **${engineSize}L ${cylinders}-cylinder** engine produces **${emissions.toFixed(1)} grams of CO2 per kilometer** driven.

**What this means in context:**
${getEmissionsPerspective(emissions)}

**Annual Impact** (assuming 13,500 miles/year):
• **CO2 emissions:** ~${annualCO2} kg/year (${(annualCO2/1000).toFixed(1)} metric tons)
• **Fuel cost:** ~$${annualCost} annually
• **Environmental impact:** Equivalent to ${Math.round(annualCO2 / 20)} tree seedlings grown for 10 years

**Key factors affecting your score:**
1. **Fuel type:** ${fuelLabel} has specific carbon intensity
2. **Engine size:** Larger engines typically consume more fuel
3. **Cylinders:** More cylinders often mean higher emissions

**Want more details or tips to reduce this?**`;
};

const getEmissionsPerspective = (emissions) => {
  if (emissions < 120) {
    return `**Excellent Performance!** 🌟
• Top 15% of all vehicles
• Comparable to efficient hybrids
• 30-40% better than average vehicles
• Minimal environmental impact`;
  } else if (emissions < 160) {
    return `**Good Performance** 👍
• Better than 60% of vehicles on the road
• Similar to modern compact cars
• About 15-20% better than average
• Room for optimization`;
  } else if (emissions < 200) {
    return `**Average Performance** 📊
• Typical for mid-size sedans and small SUVs
• Room for 20-30% improvement through eco-driving
• Consider maintenance and tire pressure optimization
• Significant reduction opportunities available`;
  } else {
    return `**High Emissions** ⚠️
• Typical for large SUVs, trucks, or older vehicles
• 40-60% higher than efficient alternatives
• Significant cost and environmental impact
• Major improvement opportunities`;
  }
};

const getImprovementResponse = (emissions) => {
  const quickWins = getQuickWins(emissions);
  const potentialSavings = getPotentialSavings(emissions);
  
  return `**Personalized Improvement Plan for Your ${emissions.toFixed(1)} g/km Vehicle** 🚀

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
    return "• **Fuel savings:** $200-300/year\n• **CO2 reduction:** 0.5-0.8 tons/year\n• **Maintenance savings:** $100-150/year";
  } else if (emissions < 200) {
    return "• **Fuel savings:** $400-600/year\n• **CO2 reduction:** 1.0-1.5 tons/year\n• **Potential resale value increase:** $500-1000";
  } else {
    return "• **Fuel savings:** $800-1200/year (eco-driving)\n• **CO2 reduction:** 2.0-3.0 tons/year\n• **Hybrid switch savings:** $1500-2000/year\n• **EV switch savings:** $2000-3000/year";
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
  
  return `**How Your ${emissions.toFixed(1)} g/km Result Compares** 📈

${ratingInfo.description}

**Benchmark Scale (g/km):**
• **Excellent:** <120 (Top 15%)
• **Good:** 120-160 (Better than 60%)
• **Average:** 160-200 (Typical range)
• **High:** 200-250 (Above average)
• **Very High:** >250 (Top 25% emitters)

**Your Position:** ${emissions.toFixed(1)} g/km → **${ratingInfo.rating}**

**Industry Averages:**
• **Best hybrid:** ~80 g/km
• **Average vehicle:** ~180 g/km
• **Large SUV/Truck:** 250-350 g/km

${emissions < 160 ? 
  "**Keep up the excellent work!** You're already making a positive impact. 🌱" : 
  "**Improvement opportunity:** Significant reductions are possible with the right changes. 💡"}`;
};

const getRatingInfo = (emissions) => {
  if (emissions < 120) {
    return {
      rating: "Excellent! 🌟",
      description: `**Outstanding Performance!** 
• You're in the **top 15%** of all vehicles
• Comparable to: Toyota Prius, Honda Insight, Nissan Leaf
• Environmental impact: Minimal
• You're a climate champion!`
    };
  } else if (emissions < 160) {
    return {
      rating: "Good! 👍",
      description: `**Solid Performance**
• Better than **60%** of vehicles on the road
• Comparable to: Honda Civic, Toyota Corolla, Mazda3
• Environmental impact: Moderate
• You're on the right track!`
    };
  } else if (emissions < 200) {
    return {
      rating: "Average. 📊",
      description: `**Typical Performance**
• In the **average range** for modern vehicles
• Comparable to: Honda CR-V, Ford Escape, Subaru Outback
• Environmental impact: Significant
• Room for improvement through focused changes`
    };
  } else if (emissions < 250) {
    return {
      rating: "High. ⚠️",
      description: `**Above Average Emissions**
• In the **top 35%** of emitters
• Comparable to: Mid-size SUVs, some trucks
• Environmental impact: High
• Major improvement opportunities available`
    };
  } else {
    return {
      rating: "Very High. 🔴",
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

  return `**Your ${emissions.toFixed(1)} g/km vs Other Vehicle Types** ⚖️

**Quick Comparison:**
• **Your Current:** ${emissions.toFixed(1)} g/km | $${currentAnnualCost}/year
• **Electric Vehicle:** 50-80 g/km | **${evReduction}% reduction** | Save $${evSavings}/year
• **Plug-in Hybrid:** 90-120 g/km | **${phevReduction}% reduction** | Save $${phevSavings}/year
• **Standard Hybrid:** 100-130 g/km | **${hybridReduction}% reduction** | Save $${hybridSavings}/year
• **Efficient Gas:** 140-160 g/km | **${efficientGasReduction}% reduction** | Save $${efficientGasSavings}/year

**Detailed Breakdown:**

**🚗 Electric Vehicle** (Tesla Model 3, Nissan Leaf)
• Emissions: 50-80 g/km (depends on electricity source)
• Reduction: **${evReduction}%** (${(emissions - 70).toFixed(1)} g/km less)
• Annual savings: ~$${evSavings}
• **Benefits:** Zero tailpipe emissions, lowest maintenance, tax credits
• **Considerations:** Charging access, upfront cost

**🔌 Plug-in Hybrid** (Toyota RAV4 Prime, Ford Escape PHEV)
• Emissions: 90-120 g/km
• Reduction: **${phevReduction}%** (${(emissions - 105).toFixed(1)} g/km less)
• Annual savings: ~$${phevSavings}
• **Benefits:** Electric for short trips, gas for long, no range anxiety
• **Considerations:** Need charging access for full benefits

**⚡ Standard Hybrid** (Toyota Prius, Honda Accord Hybrid)
• Emissions: 100-130 g/km
• Reduction: **${hybridReduction}%** (${(emissions - 115).toFixed(1)} g/km less)
• Annual savings: ~$${hybridSavings}
• **Benefits:** No charging needed, proven reliability, good resale
• **Considerations:** Less reduction than PHEV/EV

**⛽ Efficient Gas Car** (Honda Civic, Mazda3)
• Emissions: 140-160 g/km
• Reduction: **${efficientGasReduction}%** (${(emissions - 150).toFixed(1)} g/km less)
• Annual savings: ~$${efficientGasSavings}
• **Benefits:** Lowest upfront cost, widely available
• **Considerations:** Still uses gas, higher long-term costs

**📊 Your Current Impact:**
• **Annual CO2:** ~${currentAnnualCO2} kg (${(currentAnnualCO2/1000).toFixed(1)} tons)
• **Annual fuel cost:** ~$${currentAnnualCost}
• **5-year total:** ~$${currentAnnualCost * 5} and ${currentAnnualCO2 * 5} kg CO2

${getComparisonAnalysis(emissions, evReduction, evSavings)}

*💡 Assumptions: $3.50/gallon gas, $0.13/kWh electricity, 13,500 miles/year. Actual savings vary.*

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

const getPredictionFallback = (emissions) => {
  return `I see you're asking about prediction results. With your current score of **${emissions} g/km**, here's what I can help with:

**Ask me about your specific result:**
• "Explain my result"
• "How do I improve my score?"
• "Is my result good or bad?"
• "Compare my vehicle to others"

**Or learn about emissions:**
• "Best ways to reduce emissions"
• "Electric vs hybrid comparison"
• "Fuel type impact on environment"

What would you like to know?`;
};

export default generatePredictionResponse;