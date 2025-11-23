import React from "react";

/**
 * Green earth spinner: rotating ring + globe icon + message
 * Props:
 *   size - px size of ring (default 96)
 *   message - string under spinner
 */
export default function Spinner({ size = 96, message = "Calculating environmental impact…" }) {
  const ringSize = size;
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <div
          className="absolute inset-0 rounded-full border-4 border-green-500 border-t-transparent animate-spin"
          style={{ boxSizing: "border-box" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* globe emoji fallback; boxicons or svg recommended */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10 text-green-700">
            <path fill="currentColor" d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2zm-1 3v2.06A7.002 7.002 0 0 0 6.06 11H5a7.01 7.01 0 0 1 6-6zm8 6h-1.06A7.002 7.002 0 0 0 13 7.06V5a7.01 7.01 0 0 1 6 6zM6.06 13A7.002 7.002 0 0 0 11 16.94V19a7.01 7.01 0 0 1-4.94-6zM13 16.94A7.002 7.002 0 0 0 17.94 13H19a7.01 7.01 0 0 1-6 3.94z"/>
          </svg>
        </div>
      </div>
      <p className="text-green-700 font-medium">{message}</p>
    </div>
  );
}
