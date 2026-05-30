import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

/**
 * POST /api/plan/cancel
 *
 * Cancel the current subscription and downgrade to free.
 * In dev mode (no Stripe), directly downgrades the plan.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found.' },
        { status: 404 },
      );
    }

    if (isStripeConfigured() && subscription.stripeSubscriptionId) {
      const stripe = getStripe()!;

      // Cancel at period end (don't immediately revoke access)
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });

      await db.subscription.update({
        where: { id: subscription.id },
        data: { cancelAtPeriodEnd: true },
      });

      return NextResponse.json({
        message: 'Subscription will be canceled at the end of the billing period.',
        cancelAtPeriodEnd: true,
      });
    }

    // Dev mode: immediately downgrade
    await db.user.update({
      where: { id: session.user.id },
      data: { plan: 'free' },
    });

    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'canceled',
        cancelAtPeriodEnd: false,
      },
    });

    return NextResponse.json({
      message: 'Plan downgraded to Free (dev mode).',
      plan: 'free',
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription.' },
      { status: 500 },
    );
  }
}
