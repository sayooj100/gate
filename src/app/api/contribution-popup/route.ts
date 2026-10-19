import { NextResponse } from 'next/server';
import { getContributionPopupConfig } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const config = await getContributionPopupConfig();
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error fetching popup config:', error);
    return NextResponse.json(
      { enabled: false, image_url: '/openmentor-logo.webp', button_text: 'Contribute Now', question_threshold: 5 },
      { status: 500 }
    );
  }
}
