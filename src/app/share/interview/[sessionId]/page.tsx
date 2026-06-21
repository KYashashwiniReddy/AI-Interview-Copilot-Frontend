'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { interviewApi } from '../../../../lib/api';
import { useTheme } from '../../../../context/ThemeContext';
import {
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle,
  XCircle,
  ExternalLink
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function PublicInterviewReport() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadPublicReport() {
      try {
        const data = await interviewApi.getPublicReport(sessionId);
        setSession(data.session);
        setQuestions(data.session.questions || []);
      } catch (err) {
        setError('Failed to load shared interview report. The link may have expired or is invalid.');
      } finally {
        setLoading(false);
      }
    }
    loadPublicReport();
  }, [sessionId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const toggleQuestion = (id: string) => {
    setExpandedQId(expandedQId === id ? null : id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center max-w-md w-full shadow-xl">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={36} />
          <h3 className="text-base font-bold text-white mb-2">Failed to Load Report</h3>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-900/20"
          >
            Go to NovaHire AI
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 md:p-12 transition-colors duration-300 ${
      isDark ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'
    }`}>
      <div className="max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-full">
        
        {/* BRAND HEADER BAR */}
        <div className="flex justify-between items-center print:hidden pb-2">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = '/'}>
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm">NH</span>
            <span className="font-extrabold text-sm tracking-tight text-white">NovaHire AI</span>
          </div>
          <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
            <span>Public Shared Performance Record</span>
            <ExternalLink size={10} />
          </span>
        </div>

        {/* REPORT HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl print:bg-white print:text-black print:border-none shadow-lg">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1 print:hidden">
              Shared Candidate Scorecard
            </span>
            <h1 className="text-xl font-black text-white print:text-black leading-none">
              {session.role} Interview Performance
            </h1>
            <p className="text-slate-400 print:text-slate-500 text-xs mt-1">
              {session.company} • {session.type} Interview • {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 hover:border-slate-800 rounded-xl text-xs font-bold transition text-slate-350 print:hidden cursor-pointer"
          >
            <Printer size={14} />
            <span>Download / Print</span>
          </button>
        </div>

        {/* OVERALL METRICS PANEL */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl grid md:grid-cols-3 gap-6 items-center print:bg-white print:text-black print:border-slate-200 shadow-md">
          {/* Circular Score Gauge */}
          <div className="flex justify-center md:border-r border-slate-850 print:border-slate-250 py-4">
            <div className="relative w-36 h-36 flex items-center justify-center bg-slate-955 print:bg-slate-100 rounded-full border border-slate-850 print:border-slate-300 shadow-inner">
              <div className="text-center">
                <span className="text-4xl font-black text-purple-400 print:text-purple-700">
                  {session.overallScore}%
                </span>
                <span className="block text-[9px] text-slate-500 font-bold uppercase mt-1">Overall rating</span>
              </div>
            </div>
          </div>

          {/* Subscores breakdown */}
          <div className="md:col-span-2 space-y-4 text-left">
            <h3 className="text-sm font-bold text-white print:text-black">Performance categories</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Technical Score', value: session.technicalScore },
                { label: 'Communication', value: session.communicationScore },
                { label: 'Confidence Score', value: session.confidenceScore },
                { label: 'Grammar Accuracy', value: session.grammarScore }
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-[11px] font-semibold text-slate-400 print:text-slate-650 mb-1">
                    <span>{s.label}</span>
                    <span>{s.value}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 print:bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* OVERALL CRITIQUE */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-left space-y-2 print:bg-white print:text-black print:border-slate-200 shadow-md">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
            <Award size={16} className="text-purple-400" />
            AI Overall Evaluation Feedback
          </h3>
          <p className="text-xs text-slate-300 print:text-slate-705 leading-relaxed">
            {session.feedback}
          </p>
        </div>

        {/* QUESTIONS ANALYSIS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider text-left">
            Question-wise Analysis & expected answers
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const hasAns = !!q.answer;
              const isExpanded = expandedQId === q.id;
              
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden print:bg-white print:text-black print:border-slate-200 shadow-sm"
                >
                  <div
                    onClick={() => toggleQuestion(q.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-950/20 transition print:pointer-events-none"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold text-slate-500">Q{idx + 1}</span>
                      <h4 className="text-xs font-bold text-white print:text-black text-left leading-relaxed">
                        {q.text}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 print:hidden">
                      {hasAns ? (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {q.answer.score}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-455 bg-rose-500/10 px-2 py-0.5 rounded">
                          No Answer
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-slate-505" /> : <ChevronDown size={16} className="text-slate-505" />}
                    </div>
                  </div>

                  {(isExpanded || typeof window !== 'undefined' && window.matchMedia('print').matches) && (
                    <div className="p-5 bg-slate-950/40 print:bg-white border-t border-slate-850 print:border-slate-200 space-y-4 text-left">
                      <div>
                        <span className="text-[9px] font-bold text-slate-505 uppercase tracking-wide block mb-1">Your Answer Given</span>
                        <p className="text-xs text-slate-300 print:text-slate-705 leading-relaxed bg-slate-950 print:bg-slate-50 p-3 rounded-lg border border-slate-900 print:border-slate-200">
                          {q.answer?.answerText || '[No response submitted for this question]'}
                        </p>
                      </div>

                      {q.answer && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div className="p-3 bg-purple-500/5 border border-purple-500/10 rounded-xl text-center">
                              <span className="text-[8px] font-bold text-purple-400 uppercase tracking-wider block">Final Score</span>
                              <span className="text-sm font-black text-white">{q.answer.score}%</span>
                            </div>
                            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-center">
                              <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-wider block">Technical Accuracy</span>
                              <span className="text-sm font-black text-white">{q.answer.correctnessScore}%</span>
                            </div>
                            <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-center">
                              <span className="text-[8px] font-bold text-blue-400 uppercase tracking-wider block">Concept Coverage</span>
                              <span className="text-sm font-black text-white">{q.answer.conceptCoverage !== null ? q.answer.conceptCoverage : q.answer.correctnessScore}%</span>
                            </div>
                            <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-center">
                              <span className="text-[8px] font-bold text-amber-400 uppercase tracking-wider block">Communication</span>
                              <span className="text-sm font-black text-white">{q.answer.communicationScore}%</span>
                            </div>
                            <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-center">
                              <span className="text-[8px] font-bold text-rose-450 uppercase tracking-wider block">Confidence</span>
                              <span className="text-sm font-black text-white">{q.answer.confidenceScore}%</span>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                              <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                                <CheckCircle size={10} />
                                Expected Answer
                              </span>
                              <p className="text-xs text-slate-300 print:text-slate-600 leading-relaxed">
                                {q.answer.expectedAnswer}
                              </p>
                            </div>

                            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5">
                              <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider block flex items-center gap-1">
                                <XCircle size={10} />
                                Critique & Improvement Tips
                              </span>
                              <p className="text-xs text-slate-300 print:text-slate-650 leading-relaxed">
                                {q.answer.improvementTips}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
