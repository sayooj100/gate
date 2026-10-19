import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const COOKIE_NAME = 'admin_session';

function getAdminSecret(): string {
  return process.env.ADMIN_SECRET_KEY || 'openmentor-admin-default-secret-change-in-prod';
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || 'openmentor2026';
}

export function createAdminToken(): string {
  const secret = getAdminSecret();
  const timestamp = Date.now().toString();
  const hmac = crypto.createHmac('sha256', secret).update(timestamp).digest('hex');
  return `${timestamp}.${hmac}`;
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [timestampStr, providedHmac] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  // Session valid for 7 days
  const maxAge = 7 * 24 * 60 * 60 * 1000;
  if (Date.now() - timestamp > maxAge) return false;

  const secret = getAdminSecret();
  const expectedHmac = crypto.createHmac('sha256', secret).update(timestampStr).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(providedHmac), Buffer.from(expectedHmac));
  } catch {
    return false;
  }
}

export function isAdminAuthenticated(req: NextRequest): boolean {
  const cookie = req.cookies.get(COOKIE_NAME);
  return verifyAdminToken(cookie?.value);
}

export function setAdminCookie(response: NextResponse, token: string): void {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearAdminCookie(response: NextResponse): void {
  response.cookies.delete(COOKIE_NAME);
}
