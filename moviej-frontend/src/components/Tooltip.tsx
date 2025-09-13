"use client";

import { useState, ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export default function Tooltip({
  children,
  content,
  position = "top",
  className = "",
}: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getPositionStyles = () => {
    switch (position) {
      case "top":
        return {
          tooltip: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
          arrow: "top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800",
        };
      case "bottom":
        return {
          tooltip: "top-full left-1/2 transform -translate-x-1/2 mt-2",
          arrow: "bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-gray-800",
        };
      case "left":
        return {
          tooltip: "right-full top-1/2 transform -translate-y-1/2 mr-2",
          arrow: "left-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-l-gray-800",
        };
      case "right":
        return {
          tooltip: "left-full top-1/2 transform -translate-y-1/2 ml-2",
          arrow: "right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-800",
        };
      default:
        return {
          tooltip: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
          arrow: "top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-800",
        };
    }
  };

  const { tooltip: tooltipPosition, arrow: arrowPosition } = getPositionStyles();

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </div>
      
      {showTooltip && (
        <div className={`absolute ${tooltipPosition} z-50`}>
          <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap border border-gray-600">
            {content}
            {/* 툴팁 화살표 */}
            <div className={`absolute ${arrowPosition}`}></div>
          </div>
        </div>
      )}
    </div>
  );
}
