import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAuth(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value;
  return token ? verifyToken(token) : false;
}

// PUT — update section
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const body = await request.json();
  const { title, slug, description, type, links, thumbnail_url, event_date, is_published } = body;

  if (slug && !/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Slug non valido' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('media_sections')
    .update({
      ...(title !== undefined && { title }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(type !== undefined && { type }),
      ...(links !== undefined && { links }),
      ...(thumbnail_url !== undefined && { thumbnail_url }),
      ...(event_date !== undefined && { event_date }),
      ...(is_published !== undefined && { is_published }),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE — remove section
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const { error } = await supabaseAdmin
    .from('media_sections')
    .delete()
    .eq('id', params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
