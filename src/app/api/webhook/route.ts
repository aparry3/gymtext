import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { UserRepository } from '@/server/data/repositories/userRepository';
import { UserCookieData, setUserCookie } from '@/shared/utils/cookies';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }
    
    // Verify the event came from Stripe
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Handle checkout.session.completed event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Extract user ID from metadata
      const userId = session.metadata?.userId;
      
      if (userId) {
        // Get the user from the database
        const userRepository = new UserRepository();
        const user = await userRepository.findById(userId);
        
        if (user) {
          // Create a cookie with user information
          const userInfo: UserCookieData = {
            id: user.id,
            name: user.name,
            isCustomer: true,
            checkoutCompleted: true,
            timestamp: new Date().toISOString(),
          };
          
          // Create response with the cookie
          const response = NextResponse.json({ received: true });
          
          // Set the cookie using our utility function
          return setUserCookie(response, userInfo);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 