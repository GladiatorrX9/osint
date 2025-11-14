# GladiatorrX - Data Breach Intelligence Platform

A modern Next.js application for monitoring and managing data breach intelligence with beautiful visualizations, team collaboration, and subscription management.

## Features

- 🎨 **Beautiful Dashboard** with interactive charts (Recharts)
- 🔍 **Search Leaked Databases** with detailed breach information
- 👥 **Team Management** with role-based access control
- 💳 **Stripe Subscriptions** with multiple pricing tiers
- 👤 **Enhanced Profile** with security settings and activity logs
- 🌓 **Dark/Light Theme** support
- 🔐 **NextAuth Authentication** with JWT sessions
- 📊 **Data Visualization** with breach trends, severity distribution, and more

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Prisma ORM with SQLite
- **Authentication:** NextAuth.js v4
- **UI Components:** Radix UI + shadcn/ui
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Payments:** Stripe

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Stripe account (for subscription features)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd gladiatorrx
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

- Database URL
- NextAuth configuration
- Stripe API keys (see [STRIPE_SETUP.md](./STRIPE_SETUP.md))

4. Initialize the database:

```bash
npx prisma generate
npx prisma db push
```

5. (Optional) Seed the database:

```bash
npx prisma db seed
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
pnpm build
pnpm start
```

## Project Structure

```
/app
  /dashboard          # Main dashboard with charts
  /dashboard/search   # Search leaked databases
  /dashboard/team     # Team management
  /dashboard/subscription  # Billing & subscriptions
  /dashboard/profile  # User profile with settings
  /api
    /auth            # NextAuth endpoints
    /databases       # Database API
    /stripe          # Stripe integration
/components
  /charts            # Recharts components
  /ui                # shadcn/ui components
  /layout            # Layout components (sidebar, header)
/features
  /profile           # Profile feature module
/constants
  data.ts            # Navigation and mock data
/lib
  prisma.ts          # Prisma client
  utils.ts           # Utility functions
```

## Key Features Documentation

### Dashboard Charts

Four interactive charts visualize breach data:

- **Breach Trends:** Line chart showing monthly breach counts
- **Severity Distribution:** Bar chart of breach severity levels
- **Data Types:** Pie chart of affected data categories
- **Records Timeline:** Area chart of exposed records over time

### Team Management

- Invite team members with role assignment
- Manage user roles (Admin, Member, Viewer)
- View team activity and status
- Remove team members

### Subscription Plans

Three pricing tiers available:

- **Starter:** $29/month - Small teams
- **Professional:** $99/month - Growing organizations (Most Popular)
- **Enterprise:** $299/month - Large enterprises

All plans include 20% discount for yearly billing.

### Profile Management

- **General Settings:** Update name, email, notifications
- **Security:** Password change, 2FA setup, backup codes
- **Activity Log:** View recent account activity

## Stripe Integration

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for complete setup instructions.

Quick start:

1. Create Stripe account
2. Add API keys to `.env.local`
3. Create products and prices in Stripe Dashboard
4. Configure webhook endpoint
5. Test with Stripe test cards

## Authentication

The app uses NextAuth.js with credentials provider. Default admin credentials are in `democreds.txt`.

**Note:** Update authentication configuration for production use.

## Database Schema

The application uses Prisma with SQLite. Key models:

- `User` - User accounts with authentication
- `LeakedDatabase` - Breach records with metadata
- `Waitlist` - Email waitlist entries

To modify the schema, edit `prisma/schema.prisma` and run:

```bash
npx prisma migrate dev --name your_migration_name
```

## Scripts

```bash
# Development
pnpm dev              # Start dev server with Turbopack

# Database
pnpm prisma:generate  # Generate Prisma client
pnpm prisma:studio    # Open Prisma Studio GUI

# Production
pnpm build           # Build for production
pnpm start           # Start production server

# Linting
pnpm lint            # Run ESLint
```

## Environment Variables

Required environment variables:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID=price_...
STRIPE_ENTERPRISE_MONTHLY_PRICE_ID=price_...
```

See `.env.example` for complete list.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting and tests
5. Submit a pull request

## Documentation

- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md) - Complete feature documentation
- [Stripe Setup Guide](./STRIPE_SETUP.md) - Stripe integration instructions

## Support

For issues or questions:

1. Check existing GitHub issues
2. Review documentation files
3. Create a new issue with detailed information

## License

[Add your license here]

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts powered by [Recharts](https://recharts.org/)
- Payments by [Stripe](https://stripe.com/)

---

Made with ❤️ for data breach intelligence
