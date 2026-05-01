import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin, supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data } = await supabase.from('site_settings').select('*');
    const settings: Record<string, unknown> = {};
    for (const row of data ?? []) {
      settings[row.key] = row.value;
    }
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json({});
  }
}

export async function PUT(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  try {
    const body = await request.json();
    for (const [key, value] of Object.entries(body)) {
      await supabaseAdmin
        .from('site_settings')
        .upsert({ key, value }, { onConflict: 'key' });
    }
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
