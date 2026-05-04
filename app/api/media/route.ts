import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';

function isAuth(req: NextRequest) {
  const token = req.cookies.get('admin-token')?.value;
  return token ? verifyToken(token) : false;
}

// GET — all sections (admin: all, public: only published)
export async function GET(request: NextRequest) {
  const all = isAuth(request);
  const { data, error } = await supabaseAdmin
    .from('media_sections')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const sections = all ? data : data?.filter((s) => s.is_published);
  return NextResponse.json(sections ?? []);
}

// POST — create new section (admin only)
export async function POST(request: NextRequest) {
  if (!isAuth(request)) return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });

  const body = await request.json();
  const { title, slug, description, type, links, thumbnail_url, event_date, is_published } = body;

  if (!title || !slug) return NextResponse.json({ error: 'title e slug sono obbligatori' }, { status: 400 });

  // Slug validation
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Lo slug può contenere solo lettere minuscole, numeri e trattini' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('media_sections')
    .insert({
      title,
      slug,
      description: description ?? null,
      type: type ?? 'misto',
      links: links ?? [],
      thumbnail_url: thumbnail_url ?? null,
      event_date: event_date ?? null,
      is_published: is_published ?? true,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Slug già in uso. Scegli uno slug diverso.' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
