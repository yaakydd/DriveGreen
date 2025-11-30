// File: frontend/src/components/Chatbot.jsx

// ===== IMPORTS & SETUP =====

// Import React hooks for state management, references, and side effects.
import React, { useState, useRef, useEffect } from "react";
// Import Framer Motion components for smooth UI animations.
import { motion, AnimatePresence } from "framer-motion";
// Import icons from lucide-react (Chat icon, Close icon, Send icon, Sparkles/Leaf for theming).
import { MessageCircle, X, Send, Sparkles, Leaf } from "lucide-react";

/**
 * Smart Chatbot Component
 * * Features: Comprehensive CO2 knowledge base.
 * Theme: Deep Teal and Cyan (Tech/Water feel).
 * Layout: Fixed to the bottom-right corner.
 * UX: Includes an introductory tooltip on page load.
 */
const Chatbot = () => {
  // State to manage the visibility of the main chatbot window.
  const [isOpen, setIsOpen] = useState(false);
  // State to manage the visibility of the introductory tooltip.
  const [showTooltip, setShowTooltip] = useState(true);

  // State to hold all messages (both user and bot). Initial message is the bot's greeting.
  const [messages, setMessages] = useState([
    { 
      role: "bot", 
      text: "Hi! 👋 I'm your CO₂ emissions expert. I can answer detailed questions about:\n\n• Fuel types (X, Z, E, D, N)\n• Emission levels & impacts\n• How our calculator works\n• Reducing your carbon footprint\n• Cost savings & comparisons\n\nAsk me anything!" 
    }
  ]);
  // State for the text input field.
  const [input, setInput] = useState("");
  // State to show the "Bot is typing..." indicator.
  const [isTyping, setIsTyping] = useState(false);
  
  // Ref to automatically scroll the messages container to the bottom on new messages.
  const messagesEndRef = useRef(null);

  // ===== EFFECT HOOKS =====

  // Effect to scroll to the latest message whenever the 'messages' array updates.
  useEffect(() => {
    // Scrolls the element referenced by messagesEndRef into view smoothly.
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Effect to manage the initial tooltip display/timeout.
  useEffect(() => {
    // Set a timeout to automatically hide the tooltip after 5 seconds.
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 5000); 
    
    // Cleanup function: Clear the timeout if the component unmounts.
    return () => clearTimeout(timer);
  }, []); 

  // Effect to hide the tooltip immediately when the chat window opens.
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  // ===== KNOWLEDGE BASE (UNCHANGED FUNCTIONALITY) =====
  
  // The comprehensive knowledge base object for mapping keywords to detailed responses.
  const knowledgeBase = {
    // Each entry contains 'keywords' for matching user input and a detailed 'response'.
    fuelTypes: {
      keywords: ["fuel", "type", "gasoline", "diesel", "ethanol", "gas", "x", "z", "e", "d", "n", "petrol"],
      response: `🔋 **Fuel Types Explained:**

**X - Regular Gasoline**
- Most common fuel type
- Typical emissions: 200-250 g/km
- Best for: Standard vehicles, daily commuting
- Octane rating: 87

**Z - Premium Gasoline**
- Higher octane (91-93)
- Similar emissions to regular: 200-250 g/km
- Best for: High-performance engines
- More expensive but prevents engine knock

**E - Ethanol (E85)**
- 85% ethanol, 15% gasoline
- Emissions: 180-220 g/km
- Best for: Flex-fuel vehicles
- Renewable but lower fuel economy

**D - Diesel**
- More efficient than gasoline
- Emissions: 150-200 g/km
- Best for: Long distances, heavy loads
- Higher torque, better mileage

**N - Natural Gas**
- Cleanest fossil fuel
- Emissions: 120-180 g/km
- Best for: Urban driving, fleets
- Requires special conversion

💡 **Which is cleanest?** Natural Gas (N) < Diesel (D) < Ethanol (E) < Gasoline (X/Z)`
    },
    emissions: {
      keywords: ["emission", "co2", "carbon", "pollution", "level", "much", "high", "low"],
      response: `🌍 **CO₂ Emission Levels Explained:**

**Excellent (<120 g/km)** ✅
- Examples: Hybrids, small cars (1.0-1.4L)
- Annual CO₂: ~1.2-1.8 tons (10,000 km/year)
- Environmental impact: Minimal
- Fuel cost: Very low

**Good (120-160 g/km)** 👍
- Examples: Compact cars, efficient sedans
- Annual CO₂: ~1.8-2.4 tons
- Environmental impact: Low
- Fuel cost: Low to moderate

**Average (160-200 g/km)** ⚠️
- Examples: Mid-size sedans, small SUVs
- Annual CO₂: ~2.4-3.0 tons
- Environmental impact: Moderate
- Fuel cost: Moderate

**High (200-250 g/km)** ⚡
- Examples: Large sedans, SUVs
- Annual CO₂: ~3.0-3.75 tons
- Environmental impact: Significant
- Fuel cost: High

**Very High (>250 g/km)** 🔥
- Examples: Trucks, V8 engines, sports cars
- Annual CO₂: >3.75 tons
- Environmental impact: Very high
 Fuel cost: Very high

📊 **Context:** Average global target is 95 g/km by 2030!`
    },
    calculator: {
      keywords: ["how", "work", "calculate", "predict", "algorithm", "model", "accuracy"],
      response: `🤖 **How Our CO₂ Calculator Works:**

**1. Data Collection** 📊
- You provide: Fuel type, Engine size, Cylinders
- We have: 10,000+ real vehicle emissions data

**2. Preprocessing** 🔄
- Log transformation of numerical values
- One-hot encoding of fuel type
- Feature scaling with StandardScaler

**3. Machine Learning** 🧠
- Model: XGBoost (Extreme Gradient Boosting)
- Trained on real-world vehicle data
- Accuracy: 95%+ on test data

**4. Prediction** 💫
- Model analyzes your vehicle specs
- Compares to similar vehicles in database
- Outputs CO₂ emissions in g/km

**5. Interpretation** 📈
- Categorizes result (Excellent to Very High)
- Provides personalized recommendations
- Generates shareable PDF report

⚡ **Why so accurate?**
- Uses advanced AI (XGBoost)
- Trained on real EPA/government data
- Considers multiple vehicle factors
- Continuously validated

🎯 **Typical accuracy:** ±10 g/km`
    },
    reduce: {
      keywords: ["reduce", "lower", "decrease", "improve", "save", "tips", "help", "less"],
      response: `♻️ **How to Reduce Your CO₂ Emissions:**

**🚗 Driving Habits (Save 10-25%)**
- Avoid rapid acceleration/braking
- Use cruise control on highways
- Turn off engine when idle >30 seconds
- Remove roof racks when not in use
- Combine errands into single trips

**🔧 Vehicle Maintenance (Save 5-15%)**
- Keep tires inflated to proper pressure (+3% efficiency)
- Regular oil changes
- Replace dirty air filters
- Fix engine problems promptly
- Use recommended motor oil grade

**⚖️ Reduce Weight (Save 1-2% per 100 lbs)**
- Remove unnecessary items from trunk
- Don't carry excess cargo
- Remove roof racks when not needed

**🛣️ Route Planning (Save 10-20%)**
- Avoid traffic congestion
- Use GPS for efficient routes
- Minimize highway speeds >65 mph

**🚙 Long-Term Solutions:**
- Carpool (halves emissions per person)
- Use public transport when possible
- Consider hybrid/electric for next purchase
- Telecommute when feasible

💰 **Bonus:** These tips also save money on fuel!

📊 **Real Example:**
From 220 g/km → 180 g/km = $400/year savings`
    },
    engine: {
      keywords: ["engine", "size", "cylinder", "liter", "displacement", "4", "6", "8"],
      response: `⚙️ **Engine Size & Cylinders Explained:**

**Engine Size (Liters = Displacement)**

**Small (1.0-1.6L)** 🏎️
- Cylinders: Usually 3-4
- Emissions: 100-150 g/km
- Power: 60-120 HP
- Best for: City driving, fuel economy
- Examples: Honda Civic, Toyota Yaris

**Medium (1.6-2.5L)** 🚗
- Cylinders: Usually 4
- Emissions: 150-200 g/km
- Power: 120-200 HP
- Best for: Balanced performance
- Examples: Honda Accord, Toyota Camry

**Large (2.5-4.0L)** 🚙
- Cylinders: Usually 6
- Emissions: 200-280 g/km
- Power: 200-350 HP
- Best for: Towing, acceleration
- Examples: Ford F-150, Toyota 4Runner

**Very Large (4.0+L)** 🛻
- Cylinders: 6-8
- Emissions: 280+ g/km
- Power: 350+ HP
- Best for: Heavy towing, performance
- Examples: RAM 2500, Sports cars

**Cylinder Count Impact:**
- 3-4 cylinders: Most efficient
- 6 cylinders: Balanced power/efficiency
- 8+ cylinders: Maximum power, highest emissions

⚖️ **Rule of Thumb:**
Bigger engine = More power BUT higher emissions & fuel costs`
    },
    climate: {
      keywords: ["climate", "environment", "planet", "global", "warming", "impact", "earth"],
      response: `🌡️ **Climate Impact of Vehicle Emissions:**

**The Big Picture** 🌍
- Transportation: 27% of global CO₂ emissions
- Cars alone: 41% of transport emissions
- 1.4 billion cars worldwide
- Average car: 4.6 tons CO₂/year

**Your Vehicle's Impact (10,000 km/year):**

**Excellent (100 g/km)**
- Annual CO₂: 1.0 ton
- Trees needed to offset: ~50 trees/year
- Equivalent to: 2 round-trip flights NYC-LA

**Average (200 g/km)**
- Annual CO₂: 2.0 tons
- Trees needed: ~100 trees/year
- Equivalent to: 4 round-trip flights NYC-LA

**High (300 g/km)**
- Annual CO₂: 3.0 tons
- Trees needed: ~150 trees/year
- Equivalent to: 6 round-trip flights NYC-LA

**Global Context:**
- Paris Agreement goal: Limit warming to 1.5°C
- Transport must cut emissions 50% by 2030
- Electric vehicles: 0 direct emissions

🌱 **What You Can Do:**
1. Choose efficient vehicles
2. Drive less, carpool more
3. Offset emissions (plant trees, carbon credits)
4. Support clean energy policies

💡 Every gallon saved = 20 lbs CO₂ prevented!`
    },
    money: {
      keywords: ["cost", "money", "price", "save", "expensive", "fuel", "economy", "budget"],
      response: `💰 **Emissions vs Fuel Costs:**

**The Direct Relationship:**
Lower emissions = Lower fuel costs (always!)

**Annual Cost Comparison (15,000 km/year, $1.50/L gas):**

**Excellent (100 g/km)**
- Fuel consumption: ~4.5 L/100km
- Annual cost: ~$1,000
- Cost per km: $0.07

**Good (150 g/km)**
- Fuel consumption: ~6.5 L/100km
- Annual cost: ~$1,450
- Cost per km: $0.10

**Average (200 g/km)**
- Fuel consumption: ~8.5 L/100km
- Annual cost: ~$1,900
- Cost per km: $0.13

**High (250 g/km)**
- Fuel consumption: ~10.5 L/100km
- Annual cost: ~$2,350
- Cost per km: $0.16

**Very High (300 g/km)**
- Fuel consumption: ~12.5 L/100km
- Annual cost: ~$2,800
- Cost per km: $0.19

📊 **5-Year Savings:**
Choosing 150 g/km over 250 g/km = **$4,500 saved!**

**Additional Savings:**
- Lower insurance premiums
- Tax incentives (many countries)
- Better resale value
- Less maintenance (smaller engines)

💡 **Pro Tip:** Calculate savings before buying!`
    },
    compare: {
      keywords: ["compare", "comparison", "difference", "better", "best", "worst", "vs", "versus"],
      response: `📊 **Vehicle Emission Comparisons:**

**By Vehicle Type:**

**City Car (1.2L, 3-cyl, Gasoline)**
- CO₂: 110-130 g/km | Excellent ✅
- Fuel cost: Very low
- Best for: Urban commuting

**Compact (1.6L, 4-cyl, Gasoline)**
- CO₂: 140-160 g/km | Good 👍
- Fuel cost: Low
- Best for: Daily driving

**Sedan (2.0L, 4-cyl, Gasoline)**
- CO₂: 170-190 g/km | Average ⚠️
- Fuel cost: Moderate
- Best for: Families

**SUV (3.0L, 6-cyl, Gasoline)**
- CO₂: 230-260 g/km | High ⚡
- Fuel cost: High
- Best for: Space, cargo

**Truck (5.0L, 8-cyl, Gasoline)**
- CO₂: 300-350 g/km | Very High 🔥
- Fuel cost: Very high
- Best for: Towing, work

**Hybrid (1.8L + Electric)**
- CO₂: 80-100 g/km | Excellent ✅
- Fuel cost: Very low
- Best for: Eco-conscious

**Electric Vehicle**
- CO₂: 0 g/km (direct) | Perfect 🌟
- Fuel cost: Lowest (electricity)
- Best for: Environment

🎯 **Bottom Line:**
Match vehicle size to actual needs, not wants!`
    }
  };

  // Function to find the best matching response from the knowledge base.
  const findBestMatch = (userInput) => {
    // Converts input to lowercase for case-insensitive matching.
    const lowerInput = userInput.toLowerCase();
    
    // Finds the first matching knowledge base entry based on keywords.
    const match = Object.entries(knowledgeBase).find(([key, data]) => 
      data.keywords.some(keyword => lowerInput.includes(keyword))
    );
    
    // Returns the matched response or a generic fallback message.
    return match 
      ? match[1].response 
      : `I'd love to help! I specialize in:

🔋 **Fuel Types** - Ask: "What fuel types are there?"
📊 **Emission Levels** - Ask: "What's a good emission level?"
🤖 **How it Works** - Ask: "How does the calculator work?"
♻️ **Reducing Emissions** - Ask: "How to reduce emissions?"
⚙️ **Engine Impact** - Ask: "How does engine size affect emissions?"
🌍 **Climate Impact** - Ask: "What's the environmental impact?"
💰 **Cost Savings** - Ask: "How much can I save?"
📈 **Comparisons** - Ask: "Compare vehicle emissions"

Try rephrasing your question with these topics! 😊`;
  };

  // Handle message send logic.
  const handleSend = () => {
    // Exit if the input is empty or just whitespace.
    if (!input.trim()) return;

    // Create the user message object and add it to state.
    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    
    // Clear the input and show the typing indicator.
    setInput("");
    setIsTyping(true);

    // Simulate an AI response delay.
    setTimeout(() => {
      const botResponse = findBestMatch(userMessage.text);
      const botMessage = { role: "bot", text: botResponse };
      
      // Add the bot message and hide the typing indicator.
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000); 
  };

  // Quick reply buttons available at the bottom of the chat.
  const quickReplies = [
    "Fuel types",
    "How it works",
    "Reduce emissions",
    "Compare vehicles"
  ];

  // ===== RENDER LOGIC (Layout and Spacing Fixes Applied) =====
  return (
    <>
      {/* 1. FLOATING BUTTON & TOOLTIP (Positioned bottom-right) */}
      
      {/* Tooltip to introduce the chatbot on page load */}
      <AnimatePresence>
        {showTooltip && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            // Layout Change: Fixed bottom-24 right-6
            className="fixed bottom-24 right-6 p-3 w-64 bg-slate-800 text-white rounded-lg shadow-xl text-sm z-50 pointer-events-none"
          >
            <p className="font-semibold flex items-center gap-1 text-cyan-400">
                <Leaf className="w-4 h-4" />
                Hi there!
            </p>
            <p className="mt-1">I'm your CO₂ Expert. Click to chat!</p>
            {/* Tailwind triangle/arrow for the tooltip (position adjusted for right side) */}
            <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-slate-800 transform rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button (Positioned bottom-right) */}
      <motion.button
        // Layout Change: fixed bottom-6 right-6
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-full shadow-lg flex items-center justify-center text-white z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Shows X when open, MessageCircle when closed */}
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      {/* 2. CHATBOT WINDOW (Positioned bottom-right) */}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            // Layout Change: fixed bottom-24 right-6
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
          >
            {/* Header (Teal/Cyan Gradient) */}
            <div className="bg-gradient-to-r from-teal-600 to-cyan-700 p-4 rounded-t-2xl text-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Leaf className="w-6 h-6" />
                  <div>
                    <h3 className="font-bold text-lg">CO₂ Expert</h3>
                    <p className="text-sm opacity-90 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI-Powered Advisor
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 w-8 h-8 rounded-full flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages Container */}
            {/* Spacing Fix: Increased bottom padding (pb-2) to give scrolling content more room above Quick Replies. */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 pb-2">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  // Ensures user messages align right, bot messages align left.
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-3 rounded-xl whitespace-pre-line shadow-md ${
                      msg.role === "user"
                        ? "bg-teal-500 text-white rounded-br-none" // User bubble styling
                        : "bg-white text-gray-800 border border-gray-200 rounded-tl-none" // Bot bubble styling
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm rounded-tl-none">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4 text-teal-500" />
                      Thinking...
                    </motion.div>
                  </div>
                </div>
              )}
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies */}
            {/* Spacing Fix: Added margin-y (my-1) and horizontal padding (px-3) for cleaner separation. */}
            <div className="py-2 px-3 bg-gray-100 flex gap-2 overflow-x-auto border-t">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    // Sets input, then immediately triggers send.
                    setInput(q);
                    handleSend();
                  }}
                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 hover:bg-teal-50 hover:text-teal-800 whitespace-nowrap border border-gray-300 transition-colors shadow-sm"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Footer */}
            <div className="p-3 border-t bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask about emissions..."
                  className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="bg-teal-500 text-white p-3 rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50"
                  disabled={!input.trim()} // Disable button if input is empty
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;