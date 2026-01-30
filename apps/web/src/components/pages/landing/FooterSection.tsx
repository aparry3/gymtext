'use client';

import Image from 'next/image';
import Link from 'next/link';

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-slate-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/WordmarkWhite.png"
              alt="GymText"
              width={135}
              height={30}
              className="h-[30px] w-auto"
            />
          </div>

          <div className="flex gap-8 text-sm text-slate-400">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms
            </Link>
            <Link
              href="mailto:support@gymtext.co"
              className="hover:text-white transition-colors"
            >
              Contact
            </Link>
          </div>

          <div className="text-slate-500 text-sm">
            © {currentYear} GymText Co. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
