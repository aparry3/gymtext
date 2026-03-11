import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface SocialLink {
  title: string;
  platform: string;
  url: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    title: 'Next Level Basketball',
    platform: 'Facebook',
    url: 'https://www.facebook.com/rhyniahenrynextlevel/',
  },
  {
    title: '@rhyniahenry',
    platform: 'Instagram',
    url: 'https://www.instagram.com/rhyniahenry/',
  },
  {
    title: 'Next Level Basketball, MJCC',
    platform: 'YouTube',
    url: 'https://www.youtube.com/@rhyniahenry',
  },
  {
    title: 'Rhynia Henry',
    platform: 'LinkedIn',
    url: 'https://www.linkedin.com/in/rhynia-henry-376a1523/',
  },
];

export function NextLevelFooter() {
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
              <span className="text-nlb-orange">x</span> NEXT LEVEL
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Developing basketball fundamentals and athletic performance with certified training from
              Coach Rhynia Henry. Memphis-based, results-driven.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Connect</h5>
            <ul className="space-y-3">
              {SOCIAL_LINKS.map((link, idx) => (
                <li key={idx}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-2 text-gray-400 hover:text-nlb-orange transition-colors text-sm"
                  >
                    <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      <span className="block text-white group-hover:text-white font-medium">
                        {link.title}
                      </span>
                      <span className="text-xs">{link.platform}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-lg mb-4 text-white">Train With Coach Henry</h5>
            <p className="text-gray-400 text-sm mb-4">
              The grind doesn&apos;t wait for the season. Start building your skills today.
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
