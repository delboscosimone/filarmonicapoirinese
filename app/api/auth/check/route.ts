import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const token = request.cookies.get('admin-token')?.value;
  if (!token) return NextResponse.json({ authenticated: false });
  return NextResponse.json({ authenticated: verifyToken(token) });
}
