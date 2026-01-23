// Updated ChatWindow.jsx with conditional rendering
import React from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types'; // Add this import

const ChatWindow = ({
  messages,
  input,
  isTyping,
  predictionData,
  toggleChat,
  handleSend,
  handleKeyPress,
  handleQuickPrompt,
  setInput,
  messagesEndRef,
  inputRef
}) => {
  const { chatWindow } = useAnimations();
  
  // Calculate if bot has responded (exclude typing indicators)
  const hasBotResponded = React.useMemo(() => {
    return messages.some(msg => 
      msg.sender === 'bot' && 
      msg.type !== 'typing-indicator' &&
      msg.content !== ''
    );
  }, [messages]);

  return (
    <motion.div
      {...chatWindow}
      className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[360px] h-[75vh] sm:h-[550px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
    >
      <ChatHeader
        predictionData={predictionData}
        toggleChat={toggleChat}
      />

      <MessageList
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />

      {/* CRITICAL FIX: Only show quick prompts before first bot response */}
      {!hasBotResponded && (
        <QuickPrompts
          predictionData={predictionData}
          handleQuickPrompt={handleQuickPrompt}
        />
      )}

      <InputArea
        input={input}
        setInput={setInput}
        handleSend={handleSend}
        handleKeyPress={handleKeyPress}
        predictionData={predictionData}
        inputRef={inputRef}
      />
    </motion.div>
  );
};

// Add PropTypes for better development
ChatWindow.propTypes = {
  messages: PropTypes.array.isRequired,
  input: PropTypes.string.isRequired,
  isTyping: PropTypes.bool.isRequired,
  predictionData: PropTypes.object,
  toggleChat: PropTypes.func.isRequired,
  handleSend: PropTypes.func.isRequired,
  handleKeyPress: PropTypes.func.isRequired,
  handleQuickPrompt: PropTypes.func.isRequired,
  setInput: PropTypes.func.isRequired,
  messagesEndRef: PropTypes.object,
  inputRef: PropTypes.object
};

export default ChatWindow;