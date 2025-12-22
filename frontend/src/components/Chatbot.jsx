import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Send,
  Cpu,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

// Knowledge Base (Simplified for restoration)
const knowledgeBase = [
  {
    keywords: ["hello", "hi", "hey"],
    response:
      "Greetings! I'm your Eco-Copilot. Ready to optimize your journey? 🌱",
  },
  {
    keywords: ["app", "do", "help"],
    response:
      "I utilize advanced AI to analyze vehicle emissions. Enter your car's details, and I'll calculate your carbon footprint and suggest eco-friendly alternatives.",
  },
  {
    keywords: ["color", "red", "green"],
    response:
      "The colors indicate efficiency: **Green** is excellent, **Yellow** is average, and **Red** suggests high emissions needing attention.",
  },
  {
    keywords: ["reduce", "lower", "tips"],
    response:
      "**Optimization Protocols:**\n1. Maintain tire pressure.\n2. Remove excess weight.\n3. Avoid rapid acceleration.\n4. Consider hybrid/EV conversion.",
  },
  {
    keywords: ["thank"],
    response: "You're welcome. Driving toward a sustainable future, together.",
  },
];

const findBestMatch = (input) => {
  const lowerInput = input.toLowerCase();
  for (const entry of knowledgeBase) {
    if (entry.keywords.some((keyword) => lowerInput.includes(keyword))) {
      return entry.response;
    }
  }
  return "I'm processing that parameter. Could you rephrase or ask about reducing emissions?";
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Systems online. How can I assist your eco-journey today?",
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const botResponse = {
        text: findBestMatch(userMessage.text),
        sender: "bot",
      };
      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const quickPrompts = [
    "Reduce emissions",
    "How it works",
    "What do colors mean?",
  ];

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-[360px] h-[550px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <Cpu size={16} className="text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-gray-900 text-sm tracking-wide">
                    Eco-Copilot
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-gray-500 font-medium uppercase tracking-wider">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={toggleChat}
                className="p-2 hover:bg-gray-50 rounded-full transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-white">
              {messages.map((msg, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
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
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    ></span>
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    ></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length < 3 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar bg-white">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(prompt);
                      handleSend();
                    }}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs text-gray-600 transition-all font-medium"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask Eco-Copilot..."
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

      {/* Launcher Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all z-50 ${
          isOpen
            ? "bg-gray-900 text-white"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isOpen ? <X size={24} /> : <Cpu size={24} />}

        {/* Tooltip hint when closed */}
        {!isOpen && (
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-white border border-gray-100 shadow-md rounded-lg text-xs font-medium text-gray-700 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Eco-Copilot
          </span>
        )}
      </motion.button>
    </>
  );
};

export default Chatbot;
