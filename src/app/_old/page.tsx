import { Metadata } from 'next'
import SignUpForm from '@/components/pages/SignUp'
import { Bebas_Neue } from 'next/font/google'
import Image from 'next/image'

const bn = Bebas_Neue({ weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'GYMTEXT - Personalized Fitness Coaching via Text',
  description: 'Get personalized fitness coaching and workout plans delivered directly to your phone. Start your fitness journey with GYMTEXT today.',
  keywords: 'fitness coaching, workout plans, personal training, text message coaching, fitness goals',
  openGraph: {
    title: 'GYMTEXT - Personalized Fitness Coaching via Text',
    description: 'Get personalized fitness coaching and workout plans delivered directly to your phone.',
    type: 'website',
    url: 'https://gymtext.com',
  },
}

export default function Home() {
  return (
    <>
      {/* Header */}
      <header className="bg-white py-4 border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Image
              src="/IconInverse.png"
              alt="GymText Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <h2 className={`text-3xl font-bold italic text-[#2d3748] ${bn.className}`}>GYMTEXT</h2>
          </div>
        </div>
      </header>
      
      <main className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-8 text-[#2d3748] tracking-wide leading-tight">
              We make workout plans
              <div className="h-auto min-h-[5rem] md:min-h-[6rem] relative mt-2 mb-4">
                <span className="absolute top-0 left-0 text-[#f6ad55] carousel-word w-full">Personalized</span>
                <span className="absolute top-0 left-0 text-[#f6ad55] carousel-word w-full">Texted to your phone</span>
                <span className="absolute top-0 left-0 text-[#f6ad55] carousel-word w-full">Responsive</span>
              </div>
            </h1>
            <p className="text-xl md:text-2xl text-[#7a8599] mb-12 tracking-normal leading-relaxed">
              Daily, personalized workouts direct to your phone. No need to think. Just workout.
            </p>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold mb-5 text-[#2d3748] tracking-wide">Our Process</h3>
              <p className="text-lg text-[#7a8599] tracking-normal leading-relaxed">We meet people where they already are – on their phones. We send workouts directly via text so there&apos;s no login, no app, no guess work.</p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h3 className="text-2xl font-semibold mb-5 text-[#2d3748] tracking-wide">Daily Workouts</h3>
              <p className="text-lg text-[#7a8599] tracking-normal leading-relaxed">We deliver personalized, dynamic workouts via text message. No app, no fluff - just effective movement plans that evolve with you.</p>
            </div>
          </div>
        </section>

        {/* Signup Form Section */}
        <section id="signup" className="container mx-auto px-4 py-24">
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-10 shadow-lg border border-gray-100">
            <h2 className="text-4xl font-bold mb-10 text-center text-[#2d3748] tracking-wide">Start Your Fitness Journey</h2>
            <SignUpForm />
          </div>
        </section>
      </main>
    </>
  )
}
