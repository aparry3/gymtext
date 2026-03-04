import Link from 'next/link';
import Image from 'next/image';

export function MikeyFooter() {
  return (
    <footer className="bg-black text-white py-12 md:py-16 border-t border-gray-800 pb-24 md:pb-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          <div>
            <h4 className="text-xl md:text-2xl font-display font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Image
                src="/WordmarkWhite.png"
                alt="GymText"
                width={80}
                height={20}
                className="h-5 md:h-6 w-auto"
              />
              <span className="text-[#002D72]">x</span> SWIERCZ
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Train like an All-American national champion. Mikey Swiercz&apos;s drills and
              philosophies, built over nearly two decades of competitive soccer, delivered directly
              to your phone.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Career Highlights</h5>
            <ul className="space-y-3">
              <li className="text-gray-400 text-sm">
                <span className="block text-white font-medium">Johns Hopkins University</span>
                <span className="text-xs">All-American · Scholar All-American · All-Decade Team</span>
              </li>
              <li className="text-gray-400 text-sm">
                <span className="block text-white font-medium">Christos FC</span>
                <span className="text-xs">U.S. National Amateur Open Cup Champion</span>
              </li>
              <li className="text-gray-400 text-sm">
                <span className="block text-white font-medium">USL2 Professional</span>
                <span className="text-xs">3 Seasons in the U.S. Soccer Pyramid</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Join The Program</h5>
            <p className="text-gray-400 text-sm mb-4">
              The training that built an All-American career is now available to you. Start today.
            </p>
            <Link
              href="/privacy"
              className="text-white border border-white/20 bg-white/5 hover:bg-white/10 px-4 py-2 rounded text-sm transition-colors inline-block"
            >
              View Privacy Policy
            </Link>
          </div>
        </div>

        <div className="mt-10 md:mt-16 pt-6 md:pt-8 border-t border-gray-900 text-center text-gray-600 text-xs">
          &copy; {new Date().getFullYear()} GymText. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
