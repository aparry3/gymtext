import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface PressArticle {
  title: string;
  source: string;
  url: string;
}

const PRESS_LINKS: PressArticle[] = [
  {
    title: 'A Baltimore Basketball Legend',
    source: 'MSJ Student Media',
    url: 'https://msjstudent.media/2021/10/25/coach-pat-clatchey-a-baltimore-basketball-legend/',
  },
  {
    title: 'Mount St. Joseph Alums Dot the Map',
    source: 'Catholic Review',
    url: 'https://catholicreview.org/thanks-to-coach-clatchey-mount-st-joseph-alums-dot-the-basketball-map/',
  },
  {
    title: 'Coach of the Decade',
    source: 'MIAA Sports Net',
    url: '#',
  },
  {
    title: "McDonald's All-American Coach",
    source: 'MaxPreps',
    url: 'https://www.maxpreps.com/news/S300c1HCd0GI9UEbDM0p1w/mcdonalds-boys-all-american-team-announced.htm',
  },
];

export function ClatcheyFooter() {
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
              <span className="text-msj-purple">x</span> CLATCHEY
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Empowering the next generation of basketball talent with drills and wisdom from one of
              the winningest coaches in high school history.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Featured Press</h5>
            <ul className="space-y-3">
              {PRESS_LINKS.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 text-gray-400 hover:text-msj-purple transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="block text-white group-hover:text-white font-medium">
                        {link.title}
                      </span>
                      <span className="text-xs">{link.source}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Join The Program</h5>
            <p className="text-gray-400 text-sm mb-4">
              Don&apos;t wait for the season to start. Greatness is built in the off-season.
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
