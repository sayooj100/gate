import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getContributionPopupConfig, saveContributionPopupConfig, ContributionPopupConfig } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const config = await getContributionPopupConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching popup config for admin:', error);
    return NextResponse.json({ error: 'Failed to fetch popup config' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body: Partial<ContributionPopupConfig> = await req.json();

    const threshold = typeof body.question_threshold === 'number' && body.question_threshold > 0
      ? body.question_threshold
      : 5;

    const updatedConfig: ContributionPopupConfig = {
      enabled: Boolean(body.enabled),
      image_url: body.image_url?.trim() || '/openmentor-logo.webp',
      button_text: body.button_text?.trim() || 'Contribute Now',
      question_threshold: threshold,
    };

    await saveContributionPopupConfig(updatedConfig);
    return NextResponse.json({ success: true, config: updatedConfig });
  } catch (error) {
    console.error('Error saving popup config:', error);
    return NextResponse.json({ error: 'Failed to save popup config' }, { status: 500 });
  }
}
