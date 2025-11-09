import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-10-29.clover",
  typescript: true,
});

// Stripe Price IDs mapping
// You need to create these products and prices in your Stripe Dashboard
export const STRIPE_PRICE_IDS = {
  STARTER: {
    MONTHLY: process.env.STRIPE_STARTER_MONTHLY_PRICE_ID || "",
    YEARLY: process.env.STRIPE_STARTER_YEARLY_PRICE_ID || "",
  },
  PROFESSIONAL: {
    MONTHLY: process.env.STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || "",
    YEARLY: process.env.STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || "",
  },
  ENTERPRISE: {
    MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || "",
    YEARLY: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || "",
  },
} as const;

// Pricing configuration (should match your subscription page)
export const PRICING = {
  STARTER: {
    MONTHLY: 29_00, // $29 in cents
    YEARLY: 279_00, // $279 in cents (20% off)
  },
  PROFESSIONAL: {
    MONTHLY: 99_00, // $99 in cents
    YEARLY: 950_00, // $950 in cents (20% off)
  },
  ENTERPRISE: {
    MONTHLY: 299_00, // $299 in cents
    YEARLY: 2870_00, // $2870 in cents (20% off)
  },
} as const;

export type StripePlan = keyof typeof STRIPE_PRICE_IDS;
export type StripeInterval = keyof typeof STRIPE_PRICE_IDS.STARTER;

/**
 * Get Stripe Price ID for a given plan and interval
 */
export function getStripePriceId(
  plan: StripePlan,
  interval: StripeInterval
): string {
  const priceId = STRIPE_PRICE_IDS[plan]?.[interval];

  if (!priceId) {
    throw new Error(
      `Stripe Price ID not found for plan: ${plan}, interval: ${interval}`
    );
  }

  return priceId;
}

/**
 * Get price amount in cents for a given plan and interval
 */
export function getPriceAmount(
  plan: StripePlan,
  interval: StripeInterval
): number {
  return PRICING[plan][interval];
}

/**
 * Convert Stripe subscription status to our internal status
 */
export function mapStripeStatus(
  stripeStatus: Stripe.Subscription.Status
): "ACTIVE" | "CANCELLED" | "PAST_DUE" | "INCOMPLETE" | "TRIALING" {
  switch (stripeStatus) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELLED";
    case "past_due":
      return "PAST_DUE";
    case "incomplete":
    case "incomplete_expired":
      return "INCOMPLETE";
    case "trialing":
      return "TRIALING";
    case "unpaid":
      return "PAST_DUE";
    case "paused":
      return "CANCELLED";
    default:
      return "INCOMPLETE";
  }
}

/**
 * Convert Stripe invoice status to our internal status
 */
export function mapInvoiceStatus(
  stripeStatus: Stripe.Invoice.Status
): "PAID" | "PENDING" | "FAILED" | "VOID" {
  switch (stripeStatus) {
    case "paid":
      return "PAID";
    case "open":
    case "draft":
      return "PENDING";
    case "uncollectible":
      return "FAILED";
    case "void":
      return "VOID";
    default:
      return "PENDING";
  }
}
