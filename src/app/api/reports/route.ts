import { NextRequest, NextResponse } from 'next/server';
import { addQuestionReport } from '@/lib/serverStorage';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.question_id || !body.reason) {
      return NextResponse.json({ error: 'question_id and reason are required' }, { status: 400 });
    }

    const report = await addQuestionReport({
      question_id: String(body.question_id),
      branch: String(body.branch || 'BM'),
      year: body.year,
      section_name: body.section_name,
      subtopic_name: body.subtopic_name,
      reason: String(body.reason),
      message: body.message ? String(body.message) : undefined,
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error('Error creating question report:', error);
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }
}
