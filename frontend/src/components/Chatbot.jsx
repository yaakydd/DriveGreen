import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { X, Send, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* COMPLETE REWRITE - ALL ISSUES FIXED:
 * ✅ Expanded keywords for natural language
 * ✅ Quick prompts: Show BEFORE first message, hide AFTER
 * ✅ Better conversational understanding
 * ✅ Lower threshold for better matching
 * ✅ Handles variations and synonyms
 */

// ==================== EXPANDED KNOWLEDGE BASE ====================
const knowledgeBase = [
  // GREETINGS
  { 
    keywords: ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", "howdy", "what's up", "sup"],
    priority: 10,
    response: "Hi! I'm Eco-Copilot. I can help you understand your vehicle's carbon emissions and how to reduce them."
  },
  { 
    keywords: ["thank you", "thanks", "appreciate", "grateful", "thx", "ty"],
    priority: 10,
    response: "You're genuinely welcome. Every question you ask is a step towards a cleaner planet. Let's keep going."
  },

  // CONVERSATIONAL ACKNOWLEDGMENTS
  {
    keywords: ["i have run", "i ran", "i already", "i did", "already done", "just did"],
    priority: 9,
    response: "Great! Now you can ask me about your prediction result. Try: 'Explain my result', 'How do I improve?', or 'Compare to other vehicles'."
  },

  // APP FUNCTIONALITY (Expanded keywords)
  {
    keywords: ["how does website work", "how does app work", "how does this work", "what does this do", "how it works", "how this works", "website function", "app function"],
    priority: 10,
    response: "I'm an AI-powered emissions predictor. Provide your vehicle's **fuel type, engine size, and cylinders**. I'll calculate your precise carbon footprint, compare it to benchmarks, and create a personalized roadmap to reduce it. Simple as that!"
  },

  // GOVERNMENT & POLICY (Massively expanded)
  {
    keywords: ["government doing", "government policy", "government policies", "what is government", "government action", "what policies", "government put in place", "government regulations", "government laws", "emission laws", "emission regulations", "emission policy"],
    priority: 10,
    response: "Governments worldwide are implementing policies:\n\n**Regulations:** Emission standards (Euro 6, EPA Tier 3), zero-emission vehicle mandates (California 2035, UK 2030, Norway 2025).\n\n**Incentives:** EV tax credits ($7,500 US federal), purchase rebates, HOV lane access, free parking.\n\n**Penalties:** Congestion charges (London £15/day), higher registration fees for polluters, manufacturer fines for exceeding fleet averages.\n\nIt's a shared responsibility: Manufacturers, Governments, and Individuals must all act."
  },

  // INCENTIVES & REWARDS (NEW - addresses "reward" question)
  {
    keywords: ["reward", "incentive", "rebate", "tax credit", "subsidy", "benefit", "what do i get", "car owner reward", "low emission reward", "clean car benefit"],
    priority: 10,
    response: "**Rewards for Low-Emission Vehicles:**\n\n💰 **Financial:**\n- Federal EV tax credit: up to $7,500\n- State rebates: $2,000-$5,000\n- Lower registration fees\n- Reduced insurance (some insurers)\n\n🚗 **Privileges:**\n- HOV/carpool lane access (even solo)\n- Free parking in some cities\n- Exemption from congestion charges\n- Priority parking spots\n\n💵 **Savings:**\n- $1,000+ annually on fuel\n- $800/year on maintenance\n- Potential tax deductions\n\nAsk me about specific incentives in your area!"
  },

  // TECHNICAL QUERIES
  {
    keywords: ["how calculate", "how predict", "how you calculate", "formula", "algorithm", "xgboost", "model work", "prediction work", "science behind"],
    priority: 10,
    response: "**The Science Behind Your Score:**\n\nI use **XGBoost** (eXtreme Gradient Boosting), a machine learning model trained on thousands of vehicles.\n\n**Inputs:** Fuel type, engine size, cylinders\n\n**Process:**\n1. Log-transform numeric features (engine size, cylinders)\n2. One-hot encode fuel type\n3. Train XGBoost model on historical data\n4. Predict CO2 emissions\n5. Reverse log-transform for actual g/km\n\n**Accuracy:** ±8-12% margin of error (certified EPA/WLTP data)."
  },
  {
    keywords: ["color code", "what do colors mean", "red green yellow", "color guide", "what colors", "color system"],
    priority: 10,
    response: "**Color Guide:**\n🟢 **Green** → Low emissions (< 120 g/km)\n🟡 **Yellow** → Moderate emissions (120-200 g/km)\n🔴 **Red** → High emissions (> 200 g/km)\n\nGreen is what we aim for! It means lower fuel costs, cleaner air, and a healthier planet."
  },

  // REDUCTION TIPS (Expanded)
  {
    keywords: ["how to reduce", "how reduce", "reduce emission", "lower emission", "cut emission", "reduction tips", "reduce co2", "lower co2", "decrease emission"],
    priority: 9,
    response: "**Actionable Optimization Plan:**\n\n1. **Tire Pressure:** Keep at manufacturer's max (saves 3% fuel)\n2. **Weight:** Remove roof racks/trunk clutter (100 lbs = ~1% mpg loss)\n3. **Driving:** Smooth acceleration & braking (can save 20%)\n4. **Route Planning:** Avoid traffic; use apps for 'green' routes\n5. **Maintenance:** On-time oil/air filter changes\n6. **Tech:** Consider fuel-saving OBD-II device\n7. **Alternatives:** One public transit/bike day per week\n8. **Long-term:** EV/hybrid conversion or next car purchase\n\nEven small changes add up to big savings!"
  },

  // DATA SOURCES
  {
    keywords: ["data source", "where data", "data come from", "database", "information source"],
    priority: 8,
    response: "Aggregated from:\n\n**1) Government:** EPA, EU Commission, ICCT\n**2) Real-world testing:** Emissions Analytics (EQUA Index)\n**3) Academic:** MIT's Vehicle Forecast model\n\nUpdated quarterly to reflect fleet changes and new research. Industrial-grade accuracy!"
  },

  // FUEL TYPES
  {
    keywords: ["fuel type", "gasoline vs diesel", "petrol", "cng", "lpg", "ethanol", "e85", "fuel comparison", "which fuel"],
    priority: 8,
    response: "**Fuel Carbon Intensity (gCO2e/MJ):**\n\n- Gasoline: ~95\n- Diesel: ~95 (more energy-dense)\n- CNG: ~70\n- E85 (Ethanol): ~75 (controversial land use)\n- Electricity: **0-150** (grid-dependent)\n\nDiesel has higher NOx & particulates. CNG has lower CO2. EVs vary by your local grid's renewable mix."
  },
  {
    keywords: ["electric car", "ev", "tesla", "zero emission", "battery car", "electric vehicle", "evs", "plug in"],
    priority: 9,
    response: "EVs have **zero tailpipe emissions**. Total 'Well-to-Wheels' footprint depends on your power grid:\n\n- Norway (hydro): ~5 gCO2/km\n- Coal-heavy grid: ~130 gCO2/km\n- Average: Still better than gasoline (~180 gCO2/km)\n\n**Benefits:** No oil changes, quiet, instant torque, $1,000+ annual savings!"
  },
  {
    keywords: ["hybrid", "prius", "phev", "plug-in hybrid", "mild hybrid", "hybrid car"],
    priority: 8,
    response: "Hybrids are the middle ground:\n\n**Standard Hybrid** (Prius): 30-40% CO2 reduction in city driving\n**Plug-in Hybrid** (PHEV): Even better if charged regularly\n**Mild Hybrid:** Only ~10% improvement (marketing hype)\n\nGreat option if you're not ready for full EV!"
  },

  // HEALTH & ENVIRONMENT
  {
    keywords: ["health", "health impact", "pollution health", "asthma", "cancer", "disease", "sick"],
    priority: 8,
    response: "**Human Cost of Emissions:**\n\nTailpipe emissions contain:\n- **PM2.5** (fine particles) → enters bloodstream\n- **NOx** → forms smog\n- **Benzene** → carcinogen\n\n**WHO:** 4.2 million premature deaths/year globally from traffic pollution. Causes childhood asthma, dementia risk, low birth weight. Your car directly affects people near roads—often lower-income communities."
  },
  {
    keywords: ["climate change", "global warming", "extreme weather", "climate impact"],
    priority: 8,
    response: "Every kg of CO2 adds to the **global heat blanket**:\n\n- Stronger hurricanes\n- Deeper droughts\n- Catastrophic wildfires\n- Sea-level rise\n\nTransportation = ~29% of US greenhouse gases. Your vehicle is a direct contributor to climate instability affecting millions globally."
  },

  // MONEY & COSTS (Expanded)
  {
    keywords: ["save money", "cost", "fuel cost", "expensive", "cheap", "fuel economy", "mpg", "financial", "savings", "money"],
    priority: 9,
    response: "**Financial Breakdown:**\n\n**Gas Car:** $0.12/mile in fuel\n**EV:** $0.04/mile in electricity\n**Annual savings:** $1,000+\n\n**Maintenance:**\nEVs save ~$800/year (no oil changes, fewer brake replacements)\n\n**Total Cost of Ownership:** EVs often cheaper after 5 years, especially with incentives.\n\nIt's not just good for the planet—it's good for your wallet!"
  },

  // LIFESTYLE
  {
    keywords: ["bike", "bicycle", "walk", "public transit", "bus", "train", "metro", "telecommute", "work from home"],
    priority: 8,
    response: "**Most effective action:** Drive less!\n\nOne 10-mile trip avoided = ~4 kg CO2 saved\n\n**Options:**\n- **E-bikes:** Huge range, sweat-free\n- **Car-sharing:** For occasional needs\n- **Transit:** Daily commutes\n- **Telecommute:** 2 days/week = 40% reduction\n\nA 10% reduction in miles is often easier than buying a new car."
  },
  {
    keywords: ["next car", "buy car", "buying car", "car shopping", "recommend car", "what car", "which car"],
    priority: 8,
    response: "**My Buying Guide:**\n\n1. **Drive < 40 mi/day + home charging?** → Pure EV\n2. **Long commutes/no charging?** → Top-rated hybrid or PHEV\n3. **Buying used?** → 3-year-old efficient hybrid (greenest economic choice)\n4. **Size matters:** Small efficient gas car can beat large heavy EV\n\nLet's analyze YOUR specific needs!"
  },

  // FUTURE
  {
    keywords: ["future", "2030", "2040", "ban", "gas ban", "ice ban", "future cars"],
    priority: 7,
    response: "**Zero-Emission Mandates:**\n\n- Norway: 2025\n- UK: 2030\n- California: 2035\n\nGas stations will decline. Future cities prioritize pedestrians and cyclists. Your next car choice prepares you for this transition. You're choosing a side of history!"
  },

  // CATCH-ALL (Very permissive)
  {
    keywords: ["help", "assist", "support", "guide", "info", "information"],
    priority: 1,
    response: "I'm here to help you understand your vehicle's environmental impact—from tailpipe to atmosphere, from cost to climate. Ask me about:\n\n• Emissions calculations\n• Reducing your carbon footprint\n• Vehicle types (EV, hybrid, gas)\n• Costs and incentives\n• Future of transportation\n\nWhat would you like to know?"
  }
];

// ==================== UTILITY FUNCTIONS ====================

const normalizeText = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');
};

