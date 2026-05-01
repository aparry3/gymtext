import Image from 'next/image';

const SIGNUP_BASIC_URL = 'https://coaching.gymtext.co/signup/basketball-fundamentals';
const SIGNUP_PREMIUM_URL = 'https://coaching.gymtext.co/signup/basketball-fundamentals-plus';

export function NextLevelFooter() {
  return (
    <footer className="bg-nlb-dark text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <Image
            src="/WordmarkWhite.png"
            alt="GymText"
            width={120}
            height={28}
            className="h-6 w-auto mb-4"
          />
          <p className="text-xs text-white/50 leading-relaxed">
            Two-day elite camps + daily SMS coaching from Coach Rhynia Henry. Built for players
            who want more.
          </p>
        </div>

        <FooterColumn title="CAMP">
          <FooterLink href="#schedule">Schedule</FooterLink>
          <FooterLink href="#coach">Coach</FooterLink>
          <FooterLink href="#pricing">Pricing</FooterLink>
          <FooterLink href="#faq">FAQ</FooterLink>
        </FooterColumn>

        <FooterColumn title="PROGRAMS">
          <FooterLink href={SIGNUP_BASIC_URL}>Basic — $25/mo</FooterLink>
          <FooterLink href={SIGNUP_PREMIUM_URL}>Premium — $60/mo</FooterLink>
          <FooterLink href="#pricing">Camp Registration</FooterLink>
        </FooterColumn>

        <FooterColumn title="CONTACT">
          <FooterLink href="mailto:hello@gymtext.co">hello@gymtext.co</FooterLink>
          <span className="text-sm text-white/65">Memphis, TN</span>
          <FooterLink href="https://coaching.gymtext.co">coaching.gymtext.co</FooterLink>
        </FooterColumn>
      </div>

      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-[10px] tracking-[0.22em] text-white/40 font-semibold">
          <span>© 2026 NEXT LEVEL BASKETBALL</span>
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
      <div className="text-[10px] tracking-[0.28em] text-white/40 font-bold mb-4">{title}</div>
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-sm text-white/65 hover:text-nlb-orange transition-colors"
    >
      {children}
    </a>
  );
}
