export function PhoneMockup() {
  return (
    <div className="relative bg-white rounded-[3rem] shadow-2xl p-3 border-8 border-gray-800 max-w-sm mx-auto">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-800 rounded-b-3xl z-10"></div>

      {/* Screen */}
      <div className="bg-gray-50 rounded-[2.5rem] overflow-hidden h-[600px] relative">
        {/* Status bar */}
        <div className="bg-white px-6 py-3 flex justify-between items-center text-xs">
          <span className="font-semibold">9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
          </div>
        </div>

        {/* Messages */}
        <div className="p-4 space-y-4 mt-4">
          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Good morning! Ready for today&apos;s workout?
              </p>
            </div>
          </div>

          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Here&apos;s your personalized plan for today: Upper Body Strength
              </p>
            </div>
          </div>

          {/* Outgoing message */}
          <div className="flex justify-end">
            <div className="bg-primary rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-white">Let&apos;s do it!</p>
            </div>
          </div>

          {/* Incoming message */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
              <p className="text-sm text-gray-800">
                Great job yesterday! Let&apos;s build on that momentum.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
