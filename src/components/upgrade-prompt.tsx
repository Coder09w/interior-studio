'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Zap, ChevronRight, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type PlanKey, PLAN_CONFIG, getUpgradePlan, isPlanAtLeast } from '@/lib/plans';

interface UpgradePromptProps {
  /** The feature that's locked */
  feature: string;
  /** Which plan is required (minimum) */
  requiredPlan: PlanKey;
  /** Optional custom message */
  message?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Called when dismissed */
  onDismiss?: () => void;
}

export function UpgradePrompt({
  feature,
  requiredPlan,
  message,
  compact = false,
  onDismiss,
}: UpgradePromptProps) {
  const router = useRouter();
  const [upgrading, setUpgrading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const upgradePlan = PLAN_CONFIG[requiredPlan];
  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: requiredPlan }),
      });

      const data = await res.json();

      if (data.devMode) {
        router.push('/dashboard?upgraded=true');
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback to pricing page
      router.push('/pricing');
    } finally {
      setUpgrading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (compact) {
    return (
      <div
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:opacity-90 transition-opacity"
        style={{ background: '#C17F4E15', color: '#C17F4E' }}
        onClick={handleUpgrade}
      >
        <Lock className="w-3 h-3" />
        <span>{feature} — {upgradePlan.name} only</span>
        <ChevronRight className="w-3 h-3" />
      </div>
    );
  }

  return (
    <div
      className="relative rounded-xl border-2 p-5"
      style={{
        background: 'linear-gradient(135deg, #FFFAF5, #FFF5EB)',
        borderColor: '#C17F4E40',
      }}
    >
      {onDismiss && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3"
          style={{ color: '#5A4E42' }}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: '#C17F4E15' }}
        >
          <Zap className="w-5 h-5" style={{ color: '#C17F4E' }} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm" style={{ color: '#2D2D2D' }}>
            {feature} requires {upgradePlan.name}
          </h4>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: '#5A4E42' }}>
            {message || `Upgrade to ${upgradePlan.name} (${upgradePlan.price === 0 ? 'Free' : `$${upgradePlan.price}/mo`}) to unlock ${feature.toLowerCase()} and more premium features.`}
          </p>
          <Button
            onClick={handleUpgrade}
            disabled={upgrading}
            size="sm"
            className="mt-3 gap-1.5 text-white font-medium"
            style={{ background: 'linear-gradient(135deg, #C17F4E, #A86A3D)' }}
          >
            {upgrading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Upgrading...
              </>
            ) : (
              <>
                Upgrade to {upgradePlan.name}
                <ChevronRight className="w-3.5 h-3.5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature gate wrapper — shows a lock overlay if the feature isn't available.
 * Use this to wrap UI elements that require a certain plan.
 */
interface FeatureGateProps {
  requiredPlan: PlanKey;
  currentPlan: PlanKey;
  feature: string;
  children: React.ReactNode;
  className?: string;
}

export function FeatureGate({
  requiredPlan,
  currentPlan,
  feature,
  children,
  className = '',
}: FeatureGateProps) {
  const hasAccess = isPlanAtLeast(currentPlan, requiredPlan);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Blurred/dimmed content */}
      <div className="pointer-events-none opacity-40 select-none">
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl shadow-sm cursor-pointer hover:shadow-md transition-shadow"
          style={{ background: '#FFFFFF', border: '1px solid #C17F4E40' }}
          onClick={() => window.location.href = '/pricing'}
        >
          <Lock className="w-4 h-4" style={{ color: '#C17F4E' }} />
          <span className="text-xs font-semibold" style={{ color: '#C17F4E' }}>
            {feature} — {PLAN_CONFIG[requiredPlan].name} only
          </span>
          <ChevronRight className="w-3 h-3" style={{ color: '#C17F4E' }} />
        </div>
      </div>
    </div>
  );
}
