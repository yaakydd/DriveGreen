import React, { memo } from 'react';
import { AnimatePresence } from 'framer-motion';
import ChatWindow from './components/ChatWindow';
import ToggleButton from './components/ToggleButton';
import useChatLogic from './hooks/useChatLogic';

const Chatbot = ({ predictionData }) => {
  const {
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
  } = useChatLogic(predictionData);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <ChatWindow
            messages={messages}
            input={input}
            isTyping={isTyping}
            predictionData={predictionData}
            toggleChat={toggleChat}
            handleSend={handleSend}
            handleKeyPress={handleKeyPress}
            handleQuickPrompt={handleQuickPrompt}
            setInput={setInput}
            messagesEndRef={messagesEndRef}
            inputRef={inputRef}
          />
        )}
      </AnimatePresence>

      <ToggleButton
        isOpen={isOpen}
        predictionData={predictionData}
        toggleChat={toggleChat}
      />
    </>
  );
};

export default memo(Chatbot);
