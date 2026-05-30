/**
 * Stripe integration helper.
 *
 * In production, set these environment variables:
 * - STRIPE_SECRET_KEY                    (sk_live_...)
 * - NEXT_PUBLIC_STRIPE_PRO_PRICE_ID      (price_...)
 * - NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID   (price_...)
 * - STRIPE_WEBHOOK_SECRET                (whsec_...)
 *
 * In development without Stripe keys, the checkout/portal APIs
 * will fall back to "dev mode" (direct DB plan changes without payment).
 *
 * Setup: Run `npx tsx scripts/setup-stripe.ts` to automatically
 * create Stripe products, prices, portal config, and webhook endpoint.
 */

import Stripe from 'stripe';
import { type PlanKey, PLAN_CONFIG, isBetaMode } from '@/lib/plans';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  if (_stripe) return _stripe;

  // During beta, Stripe is completely disabled
  if (isBetaMode()) return null;

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.startsWith('sk_test_placeholder') || key === '') {
    return null; // Stripe not configured
  }

  _stripe = new Stripe(key, {
    apiVersion: '2026-05-27.dahlia',
    typescript: true,
  });
  return _stripe;
}

/** Check if Stripe is properly configured. During beta, always false. */
export function isStripeConfigured(): boolean {
  if (isBetaMode()) return false;
  return getStripe() !== null;
}

/** Get the Stripe Price ID for a given plan */
export function getPriceId(plan: PlanKey): string | null {
  const config = PLAN_CONFIG[plan];
  if (!config || config.price === 0) return null;
  const priceId = config.priceId;
  if (!priceId || priceId === '') return null;
  return priceId;
}

/** Map Stripe subscription status to our internal status */
export function mapStripeStatus(status: Stripe.Subscription.Status): string {
  switch (status) {
    case 'active':
      return 'active';
    case 'trialing':
      return 'trialing';
    case 'past_due':
      return 'past_due';
    case 'canceled':
      return 'canceled';
    case 'incomplete':
    case 'incomplete_expired':
      return 'incomplete';
    case 'unpaid':
      return 'canceled';
    case 'paused':
      return 'paused';
    default:
      return 'incomplete';
  }
}

/** Map a Stripe Price ID back to our plan key */
export function getPlanFromPriceId(priceId: string): PlanKey {
  if (!priceId) return 'free';

  const proPriceId = PLAN_CONFIG.pro.priceId;
  const studioPriceId = PLAN_CONFIG.studio.priceId;

  if (proPriceId && priceId === proPriceId) return 'pro';
  if (studioPriceId && priceId === studioPriceId) return 'studio';

  // Also check env vars directly (in case PLAN_CONFIG hasn't loaded from DB yet)
  const envProPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const envStudioPriceId = process.env.NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID;

  if (envProPriceId && priceId === envProPriceId) return 'pro';
  if (envStudioPriceId && priceId === envStudioPriceId) return 'studio';

  return 'free'; // fallback
}
