import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { UserRepository } from '@/server/data/repositories/userRepository';
import { CreateUserData, CreateFitnessProfileData } from '@/shared/types/user';
import { setUserCookie } from '@/shared/utils/cookies';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.json();
    
    // Check if user already exists
    const userRepository = new UserRepository();
    let user = await userRepository.findByPhoneNumber(formData.phoneNumber);
    
    // If user doesn't exist, create new user data
    const userData: CreateUserData = {
      name: formData.name,
      phone_number: formData.phoneNumber,
      email: formData.email || null,
    };

    try {
      // Create or update customer in Stripe
      const customer = await stripe.customers.create({
        name: formData.name,
        phone: formData.phoneNumber,
        ...(formData.email && { email: formData.email }),
        metadata: {
          fitnessGoals: formData.fitnessGoals,
          skillLevel: formData.skillLevel,
          exerciseFrequency: formData.exerciseFrequency,
          gender: formData.gender,
          age: formData.age
        }
      });

      // Add Stripe customer ID to user data
      userData.stripe_customer_id = customer.id;

      if (!user) {
        // Save new user to database
        user = await userRepository.create(userData);

        // Create fitness profile for new user
        const fitnessProfileData: CreateFitnessProfileData = {
          user_id: user.id,
          fitness_goals: formData.fitnessGoals,
          skill_level: formData.skillLevel,
          exercise_frequency: formData.exerciseFrequency,
          gender: formData.gender,
          age: parseInt(formData.age, 10),
        };

        await userRepository.createFitnessProfile(fitnessProfileData);
      } else {
        // Update existing user with new Stripe customer ID
        user = await userRepository.update(user.id, { stripe_customer_id: customer.id });
      }

      // Check if we have a direct payment method ID (Apple Pay/Google Pay)
      if (formData.paymentMethodId) {
        try {
          // Attach payment method to customer
          await stripe.paymentMethods.attach(formData.paymentMethodId, {
            customer: customer.id,
          });
          
          // Create the subscription directly with the payment method
          const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [
              {
                price: process.env.STRIPE_PRICE_ID,
              },
            ],
            default_payment_method: formData.paymentMethodId,
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
          });
          
          // Create a response with the user cookie and subscription info
          const response = NextResponse.json({ 
            subscription,
            status: 'success',
            userId: user.id,
            redirectUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/success`
          });
          
          return setUserCookie(response, {
            id: user.id,
            name: user.name,
            isCustomer: true,
            checkoutCompleted: true,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error creating subscription:', error);
          return NextResponse.json({ message: 'Failed to process payment' }, { status: 400 });
        }
      } else {
        // Create checkout session for card payments
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          mode: 'subscription',
          customer: customer.id,
          line_items: [
            {
              price: process.env.STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/session?session_id={CHECKOUT_SESSION_ID}&user_id=${user.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}?canceled=true`,
          metadata: {
            userId: user.id,
            customerId: customer.id
          }
        });

        // Return the session ID
        return NextResponse.json({ sessionId: session.id });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Error storing user data');
    }
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Return an error response
    return NextResponse.json(
      { 
        message: error instanceof Error ? error.message : 'An error occurred creating the checkout session' 
      }, 
      { status: 500 }
    );
  }
} 