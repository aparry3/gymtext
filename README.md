# GYMTEXT - Personalized Fitness Coaching via Text

GYMTEXT is a modern web application that provides personalized fitness coaching and workout plans delivered directly to your phone via text messages.

## Features

- Personalized fitness coaching
- Custom workout plans
- Text message delivery
- Progress tracking
- Secure payment processing with Stripe
- User data stored in PostgreSQL database

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Stripe for payments
- React Hook Form for form handling
- Zod for form validation
- PostgreSQL database
- Kysely ORM

## Getting Started

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL database
- Stripe account for payment processing

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/gymtext.git
cd gymtext
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Stripe API keys:
     - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
     - `STRIPE_SECRET_KEY`
     - `STRIPE_PRICE_ID`
   - Add your database connection URL:
     - `DATABASE_URL=postgres://username:password@localhost:5432/gymtext`

4. Set up the database:
   - Create a PostgreSQL database named 'gymtext'
   - Run the database migrations:
   ```bash
   pnpm migrate
   ```

5. Run the development server:
```bash
pnpm dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The application uses a PostgreSQL database with the following tables:

- **users**: Stores basic user information
- **fitness_profiles**: Stores user fitness data (goals, level, etc.)
- **subscriptions**: Tracks user subscription status
- **workouts**: Stores workout plans
- **workout_logs**: Records user workout completion and feedback

## Stripe Integration

The application uses Stripe for secure payment processing. To test payments:

1. Use Stripe's test mode
2. Use test card numbers (e.g., 4242 4242 4242 4242)
3. Any future date for expiry
4. Any 3 digits for CVC

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
