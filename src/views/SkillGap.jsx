import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, BookOpen, FolderGit2, Target, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import ApiService from '../services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

const statusConfig = {
  critical:     { label: 'Critical',     cls: 'badge-critical',     bar: '#f43f5e', glow: 'rgba(244,63,94,0.3)' },
  intermediate: { label: 'Intermediate', cls: 'badge-intermediate', bar: '#f59e0b', glow: 'rgba(245,158,11,0.3)' },
  mastered:     { label: 'Mastered',     cls: 'badge-mastered',     bar: '#10b981', glow: 'rgba(16,185,129,0.3)' },
};

function SkillCard({ skill, i }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[skill.status];
  const gap = skill.required - skill.current;

  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="glass-card overflow-hidden"
    >
      <div
        className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-semibold text-slate-200">{skill.name}</h3>
              <span className={`metric-badge ${cfg.cls}`}>{cfg.label}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{skill.category}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="text-xs text-slate-500">Gap</p>
              <p className={`text-sm font-bold ${gap > 20 ? 'text-rose-400' : gap > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {gap > 0 ? `+${gap}` : '✓'}
              </p>
            </div>
            {skill.resources.length > 0 && (
              expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />
            )}
          </div>
        </div>

        {/* Progress comparison */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-12 shrink-0">Current</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: cfg.bar, boxShadow: `0 0 6px ${cfg.glow}` }}
                initial={{ width: 0 }}
                animate={{ width: `${skill.current}%` }}
                transition={{ delay: i * 0.06 + 0.3, duration: 0.9, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-300 w-6 text-right">{skill.current}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-slate-500 w-12 shrink-0">Required</span>
            <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-slate-600"
                initial={{ width: 0 }}
                animate={{ width: `${skill.required}%` }}
                transition={{ delay: i * 0.06 + 0.4, duration: 0.9, ease: 'easeOut' }}
              />
            </div>
            <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{skill.required}</span>
          </div>
        </div>
      </div>

      {/* Expandable resources */}
      <AnimatePresence>
        {expanded && skill.resources.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/[0.05]"
          >
            <div className="p-4 pt-3 space-y-2">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold flex items-center gap-1">
                <Sparkles size={10} />Recommended Resources
              </p>
              {skill.resources.map((r, ri) => (
                <a
                  key={ri}
                  href={r.url}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] transition-colors group"
                >
                  {r.type === 'course' ? (
                    <BookOpen size={13} className="text-cyan-400" />
                  ) : (
                    <FolderGit2 size={13} className="text-amber-400" />
                  )}
                  <span className="text-xs text-slate-300 group-hover:text-slate-100 transition-colors">{r.label}</span>
                  <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full ${r.type === 'course' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
                    {r.type}
                  </span>
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function SkillGap() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    ApiService.getSkillGapAnalysis().then(({ data }) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-6 rounded-full" />)}
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const counts = {
    all: data.skills.length,
    critical: data.skills.filter(s => s.status === 'critical').length,
    intermediate: data.skills.filter(s => s.status === 'intermediate').length,
    mastered: data.skills.filter(s => s.status === 'mastered').length,
  };

  const filtered = filter === 'all' ? data.skills : data.skills.filter(s => s.status === filter);

  const filters = [
    { key: 'all', label: 'All Skills', count: counts.all, cls: 'border-white/10 text-slate-400' },
    { key: 'critical', label: 'Critical', count: counts.critical, cls: 'border-rose-500/20 text-rose-400' },
    { key: 'intermediate', label: 'Intermediate', count: counts.intermediate, cls: 'border-amber-500/20 text-amber-400' },
    { key: 'mastered', label: 'Mastered', count: counts.mastered, cls: 'border-emerald-500/20 text-emerald-400' },
  ];

  return (
    <div className="p-6 space-y-5 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-title mb-1">Gap Analysis Engine</p>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <BarChart3 size={22} className="text-indigo-400" />
          Skill Gap Analysis
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">
          Target: <span className="text-cyan-400">{data.targetRole}</span>
        </p>
      </motion.div>

      {/* Summary bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card p-4 flex items-center gap-6"
      >
        <Target size={16} className="text-indigo-400 shrink-0" />
        <div className="flex items-center gap-4 flex-1">
          {[
            { label: 'Critical Gaps', val: counts.critical, color: 'text-rose-400' },
            { label: 'Developing', val: counts.intermediate, color: 'text-amber-400' },
            { label: 'Mastered', val: counts.mastered, color: 'text-emerald-400' },
          ].map(({ label, val, color }) => (
            <div key={label} className="text-center">
              <p className={`text-xl font-black ${color}`}>{val}</p>
              <p className="text-[10px] text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="flex-1 h-2 rounded-full bg-white/[0.05] overflow-hidden flex">
          <div className="h-full bg-rose-500/60 rounded-l-full" style={{ width: `${(counts.critical / counts.all) * 100}%` }} />
          <div className="h-full bg-amber-500/60" style={{ width: `${(counts.intermediate / counts.all) * 100}%` }} />
          <div className="h-full bg-emerald-500/60 rounded-r-full" style={{ width: `${(counts.mastered / counts.all) * 100}%` }} />
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map(({ key, label, count, cls }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200
              ${filter === key ? `${cls} bg-white/[0.05]` : 'border-white/[0.06] text-slate-500 hover:text-slate-300'}`}
          >
            {label} <span className="ml-1 opacity-60">{count}</span>
          </button>
        ))}
      </div>

      {/* Skills grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((skill, i) => (
            <SkillCard key={skill.id} skill={skill} i={i} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
