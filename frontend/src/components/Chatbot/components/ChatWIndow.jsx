// src/components/Chatbot/components/ChatWindow.jsx
import React from 'react';
import { motion } from 'framer-motion';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import QuickPrompts from './QuickPrompts';
import InputArea from './InputArea';
import useAnimations from '../hooks/useAnimations';

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

      <QuickPrompts
        predictionData={predictionData}
        handleQuickPrompt={handleQuickPrompt}
      />

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

export default ChatWindow;
