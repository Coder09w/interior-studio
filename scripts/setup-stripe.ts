/**
 * Stripe Setup Script — One-time initialization
 *
 * This script creates the Products and Prices in Stripe that your
 * application needs for the Pro and Studio subscription plans.
 * It also creates a Customer Portal configuration.
 *
 * Usage:
 *   npx tsx scripts/setup-stripe.ts
 *
 * Prerequisites:
 *   - Set STRIPE_SECRET_KEY in your .env file (use test key: sk_test_...)
 *   - npm install (to get the stripe package)
 *
 * After running:
 *   - The script outputs the Price IDs and Webhook Secret you need
 *   - Add them to your .env file as shown in the output
 *   - For production, re-run with a live key (sk_live_...)
 */

import Stripe from 'stripe';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_KEY || STRIPE_KEY.startsWith('sk_test_placeholder')) {
  console.error('❌ STRIPE_SECRET_KEY not set in .env');
  console.error('   Add your Stripe test key to .env:');
  console.error('   STRIPE_SECRET_KEY=sk_test_...');
  console.error('');
  console.error('   Get your key from: https://dashboard.stripe.com/test/apikeys');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2026-05-27.dahlia',
});

const IS_LIVE = STRIPE_KEY.startsWith('sk_live_');
const MODE = IS_LIVE ? '🔴 LIVE' : '🧪 TEST';

console.log('');
console.log(`╔══════════════════════════════════════════════════╗`);
console.log(`║   Interior Studio — Stripe Setup (${MODE} Mode)   ║`);
console.log(`╚══════════════════════════════════════════════════╝`);
console.log('');

