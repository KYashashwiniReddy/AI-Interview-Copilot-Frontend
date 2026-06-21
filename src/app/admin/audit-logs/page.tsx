'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  ShieldAlert,
  ArrowDownAZ
} from 'lucide-react';

const ACTIONS = [
  'ADMIN_LOGIN',
  'USER_DELETION',
  'USER_SUSPENSION',
  'USER_REACTIVATION',
  'QUESTION_CREATION',
  'QUESTION_UPDATE',
  'QUESTION_DELETION',
  'ATS_SETTING_CHANGES',
  'INTERVIEW_SETTING_CHANGES',
  'ROLE_CHANGES',
  'PASSWORD_RESET'
];

export default function AuditLogs() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<any[]>([]);

  // Search & Filter parameters
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter]);

  const loadAuditLogs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (actionFilter) params.action = actionFilter;
      const res = await adminApi.getAuditLogs(params);
      setLogs(res.logs || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'ADMIN_LOGIN':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'USER_DELETION':
      case 'QUESTION_DELETION':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'USER_SUSPENSION':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'USER_REACTIVATION':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'ROLE_CHANGES':
      case 'PASSWORD_RESET':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-slate-550/10 text-slate-400 border-slate-550/20';
    }
  };

  // Local text search filter
  const filteredLogs = logs.filter(log => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (log.adminEmail || '').toLowerCase().includes(s) ||
      (log.action || '').toLowerCase().includes(s) ||
      (log.targetEntity || '').toLowerCase().includes(s)
    );
  });

  if (loading && logs.length === 0) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">System Audit Logs</h1>
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Immutable database record logging all administrative events and structural operations.
        </p>
      </div>

      {error && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
          isDark ? 'bg-rose-950/20 border-rose-900/30 text-rose-450' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          <span>{error}</span>
        </div>
      )}

      {/* FILTER & SEARCH BAR */}
      <div className={`border p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl flex-1 border ${
          isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
        }`}>
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by email, target, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none focus:ring-0 placeholder-slate-500 border-none p-0"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={13} className="text-purple-500" />
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer border ${
              isDark ? 'bg-slate-950 border-[#2A2A2A] text-slate-300' : 'bg-white border-[#E5E7EB] text-slate-700'
            }`}
          >
            <option value="">All Actions</option>
            {ACTIONS.map(act => <option key={act} value={act}>{act}</option>)}
          </select>
        </div>
      </div>

      {/* AUDIT LOGS LIST */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'bg-[#111111] text-slate-400 border-[#2A2A2A]' : 'bg-slate-50 text-slate-500 border-[#E5E7EB]'}`}>
                <th className="p-4 font-extrabold uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-purple-500" />
                    <span>Timestamp</span>
                  </div>
                </th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Admin Email</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Action Event</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Target Entity / Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-550 font-semibold">
                    No historical logs matching query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className={`transition ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 font-bold text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-450">{log.adminEmail}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-300 break-all max-w-sm">
                      {log.targetEntity}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
