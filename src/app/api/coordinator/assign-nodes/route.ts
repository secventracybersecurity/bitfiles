import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const { fileId, totalChunks, ownerId } = await req.json();
    const supabase = await createClient();

    // 1. Fetch available nodes
    const { data: nodes, error: nodeError } = await supabase
      .from('nodes')
      .select('id, name, uptime_score')
      .eq('status', 'online')
      .order('uptime_score', { ascending: false });

    if (nodeError || !nodes || nodes.length === 0) {
      return NextResponse.json({ error: 'No available nodes' }, { status: 500 });
    }

    // 2. Simple Round-Robin / Load Balancing assignment
    // For each chunk, assign a node
    const assignments = [];
    for (let i = 0; i < totalChunks; i++) {
      const node = nodes[i % nodes.length];
      assignments.push({
        chunkIndex: i,
        nodeId: node.id,
        nodeName: node.name
      });
    }

    return NextResponse.json({ assignments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
