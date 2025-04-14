import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createUser, CreateUserData } from '@/db/users';
import { createFitnessProfile, CreateFitnessProfileData } from '@/db/users';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    // Get the form data from the request
    const formData = await request.json();
    
    // Store user data in database
    let userData: CreateUserData = {
      name: formData.name,
      phone_number: formData.phoneNumber,
      email: formData.email || null,
    };

    try {
      // Create customer in Stripe
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

      // Save user to database
      const user = await createUser(userData);

      // Create fitness profile
      const fitnessProfileData: CreateFitnessProfileData = {
        user_id: user.id,
        fitness_goals: formData.fitnessGoals,
        skill_level: formData.skillLevel,
        exercise_frequency: formData.exerciseFrequency,
        gender: formData.gender,
        age: parseInt(formData.age, 10),
      };

      await createFitnessProfile(fitnessProfileData);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'subscription',
        customer: customer.id,
        line_items: [
          {
            price: process.env.STRIPE_PRICE_ID, // Use the price ID from env
            quantity: 1,
          },
        ],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}&user_id=${user.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}?canceled=true`,
        metadata: {
          userId: user.id,
          customerId: customer.id
        }
      });

      // Return the session ID
      return NextResponse.json({ sessionId: session.id });
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