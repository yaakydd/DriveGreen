import { useState, useRef, useEffect, useCallback } from "react";
import { useMessageMatching } from './useMessageMatching';

export const useChatLogic = (predictionData) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      text: predictionData 
        ? `Great! I see you got your prediction: **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}). Ask me anything about your result!`
        : "System online. How can I assist your eco-journey today?", 
      sender: "bot" 
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true); // ADD THIS
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { getBotResponse } = useMessageMatching(predictionData);

  // Update initial message when prediction arrives
  useEffect(() => {
    if (predictionData && messages.length === 1) {
      setMessages([{
        text: `Prediction complete! Your vehicle emits **${predictionData.predicted_co2_emissions} g/km** (${predictionData.category}). \n\nAsk me:\n• "Explain my result"\n• "How do I improve?"\n• "Is this good?"`,
        sender: "bot"
      }]);
      setShowQuickPrompts(true); // Reset when new prediction
    }
  }, [predictionData, messages.length]);

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

  const sendMessage = useCallback(() => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setShowQuickPrompts(false); // HIDE quick prompts when user types
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        text: getBotResponse(userMessage.text),
        sender: "bot"
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  }, [input, getBotResponse]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const sendQuickPrompt = useCallback((prompt) => {
    const userMessage = { text: prompt, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setShowQuickPrompts(false); // HIDE quick prompts when clicked
    setIsTyping(true);

    setTimeout(() => {
      const botResponse = {
        text: getBotResponse(userMessage.text),
        sender: "bot"
      };
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 800);
  }, [getBotResponse]);

  return {
    isOpen,
    messages,
    input,
    isTyping,
    showQuickPrompts, // ADD THIS to return
    messagesEndRef,
    inputRef,
    toggleChat,
    setInput,
    sendMessage,
    handleKeyPress,
    sendQuickPrompt
  };
};