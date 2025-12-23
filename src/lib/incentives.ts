export interface NodeStats {
  storageProvided: number; // in bytes
  uptimeSeconds: number;
  reliabilityScore: number; // 0.0 to 1.0
}

const REWARD_RATE_PER_GB_MONTH = 50; // ₹50 per GB per month
const SECONDS_IN_MONTH = 30 * 24 * 60 * 60;

export function calculateEarnings(stats: NodeStats): number {
  const storageGB = stats.storageProvided / (1024 * 1024 * 1024);
  const uptimeFactor = stats.uptimeSeconds / SECONDS_IN_MONTH;
  
  // PIFM++ logic: penalize low reliability exponentially
  const reliabilityFactor = Math.pow(stats.reliabilityScore, 2);
  
  const earnings = storageGB * REWARD_RATE_PER_GB_MONTH * uptimeFactor * reliabilityFactor;
  return Math.round(earnings * 100) / 100;
}

export function estimateMonthlyEarnings(storageGB: number): number {
  return storageGB * REWARD_RATE_PER_GB_MONTH;
}
