import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;
    const formData = await req.formData();
    const chunk = formData.get('chunk') as Blob;
    const fileId = formData.get('fileId') as string;
    const chunkIndex = formData.get('chunkIndex') as string;
    const chunkHash = formData.get('chunkHash') as string;
    const nodeName = formData.get('nodeName') as string; // We use nodeName to find the directory for the demo

    if (!chunk || !fileId || !chunkIndex) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());
    
    const supabase = await createClient();
    const { data: node } = await supabase.from('nodes').select('status, name').eq('id', nodeId).single();

    if (!node || node.status !== 'online') {
      return NextResponse.json({ error: 'Node is offline or decommissioned' }, { status: 503 });
    }

    const nodeDir = path.join(process.cwd(), 'storage', 'nodes', node.name);
    await fs.mkdir(nodeDir, { recursive: true });

    const chunkFilename = `${fileId}_${chunkIndex}.shard`;
    const filePath = path.join(nodeDir, chunkFilename);
    await fs.writeFile(filePath, buffer);

    // Update AI Metrics (Background)
    updateNodeEarnings(nodeId).catch(console.error);

    await supabase.from('shards').insert({
      file_id: fileId,
      node_id: nodeId,
      shard_index: parseInt(chunkIndex),
      shard_hash: chunkHash,
      size: buffer.length
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Node ${params.nodeId} Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;
    const formData = await req.formData();
    const chunk = formData.get('chunk') as Blob;
    const fileId = formData.get('fileId') as string;
    const chunkIndex = formData.get('chunkIndex') as string;
    const chunkHash = formData.get('chunkHash') as string;
    const nodeName = formData.get('nodeName') as string; // We use nodeName to find the directory for the demo

    if (!chunk || !fileId || !chunkIndex) {
      return NextResponse.json({ error: 'Missing data' }, { status: 400 });
    }

    const buffer = Buffer.from(await chunk.arrayBuffer());
    
    const supabase = await createClient();
    const { data: node } = await supabase.from('nodes').select('status, name').eq('id', nodeId).single();

    if (!node || node.status !== 'online') {
      return NextResponse.json({ error: 'Node is offline or decommissioned' }, { status: 503 });
    }

    const nodeDir = path.join(process.cwd(), 'storage', 'nodes', node.name);
    await fs.mkdir(nodeDir, { recursive: true });

    const chunkFilename = `${fileId}_${chunkIndex}.shard`;
    const filePath = path.join(nodeDir, chunkFilename);
    await fs.writeFile(filePath, buffer);

    // Update AI Metrics (Background)
    updateNodeEarnings(nodeId).catch(console.error);

    await supabase.from('shards').insert({
      file_id: fileId,
      node_id: nodeId,
      shard_index: parseInt(chunkIndex),
      shard_hash: chunkHash,
      size: buffer.length
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(`Node ${params.nodeId} Error:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

async function updateNodeEarnings(nodeId: string) {
  const { createClient } = await import("@/lib/supabase-server");
  const supabase = await createClient();

  // Increment earnings on successful upload (AI-driven calculation)
  const { data } = await supabase
    .from('node_metrics')
    .select('earnings_today, earnings_total')
    .eq('node_id', nodeId)
    .single();

  if (data) {
    await supabase
      .from('node_metrics')
      .update({
        earnings_today: data.earnings_today + 0.05, // AI fee per shard
        earnings_total: data.earnings_total + 0.05,
        request_count: 1 // In a real app we'd increment this
      })
      .eq('node_id', nodeId);
  }
}
