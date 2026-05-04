import { createHash } from 'crypto';

export function makeToken(password: string): string {
  const secret = process.env.ADMIN_SECRET ?? 'filarmonica-secret-2024';
  return createHash('sha256').update(password + secret).digest('hex');
}

export function verifyToken(token: string): boolean {
  const pwd = process.env.ADMIN_PASSWORD;
  if (!pwd) return false;
  return token === makeToken(pwd);
}
