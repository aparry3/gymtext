'use client';

import React from 'react';
import { ChevronLeft, Battery, Wifi, Signal, Info } from 'lucide-react';

const content = {
  sender: 'GymText',
  time: 'Today 8:03 AM',
  message1: {
    text: 'Good morning! Here is your "Lower Body Power" session for today.',
    subtext: 'Focus: Explosive concentric movement.',
  },
  listTitle: 'Main Lift',
  listItems: ['Squat: 3x5 @ RPE 8', 'RDL: 3x8-10', 'Box Jumps: 3x5'],
  link: 'https://gtxt.ai/k92sX',
  reply: 'Back is tight, swap RDLs?',
  reply2: 'Good call. Swap for Leg Curls (3x15) to save the lower back.',
};

export const BrandsPhoneMockup: React.FC = () => {

  return (
    <div className="relative mx-auto border-gray-900 bg-gray-900 border-[12px] rounded-[3.5rem] h-[680px] w-[340px] shadow-2xl ring-1 ring-gray-900/50 transition-all duration-500">
      {/* Dynamic Island */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-full z-20 flex items-center justify-center gap-2 px-3">
        {/* Camera/Sensors */}
        <div className="w-2 h-2 rounded-full bg-[#1a1a1a]"></div>
      </div>

      {/* Side Buttons */}
      <div className="h-[40px] w-[4px] bg-gray-800 absolute -left-[15px] top-[100px] rounded-l-lg"></div>
      <div className="h-[60px] w-[4px] bg-gray-800 absolute -left-[15px] top-[160px] rounded-l-lg"></div>
      <div className="h-[60px] w-[4px] bg-gray-800 absolute -left-[15px] top-[230px] rounded-l-lg"></div>
      <div className="h-[90px] w-[4px] bg-gray-800 absolute -right-[15px] top-[180px] rounded-r-lg"></div>

      {/* Screen Content */}
      <div className="rounded-[2.8rem] overflow-hidden w-full h-full bg-white relative flex flex-col font-sans">
        {/* Status Bar */}
        <div className="bg-gray-50/80 backdrop-blur-md pt-4 px-7 flex justify-between items-center h-[54px] w-full z-10 text-black">
          <span className="text-[15px] font-semibold pl-1">9:41</span>
          <div className="flex items-center gap-1.5 pr-1">
            <Signal className="h-4 w-4 fill-black" />
            <Wifi className="h-4 w-4" />
            <Battery className="h-5 w-5" />
          </div>
        </div>

        {/* Navigation Bar */}
        <div className="bg-gray-50/80 backdrop-blur-md border-b border-gray-200/50 p-2 flex items-end justify-between z-10 sticky top-0 pb-3">
          <div className="flex items-center gap-1 text-ios-blue pl-1">
            <ChevronLeft className="h-6 w-6" />
            <span className="text-[17px]">Filters</span>
          </div>

          <div className="flex flex-col items-center -ml-4">
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center mb-1 overflow-hidden">
              <span className="font-bold text-gray-500 text-xs">
                {content.sender.substring(0, 2).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col items-center leading-none">
              <span className="text-[12px] font-medium text-black">
                {content.sender}
              </span>
              <span className="text-[10px] text-gray-500 mt-0.5">MESSAGES</span>
            </div>
          </div>

          <div className="pr-2">
            <Info className="h-5 w-5 text-ios-blue" />
          </div>
        </div>

        {/* Message Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white hide-scrollbar pb-20">
          <div className="text-center">
            <span className="text-[11px] text-gray-400 font-medium">
              {content.time}
            </span>
          </div>

          {/* Incoming Message (Bubble) */}
          <div className="flex items-end gap-2 max-w-[85%] animate-fade-in-up">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {content.sender.substring(0, 2).toUpperCase()}
            </div>
            <div className="bg-ios-gray rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] text-black leading-snug relative">
              <p>
                <strong>{content.message1.text}</strong>
              </p>
              <p className="text-[13px] text-gray-600 mt-1">
                {content.message1.subtext}
              </p>
              <div className="my-2 h-px bg-gray-300 w-full"></div>
              <p className="font-semibold mb-1">{content.listTitle}</p>
              <ul className="list-disc pl-4 space-y-1 mb-2 text-[14px]">
                {content.listItems.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
              <p className="mt-3 text-[14px] truncate w-full">
                View full details:{' '}
                <span className="text-ios-blue underline decoration-ios-blue/50">
                  {content.link}
                </span>
              </p>
            </div>
          </div>

          {/* Outgoing Message (Bubble) */}
          <div className="flex items-end justify-end">
            <div className="bg-ios-blue rounded-2xl rounded-br-sm px-4 py-2.5 max-w-[80%] text-[15px] text-white shadow-sm leading-snug">
              <p>{content.reply}</p>
            </div>
          </div>

          {/* Incoming Message 2 (Bubble) */}
          <div className="flex items-end gap-2 max-w-[85%]">
            <div className="w-7 h-7 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {content.sender.substring(0, 2).toUpperCase()}
            </div>
            <div className="bg-ios-gray rounded-2xl rounded-bl-sm px-4 py-3 text-[15px] text-black leading-snug">
              <p>{content.reply2}</p>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-3 absolute bottom-0 w-full pb-8">
          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            <span className="text-xl font-light pb-0.5">+</span>
          </div>
          <div className="flex-1 min-h-[36px] bg-white border border-gray-300 rounded-full px-4 flex items-center justify-between">
            <span className="text-gray-400 text-[15px]">iMessage</span>
            <div className="h-6 w-6 rounded-full bg-gray-400/20"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
