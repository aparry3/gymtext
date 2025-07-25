'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentRequestButtonElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Form validation schema
const formSchema = z.object({
  fitnessGoals: z.string().min(1, 'Please select your fitness goals'),
  skillLevel: z.string().min(1, 'Please select your skill level'),
  exerciseFrequency: z.string().min(1, 'Please select your exercise frequency'),
  gender: z.string().min(1, 'Please select your gender'),
  age: z.string().min(1, 'Please enter your age'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Please enter a valid phone number'),
  email: z.string().email().optional().or(z.literal('')),
  acceptRisks: z.boolean().refine((val) => val === true, {
    message: 'You must accept the risks associated with exercise',
  }),
});

type FormData = z.infer<typeof formSchema>;

function PaymentRequestForm({ formData }: { formData: FormData }) {
  const stripe = useStripe();
  const elements = useElements();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [canMakePayment, setCanMakePayment] = useState(false);

  useEffect(() => {
    if (!stripe || !elements) return;

    const pr = stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'GymText Monthly Subscription',
        amount: 1999, // $19.99
      },
      requestPayerName: true,
      requestPayerEmail: true,
      requestPayerPhone: true,
    });

    pr.on('paymentmethod', async (ev) => {
      // Format phone number with +1 prefix if not already present
      const formattedPhoneNumber = formData.phoneNumber.startsWith('+1') ? formData.phoneNumber : `+1${formData.phoneNumber}`;
      
      try {
        // Create checkout session on the server
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            phoneNumber: formattedPhoneNumber,
            // Add subscription specific details
            plan: 'monthly',
            priceId: 'price_monthly_subscription',
            // Add implicit consent to receive text messages
            acceptTexts: true,
            paymentMethodId: ev.paymentMethod.id
          }),
        });

        if (!response.ok) {
          ev.complete('fail');
          console.error('Payment failed:', await response.text());
          return;
        }

        const responseData = await response.json();
        
        // Mark the payment as successful
        ev.complete('success');
        
        // Check if we have a redirectUrl and redirect to it
        if (responseData.redirectUrl) {
          window.location.href = responseData.redirectUrl;
        } else {
          // Fallback to success page
          window.location.href = '/success';
        }
      } catch (error) {
        console.error('Express checkout error:', error);
        ev.complete('fail');
      }
    });

    pr.canMakePayment().then(result => {
      if (result) {
        setCanMakePayment(true);
        setPaymentRequest(pr);
      }
    });
  }, [stripe, elements, formData]);

  if (!canMakePayment) {
    return null;
  }

  return (
    <PaymentRequestButtonElement
      options={{
        paymentRequest,
        style: {
          paymentRequestButton: {
            theme: 'dark',
            height: '44px',
          },
        },
      }}
    />
  );
}

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [formValues, setFormValues] = useState<FormData | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleContinue = (data: FormData) => {
    // Format phone number with +1 prefix
    const formattedData = {
      ...data,
      phoneNumber: data.phoneNumber.startsWith('+1') ? data.phoneNumber : `+1${data.phoneNumber}`
    };
    setFormValues(formattedData);
    setShowPaymentOptions(true);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Format phone number with +1 prefix if not already present
      const formattedPhoneNumber = data.phoneNumber.startsWith('+1') ? data.phoneNumber : `+1${data.phoneNumber}`;
      
      // Create checkout session on the server
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          phoneNumber: formattedPhoneNumber,
          // Add subscription specific details
          plan: 'monthly',
          priceId: 'price_monthly_subscription',
          // Add implicit consent to receive text messages
          acceptTexts: true
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Something went wrong');
      }

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw new Error(error.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (showPaymentOptions && formValues) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-center mb-6">Choose Your Payment Method</h2>
        
        <Elements stripe={stripePromise}>
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-3">Express Checkout</h3>
            <PaymentRequestForm formData={formValues} />
          </div>
        </Elements>
        
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or pay with card</span>
          </div>
        </div>
        
        <button
          onClick={() => onSubmit(formValues)}
          disabled={isLoading}
          className="w-full bg-[#4338ca] text-white py-3 px-4 rounded-md hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium tracking-wide"
        >
          {isLoading ? 'Processing...' : 'Continue to Card Payment'}
        </button>
        
        <button
          onClick={() => setShowPaymentOptions(false)}
          className="w-full mt-4 py-2 px-4 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Form
        </button>
        
        <div className="text-center mt-4">
          <p className="text-sm text-[#7a8599] mb-2">
            Secure payment powered by Stripe
          </p>
          <p className="text-sm text-[#7a8599]">
            By proceeding, you agree to receive text messages from GYMTEXT.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleContinue)} className="space-y-6">
      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <p className="text-red-600">{errorMessage}</p>
        </div>
      )}
      
      {/* Fitness Goals */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Fitness Goals – What do you want to achieve?</label>
        <select
          {...register('fitnessGoals')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        >
          <option value="">Select your goals</option>
          <option value="weight_loss">Weight Loss</option>
          <option value="muscle_gain">Muscle Gain</option>
          <option value="endurance">Endurance</option>
          <option value="flexibility">Flexibility</option>
          <option value="general_fitness">General Fitness</option>
        </select>
        {errors.fitnessGoals && (
          <p className="mt-1 text-sm text-red-500">{errors.fitnessGoals.message}</p>
        )}
      </div>

      {/* Skill Level */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Skill Level – How familiar are you with working out?</label>
        <select
          {...register('skillLevel')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        >
          <option value="">Select your level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Getting back into it</option>
          <option value="advanced">Comfortable in the gym</option>
          <option value="expert">Advanced</option>
        </select>
        {errors.skillLevel && (
          <p className="mt-1 text-sm text-red-500">{errors.skillLevel.message}</p>
        )}
      </div>

      {/* Exercise Frequency */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Current Exercise Frequency – How often are you moving your body right now?</label>
        <select
          {...register('exerciseFrequency')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        >
          <option value="">Select frequency</option>
          <option value="never">Not at all yet</option>
          <option value="1-2">Once a week</option>
          <option value="3-4">2-3 times per week</option>
          <option value="5+">4+ times per week</option>
        </select>
        {errors.exerciseFrequency && (
          <p className="mt-1 text-sm text-red-500">{errors.exerciseFrequency.message}</p>
        )}
      </div>

      {/* Gender */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Gender – How do you identify? (This helps us personalize your plan – optional)</label>
        <select
          {...register('gender')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
        {errors.gender && (
          <p className="mt-1 text-sm text-red-500">{errors.gender.message}</p>
        )}
      </div>

      {/* Age */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Age – What&apos;s your age range? (How young are you feeling these days?)</label>
        <input
          type="number"
          {...register('age')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.age && (
          <p className="mt-1 text-sm text-red-500">{errors.age.message}</p>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Full Name (What should we call you?)</label>
        <input
          type="text"
          {...register('name')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      {/* Phone Number */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Phone Number (What number should we text your workouts to?)</label>
        <input
          type="tel"
          {...register('phoneNumber')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.phoneNumber && (
          <p className="mt-1 text-sm text-red-500">{errors.phoneNumber.message}</p>
        )}
      </div>

      {/* Email (Optional) */}
      <div>
        <label className="block text-base font-medium mb-2 text-[#2d3748]">Email (Where should we send additional information?)</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-3 rounded-md bg-white text-[#2d3748] border border-gray-300 focus:border-[#4338ca] focus:ring-1 focus:ring-[#4338ca] text-base"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Accept Risks Checkbox */}
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            {...register('acceptRisks')}
            className="h-5 w-5 rounded border-gray-300 bg-white text-[#4338ca] focus:ring-[#4338ca]"
          />
        </div>
        <div className="ml-3 text-base">
          <label className="text-[#7a8599]">
            I understand and accept the risks associated with exercise.
          </label>
          {errors.acceptRisks && (
            <p className="mt-1 text-sm text-red-500">{errors.acceptRisks.message}</p>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-[#4338ca] text-white py-3 px-4 rounded-md hover:bg-[#3730a3] focus:outline-none focus:ring-2 focus:ring-[#4338ca] focus:ring-offset-2 focus:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed text-lg font-medium tracking-wide mt-8"
      >
        {isLoading ? 'Processing...' : '💪 Send It'}
      </button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-[#7a8599] mb-2">
          Secure payment powered by Stripe
        </p>
        <p className="text-sm text-[#7a8599]">
          By submitting this form, you agree to receive text messages from GYMTEXT.
        </p>
      </div>
    </form>
  );
} 