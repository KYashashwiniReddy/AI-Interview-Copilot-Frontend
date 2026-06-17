import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileSearch,
  BarChart3,
  Video,
  ClipboardList,
  Zap,
  ChevronRight,
  Settings,
  Bell,
  User,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, section: 'main' },
  { id: 'resume',    label: 'Resume ATS',     icon: FileSearch,    section: 'main' },
  { id: 'skillgap',  label: 'Skill Gap',      icon: BarChart3,     section: 'main' },
  { id: 'interview', label: 'Mock Interview',  icon: Video,         section: 'main' },
  { id: 'feedback',  label: 'AI Feedback',     icon: ClipboardList, section: 'main' },
];

const itemVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.06, duration: 0.3, ease: 'easeOut' },
  }),
};

export default function SidebarNav({ activeView, setActiveView }) {
  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-64 h-screen flex flex-col relative z-20 shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(9,13,22,0.95) 0%, rgba(3,7,18,0.98) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Logo / Branding */}
      <div className="p-5 border-b border-white/[0.05]">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-3"
        >
          <div className="relative w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-glow-pulse">
            <Zap size={16} className="text-indigo-400" />
            <div className="absolute inset-0 rounded-xl bg-indigo-500/10 blur-md" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Interview</p>
            <p className="text-xs font-semibold text-gradient-indigo">Copilot AI</p>
          </div>
        </motion.div>
      </div>

      {/* User Card */}
      <div className="mx-3 mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/60 to-cyan-500/40 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-white">
            KR
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">Kya Shashwini</p>
            <p className="text-[10px] text-slate-500 truncate">Staff SWE Candidate</p>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.6)' }} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 pt-4 space-y-1">
        <p className="section-title px-2 mb-3">Navigation</p>
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <motion.button
              key={item.id}
              custom={i}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              onClick={() => setActiveView(item.id)}
              className={`sidebar-nav-item w-full ${isActive ? 'active' : ''}`}
            >
              <Icon size={16} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
              <span className="flex-1 text-left">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="w-1 h-4 rounded-full bg-indigo-400"
                  style={{ boxShadow: '0 0 8px rgba(99,102,241,0.8)' }}
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-3 border-t border-white/[0.05] space-y-1">
        <button className="sidebar-nav-item w-full">
          <Bell size={15} className="text-slate-500" />
          <span>Notifications</span>
          <span className="ml-auto w-5 h-5 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
        </button>
        <button className="sidebar-nav-item w-full">
          <Settings size={15} className="text-slate-500" />
          <span>Settings</span>
        </button>
      </div>
    </motion.aside>
  );
}
