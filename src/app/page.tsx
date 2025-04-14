import { Metadata } from 'next'
import SignUpForm from '@/components/SignUpForm'

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
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-8 text-[#2d3748] tracking-wide leading-tight">
            We make workout plans{' '}
            <span className="text-[#f6ad55]">personalized</span>
          </h1>
          <p className="text-2xl text-[#7a8599] mb-12 tracking-normal leading-relaxed">
            Daily, personalized workouts built by certified trainers. Direct to your phone. No need to think. Just workout.
          </p>
          <p className="text-[#7a8599] text-base tracking-wide">
            Starting at $9/month | Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold mb-5 text-[#2d3748] tracking-wide">Personalized Coaching</h3>
            <p className="text-lg text-[#7a8599] tracking-normal leading-relaxed">Get customized workout plans tailored to your goals and fitness level.</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold mb-5 text-[#2d3748] tracking-wide">Daily Workouts</h3>
            <p className="text-lg text-[#7a8599] tracking-normal leading-relaxed">Receive new workout plans every day, delivered directly to your phone.</p>
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
  )
}
