import { supabase } from './supabase';

export interface EarningsFactors {
  storageGB: number;
  uptimeHours: number;
  reliabilityScore: number;
  diversityFactor: number;
}

/**
 * PIFM++ (Multiplicative Contribution Model)
 * Formula: Reward = BaseRate * (Storage * Uptime * Reliability * Diversity)
 */
export function calculatePIFMReward(factors: EarningsFactors): number {
  const BASE_RATE = 0.05; // Base rate in currency units per unit
  
  const score = 
    factors.storageGB * 
    (factors.uptimeHours / 720) * // Normalized to month
    factors.reliabilityScore * 
    factors.diversityFactor;
    
  return score * BASE_RATE;
}

export async function processNodeRewards() {
  const { data: nodes, error } = await supabase
    .from('nodes')
    .select('*')
    .eq('is_active', true);

  if (error) throw error;

  const rewardPromises = nodes.map(async (node) => {
    const reward = calculatePIFMReward({
      storageGB: (node.storage_capacity - node.storage_available) / (1024 * 1024 * 1024),
      uptimeHours: node.uptime_seconds / 3600,
      reliabilityScore: Number(node.reliability_score),
      diversityFactor: 1.2 // Placeholder for network diversity factor
    });

    if (reward > 0) {
      // Record earnings
      const { error: earnError } = await supabase
        .from('earnings')
        .insert({
          node_id: node.id,
          amount: reward,
          reason: 'storage_reward',
          period_start: new Date(Date.now() - 3600000).toISOString(),
          period_end: new Date().toISOString()
        });

      if (earnError) console.error('Error recording earnings:', earnError);

      // Update total earnings in profile
      const { error: profileError } = await supabase.rpc('increment_earnings', {
        user_id: node.owner_id,
        amount: reward
      });

      if (profileError) console.error('Error updating profile earnings:', profileError);
    }
  });

  await Promise.all(rewardPromises);
}
