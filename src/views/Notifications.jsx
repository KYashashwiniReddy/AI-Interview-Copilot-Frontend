import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, BellRing, CheckCircle2, AlertCircle, Info, Zap,
  FileSearch, Video, BarChart3, ClipboardList, X, Filter,
  TrendingUp, Clock,
} from 'lucide-react';

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const NOTIFICATIONS = [
  {
    id: 1, type: 'success', category: 'resume', read: false, pinned: true,
    title: 'ATS Score Improved!',
    message: 'Your latest resume scored 87/100 — up 12 points from last scan.',
    ts: Date.now() - 1000 * 60 * 8,
    icon: FileSearch,
    color: 'emerald',
  },
  {
    id: 2, type: 'info', category: 'interview', read: false, pinned: false,
    title: 'Mock Interview Completed',
    message: 'Great job! You completed the "System Design" mock interview session.',
    ts: Date.now() - 1000 * 60 * 45,
    icon: Video,
    color: 'cyan',
  },
  {
    id: 3, type: 'warning', category: 'skillgap', read: false, pinned: false,
    title: 'Skill Gap Detected',
    message: 'Kubernetes proficiency is below the target threshold for Staff SWE roles.',
    ts: Date.now() - 1000 * 60 * 60 * 2,
    icon: BarChart3,
    color: 'amber',
  },
  {
    id: 4, type: 'info', category: 'feedback', read: true, pinned: false,
    title: 'AI Feedback Ready',
    message: 'Your feedback report for the "Behavioral Questions" session is now available.',
    ts: Date.now() - 1000 * 60 * 60 * 5,
    icon: ClipboardList,
    color: 'indigo',
  },
  {
    id: 5, type: 'success', category: 'milestone', read: true, pinned: false,
    title: 'New Milestone Reached 🏆',
    message: 'You\'ve completed 10 mock interviews. Consistency is key — keep going!',
    ts: Date.now() - 1000 * 60 * 60 * 24,
    icon: TrendingUp,
    color: 'emerald',
  },
  {
    id: 6, type: 'warning', category: 'resume', read: true, pinned: false,
    title: 'Resume Keyword Alert',
    message: '5 high-priority keywords are missing from your resume. Update it to boost your ATS score.',
    ts: Date.now() - 1000 * 60 * 60 * 26,
    icon: AlertCircle,
    color: 'rose',
  },
  {
    id: 7, type: 'info', category: 'system', read: true, pinned: false,
    title: 'Weekly Progress Report',
    message: 'Your readiness score increased by 18 points this week. Check your dashboard for details.',
    ts: Date.now() - 1000 * 60 * 60 * 48,
    icon: Zap,
    color: 'indigo',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-400' },
  cyan:    { bg: 'bg-cyan-500/10',    text: 'text-cyan-400',    border: 'border-cyan-500/20',    dot: 'bg-cyan-400' },
  amber:   { bg: 'bg-amber-500/10',   text: 'text-amber-400',   border: 'border-amber-500/20',   dot: 'bg-amber-400' },
  indigo:  { bg: 'bg-indigo-500/10',  text: 'text-indigo-400',  border: 'border-indigo-500/20',  dot: 'bg-indigo-400' },
  rose:    { bg: 'bg-rose-500/10',    text: 'text-rose-400',    border: 'border-rose-500/20',    dot: 'bg-rose-400' },
};

function timeAgo(ts) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const FILTERS = ['all', 'unread', 'resume', 'interview', 'skillgap', 'feedback'];

function NotificationItem({ notif, onDismiss, i }) {
  const c = colorMap[notif.color] || colorMap.indigo;
  const Icon = notif.icon;

  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
      layout
      className={`glass-card p-4 border transition-all duration-200 group relative
        ${notif.read ? 'border-white/[0.05] opacity-70' : `border ${c.border}`}
        hover:bg-white/[0.03]`}
      style={!notif.read ? { boxShadow: `0 0 20px rgba(99,102,241,0.06)` } : {}}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${c.dot}`}
          style={{ boxShadow: `0 0 6px currentColor` }}
        />
      )}

      <div className="flex items-start gap-3 pr-4">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center shrink-0 mt-0.5`}>
          <Icon size={16} className={c.text} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className={`text-sm font-semibold leading-tight ${notif.read ? 'text-slate-300' : 'text-white'}`}>
              {notif.title}
            </p>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">{notif.message}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Clock size={10} className="text-slate-600" />
            <span className="text-[11px] text-slate-600">{timeAgo(notif.ts)}</span>
            {notif.pinned && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/20 text-[10px] text-indigo-400 font-medium">
                Pinned
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => onDismiss(notif.id)}
        className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center
          opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-rose-500/20 hover:border-rose-500/30"
      >
        <X size={10} className="text-slate-400 hover:text-rose-400" />
      </button>
    </motion.div>
  );
}

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [filter, setFilter] = useState('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filtered = notifications.filter((n) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.category === filter;
  });

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const dismiss = (id) => setNotifications((prev) => prev.filter((n) => n.id !== id));
  const clearAll = () => setNotifications([]);

  return (
    <div className="p-6 space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/20 flex items-center justify-center">
              <BellRing size={18} className="text-indigo-400" />
            </div>
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center"
                style={{ boxShadow: '0 0 10px rgba(99,102,241,0.6)' }}
              >
                {unreadCount}
              </div>
            )}
          </div>
          <div>
            <p className="section-title mb-0.5">Activity Center</p>
            <h1 className="text-2xl font-bold text-white">Notifications</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="cyber-btn text-xs flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="cyber-btn text-xs flex items-center gap-1.5"
              style={{ borderColor: 'rgba(244,63,94,0.3)', color: '#fb7185', background: 'rgba(244,63,94,0.06)' }}
            >
              <X size={12} /> Clear all
            </button>
          )}
        </div>
      </motion.div>

      {/* Filter chips */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex items-center gap-2 flex-wrap"
      >
        <Filter size={13} className="text-slate-500 shrink-0" />
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 capitalize
              ${filter === f
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-white/[0.03] border-white/[0.06] text-slate-500 hover:text-slate-300 hover:bg-white/[0.05]'
              }`}
          >
            {f}{f === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
          </button>
        ))}
      </motion.div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                <Bell size={24} className="text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">All caught up!</p>
              <p className="text-xs text-slate-600 mt-1">No notifications in this category.</p>
            </motion.div>
          ) : (
            filtered.map((notif, i) => (
              <NotificationItem key={notif.id} notif={notif} onDismiss={dismiss} i={i} />
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
