import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getContributionConfig, saveContributionConfig, ContributionConfig } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getContributionConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching contribution config:', error);
    return NextResponse.json({ error: 'Failed to fetch contribution config' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: ContributionConfig = await req.json();

    if (!body || typeof body.heading !== 'string' || typeof body.upi_id !== 'string') {
      return NextResponse.json({ error: 'Invalid contribution configuration payload' }, { status: 400 });
    }

    // Ensure supporters is an array with valid fields
    const supporters = Array.isArray(body.supporters)
      ? body.supporters.map((s, idx) => ({
          id: s.id || `supporter_${Date.now()}_${idx}`,
          name: String(s.name || '').trim(),
          comment: String(s.comment || '').trim(),
          amount: typeof s.amount === 'number' || typeof s.amount === 'string' ? s.amount : 0,
          date: s.date || new Date().toISOString(),
        }))
      : [];

    const updatedConfig: ContributionConfig = {
      heading: body.heading.trim(),
      subtitle: (body.subtitle || '').trim(),
      upi_id: body.upi_id.trim(),
      qr_image_url: body.qr_image_url || '/openmentor-logo.webp',
      supporters,
    };

    await saveContributionConfig(updatedConfig);
    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('Error saving contribution config:', error);
    return NextResponse.json({ error: 'Failed to save contribution config' }, { status: 500 });
  }
}
