'use client';

import React from 'react';

interface TextBubbleProps {
  message: string;
  sender: 'user' | 'coach';
  time?: string;
}

const TextBubble: React.FC<TextBubbleProps> = ({ message, sender, time }) => {
  const isUser = sender === 'user';

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-4`}>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-zinc-800 text-zinc-100 rounded-bl-none'
          }
        `}
      >
        {message}
      </div>
      {time && (
        <span className="text-[10px] text-zinc-600 mt-1 uppercase tracking-wider font-medium px-1">
          {time}
        </span>
      )}
    </div>
  );
};

export default TextBubble;
