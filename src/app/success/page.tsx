import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Payment Successful - GYMTEXT',
  description: 'Your payment was successful. Welcome to GYMTEXT!',
};

export default function SuccessPage() {
  return (
    <main className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-2xl mx-auto p-10 text-center">
        <div className="mb-8 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <svg 
              className="h-16 w-16 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-[#2d3748] mb-4">Payment Successful!</h1>
        <p className="text-xl text-[#7a8599] mb-8">
          Thank you for signing up with GYMTEXT. We're excited to help you achieve your fitness goals!
        </p>
        <p className="text-lg text-[#7a8599] mb-8">
          You'll receive your first workout plan via text message soon. Get ready to start your fitness journey!
        </p>
        <div className="mt-8">
          <Link 
            href="/" 
            className="inline-block bg-[#4338ca] text-white py-3 px-8 rounded-md hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:ring-offset-2 text-lg font-medium tracking-wide"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </main>
  );
} 