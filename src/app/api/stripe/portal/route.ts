import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getStripe, isStripeConfigured } from '@/lib/stripe';

/**
 * POST /api/stripe/portal
 *
 * Create a Stripe Customer Portal session for managing subscriptions.
 * This lets users:
 * - Update payment methods
 * - View invoices
 * - Cancel subscriptions
 * - Upgrade/downgrade plans (if portal is configured)
 */
export async function POST(request?: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isStripeConfigured()) {
      return NextResponse.json(
        { error: 'Payment management is not available in development mode.' },
        { status: 501 },
      );
    }

    const stripe = getStripe()!;

    // Find customer ID
    const subscription = await db.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription?.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Please subscribe first.' },
        { status: 404 },
      );
    }

    // Ensure portal configuration exists
    // First, try to find an existing configuration
    const configurations = await stripe.billingPortal.configurations.list({
      active: true,
      limit: 1,
    });

    let configurationId: string;

    if (configurations.data.length > 0) {
      configurationId = configurations.data[0].id;
    } else {
      // Create a default portal configuration
      // This allows: payment method updates, invoice viewing, subscription cancellation
      // and plan changes between Pro and Studio
      const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
      const studioPriceId = process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID;

      const config = await stripe.billingPortal.configurations.create({
        business_profile: {
          headline: 'Interior Studio — Manage your subscription',
        },
        features: {
          payment_method_update: {
            enabled: true,
          },
          customer_update: {
            enabled: true,
            allowed_updates: ['email', 'address'],
          },
          invoice_history: {
            enabled: true,
          },
          subscription_cancel: {
            enabled: true,
            mode: 'at_period_end',
            cancellation_reason: {
              enabled: true,
              options: [
                'too_expensive',
                'missing_features',
                'switched_service',
                'unused',
                'other',
              ],
            },
            proration_behavior: 'none',
          },
          ...(proPriceId && studioPriceId ? {
            subscription_update: {
              enabled: true,
              default_allowed_updates: ['price', 'promotion_code'],
              products: [
                {
                  product: 'pro_product',
                  prices: [proPriceId],
                },
                {
                  product: 'studio_product',
                  prices: [studioPriceId],
                },
              ],
            },
          } : {}),
        },
      });

      configurationId = config.id;
    }

    // Create portal session with the configuration
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      configuration: configurationId,
      return_url: `${process.env.NEXTAUTH_URL}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('[portal] Stripe portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create billing portal session. Please try again.' },
      { status: 500 },
    );
  }
}
