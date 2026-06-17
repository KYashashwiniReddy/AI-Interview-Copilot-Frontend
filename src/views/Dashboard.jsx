import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import {
  TrendingUp, Activity, FileSearch, BarChart3, Video, ClipboardList,
  ArrowUpRight, ArrowDownRight, Minus, Clock, ChevronRight, Zap,
} from 'lucide-react';
import ApiService from '../services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

function MetricGauge({ value, max = 100, label, color = '#6366f1', size = 96 }) {
  const radius = (size - 12) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = value / max;
  const strokeDashoffset = circ * (1 - pct * 0.75);
  const startAngle = 135;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size * 0.75 }}>
        <svg width={size} height={size} className="absolute top-0 left-0" style={{ transform: 'rotate(-90deg)', marginTop: -size * 0.125 }}>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={8} strokeDasharray={`${circ * 0.75} ${circ}`} strokeDashoffset={0} strokeLinecap="round" />
          <motion.circle
            cx={size/2} cy={size/2} r={radius}
            fill="none" stroke={color} strokeWidth={8}
            strokeDasharray={`${circ * 0.75} ${circ}`}
            strokeLinecap="round"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
            style={{ filter: `drop-shadow(0 0 6px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center mt-3">
          <span className="text-xl font-bold text-white">{value}</span>
        </div>
      </div>
      <span className="text-xs text-slate-500 text-center">{label}</span>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, delta, i }) {
  const colorMap = {
    indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', glow: '0 0 20px rgba(99,102,241,0.15)' },
    cyan:   { bg: 'bg-cyan-500/10',   text: 'text-cyan-400',   border: 'border-cyan-500/20',   glow: '0 0 20px rgba(6,182,212,0.12)' },
    emerald:{ bg: 'bg-emerald-500/10',text: 'text-emerald-400',border: 'border-emerald-500/20',glow: '0 0 20px rgba(16,185,129,0.12)' },
    amber:  { bg: 'bg-amber-500/10',  text: 'text-amber-400',  border: 'border-amber-500/20',  glow: '0 0 20px rgba(245,158,11,0.12)' },
  };
  const c = colorMap[color] || colorMap.indigo;

  return (
    <motion.div
      custom={i}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`glass-card p-5 flex flex-col gap-3 border ${c.border}`}
      style={{ boxShadow: c.glow }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-xl ${c.bg} border ${c.border} flex items-center justify-center`}>
          <Icon size={16} className={c.text} />
        </div>
        {delta != null && (
          <div className={`flex items-center gap-0.5 text-xs font-medium ${delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {delta > 0 ? <ArrowUpRight size={13} /> : delta < 0 ? <ArrowDownRight size={13} /> : <Minus size={13} />}
            {Math.abs(delta)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm font-medium text-slate-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

function ActivityItem({ item }) {
  const typeMap = {
    ats_scan:       { icon: FileSearch,    color: 'text-indigo-400' },
    mock_interview: { icon: Video,         color: 'text-cyan-400'   },
    skill_gap:      { icon: BarChart3,     color: 'text-amber-400'  },
    feedback_report:{ icon: ClipboardList, color: 'text-emerald-400'},
  };
  const { icon: Icon, color } = typeMap[item.type] || { icon: Activity, color: 'text-slate-400' };
  const ts = new Date(item.ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/[0.03] transition-colors group"
    >
      <div className={`w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={13} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-300 truncate">{item.label}</p>
        <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
          <Clock size={10} />{ts}
        </p>
      </div>
      {item.score != null && (
        <div className="flex items-center gap-1">
          <span className="text-xs font-bold text-slate-200">{item.score}</span>
          {item.delta != null && (
            <span className={`text-[10px] font-medium ${item.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {item.delta >= 0 ? '+' : ''}{item.delta}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-3 py-2 text-xs border border-indigo-500/20">
      <p className="text-slate-400">{label}</p>
      <p className="text-indigo-400 font-bold mt-0.5">{payload[0].value} / 100</p>
    </div>
  );
};

export default function Dashboard({ setActiveView }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getDashboard().then(({ data }) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  const radarData = data
    ? Object.entries(data.diagnostics).map(([key, val]) => ({
        subject: key.replace(/([A-Z])/g, ' $1').trim(),
        value: val,
        fullMark: 100,
      }))
    : [];

  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <div className="skeleton h-8 w-48 mb-8" />
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="skeleton h-64 rounded-xl col-span-2" />
          <div className="skeleton h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 pb-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <p className="section-title mb-1">Command Center</p>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="text-gradient-indigo">{data.user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">Targeting: <span className="text-cyan-400">{data.user.targetRole}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="glass-card px-4 py-2.5 border border-indigo-500/20 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" style={{ boxShadow: '0 0 8px rgba(52,211,153,0.8)' }} />
            <span className="text-xs text-slate-300 font-medium">Systems Online</span>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard i={0} label="Interview Readiness" value={`${data.readinessScore}%`} sub="↑ 6% this week" icon={Zap} color="indigo" delta={6} />
        <StatCard i={1} label="ATS Score Avg" value={data.atsScoreAggregate} sub="Across 4 resumes" icon={FileSearch} color="cyan" delta={4} />
        <StatCard i={2} label="Interviews Done" value={data.interviewsCompleted} sub="14 sessions logged" icon={Video} color="emerald" delta={null} />
        <StatCard i={3} label="Gaps Closed" value={data.skillGapsClosed} sub="Out of 14 total" icon={BarChart3} color="amber" delta={null} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Weekly Progress Chart */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="xl:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="section-title mb-0.5">Weekly Progress</p>
              <h3 className="text-sm font-semibold text-slate-200">Readiness Score Trend</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
              <TrendingUp size={14} />
              +18 this week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={data.weeklyProgress} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} domain={[50, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} fill="url(#scoreGrad)"
                dot={{ fill: '#6366f1', strokeWidth: 0, r: 3 }}
                activeDot={{ r: 5, fill: '#818cf8', stroke: '#6366f1', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Diagnostic Radar */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-5"
        >
          <p className="section-title mb-0.5">Skill Radar</p>
          <h3 className="text-sm font-semibold text-slate-200 mb-2">Competency Matrix</h3>
          <ResponsiveContainer width="100%" height={190}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 9, fill: '#475569' }} />
              <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.12}
                strokeWidth={1.5} dot={{ fill: '#6366f1', r: 2 }} />
              <Radar name="Target" dataKey="fullMark" stroke="rgba(6,182,212,0.2)" fill="none" strokeWidth={1} strokeDasharray="3 3" />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Diagnostic Gauges */}
        <motion.div
          custom={6}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card p-5"
        >
          <p className="section-title mb-4">Diagnostic Summary</p>
          <div className="grid grid-cols-3 gap-3">
            <MetricGauge value={data.diagnostics.communication} label="Comm." color="#06b6d4" />
            <MetricGauge value={data.diagnostics.technical} label="Technical" color="#6366f1" />
            <MetricGauge value={data.diagnostics.problemSolving} label="Problem Solving" color="#f59e0b" />
            <MetricGauge value={data.diagnostics.cultural} label="Cultural" color="#10b981" size={80} />
            <MetricGauge value={data.diagnostics.atsOptimization} label="ATS Opt." color="#818cf8" size={80} />
          </div>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="xl:col-span-2 glass-card p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="section-title mb-0.5">Activity Feed</p>
              <h3 className="text-sm font-semibold text-slate-200">Recent Actions</h3>
            </div>
            <button className="cyber-btn text-xs flex items-center gap-1.5">
              View all <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-0.5">
            {data.recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
