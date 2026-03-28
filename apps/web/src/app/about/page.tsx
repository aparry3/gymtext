import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Meet the Team | GymText',
  description:
    'Meet the team behind GymText — the people building the future of AI-powered personal training via text.',
};

const team = [
  {
    name: 'Kyle Doran',
    role: 'CEO',
    focus: 'Partnerships & Growth',
    bio: 'Private equity investor with experience scaling growth companies. Former collegiate athlete with deep understanding of training markets.',
    credentials: ['Johns Hopkins', 'McKinsey & Company', 'Nonantum Capital'],
    image: '/team/kyle.png',
  },
  {
    name: 'Kevin Doran',
    role: 'CPO',
    focus: 'Product & Commercialization',
    bio: 'Strategy and operations leader. Former U.S. Navy officer, Naval Academy graduate, and collegiate basketball player.',
    credentials: [
      'U.S. Naval Academy',
      'USC Marshall',
      'U.S. Navy',
      'EY-Parthenon',
    ],
    image: '/team/kevin.png',
  },
  {
    name: 'Aaron Parry',
    role: 'CTO',
    focus: 'Technology & AI',
    bio: 'Software engineer building scalable AI platforms. Former engineer at Spotify with full-stack and high-performance systems expertise.',
    credentials: ['Georgia Tech', 'Spotify'],
    image: '/team/aaron.png',
  },
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Meet the Team
          </h1>
          <p className="mb-4 text-lg text-gray-600 max-w-2xl">
            Built by operators across consulting, PE, and technology.
          </p>
          <p className="mb-12 text-base text-gray-500 max-w-2xl">
            Combined experience spanning McKinsey, EY-Parthenon, Spotify, U.S.
            Navy, and private equity — with deep domain expertise in fitness,
            strategy, and AI engineering.
          </p>

          <div className="grid gap-8 md:gap-10">
            {team.map((member) => (
              <div
                key={member.name}
                className="flex flex-col sm:flex-row items-start gap-6 p-6 rounded-2xl bg-gray-50 border border-gray-100"
              >
                {/* Avatar / Photo */}
                <div className="flex-shrink-0">
                  {member.image ? (
                    <Image
                      src={member.image}
                      alt={member.name}
                      width={120}
                      height={120}
                      className="rounded-xl object-cover w-[120px] h-[120px]"
                    />
                  ) : (
                    <div className="w-[120px] h-[120px] rounded-xl bg-gradient-to-br from-[#5BA3FF] to-[#1B81FF] flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {getInitials(member.name)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">
                    {member.name}
                  </h2>
                  <p className="text-sm font-semibold text-[#1B81FF] mb-3">
                    {member.role} | {member.focus}
                  </p>
                  <p className="text-gray-600 leading-relaxed mb-4">
                    {member.bio}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {member.credentials.map((cred) => (
                      <span
                        key={cred}
                        className="inline-block text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full px-3 py-1"
                      >
                        {cred}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mission / CTA */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Our Mission
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              GymText exists to democratize personal training. We leverage AI
              and the simplicity of text messaging to deliver personalized,
              expert-level coaching to anyone, anywhere — no apps, no equipment,
              no barriers.
            </p>
            <Link
              href="/start"
              className="inline-flex items-center gap-2 bg-[#1B81FF] hover:bg-[#1468CC] text-white px-8 py-4 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Training Today
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
