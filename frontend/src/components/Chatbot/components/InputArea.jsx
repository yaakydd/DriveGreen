import React from "react";
import { Send } from "lucide-react";

const InputArea = ({ input, setInput, onSend, onKeyPress, inputRef, predictionData }) => {
  return (
    <div className="p-4 bg-white border-t border-gray-100">
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder={predictionData ? "Ask about your result..." : "Ask Eco-Copilot..."}
          className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-200 transition-all"
        />
        <button
          onClick={onSend}
          disabled={!input.trim()}
          className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-lg shadow-emerald-500/20"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default InputArea;
