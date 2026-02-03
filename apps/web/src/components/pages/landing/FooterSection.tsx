'use client';

import Image from 'next/image';
import Link from 'next/link';

export function FooterSection() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 bg-white border-t border-gray-200">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image
              src="/Wordmark.png"
              alt="GymText"
              width={135}
              height={30}
              className="h-[30px] w-auto"
            />
          </div>

          <div className="flex gap-8 text-sm text-gray-500">
            <Link
              href="/privacy"
              className="transition-colors hover:text-gray-900"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="transition-colors hover:text-gray-900"
            >
              Terms
            </Link>
            <Link
              href="mailto:support@gymtext.co"
              className="transition-colors hover:text-gray-900"
            >
              Contact
            </Link>
          </div>

          <div className="text-sm text-gray-400">
            © {currentYear} GymText Co. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
