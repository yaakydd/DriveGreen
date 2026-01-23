import React from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import useAnimations from '../hooks/useAnimations';

const MessageBubble = ({ message }) => {
  const { messageAnimation } = useAnimations();
  
  // Sanitize content to prevent XSS (without external library)
  const sanitizeText = (text) => {
    // Remove script tags and dangerous HTML
    return text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, ''); // Remove event handlers like onclick=
  };

  const sanitizedText = sanitizeText(message.text);

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
        <ReactMarkdown
          components={{
            // Only allow safe markdown elements
            a: ({ node, ...props }) => <a {...props} target="_blank" rel="noopener noreferrer" />,
            img: () => null, // Block images
            script: () => null, // Block scripts
            iframe: () => null // Block iframes
          }}
        >
          {sanitizedText}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default MessageBubble;