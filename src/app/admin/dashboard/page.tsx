'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  Users,
  UserCheck,
  FileText,
  Video,
  TrendingUp,
  Map,
  FileCheck,
  TrendingDown,
  Calendar,
  Layers,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export default function AdminDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const gridStroke = isDark ? '#2A2A2A' : '#E5E7EB';
  const axisStroke = isDark ? '#A0AEC0' : '#4A5568';
  const tooltipBg = isDark ? '#111111' : '#FFFFFF';
  const tooltipBorder = isDark ? '#2A2A2A' : '#E5E7EB';
  const tooltipText = isDark ? '#FFFFFF' : '#000000';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Real-time Database stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalATS: 0,
    totalInterviews: 0,
    totalRoadmaps: 0,
    totalResumesUploaded: 0,
    averageAtsScore: 0,
    averageInterviewScore: 0,
    totalSkillsGap: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>({
    userGrowth: [],
    topRoles: [],
    requestedCompanies: [],
    skillTrends: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getAnalytics()
      ]);
      setStats(statsRes.stats);
      setRecentActivity(statsRes.recentActivity || []);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin dashboard records.');
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#8b5cf6', '#6366f1', '#ec4899', '#3b82f6', '#10b981'];

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl border text-center ${
        isDark ? 'bg-rose-950/20 border-rose-900/30 text-rose-400' : 'bg-rose-50 border-rose-200 text-rose-600'
      }`}>
        <p className="font-bold">{error}</p>
        <button 
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-xl font-bold text-xs hover:bg-purple-500"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">System Dashboard</h1>
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Real-time aggregates, metric indicators, and system activities.
        </p>
      </div>

      {/* STATS AGGREGATES CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Registered', val: stats.totalUsers, icon: Users, color: 'text-purple-500' },
          { label: 'Active Users', val: stats.activeUsers, icon: UserCheck, color: 'text-emerald-500' },
          { label: 'ATS Scans', val: stats.totalATS, icon: FileSpreadsheet, color: 'text-pink-500' },
          { label: 'Interviews Finished', val: stats.totalInterviews, icon: Video, color: 'text-indigo-500' },
          { label: 'Roadmaps Generated', val: stats.totalRoadmaps, icon: Map, color: 'text-cyan-500' },
          { label: 'Resumes Uploaded', val: stats.totalResumesUploaded, icon: FileText, color: 'text-blue-500' },
          { label: 'Skills Gap Analyses', val: stats.totalSkillsGap, icon: Layers, color: 'text-amber-500' },
          { label: 'Avg ATS Score', val: `${stats.averageAtsScore}/100`, icon: FileCheck, color: 'text-violet-500' },
          { label: 'Avg Interview Score', val: `${stats.averageInterviewScore}%`, icon: TrendingUp, color: 'text-green-500' },
          { label: 'New This Week', val: stats.newUsersThisWeek, icon: Calendar, color: 'text-teal-500' },
          { label: 'New This Month', val: stats.newUsersThisMonth, icon: Calendar, color: 'text-orange-500' }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div 
              key={index} 
              className={`border p-5 rounded-2xl transition-all hover:scale-[1.01] ${
                isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider block mb-2 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
                {item.label}
              </span>
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-black">{item.val}</h3>
                <Icon size={20} className={item.color} />
              </div>
            </div>
          );
        })}
      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        
        {/* User Acquisition Area Chart */}
        <div className={`border p-6 rounded-2xl ${
          isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-6">User Acquisition Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.userGrowth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="userColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="month" stroke={axisStroke} fontSize={10} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }} />
                <Area type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#userColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Roles Bar Chart */}
        <div className={`border p-6 rounded-2xl ${
          isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-6">Top Target Roles</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.topRoles} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
                <XAxis dataKey="name" stroke={axisStroke} fontSize={10} tickLine={false} />
                <YAxis stroke={axisStroke} fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }} />
                <Bar dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Targeted Companies Pie Chart */}
        <div className={`border p-6 rounded-2xl ${
          isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-6">Most Targeted Companies</h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.requestedCompanies}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {analytics.requestedCompanies.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-1.5 ml-4 text-[10px] font-bold">
              {analytics.requestedCompanies.map((entry: any, index: number) => (
                <div key={index} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name} ({entry.count})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Targeted Skills progress index */}
        <div className={`border p-6 rounded-2xl ${
          isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
        }`}>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-6">Targeted Skills Index</h3>
          <div className="space-y-4">
            {analytics.skillTrends.map((s: any) => (
              <div key={s.skill}>
                <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                  <span>{s.skill}</span>
                  <span className={isDark ? 'text-purple-400' : 'text-purple-600'}>{s.growth}% Frequency</span>
                </div>
                <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${s.growth}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECENT ACTIVITY LOG FEED */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <div className="p-6 border-b border-inherit flex items-center justify-between">
          <h3 className="text-xs font-extrabold uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} className="text-purple-500" />
            <span>Recent Activity Feed</span>
          </h3>
          <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
            isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'
          }`}>
            Live Operations
          </span>
        </div>

        <div className="divide-y divide-inherit max-h-[350px] overflow-y-auto">
          {recentActivity.length === 0 ? (
            <div className={`p-8 text-center text-xs font-semibold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No recent platform activity logged.
            </div>
          ) : (
            recentActivity.map((act) => (
              <div key={act.id} className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-slate-550/5 gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold leading-relaxed">{act.activity}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                    <span className={`px-1.5 py-0.2 rounded uppercase text-[8px] ${
                      act.type === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-indigo-500/10 text-indigo-400'
                    }`}>
                      {act.type}
                    </span>
                    <span>•</span>
                    <span>{act.user}</span>
                    {act.userName && (
                      <>
                        <span>•</span>
                        <span>{act.userName}</span>
                      </>
                    )}
                  </div>
                </div>
                <span className={`text-[9px] font-bold whitespace-nowrap ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  {new Date(act.timestamp).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
