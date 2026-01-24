import React, { useState, useRef, useEffect, useMemo, useCallback, memo } from "react";
import { X, Send, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* ALL FIXES APPLIED:
 * ✅ Personalized responses based on user's actual prediction data
 * ✅ Quick prompts hide after first user message
 * ✅ Less aggressive text normalization (keeps word structure)
 * ✅ Prediction queries prioritized FIRST
 * ✅ Government query fixed with specific keywords
 * ✅ Better scoring algorithm with exact phrase matching
 * ✅ Fuzzy matching for typos (85% similarity)
 * ✅ Multi-intent detection (handles "and", "but")
 * ✅ XSS protection without external library
 */

// ==================== KNOWLEDGE BASE WITH PRIORITIES ====================
const knowledgeBase = [
  // GREETINGS - Priority 10
  { 
    keywords: ["hello", "hi", "hey", "greetings", "good morning"],
    priority: 10,
    response: "Hi! I'm Eco-Copilot. I can help you understand your vehicle's carbon emissions and how to reduce them."
  },
  { 
    keywords: ["thank you", "thanks", "appreciate"],
    priority: 10,
    response: "You're welcome! Every question you ask is a step towards a cleaner planet."
  },

  // CONVERSATIONAL - Priority 9
  {
    keywords: ["i have run", "i ran", "i already", "i did", "already done", "just did"],
    priority: 9,
    response: "Great! Now ask me: 'Explain my result', 'How do I improve?', or 'Compare to other vehicles'."
  },

  // APP FUNCTIONALITY - Priority 10
  {
    keywords: ["how does website work", "how does app work", "how does this work", "what does this do", "how it works", "website function"],
    priority: 10,
    response: "I'm an AI-powered emissions predictor. Provide your vehicle's **fuel type, engine size, and cylinders**. I'll calculate your carbon footprint, compare it to benchmarks, and help you reduce it!"
  },

  // GOVERNMENT & POLICIES - Priority 10 (Must come BEFORE general reduce)
  {
    keywords: ["government doing", "government policy", "government policies", "what policies", "policies government", "government put in place", "emission laws", "emission policy", "emission regulations"],
    priority: 10,
    response: "**Government Actions on Emissions:**\n\n**Regulations:**\n- Emission standards (Euro 6, EPA Tier 3)\n- Zero-emission mandates (California 2035, UK 2030, Norway 2025)\n- Fleet average requirements\n\n**Incentives:**\n- EV tax credits ($7,500 US federal)\n- State rebates ($2,000-$5,000)\n- HOV lane access\n\n**Penalties:**\n- Congestion charges (London £15/day)\n- Higher registration fees for polluters\n\nIt's shared responsibility: Manufacturers + Governments + Individuals."
  },

  // REWARDS/INCENTIVES - Priority 10
  {
    keywords: ["reward", "incentive", "rebate", "tax credit", "subsidy", "benefit", "what do i get", "car owner reward", "low emission reward", "clean car benefit"],
    priority: 10,
    response: "**Rewards for Low-Emission Vehicles:**\n\n💰 **Financial:**\n- Federal EV tax credit: $7,500\n- State rebates: $2,000-$5,000\n- Lower registration fees\n\n🚗 **Privileges:**\n- HOV lane access (solo driving)\n- Free parking in cities\n- Exemption from congestion charges\n- Priority parking spots\n\n💵 **Savings:**\n- $1,000+ annually on fuel\n- $800/year on maintenance\n\nYour clean choice pays off!"
  },

  // HOW TO REDUCE - Priority 9
  {
    keywords: ["how to reduce", "how reduce", "reduce emission", "lower emission", "cut emission", "reduction tips"],
    priority: 9,
    response: "**Optimization Plan:**\n\n1. **Tire Pressure:** Keep at max (saves 3%)\n2. **Weight:** Remove clutter (100 lbs = 1% loss)\n3. **Driving:** Smooth acceleration (saves 20%)\n4. **Routes:** Avoid traffic\n5. **Maintenance:** Regular oil changes\n6. **Tech:** Fuel-saving OBD-II device\n7. **Alternatives:** Public transit 1 day/week\n8. **Long-term:** EV/hybrid for next car\n\nSmall changes = big impact!"
  },

  // TECHNICAL - Priority 10
  {
    keywords: ["how calculate", "how predict", "formula", "algorithm", "xgboost", "model work"],
    priority: 10,
    response: "**The Science:**\n\nI use **XGBoost** (machine learning) trained on thousands of vehicles.\n\n**Process:**\n1. Log-transform numeric features\n2. One-hot encode fuel type\n3. Predict CO2 emissions\n4. Reverse transform for g/km\n\n**Accuracy:** ±8-12% margin (EPA/WLTP data)"
  },

  // COLORS - Priority 10
  {
    keywords: ["color code", "what do colors mean", "colors mean", "color guide"],
    priority: 10,
    response: "**Color Guide:**\n🟢 **Green** → Low emissions (< 120 g/km)\n🟡 **Yellow** → Moderate (120-200 g/km)\n🔴 **Red** → High (> 200 g/km)\n\nGreen = lower costs & cleaner air!"
  },

  // FUEL TYPES - Priority 8
  {
    keywords: ["fuel type", "gasoline vs diesel", "cng", "lpg", "ethanol"],
    priority: 8,
    response: "**Fuel Carbon Intensity:**\n- Gasoline: ~95 gCO2e/MJ\n- Diesel: ~95 (more energy-dense)\n- CNG: ~70\n- E85: ~75\n- Electricity: 0-150 (grid-dependent)\n\nDiesel has higher NOx. CNG has lower CO2."
  },

  // ELECTRIC CARS - Priority 9
  {
    keywords: ["electric car", "ev", "tesla", "zero emission", "battery car"],
    priority: 9,
    response: "EVs have **zero tailpipe emissions**.\n\n**Grid impact:**\n- Clean grid: ~5 gCO2/km\n- Coal grid: ~130 gCO2/km\n- Still better than gas (~180 gCO2/km)\n\n**Benefits:** No oil changes, quiet, $1,000+ annual savings!"
  },

  // HYBRIDS - Priority 8
  {
    keywords: ["hybrid", "prius", "phev", "plug-in hybrid"],
    priority: 8,
    response: "**Hybrids:**\n- Standard (Prius): 30-40% CO2 cut\n- Plug-in (PHEV): Even better if charged\n- Mild hybrid: Only ~10% improvement\n\nGreat middle ground!"
  },

  // HEALTH - Priority 8
  {
    keywords: ["health", "health impact", "asthma", "cancer", "sick"],
    priority: 8,
    response: "**Human Cost:**\n\nTailpipe emissions contain:\n- **PM2.5** → bloodstream\n- **NOx** → smog\n- **Benzene** → carcinogen\n\n**WHO:** 4.2M deaths/year from traffic pollution. Causes asthma, dementia risk, low birth weight."
  },

  // CLIMATE - Priority 8
  {
    keywords: ["climate change", "global warming", "extreme weather"],
    priority: 8,
    response: "Every kg of CO2 adds to global heat:\n- Stronger hurricanes\n- Deeper droughts\n- Wildfires\n- Sea-level rise\n\nTransportation = 29% of US emissions."
  },

  // MONEY - Priority 9
  {
    keywords: ["save money", "cost", "fuel cost", "expensive", "savings"],
    priority: 9,
    response: "**Financial:**\n- Gas car: $0.12/mile\n- EV: $0.04/mile\n- **Annual savings: $1,000+**\n\nEVs save ~$800/year on maintenance!"
  },

  // LIFESTYLE - Priority 8
  {
    keywords: ["bike", "walk", "public transit", "bus", "train"],
    priority: 8,
    response: "**Most effective:** Drive less!\n\n1 x 10-mile trip avoided = 4 kg CO2 saved\n\n**Options:** E-bikes, car-sharing, transit, telecommute (40% cut)"
  },

  // NEXT CAR - Priority 8
  {
    keywords: ["next car", "buy car", "car shopping", "recommend car"],
    priority: 8,
    response: "**Buying Guide:**\n1. Drive <40 mi/day + home charge? → EV\n2. Long commutes? → Hybrid/PHEV\n3. Buying used? → 3-yr-old hybrid\n4. Size matters: Small gas > large EV\n\nWhat's YOUR situation?"
  },

  // FUTURE - Priority 7
  {
    keywords: ["future", "2030", "2040", "ban", "gas ban"],
    priority: 7,
    response: "**Zero-Emission Mandates:**\n- Norway: 2025\n- UK: 2030\n- California: 2035\n\nGas stations declining. You're choosing history!"
  },

  // CATCH-ALL - Priority 1
  {
    keywords: ["help", "assist"],
    priority: 1,
    response: "I help you understand vehicle emissions!\n\n**Ask about:**\n• How the website works\n• Government policies\n• Rewards for clean cars\n• How to reduce emissions\n• Vehicle comparisons"
  }
];

// ==================== FUEL LABELS ====================
const FUEL_LABELS = {
  "X": "Regular Gasoline",
  "Z": "Premium Gasoline",
  "E": "Ethanol (E85)",
  "D": "Diesel",
  "N": "Natural Gas"
};

// ==================== UTILITY FUNCTIONS ====================

// Less aggressive normalization - keeps word structure
const normalizeText = (text) => {
  return text.toLowerCase().trim()
    .replace(/[.,!?;:]/g, '')
    .replace(/\s+/g, ' ');
};

// Levenshtein distance for fuzzy matching
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

// Multi-intent detection - splits on "and", "but", etc.
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

// XSS protection
const sanitizeText = (text) => {
  return text
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// ==================== PREDICTION RESPONSES (PRIORITIZED FIRST) ====================
const generatePredictionResponse = (input, predictionData) => {
  if (!predictionData) return null;

  const lowerInput = input.toLowerCase();
  const { predicted_co2_emissions, category, interpretation, vehicleData } = predictionData;
  const { fuel_type, cylinders, engine_size } = vehicleData;

  // EXPLAIN MY RESULT
  if (lowerInput.includes("explain my") || lowerInput.includes("what does my") || lowerInput.includes("what is my")) {
    const level = predicted_co2_emissions < 120 ? 'excellent' : predicted_co2_emissions < 160 ? 'good' : predicted_co2_emissions < 200 ? 'average' : 'high';
    
    const perfText = {
      excellent: "**Excellent!** Top 15% of vehicles. Like efficient hybrids. 30-40% better than average.",
      good: "**Good!** Better than 60% of vehicles. Like modern compacts. 15-20% better than average.",
      average: "**Average.** Typical mid-size. Room for 20-30% improvement through eco-driving.",
      high: "**High.** Like large SUVs/trucks. 40-60% higher than efficient cars. Big reduction opportunity."
    };

    return `**Understanding Your ${predicted_co2_emissions} g/km Result:**

Your **${FUEL_LABELS[fuel_type] || fuel_type}** vehicle with **${engine_size}L ${cylinders}-cylinder** engine produces **${predicted_co2_emissions} g/km**.

**Performance:**
${perfText[level]}

**Annual Impact (13,500 miles/year):**
- CO2: ~${Math.round(predicted_co2_emissions * 21.7)} kg/year
- Fuel cost: ~$${Math.round(predicted_co2_emissions * 5.4)}

Want reduction tips? Just ask!`;
  }

  // MY RESULT/SCORE
  if (lowerInput.includes("my result") || lowerInput.includes("my score") || lowerInput.includes("my prediction")) {
    return `**Your Vehicle's Emissions Report:**

**Prediction:** ${predicted_co2_emissions} g/km
**Category:** ${category}
**Rating:** ${category === "Excellent" ? "🟢" : category === "Good" ? "🟡" : "🔴"}

**Vehicle Specs:**
- Fuel: ${FUEL_LABELS[fuel_type] || fuel_type}
- Engine: ${engine_size}L
- Cylinders: ${cylinders}

**Interpretation:**
${interpretation}

Ask: 'How do I improve?' or 'Compare to others'`;
  }

  // HOW TO IMPROVE MY RESULT
  if ((lowerInput.includes("improve") || lowerInput.includes("reduce") || lowerInput.includes("lower")) && 
      (lowerInput.includes("my") || lowerInput.includes("result") || lowerInput.includes("score"))) {
    const tips = predicted_co2_emissions < 160 ? 
      "- Maintain tire pressure\n- Drive smoothly\n- Plan routes efficiently" :
      predicted_co2_emissions < 200 ?
      "- Tire inflation (3% savings)\n- Eco-driving techniques\n- Regular maintenance\n- Consider hybrid next" :
      "- Weekly tire checks (3-5%)\n- Smooth acceleration (20% savings)\n- Hybrid: 40-50% cut\n- EV: 80-100% cut";

    const savings = predicted_co2_emissions < 160 ? "$200-300" : predicted_co2_emissions < 200 ? "$400-600" : "$800-1200";

    return `**Personalized Plan for ${predicted_co2_emissions} g/km:**

${tips}

**Potential savings:** ${savings}/year in fuel`;
  }

  // IS MY RESULT GOOD/BAD
  if ((lowerInput.includes("is my") || lowerInput.includes("my result")) && 
      (lowerInput.includes("good") || lowerInput.includes("bad") || lowerInput.includes("average"))) {
    const rating = predicted_co2_emissions < 120 ? "Excellent! Top 15%" : 
                   predicted_co2_emissions < 160 ? "Good! Better than 60%" :
                   predicted_co2_emissions < 200 ? "Average. Room to improve" :
                   "High. Big reduction opportunity";
    
    return `**${predicted_co2_emissions} g/km Ranking:** ${rating}

**Benchmark:**
- Best: ~80 g/km (hybrid)
- **You:** ${predicted_co2_emissions} g/km
- Average: ~180 g/km
- Worst: ~300+ g/km (trucks)`;
  }

  // COMPARE TO OTHER VEHICLES
  if (lowerInput.includes("compare") || lowerInput.includes("vs") || lowerInput.includes("versus")) {
    const evCut = Math.round((1 - 70/predicted_co2_emissions) * 100);
    const hybridCut = predicted_co2_emissions > 115 ? Math.round((1 - 115/predicted_co2_emissions) * 100) : 0;
    
    return `**Your ${predicted_co2_emissions} g/km vs Others:**

**Electric Vehicle:** ~70 g/km
- Reduction: **${evCut}%**
- Savings: ~$${Math.round((predicted_co2_emissions - 70) * 5.4)}/year

**Hybrid:** ~115 g/km
- Reduction: **${hybridCut}%**
- Savings: ~$${predicted_co2_emissions > 115 ? Math.round((predicted_co2_emissions - 115) * 5.4) : 0}/year

Which fits YOUR needs?`;
  }

  return null;
};

// ==================== ADVANCED MATCHING WITH SCORING ====================
const findBestMatch = (input, predictionData) => {
  const normalized = normalizeText(input);
  
  // Check prediction query without data
  const predPhrases = ['my result', 'my prediction', 'my score', 'explain my'];
  if (predPhrases.some(p => normalized.includes(p)) && !predictionData) {
    return ["Please run a prediction first! Click 'Predict Emissions' above."];
  }

  // Detect multi-intent
  const intents = detectIntents(input);
  const responses = [];

  for (const intent of intents) {
    const intentNorm = normalizeText(intent);
    
    // PRIORITY 1: Check prediction responses FIRST
    if (predictionData) {
      const predResp = generatePredictionResponse(intent, predictionData);
      if (predResp) {
        responses.push(predResp);
        continue;
      }
    }
    
    // PRIORITY 2: Match knowledge base with scoring
    let bestMatch = null;
    let highestScore = 0;
    
    for (const entry of knowledgeBase) {
      let score = 0;
      let exactMatches = 0;
      let fuzzyMatches = 0;
      
      for (const keyword of entry.keywords) {
        const keywordNorm = normalizeText(keyword);
        
        // Exact phrase match (highest score)
        if (intentNorm.includes(keywordNorm)) {
          exactMatches++;
          score += 5; // Exact phrase = 5 points
        } else if (keywordNorm.length >= 4) {
          // Fuzzy match for typos (85% similarity threshold)
          const words = intentNorm.split(' ');
          for (const word of words) {
            if (word.length >= 4 && calculateSimilarity(word, keywordNorm) >= 0.85) {
              fuzzyMatches++;
              score += 2; // Fuzzy match = 2 points
              break;
            }
          }
        }
      }
      
      if (exactMatches === 0 && fuzzyMatches === 0) continue;
      
      // Apply priority multiplier
      score *= (entry.priority || 1);
      
      // Bonus for multiple keyword matches
      if (exactMatches + fuzzyMatches > 1) {
        score += (exactMatches + fuzzyMatches) * 2;
      }
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = entry;
      }
    }
    
    // Threshold: 1.5 (lowered for better matching)
    if (highestScore < 1.5) {
      responses.push(predictionData 
        ? "Try: 'Explain my result', 'How do I improve?', or 'Is my score good?'"
        : "Try: 'How does the website work?', 'What incentives exist?', or 'How to reduce emissions?'"
      );
    } else {
      responses.push(bestMatch.response);
    }
  }
  
  return [...new Set(responses)]; // Remove duplicates
};

// ==================== MAIN CHATBOT COMPONENT ====================
const Chatbot = ({ predictionData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserMessaged, setHasUserMessaged] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const getInitialMessage = () => {
    if (predictionData) {
      return `Prediction complete! **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}).\n\nAsk me:\n• "Explain my result"\n• "How do I improve?"\n• "Compare to others"`;
    }
    return "System online. How can I assist your eco-journey today?";
  };

  const [messages, setMessages] = useState([{ text: getInitialMessage(), sender: "bot" }]);

  useEffect(() => {
    if (predictionData && messages.length === 1) {
      setMessages([{ text: getInitialMessage(), sender: "bot" }]);
    }
  }, [predictionData]);

  // Quick prompts: Show BEFORE, hide AFTER
  const quickPrompts = useMemo(() => {
    if (hasUserMessaged) return [];
    
    if (predictionData) {
      return ["Explain my result", "How do I improve?", "Compare to others"];
    }
    return ["How does the website work?", "What incentives exist?", "How to reduce emissions"];
  }, [predictionData, hasUserMessaged]);

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

    setHasUserMessaged(true);
    const userMessage = { text: sanitizeText(input), sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = findBestMatch(userMessage.text, predictionData);
      
      // Handle multi-intent responses (stagger them)
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

  const handleQuickPrompt = useCallback((prompt) => {
    setHasUserMessaged(true);
    setMessages(prev => [...prev, { text: prompt, sender: "user" }]);
    setIsTyping(true);

    setTimeout(() => {
      const responses = findBestMatch(prompt, predictionData);
      responses.forEach((response, idx) => {
        setTimeout(() => {
          setMessages(prev => [...prev, { text: response, sender: "bot" }]);
          if (idx === responses.length - 1) setIsTyping(false);
        }, idx * 600);
      });
    }, 800);
  }, [predictionData]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[360px] h-[75vh] sm:h-[550px] bg-white border rounded-3xl shadow-2xl flex flex-col z-50"
          >
            <div className="p-4 bg-cyan-500 flex items-center justify-between rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Cpu size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Eco-Copilot</h3>
                  <span className="text-[10px] text-slate-100 font-medium uppercase">
                    {predictionData ? "Analyzing Result" : "Online"}
                  </span>
                </div>
              </div>
              <button onClick={toggleChat} className="p-2 hover:bg-white/20 rounded-full text-white">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === "user" ? "bg-emerald-600 text-white rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
                  }`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gray-100 rounded-2xl flex gap-1">
                    {[0, 150, 300].map(delay => (
                      <span key={delay} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${delay}ms` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {quickPrompts.length > 0 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button key={idx} onClick={() => handleQuickPrompt(prompt)} className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-50 border hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs text-gray-600 transition">
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={predictionData ? "Ask about your result..." : "Ask Eco-Copilot..."}
                  maxLength={500}
                  className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200"
                />
                <button onClick={handleSend} disabled={!input.trim()} className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
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
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 ${
          isOpen ? "bg-gray-900 text-white" : predictionData ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white animate-pulse" : "bg-emerald-600 text-white"
        }`}
      >
        {isOpen ? <X size={24} /> : <Cpu size={24} />}
        {predictionData && !isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-ping" />
        )}
      </motion.button>
    </>
  );
};

export default memo(Chatbot);