async function main() {
  // ─── Step 1: Create Products ──────────────────────────────────────────

  console.log('📦 Creating products...');

  // Check if products already exist
  const existingProducts = await stripe.products.list({
    active: true,
    limit: 100,
  });

  let proProduct = existingProducts.data.find(
    (p) => p.metadata.plan === 'pro' || p.name === 'Interior Studio Pro'
  );
  let studioProduct = existingProducts.data.find(
    (p) => p.metadata.plan === 'studio' || p.name === 'Interior Studio Studio'
  );

  if (!proProduct) {
    proProduct = await stripe.products.create({
      name: 'Interior Studio Pro',
      description: 'For serious designers and homeowners — unlimited furniture, all room types, share links, export, and more.',
      metadata: {
        plan: 'pro',
      },
    });
    console.log(`   ✅ Created Pro product: ${proProduct.id}`);
  } else {
    console.log(`   ⏩ Pro product already exists: ${proProduct.id}`);
  }

  if (!studioProduct) {
    studioProduct = await stripe.products.create({
      name: 'Interior Studio Studio',
      description: 'For professional interior designers — client portal, floor plans, cost estimator, presentation mode, and more.',
      metadata: {
        plan: 'studio',
      },
    });
    console.log(`   ✅ Created Studio product: ${studioProduct.id}`);
  } else {
    console.log(`   ⏩ Studio product already exists: ${studioProduct.id}`);
  }

  // ─── Step 2: Create Prices ────────────────────────────────────────────

  console.log('');
  console.log('💰 Creating prices...');

  // Check existing prices
  const existingPrices = await stripe.prices.list({
    active: true,
    limit: 100,
  });

  let proPrice = existingPrices.data.find(
    (p) => p.product === proProduct.id && p.recurring?.interval === 'month' && p.unit_amount === 1200
  );
  let studioPrice = existingPrices.data.find(
    (p) => p.product === studioProduct.id && p.recurring?.interval === 'month' && p.unit_amount === 2900
  );

  if (!proPrice) {
    proPrice = await stripe.prices.create({
      product: proProduct.id,
      unit_amount: 1200, // $12.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'pro',
      },
      nickname: 'Pro Monthly',
    });
    console.log(`   ✅ Created Pro price: ${proPrice.id} ($12/month)`);
  } else {
    console.log(`   ⏩ Pro price already exists: ${proPrice.id} ($12/month)`);
  }

  if (!studioPrice) {
    studioPrice = await stripe.prices.create({
      product: studioProduct.id,
      unit_amount: 2900, // $29.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
      },
      metadata: {
        plan: 'studio',
      },
      nickname: 'Studio Monthly',
    });
    console.log(`   ✅ Created Studio price: ${studioPrice.id} ($29/month)`);
  } else {
    console.log(`   ⏩ Studio price already exists: ${studioPrice.id} ($29/month)`);
  }

  // ─── Step 3: Create Customer Portal Configuration ─────────────────────

  console.log('');
  console.log('🚪 Configuring Customer Portal...');

  const existingConfigs = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 5,
  });

  // Check if we have a config that includes our prices
  let portalConfig = existingConfigs.data[0]; // Use first active config if it exists

  if (!portalConfig) {
    portalConfig = await stripe.billingPortal.configurations.create({
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
        subscription_pause: {
          enabled: false,
        },
        subscription_update: {
          enabled: true,
          default_allowed_updates: ['price', 'promotion_code'],
          products: [
            {
              product: proProduct.id,
              prices: [proPrice.id],
            },
            {
              product: studioProduct.id,
              prices: [studioPrice.id],
            },
          ],
        },
      },
    });
    console.log(`   ✅ Created portal configuration: ${portalConfig.id}`);
  } else {
    console.log(`   ⏩ Portal configuration already exists: ${portalConfig.id}`);
  }

  // ─── Step 4: Create Webhook Endpoint ──────────────────────────────────

  console.log('');
  console.log('🔗 Setting up webhook endpoint...');

  const webhookUrl = `${process.env.NEXTAUTH_URL || 'https://instod.vercel.app'}/api/stripe/webhook`;

  const existingWebhooks = await stripe.webhookEndpoints.list({
    limit: 100,
  });

  let webhook = existingWebhooks.data.find(
    (w) => w.url === webhookUrl
  );

  if (!webhook) {
    webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_failed',
        'customer.subscription.trial_will_end',
      ],
      metadata: {
        app: 'interior-studio',
      },
    });
    console.log(`   ✅ Created webhook endpoint: ${webhook.id}`);
    console.log(`   📍 URL: ${webhookUrl}`);
  } else {
    console.log(`   ⏩ Webhook endpoint already exists: ${webhook.id}`);
    console.log(`   📍 URL: ${webhookUrl}`);
  }

  // ─── Output Environment Variables ─────────────────────────────────────

  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🎉 Stripe setup complete! Add these to your .env file:');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=${proPrice.id}`);
  console.log(`  NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID=${studioPrice.id}`);
  console.log(`  STRIPE_WEBHOOK_SECRET=${webhook.secret}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log('  Next steps:');
  console.log('');
  console.log('  1. Add the above values to your .env file');
  console.log('  2. For Vercel: also add them in Project Settings → Environment Variables');
  console.log('  3. Run: npx prisma migrate deploy (if not already)');
  console.log('  4. Run: npx tsx prisma/seed-plans.ts (to seed plan configs)');
  console.log('  5. Deploy or restart your dev server');
  console.log('');

  if (IS_LIVE) {
    console.log('  ⚠️  You are using LIVE keys. Real payments will be processed.');
    console.log('  ⚠️  Make sure to test with test keys first!');
  } else {
    console.log('  💡 You are using TEST keys. Use test card: 4242 4242 4242 4242');
    console.log('  💡 For production, re-run this script with a live key (sk_live_...)');
  }

  console.log('');

  // ─── Also update the .env file automatically ──────────────────────────

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  const updates: Record<string, string> = {
    'NEXT_PUBLIC_STRIPE_PRO_PRICE_ID': proPrice.id,
    'NEXT_PUBLIC_STRIPE_STUDIO_PRICE_ID': studioPrice.id,
    'STRIPE_WEBHOOK_SECRET': webhook.secret,
  };

  let updated = false;
  for (let i = 0; i < lines.length; i++) {
    for (const [key, value] of Object.entries(updates)) {
      if (lines[i].startsWith(`${key}=`)) {
        lines[i] = `${key}=${value}`;
        delete updates[key];
        updated = true;
      }
    }
  }

  // Add any missing keys
  for (const [key, value] of Object.entries(updates)) {
    lines.push(`${key}=${value}`);
    updated = true;
  }

  if (updated) {
    fs.writeFileSync(envPath, lines.join('\n'));
    console.log('  ✅ .env file updated automatically!');
  }

  console.log('');
}

main().catch((err) => {
  console.error('❌ Setup failed:', err);
  process.exit(1);
});
