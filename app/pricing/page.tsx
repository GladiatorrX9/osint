"use client";

import { useState } from "react";
import Link from "next/link";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { Button } from "@/components/ui/button";
import { pricingPlans } from "@/lib/pricing";
import { IconCheck, IconShield } from "@tabler/icons-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <IconShield className="text-black h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-white">GladiatorRX</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-neutral-400 hover:text-white text-sm font-medium"
              >
                Sign In
              </Link>
              <Link href="/register">
                <Button className="bg-neutral-800 hover:bg-neutral-700">
                  Join Waitlist
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-neutral-400 mb-8">
            Choose the perfect plan for your security needs
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-neutral-900 rounded-lg p-1 border border-neutral-800">
            <button
              onClick={() => setBillingCycle("monthly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "monthly"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle("yearly")}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingCycle === "yearly"
                  ? "bg-neutral-800 text-white"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              Yearly
              <span className="ml-2 text-xs text-green-400">Save 17%</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div key={index} className="relative">
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <span className="bg-linear-to-r from-cyan-400 to-blue-500 text-white text-xs font-bold px-4 py-1 rounded-full">
                    RECOMMENDED
                  </span>
                </div>
              )}
              <BackgroundGradient
                className={`rounded-3xl p-8 bg-neutral-900 h-full ${
                  plan.recommended ? "ring-2 ring-cyan-400/50" : ""
                }`}
              >
                <div className="flex flex-col h-full">
                  {/* Plan Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-neutral-400 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    {plan.name === "Enterprise Plan" ? (
                      <div>
                        <div className="text-4xl font-bold text-white mb-1">
                          Custom
                        </div>
                        <div className="text-neutral-400 text-sm">
                          Contact us for pricing
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-5xl font-bold text-white">
                            $
                            {billingCycle === "monthly"
                              ? plan.monthlyPrice
                              : plan.yearlyPrice}
                          </span>
                          {billingCycle === "monthly" && (
                            <span className="text-neutral-400 text-lg">
                              /month
                            </span>
                          )}
                          {billingCycle === "yearly" && (
                            <span className="text-neutral-400 text-lg">
                              /year
                            </span>
                          )}
                        </div>
                        {billingCycle === "yearly" && (
                          <div className="text-neutral-500 text-sm mt-1">
                            ${Math.round(plan.yearlyPrice / 12)}/month billed
                            annually
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mb-8 flex-1">
                    <ul className="space-y-4">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <IconCheck className="h-5 w-5 text-green-400 shrink-0 mt-0.5" />
                          <span className="text-neutral-300 text-sm">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  <Link href={plan.href} className="w-full">
                    <Button
                      className={`w-full h-12 rounded-lg font-medium ${
                        plan.recommended
                          ? "bg-linear-to-r from-cyan-400 to-blue-500 text-white hover:opacity-90"
                          : "bg-neutral-800 hover:bg-neutral-700 text-white"
                      }`}
                    >
                      {plan.name === "Enterprise Plan"
                        ? "Contact Sales"
                        : "Get Started"}
                    </Button>
                  </Link>
                </div>
              </BackgroundGradient>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-24 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold text-white mb-2">
                What counts as an identifier?
              </h3>
              <p className="text-neutral-400">
                An identifier can be an email address, domain, phone number, or
                any other unique piece of information you want to monitor for
                breaches.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold text-white mb-2">
                Can I upgrade or downgrade my plan?
              </h3>
              <p className="text-neutral-400">
                Yes! You can change your plan at any time. Upgrades take effect
                immediately, and downgrades take effect at the end of your
                current billing cycle.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold text-white mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-neutral-400">
                We offer a 14-day money-back guarantee. If you're not satisfied
                with our service, contact us within 14 days of purchase for a
                full refund.
              </p>
            </div>
            <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
              <h3 className="text-lg font-semibold text-white mb-2">
                What's included in Enterprise support?
              </h3>
              <p className="text-neutral-400">
                Enterprise customers get a dedicated account manager, 24/7
                priority support, custom SLA agreements, and the option for
                on-premise deployment.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="bg-linear-to-br from-neutral-900 to-neutral-950 rounded-2xl p-12 border border-neutral-800">
            <h2 className="text-3xl font-bold text-white mb-4">
              Still have questions?
            </h2>
            <p className="text-neutral-400 text-lg mb-8">
              Our team is here to help you choose the right plan
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/register">
                <Button className="bg-neutral-800 hover:bg-neutral-700 h-12 px-8">
                  Join Waitlist
                </Button>
              </Link>
              <a href="mailto:support@gladiatorrx.com">
                <Button
                  variant="outline"
                  className="h-12 px-8 border-neutral-700 text-white hover:bg-neutral-900"
                >
                  Contact Sales
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-neutral-500 text-sm">
            © 2025 GladiatorRX Security. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
