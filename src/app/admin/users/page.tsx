'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  Search,
  Filter,
  ArrowUpDown,
  UserX,
  UserCheck,
  Settings,
  Trash2,
  KeyRound,
  Eye,
  X,
  FileText,
  Video,
  Map,
  ShieldAlert,
  Award,
  Layers
} from 'lucide-react';

export default function UserManagement() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<any[]>([]);

  // Search & Filter & Sort state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAt'); // createdAt, lastLogin, fullName, email
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals state
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userReports, setUserReports] = useState<any | null>(null);
  const [loadingReports, setLoadingReports] = useState(false);
  const [activeReportTab, setActiveReportTab] = useState<'ats' | 'interviews' | 'roadmaps' | 'resumes'>('ats');

  const [passwordResetUser, setPasswordResetUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.listUsers();
      setUsers(res.users);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve registered users.');
    } finally {
      setLoading(false);
    }
  };

  // Actions
  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    if (!confirm(`Are you sure you want to ${nextStatus === 'SUSPENDED' ? 'suspend' : 'reactivate'} the account for ${user.email}?`)) {
      return;
    }
    try {
      await adminApi.updateUserStatus(user.id, nextStatus);
      loadUsers();
      // Sync modal if active
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, status: nextStatus });
      }
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    }
  };

  const handleToggleRole = async (user: any) => {
    const nextRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN';
    if (!confirm(`Are you sure you want to change role of ${user.email} to ${nextRole}?`)) {
      return;
    }
    try {
      await adminApi.updateUserRole(user.id, nextRole);
      loadUsers();
      if (selectedUser?.id === user.id) {
        setSelectedUser({ ...selectedUser, role: nextRole });
      }
    } catch (err: any) {
      alert(`Failed to change role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (user: any) => {
    if (!confirm(`CRITICAL WARNING:\nAre you sure you want to PERMANENTLY DELETE user ${user.email}?\nAll history, resumes, interviews, and roadmaps will be lost. This cannot be undone.`)) {
      return;
    }
    try {
      await adminApi.deleteUser(user.id);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  const handleOpenReports = async (user: any) => {
    setSelectedUser(user);
    setLoadingReports(true);
    try {
      const reports = await adminApi.getUserReports(user.id);
      setUserReports(reports);
    } catch (err: any) {
      alert(`Failed to fetch user records: ${err.message}`);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordResetUser || !newPassword) return;
    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    setSubmittingPassword(true);
    try {
      await adminApi.resetUserPassword(passwordResetUser.id, { password: newPassword });
      alert(`Password updated successfully for ${passwordResetUser.email}.`);
      setPasswordResetUser(null);
      setNewPassword('');
    } catch (err: any) {
      alert(`Reset password failed: ${err.message}`);
    } finally {
      setSubmittingPassword(false);
    }
  };

  // Filter & Sort Logic
  const filteredUsers = users
    .filter(u => {
      const matchSearch = 
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.profile?.fullName || '').toLowerCase().includes(search.toLowerCase());
      
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
      
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      let valA: any = a[sortBy];
      let valB: any = b[sortBy];
      
      if (sortBy === 'fullName') {
        valA = a.profile?.fullName || '';
        valB = b.profile?.fullName || '';
      }
      
      if (typeof valA === 'string') {
        return sortOrder === 'asc' 
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        const timeA = valA ? new Date(valA).getTime() : 0;
        const timeB = valB ? new Date(valB).getTime() : 0;
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
    });

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">User Management</h1>
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Perform administrative checks, verify profile configurations, and control access permissions.
        </p>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className={`border p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl flex-1 border ${
          isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
        }`}>
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search by full name or email address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs outline-none focus:ring-0 placeholder-slate-500 border-none p-0"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={13} className="text-purple-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer border ${
                isDark ? 'bg-slate-950 border-[#2A2A2A] text-slate-300' : 'bg-white border-[#E5E7EB] text-slate-700'
              }`}
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer border ${
              isDark ? 'bg-slate-950 border-[#2A2A2A] text-slate-300' : 'bg-white border-[#E5E7EB] text-slate-700'
            }`}
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className={`border rounded-2xl overflow-hidden ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className={`border-b ${isDark ? 'bg-[#111111] text-slate-400 border-[#2A2A2A]' : 'bg-slate-50 text-slate-500 border-[#E5E7EB]'}`}>
                <th onClick={() => toggleSort('fullName')} className="p-4 font-extrabold uppercase tracking-wider cursor-pointer select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Full Name</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th onClick={() => toggleSort('email')} className="p-4 font-extrabold uppercase tracking-wider cursor-pointer select-none">
                  <div className="flex items-center gap-1.5">
                    <span>Email Address</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Role</th>
                <th className="p-4 font-extrabold uppercase tracking-wider">Status</th>
                <th className="p-4 font-extrabold uppercase tracking-wider text-center">ATS/Mock/Paths</th>
                <th onClick={() => toggleSort('createdAt')} className="p-4 font-extrabold uppercase tracking-wider cursor-pointer select-none text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span>Registered</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-4 font-extrabold uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB] dark:divide-[#2A2A2A]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500 font-semibold">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className={`transition ${isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50/50'}`}>
                    <td className="p-4 font-bold">{u.profile?.fullName || 'No Name Set'}</td>
                    <td className="p-4 font-semibold text-slate-400">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        u.role === 'ADMIN' 
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                          : 'bg-slate-550/10 text-slate-450 border border-slate-550/20'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        u.status === 'ACTIVE' 
                          ? 'bg-emerald-500/10 text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold space-x-2 text-slate-450">
                      <span title="ATS Reports Count" className="inline-flex items-center gap-0.5">
                        <FileText size={11} className="text-purple-400" />
                        {u._count?.atsReports || 0}
                      </span>
                      <span title="Mock Interviews Count" className="inline-flex items-center gap-0.5">
                        <Video size={11} className="text-indigo-400" />
                        {u._count?.interviewSessions || 0}
                      </span>
                      <span title="Roadmaps Count" className="inline-flex items-center gap-0.5">
                        <Map size={11} className="text-cyan-400" />
                        {u._count?.roadmaps || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right font-medium text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                      {/* View details */}
                      <button
                        onClick={() => handleOpenReports(u)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isDark ? 'bg-slate-900 border-[#2A2A2A] hover:bg-slate-800' : 'bg-white border-[#E5E7EB] hover:bg-slate-100'
                        }`}
                        title="View User Details & History"
                      >
                        <Eye size={13} className="text-purple-500" />
                      </button>

                      {/* Suspend/Reactivate */}
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          u.status === 'ACTIVE' 
                            ? 'hover:bg-rose-950/20 hover:border-rose-900/30 border-[#E5E7EB] dark:border-[#2A2A2A]' 
                            : 'hover:bg-emerald-950/20 hover:border-emerald-900/30 border-[#E5E7EB] dark:border-[#2A2A2A]'
                        }`}
                        title={u.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
                      >
                        {u.status === 'ACTIVE' ? (
                          <UserX size={13} className="text-rose-500" />
                        ) : (
                          <UserCheck size={13} className="text-emerald-500" />
                        )}
                      </button>

                      {/* Change Role */}
                      <button
                        onClick={() => handleToggleRole(u)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isDark ? 'bg-slate-900 border-[#2A2A2A] hover:bg-slate-800' : 'bg-white border-[#E5E7EB] hover:bg-slate-100'
                        }`}
                        title={u.role === 'ADMIN' ? 'Demote to Student' : 'Promote to Admin'}
                      >
                        <Settings size={13} className="text-slate-400" />
                      </button>

                      {/* Reset password */}
                      <button
                        onClick={() => setPasswordResetUser(u)}
                        className={`p-1.5 rounded-lg border cursor-pointer ${
                          isDark ? 'bg-slate-900 border-[#2A2A2A] hover:bg-slate-800' : 'bg-white border-[#E5E7EB] hover:bg-slate-100'
                        }`}
                        title="Direct Password Reset"
                      >
                        <KeyRound size={13} className="text-amber-500" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteUser(u)}
                        className={`p-1.5 rounded-lg border cursor-pointer hover:bg-rose-950/20 border-[#E5E7EB] dark:border-[#2A2A2A] hover:border-rose-900/30`}
                        title="Delete User permanently"
                      >
                        <Trash2 size={13} className="text-rose-500" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER DETAILS & REPORTS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-4xl max-h-[85vh] rounded-2xl flex flex-col border overflow-hidden transition-all duration-300 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A] text-white' : 'bg-[#FFFFFF] border-[#E5E7EB] text-black shadow-2xl'
          }`}>
            {/* Modal Header */}
            <div className="p-6 border-b border-inherit flex justify-between items-start">
              <div>
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                  selectedUser.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-slate-700/10 text-slate-500'
                }`}>
                  {selectedUser.role} Profile Details
                </span>
                <h3 className="text-lg font-black mt-1">{selectedUser.profile?.fullName || 'No Name Set'}</h3>
                <p className="text-xs text-slate-500">{selectedUser.email}</p>
              </div>
              <button 
                onClick={() => { setSelectedUser(null); setUserReports(null); }}
                className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Profile Details section */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'}`}>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Target Current Role</span>
                  <p className="text-xs font-bold">{selectedUser.profile?.currentRole || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-950/40 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'}`}>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Experience Level</span>
                  <p className="text-xs font-bold">{selectedUser.profile?.experienceLevel || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-xl border md:col-span-2 ${isDark ? 'bg-slate-950/40 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'}`}>
                  <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1.5">Registered Key Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedUser.profile?.skills ? (
                      (() => {
                        try {
                          const parsed = JSON.parse(selectedUser.profile.skills);
                          return Array.isArray(parsed) && parsed.length > 0 ? (
                            parsed.map((s: string, idx: number) => (
                              <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                isDark ? 'bg-slate-900 border-[#2A2A2A]' : 'bg-white border-[#E5E7EB]'
                              }`}>
                                {s}
                              </span>
                            ))
                          ) : <span className="text-xs font-bold text-slate-500">None parsed</span>;
                        } catch {
                          return <span className="text-xs font-bold text-slate-500">None parsed</span>;
                        }
                      })()
                    ) : <span className="text-xs font-bold text-slate-500">None parsed</span>}
                  </div>
                </div>
              </div>

              {/* TABS SELECTOR */}
              <div className="flex border-b border-[#2A2A2A] dark:border-inherit pb-px">
                {[
                  { id: 'ats', label: 'ATS Reports', icon: FileText },
                  { id: 'interviews', label: 'Mock Interviews', icon: Video },
                  { id: 'roadmaps', label: 'Roadmaps', icon: Map },
                  { id: 'resumes', label: 'Uploaded Resumes', icon: Eye }
                ].map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveReportTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-4 py-2 border-b-2 text-[10px] font-bold uppercase tracking-wider transition select-none cursor-pointer ${
                        activeReportTab === tab.id
                          ? 'border-purple-500 text-purple-400'
                          : 'border-transparent text-slate-500 hover:text-slate-350'
                      }`}
                    >
                      <Icon size={12} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* TAB CONTENT */}
              <div className="min-h-[200px]">
                {loadingReports ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !userReports ? (
                  <div className="text-center text-xs text-slate-500 py-12">No records found.</div>
                ) : (
                  <>
                    {/* ATS Tab */}
                    {activeReportTab === 'ats' && (
                      <div className="space-y-3">
                        {userReports.ats?.length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center">No ATS reports compiled yet.</p>
                        ) : (
                          userReports.ats.map((report: any) => (
                            <div key={report.id} className={`p-4 border rounded-xl flex justify-between items-center ${
                              isDark ? 'bg-slate-950/20 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                            }`}>
                              <div>
                                <h4 className="text-xs font-bold">{report.jobTitle}</h4>
                                <p className="text-[10px] text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
                              </div>
                              <span className={`text-xs font-black px-3 py-1 rounded-xl ${
                                report.overallScore >= 75 ? 'bg-emerald-500/10 text-emerald-400' : report.overallScore >= 60 ? 'bg-amber-500/10 text-amber-400' : 'bg-rose-500/10 text-rose-400'
                              }`}>
                                {report.overallScore}/100 Score
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Interviews Tab */}
                    {activeReportTab === 'interviews' && (
                      <div className="space-y-3">
                        {userReports.interviews?.length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center">No mock interviews completed.</p>
                        ) : (
                          userReports.interviews.map((session: any) => (
                            <div key={session.id} className={`p-4 border rounded-xl flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 ${
                              isDark ? 'bg-slate-950/20 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                            }`}>
                              <div>
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest block">{session.type}</span>
                                <h4 className="text-xs font-bold mt-0.5">{session.role} @ {session.company}</h4>
                                <p className="text-[10px] text-slate-500">{new Date(session.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="flex gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${
                                  session.status === 'COMPLETED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'
                                }`}>
                                  {session.status}
                                </span>
                                {session.overallScore && (
                                  <span className="text-xs font-black px-2.5 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-lg">
                                    Score: {session.overallScore}%
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Roadmaps Tab */}
                    {activeReportTab === 'roadmaps' && (
                      <div className="space-y-3">
                        {userReports.roadmaps?.length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center">No learning roadmaps generated.</p>
                        ) : (
                          userReports.roadmaps.map((mapItem: any) => (
                            <div key={mapItem.id} className={`p-4 border rounded-xl flex justify-between items-center ${
                              isDark ? 'bg-slate-950/20 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                            }`}>
                              <div>
                                <h4 className="text-xs font-bold">{mapItem.title}</h4>
                                <p className="text-[10px] text-slate-500">Duration: {mapItem.durationDays} Days</p>
                              </div>
                              <span className="text-[10px] font-bold text-slate-500">{new Date(mapItem.createdAt).toLocaleDateString()}</span>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {/* Resumes Tab */}
                    {activeReportTab === 'resumes' && (
                      <div className="space-y-3">
                        {userReports.resumes?.length === 0 ? (
                          <p className="text-xs text-slate-500 py-4 text-center">No uploaded resume files.</p>
                        ) : (
                          userReports.resumes.map((resItem: any) => (
                            <div key={resItem.id} className={`p-4 border rounded-xl flex justify-between items-center ${
                              isDark ? 'bg-slate-950/20 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                            }`}>
                              <div className="flex items-center gap-3">
                                <FileText size={16} className="text-purple-400" />
                                <div>
                                  <h4 className="text-xs font-bold">{resItem.fileName}</h4>
                                  <p className="text-[10px] text-slate-500">Uploaded {new Date(resItem.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <a
                                href={resItem.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-slate-950 hover:bg-slate-900 border border-purple-500/20 hover:border-purple-500 text-purple-400 rounded-xl text-[10px] font-bold uppercase transition"
                              >
                                View File
                              </a>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-inherit flex justify-between items-center bg-slate-50 dark:bg-transparent">
              <span className={`text-[10px] font-bold text-slate-500 uppercase block`}>
                Registration ID: {selectedUser.id}
              </span>
              <button
                onClick={() => { setSelectedUser(null); setUserReports(null); }}
                className="px-5 py-2 bg-slate-500 hover:bg-slate-400 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIRECT PASSWORD RESET MODAL */}
      {passwordResetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form 
            onSubmit={handleResetPassword}
            className={`w-full max-w-md border rounded-2xl overflow-hidden transition-all duration-300 ${
              isDark ? 'bg-[#111111] border-[#2A2A2A] text-white' : 'bg-[#FFFFFF] border-[#E5E7EB] text-black shadow-2xl'
            }`}
          >
            <div className="p-6 border-b border-inherit flex justify-between items-center">
              <div>
                <h3 className="text-xs font-black uppercase text-purple-500 tracking-wider">Reset Password</h3>
                <h4 className="text-sm font-bold mt-1">User: {passwordResetUser.email}</h4>
              </div>
              <button 
                type="button"
                onClick={() => { setPasswordResetUser(null); setNewPassword(''); }}
                className={`p-1.5 rounded-lg cursor-pointer ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`}
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                isDark ? 'bg-amber-950/20 border-amber-900/30 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-700'
              }`}>
                <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                <p className="text-[10px] leading-relaxed font-semibold">
                  This updates the password immediately in the database and Supabase Auth. Inform the user of their new password details.
                </p>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs outline-none focus:ring-1 focus:ring-purple-500 border ${
                    isDark ? 'bg-slate-950 border-[#2A2A2A]' : 'bg-slate-50 border-[#E5E7EB]'
                  }`}
                />
              </div>
            </div>

            <div className="p-6 border-t border-inherit flex justify-end gap-3 bg-slate-50 dark:bg-transparent">
              <button
                type="button"
                onClick={() => { setPasswordResetUser(null); setNewPassword(''); }}
                className="px-4 py-2 bg-slate-500 hover:bg-slate-400 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPassword}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl disabled:opacity-50 cursor-pointer"
              >
                {submittingPassword ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
