import React, { memo } from "react";
import { AnimatePresence } from "framer-motion";
import ChatWindow from "./components/ChatWindow";
import ToggleButton from "./components/ToggleButton";
import { useChatLogic } from "./hooks/useChatLogic";
import { useAnimations } from "./hooks/useAnimations";

const Chatbot = ({ predictionData }) => {
  const {
    isOpen,
    messages,
    input,
    isTyping,
    messagesEndRef,
    inputRef,
    toggleChat,
    setInput,
    sendMessage,
    handleKeyPress,
    sendQuickPrompt
  } = useChatLogic(predictionData);

  const animations = useAnimations();

  return (
    <>
      <AnimatePresence>
        <ChatWindow
          isOpen={isOpen}
          onClose={toggleChat}
          messages={messages}
          input={input}
          setInput={setInput}
          onSend={sendMessage}
          onKeyPress={handleKeyPress}
          onQuickPrompt={sendQuickPrompt}
          isTyping={isTyping}
          messagesEndRef={messagesEndRef}
          inputRef={inputRef}
          animations={animations}
          predictionData={predictionData}
        />
      </AnimatePresence>

      <ToggleButton
        isOpen={isOpen}
        onClick={toggleChat}
        predictionData={predictionData}
      />
    </>
  );
};

export default memo(Chatbot);
