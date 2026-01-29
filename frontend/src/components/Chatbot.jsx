import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo
} from "react";
import { X, Send, Cpu, AlertCircle, WifiOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";

/* ===================== CONFIG ===================== */

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const CHAT_ENDPOINT = "/api/chat";
const REQUEST_TIMEOUT = 30000;

/* ===================== HELPERS ===================== */

const sanitizeText = (text) =>
  text
    .replace(/<script.*?>.*?<\/script>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+=/gi, "");

const ErrorIconMap = {
  NETWORK: WifiOff,
  TIMEOUT: AlertCircle,
  RATE_LIMIT: AlertCircle,
  SERVICE_UNAVAILABLE: AlertCircle,
  UNKNOWN: AlertCircle
};

/* ===================== API ===================== */

const sendMessage = async (message, predictionData, signal) => {
  const res = await fetch(`${API_URL}${CHAT_ENDPOINT}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify({
      message: sanitizeText(message),
      prediction_data: predictionData
    })
  });

  if (res.status === 429) throw { type: "RATE_LIMIT" };
  if (res.status === 503) throw { type: "SERVICE_UNAVAILABLE" };
  if (!res.ok) throw { type: "UNKNOWN" };

  const data = await res.json();
  return data.response;
};

/* ===================== ERROR UI ===================== */

const ErrorBubble = memo(({ error, onRetry }) => {
  if (!error) return null;
  const Icon = ErrorIconMap[error.type] || AlertCircle;

  return (
    <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-xl">
      <Icon size={16} className="text-red-600 mt-1" />
      <div className="flex-1">
        <p className="text-sm text-red-700">{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-1 text-xs font-semibold text-red-700 hover:underline"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
});

/* ===================== MAIN COMPONENT ===================== */

const Chatbot = ({ predictionData }) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState(null);

  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);

  /* ---------- Initial Message ---------- */

  useEffect(() => {
    const intro = predictionData
      ? `Prediction complete: **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}).  
Ask me:
• Explain my result  
• How can I reduce emissions?`
      : "Hi! I’m Eco-Copilot 🌱. Ask me anything about vehicle emissions.";

    setMessages([{ sender: "bot", text: intro }]);
  }, [predictionData]);

  /* ---------- Auto Scroll ---------- */

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ---------- Send ---------- */

  const handleSend = useCallback(async () => {
    if (!input.trim() || typing) return;

    const userText = input.trim();
    setInput("");
    setTyping(true);
    setError(null);

    setMessages((m) => [...m, { sender: "user", text: userText }]);

    const controller = new AbortController();
    abortRef.current = controller;

    const timeout = setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT
    );

    try {
      const reply = await sendMessage(
        userText,
        predictionData,
        controller.signal
      );
      setMessages((m) => [...m, { sender: "bot", text: reply }]);
    } catch (err) {
      let type = err.type || "UNKNOWN";
      let message =
        type === "RATE_LIMIT"
          ? "Too many requests. Please wait a moment."
          : type === "SERVICE_UNAVAILABLE"
          ? "AI is warming up. Try again shortly."
          : type === "TIMEOUT"
          ? "Request timed out."
          : "Something went wrong.";

      setError({ type, message });
    } finally {
      clearTimeout(timeout);
      setTyping(false);
    }
  }, [input, typing, predictionData]);

  /* ---------- Retry ---------- */

  const retryLast = () => {
    const lastUser = [...messages].reverse().find(m => m.sender === "user");
    if (!lastUser) return;
    setInput(lastUser.text);
    handleSend();
  };

  /* ---------- Keyboard ---------- */

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ===================== UI ===================== */

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-20 right-4 w-[360px] h-[550px] bg-white rounded-3xl shadow-xl flex flex-col z-50"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex justify-between rounded-t-3xl">
              <div className="flex items-center gap-2">
                <Cpu size={18} />
                <span className="font-semibold">Eco-Copilot</span>
              </div>
              <button onClick={() => setOpen(false)}>
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${
                    m.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                      m.sender === "user"
                        ? "bg-emerald-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <ReactMarkdown>{m.text}</ReactMarkdown>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="text-sm text-gray-400">Eco-Copilot is typing…</div>
              )}

              {error && <ErrorBubble error={error} onRetry={retryLast} />}
              <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={typing}
                placeholder="Ask about emissions…"
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
              />
              <button
                onClick={handleSend}
                disabled={typing || !input.trim()}
                className="bg-emerald-600 text-white px-4 rounded-xl"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg"
      >
        <Cpu />
      </button>
    </>
  );
};

export default memo(Chatbot);
    if (response.status === 429) {
      throw new Error('RATE_LIMIT');
    }

    if (response.status === 503) {
      throw new Error('SERVICE_UNAVAILABLE');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, response: data.response };

  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error.name === 'AbortError') {
      if (retryCount < API_CONFIG.maxRetries) {
        await sleep(1000 * (retryCount + 1)); // Exponential backoff
        return callChatbotAPI(message, predictionData, retryCount + 1);
      }
      return { 
        success: false, 
        error: 'TIMEOUT',
        message: "The request took too long. Please try a shorter question or try again later."
      };
    }

    // Handle network errors
    if (error.message === 'Failed to fetch' || !navigator.onLine) {
      return {
        success: false,
        error: 'NETWORK',
        message: "Can't connect to the server. Please check your internet connection and try again."
      };
    }

    // Handle rate limiting
    if (error.message === 'RATE_LIMIT') {
      return {
        success: false,
        error: 'RATE_LIMIT',
        message: "Too many requests. Please wait a moment and try again."
      };
    }

    // Handle service unavailable
    if (error.message === 'SERVICE_UNAVAILABLE') {
      if (retryCount < API_CONFIG.maxRetries) {
        await sleep(2000 * (retryCount + 1));
        return callChatbotAPI(message, predictionData, retryCount + 1);
      }
      return {
        success: false,
        error: 'SERVICE_UNAVAILABLE',
        message: "The AI service is temporarily unavailable. Please try again in a few moments."
      };
    }

    // Generic error with retry
    if (retryCount < API_CONFIG.maxRetries) {
      await sleep(1000 * (retryCount + 1));
      return callChatbotAPI(message, predictionData, retryCount + 1);
    }

    return {
      success: false,
      error: 'UNKNOWN',
      message: error.message || "Something went wrong. Please try again."
    };
  }
};

// ==================== ERROR MESSAGE COMPONENT ====================
const ErrorMessage = memo(({ error, onRetry }) => {
  const errorConfig = {
    NETWORK: {
      icon: WifiOff,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-200"
    },
    TIMEOUT: {
      icon: AlertCircle,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
      border: "border-yellow-200"
    },
    RATE_LIMIT: {
      icon: AlertCircle,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200"
    },
    SERVICE_UNAVAILABLE: {
      icon: AlertCircle,
      color: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-200"
    },
    UNKNOWN: {
      icon: AlertCircle,
      color: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200"
    }
  };

  const config = errorConfig[error.type] || errorConfig.UNKNOWN;
  const Icon = config.icon;

  return (
    <div className={`flex items-start gap-2 p-3 rounded-lg border ${config.bg} ${config.border}`}>
      <Icon size={18} className={`${config.color} mt-0.5 flex-shrink-0`} />
      <div className="flex-1">
        <p className={`text-sm ${config.color} leading-relaxed`}>{error.message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className={`mt-2 text-xs font-medium ${config.color} hover:underline`}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

// ==================== MAIN CHATBOT COMPONENT ====================
const Chatbot = ({ predictionData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasUserMessaged, setHasUserMessaged] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const getInitialMessage = () => {
    if (predictionData) {
      return `Prediction complete! **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}).\n\nAsk me:\n• "Explain my result"\n• "How do I improve?"\n• "Compare to others"`;
    }
    return "System online. How can I assist your eco-journey today?";
  };

  const [messages, setMessages] = useState([{ text: getInitialMessage(), sender: "bot" }]);

  // Update initial message when prediction changes
  useEffect(() => {
    if (predictionData && messages.length === 1) {
      setMessages([{ text: getInitialMessage(), sender: "bot" }]);
    }
  }, [predictionData]);

  // Quick prompts: Show BEFORE first message, hide AFTER
  const quickPrompts = useMemo(() => {
    if (hasUserMessaged) return [];
    
    if (predictionData) {
      return ["Explain my result", "How do I improve?", "Compare to others"];
    }
    return ["How does the website work?", "What incentives exist?", "How to reduce emissions?"];
  }, [predictionData, hasUserMessaged]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
    // Clear connection errors when opening
    if (!isOpen) {
      setConnectionError(null);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  /**
   * Main function to get bot response from API
   */
  const getBotResponse = useCallback(async (userMessage) => {
    setConnectionError(null); // Clear previous errors

    const result = await callChatbotAPI(userMessage, predictionData);

    if (result.success) {
      return result.response;
    } else {
      // Store error for display
      setConnectionError({
        type: result.error,
        message: result.message
      });
      return null;
    }
  }, [predictionData]);

  /**
   * Handle sending a message
   */
  const handleSend = useCallback(async () => {
    if (!input.trim() || isTyping) return;

    const trimmedInput = input.trim();
    setHasUserMessaged(true);
    
    // Add user message
    const userMessage = { text: sanitizeText(trimmedInput), sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);
    setConnectionError(null);

    try {
      // Get AI response
      const botResponse = await getBotResponse(trimmedInput);

      // Add bot response or show error
      setTimeout(() => {
        if (botResponse) {
          setMessages(prev => [...prev, { text: botResponse, sender: "bot" }]);
        } else {
          // Error already stored in connectionError state
          setMessages(prev => [...prev, { 
            text: "", 
            sender: "bot", 
            isError: true 
          }]);
        }
        setIsTyping(false);
      }, 800);

    } catch (error) {
      console.error('Unexpected error:', error);
      setConnectionError({
        type: 'UNKNOWN',
        message: "An unexpected error occurred. Please try again."
      });
      setMessages(prev => [...prev, { 
        text: "", 
        sender: "bot", 
        isError: true 
      }]);
      setIsTyping(false);
    }
  }, [input, isTyping, getBotResponse]);

  /**
   * Retry last message
   */
  const handleRetry = useCallback(async () => {
    // Find last user message
    const lastUserMessage = [...messages].reverse().find(m => m.sender === "user");
    if (!lastUserMessage) return;

    // Remove error message
    setMessages(prev => prev.filter(m => !m.isError));
    setIsTyping(true);
    setConnectionError(null);

    const botResponse = await getBotResponse(lastUserMessage.text);

    setTimeout(() => {
      if (botResponse) {
        setMessages(prev => [...prev, { text: botResponse, sender: "bot" }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "", 
          sender: "bot", 
          isError: true 
        }]);
      }
      setIsTyping(false);
    }, 800);
  }, [messages, getBotResponse]);

  /**
   * Handle Enter key press
   */
  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  /**
   * Handle quick prompt click
   */
  const handleQuickPrompt = useCallback(async (prompt) => {
    if (isTyping) return;

    setHasUserMessaged(true);
    setMessages(prev => [...prev, { text: prompt, sender: "user" }]);
    setIsTyping(true);
    setConnectionError(null);

    const botResponse = await getBotResponse(prompt);

    setTimeout(() => {
      if (botResponse) {
        setMessages(prev => [...prev, { text: botResponse, sender: "bot" }]);
      } else {
        setMessages(prev => [...prev, { 
          text: "", 
          sender: "bot", 
          isError: true 
        }]);
      }
      setIsTyping(false);
    }, 800);
  }, [isTyping, getBotResponse]);

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
            {/* Header */}
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
              <button 
                onClick={toggleChat} 
                className="p-2 hover:bg-white/20 rounded-full text-white transition"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.isError ? (
                    <div className="max-w-[80%]">
                      <ErrorMessage error={connectionError} onRetry={handleRetry} />
                    </div>
                  ) : (
                    <div className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === "user" 
                        ? "bg-emerald-600 text-white rounded-tr-none" 
                        : "bg-gray-100 text-gray-800 rounded-tl-none"
                    }`}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 bg-gray-100 rounded-2xl flex gap-1">
                    {[0, 150, 300].map(delay => (
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

            {/* Quick Prompts */}
            {quickPrompts.length > 0 && (
              <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
                {quickPrompts.map((prompt, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => handleQuickPrompt(prompt)} 
                    disabled={isTyping}
                    className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-50 border hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs text-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
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
                  disabled={isTyping}
                  className="flex-1 bg-gray-50 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  onClick={handleSend} 
                  disabled={!input.trim() || isTyping} 
                  className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        onClick={toggleChat}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-lg z-50 transition ${
          isOpen 
            ? "bg-gray-900 text-white" 
            : predictionData 
              ? "bg-gradient-to-r from-emerald-600 to-cyan-600 text-white animate-pulse" 
              : "bg-emerald-600 text-white"
        }`}
        aria-label={isOpen ? "Close chat" : "Open chat"}
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
