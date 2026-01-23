import React from "react";
import { motion } from "framer-motion";
import ChatHeader from "./ChatHeader";
import MessageList from "./MessageList";
import QuickPrompts from "./QuickPrompts";
import InputArea from "./InputArea";

const ChatWindow = ({
  isOpen,
  onClose,
  messages,
  input,
  setInput,
  onSend,
  onKeyPress,
  onQuickPrompt,
  isTyping,
  showQuickPrompts, // ADD THIS
  messagesEndRef,
  inputRef,
  animations,
  predictionData
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      {...animations.chatWindow}
      className="fixed bottom-20 right-4 left-4 sm:left-auto sm:right-6 sm:bottom-24 sm:w-[360px] h-[75vh] sm:h-[550px] bg-white border border-gray-200 rounded-3xl shadow-2xl flex flex-col z-50 overflow-hidden"
    >
      <ChatHeader onClose={onClose} predictionData={predictionData} />
      
      <MessageList 
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
        animations={animations}
      />
      
      {/* PASS showQuickPrompts here */}
      <QuickPrompts 
        predictionData={predictionData}
        onPromptClick={onQuickPrompt}
        showQuickPrompts={showQuickPrompts}
      />
      
      <InputArea
        input={input}
        setInput={setInput}
        onSend={onSend}
        onKeyPress={onKeyPress}
        inputRef={inputRef}
        predictionData={predictionData}
      />
    </motion.div>
  );
};

export default ChatWindow;