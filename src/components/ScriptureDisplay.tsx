"use client";

import { ReactNode } from "react";

interface ScriptureDisplayProps {
  reference: string;
  text: string;
  showReference?: boolean;
  showActions?: boolean;
  onFavorite?: () => void;
  onRead?: () => void;
  isFavorite?: boolean;
  children?: ReactNode;
}

export default function ScriptureDisplay({
  reference,
  text,
  showReference = true,
  showActions = false,
  onFavorite,
  onRead,
  isFavorite = false,
  children,
}: ScriptureDisplayProps) {
  return (
    <div className="scripture-container">
      {showReference && (
        <div className="scripture-reference text-primary font-semibold mb-2">
          {reference}
        </div>
      )}
      
      <div className="scripture-text">
        <p className="whitespace-pre-line">{text}</p>
        {children}
      </div>
      
      {showActions && (
        <div className="scripture-actions flex gap-3 mt-4">
          {onFavorite && (
            <button
              onClick={onFavorite}
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                isFavorite 
                  ? "bg-yellow-100 text-yellow-600" 
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {isFavorite ? "❤️ 已收藏" : "🤍 收藏"}
            </button>
          )}
          
          {onRead && (
            <button
              onClick={onRead}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600"
            >
              🔊 朗读
            </button>
          )}
        </div>
      )}
    </div>
  );
}