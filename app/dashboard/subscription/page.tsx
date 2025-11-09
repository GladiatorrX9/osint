"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconCheck,
  IconCreditCard,
  IconDownload,
  IconSparkles,
  IconRocket,
  IconBuilding,
  IconCalendar,
  IconAlertCircle,
  IconLoader2,
} from "@tabler/icons-react";

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  icon: any;
  popular?: boolean;
}

interface Subscription {
  id: string;
  plan: "STARTER" | "PROFESSIONAL" | "ENTERPRISE";
  interval: "MONTHLY" | "YEARLY";
  status: "ACTIVE" | "CANCELLED" | "PAST_DUE" | "INCOMPLETE" | "TRIALING";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: "PAID" | "PENDING" | "FAILED" | "VOID";
  invoiceUrl: string | null;
  paidAt: string | null;
  createdAt: string;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    monthlyPrice: 29,
    yearlyPrice: 279,
    icon: IconSparkles,
    features: [
      "Up to 10 team members",
      "100 breach searches per month",
      "Basic analytics",
      "Email support",
      "7-day data retention",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    monthlyPrice: 99,
    yearlyPrice: 950,
    icon: IconRocket,
    popular: true,
    features: [
      "Up to 50 team members",
      "Unlimited breach searches",
      "Advanced analytics & reports",
      "Priority support",
      "30-day data retention",
      "Custom integrations",
      "API access",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 299,
    yearlyPrice: 2870,
    icon: IconBuilding,
    features: [
      "Unlimited team members",
      "Unlimited breach searches",
      "Advanced analytics & reports",
      "24/7 dedicated support",
      "90-day data retention",
      "Custom integrations",
      "Full API access",
      "SLA guarantee",
      "On-premise deployment",
    ],
  },
];

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [billingInterval, setBillingInterval] = useState<"month" | "year">(
    "month"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  // Fetch subscription and invoices on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch subscription
        const subResponse = await fetch("/api/subscription");
        if (!subResponse.ok) {
          throw new Error("Failed to fetch subscription");
        }
        const subData = await subResponse.json();
        setSubscription(subData.subscription);

        // Fetch invoices
        const invResponse = await fetch("/api/subscription/invoices");
        if (!invResponse.ok) {
          throw new Error("Failed to fetch invoices");
        }
        const invData = await invResponse.json();
        setInvoices(invData.invoices || []);
      } catch (err) {
        console.error("Error fetching subscription data:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load subscription data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUpgrade = async (planId: string) => {
    try {
      setUpgrading(true);
      setError(null);

      // Convert plan ID and billing interval to proper format
      const plan = planId.toUpperCase();
      const interval = billingInterval === "month" ? "MONTHLY" : "YEARLY";

      // Create Stripe Checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create checkout session");
      }

      const data = await response.json();

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err) {
      console.error("Error upgrading subscription:", err);
      setError(err instanceof Error ? err.message : "Failed to start checkout");
      setUpgrading(false);
    }
  };

