import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer,
  PieChart, Pie, Cell, Tooltip
} from 'recharts';
import {
  ClipboardList, TrendingUp, MessageSquare, Mic2, Award,
  ChevronDown, ChevronUp, Sparkles, AlertTriangle, CheckCircle2, BarChart2
} from 'lucide-react';
import ApiService from '../services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

function ScoreRing({ score, percentile }) {
  const data = [{ value: score, fill: '#6366f1' }];
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-40">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%"
            data={data} startAngle={90} endAngle={-270}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar background={{ fill: 'rgba(255,255,255,0.03)' }} dataKey="value"
              cornerRadius={8} fill="#6366f1"
              style={{ filter: 'drop-shadow(0 0 10px rgba(99,102,241,0.6))' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="text-4xl font-black text-white"
          >{score}</motion.span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
      </div>
      <div className="text-center">
        <div className="flex items-center gap-1.5 justify-center">
          <Award size={13} className="text-amber-400" />
          <span className="text-sm font-bold text-amber-400">Top {100 - percentile}%</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5">of all candidates</p>
      </div>
    </div>
  );
}

function ToneChart({ toneData }) {
  const data = [
    { name: 'Positive', value: toneData.positive, color: '#10b981' },
    { name: 'Neutral',  value: toneData.neutral,  color: '#6366f1' },
    { name: 'Filler',   value: toneData.filler,   color: '#f59e0b' },
    { name: 'Negative', value: toneData.negative,  color: '#f43f5e' },
  ];

  return (
    <div className="flex items-center gap-4">
      <div className="w-24 h-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={28} outerRadius={42}
              dataKey="value" strokeWidth={0}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} style={{ filter: `drop-shadow(0 0 4px ${entry.color}60)` }} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 space-y-2">
        {data.map(({ name, value, color }) => (
          <div key={name} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
            <span className="text-xs text-slate-400 flex-1">{name}</span>
            <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: color }}
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
              />
            </div>
            <span className="text-xs font-bold text-slate-300 w-8 text-right">{value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SoftSkillBar({ skill, i }) {
  const color = skill.score >= 85 ? '#10b981' : skill.score >= 70 ? '#6366f1' : '#f59e0b';
  return (
    <motion.div custom={i} variants={cardVariants} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs text-slate-300 font-medium">{skill.skill}</span>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-medium ${skill.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {skill.delta >= 0 ? '+' : ''}{skill.delta}
          </span>
          <span className="text-xs font-bold text-slate-200">{skill.score}</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}80` }}
          initial={{ width: 0 }}
          animate={{ width: `${skill.score}%` }}
          transition={{ delay: i * 0.08 + 0.2, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </motion.div>
  );
}

function QAReviewCard({ qa, i }) {
  const [expanded, setExpanded] = useState(i === 0);
  const scoreColor = qa.aiScore >= 85 ? '#10b981' : qa.aiScore >= 70 ? '#6366f1' : '#f59e0b';

  return (
    <motion.div custom={i} variants={cardVariants} initial="hidden" animate="visible"
      className="glass-card overflow-hidden"
    >
      <div
        className="p-5 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 text-indigo-400 font-bold text-sm">
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 leading-snug">{qa.question}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="text-[10px] text-slate-500">AI Score</p>
              <p className="text-lg font-black" style={{ color: scoreColor }}>{qa.aiScore}</p>
            </div>
            {expanded ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
          </div>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-white/[0.05]"
        >
          <div className="p-5 space-y-4">
            {/* Candidate answer */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Mic2 size={12} className="text-slate-500" />
                <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Your Answer</p>
              </div>
              <div className="px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <p className="text-sm text-slate-300 leading-relaxed italic">"{qa.candidateAnswer}"</p>
              </div>
            </div>

            {/* AI feedback */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <AlertTriangle size={12} className="text-amber-400" />
                <p className="text-[10px] uppercase tracking-wider text-amber-500 font-semibold">AI Feedback</p>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">{qa.feedback}</p>
            </div>

            {/* Perfect response */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-emerald-400" />
                <p className="text-[10px] uppercase tracking-wider text-emerald-500 font-semibold">Perfect Response</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15"
                style={{ boxShadow: '0 0 20px rgba(16,185,129,0.05)' }}
              >
                <p className="text-sm text-emerald-100/80 leading-relaxed">{qa.perfectResponse}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function FeedbackReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getFeedbackReport().then(({ data }) => {
      setData(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-xl" />)}
        </div>
        <div className="skeleton h-40 rounded-xl" />
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
        <div>
          <p className="section-title mb-1">Post-Session Analytics</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ClipboardList size={22} className="text-indigo-400" />
            AI Feedback Report
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {data.roundType} · <span className="text-cyan-400">{data.targetRole}</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500">{new Date(data.sessionDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
          <p className="text-[10px] text-slate-600 font-mono mt-0.5">{data.reportId}</p>
        </div>
      </motion.div>

      {/* Top metrics row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Overall score ring */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card p-6 flex flex-col items-center justify-center gap-2 border border-indigo-500/20"
          style={{ boxShadow: '0 0 30px rgba(99,102,241,0.12)' }}
        >
          <ScoreRing score={data.overallScore} percentile={data.percentile} />
          <div className="text-center mt-1">
            <p className="text-xs font-semibold text-slate-300">Overall Performance</p>
            <p className="text-[11px] text-slate-500">{data.roundType} Round</p>
          </div>
        </motion.div>

        {/* Soft skills */}
        <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card p-5 space-y-3"
        >
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={15} className="text-cyan-400" />
            <h3 className="text-sm font-semibold text-slate-200">Soft Skill Breakdown</h3>
          </div>
          {data.softSkills.map((s, i) => (
            <SoftSkillBar key={s.skill} skill={s} i={i} />
          ))}
        </motion.div>

        {/* Tone analysis */}
        <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible"
          className="glass-card p-5 space-y-4"
        >
          <div className="flex items-center gap-2">
            <BarChart2 size={15} className="text-amber-400" />
            <h3 className="text-sm font-semibold text-slate-200">Semantic Tone Analysis</h3>
          </div>
          <ToneChart toneData={data.toneAnalysis} />
          <div>
            <p className="text-[10px] text-slate-500 mb-1.5">Top Filler Words</p>
            <div className="flex flex-wrap gap-1.5">
              {data.toneAnalysis.topFillerWords.map((w) => (
                <span key={w} className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono">
                  "{w}"
                </span>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed italic">{data.toneAnalysis.sentiment}</p>
          </div>
        </motion.div>
      </div>

      {/* Improvement Plan */}
      <motion.div custom={3} variants={cardVariants} initial="hidden" animate="visible"
        className="glass-card p-5 border border-amber-500/10"
      >
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle size={15} className="text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-200">Improvement Action Plan</h3>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
          {data.improvementPlan.map((tip, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 + 0.4 }}
              className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{tip}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Q&A Review */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare size={15} className="text-indigo-400" />
          <h3 className="text-sm font-semibold text-slate-200">Inline Q&A Review</h3>
          <span className="ml-auto text-xs text-slate-500">{data.qaReviews.length} questions reviewed</span>
        </div>
        <div className="space-y-3">
          {data.qaReviews.map((qa, i) => (
            <QAReviewCard key={qa.id} qa={qa} i={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
