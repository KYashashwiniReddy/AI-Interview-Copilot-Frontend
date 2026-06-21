'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../../components/LayoutShell';
import { interviewApi, atsApi, authApi } from '../../lib/api';
import { Video, FileText, Search, ArrowRight, Trash2, ChevronLeft, ChevronRight, SlidersHorizontal, ShieldAlert, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HistoryPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'interviews' | 'ats'>('interviews');
  const [interviews, setInterviews] = useState<any[]>([]);
  const [atsReports, setAtsReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'score_high' | 'score_low'>('newest');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Modals
  const [showClearModal, setShowClearModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  async function loadHistory() {
    setLoading(true);
    try {
      const [intRes, atsRes] = await Promise.all([
        interviewApi.getHistory().catch(() => ({ sessions: [] })),
        atsApi.getHistory().catch(() => ({ reports: [] }))
      ]);
      setInterviews(intRes.sessions || []);
      setAtsReports(atsRes.reports || []);
      setSelectedIds([]);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to load history lists:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // Filter & Sort interviews
  const filteredInterviews = interviews
    .filter((item) => {
      const matchesSearch =
        item.role.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase());
      
      const matchesType = typeFilter === 'ALL' || item.type === typeFilter;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'score_high') return (b.overallScore || 0) - (a.overallScore || 0);
      if (sortBy === 'score_low') return (a.overallScore || 0) - (b.overallScore || 0);
      return 0;
    });

  // Filter & Sort ATS Reports
  const filteredAts = atsReports
    .filter((item) => {
      return (
        item.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        item.jobDescription.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'score_high') return b.overallScore - a.overallScore;
      if (sortBy === 'score_low') return a.overallScore - b.overallScore;
      return 0;
    });

  // Get current page items
  const activeList = activeTab === 'interviews' ? filteredInterviews : filteredAts;
  const totalPages = Math.max(1, Math.ceil(activeList.length / itemsPerPage));
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = activeList.slice(indexOfFirstItem, indexOfLastItem);

  // Selection handlers
  const handleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentPageIds = currentItems.map(item => item.id);
    const allSelectedOnPage = currentPageIds.every(id => selectedIds.includes(id));

    if (allSelectedOnPage) {
      // Unselect all on current page
      setSelectedIds(prev => prev.filter(id => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedIds(prev => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  // Delete Individual Record
  const handleDeleteRow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      if (activeTab === 'interviews') {
        await interviewApi.deleteSession(id);
        triggerToast('Item deleted successfully from all associated records and modules.', 'success');
      } else {
        await atsApi.deleteReport(id);
        triggerToast('Item deleted successfully from all associated records and modules.', 'success');
        
        // Clear sessionStorage if the deleted report is active
        if (typeof window !== 'undefined') {
          const savedReport = sessionStorage.getItem('ats_report');
          if (savedReport) {
            try {
              const parsed = JSON.parse(savedReport);
              if (parsed && parsed.id === id) {
                sessionStorage.removeItem('ats_report');
                sessionStorage.removeItem('ats_jdOption');
                sessionStorage.removeItem('ats_selectedRole');
                sessionStorage.removeItem('ats_experienceLevel');
                sessionStorage.removeItem('ats_jobTitle');
                sessionStorage.removeItem('ats_jobDescription');
                sessionStorage.removeItem('ats_generatedJd');
              }
            } catch (e) {}
          }
        }
      }
      loadHistory();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to delete record.', 'error');
    }
  };

  // Delete Selected Rows (Bulk delete)
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete the ${selectedIds.length} selected records?`)) return;

    setIsDeleting(true);
    try {
      if (activeTab === 'interviews') {
        await interviewApi.bulkDeleteSessions(selectedIds);
        triggerToast(`Successfully deleted ${selectedIds.length} mock sessions.`, 'success');
      } else {
        await atsApi.bulkDeleteReports(selectedIds);
        triggerToast(`Successfully deleted ${selectedIds.length} ATS reports.`, 'success');
        
        // Clear sessionStorage if the active report is in bulk-deleted list
        if (typeof window !== 'undefined') {
          const savedReport = sessionStorage.getItem('ats_report');
          if (savedReport) {
            try {
              const parsed = JSON.parse(savedReport);
              if (parsed && selectedIds.includes(parsed.id)) {
                sessionStorage.removeItem('ats_report');
                sessionStorage.removeItem('ats_jdOption');
                sessionStorage.removeItem('ats_selectedRole');
                sessionStorage.removeItem('ats_experienceLevel');
                sessionStorage.removeItem('ats_jobTitle');
                sessionStorage.removeItem('ats_jobDescription');
                sessionStorage.removeItem('ats_generatedJd');
              }
            } catch (e) {}
          }
        }
      }
      loadHistory();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to bulk delete records.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  // Clear All History
  const handleClearAllHistory = async () => {
    setIsDeleting(true);
    try {
      await authApi.clearAllHistory();
      triggerToast('All preparation history has been cleared successfully.', 'success');
      setShowClearModal(false);
      
      // Clear all active report sessionStorage keys
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('ats_report');
        sessionStorage.removeItem('ats_jdOption');
        sessionStorage.removeItem('ats_selectedRole');
        sessionStorage.removeItem('ats_experienceLevel');
        sessionStorage.removeItem('ats_jobTitle');
        sessionStorage.removeItem('ats_jobDescription');
        sessionStorage.removeItem('ats_generatedJd');
      }
      
      loadHistory();
    } catch (err: any) {
      triggerToast(err.message || 'Failed to clear all history.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Global Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border text-sm ${
                toastMessage.type === 'success' ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300' : 'bg-rose-950/90 border-rose-800 text-rose-300'
              }`}
            >
              <ShieldAlert size={18} />
              <span>{toastMessage.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">Your Preparation History</h1>
            <p className="text-slate-400 text-sm">Review your past evaluations, scores, feedback points and resumes.</p>
          </div>

          <button
            onClick={() => setShowClearModal(true)}
            className="px-4 py-2 bg-rose-600/10 hover:bg-rose-600/15 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
          >
            Clear All History
          </button>
        </div>

        {/* TAB TRIGGERS & CONTROLS LAYOUT */}
        <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          
          {/* Tab selector */}
          <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-xl shrink-0 self-start xl:self-auto">
            <button
              onClick={() => { setActiveTab('interviews'); setSearch(''); setSelectedIds([]); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'interviews' ? 'bg-purple-600/15 text-purple-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Video size={14} />
              Mock Sessions
            </button>
            <button
              onClick={() => { setActiveTab('ats'); setSearch(''); setSelectedIds([]); setCurrentPage(1); }}
              className={`px-4 py-2 rounded-lg text-xs font-bold uppercase transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'ats' ? 'bg-purple-600/15 text-purple-400' : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <FileText size={14} />
              ATS Scans
            </button>
          </div>

          {/* Filtering inputs */}
          <div className="grid sm:grid-cols-2 md:flex items-center gap-3 w-full xl:w-auto">
            
            {/* Search box */}
            <div className="relative col-span-2 md:col-span-1 md:w-56">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Search size={14} /></span>
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder={activeTab === 'interviews' ? 'Search by role or company...' : 'Search by job title...'}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
              />
            </div>

            {/* Category Dropdown filter (only for interviews) */}
            {activeTab === 'interviews' && (
              <select
                value={typeFilter}
                onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-purple-500"
              >
                <option value="ALL">All Categories</option>
                <option value="TECHNICAL">Technical</option>
                <option value="BEHAVIORAL">Behavioral</option>
                <option value="SYSTEM_DESIGN">System Design</option>
                <option value="HR">HR & Behavioral</option>
                <option value="MIXED">Mixed Options</option>
              </select>
            )}

            {/* Sorting Dropdown */}
            <select
              value={sortBy}
              onChange={(e: any) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs font-bold text-slate-400 focus:outline-none focus:border-purple-500 flex items-center gap-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="score_high">Highest Score</option>
              <option value="score_low">Lowest Score</option>
            </select>

            {/* Bulk delete trigger */}
            {selectedIds.length > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={isDeleting}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition cursor-pointer self-stretch sm:col-span-2 md:col-span-1 justify-center disabled:opacity-50"
              >
                <Trash2 size={13} />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

          </div>

        </div>

        {/* LOADING SHIM */}
        {loading && (
          <div className="min-h-[300px] flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* DATA TABLE DISPLAY */}
        {!loading && (
          <div className="space-y-4">
            
            {activeList.length > 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/45 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                        <th className="py-4 px-5 w-12 text-center">
                          <button onClick={handleSelectAll} className="text-slate-500 hover:text-white transition">
                            {currentItems.every(item => selectedIds.includes(item.id)) ? (
                              <CheckSquare size={16} className="text-purple-400" />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </th>
                        
                        {activeTab === 'interviews' ? (
                          <>
                            <th className="py-4 px-4">Role & Company</th>
                            <th className="py-4 px-4">Type</th>
                            <th className="py-4 px-4">Difficulty</th>
                            <th className="py-4 px-4 text-center">Score</th>
                            <th className="py-4 px-4">Date Started</th>
                            <th className="py-4 px-4">Date Ended</th>
                          </>
                        ) : (
                          <>
                            <th className="py-4 px-4">Job Title</th>
                            <th className="py-4 px-4">Method</th>
                            <th className="py-4 px-4 text-center">Score</th>
                            <th className="py-4 px-4">Uploaded Date</th>
                          </>
                        )}
                        <th className="py-4 px-4 text-center w-32">View Report</th>
                        <th className="py-4 px-5 text-center w-20">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {currentItems.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-850/40 transition-colors duration-150 ${
                              isSelected ? 'bg-purple-950/10' : ''
                            }`}
                          >
                            <td className="py-4 px-5 text-center">
                              <button onClick={() => handleSelectRow(item.id)} className="text-slate-500 hover:text-white transition">
                                {isSelected ? (
                                  <CheckSquare size={15} className="text-purple-400" />
                                ) : (
                                  <Square size={15} />
                                )}
                              </button>
                            </td>

                            {activeTab === 'interviews' ? (
                              <>
                                <td className="py-4 px-4 font-bold text-white">
                                  <span className="block text-sm">{item.role}</span>
                                  <span className="text-[10px] text-slate-500 font-normal">{item.company}</span>
                                </td>
                                <td className="py-4 px-4 font-medium text-slate-400 capitalize">{item.type.toLowerCase()}</td>
                                <td className="py-4 px-4">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                    item.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                    item.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  }`}>
                                    {item.difficulty}
                                  </span>
                                </td>
                                <td className="py-4 px-4 text-center">
                                  {item.status === 'COMPLETED' ? (
                                    <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                                      {item.overallScore}%
                                    </span>
                                  ) : (
                                    <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full font-bold">
                                      Started
                                    </span>
                                  )}
                                </td>
                                 <td className="py-4 px-4 text-slate-400 font-medium">
                                   {new Date(item.createdAt).toLocaleString()}
                                 </td>
                                 <td className="py-4 px-4 text-slate-400 font-medium">
                                   {item.endedAt ? new Date(item.endedAt).toLocaleString() : (item.status === 'COMPLETED' ? new Date(new Date(item.createdAt).getTime() + 15 * 60 * 1000).toLocaleString() : '—')}
                                 </td>
                               </>
                             ) : (
                               <>
                                 <td className="py-4 px-4 font-bold text-white text-sm">{item.jobTitle}</td>
                                 <td className="py-4 px-4 font-medium text-slate-400">
                                   {item.resumeUrl ? 'Parsed Resume File' : 'Manual Text Input'}
                                 </td>
                                 <td className="py-4 px-4 text-center">
                                   <span className={`px-2.5 py-0.5 rounded-full font-bold ${
                                     item.overallScore >= 80 ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' : 'text-purple-400 bg-purple-500/10 border border-purple-500/20'
                                   }`}>
                                     {item.overallScore}/100
                                   </span>
                                 </td>
                                 <td className="py-4 px-4 text-slate-400 font-medium">
                                   {new Date(item.createdAt).toLocaleString()}
                                 </td>
                               </>
                             )}

                             <td className="py-4 px-4 text-center">
                               <button
                                 onClick={() => router.push(
                                   activeTab === 'interviews'
                                     ? (item.status === 'COMPLETED' ? `/mock-interview/${item.id}/report` : `/mock-interview/${item.id}`)
                                     : `/ats?reportId=${item.id}`
                                 )}
                                 className="px-3 py-1 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 text-purple-400 rounded-lg text-[10px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                               >
                                 <span>View Report</span>
                                 <ArrowRight size={10} />
                               </button>
                             </td>

                             <td className="py-4 px-5 text-center">
                               <button
                                 onClick={() => handleDeleteRow(item.id)}
                                 className="p-1.5 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/20 hover:border-rose-900/40 text-rose-400 rounded-lg transition cursor-pointer"
                                 title="Delete Record"
                               >
                                 <Trash2 size={13} />
                               </button>
                             </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* PAGINATION PANEL CONTROLS */}
                <div className="bg-slate-950/30 border-t border-slate-800/80 px-6 py-4 flex items-center justify-between">
                  <span className="text-slate-400 text-[11px] font-medium">
                    Showing <span className="text-white font-bold">{activeList.length > 0 ? indexOfFirstItem + 1 : 0}</span> to{' '}
                    <span className="text-white font-bold">{Math.min(indexOfLastItem, activeList.length)}</span> of{' '}
                    <span className="text-white font-bold">{activeList.length}</span> records
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    
                    <span className="text-xs text-slate-400 font-bold px-2">
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 bg-slate-950 border border-slate-850 rounded-lg text-slate-400 hover:text-white transition disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-16 text-center rounded-2xl text-slate-500 text-xs">
                No matching preparation logs found in {activeTab === 'interviews' ? 'Mock Interviews' : 'ATS Reports'}.
              </div>
            )}

          </div>
        )}

      </div>

      {/* CLEAR ALL HISTORY CONFIRMATION MODAL */}
      <AnimatePresence>
        {showClearModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearModal(false)}
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
                  <ShieldAlert size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1">Clear Entire Preparation History?</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Are you sure? This action will permanently delete all:
                  </p>
                  <ul className="list-disc pl-5 text-[11px] text-slate-400 mt-2 space-y-1">
                    <li>ATS scanner reports</li>
                    <li>Skill gap assessment logs</li>
                    <li>Generated learning roadmaps</li>
                    <li>Mock interview recording details</li>
                  </ul>
                  <p className="text-xs text-slate-400 mt-3 leading-relaxed">
                    This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearModal(false)}
                  className="flex-1 py-2.5 bg-slate-950 hover:bg-slate-850 border border-slate-850 text-slate-400 text-xs font-bold uppercase rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearAllHistory}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 size={12} />
                  {isDeleting ? 'Clearing...' : 'Clear All'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </LayoutShell>
  );
}