const calculateSimilarity = (str1, str2) => {
  const len1 = str1.length;
  const len2 = str2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return maxLen === 0 ? 1 : 1 - distance / maxLen;
};

const detectIntents = (input) => {
  const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length > 1) return sentences.map(s => s.trim());
  
  const indicators = [' and ', ' but ', ' also ', ' plus '];
  for (const indicator of indicators) {
    if (input.toLowerCase().includes(indicator)) {
      return input.split(new RegExp(indicator, 'i')).map(s => s.trim());
    }
  }
  return [input];
};

const isPredictionQuery = (normalized) => {
  const phrases = ['my result', 'my prediction', 'my score', 'my emission', 'explain my', 'my vehicle'];
  return phrases.some(phrase => normalized.includes(phrase));
};

const sanitizeText = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// ==================== PREDICTION RESPONSES ====================

const FUEL_LABELS = {
  "X": "Regular Gasoline",
  "Z": "Premium Gasoline",
  "E": "Ethanol (E85)",
  "D": "Diesel",
  "N": "Natural Gas"
};

const generatePredictionResponse = (input, predictionData) => {
  if (!predictionData) return null;

  const lowerInput = input.toLowerCase();
  const { predicted_co2_emissions, category, interpretation, vehicleData } = predictionData;
  const { fuel_type, cylinders, engine_size } = vehicleData;

  // EXPLAIN MY RESULT
  if (lowerInput.includes("explain my") || lowerInput.includes("what does my") || lowerInput.includes("what is my")) {
    const level = predicted_co2_emissions < 120 ? 'excellent' : predicted_co2_emissions < 160 ? 'good' : predicted_co2_emissions < 200 ? 'average' : 'high';
    
    const perfText = {
      excellent: "**Excellent Performance!**\n- Top 15% of vehicles\n- Comparable to efficient hybrids\n- 30-40% better than average",
      good: "**Good Performance**\n- Better than 60% of vehicles\n- Similar to modern compact cars\n- 15-20% better than average",
      average: "**Average Performance**\n- Typical for mid-size sedans/SUVs\n- Room for 20-30% improvement\n- Consider maintenance optimization",
      high: "**High Emissions**\n- Typical for large SUVs/trucks\n- 40-60% higher than efficient alternatives\n- Significant cost & environmental impact"
    };

    return `**Understanding Your ${predicted_co2_emissions} g/km Result:**

Your **${FUEL_LABELS[fuel_type] || fuel_type}** vehicle with a **${engine_size}L ${cylinders}-cylinder** engine produces **${predicted_co2_emissions} grams of CO2 per kilometer**.

**Put in Perspective:**
${perfText[level]}

**Annual Impact** (13,500 miles/year):
- **CO2 emissions:** ~${Math.round(predicted_co2_emissions * 13500 * 1.60934 / 1000)} kg/year
- **Fuel cost:** ~$${Math.round(predicted_co2_emissions * 13500 * 1.60934 / 1000 * 0.25)}

Want tips on reducing this? Just ask!`;
  }

  // MY RESULT / MY SCORE
  if (lowerInput.includes("my result") || lowerInput.includes("my score") || lowerInput.includes("my prediction")) {
    return `**Your Vehicle's Emissions Report:**

**Prediction:** ${predicted_co2_emissions} g/km
**Category:** ${category}
**Rating:** ${category === "Excellent" ? "🟢" : category === "Good" ? "🟡" : "🔴"}

**Vehicle Specs:**
- Fuel: ${FUEL_LABELS[fuel_type] || fuel_type}
- Engine: ${engine_size}L
- Cylinders: ${cylinders}

**What This Means:**
${interpretation}

${predicted_co2_emissions < 160 ? "Great job! Your vehicle has relatively low emissions." : 
  predicted_co2_emissions < 200 ? "Average range. Room for improvement through eco-driving." : 
  "Higher end. Consider hybrid/electric options or reduce miles driven."}

Ask me how to improve or compare to other vehicles!`;
  }

  // HOW TO IMPROVE MY RESULT
  if ((lowerInput.includes("improve") || lowerInput.includes("reduce") || lowerInput.includes("lower")) && 
      (lowerInput.includes("my") || lowerInput.includes("result") || lowerInput.includes("score"))) {
    const tips = predicted_co2_emissions < 160 ? [
      "**Fine-tune:** Maintain tire pressure & regular oil changes",
      "**Drive smooth:** Avoid rapid acceleration (saves 5-10%)",
      "**Route optimization:** Use GPS to avoid traffic"
    ] : predicted_co2_emissions < 200 ? [
      "**Quick wins:** Proper tire inflation (3%), remove weight (1-2%/100 lbs)",
      "**Eco-driving:** Gentle acceleration, steady speeds, coast to stops",
      "**Maintenance:** Air filter changes, recommended oil",
      "**Consider:** Hybrid/EV for next vehicle (50-100% reduction)"
    ] : [
      "**Immediate:** Check tire pressure weekly (3-5%), remove roof racks, combine trips",
      "**Driving (20-30% savings):** Gradual acceleration, cruise control, anticipate stops",
      "**Long-term:** Trade for hybrid (40-50% cut) or full EV (80-100% cut)"
    ];

    const savings = predicted_co2_emissions < 160 ? "$200-300" : predicted_co2_emissions < 200 ? "$400-600" : "$800-1200";

    return `**Personalized Plan for Your ${predicted_co2_emissions} g/km Vehicle:**

${tips.join("\n")}

**Potential Savings:** ${savings}/year in fuel${predicted_co2_emissions >= 200 ? ". Switching to hybrid: $1500-2000/year" : ""}`;
  }

  // IS MY RESULT GOOD/BAD
  if ((lowerInput.includes("is my") || lowerInput.includes("my result")) && 
      (lowerInput.includes("good") || lowerInput.includes("bad") || lowerInput.includes("average"))) {
    const rating = predicted_co2_emissions < 120 ? 'excellent' : predicted_co2_emissions < 160 ? 'good' : predicted_co2_emissions < 200 ? 'average' : 'high';
    
    const ratingText = {
      excellent: "**Excellent!** Better than **85%** of vehicles.\n- Like: Toyota Prius, Honda Insight\n- You're a climate champion!",
      good: "**Good!** Better than **60%** of vehicles.\n- Like: Honda Civic, Toyota Corolla\n- On the right track!",
      average: "**Average.** Typical for mid-size vehicles.\n- Like: Honda CR-V, Ford Escape\n- Room for improvement",
      high: "**High.** Top **25%** of emitters.\n- Like: Ford F-150, large SUVs\n- Significant reduction opportunity"
    };

    return `**How Your ${predicted_co2_emissions} g/km Stacks Up:**

${ratingText[rating]}

**Benchmark:**
- Best: ~80 g/km (hybrid)
- **You:** ${predicted_co2_emissions} g/km
- Average: ~180 g/km
- Worst: ~300+ g/km

${predicted_co2_emissions < 160 ? "Keep it up!" : "Want improvement tips? Ask me!"}`;
  }

  // COMPARE
  if (lowerInput.includes("compare") || lowerInput.includes("vs") || lowerInput.includes("versus")) {
    return `**Your ${predicted_co2_emissions} g/km vs Other Options:**

**Electric Vehicle** (Tesla Model 3, Nissan Leaf)
- Emissions: ~50-80 g/km
- Reduction: **${Math.round((1 - 70/predicted_co2_emissions) * 100)}%**
- Savings: ~$${Math.round((predicted_co2_emissions - 70) * 13500 * 1.60934 / 1000 * 0.25)}/year

**Plug-in Hybrid** (Toyota RAV4 Prime)
- Emissions: ~90-120 g/km
- Reduction: **${predicted_co2_emissions > 105 ? Math.round((1 - 105/predicted_co2_emissions) * 100) : 0}%**
- Savings: ~$${predicted_co2_emissions > 105 ? Math.round((predicted_co2_emissions - 105) * 13500 * 1.60934 / 1000 * 0.25) : 0}/year

**Standard Hybrid** (Toyota Prius)
- Emissions: ~100-130 g/km
- Reduction: **${predicted_co2_emissions > 115 ? Math.round((1 - 115/predicted_co2_emissions) * 100) : 0}%**

*Based on $3.50/gal gas, $0.13/kWh electricity, 13,500 miles/year*

Which is best for YOU? Ask me!`;
  }

  return null;
};

