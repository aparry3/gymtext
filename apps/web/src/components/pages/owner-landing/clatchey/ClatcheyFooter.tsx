import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { CLATCHEY_SIGNUP_URL } from './ClatcheyHero';
import { CAMP_SIGNUP_URL } from './ClatcheyCamp';

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
    title: 'Coach Clatchey Wins No. 800',
    source: 'Baltimore Sun',
    url: 'https://www.baltimoresun.com/2023/12/04/mount-saint-joseph-basketball-coach-pat-clatchey-win-800/',
  },
  {
    title: "McDonald's All-American Coach",
    source: 'MaxPreps',
    url: 'https://www.maxpreps.com/news/S300c1HCd0GI9UEbDM0p1w/mcdonalds-boys-all-american-team-announced.htm',
  },
];

export function ClatcheyFooter() {
  return (
    <footer className="bg-msj-night text-msj-cream border-t border-msj-cream/5 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Image
            src="/WordmarkWhite.png"
            alt="GymText"
            width={120}
            height={28}
            className="h-6 w-auto mb-4"
          />
          <p className="text-xs text-msj-cream/55 leading-relaxed">
            Daily SMS coaching from Hall-of-Fame coach Pat Clatchey. Built for players who
            want to play at the next level.
          </p>
        </div>

        <FooterColumn title="THE PROGRAM">
          <FooterLink href={CLATCHEY_SIGNUP_URL}>Subscribe — $25/mo</FooterLink>
          <FooterLink href="#sms">How it works</FooterLink>
          <FooterLink href="#faq">FAQ</FooterLink>
          <FooterLink href={CAMP_SIGNUP_URL}>In-person camp</FooterLink>
        </FooterColumn>

        <FooterColumn title="FEATURED PRESS">
          {PRESS_LINKS.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 text-msj-cream/65 hover:text-msj-purple-tint transition-colors text-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>
                <span className="block text-msj-cream font-medium">{link.title}</span>
                <span className="text-xs text-msj-cream/50">{link.source}</span>
              </span>
            </a>
          ))}
        </FooterColumn>

        <FooterColumn title="CONTACT">
          <FooterLink href="mailto:hello@gymtext.co">hello@gymtext.co</FooterLink>
          <span className="text-sm text-msj-cream/65">Baltimore, MD</span>
          <FooterLink href="/privacy">Privacy Policy</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-msj-cream/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[10px] tracking-[0.22em] text-msj-cream/40 font-semibold">
          <span>© 2026 GYMTEXT × COACH CLATCHEY</span>
          <div className="flex items-center gap-2">
            <span>POWERED BY</span>
            <Image
              src="/WordmarkWhite.png"
              alt="GymText"
              width={70}
              height={16}
              className="h-3.5 w-auto opacity-60"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] tracking-[0.28em] text-msj-cream/40 font-bold mb-4">
        {title}
      </div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-msj-cream/65 hover:text-msj-purple-tint transition-colors"
    >
      {children}
    </a>
  );
}
