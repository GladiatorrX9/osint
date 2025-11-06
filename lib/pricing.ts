export interface PricingPlan {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  recommended?: boolean;
  href: string;
}

export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter Plan",
    monthlyPrice: 29,
    yearlyPrice: 299,
    description: "Ideal for individuals and freelancers",
    features: [
      "Monitor up to 10 identifiers",
      "Basic breach alerts",
      "Email support",
      "Monthly reports",
      "Community access",
    ],
    href: "/register",
  },
  {
    name: "Professional Plan",
    monthlyPrice: 149,
    yearlyPrice: 1499,
    description: "Perfect for small businesses and consultants",
    features: [
      "Monitor up to 100 identifiers",
      "Advanced analytics",
      "Priority support",
      "Real-time alerts",
      "API access",
      "Custom reports",
    ],
    recommended: true,
    href: "/register",
  },
  {
    name: "Enterprise Plan",
    monthlyPrice: 0, // Custom pricing
    yearlyPrice: 0,
    description: "Tailored for large organizations",
    features: [
      "Unlimited monitoring",
      "Dedicated account manager",
      "Custom integrations",
      "24/7 phone support",
      "On-premise deployment option",
      "SLA guarantee",
    ],
    href: "/register",
  },
];
