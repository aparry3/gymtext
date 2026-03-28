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
    name: 'Kevin',
    role: 'Chief Executive Officer',
    // TODO: Replace with actual bio from grant deck (Slide 10)
    bio: 'Kevin leads the vision and strategy for GymText, driving the company\'s mission to make personal training accessible to everyone through the simplicity of text messaging.',
    image: '/team/kevin.png',
  },
  {
    name: 'Kyle',
    role: 'Chief Financial Officer',
    // TODO: Replace with actual bio from grant deck (Slide 10)
    bio: 'Kyle oversees GymText\'s financial strategy and operations, ensuring the company grows sustainably while keeping personal training affordable for everyone.',
    image: '/team/kyle.png',
  },
  {
    name: 'Aaron',
    role: 'Chief Technology Officer',
    // TODO: Replace with actual bio from grant deck (Slide 10)
    bio: 'Aaron architects and builds the technology powering GymText — from the AI coaching engine to the SMS delivery platform that makes personalized training as simple as a text message.',
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
          <p className="mb-12 text-lg text-gray-600 max-w-2xl">
            We started GymText because we believe everyone deserves access to
            quality personal training — without the hefty price tag or
            complicated apps. Our team combines expertise in fitness, finance,
            and technology to deliver coaching that fits in your pocket.
          </p>

          <div className="grid gap-8 md:gap-12">
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
                    {member.role}
                  </p>
                  <p className="text-gray-600 leading-relaxed">{member.bio}</p>
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
