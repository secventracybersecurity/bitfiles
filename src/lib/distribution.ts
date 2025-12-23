import { supabase } from './supabase';
import { generateParity } from './apem';

export interface Node {
  id: string;
  ip_address: string;
  reliability_score: number;
}

export async function getOptimalNodes(count: number): Promise<Node[]> {
  const { data, error } = await supabase
    .from('nodes')
    .select('id, ip_address, reliability_score')
    .eq('is_active', true)
    .order('reliability_score', { ascending: false })
    .limit(count);

  if (error) throw error;
  return data || [];
}

/**
 * STEP-5: Adaptive Probabilistic Distribution
 * Generates parity based on node reliability and distributes across optimal nodes.
 */
export async function distributeShards(fileId: string, shards: Blob[], nodes: Node[]) {
  // 1. Determine optimal redundancy (APEM logic)
  // Higher node failure rate = more parity shards
  const avgReliability = nodes.reduce((acc, n) => acc + n.reliability_score, 0) / nodes.length;
  const parityCount = avgReliability < 0.9 ? 2 : 1; 
  
  const parityShards = [];
  for (let i = 0; i < parityCount; i++) {
    parityShards.push(await generateParity(shards));
  }
  
  const allShards = [...shards, ...parityShards];

  // 2. Map shards to nodes
  const shardPromises = allShards.map(async (shard, index) => {
    const isParity = index >= shards.length;
    const node = nodes[index % nodes.length];
    const shardHash = await calculateHash(shard);
    
    const { error } = await supabase
      .from('shards')
      .insert({
        file_id: fileId,
        node_id: node.id,
        shard_index: index,
        shard_hash: shardHash,
        size: shard.size,
        is_parity: isParity
      });

    if (error) throw error;
    
    // Probabilistic logging for Step-5++
    console.log(`[APEM] ${isParity ? 'Parity' : 'Data'} Shard ${index} secured on node ${node.id} (p=${node.reliability_score})`);
  });

  await Promise.all(shardPromises);
}

async function calculateHash(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
