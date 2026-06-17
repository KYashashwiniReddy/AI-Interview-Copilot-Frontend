import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis
} from 'recharts';
import { FileSearch, AlertCircle, CheckCircle2, Lightbulb, Tag, TrendingUp, BarChart2 } from 'lucide-react';
import FileUploader from '../components/FileUploader';
import ApiService from '../services/api';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
};

function CircularScore({ score, size = 160 }) {
  const data = [{ value: score, fill: '#6366f1' }];
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart cx="50%" cy="50%" innerRadius="75%" outerRadius="100%"
          data={data} startAngle={90} endAngle={90 - 360 * (score / 100)}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <RadialBar
            background={{ fill: 'rgba(255,255,255,0.04)' }}
            dataKey="value"
            cornerRadius={8}
            fill="#6366f1"
            style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.5))' }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5, type: 'spring' }}
          className="text-4xl font-black text-white"
        >
          {score}
        </motion.span>
        <span className="text-xs text-slate-500 font-medium">ATS Score</span>
      </div>
    </div>
  );
}

function DimensionBar({ dim, i }) {
  const color = dim.score >= 90 ? '#10b981' : dim.score >= 75 ? '#6366f1' : dim.score >= 60 ? '#f59e0b' : '#f43f5e';
  return (
    <motion.div custom={i} variants={cardVariants} initial="hidden" animate="visible" className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-300">{dim.label}</span>
        <span className="text-xs font-bold" style={{ color }}>{dim.score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}80` }}
          initial={{ width: 0 }}
          animate={{ width: `${dim.score}%` }}
          transition={{ delay: i * 0.08 + 0.3, duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <p className="text-[11px] text-slate-600">{dim.notes}</p>
    </motion.div>
  );
}

const priorityMap = {
  high:   { label: 'High',   cls: 'badge-critical' },
  medium: { label: 'Medium', cls: 'badge-intermediate' },
  low:    { label: 'Low',    cls: 'badge-mastered' },
};

export default function ResumeAnalyzer() {
  const [result, setResult] = useState(null);
  const [hasScanned, setHasScanned] = useState(false);

  const handleFileReady = useCallback(async (file) => {
    const { data } = await ApiService.analyzeResume(file);
    setResult(data);
    setHasScanned(true);
  }, []);

  return (
    <div className="p-6 space-y-6 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <p className="section-title mb-1">ATS Engine</p>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FileSearch size={22} className="text-indigo-400" />
          Resume Analyzer
        </h1>
        <p className="text-sm text-slate-400 mt-0.5">Upload your resume for an in-depth ATS compatibility scan</p>
      </motion.div>

      {/* Uploader */}
      <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
        <FileUploader onFileReady={handleFileReady} />
      </motion.div>

      {/* Results */}
      <AnimatePresence>
        {hasScanned && result && (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            {/* Score overview row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Big score ring */}
              <motion.div
                custom={0} variants={cardVariants} initial="hidden" animate="visible"
                className="glass-card p-6 flex flex-col items-center justify-center gap-3 border border-indigo-500/20"
                style={{ boxShadow: '0 0 30px rgba(99,102,241,0.12)' }}
              >
                <CircularScore score={result.overallScore} />
                <div className="text-center">
                  <p className="text-xs text-slate-500 font-mono">{result.fileName}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Scan ID: {result.scanId}</p>
                </div>
                <div className={`metric-badge ${result.overallScore >= 80 ? 'badge-mastered' : result.overallScore >= 65 ? 'badge-intermediate' : 'badge-critical'} text-sm`}>
                  {result.overallScore >= 80 ? '✓ Strong ATS Match' : result.overallScore >= 65 ? '⚠ Moderate Match' : '✗ Needs Work'}
                </div>
              </motion.div>

              {/* Dimension bars */}
              <motion.div
                custom={1} variants={cardVariants} initial="hidden" animate="visible"
                className="xl:col-span-2 glass-card p-6 space-y-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <BarChart2 size={16} className="text-indigo-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Score Breakdown</h3>
                </div>
                {result.dimensions.map((dim, i) => (
                  <DimensionBar key={dim.key} dim={dim} i={i} />
                ))}
              </motion.div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Missing keywords */}
              <motion.div
                custom={2} variants={cardVariants} initial="hidden" animate="visible"
                className="glass-card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Tag size={15} className="text-rose-400" />
                  <h3 className="text-sm font-semibold text-slate-200">Missing Keywords</h3>
                  <span className="ml-auto text-xs text-rose-400 font-medium">{result.missingKeywords.length} found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.missingKeywords.map((kw) => (
                    <motion.div
                      key={kw.word}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                        kw.priority === 'high' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        kw.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-slate-500/10 text-slate-400 border-slate-500/20'
                      }`}
                    >
                      <AlertCircle size={10} />
                      {kw.word}
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Suggestions */}
              <motion.div
                custom={3} variants={cardVariants} initial="hidden" animate="visible"
                className="glass-card p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={15} className="text-amber-400" />
                  <h3 className="text-sm font-semibold text-slate-200">AI Suggestions</h3>
                </div>
                <ul className="space-y-3">
                  {result.suggestions.map((s, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 + 0.3 }}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/15 border border-amber-500/20 flex items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-amber-400">{i + 1}</span>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{s}</p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