// ==================== MAIN MATCHING (LOWERED THRESHOLD) ====================

const findBestMatch = (input, predictionData) => {
  const normalized = normalizeText(input);
  
  // Check prediction query without data
  if (isPredictionQuery(normalized) && !predictionData) {
    return ["Please run a prediction first! Click 'Predict Emissions' above."];
  }

  const intents = detectIntents(input);
  const responses = [];

  for (const intent of intents) {
    const intentNorm = normalizeText(intent);
    
    // FIRST: Prediction responses
    if (predictionData) {
      const predResp = generatePredictionResponse(intent, predictionData);
      if (predResp) {
        responses.push(predResp);
        continue;
      }
    }
    
    // SECOND: Knowledge base (with BETTER matching)
    let bestMatch = null;
    let highestScore = 0;
    
    for (const entry of knowledgeBase) {
      let score = 0;
      let exactMatches = 0;
      let fuzzyMatches = 0;
      
      for (const keyword of entry.keywords) {
        const keywordNorm = normalizeText(keyword);
        
        // Exact phrase match
        if (intentNorm.includes(keywordNorm)) {
          exactMatches++;
          score += 5;
        } else if (keywordNorm.length >= 4) {
          // Fuzzy match
          const words = intentNorm.split(' ');
          for (const word of words) {
            if (word.length >= 4 && calculateSimilarity(word, keywordNorm) >= 0.80) {
              fuzzyMatches++;
              score += 2;
              break;
            }
          }
        }
      }
      
      if (exactMatches === 0 && fuzzyMatches === 0) continue;
      
      score *= (entry.priority || 1);
      
      // Bonus for multiple matches
      if (exactMatches + fuzzyMatches > 1) {
        score += (exactMatches + fuzzyMatches) * 2;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }
    
    // LOWERED THRESHOLD from 3 to 2
    if (highestScore < 2) {
      responses.push(predictionData 
        ? "I can help explain your result! Try: 'Explain my result', 'How do I improve?', or 'Is my score good?'"
        : "I can help with that! Try asking: 'How does the website work?', 'What incentives are available?', or 'How to reduce emissions?'"
      );
    } else {
      responses.push(bestMatch.response);
    }
  }
  
  return [...new Set(responses)];
};

// ==================== MAIN COMPONENT ====================

const Chatbot = ({ predictionData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserMessaged, setHasUserMessaged] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const getInitialMessage = () => {
    if (predictionData) {
      return `Prediction complete! Your vehicle emits **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}).\n\nAsk me:\n• "Explain my result"\n• "How do I improve?"\n• "Is this good?"`;
    }
    return "System online. How can I assist your eco-journey today?";
  };

  const [messages, setMessages] = useState([
    { text: getInitialMessage(), sender: "bot" }
  ]);

  useEffect(() => {
    if (predictionData && messages.length === 1) {
      setMessages([{ text: getInitialMessage(), sender: "bot" }]);
    }
  }, [predictionData]);

  // Quick prompts: Show BEFORE first message, hide AFTER ✅
  const quickPrompts = useMemo(() => {
    if (hasUserMessaged) return []; // HIDE after user messages
    
    if (predictionData) {
      return ["Explain my result", "How do I improve?", "Compare to other vehicles"];
    }
    return ["How does the website work?", "What incentives are available?", "How to reduce emissions"];
  }, [predictionData, hasUserMessaged]);

  const animations = useMemo(() => ({
    chatWindow: {
      initial: { opacity: 0, y: 20, scale: 0.95 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 0, y: 20, scale: 0.95 },
      transition: { duration: 0.2 }
    },
    message: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 }
    }
  }), []);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus();
  }, [isOpen]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    setHasUserMessaged(true); // Hide quick prompts after first message
    const userMessage = { text: sanitizeText(input), sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = findBestMatch(userMessage.text, predictionData);
      
      responses.forEach((response, idx) => {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: response, sender: "bot" }]);
          if (idx === responses.length - 1) setIsTyping(false);
        }, idx * 600);
      });
    }, 800);
  }, [input, predictionData]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleQuickPrompt =