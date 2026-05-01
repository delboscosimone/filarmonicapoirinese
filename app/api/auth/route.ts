import { NextRequest, NextResponse } from 'next/server';
import { makeToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json({ error: 'Admin non configurato. Imposta ADMIN_PASSWORD nelle variabili d\'ambiente.' }, { status: 503 });
    }

    if (!password || password !== adminPassword) {
      return NextResponse.json({ error: 'Password errata' }, { status: 401 });
    }

    const token = makeToken(password);
    const response = NextResponse.json({ success: true });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 giorni
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Errore server' }, { status: 500 });
  }
}
