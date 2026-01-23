import React from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import DOMPurify from 'dompurify'; // You'll need to install this

const MessageBubble = ({ message, index, animations }) => {
  // Sanitize markdown output
  const sanitizeMarkdown = (text) => {
    // Basic sanitization
    const safeText = DOMPurify.sanitize(text, {
      ALLOWED_TAGS: ['b', 'i', 'strong', 'em', 'code', 'pre', 'br', 'p', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: []
    });
    return safeText;
  };

  return (
    <motion.div
      {...animations.message}
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
            // Sanitize all rendered content
            p: ({node, ...props}) => <p {...props} />,
            strong: ({node, ...props}) => <strong {...props} />,
            em: ({node, ...props}) => <em {...props} />,
            code: ({node, ...props}) => <code className="bg-gray-200 px-1 rounded" {...props} />
          }}
        >
          {sanitizeMarkdown(message.text)}
        </ReactMarkdown>
      </div>
    </motion.div>
  );
};

export default MessageBubble;
