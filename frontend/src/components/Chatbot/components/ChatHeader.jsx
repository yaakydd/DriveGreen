import React from "react";
import { X, Cpu } from "lucide-react";

const ChatHeader = ({ onClose, predictionData }) => {
  return (
    <div className="p-4 bg-cyan-500 border-b border-gray-100 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <Cpu size={16} className="text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-white text-sm tracking-wide">
            Eco-Copilot
          </h3>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 mt-0.5 rounded-full bg-white animate-pulse" />
            <span className="text-[10px] mt-1 text-slate-100 font-medium uppercase tracking-wider">
              {predictionData ? "Analyzing Your Result" : "Online"}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-white/80 rounded-full transition-colors text-white hover:text-gray-600"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default ChatHeader;
