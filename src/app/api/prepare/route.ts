import { NextRequest, NextResponse } from 'next/server';
import { prepareFileChunks } from '@/lib/chunking';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;
    const mimeType = formData.get('mimeType') as string;
    const chunkSizeStr = formData.get('chunkSize') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const chunkSize = chunkSizeStr ? parseInt(chunkSizeStr, 10) : undefined;

    const manifest = await prepareFileChunks(
      buffer,
      filename || file.name,
      mimeType || file.type,
      chunkSize
    );

    return NextResponse.json(manifest);
  } catch (error: any) {
    console.error('Chunking API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