  const handleManageSubscription = async () => {
    try {
      setError(null);

      // Open Stripe Customer Portal
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to open portal");
      }

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No portal URL received");
      }
    } catch (err) {
      console.error("Error opening customer portal:", err);
      setError(
        err instanceof Error ? err.message : "Failed to open customer portal"
      );
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "FAILED":
      case "VOID":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getPlanIcon = (plan?: string) => {
    switch (plan) {
      case "STARTER":
        return IconSparkles;
      case "PROFESSIONAL":
        return IconRocket;
      case "ENTERPRISE":
        return IconBuilding;
      default:
        return IconCreditCard;
    }
  };

  const getPlanPrice = (plan?: string, interval?: string) => {
    const prices: Record<string, { MONTHLY: number; YEARLY: number }> = {
      STARTER: { MONTHLY: 29, YEARLY: 279 },
      PROFESSIONAL: { MONTHLY: 99, YEARLY: 950 },
      ENTERPRISE: { MONTHLY: 299, YEARLY: 2870 },
    };

    if (!plan || !interval) return 0;
    return prices[plan]?.[interval as "MONTHLY" | "YEARLY"] || 0;
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl space-y-8 p-8">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl space-y-8 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-foreground">
          Subscription & Billing
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </motion.div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <IconAlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Plan */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              {subscription
                ? `You are currently on the ${subscription.plan.toLowerCase()} plan`
                : "You don't have an active subscription"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-3">
                      {(() => {
                        const PlanIcon = getPlanIcon(subscription.plan);
                        return <PlanIcon className="h-6 w-6 text-primary" />;
                      })()}
                    </div>
                    <div>
                      <p className="text-2xl font-bold capitalize">
                        {subscription.plan.toLowerCase()}
                      </p>
                      <p className="text-muted-foreground">
                        $
                        {getPlanPrice(subscription.plan, subscription.interval)}
                        /
                        {subscription.interval === "MONTHLY" ? "month" : "year"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {subscription.cancelAtPeriodEnd
                        ? "Cancels on"
                        : "Next billing date"}
                    </p>
                    <p className="flex items-center gap-2 font-semibold">
                      <IconCalendar className="h-4 w-4" />
                      {subscription.currentPeriodEnd
                        ? new Date(
                            subscription.currentPeriodEnd
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      variant="outline"
                      className={
                        subscription.status === "ACTIVE"
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                      }
                    >
                      {subscription.status}
                    </Badge>
                  </div>
                  {subscription.cancelAtPeriodEnd && (
                    <Badge
                      variant="outline"
                      className="bg-red-500/10 text-red-500 border-red-500/20"
                    >
                      Cancellation scheduled
                    </Badge>
                  )}
                </div>
                <Separator className="my-6" />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={handleManageSubscription}
                  >
                    <IconCreditCard className="h-4 w-4" />
                    Manage Subscription
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <IconCreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Choose a plan below to get started
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Billing Interval Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center gap-2 rounded-lg bg-muted p-1">
          <Button
            variant={billingInterval === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingInterval("month")}
          >
            Monthly
          </Button>
          <Button
            variant={billingInterval === "year" ? "default" : "ghost"}
            size="sm"
            onClick={() => setBillingInterval("year")}
          >
            Yearly
            <Badge variant="secondary" className="ml-2">
              Save 20%
            </Badge>
          </Button>
        </div>
      </motion.div>

      {/* Available Plans */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan, index) => {
          const PlanIcon = plan.icon;
          const isCurrentPlan =
            subscription?.plan.toUpperCase() === plan.id.toUpperCase();
          const price =
            billingInterval === "month" ? plan.monthlyPrice : plan.yearlyPrice;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (index + 3) }}
            >
              <Card
                className={`relative ${
                  plan.popular
                    ? "border-primary shadow-lg shadow-primary/20"
                    : ""
                } ${isCurrentPlan ? "border-green-500" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      Most Popular
                    </Badge>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-green-500 text-white">
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <PlanIcon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>{plan.name}</CardTitle>
                  </div>
                  <CardDescription className="mt-4">
                    <span className="text-4xl font-bold text-foreground">
                      ${price}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingInterval}
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full"
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleUpgrade(plan.id)}
                    disabled={upgrading || isCurrentPlan}
                  >
                    {upgrading ? (
                      <>
                        <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : (
                      "Choose Plan"
                    )}
                  </Button>
                  <Separator />
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <IconCheck className="h-5 w-5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Billing History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
            <CardDescription>
              View and download your past invoices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">
                        {invoice.id.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        {new Date(
                          invoice.paidAt || invoice.createdAt
                        ).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        ${(invoice.amount / 100).toFixed(2)}{" "}
                        {invoice.currency.toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusBadgeColor(invoice.status)}
                        >
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2"
                          onClick={() => {
                            if (invoice.invoiceUrl) {
                              window.open(invoice.invoiceUrl, "_blank");
                            }
                          }}
                          disabled={!invoice.invoiceUrl}
                        >
                          <IconDownload className="h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <IconCreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No invoices yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
