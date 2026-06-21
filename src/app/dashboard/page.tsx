'use client';

import React, { useState, useEffect } from 'react';
import LayoutShell from '../../components/LayoutShell';
import Link from 'next/link';
import { useTheme } from '../../context/ThemeContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { interviewApi, atsApi, authApi, api } from '../../lib/api';
import {
  TrendingUp,
  FileCheck,
  Video,
  Award,
  BookOpen,
  ArrowUpRight,
  Clock,
  CheckCircle,
  Briefcase,
  User as UserIcon,
  Lock,
  Key,
  History,
  Trash2,
  Sparkles,
  Zap,
  Eye,
  Download,
  FileText,
  Plus,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';

export default function DashboardPage() {
  const router = useRouter();
  
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridStroke = isDark ? '#334155' : '#E2E8F0';
  const axisStroke = isDark ? '#CBD5E1' : '#475569';
  const tooltipBg = isDark ? '#1E293B' : '#F8FAFC';
  const tooltipBorder = isDark ? '#334155' : '#E2E8F0';
  const tooltipText = isDark ? '#F8FAFC' : '#0F172A';

  const [stats, setStats] = useState({
    totalInterviews: 0,
    avgInterviewScore: 0,
    atsScore: 0,
    resumeUploadCount: 0,
    roadmapCount: 0
  });

  const [interviewHistory, setInterviewHistory] = useState<any[]>([]);
  const [activeRoadmaps, setActiveRoadmaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<string>('All');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Account deletion states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [user, setUser] = useState<any>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  async function loadDashboardData() {
    try {
      const data = await authApi.getDashboardStats();
      
      setStats({
        totalInterviews: data.stats?.totalInterviews || 0,
        avgInterviewScore: data.stats?.avgInterviewScore || 0,
        atsScore: data.stats?.atsScore || 0,
        resumeUploadCount: data.stats?.resumeUploadCount || 0,
        roadmapCount: data.stats?.roadmapCount || 0
      });

      setInterviewHistory(data.interviewHistory || []);
      setActiveRoadmaps(data.activeRoadmaps || []);

      const meData = await authApi.me();
      if (meData.user) {
        setUser(meData.user);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAccount = async () => {
    setDeleteError('');
    setIsDeleting(true);

    try {
      await authApi.deleteAccount({
        password: deleteConfirmPassword
      });
      
      // Clear token & redirect to landing
      api.clearToken();
      setShowDeleteModal(false);
      router.push('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account. Please verify confirmation password.');
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <LayoutShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 text-sm font-medium">Loading dashboard metrics...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="space-y-8 max-w-6xl mx-auto relative">
        
        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border text-sm transition-all duration-300 animate-fade-in bg-slate-900 border-slate-800 text-white">
            {toastMessage.type === 'success' ? (
              <CheckCircle className="text-emerald-400" size={18} />
            ) : (
              <CheckCircle className="text-rose-500" size={18} />
            )}
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Header containing the primary title and Add Resume action button */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div>
            <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
              <TrendingUp className="text-purple-400" size={24} />
              Your Preparation Hub
            </h1>
            <p className="text-slate-400 text-sm">Upload your resume and monitor your active roadmap checklists and mock interview analytics.</p>
          </div>
          <button
            onClick={() => router.push('/ats?new=true')}
            className="py-3 px-5 bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shrink-0 border border-purple-500/20"
          >
            <Plus size={16} />
            <span>Add Resume</span>
          </button>
        </div>

        {/* Top KPI Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Recent ATS Score</span>
              <span className="text-xl font-black text-white">{stats.atsScore > 0 ? `${stats.atsScore}%` : 'N/A'}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl">
              <FileText size={22} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Resumes Uploaded</span>
              <span className="text-xl font-black text-white">{stats.resumeUploadCount}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
              <BookOpen size={22} />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Roadmaps Generated</span>
              <span className="text-xl font-black text-white">{stats.roadmapCount}</span>
            </div>
          </div>
        </div>

        {/* Content Layout Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          
          {/* Left Panel: Active Study Roadmaps & Syllabus History */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="text-teal-400" size={16} />
                  Active Study Roadmaps & Syllabus History
                </h3>
                <span className="text-[10px] text-teal-400 font-bold bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 shrink-0">
                  {activeRoadmaps.length} Active
                </span>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {activeRoadmaps.length > 0 ? (
                  activeRoadmaps.map((r) => (
                    <div key={r.id} className="p-4 bg-slate-955 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="text-xs font-extrabold text-white">{r.title}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Duration: {r.durationDays} Days • Est. Comp: {new Date(r.estimatedCompletionDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full shrink-0">
                          Week {r.current_week}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-450">
                          <span>Overall Progress</span>
                          <span>{r.progress_percentage}% ({r.completedTasksCount}/{r.totalTasksCount} tasks)</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-teal-500 to-emerald-450" style={{ width: `${r.progress_percentage}%` }} />
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-1 border-t border-slate-850/30">
                        <span className="text-[10px] text-slate-500 font-semibold">{r.tasksRemaining} tasks remaining</span>
                        <button
                          onClick={() => router.push(`/roadmap?id=${r.id}`)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-teal-450 dark:text-teal-450 rounded-lg transition flex items-center gap-1 cursor-pointer select-none"
                        >
                          <span>Continue Syllabus</span>
                          <ArrowUpRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-955 h-[300px] flex flex-col items-center justify-center">
                    <BookOpen size={28} className="text-slate-650 mb-2" />
                    <span className="max-w-xs font-semibold">No active study roadmaps found. Analyze a resume to generate your customized learning roadmap.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-805 mt-4">
              <button
                onClick={() => router.push('/roadmap')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <BookOpen size={14} />
                <span>Go to Syllabus Workspaces</span>
              </button>
            </div>
          </div>

          {/* Right Panel: Mock Interview History Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6 shadow-xl">
            <div>
              <div className="flex justify-between items-center border-b border-slate-850 pb-4 mb-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Video className="text-indigo-400" size={16} />
                  Mock Interview History Log
                </h3>
                <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 shrink-0">
                  {interviewHistory.length} Sessions
                </span>
              </div>

              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {interviewHistory.length > 0 ? (
                  [...interviewHistory].reverse().slice(0, 5).map((session) => (
                    <div key={session.id} className="p-4 bg-slate-955 border border-slate-850 rounded-xl space-y-3 hover:border-slate-800 transition">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <h4 className="text-xs font-extrabold text-white">{session.role}</h4>
                          <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">
                            Date: {new Date(session.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full shrink-0">
                          {session.overallScore}% Score
                        </span>
                      </div>

                      <div className="flex justify-end pt-1 border-t border-slate-850/30">
                        <button
                          onClick={() => router.push(`/mock-interview/${session.id}/report`)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-[10px] font-bold text-indigo-400 dark:text-indigo-400 rounded-lg transition flex items-center gap-1 cursor-pointer select-none"
                        >
                          <span>View Report</span>
                          <ArrowUpRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl bg-slate-955 h-[300px] flex flex-col items-center justify-center">
                    <Video size={28} className="text-slate-650 mb-2" />
                    <span className="max-w-xs font-semibold">No mock interview history logs found. Start a practice session in the mock interview room to see your results.</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-805 mt-4">
              <button
                onClick={() => router.push('/history')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-350 hover:text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Video size={14} />
                <span>Go to Preparation History</span>
              </button>
            </div>
          </div>

        </div>

        {/* Full-Width Panel: Interview Performance Trends Graph */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-850 pb-4">
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="text-purple-400" size={16} />
                Interview Performance Trends Graph
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold">Track scoring metrics across technical and behavioral mock sessions</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <div className="px-3 py-1 bg-slate-955 border border-slate-850 rounded-lg text-center">
                <span className="text-[8px] text-slate-500 block font-bold uppercase tracking-wider">Avg Score</span>
                <span className="text-xs font-black text-white">{stats.avgInterviewScore}%</span>
              </div>
              <div className="px-3 py-1 bg-slate-955 border border-slate-850 rounded-lg text-center">
                <span className="text-[8px] text-slate-500 block font-bold uppercase tracking-wider">Total Mocks</span>
                <span className="text-xs font-black text-white">{stats.totalInterviews}</span>
              </div>
            </div>
          </div>

          {interviewHistory.length > 0 && (
            <div className="flex flex-wrap gap-1.5 bg-slate-955 border border-slate-850 p-1 rounded-xl">
              {['All', 'Technical', 'Behavioral', 'Communication', 'Confidence', 'Professionalism'].map((metric) => (
                <button
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-extrabold transition duration-150 cursor-pointer ${
                    selectedMetric === metric
                      ? 'bg-indigo-650 text-white shadow-sm'
                      : 'text-slate-450 hover:text-white'
                  }`}
                >
                  {metric === 'All' ? 'All Metrics' : metric}
                </button>
              ))}
            </div>
          )}

          <div className="h-72 flex flex-col justify-center">
            {interviewHistory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={interviewHistory.map((s: any, idx: number) => ({
                    name: `Mock ${idx + 1}`,
                    Technical: s.overallScore,
                    Behavioral: s.behavioralScore,
                    Communication: s.communicationScore,
                    Confidence: s.confidenceScore,
                    Professionalism: s.professionalismScore
                  }))}
                  margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorTech" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBehav" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                  <XAxis dataKey="name" stroke={axisStroke} fontSize={10} tickLine={false} />
                  <YAxis stroke={axisStroke} fontSize={10} tickLine={false} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }} />
                  {(selectedMetric === 'All' || selectedMetric === 'Technical') && (
                    <Area type="monotone" name="Technical Score" dataKey="Technical" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorTech)" />
                  )}
                  {(selectedMetric === 'All' || selectedMetric === 'Behavioral') && (
                    <Area type="monotone" name="Behavioral Score" dataKey="Behavioral" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorBehav)" />
                  )}
                  {(selectedMetric === 'All' || selectedMetric === 'Communication') && (
                    <Area type="monotone" name="Communication" dataKey="Communication" stroke="#06b6d4" strokeWidth={1.5} fillOpacity={selectedMetric === 'All' ? 0 : 0.3} fill="url(#colorComm)" />
                  )}
                  {(selectedMetric === 'All' || selectedMetric === 'Confidence') && (
                    <Area type="monotone" name="Confidence" dataKey="Confidence" stroke="#ec4899" strokeWidth={1.5} fillOpacity={selectedMetric === 'All' ? 0 : 0.3} fill="url(#colorConf)" />
                  )}
                  {(selectedMetric === 'All' || selectedMetric === 'Professionalism') && (
                    <Area type="monotone" name="Professionalism" dataKey="Professionalism" stroke="#10b981" strokeWidth={1.5} fillOpacity={selectedMetric === 'All' ? 0 : 0.3} fill="url(#colorProf)" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl bg-slate-955 h-[280px]">
                <Video size={28} className="text-slate-600 mb-2" />
                <span className="text-xs font-bold text-slate-450">No mock interview history logs found</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Quick Navigation & Utility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div 
            onClick={() => router.push('/settings?tab=profile')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-750 p-6 rounded-2xl shadow-xl flex flex-col justify-between cursor-pointer group transition duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl group-hover:bg-purple-500/20 transition">
                <UserIcon size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-650 group-hover:text-purple-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-150" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-1">My Profile Settings</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Update your full name, email address, profile picture and basic details.</p>
            </div>
          </div>

          <div 
            onClick={() => router.push('/settings?tab=security')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-750 p-6 rounded-2xl shadow-xl flex flex-col justify-between cursor-pointer group transition duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-xl group-hover:bg-teal-500/20 transition">
                <Lock size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-650 group-hover:text-teal-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-150" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-1">Change Account Password</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Modify your local login credentials and security authentication details.</p>
            </div>
          </div>

          <div 
            onClick={() => { setDeleteError(''); setDeleteConfirmPassword(''); setShowDeleteModal(true); }}
            className="bg-slate-900 border border-slate-800 hover:border-rose-950 p-6 rounded-2xl shadow-xl flex flex-col justify-between cursor-pointer group transition duration-200"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-450 rounded-xl group-hover:bg-rose-500/20 transition">
                <Trash2 size={20} />
              </div>
              <ArrowUpRight size={16} className="text-slate-650 group-hover:text-rose-450 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition duration-150" />
            </div>
            <div>
              <h4 className="text-sm font-black text-white mb-1">Delete Account</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">Permanently erase your profile data, scanned resumes, roadmaps, and mock interview logs.</p>
            </div>
          </div>
        </div>

      </div>

      {/* ACCOUNT DELETION CONFIRMATION DIALOG MODAL */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6 text-slate-100 z-10"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl shrink-0">
                  <Trash2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Permanently Delete Account?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    This action is permanent and cannot be undone. All ATS scans, skill assessments, roadmaps, and interview session archives will be deleted.
                  </p>
                </div>
              </div>

              {deleteError && (
                <div className="p-3 bg-rose-950/40 border border-rose-900/50 text-rose-450 text-xs rounded-xl">
                  {deleteError}
                </div>
              )}

              {/* Password confirm if local password exists */}
              {user?.hasPassword && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Confirm Your Password</label>
                  <input
                    type="password"
                    required
                    value={deleteConfirmPassword}
                    onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                    placeholder="Enter password to confirm"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-sm text-white placeholder-slate-700 focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-450 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {isDeleting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </LayoutShell>
  );
}
