import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { stripe, mapStripeStatus, mapInvoiceStatus } from "@/lib/stripe";
import Stripe from "stripe";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const organizationId = session.metadata?.organizationId;
        const plan = session.metadata?.plan as
          | "STARTER"
          | "PROFESSIONAL"
          | "ENTERPRISE";
        const interval = session.metadata?.interval as "MONTHLY" | "YEARLY";

        if (!organizationId || !plan || !interval) {
          console.error(
            "Missing metadata in checkout session:",
            session.metadata
          );
          break;
        }

        // Get the subscription details from Stripe
        const stripeSubscription: any = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        // Create or update subscription in database
        await prisma.subscription.upsert({
          where: { organizationId },
          create: {
            organizationId,
            plan,
            interval,
            status: mapStripeStatus(stripeSubscription.status),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            currentPeriodStart: new Date(
              stripeSubscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
          update: {
            plan,
            interval,
            status: mapStripeStatus(stripeSubscription.status),
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: stripeSubscription.id,
            currentPeriodStart: new Date(
              stripeSubscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(
              stripeSubscription.current_period_end * 1000
            ),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
          },
        });

        console.log(
          "Subscription created/updated for organization:",
          organizationId
        );
        break;
      }

      case "customer.subscription.updated": {
        const subscription: any = event.data.object as Stripe.Subscription;
        const organizationId = subscription.metadata?.organizationId;

        if (!organizationId) {
          console.error("Missing organizationId in subscription metadata");
          break;
        }

        // Update subscription in database
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: mapStripeStatus(subscription.status),
            currentPeriodStart: new Date(
              subscription.current_period_start * 1000
            ),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            canceledAt: subscription.canceled_at
              ? new Date(subscription.canceled_at * 1000)
              : null,
          },
        });

        console.log("Subscription updated:", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        // Update subscription status to CANCELLED
        await prisma.subscription.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: "CANCELLED",
            canceledAt: new Date(),
          },
        });

        console.log("Subscription deleted:", subscription.id);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice: any = event.data.object as Stripe.Invoice;

        // Find subscription by Stripe subscription ID
        const subscriptionId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;

        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId },
        });

        if (!subscription) {
          console.error("Subscription not found for invoice:", invoice.id);
          break;
        }

        // Create invoice record in database
        await prisma.invoice.create({
          data: {
            subscriptionId: subscription.id,
            stripeInvoiceId: invoice.id,
            amount: invoice.amount_paid,
            currency: invoice.currency,
            status: "PAID",
            invoiceUrl: invoice.hosted_invoice_url,
            paidAt: invoice.status_transitions?.paid_at
              ? new Date(invoice.status_transitions.paid_at * 1000)
              : new Date(),
          },
        });

        console.log("Invoice payment recorded:", invoice.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice: any = event.data.object as Stripe.Invoice;

        // Find subscription and update status
        const subscriptionId2 =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId2 },
        });

        if (subscription) {
          await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: "PAST_DUE" },
          });

          // Create failed invoice record
          await prisma.invoice.create({
            data: {
              subscriptionId: subscription.id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: "FAILED",
              invoiceUrl: invoice.hosted_invoice_url,
            },
          });
        }

        console.log("Payment failed for invoice:", invoice.id);
        break;
      }

      case "invoice.finalized": {
        const invoice: any = event.data.object as Stripe.Invoice;

        // Find subscription
        const subscriptionId3 =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id;
        const subscription = await prisma.subscription.findFirst({
          where: { stripeSubscriptionId: subscriptionId3 },
        });

        if (!subscription) {
          break;
        }

        // Check if invoice already exists
        const existingInvoice = await prisma.invoice.findFirst({
          where: { stripeInvoiceId: invoice.id },
        });

        if (!existingInvoice) {
          // Create pending invoice record
          await prisma.invoice.create({
            data: {
              subscriptionId: subscription.id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_due,
              currency: invoice.currency,
              status: mapInvoiceStatus(invoice.status!),
              invoiceUrl: invoice.hosted_invoice_url,
            },
          });
        }

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
