'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  BarChart3,
  CheckCircle2,
  Clock,
  LogOut,
  Upload,
  Plus,
  Trash2,
  Edit,
  Save,
  Lock,
  MessageSquareWarning,
  Sliders,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

interface Stats {
  total_sessions: number;
  unique_visitors: number;
  total_questions_solved: number;
  total_question_attempts: number;
  question_reports_count: number;
  contribution_clicks: number;
  email_submissions: number;
}

interface QuestionReport {
  id: string;
  question_id: string;
  branch: string;
  year?: number | string;
  section_name?: string;
  subtopic_name?: string;
  reason: string;
  message?: string;
  created_at: string;
  status: 'pending' | 'resolved';
}

interface Supporter {
  id: string;
  name: string;
  comment: string;
  amount: number | string;
  date?: string;
}

interface ContributionConfig {
  heading: string;
  subtitle: string;
  upi_id: string;
  qr_image_url: string;
  supporters: Supporter[];
}

interface PopupConfig {
  enabled: boolean;
  image_url: string;
  button_text: string;
  question_threshold: number;
}

export function AdminDashboardClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'reports' | 'contribution' | 'popup'>('stats');

  // Stats & Reports state
  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);

  // Contribution page config state
  const [contributionConfig, setContributionConfig] = useState<ContributionConfig | null>(null);
  const [isSavingContribution, setIsSavingContribution] = useState(false);
  const [contributionMsg, setContributionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingQr, setIsUploadingQr] = useState(false);

  // Supporter modal / edit state
  const [editingSupporter, setEditingSupporter] = useState<Supporter | null>(null);
  const [isSupporterModalOpen, setIsSupporterModalOpen] = useState(false);

  // Popup config state
  const [popupConfig, setPopupConfig] = useState<PopupConfig | null>(null);
  const [isSavingPopup, setIsSavingPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUploadingPopupImg, setIsUploadingPopupImg] = useState(false);

  // 1. Check authentication status on mount
  useEffect(() => {
    fetch('/api/admin/login')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // 2. Fetch dashboard data when authenticated
  const loadDashboardData = async () => {
    setIsLoadingDashboard(true);
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setReports(data.reports || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadContributionConfig = async () => {
    try {
      const res = await fetch('/api/admin/contribution');
      if (res.ok) {
        const data = await res.json();
        setContributionConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadPopupConfig = async () => {
    try {
      const res = await fetch('/api/admin/popup');
      if (res.ok) {
        const data = await res.json();
        setPopupConfig(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
      loadContributionConfig();
      loadPopupConfig();
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput('');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Failed to connect to authentication server');
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await fetch('/api/admin/login', { method: 'DELETE' });
    setIsAuthenticated(false);
  };

  // Handle Report Status update
  const handleToggleReportStatus = async (reportId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'resolved' ? 'pending' : 'resolved';
    try {
      const res = await fetch('/api/admin/dashboard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ report_id: reportId, status: nextStatus }),
      });
      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r.id === reportId ? { ...r, status: nextStatus as 'pending' | 'resolved' } : r))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Image Upload Helper
  const uploadImageFile = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return data.url;
    } else {
      const err = await res.json();
      alert(err.error || 'Upload failed');
      return null;
    }
  };

  // Handle QR upload
  const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !contributionConfig) return;
    setIsUploadingQr(true);
    const url = await uploadImageFile(file);
    if (url) {
      setContributionConfig({ ...contributionConfig, qr_image_url: url });
    }
    setIsUploadingQr(false);
  };

  // Handle Popup image upload
  const handlePopupImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !popupConfig) return;
    setIsUploadingPopupImg(true);
    const url = await uploadImageFile(file);
    if (url) {
      setPopupConfig({ ...popupConfig, image_url: url });
    }
    setIsUploadingPopupImg(false);
  };

  // Save Contribution Settings
  const handleSaveContribution = async () => {
    if (!contributionConfig) return;
    setIsSavingContribution(true);
    setContributionMsg(null);
    try {
      const res = await fetch('/api/admin/contribution', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributionConfig),
      });
      if (res.ok) {
        setContributionMsg({ type: 'success', text: 'Contribution page settings saved successfully!' });
      } else {
        const err = await res.json();
        setContributionMsg({ type: 'error', text: err.error || 'Failed to save settings' });
      }
    } catch {
      setContributionMsg({ type: 'error', text: 'Failed to communicate with server' });
    } finally {
      setIsSavingContribution(false);
      setTimeout(() => setContributionMsg(null), 4000);
    }
  };

  // Supporter Management
  const handleOpenAddSupporter = () => {
    setEditingSupporter({
      id: `supporter_${Date.now()}`,
      name: '',
      comment: '',
      amount: '',
      date: new Date().toISOString(),
    });
    setIsSupporterModalOpen(true);
  };

  const handleOpenEditSupporter = (supporter: Supporter) => {
    setEditingSupporter({ ...supporter });
    setIsSupporterModalOpen(true);
  };

  const handleDeleteSupporter = (id: string) => {
    if (!contributionConfig) return;
    if (confirm('Are you sure you want to remove this supporter?')) {
      const updated = contributionConfig.supporters.filter((s) => s.id !== id);
      setContributionConfig({ ...contributionConfig, supporters: updated });
    }
  };

  const handleSaveSupporterModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSupporter || !contributionConfig) return;
    if (!editingSupporter.name.trim() || !editingSupporter.amount) {
      alert('Please provide name and amount');
      return;
    }

    const existingIdx = contributionConfig.supporters.findIndex((s) => s.id === editingSupporter.id);
    let updatedSupporters: Supporter[];

    if (existingIdx >= 0) {
      updatedSupporters = [...contributionConfig.supporters];
      updatedSupporters[existingIdx] = editingSupporter;
    } else {
      updatedSupporters = [editingSupporter, ...contributionConfig.supporters];
    }

    setContributionConfig({ ...contributionConfig, supporters: updatedSupporters });
    setIsSupporterModalOpen(false);
    setEditingSupporter(null);
  };

  // Save Popup Settings
  const handleSavePopup = async () => {
    if (!popupConfig) return;
    setIsSavingPopup(true);
    setPopupMsg(null);
    try {
      const res = await fetch('/api/admin/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(popupConfig),
      });
      if (res.ok) {
        setPopupMsg({ type: 'success', text: 'Contribution popup settings saved successfully!' });
      } else {
        const err = await res.json();
        setPopupMsg({ type: 'error', text: err.error || 'Failed to save popup settings' });
      }
    } catch {
      setPopupMsg({ type: 'error', text: 'Failed to communicate with server' });
    } finally {
      setIsSavingPopup(false);
      setTimeout(() => setPopupMsg(null), 4000);
    }
  };

  // Loading state
  if (isAuthenticated === null) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-black dark:text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
      </div>
    );
  }

  // Login view
  if (!isAuthenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm p-6 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-black dark:border-white">
            <Lock className="w-5 h-5 text-black dark:text-white" />
            <h1 className="text-lg font-extrabold uppercase text-black dark:text-white">
              Admin Access
            </h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Admin Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password"
                className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm text-black dark:text-white focus:outline-none"
                required
              />
            </div>
            {loginError && (
              <p className="text-xs text-red-600 dark:text-red-400 font-bold">{loginError}</p>
            )}
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs uppercase border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 w-full max-w-4xl mx-auto px-4 py-8">
      {/* Top Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-black dark:border-white mb-6">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase text-black dark:text-white">
            OpenMentor Admin Panel
          </h1>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            Manage live platform statistics, reported questions, contribution content & popup rules.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black dark:border-white text-xs font-bold text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase border border-black dark:border-white transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'stats'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
              : 'bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Dashboard Stats
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase border border-black dark:border-white transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'reports'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
              : 'bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
          }`}
        >
          <MessageSquareWarning className="w-3.5 h-3.5" />
          Question Reports ({reports.length})
        </button>
        <button
          onClick={() => setActiveTab('contribution')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase border border-black dark:border-white transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'contribution'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
              : 'bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          Edit Contribution Page
        </button>
        <button
          onClick={() => setActiveTab('popup')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold uppercase border border-black dark:border-white transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'popup'
              ? 'bg-black dark:bg-white text-white dark:text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]'
              : 'bg-white dark:bg-black text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          Contribution Popup Settings
        </button>
      </div>

      {/* Tab 1: Stats */}
      {activeTab === 'stats' && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold uppercase text-black dark:text-white">
              Real Platform Metrics
            </h2>
            <button
              onClick={loadDashboardData}
              disabled={isLoadingDashboard}
              className="text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white cursor-pointer underline"
            >
              {isLoadingDashboard ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Total Sessions
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.total_sessions ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Unique Visitors
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.unique_visitors ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Questions Solved (Correct)
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.total_questions_solved ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Total Question Attempts
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.total_question_attempts ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Question Reports
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.question_reports_count ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Contribution Clicks
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.contribution_clicks ?? 0}
              </p>
            </div>

            <div className="p-4 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]">
              <span className="text-[11px] font-bold uppercase text-neutral-500 dark:text-neutral-400">
                Email Submissions
              </span>
              <p className="text-2xl font-black text-black dark:text-white mt-1">
                {stats?.email_submissions ?? 0}
              </p>
              <span className="text-[10px] text-neutral-400 dark:text-neutral-500 block mt-1">
                (No email signup form active)
              </span>
            </div>
          </div>
        </section>
      )}

      {/* Tab 2: Question Reports */}
      {activeTab === 'reports' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-black dark:border-white">
            <h2 className="text-base font-extrabold uppercase text-black dark:text-white">
              Submitted Question Reports
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black">
              {reports.length} Total
            </span>
          </div>

          {reports.length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-sm text-neutral-500">
              No question reports have been submitted yet.
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className={`p-4 rounded-xl border transition-all ${
                    rep.status === 'resolved'
                      ? 'border-neutral-300 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40 opacity-75'
                      : 'border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-neutral-200 dark:border-neutral-800 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-black dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                        {rep.question_id}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-black dark:bg-white text-white dark:text-black font-semibold text-[10px]">
                        {rep.branch} {rep.year ? `(${rep.year})` : ''}
                      </span>
                      {rep.section_name && (
                        <span className="text-neutral-600 dark:text-neutral-400 truncate max-w-xs">
                          {rep.section_name} {rep.subtopic_name ? `→ ${rep.subtopic_name}` : ''}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(rep.created_at).toLocaleString('en-IN', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </span>
                      <button
                        onClick={() => handleToggleReportStatus(rep.id, rep.status)}
                        className={`px-2.5 py-1 rounded text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                          rep.status === 'resolved'
                            ? 'border-green-600 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40'
                            : 'border-amber-500 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40'
                        }`}
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        {rep.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                      </button>
                    </div>
                  </div>

                  <div className="text-xs">
                    <span className="font-bold text-black dark:text-white">Reason / Feedback:</span>
                    <p className="mt-1 text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                      {rep.message || rep.reason || 'No specific description provided'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Tab 3: Edit Contribution Page */}
      {activeTab === 'contribution' && contributionConfig && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-black dark:border-white">
            <h2 className="text-base font-extrabold uppercase text-black dark:text-white">
              Edit Contribution Page
            </h2>
            <button
              onClick={handleSaveContribution}
              disabled={isSavingContribution}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs uppercase border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingContribution ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>

          {contributionMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-bold border ${
                contributionMsg.type === 'success'
                  ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                  : 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
              }`}
            >
              {contributionMsg.text}
            </div>
          )}

          {/* Form fields */}
          <div className="p-5 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Heading
              </label>
              <input
                type="text"
                value={contributionConfig.heading}
                onChange={(e) => setContributionConfig({ ...contributionConfig, heading: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm text-black dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Subtitle / Supporting Text
              </label>
              <textarea
                value={contributionConfig.subtitle}
                onChange={(e) => setContributionConfig({ ...contributionConfig, subtitle: e.target.value })}
                rows={2}
                className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm text-black dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                UPI ID
              </label>
              <input
                type="text"
                value={contributionConfig.upi_id}
                onChange={(e) => setContributionConfig({ ...contributionConfig, upi_id: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm font-mono text-black dark:text-white focus:outline-none"
              />
            </div>

            {/* Payment QR Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Payment QR Image
              </label>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="relative w-28 h-28 rounded-lg border border-black dark:border-white overflow-hidden bg-white shrink-0 p-1 flex items-center justify-center">
                  <Image
                    src={contributionConfig.qr_image_url || '/openmentor-logo.webp'}
                    alt="Payment QR"
                    fill
                    sizes="112px"
                    className="object-contain p-1"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Upload or replace the UPI Payment QR code. Supported formats: WEBP, PNG, JPG (Max 5MB).
                  </p>
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black dark:border-white text-xs font-bold bg-white dark:bg-black text-black dark:text-white cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingQr ? 'Uploading...' : 'Upload New QR Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleQrUpload}
                      disabled={isUploadingQr}
                      className="hidden"
                    />
                  </label>
                  <div className="text-[11px] font-mono text-neutral-400 break-all">
                    Current: {contributionConfig.qr_image_url}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Supporter Details Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-black dark:border-white">
              <div>
                <h3 className="text-sm font-extrabold uppercase text-black dark:text-white">
                  Supporter Details
                </h3>
                <p className="text-xs text-neutral-500">
                  Manually maintain supporter records. Displayed with name/comment on left, amount on right.
                </p>
              </div>
              <button
                type="button"
                onClick={handleOpenAddSupporter}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-black dark:border-white text-xs font-bold bg-black dark:bg-white text-white dark:text-black cursor-pointer shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Supporter</span>
              </button>
            </div>

            {contributionConfig.supporters.length === 0 ? (
              <div className="p-6 text-center rounded-xl border border-dashed border-neutral-300 dark:border-neutral-700 text-xs text-neutral-500">
                No supporters recorded. Click &ldquo;Add Supporter&rdquo; to add one.
              </div>
            ) : (
              <div className="divide-y divide-neutral-200 dark:divide-neutral-800 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] overflow-hidden">
                {contributionConfig.supporters.map((sup) => (
                  <div
                    key={sup.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-black dark:text-white">
                          {sup.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-neutral-600 dark:text-neutral-400">
                          (₹{sup.amount})
                        </span>
                      </div>
                      {sup.comment && (
                        <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                          &ldquo;{sup.comment}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSupporter(sup)}
                        className="p-1.5 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-black dark:text-white cursor-pointer"
                        title="Edit"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSupporter(sup.id)}
                        className="p-1.5 rounded border border-red-300 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tab 4: Contribution Popup Settings */}
      {activeTab === 'popup' && popupConfig && (
        <section className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-black dark:border-white">
            <h2 className="text-base font-extrabold uppercase text-black dark:text-white">
              Contribution Popup Settings
            </h2>
            <button
              onClick={handleSavePopup}
              disabled={isSavingPopup}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs uppercase border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingPopup ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>

          {popupMsg && (
            <div
              className={`p-3 rounded-lg text-xs font-bold border ${
                popupMsg.type === 'success'
                  ? 'border-green-600 bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-300'
                  : 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
              }`}
            >
              {popupMsg.text}
            </div>
          )}

          <div className="p-5 rounded-xl border border-black dark:border-white bg-white dark:bg-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-xs font-extrabold uppercase text-black dark:text-white block">
                  Popup Status
                </span>
                <span className="text-xs text-neutral-500">
                  Enable or disable the practice-session contribution popup.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPopupConfig({ ...popupConfig, enabled: !popupConfig.enabled })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                  popupConfig.enabled
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-neutral-400 bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                {popupConfig.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            {/* Threshold Setting */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Question Threshold
              </label>
              <input
                type="number"
                min={1}
                max={50}
                value={popupConfig.question_threshold}
                onChange={(e) =>
                  setPopupConfig({
                    ...popupConfig,
                    question_threshold: parseInt(e.target.value, 10) || 5,
                  })
                }
                className="w-full sm:w-48 p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm font-bold text-black dark:text-white focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                Shows the popup after a user completes this many questions in a session (default: 5). Triggered once per session.
              </p>
            </div>

            {/* Button Text */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Button Text
              </label>
              <input
                type="text"
                value={popupConfig.button_text}
                onChange={(e) => setPopupConfig({ ...popupConfig, button_text: e.target.value })}
                placeholder="Contribute Now"
                className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm font-bold text-black dark:text-white focus:outline-none"
              />
            </div>

            {/* Popup Image Upload */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                Popup Image
              </label>
              <p className="text-xs text-neutral-500 mb-3">
                The popup image contains its own artwork and text. Upload or replace the image here.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div className="relative w-40 aspect-[4/3] rounded-lg border border-black dark:border-white overflow-hidden bg-neutral-100 dark:bg-neutral-900 shrink-0">
                  <Image
                    src={popupConfig.image_url || '/openmentor-logo.webp'}
                    alt="Popup Visual"
                    fill
                    sizes="160px"
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-black dark:border-white text-xs font-bold bg-white dark:bg-black text-black dark:text-white cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingPopupImg ? 'Uploading...' : 'Upload New Popup Image'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePopupImageUpload}
                      disabled={isUploadingPopupImg}
                      className="hidden"
                    />
                  </label>
                  <div className="text-[11px] font-mono text-neutral-400 break-all">
                    Current: {popupConfig.image_url}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Supporter Edit / Add Modal */}
      {isSupporterModalOpen && editingSupporter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-xl border border-black dark:border-white bg-white dark:bg-black p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="font-extrabold text-base text-black dark:text-white mb-4 pb-2 border-b border-black dark:border-white">
              {contributionConfig?.supporters.some((s) => s.id === editingSupporter.id)
                ? 'Edit Supporter'
                : 'Add Supporter'}
            </h3>
            <form onSubmit={handleSaveSupporterModal} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                  Name *
                </label>
                <input
                  type="text"
                  value={editingSupporter.name}
                  onChange={(e) => setEditingSupporter({ ...editingSupporter, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                  Comment (Optional)
                </label>
                <input
                  type="text"
                  value={editingSupporter.comment}
                  onChange={(e) => setEditingSupporter({ ...editingSupporter, comment: e.target.value })}
                  placeholder="e.g. Thanks for the free prep portal!"
                  className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm text-black dark:text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1 text-black dark:text-white">
                  Amount (₹) *
                </label>
                <input
                  type="number"
                  value={editingSupporter.amount}
                  onChange={(e) => setEditingSupporter({ ...editingSupporter, amount: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full p-2.5 rounded-lg border border-black dark:border-white bg-white dark:bg-neutral-900 text-sm font-mono text-black dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsSupporterModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs uppercase border border-black dark:border-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] cursor-pointer"
                >
                  Save Supporter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
