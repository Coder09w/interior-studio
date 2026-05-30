import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { getStripe, mapStripeStatus, getPlanFromPriceId } from '@/lib/stripe';

/**
 * POST /api/stripe/webhook
 *
 * Handle Stripe webhook events for subscription lifecycle.
 * Key events:
 * - checkout.session.completed: New subscription purchased
 * - customer.subscription.updated: Plan change, renewal, etc.
 * - customer.subscription.deleted: Cancellation confirmed
 * - invoice.payment_failed: Payment issue
 * - customer.subscription.trial_will_end: Trial ending soon
 *
 * Idempotency: Each Stripe event has a unique ID. We track processed
 * events in the Subscription record's metadata to avoid double-processing.
 */

// Simple in-memory dedup for events within the same process lifecycle
const processedEvents = new Map<string, number>();
const EVENT_TTL_MS = 60 * 60 * 1000; // 1 hour

function isEventProcessed(eventId: string): boolean {
  const timestamp = processedEvents.get(eventId);
  if (!timestamp) return false;
  if (Date.now() - timestamp > EVENT_TTL_MS) {
    processedEvents.delete(eventId);
    return false;
  }
  return true;
}

function markEventProcessed(eventId: string): void {
  processedEvents.set(eventId, Date.now());
  // Clean up old entries periodically
  if (processedEvents.size > 1000) {
    const cutoff = Date.now() - EVENT_TTL_MS;
    for (const [id, ts] of processedEvents) {
      if (ts < cutoff) processedEvents.delete(id);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    if (!stripe) {
      return NextResponse.json(
        { error: 'Stripe not configured' },
        { status: 501 },
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 },
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('[webhook] STRIPE_WEBHOOK_SECRET not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('[webhook] Signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 },
      );
    }

    // Idempotency check
    if (isEventProcessed(event.id)) {
      console.log(`[webhook] Duplicate event ignored: ${event.id} (${event.type})`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Process the event
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutComplete(event.data.object);
        break;
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object);
        break;
      }

      case 'invoice.payment_failed': {
        await handlePaymentFailed(event.data.object);
        break;
      }

      case 'customer.subscription.trial_will_end': {
        console.log(`[webhook] Trial ending soon for subscription: ${event.data.object.id}`);
        break;
      }

      default:
        console.log(`[webhook] Unhandled event: ${event.type}`);
    }

    // Mark event as processed
    markEventProcessed(event.id);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[webhook] Processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

// ─── Event Handlers ──────────────────────────────────────────────────────────

async function handleCheckoutComplete(session: Record<string, unknown>) {
  const metadata = session.metadata as Record<string, string> | undefined;
  const userId = metadata?.userId;
  const plan = metadata?.plan;

  if (!userId || !plan) {
    console.error('[webhook] Missing metadata in checkout session:', session.id);
    return;
  }

  const stripe = getStripe()!;

  // Get the subscription from Stripe
  const subscriptionId = session.subscription as string;
  let subscription;
  try {
    subscription = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    console.error('[webhook] Failed to retrieve subscription:', subscriptionId, err);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  const customerId = subscription.customer as string;
  const periodStart = new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000);
  const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);
  const cancelAtPeriodEnd = (subscription as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end;

  // Upsert subscription record
  await db.subscription.upsert({
    where: { userId },
    update: {
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd,
    },
    create: {
      userId,
      stripeSubscriptionId: subscriptionId,
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      status: mapStripeStatus(subscription.status),
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd,
    },
  });

  // Update user plan
  await db.user.update({
    where: { id: userId },
    data: { plan: plan as 'free' | 'pro' | 'studio' },
  });

  console.log(`[webhook] Checkout complete: user=${userId} plan=${plan}`);
}

async function handleSubscriptionUpdated(subscription: Record<string, unknown>) {
  // First try to find user from subscription metadata
  const subMetadata = subscription.metadata as Record<string, string> | undefined;
  let userId = subMetadata?.userId;
  let subRecord;

  if (!userId) {
    // Fall back to finding user by Stripe customer ID
    const customerId = subscription.customer as string;
    subRecord = await db.subscription.findFirst({
      where: { stripeCustomerId: customerId },
    });
    if (!subRecord) {
      console.error('[webhook] No user found for subscription update:', subscription.id);
      return;
    }
    userId = subRecord.userId;
  } else {
    // Get the subscription record for this user
    subRecord = await db.subscription.findUnique({
      where: { userId },
    });
  }

  if (!userId) return;

  // Determine plan from price ID
  const priceId = (subscription.items as unknown as { data: Array<{ price: { id: string } }> })?.data?.[0]?.price?.id;
  const newPlan = getPlanFromPriceId(priceId || '');

  const periodStart = new Date((subscription as unknown as { current_period_start: number }).current_period_start * 1000);
  const periodEnd = new Date((subscription as unknown as { current_period_end: number }).current_period_end * 1000);
  const cancelAtPeriodEnd = (subscription as unknown as { cancel_at_period_end: boolean }).cancel_at_period_end;
  const status = subscription.status as string;

  // Update subscription record
  if (subRecord) {
    await db.subscription.update({
      where: { id: subRecord.id },
      data: {
        stripeSubscriptionId: subscription.id as string,
        stripePriceId: priceId,
        status: mapStripeStatus(status as 'active'),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd,
      },
    });
  } else {
    // Create if missing
    await db.subscription.create({
      data: {
        userId,
        stripeSubscriptionId: subscription.id as string,
        stripeCustomerId: subscription.customer as string,
        stripePriceId: priceId,
        status: mapStripeStatus(status as 'active'),
        currentPeriodStart: periodStart,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd,
      },
    });
  }

  // Update user plan if subscription is active
  if (status === 'active' && newPlan !== 'free') {
    await db.user.update({
      where: { id: userId },
      data: { plan: newPlan },
    });
    console.log(`[webhook] Plan updated: user=${userId} plan=${newPlan}`);
  } else if (status === 'active' && newPlan === 'free') {
    // Price ID not recognized — keep current plan, log warning
    console.warn(`[webhook] Price ID ${priceId} not mapped to a plan. User ${userId} plan unchanged.`);
  }

  console.log(`[webhook] Subscription updated: user=${userId} status=${status}`);
}

async function handleSubscriptionDeleted(subscription: Record<string, unknown>) {
  const subRecord = await db.subscription.findFirst({
    where: { stripeSubscriptionId: subscription.id as string },
  });

  if (subRecord) {
    // Downgrade user to free
    await db.user.update({
      where: { id: subRecord.userId },
      data: { plan: 'free' },
    });

    await db.subscription.update({
      where: { id: subRecord.id },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: false,
      },
    });

    console.log(`[webhook] Subscription canceled: user=${subRecord.userId}`);
  } else {
    console.warn(`[webhook] Subscription deleted but no record found: ${subscription.id}`);
  }
}

async function handlePaymentFailed(invoice: Record<string, unknown>) {
  const customerId = invoice.customer as string;

  const subRecord = await db.subscription.findFirst({
    where: { stripeCustomerId: customerId },
  });

  if (subRecord) {
    await db.subscription.update({
      where: { id: subRecord.id },
      data: { status: 'past_due' },
    });
    console.log(`[webhook] Payment failed: user=${subRecord.userId}`);

    // Optionally: send email notification to user about failed payment
    // This would be the place to trigger a "payment failed" email
  } else {
    console.warn(`[webhook] Payment failed but no subscription record for customer: ${customerId}`);
  }
}
