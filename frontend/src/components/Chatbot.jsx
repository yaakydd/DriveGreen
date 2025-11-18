import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "bot", text: "Hi! I'm your vehicle carbon emissions assistant. Ask me anything about vehicle emissions!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const faqs = [
    {
      question: "What do the fuel types mean?",
      answer: "X = Regular Gasoline, Z = Premium Gasoline, E = Ethanol (E85), D = Diesel, N = Natural Gas. Each fuel type has different emission characteristics."
    },
    {
      question: "How is CO₂ calculated?",
      answer: "Our AI model analyzes your vehicle's fuel type, engine size, and cylinder count to predict emissions based on thousands of real vehicle data points."
    },
    {
      question: "What's a good emission level?",
      answer: "Below 120 g/km is excellent, 120-160 is good, 160-200 is average, and above 200 is high. Lower emissions mean better fuel efficiency and less environmental impact."
    },
    {
      question: "How can I reduce emissions?",
      answer: "Choose vehicles with smaller engines, fewer cylinders, or alternative fuels like electric or hybrid. Regular maintenance and efficient driving also help."
    }
  ];

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simple response logic
    setTimeout(() => {
      const lowerInput = input.toLowerCase();
      let botResponse = "I'm not sure about that. Try asking about fuel types, emissions, or how the calculator works!";

      const matchedFaq = faqs.find(faq =>
        lowerInput.includes(faq.question.toLowerCase().split(" ")[1]) ||
        lowerInput.includes("fuel") && faq.question.includes("fuel") ||
        lowerInput.includes("calculate") && faq.question.includes("calculated") ||
        lowerInput.includes("good") && faq.question.includes("good") ||
        lowerInput.includes("reduce") && faq.question.includes("reduce")
      );

      if (matchedFaq) {
        botResponse = matchedFaq.answer;
      }

      setMessages(prev => [...prev, { role: "bot", text: botResponse }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full shadow-lg flex items-center justify-center text-white text-2xl z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
      >
        💬
      </motion.button>

      {/* Chatbot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-t-2xl text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">CO₂ Assistant</h3>
                  <p className="text-sm opacity-90">Ask me anything!</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-2xl hover:bg-white/20 w-8 h-8 rounded-full"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-lg ${
                      msg.role === "user"
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-lg border border-gray-200">
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                    >
                      Typing...
                    </motion.div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="p-2 bg-gray-100 flex gap-2 overflow-x-auto">
              {["Fuel types", "How it works", "Reduce emissions"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    handleSend();
                  }}
                  className="px-3 py-1 bg-white rounded-full text-sm text-gray-700 hover:bg-green-100 whitespace-nowrap border border-gray-300"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-white rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a question..."
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSend}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  Send
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
