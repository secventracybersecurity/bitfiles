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
    const fileId = req.nextUrl.searchParams.get('fileId');
    const chunkIndex = req.nextUrl.searchParams.get('chunkIndex');

    if (!fileId || !chunkIndex) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: node } = await supabase.from('nodes').select('name, status').eq('id', nodeId).single();
    
    if (!node) return NextResponse.json({ error: 'Node not found' }, { status: 404 });
    if (node.status !== 'online') return NextResponse.json({ error: 'Node is currently offline' }, { status: 503 });

    const filePath = path.join(process.cwd(), 'storage', 'nodes', node.name, `${fileId}_${chunkIndex}.shard`);
    const buffer = await fs.readFile(filePath);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/octet-stream',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
