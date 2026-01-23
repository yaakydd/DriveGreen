import React, { useMemo } from 'react';
import { getQuickPrompts } from '../data/quickPrompts';

const QuickPrompts = ({ predictionData, handleQuickPrompt }) => {
  const quickPrompts = useMemo(() => getQuickPrompts(predictionData), [predictionData]);

  return (
    <div className="px-4 pb-2 flex gap-2 overflow-x-auto bg-white">
      {quickPrompts.map((prompt, idx) => (
        <button
          key={idx}
          onClick={() => handleQuickPrompt(prompt)}
          className="whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 text-xs text-gray-600 transition-all font-medium"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default QuickPrompts;
