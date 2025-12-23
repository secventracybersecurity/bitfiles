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
 * P = Σ (valid shard combinations) Π(p_i)
 */
export function calculateRecoveryProbability(
  availableShardIndices: number[],
  manifest: APEMManifest
): number {
  const currentWeight = availableShardIndices.reduce(
    (acc, idx) => acc + (manifest.shardWeights[idx] || 0), 
    0
  );

  // In APEM, if current weight < minimum, recovery is mathematically impossible
  if (currentWeight < manifest.minimumRequiredWeight) return 0;

  // Probability calculation based on node uptime snapshots
  // For simplicity in this primitive, we return the joint probability of the available set
  let p = 1;
  for (const idx of availableShardIndices) {
    const nodeId = Object.keys(manifest.nodeReliabilitySnapshot)[idx % Object.keys(manifest.nodeReliabilitySnapshot).length];
    p *= (manifest.nodeReliabilitySnapshot[nodeId] || 0.99);
  }
  
  return p;
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
