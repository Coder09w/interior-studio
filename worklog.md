---
Task ID: 1
Agent: Main Agent
Task: Build comprehensive pricing, plan enforcement, and payment system

Work Log:
- Created centralized plan config (src/lib/plans.ts) with PlanKey type, PLAN_CONFIG, feature flags, limits, and helper functions
- Updated Prisma schema: changed plan field from String to Plan enum, added Subscription model
- Ran prisma migrate dev to apply changes to Neon PostgreSQL
- Built plan enforcement utilities (src/lib/plan-enforcement.ts) with checkProjectLimit, checkRoomLimit, checkFurnitureLimit, checkFeature, checkRoomType, checkLightingMood, checkCustomDimensions, getUsageStats
- Installed Stripe package and built payment integration:
  - /api/stripe/checkout - creates checkout sessions or dev-mode direct upgrades
  - /api/stripe/webhook - handles checkout.session.completed, subscription.updated, subscription.deleted, invoice.payment_failed
  - /api/stripe/portal - creates Stripe customer portal sessions
- Added /api/plan/usage - returns comprehensive usage stats (projects, rooms, furniture counts vs limits)
- Added /api/user/subscription - returns subscription status data
- Added /api/plan/cancel - cancels subscription (cancel_at_period_end for Stripe, immediate for dev mode)
- Updated /api/projects/route.ts to use centralized plan enforcement + room type validation
- Updated /api/rooms/route.ts to enforce room-per-project limits + room type gating
- Updated auth.ts with proper PlanKey typing for JWT/session
- Redesigned pricing page with:
  - Plan icons (Sofa/Zap/Building2), key limits summary boxes
  - Feature comparison toggle (full matrix with check/lock icons)
  - Stripe checkout integration with dev-mode fallback
  - "Current Plan" badge for logged-in users, error handling
- Updated dashboard with:
  - Plan badge in navbar (clickable, shows upgrade path)
  - Usage progress bars (projects, rooms/project, furniture/room)
  - Upgrade banner for free users approaching limits
  - Upgrade Plan dropdown menu item
  - Better 403 handling when project limit reached
- Added Billing tab to profile page with:
  - Current plan card with features summary
  - Upgrade button / Manage Subscription + Cancel buttons
  - Subscription status indicator (active/canceling)
  - Cancel confirmation with warning about data limits
  - Compare plans link
- Created upgrade-prompt.tsx component with:
  - UpgradePrompt (full banner with upgrade CTA)
  - FeatureGate (overlay wrapper that dims content and shows lock)
- Updated .env and .env.example with Stripe variables
- Fixed all TypeScript errors (Stripe types, null limits, auth types)
- Ran tsc --noEmit with zero errors

Stage Summary:
- Full pricing system with 3 tiers: Free ($0), Pro ($12/mo), Studio ($29/mo)
- Server-side enforcement of project count, rooms per project, furniture per room, room types, lighting moods
- Stripe integration for production payments with graceful dev-mode fallback
- Usage tracking API with progress indicators in dashboard
- Billing management in profile (upgrade, cancel, view subscription)
- Feature gate components reusable across the app
- All TypeScript clean, zero compilation errors
