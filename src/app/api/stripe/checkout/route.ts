import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripe, isStripeConfigured, getPriceId } from '@/lib/stripe';
import { type PlanKey, PLAN_CONFIG, isPlanAtLeast } from '@/lib/plans';

/**
 * POST /api/stripe/checkout
 *
 * Create a Stripe Checkout Session for plan upgrade.
 * Body: { plan: 'pro' | 'studio' }
 *
 * Supports:
 * - New subscription purchase (Free → Pro or Free → Studio)
 * - Plan upgrade (Pro → Studio) with proration
 * - Dev mode fallback when Stripe is not configured
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { plan } = body as { plan: PlanKey };

    // Validate plan
    if (!plan || !['pro', 'studio'].includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan. Choose "pro" or "studio".' },
        { status: 400 },
      );
    }

    const userId = session.user.id;

    // Get current plan from DB (not session, which may be stale)
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { plan: true, email: true },
    });

    const currentPlan = (user?.plan as PlanKey) || 'free';

    // Check if user is already on this plan or higher
    if (isPlanAtLeast(currentPlan, plan)) {
      return NextResponse.json(
        { error: `You are already on the ${PLAN_CONFIG[currentPlan]?.name || currentPlan} plan or higher.` },
        { status: 400 },
      );
    }

    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      // Dev mode: upgrade plan directly in database
      return handleDevUpgrade(userId, plan);
    }

    const stripe = getStripe()!;
    const priceId = getPriceId(plan);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Payment configuration error. Please contact support.' },
        { status: 500 },
      );
    }

    // Find or create Stripe customer
    let customerId: string;
    let existingSubscriptionId: string | null = null;

    const existingSub = await db.subscription.findUnique({
      where: { userId },
    });

    if (existingSub?.stripeCustomerId) {
      customerId = existingSub.stripeCustomerId;
      existingSubscriptionId = existingSub.stripeSubscriptionId;
    } else {
      const customer = await stripe.customers.create({
        email: user?.email || session.user.email || undefined,
        metadata: {
          userId,
        },
      });
      customerId = customer.id;

      // Save customer ID
      await db.subscription.upsert({
        where: { userId },
        update: { stripeCustomerId: customerId },
        create: {
          userId,
          stripeCustomerId: customerId,
          status: 'inactive',
        },
      });
    }

    // If user has an active subscription (e.g., Pro → Studio upgrade),
    // update the existing subscription with proration instead of new checkout
    if (existingSubscriptionId && currentPlan !== 'free') {
      try {
        const currentSub = await stripe.subscriptions.retrieve(existingSubscriptionId);

        if (currentSub.status === 'active') {
          // Update existing subscription (upgrade with proration)
          const updatedSub = await stripe.subscriptions.update(existingSubscriptionId, {
            items: [{
              id: currentSub.items.data[0]?.id,
              price: priceId,
            }],
            proration_behavior: 'create_prorations',
            metadata: {
              userId,
              plan,
            },
          });

          // Update our DB immediately for faster UI response
          // (webhook will also fire to confirm)
          await db.subscription.update({
            where: { userId },
            data: {
              stripePriceId: priceId,
              stripeSubscriptionId: updatedSub.id,
              status: 'active',
            },
          });

          await db.user.update({
            where: { id: userId },
            data: { plan },
          });

          return NextResponse.json({
            upgraded: true,
            message: `Plan upgraded to ${PLAN_CONFIG[plan].name}`,
            plan,
          });
        }
      } catch (err) {
        console.error('[checkout] Failed to update existing subscription, falling back to new checkout:', err);
        // Fall through to create new checkout session
      }
    }

    // Create new checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?upgraded=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('[checkout] Stripe checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session. Please try again.' },
      { status: 500 },
    );
  }
}

/**
 * Dev-mode upgrade: directly change the user's plan in the database.
 * This is used when Stripe is not configured (local development).
 */
async function handleDevUpgrade(userId: string, plan: PlanKey) {
  // Update user plan
  await db.user.update({
    where: { id: userId },
    data: { plan },
  });

  // Create/update subscription record
  await db.subscription.upsert({
    where: { userId },
    update: {
      status: 'active',
      stripePriceId: `dev_${plan}_price`,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    },
    create: {
      userId,
      status: 'active',
      stripePriceId: `dev_${plan}_price`,
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return NextResponse.json({
    devMode: true,
    message: `Plan upgraded to ${plan} (dev mode — no payment processed).`,
    plan,
  });
}
