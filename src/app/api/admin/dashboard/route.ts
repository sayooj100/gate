import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAnalyticsStore } from '@/lib/analyticsStore';
import { getQuestionReports, updateReportStatus } from '@/lib/serverStorage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const analytics = await getAnalyticsStore();
    const reports = await getQuestionReports();

    const stats = {
      total_sessions: analytics.counts.total_sessions,
      unique_visitors: analytics.unique_visitors.length,
      total_questions_solved: analytics.counts.total_questions_solved,
      total_question_attempts: analytics.counts.total_question_attempts,
      question_reports_count: reports.length,
      contribution_clicks: analytics.counts.contribution_clicks,
      email_submissions: analytics.counts.email_submissions,
    };

    return NextResponse.json({
      stats,
      reports,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { report_id, status } = await req.json();

    if (!report_id || !['pending', 'resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid report_id or status' }, { status: 400 });
    }

    const updated = await updateReportStatus(report_id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Report marked as ${status}` });
  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Failed to update report' }, { status: 500 });
  }
}
