import type { Metadata } from 'next';
import { AdminDashboardClient } from '@/components/AdminDashboardClient';

export const metadata: Metadata = {
  title: 'OpenMentor Admin Panel',
  description: 'Private administration panel for OpenMentor',
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminDashboardClient />;
}
