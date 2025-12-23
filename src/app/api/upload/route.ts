import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const filename = formData.get('filename') as string;

    if (!file || !filename) {
      return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadDir = path.join(process.cwd(), 'uploads');
    
    // Ensure directory exists (though we already ran mkdir -p)
    await fs.mkdir(uploadDir, { recursive: true });

    // Save the encrypted file
    // We append a timestamp or use a unique ID to prevent collisions
    const safeFilename = `${Date.now()}-${filename}`;
    const filePath = path.join(uploadDir, safeFilename);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({ 
      success: true, 
      message: 'Encrypted file stored successfully',
      path: safeFilename 
    });
  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
