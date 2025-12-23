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
      encrypted_fek,
      fek_iv,
      file_iv
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
        encrypted_fek,
        fek_iv,
        file_iv,
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
