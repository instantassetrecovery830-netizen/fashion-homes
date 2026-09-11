/**
 * Utility functions for Tiered Commission Splits
 * 
 * Platform Fee Rates:
 * - Atelier: 15% commission
 * - Couture: 10% commission
 * - Maison: 5% commission
 * - Standard / Default: 15% commission
 */

export interface CommissionBreakdown {
  gross: number;
  rate: number;
  ratePercentStr: string;
  commissionFee: number;
  netEarnings: number;
}

export function getCommissionRate(plan?: string): number {
  if (!plan) return 0.15;
  const p = plan.trim().toUpperCase();
  if (p === 'MAISON') return 0.05;  // 5% Maison tier
  if (p === 'COUTURE') return 0.10; // 10% Couture tier
  if (p === 'ATELIER') return 0.15; // 15% Atelier tier
  return 0.15;                      // 15% Standard / Default
}

export function getCommissionPercent(plan?: string): string {
  const rate = getCommissionRate(plan);
  return `${(rate * 100).toFixed(0)}%`;
}

export function calculateCommissionBreakdown(grossAmount: number, plan?: string): CommissionBreakdown {
  const rate = getCommissionRate(plan);
  const commissionFee = grossAmount * rate;
  const netEarnings = grossAmount - commissionFee;

  return {
    gross: grossAmount,
    rate,
    ratePercentStr: `${(rate * 100).toFixed(0)}%`,
    commissionFee,
    netEarnings
  };
}

export function getPotentialSavingsMessage(grossSales: number, currentPlan?: string): { savingsText: string; savingsAmount: number; targetTier: string } | null {
  const currentRate = getCommissionRate(currentPlan);
  if (currentRate <= 0.05) return null; // Already on lowest fee tier (Maison)

  let targetTier = 'Maison';
  let targetRate = 0.05;

  if (currentRate === 0.15) {
    targetTier = 'Couture';
    targetRate = 0.10;
  }

  const currentFee = grossSales * currentRate;
  const targetFee = grossSales * targetRate;
  const savingsAmount = currentFee - targetFee;

  if (savingsAmount <= 0) {
    return {
      savingsText: `Upgrade to ${targetTier} to lower your platform fee to ${(targetRate * 100).toFixed(0)}%.`,
      savingsAmount: 0,
      targetTier
    };
  }

  return {
    savingsText: `Upgrading to ${targetTier} (${(targetRate * 100).toFixed(0)}% fee) would save you ${savingsAmount.toFixed(2)} in commission!`,
    savingsAmount,
    targetTier
  };
}
