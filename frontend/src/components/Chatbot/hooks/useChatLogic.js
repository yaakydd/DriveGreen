import { useState, useRef, useEffect, useCallback } from 'react';
import useMessageMatching from './useMessageMatching';

const useChatLogic = (predictionData) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { findBestMatch } = useMessageMatching(predictionData);

  // Initialize messages based on prediction data
  const getInitialMessage = () => {
    if (predictionData) {
      return {
        text: `Prediction complete! Your vehicle emits **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}). \n\nAsk me:\n• "Explain my result"\n• "How do I improve?"\n• "Is this good?"`,
        sender: "bot"
      };
    }
    return {
      text: "System online. How can I assist your eco-journey today?",
      sender: "bot"
    };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);

  // Update initial message when prediction arrives
  useEffect(() => {
    if (predictionData && messages.length === 1) {
      setMessages([getInitialMessage()]);
    }
  }, [predictionData]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const processUserMessage = useCallback((userText) => {
    const userMessage = { text: userText, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const responses = findBestMatch(userText);
      
      // Handle multiple responses for multi-intent queries
      responses.forEach((response, index) => {
        setTimeout(() => {
          const botResponse = {
            text: response,
            sender: "bot"
          };
          setMessages(prev => [...prev, botResponse]);
          
          // Stop typing after last response
          if (index === responses.length - 1) {
            setIsTyping(false);
          }
        }, index * 600); // Stagger multiple responses
      });
    }, 800);
  }, [findBestMatch]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    processUserMessage(input);
  }, [input, processUserMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleQuickPrompt = useCallback((prompt) => {
    processUserMessage(prompt);
  }, [processUserMessage]);

  return {
    isOpen,
    messages,
    input,
    isTyping,
    toggleChat,
    handleSend,
    handleKeyPress,
    handleQuickPrompt,
    setInput,
    messagesEndRef,
    inputRef
  };
};

export default useChatLogic;
