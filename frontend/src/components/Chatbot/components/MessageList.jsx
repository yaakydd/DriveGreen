import React from "react";
import MessageBubble from "./MessageBubble";

const MessageList = ({ messages, isTyping, messagesEndRef, animations }) => {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg}
          index={index}
          animations={animations}
        />
      ))}

      {isTyping && (
        <div className="flex justify-start">
          <div className="px-4 py-3 bg-gray-100 rounded-2xl rounded-tl-none flex gap-1 items-center border border-gray-100">
            {[0, 150, 300].map((delay) => (
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
  );
};

export default MessageBubble;
