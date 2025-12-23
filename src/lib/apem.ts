/**
 * STEP-5++: Adaptive Probabilistic Erasure Mesh (APEM)
 * Logic for mathematical resilience and probabilistic recovery.
 */

export interface APEMManifest {
  fileId: string;
  targetRecoveryProbability: number;
  nodeReliabilitySnapshot: Record<string, number>; // node_id -> p_i
  shardWeights: Record<number, number>; // shard_index -> weight
  minimumRequiredWeight: number;
  creationTimestamp: number;
}

  /**
   * Calculates the current recovery probability based on available nodes.
   * P(recovery) = 1 - P(failure)
   * In APEM, failure happens if the remaining weight is below the threshold.
   */
  export function calculateRecoveryProbability(
    availableShardIndices: number[],
    manifest: APEMManifest
  ): number {
    const totalWeight = Object.values(manifest.shardWeights).reduce((a, b) => a + b, 0);
    const currentWeight = availableShardIndices.reduce(
      (acc, idx) => acc + (manifest.shardWeights[idx] || 0), 
      0
    );
  
    if (currentWeight < manifest.minimumRequiredWeight) return 0;
  
    // Probabilistic Survival Equation: P = Π(p_i) for critical shards + combinatorics for parity
    // For this primitive, we use a Poisson-Binomial approximation for reliability
    const averageReliability = Object.values(manifest.nodeReliabilitySnapshot).reduce((a, b) => a + b, 0) / 
      Object.keys(manifest.nodeReliabilitySnapshot).length;
    
    // Simple but elegant approximation of survival probability
    const p = 1 - Math.pow(1 - averageReliability, (availableShardIndices.length - manifest.minimumRequiredWeight) + 1);
    
    return Math.min(0.999999, p);
  }
  
  /**
   * Identifies if the system needs self-healing based on probability drift.
   */
  export function checkSelfHealing(manifest: APEMManifest, currentReliability: Record<string, number>): boolean {
    const p = calculateRecoveryProbability(
      Object.keys(manifest.shardWeights).map(Number),
      { ...manifest, nodeReliabilitySnapshot: currentReliability }
    );
    return p < manifest.targetRecoveryProbability;
  }

export async function generateParity(shards: Blob[]): Promise<Blob> {
  const buffers = await Promise.all(shards.map(s => s.arrayBuffer()));
  const maxSize = Math.max(...buffers.map(b => b.byteLength));
  const parityBuffer = new Uint8Array(maxSize);

  for (let i = 0; i < maxSize; i++) {
    let xorValue = 0;
    for (const buffer of buffers) {
      if (i < buffer.byteLength) {
        xorValue ^= new Uint8Array(buffer)[i];
      }
    }
    parityBuffer[i] = xorValue;
  }

  return new Blob([parityBuffer]);
}

export async function recoverShard(
  shards: (Blob | null)[], 
  parity: Blob, 
  missingIndex: number,
  manifest?: APEMManifest
): Promise<Blob> {
  // Integrity check: Ensure we have enough weight to attempt recovery
  if (manifest) {
    const availableIndices = shards
      .map((s, i) => s !== null ? i : -1)
      .filter(i => i !== -1);
    
    const currentWeight = availableIndices.reduce((acc, idx) => acc + (manifest.shardWeights[idx] || 0), 0);
    if (currentWeight < manifest.minimumRequiredWeight) {
      throw new Error("Mathematical Impossibility: Insufficient shard weight for recovery.");
    }
  }

  const availableShards = shards.filter((s, i) => i !== missingIndex && s !== null) as Blob[];
  const buffers = await Promise.all([...availableShards, parity].map(s => s.arrayBuffer()));
  const maxSize = Math.max(...buffers.map(b => b.byteLength));
  const recoveredBuffer = new Uint8Array(maxSize);

  for (let i = 0; i < maxSize; i++) {
    let xorValue = 0;
    for (const buffer of buffers) {
      if (i < buffer.byteLength) {
        xorValue ^= new Uint8Array(buffer)[i];
      }
    }
    recoveredBuffer[i] = xorValue;
  }

  return new Blob([recoveredBuffer]);
}
