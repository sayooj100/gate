import { NextRequest, NextResponse } from 'next/server';
import { getAdminPassword, createAdminToken, setAdminCookie, clearAdminCookie, isAdminAuthenticated } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    const expectedPassword = getAdminPassword();

    if (!password || password !== expectedPassword) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    const token = createAdminToken();
    const res = NextResponse.json({ success: true, message: 'Logged in successfully' });
    setAdminCookie(res, token);
    return res;
  } catch (error) {
    console.error('Error during admin login:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully' });
  clearAdminCookie(res);
  return res;
}

export async function GET(req: NextRequest) {
  const authenticated = isAdminAuthenticated(req);
  return NextResponse.json({ authenticated });
}
