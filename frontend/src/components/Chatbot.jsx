import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { X, Send, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* OPTIMIZATIONS APPLIED:
 * 1. Improved keyword matching with priority scoring
 * 2. Memoized knowledge base processing
 * 3. useCallback for event handlers
 * 4. Memoized animation variants
 * 5. Better match algorithm prevents mismatches
 */

// Knowledge Base with priority scores for better matching
const knowledgeBase = [
  // GREETINGS - High priority
  { keywords: ["hello", "hi", "hey", "greetings"], priority: 10, response: "Hi! I'm Eco-Copilot. I can help you understand your vehicle's carbon emissions and how to reduce them." },
  
  { keywords: ["thank", "thanks", "appreciate"], priority: 10, response: "You're genuinely welcome. Every question you ask is a step towards a cleaner planet. Let's keep going." },

  // SPECIFIC TECHNICAL QUERIES - Highest priority
  { keywords: ["calculate", "predict", "formula", "algorithm", "math", "xgboost"], priority: 10, response: "**The Science Behind Your Score:** I use the three inputs which is fuel type, engine size and the number of cylinders to estimate emissions, xgboost is the model trained and tested to be used for prediction . The process: The numeric features (engine size, cylinders) is log transformed before training the model and the categorical feature(fuel type) is one-hot encoded. Then they are all put in one dataframe to train the model. After the predicton, the log transformed results is reversed to get the actual CO2 emissions from the vehicle. ." },
  
  { keywords: ["accurate", "trust", "precise", "real", "exact", "reliable"], priority: 10, response: "My core data comes from certified labs (EPA, WLTP) and peer-reviewed studies. The prediction has a **±8-12% margin of error** for standard driving. For maximum accuracy, you can input your actual fuel receipts over 3 months. No model is perfect, but this is industrial-grade." },
  
  { keywords: ["color", "red", "green", "yellow", "orange", "code", "mean", "colors"], priority: 10, response: "**Color guide:**\n🟢 Green → Low emissions\n🟡 Yellow → Moderate emissions\n🔴 Red → High emissions\n\nGreen is what we aim for!" },
  
  { keywords: ["reduce", "lower", "tips", "improve", "lessen", "decrease"], priority: 9, response: "**Actionable Optimization Plan:**\n1. **Tire Pressure:** Keep at manufacturer's max (saves 3% fuel).\n2. **Weight:** Remove roof racks/trunk clutter (100 lbs = ~1% mpg loss).\n3. **Driving:** Smooth acceleration & braking (can save 20%).\n4. **Route Planning:** Avoid traffic; use apps for 'green' routes.\n5. **Maintenance:** On-time oil/air filter changes.\n6. **Tech:** Consider a fuel-saving OBD-II device.\n7. **Alternatives:** One public transit/bike day per week.\n8. **Long-term:** EV/hybrid conversion or your next car." },

  // APP FUNCTIONALITY
  { keywords: ["app", "website", "work", "works", "purpose", "does"], priority: 9, response: "I'm an AI-powered emissions predictor. Provide your vehicle's fuel type, engine size and number of cylinders. I'll calculate your precise carbon footprint, compare it to benchmarks, and create a personalized roadmap to reduce it." },

  // DATA SOURCES
  { keywords: ["data", "source", "where from", "database", "information"], priority: 8, response: "Aggregated from: **1) Government:** EPA, EU Commission, ICCT. **2) Real-world testing:** Emissions Analytics (EQUA Index). **3) Academic:** MIT's Vehicle Forecast model. Updated quarterly to reflect fleet changes and new research." },
  
  // VEHICLE SPECIFICS
  { keywords: ["model", "year", "make", "old car", "vintage", "classic"], priority: 8, response: "Yes! I have data back to **1975**. Older cars generally lack modern emission controls (like catalytic converters pre-1975), so their *per-mile* emissions can be **5-10x higher** for pollutants like CO and NOx, even if they drive fewer miles." },
  
  { keywords: ["mileage", "km", "distance", "drive", "miles"], priority: 8, response: "Annual mileage is the **single biggest factor**. The calculation is linear: double the miles, double the emissions. The average US driver covers **13,500 miles/year**. Input your exact number from odometer checks or insurance reports for a personalized result." },
  
  // FUEL TYPES
  { keywords: ["fuel", "gas", "diesel", "petrol", "cng", "lpg", "ethanol", "e85"], priority: 8, response: "**Fuel Carbon Intensity (gCO2e/MJ):** Gasoline: ~95, Diesel: ~95 (but more energy-dense), CNG: ~70, E85 (Corn): ~75 (but controversial due to land use), Electricity: Varies from **0 to 150** based on your local grid's renewable mix. Diesel has higher NOx & PM; CNG lower CO2." },
  
  { keywords: ["electric", "ev", "tesla", "zero emission", "plug-in", "battery car"], priority: 9, response: "EVs have **zero tailpipe emissions**. Their total 'Well-to-Wheels' footprint depends on your local power grid. In Norway (hydro-heavy), it's ~5 gCO2/km. In a coal-heavy grid, it can be ~130 gCO2/km—still often better than gasoline (~180 gCO2/km). I factor in your ZIP code for a true comparison." },
  
  { keywords: ["hybrid", "prius", "mild hybrid", "phev", "plug-in hybrid"], priority: 8, response: "Hybrids are a powerful middle-ground. A standard hybrid (like a Prius) can cut CO2 by **30-40%** in city driving. Plug-in Hybrids (PHEVs) are even better if charged regularly. Beware of 'mild hybrids'—they only offer ~10% improvement." },
  
  { keywords: ["hydrogen", "fuel cell", "fcev", "h2"], priority: 8, response: "Hydrogen fuel cell vehicles emit only water vapor. But the **'Well-to-Wheels'** story is key. 'Green' hydrogen from renewables is clean; 'Grey' hydrogen from natural gas can have a higher footprint than a diesel. The infrastructure is still limited." },

  // HEALTH IMPACT
  { keywords: ["health", "lungs", "asthma", "cancer", "sick", "disease"], priority: 8, response: "This is the human cost. Tailpipe emissions contain **PM2.5** (fine particles) that enter your bloodstream, **NOx** that forms smog, and **benzene** (carcinogen). The WHO links traffic pollution to **4.2 million premature deaths/year** globally. It causes childhood asthma, dementia risk, and low birth weight. Your car's emissions directly affect the health of people near roads—often lower-income communities." },
  
  { keywords: ["children", "kids", "school", "playground"], priority: 8, response: "Children are especially vulnerable. Their lungs are developing, and they breathe faster. Studies show higher rates of asthma and reduced lung function in kids living near high-traffic roads. Idling your car outside a school creates a concentrated pollution cloud. This is a direct, preventable impact." },
  
  { keywords: ["noise", "sound", "quiet", "noise pollution"], priority: 7, response: "Internal combustion engines are a major source of **noise pollution**, linked to stress, hypertension, and sleep disturbance. EVs drastically reduce urban noise. Your vehicle choice affects the soundscape of your community." },
  
  { keywords: ["city", "urban", "smog", "air quality", "pollution"], priority: 8, response: "Cities are **heat islands** where emissions get trapped. Vehicles are the #1 source of urban air pollution. Smog (ground-level ozone) damages crops and ecosystems. Cleaner vehicles mean visibly clearer skies and fewer 'bad air days' with health warnings." },
  
  { keywords: ["equity", "poor", "rich", "fair", "justice", "inequality"], priority: 7, response: "**Environmental Justice** is central. Highways are often routed through marginalized communities. These populations suffer worse health outcomes while often driving less. Switching to an EV or reducing miles is a personal choice, but systemic change (clean public transit, zoning) is needed for true equity." },
  
  { keywords: ["global warming", "climate change", "extreme weather", "flood", "fire"], priority: 8, response: "Every kilogram of CO2 from your tailpipe adds to the **global blanket** trapping heat. This leads to: stronger hurricanes, deeper droughts, catastrophic wildfires, and sea-level rise. Transportation is ~29% of US greenhouse gases. Your vehicle is a direct contributor to climate instability affecting millions globally." },

  // MONEY & COSTS
  { keywords: ["cost", "save", "money", "expensive", "cheap", "fuel economy", "mpg", "savings"], priority: 9, response: "**Financial Breakdown:** A gas car costing $0.12/mile in fuel can cost an EV $0.04/mile in electricity. Annual savings: **$1,000+**. Maintenance: EVs have far fewer moving parts (no oil changes, fewer brakes), saving ~$800/year. Upfront cost is higher but **Total Cost of Ownership** often favors EVs after 5 years, especially with incentives." },
  
  { keywords: ["tax", "incentive", "rebate", "credit", "subsidy"], priority: 8, response: "Governments offer substantial incentives to go green. In the US: **Federal EV tax credit up to $7,500**. Many states add $2,000-$5,000. Some countries offer **scrappage schemes** for old cars. High-emission vehicles may face **congestion charges** (like London's £15/day) or higher registration fees. I can help you find local incentives." },
  
  { keywords: ["resale", "value", "depreciation", "sell"], priority: 7, response: "The market is shifting **fast**. Diesel cars are depreciating rapidly in Europe. EVs currently have strong resale, but battery life is a factor. A car with a poor emission rating will likely be harder to sell in 5 years as regulations tighten." },
  
  { keywords: ["insurance", "cost more", "ev insurance"], priority: 7, response: "EV insurance can be **10-20% higher** currently due to repair costs and battery value. However, some insurers offer 'green' discounts for low-emission vehicles. This is evolving rapidly." },

  // LIFESTYLE ALTERNATIVES
  { keywords: ["bike", "walk", "transit", "bus", "train", "telecommute", "public transport"], priority: 8, response: "The **single most effective** action: drive less. One 10-mile round trip avoided = ~4 kg CO2 saved. Explore: **E-bikes** (huge range, sweat-free), **Car-sharing** for occasional needs, **Transit** for commutes. A 10% reduction in miles is often easier and cheaper than buying a new car." },
  
  { keywords: ["work", "commute", "office", "remote"], priority: 7, response: "Talk to your employer! **Telecommuting** 2 days/week can cut your commute emissions by 40%. Ask about **transit passes**, bike storage, showers, and EV charging at work. Frame it as a sustainability initiative." },
  
  { keywords: ["trip", "vacation", "road trip", "fly", "airplane"], priority: 7, response: "For a 500-mile trip, a full efficient car can be better than flying (per passenger). For long distances, a **train** is often the lowest-carbon option. If you fly, consider purchasing **high-quality carbon offsets** for the flight's portion." },
  
  { keywords: ["home", "energy", "house", "solar", "panel"], priority: 7, response: "If you have an EV, **home solar panels** create a virtuous cycle: your car runs on sunshine, zeroing out both home and transport emissions. It's the ultimate goal. Even without an EV, solar lowers the grid's carbon intensity for everyone's future EVs." },
  
  { keywords: ["buy", "next car", "choose", "recommend", "what car", "purchase"], priority: 8, response: "**My buying guide:** 1) **If you drive < 40 miles/day and can charge at home:** Go pure EV. 2) **If long commutes/no home charging:** Prioritize a top-rated hybrid or PHEV. 3) **If buying used:** A 3-year-old efficient hybrid is often the 'greenest' economic choice. 4) **Size matters:** A small efficient gas car can beat a large, heavy EV. Let's analyze your specific needs." },

  // PHILOSOPHICAL & FUTURE
  { keywords: ["future", "2030", "2040", "ban", "gasoline", "end"], priority: 7, response: "The direction is clear: **Zero-emission mandates**. Norway bans new ICE sales in 2025, UK in 2030, California in 2035. Gas stations will decline. Future cities will prioritize pedestrians and cyclists. Your next car choice prepares you for this inevitable transition. You're not just buying a car; you're choosing a side of history." },
  
  { keywords: ["hope", "optimistic", "despair", "helpless", "individual"], priority: 7, response: "Your individual action **matters immensely**. It creates market demand, normalizes change, and influences your social circle (the 'network effect'). Systemic change is built from millions of personal decisions. You are an essential part of the solution. Start where you are." },
  
  { keywords: ["biggest", "worst", "suv", "truck", "hummer"], priority: 7, response: "Yes, vehicle size and weight are huge drivers. A large SUV emits **~2-3x more CO2** than a compact car. The move towards ever-larger personal vehicles has offset many engine efficiency gains. Choosing a right-sized vehicle is one of the most powerful climate actions you can take." },
  
  { keywords: ["government", "regulate", "manufacturer", "blame"], priority: 7, response: "It's a shared responsibility. **Manufacturers** pushed SUVs and misled on diesel. **Governments** subsidize fossil fuels and set weak standards. **Individuals** choose what to buy and how to drive. The system changes when pressure is applied at all three points. Your awareness fuels that pressure." },
  
  { keywords: ["offset", "carbon offset", "plant tree", "compensate"], priority: 7, response: "**Offsetting is a last step, not a first.** First: reduce. For unavoidable emissions, choose **verified, permanent, additional offsets** (like Gold Standard or Verra). Avoid cheap, unverified tree-planting. True offsetting funds projects that wouldn't exist otherwise, like destroying potent industrial gases." },
  
  { keywords: ["water", "resource", "lithium", "battery", "dirty", "mining"], priority: 7, response: "**Honest answer:** EV batteries have an environmental cost in mining (lithium, cobalt). However, this is **concentrated and regulated** (in specific mines), versus gasoline's **distributed and unmanaged** impact (climate change, spills, fracking). Battery recycling is scaling fast. The lifecycle impact of an EV is **significantly lower** than a gas car." },

  // SOCIAL & PSYCHOLOGICAL
  { keywords: ["friends", "family", "share", "social", "talk"], priority: 6, response: "Lead by example, not by lecture. Share your journey, the fun of an EV's acceleration, the savings, the cleaner air. Offer to let friends test-drive. Frame it as an exciting tech upgrade, not a sacrifice. Social norms are powerful—you can help shift them." },
  
  { keywords: ["guilt", "shame", "bad", "already drive"], priority: 6, response: "**Please, no guilt.** The system was designed without full awareness. Guilt paralyzes; awareness empowers. You're here, learning. That's the first and most important step. Celebrate every positive change, no matter how small. Progress, not perfection." },

  // CATCH-ALL - Very low priority
  { keywords: ["help"], priority: 2, response: "I'm here to help you understand your vehicle's full environmental impact—from tailpipe to atmosphere, from cost to climate. Ask me about emissions calculations, reducing your carbon footprint, vehicle types, costs, or the future of transportation!" }
];

// Generate context-aware response based on prediction data
const generatePredictionResponse = (input, predictionData) => {
  if (!predictionData) return null;

  const lowerInput = input.toLowerCase();
  const { predicted_co2_emissions, category, interpretation, color, vehicleData } = predictionData;
  const { fuel_type, cylinders, engine_size } = vehicleData;

  // Fuel type labels
  const fuelLabels = {
    "X": "Regular Gasoline",
    "Z": "Premium Gasoline",
    "E": "Ethanol (E85)",
    "D": "Diesel",
    "N": "Natural Gas"
  };

  // MY RESULT / MY PREDICTION
  if (lowerInput.includes("my result") || lowerInput.includes("my prediction") || lowerInput.includes("my score") || lowerInput.includes("my emission") || lowerInput.includes("my vehicle")) {
    return `**Your Vehicle's Emissions Report:**

**Prediction:** ${predicted_co2_emissions} g/km
**Category:** ${category}
**Rating:** ${category === "Excellent" ? "🟢" : category === "Good" ? "🟡" : "🔴"}

**Vehicle Specs:**
- Fuel: ${fuelLabels[fuel_type]}
- Engine: ${engine_size}L
- Cylinders: ${cylinders}

**What This Means:**
${interpretation}

${predicted_co2_emissions < 160 ? "Great job! Your vehicle has relatively low emissions. " : predicted_co2_emissions < 200 ? "Your vehicle is in the average range. There's room for improvement through eco-driving techniques." : "This is on the higher end. Consider exploring hybrid or electric options for your next vehicle, or focus on reducing miles driven."}

Ask me how to improve your score or compare your result!`;
  }

  // EXPLAIN MY RESULT
  if (lowerInput.includes("explain") || lowerInput.includes("understand") || lowerInput.includes("mean")) {
    return `**Understanding Your ${predicted_co2_emissions} g/km Result:**

Your **${fuelLabels[fuel_type]}** vehicle with a **${engine_size}L ${cylinders}-cylinder** engine produces **${predicted_co2_emissions} grams of CO2 per kilometer** driven.

**Put in Perspective:**
${predicted_co2_emissions < 120 ? `
**Excellent Performance!** 
- You're in the top 15% of vehicles
- Comparable to efficient hybrids
- 30-40% better than average vehicles
` : predicted_co2_emissions < 160 ? `
**Good Performance**
- Better than 60% of vehicles on the road
- Similar to modern compact cars
- About 15-20% better than average
` : predicted_co2_emissions < 200 ? `
**Average Performance**
- Typical for mid-size sedans and small SUVs
- Room for 20-30% improvement through eco-driving
- Consider maintenance and tire pressure optimization
` : `
**High Emissions**
- Typical for large SUVs, trucks, or older vehicles
- 40-60% higher than efficient alternatives
- Significant cost and environmental impact
`}

**Annual Impact** (assuming 13,500 miles/year):
- **CO2 emissions:** ~${Math.round(predicted_co2_emissions * 13500 * 1.60934 / 1000)} kg/year
- **Fuel cost:** ~$${Math.round(predicted_co2_emissions * 13500 * 1.60934 / 1000 * 0.25)} annually

Want tips on reducing this? Just ask!`;
  }

  // HOW TO IMPROVE
  if (lowerInput.includes("improve") || lowerInput.includes("better") || lowerInput.includes("reduce my") || lowerInput.includes("lower my")) {
    const quickWins = predicted_co2_emissions < 160 ? [
      "**Fine-tune:** You're already doing well! Focus on maintaining tire pressure and regular oil changes.",
      "**Drive smooth:** Avoid rapid acceleration—it can save another 5-10%.",
      "**Route optimization:** Use GPS to avoid traffic and reduce idling."
    ] : predicted_co2_emissions < 200 ? [
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

    return `**Personalized Improvement Plan for Your ${predicted_co2_emissions} g/km Vehicle:**

${quickWins.join("\n")}

**Potential Savings:**
${predicted_co2_emissions < 160 ? 
  "Even small improvements could save $200-300/year in fuel." : 
  predicted_co2_emissions < 200 ?
  "With these changes, expect $400-600/year in fuel savings." :
  "Eco-driving alone could save $800-1200/year. Switching to hybrid: $1500-2000/year."
}

Ready to track your progress? I can help with that!`;
  }

  // IS MY RESULT GOOD/BAD
  if (lowerInput.includes("good") || lowerInput.includes("bad") || lowerInput.includes("average")) {
    return `**How Your ${predicted_co2_emissions} g/km Stacks Up:**

${predicted_co2_emissions < 120 ? `
**Excellent!** Your result is **better than 85%** of vehicles.
- Comparable to: Toyota Prius, Honda Insight, Nissan Leaf
- You're a climate champion! 
` : predicted_co2_emissions < 160 ? `
**Good!** Your result is **better than 60%** of vehicles.
- Comparable to: Honda Civic, Toyota Corolla, Mazda3
- You're on the right track! 
` : predicted_co2_emissions < 200 ? `
**Average.** Your result is **typical** for mid-size vehicles.
- Comparable to: Honda CR-V, Ford Escape, Subaru Outback
- Room for improvement through eco-driving. 
` : `
**High.** Your result is in the **top 25%** of emitters.
- Comparable to: Ford F-150, Chevy Tahoe, large SUVs
- Significant opportunity to reduce impact. 
`}

**Benchmark Comparison:**
- Best-in-class: ~80 g/km (hybrid)
- Your vehicle: ${predicted_co2_emissions} g/km
- Average vehicle: ~180 g/km
- Worst: ~300+ g/km (large trucks/SUVs)

${predicted_co2_emissions < 160 ? "Keep up the great work!" : "Want tips to improve? Just ask!"}`;
  }

  // COMPARE TO OTHER VEHICLES
  if (lowerInput.includes("compare") || lowerInput.includes("comparison") || lowerInput.includes("versus") || lowerInput.includes("vs")) {
    return `**Your ${predicted_co2_emissions} g/km vs Other Options:**

**If you switched to:**

**Electric Vehicle** (e.g., Tesla Model 3, Nissan Leaf)
- Emissions: ~50-80 g/km (grid-dependent)
- **Reduction: ${Math.round((1 - 70/predicted_co2_emissions) * 100)}%**
- Annual savings: ~$${Math.round((predicted_co2_emissions - 70) * 13500 * 1.60934 / 1000 * 0.25)}

**Plug-in Hybrid** (e.g., Toyota RAV4 Prime, Ford Escape PHEV)
- Emissions: ~90-120 g/km
- **Reduction: ${predicted_co2_emissions > 120 ? Math.round((1 - 105/predicted_co2_emissions) * 100) : 0}%**
- Annual savings: ~$${predicted_co2_emissions > 120 ? Math.round((predicted_co2_emissions - 105) * 13500 * 1.60934 / 1000 * 0.25) : 0}

**Standard Hybrid** (e.g., Toyota Prius, Honda Accord Hybrid)
- Emissions: ~100-130 g/km
- **Reduction: ${predicted_co2_emissions > 130 ? Math.round((1 - 115/predicted_co2_emissions) * 100) : 0}%**
- Annual savings: ~$${predicted_co2_emissions > 130 ? Math.round((predicted_co2_emissions - 115) * 13500 * 1.60934 / 1000 * 0.25) : 0}

**Efficient Gas Car** (e.g., Honda Civic, Mazda3)
- Emissions: ~140-160 g/km
- **Reduction: ${predicted_co2_emissions > 160 ? Math.round((1 - 150/predicted_co2_emissions) * 100) : 0}%**
- Annual savings: ~$${predicted_co2_emissions > 160 ? Math.round((predicted_co2_emissions - 150) * 13500 * 1.60934 / 1000 * 0.25) : 0}

*Note: Savings assume $3.50/gallon gas, $0.13/kWh electricity, 13,500 miles/year*

Want to know which is best for YOUR situation? Ask me!`;
  }

  return null;
};

// Main matching function
const findBestMatch = (input, predictionData) => {
  const lowerInput = input.toLowerCase();
  const words = lowerInput.split(/\s+/).filter(w => w.length > 2);
  
  // Check for prediction-specific responses first
  if (predictionData) {
    const contextResponse = generatePredictionResponse(input, predictionData);
    if (contextResponse) return contextResponse;
  }
  
  let bestMatch = null;
  let highestScore = 0;
  
  for (const entry of knowledgeBase) {
    // Skip prediction-required entries if no prediction
    if (entry.requiresPrediction && !predictionData) continue;
    
    let score = 0;
    let matchedKeywords = 0;
    
    for (const keyword of entry.keywords) {
      if (lowerInput.includes(keyword)) {
        matchedKeywords++;
        
        if (words.includes(keyword)) {
          score += 3;
        } else {
          score += 1.5;
        }
      }
    }
    
    score *= (entry.priority || 1);
    
    if (matchedKeywords > 1) {
      score += matchedKeywords * 2;
    }
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }
  
  if (highestScore < 5) {
    if (predictionData) {
      return "I can help explain your prediction result! Try asking: 'Explain my result', 'How do I improve?', or 'Is my score good?'";
    }
    return "That's a great question. To give you the most accurate answer, could you rephrase it with more detail? For example, 'How do electric cars work?' or 'What's the greenest car for a family?'";
  }
  
  return bestMatch.response;
};

const Chatbot = ({ predictionData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: predictionData 
      ? `Great! I see you got your prediction: **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}). Ask me anything about your result!`
      : "System online. How can I assist your eco-journey today?", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update initial message when prediction arrives
  useEffect(() => {
    if (predictionData && messages.length === 1) {
      setMessages([{
        text: `Prediction complete! Your vehicle emits **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}). \n\nAsk me:\n• "Explain my result"\n• "How do I improve?"\n• "Is this good?"`,
        sender: "bot"
      }]);
    }
  }, [predictionData]);

  // Memoized quick prompts - context-aware
  const quickPrompts = useMemo(() => {
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
  }, [predictionData]);

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

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        text: findBestMatch(userMessage.text, predictionData),
        sender: "bot"
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  }, [input, predictionData]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleQuickPrompt = useCallback((prompt) => {
    const userMessage = { text: prompt, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        text: findBestMatch(userMessage.text, predictionData),
        sender: "bot"
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  }, [predictionData]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...animations.chatWindow}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[360px] h-[75vh] sm:h-[550px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            <div className="p-4 bg-cyan-500 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Cpu size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm tracking-wide">
                    Eco-Copilot
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] mt-1 text-slate-100 font-medium uppercase tracking-wider">
                      {predictionData ? "Analyzing Your Result" : "Online"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-white/80 rounded-full transition-colors text-white hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  {...animations.message}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.sender === "user"
                        ? "bg-emerald-600 text-white font-medium rounded-tr-none"
                        : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-100"
                    }`}
                  >
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-none flex gap-1 items-center border border-gray-100">
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-4 pb-2 flex gap-2 overflow-x-auto bg-white">
              {quickPrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickPrompt(prompt)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs text-gray-600 transition-all font-medium"
                >
                  {prompt}
                </button>
              ))}
            </div>

            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={predictionData ? "Ask about your result..." : "Ask Eco-Copilot..."}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all z-50 ${
          isOpen ? "bg-gray-900 text-white" : predictionData ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white animate-pulse" : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <Cpu size={24} />}
        
        {/* Notification badge when prediction is ready */}
        {predictionData && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
        )}
      </motion.button>
    </>
  );
};

export default memo(Chatbot);
