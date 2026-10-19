import { NextRequest, NextResponse } from 'next/server';
import { recordAnalyticsEvent, EventPayload } from '@/lib/analyticsStore';

export async function POST(req: NextRequest) {
  try {
    const body: EventPayload = await req.json();

    if (!body || !body.type) {
      return NextResponse.json({ error: 'Event type is required' }, { status: 400 });
    }

    const validTypes = [
      'session_start',
      'question_attempt',
      'question_solved',
      'contribution_click',
      'email_submission',
    ];

    if (!validTypes.includes(body.type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    await recordAnalyticsEvent(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking analytics event:', error);
    return NextResponse.json({ error: 'Failed to record event' }, { status: 500 });
  }
}
