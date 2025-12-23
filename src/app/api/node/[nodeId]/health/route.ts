import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  req: NextRequest,
  { params }: { params: { nodeId: string } }
) {
  try {
    const { nodeId } = params;
    const supabase = await createClient();
    
    // Get node name from DB
    const { data: node, error } = await supabase
      .from('nodes')
      .select('name, status')
      .eq('id', nodeId)
      .single();

    if (error || !node) {
      return NextResponse.json({ status: 'unknown', error: 'Node not found' }, { status: 404 });
    }

    // Check if the physical storage directory exists as a proxy for "running"
    const nodeDir = path.join(process.cwd(), 'storage', 'nodes', node.name);
    try {
      await fs.access(nodeDir);
      return NextResponse.json({ 
        status: node.status, 
        nodeId, 
        nodeName: node.name,
        storagePath: nodeDir,
        healthy: node.status === 'online'
      });
    } catch {
      return NextResponse.json({ 
        status: 'offline', 
        nodeId, 
        nodeName: node.name,
        healthy: false,
        error: 'Storage directory inaccessible'
      });
    }
  } catch (error: any) {
    return NextResponse.json({ status: 'error', error: error.message }, { status: 500 });
  }
}
