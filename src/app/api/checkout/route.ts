import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { UserRepository } from '@/server/repositories/userRepository';
import { setUserCookie } from '@/shared/utils/cookies';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    // Get the request data
    const requestData = await request.json();
    
    // Get the user by ID
    const userRepository = new UserRepository();
    const user = await userRepository.findById(requestData.userId);
    
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    try {
      // Create customer in Stripe
      const customer = await stripe.customers.create({
        name: user.name,
        phone: user.phoneNumber,
        ...(user.email && { email: user.email }),
        metadata: {
          userId: user.id,
        }
      });

      // Update user with Stripe customer ID
      await userRepository.update(user.id, { 
        stripeCustomerId: customer.id
      });

      // Check if we have a direct payment method ID (Apple Pay/Google Pay)
      if (requestData.paymentMethodId) {
        try {
          // Attach payment method to customer
          await stripe.paymentMethods.attach(requestData.paymentMethodId, {
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
            default_payment_method: requestData.paymentMethodId,
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
          success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkout/session?session_id={CHECKOUT_SESSION_ID}&user_id=${user.id}`,
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