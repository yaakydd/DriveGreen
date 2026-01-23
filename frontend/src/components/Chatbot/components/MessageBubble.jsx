// src/components/Chatbot/components/MessageBubble.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import useAnimations from '../hooks/useAnimations';
import DOMPurify from 'dompurify';

const MessageBubble = ({ message }) => {
  const { messageAnimation } = useAnimations();
  
  // Sanitize markdown content to prevent XSS
  const sanitizedText = DOMPurify.sanitize(message.text, {
    ALLOWED_TAGS: ['strong', 'em', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
    ALLOWED_ATTR: []
  });

  return (
    <motion.div
      {...messageAnimation}
      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          message.sender === "user"
            ? "bg-emerald-600 text-white font-medium rounded-tr-none"
            : "bg-gray-100 text-gray-800 rounded-tl-none border border-gray-100"
        }`}
      >
        <ReactMarkdown>{sanitizedText}</ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
