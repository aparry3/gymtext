import React from 'react';

export const NorronaFooter: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-24 pb-12 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">

        {/* Main Footer CTA */}
        <div className="border-b border-gray-800 pb-24 mb-16 text-center">
          <h2 className="text-4xl md:text-6xl font-bold uppercase tracking-tight mb-12">
            Train for what<br/>you wear.
          </h2>
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <a href="#ski" className="bg-white text-black px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-gymtext-blue hover:text-white transition-colors duration-300">
              Ski Training
            </a>
            <a href="#hike" className="border border-white text-white px-10 py-4 uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-black transition-colors duration-300">
              Hiking Training
            </a>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 uppercase tracking-wider">
          <div className="mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} Norrøna Sport AS
          </div>
          <div className="flex items-center gap-2">
            <span>Powered by</span>
            <a href="https://gymtext.co" className="font-bold text-gray-300 hover:text-white transition-colors">GYMTEXT</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
