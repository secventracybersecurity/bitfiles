import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      id,
      owner_id,
      name,
      mime_type,
      size,
      total_chunks,
      encryption_iv,
      encryption_salt,
      encryption_method
    } = body;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('files')
      .insert({
        id,
        owner_id,
        name,
        mime_type,
        size,
        total_chunks,
        encryption_iv,
        encryption_salt,
        encryption_method,
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
