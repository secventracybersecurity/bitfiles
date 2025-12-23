import { supabase } from './supabase';

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

export async function distributeShards(fileId: string, shards: Blob[], nodes: Node[]) {
  const shardPromises = shards.map(async (shard, index) => {
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
        is_parity: false // Logic for parity flag can be added if needed
      });

    if (error) throw error;
    
    // In a real system, we would actually transfer the blob to the node here
    // For now, we simulate the metadata record
    console.log(`Shard ${index} distributed to node ${node.id}`);
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
