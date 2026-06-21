'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutShell from '../../../../components/LayoutShell';
import { interviewApi } from '../../../../lib/api';
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
  Sparkles,
  Download
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InterviewReport() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [expandedQId, setExpandedQId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadReport() {
      try {
        const data = await interviewApi.getReport(sessionId);
        setSession(data.session);
        setQuestions(data.session.questions || []);
      } catch (err) {
        setError('Failed to load interview report data.');
      } finally {
        setLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const handleCopyShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/share/interview/${sessionId}`;
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleDownload = async (format: 'pdf' | 'docx') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(interviewApi.downloadReportUrl(sessionId, format), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Failed to download ${format.toUpperCase()} report.`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `interview_report_${session.role.replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Failed to download report.');
    }
  };

  const toggleQuestion = (id: string) => {
    setExpandedQId(expandedQId === id ? null : id);
  };

  if (loading) {
    return (
      <LayoutShell>
        <div className="min-h-[450px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  if (error || !session) {
    return (
      <LayoutShell>
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-center">
          <AlertCircle className="mx-auto text-rose-500 mb-4" size={32} />
          <h3 className="text-base font-bold text-white mb-1">Report Error</h3>
          <p className="text-xs text-slate-400 mb-4">{error || 'Session report details could not be found.'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-purple-650 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold"
          >
            Return to Dashboard
          </button>
        </div>
      </LayoutShell>
    );
  }

  const hasVideoSession = session.behavioralScore !== null && session.behavioralScore !== undefined && session.behavioralScore !== 0;

  return (
    <LayoutShell>
      <div className="max-w-4xl mx-auto space-y-8 print:p-0 print:max-w-full">
        
        {/* REPORT ACTION HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl print:bg-white print:text-black print:border-none">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1 print:hidden">
              Interview Evaluation Complete
            </span>
            <h1 className="text-xl font-black text-white print:text-black leading-none">
              Report for {session.role} Interview
            </h1>
            <p className="text-slate-400 print:text-slate-500 text-xs mt-1">
              {session.company} • {session.type} Session • {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 shrink-0 print:hidden">
            <button
              onClick={() => handleDownload('pdf')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-bold transition text-slate-300 cursor-pointer"
            >
              <Printer size={14} className="text-red-405 dark:text-red-450" />
              <span>PDF Report</span>
            </button>
            <button
              onClick={() => handleDownload('docx')}
              className="flex items-center gap-2 px-3 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded-xl text-xs font-bold transition text-slate-300 cursor-pointer"
            >
              <FileText size={14} className="text-blue-405 dark:text-blue-400" />
              <span>DOCX Report</span>
            </button>
            <button
              onClick={handleCopyShare}
              className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer select-none"
            >
              <Sparkles size={14} />
              <span>{copied ? 'Copied!' : 'Share Link'}</span>
            </button>
          </div>
        </div>

        {/* OVERALL METRICS PANEL COHORT */}
        <div className="grid md:grid-cols-2 gap-6 print:grid-cols-1">
          
          {/* TECHNICAL PERFORMANCE CARD */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg print:bg-white print:text-black print:border-slate-200">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-850 print:border-slate-200">
              <BookOpen size={16} className="text-purple-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">Technical Content Performance</h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center bg-slate-950 print:bg-slate-100 rounded-full border border-slate-850 print:border-slate-300 shadow-inner shrink-0">
                <div className="text-center">
                  <span className="text-2xl font-black text-purple-400 print:text-purple-700">
                    {session.overallScore}%
                  </span>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5">Tech Score</span>
                </div>
              </div>
              <div className="w-full space-y-2.5">
                {[
                  { label: 'Technical Accuracy', value: session.technicalScore || 0 },
                  { label: 'Communication Structure', value: session.communicationScore || 0 },
                  { label: 'Confidence Delivery', value: session.confidenceScore || 0 },
                  { label: 'Grammar Accuracy', value: session.grammarScore || 0 }
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-450 text-slate-400 print:text-slate-650 mb-0.5">
                      <span>{s.label}</span>
                      <span>{s.value}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 print:bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* BEHAVIORAL & PRESENTATION CARD */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-lg print:bg-white print:text-black print:border-slate-200">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-850 print:border-slate-200">
              <Sparkles size={16} className="text-indigo-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider print:text-black">
                {hasVideoSession ? 'Presentation & Delivery Performance' : 'Communication & Delivery Performance'}
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center bg-slate-950 print:bg-slate-100 rounded-full border border-slate-850 print:border-slate-300 shadow-inner shrink-0">
                <div className="text-center">
                  <span className="text-2xl font-black text-indigo-400 print:text-indigo-700">
                    {hasVideoSession ? session.behavioralScore : session.communicationScore}%
                  </span>
                  <span className="block text-[8px] text-slate-500 font-bold uppercase mt-0.5">
                    {hasVideoSession ? 'Behavioral' : 'Communication'}
                  </span>
                </div>
              </div>
              <div className="w-full space-y-2.5">
                {(hasVideoSession ? [
                  { label: 'Professionalism Rating', value: session.professionalismScore || 0 },
                  { label: 'Leadership Presence', value: session.leadershipPresenceScore || 0 },
                  { label: 'Eye Contact Average', value: Math.round(questions.reduce((acc, q) => acc + (q.answer?.eyeContactScore || 0), 0) / Math.max(1, questions.filter(q => q.answer).length)) },
                  { label: 'Body Language Stability', value: Math.round(questions.reduce((acc, q) => acc + (q.answer?.bodyLanguageScore || 0), 0) / Math.max(1, questions.filter(q => q.answer).length)) }
                ] : [
                  { label: 'Communication Structure', value: session.communicationScore || 0 },
                  { label: 'Confidence Delivery', value: session.confidenceScore || 0 },
                  { label: 'Grammar Accuracy', value: session.grammarScore || 0 },
                  { label: 'Leadership Presence', value: session.leadershipPresenceScore || 0 }
                ]).map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-[10px] font-semibold text-slate-400 print:text-slate-655 mb-0.5">
                      <span>{s.label}</span>
                      <span>{s.value}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-950 print:bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${s.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* OVERALL CRITIQUE STATEMENT */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-2 print:bg-white print:text-black print:border-slate-200">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider flex items-center gap-2">
            <Award size={16} className="text-purple-400" />
            AI Overall Evaluation Feedback
          </h3>
          <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed">
            {session.feedback}
          </p>
        </div>

        {/* AI STRENGTHS & AREAS OF IMPROVEMENT */}
        <div className="grid md:grid-cols-2 gap-6 print:grid-cols-1">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg print:bg-white print:text-black print:border-slate-200">
            <h3 className="text-xs font-black text-emerald-400 print:text-emerald-700 uppercase tracking-widest flex items-center gap-2">
              <CheckCircle size={16} />
              Key AI Strengths
            </h3>
            <ul className="space-y-2 text-xs text-slate-305 text-slate-300">
              {(() => {
                const parseJsonList = (str: string | null | undefined): string[] => {
                  if (!str) return [];
                  try { return JSON.parse(str); } catch { return []; }
                };
                const strengths = parseJsonList(session.behavioralStrengths);
                return strengths.length > 0 ? (
                  strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 bg-emerald-500/5 border border-emerald-500/10 print:border-slate-200 p-3 rounded-xl">
                      <span className="w-1.5 h-1.5 bg-emerald-400 print:bg-emerald-600 rounded-full mt-1.5 shrink-0" />
                      <span className="print:text-slate-750">{s}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No feedback entries generated.</p>
                );
              })()}
            </ul>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg print:bg-white print:text-black print:border-slate-200">
            <h3 className="text-xs font-black text-pink-400 print:text-pink-700 uppercase tracking-widest flex items-center gap-2">
              <XCircle size={16} />
              Areas of Improvement
            </h3>
            <ul className="space-y-2 text-xs text-slate-305 text-slate-300">
              {(() => {
                const parseJsonList = (str: string | null | undefined): string[] => {
                  if (!str) return [];
                  try { return JSON.parse(str); } catch { return []; }
                };
                const improvements = parseJsonList(session.behavioralImprovements);
                return improvements.length > 0 ? (
                  improvements.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 bg-pink-500/5 border border-pink-500/10 print:border-slate-200 p-3 rounded-xl">
                      <span className="w-1.5 h-1.5 bg-pink-400 print:bg-pink-650 print:bg-pink-600 rounded-full mt-1.5 shrink-0" />
                      <span className="print:text-slate-750">{s}</span>
                    </li>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No suggestions list generated.</p>
                );
              })()}
            </ul>
          </div>

        </div>

        {/* QUESTION BY QUESTION LIST DETAILS */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
            Question-wise Analysis & expected answers
          </h3>

          <div className="space-y-3">
            {questions.map((q, idx) => {
              const hasAns = !!q.answer;
              const isExpanded = expandedQId === q.id;
              
              return (
                <div
                  key={q.id}
                  className="bg-slate-900 border border-slate-850 rounded-2xl overflow-hidden print:bg-white print:text-black print:border-slate-200"
                >
                  {/* Collapsed Bar Trigger */}
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
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                            Tech: {q.answer.score}%
                          </span>
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                            Deliv: {q.answer.behavioralScore || 0}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                          No Answer
                        </span>
                      )}
                      {isExpanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                    </div>
                  </div>

                  {/* Expanded Content detail */}
                  {(isExpanded || (typeof window !== 'undefined' && window.matchMedia('print').matches)) && (
                    <div className="p-5 bg-slate-950/40 print:bg-white border-t border-slate-850 print:border-slate-200 text-left">
                      <div className="grid md:grid-cols-5 gap-6">
                        
                        {/* LEFT COLUMN: ANSWER & CONTENT FEEDBACK */}
                        <div className="md:col-span-3 space-y-4">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Your Answer Given</span>
                            <p className="text-xs text-slate-300 print:text-slate-700 leading-relaxed bg-slate-950 print:bg-slate-50 p-3 rounded-lg border border-slate-900 print:border-slate-200">
                              {q.answer?.answerText || '[No response submitted for this question]'}
                            </p>
                          </div>

                          {q.answer && (
                            <div className="space-y-4">
                              {/* Scoring Cards Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                                <div className="p-2 bg-purple-500/5 border border-purple-500/10 rounded-lg text-center">
                                  <span className="text-[7px] font-bold text-purple-400 uppercase tracking-wider block">Content</span>
                                  <span className="text-xs font-black text-white">{q.answer.score}%</span>
                                </div>
                                <div className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-center">
                                  <span className="text-[7px] font-bold text-emerald-400 uppercase tracking-wider block">Technical</span>
                                  <span className="text-xs font-black text-white">{q.answer.correctnessScore}%</span>
                                </div>
                                <div className="p-2 bg-blue-500/5 border border-blue-500/10 rounded-lg text-center">
                                  <span className="text-[7px] font-bold text-blue-400 uppercase tracking-wider block">Concepts</span>
                                  <span className="text-xs font-black text-white">{q.answer.conceptCoverage !== null ? q.answer.conceptCoverage : q.answer.correctnessScore}%</span>
                                </div>
                                <div className="p-2 bg-amber-500/5 border border-amber-500/10 rounded-lg text-center">
                                  <span className="text-[7px] font-bold text-amber-400 uppercase tracking-wider block">Comm.</span>
                                  <span className="text-xs font-black text-white">{q.answer.communicationScore}%</span>
                                </div>
                                <div className="p-2 bg-rose-500/5 border border-rose-500/10 rounded-lg text-center">
                                  <span className="text-[7px] font-bold text-rose-400 uppercase tracking-wider block">Conf.</span>
                                  <span className="text-xs font-black text-white">{q.answer.confidenceScore}%</span>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-4">
                                {/* Expected Answer */}
                                <div className="p-3 bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-lg space-y-1.5">
                                  <span className="text-[8px] font-bold text-purple-400 uppercase tracking-wider block flex items-center gap-1">
                                    <CheckCircle size={10} />
                                    Expected Answer
                                  </span>
                                  <p className="text-[11px] text-slate-300 print:text-slate-600 leading-relaxed">
                                    {q.answer.expectedAnswer}
                                  </p>
                                </div>

                                {/* Critique & improvement tips */}
                                <div className="p-3 bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-lg space-y-1.5">
                                  <span className="text-[8px] font-bold text-pink-400 uppercase tracking-wider block flex items-center gap-1">
                                    <XCircle size={10} />
                                    Critique & Improvement
                                  </span>
                                  <p className="text-[11px] text-slate-300 print:text-slate-600 leading-relaxed">
                                    {q.answer.improvementTips}
                                  </p>
                                </div>
                              </div>

                              {/* Missing Concepts Block */}
                              <div className="p-3 bg-slate-900 print:bg-slate-50 border border-slate-800 print:border-slate-200 rounded-lg space-y-2">
                                <span className="text-[8px] font-bold text-rose-400 uppercase tracking-wider block">
                                  Missing Concepts
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {(() => {
                                    const parseJsonList = (str: string | null | undefined): string[] => {
                                      if (!str) return [];
                                      try { return JSON.parse(str); } catch { return []; }
                                    };
                                    const parsed = parseJsonList(q.answer.missingConcepts);
                                    return parsed.length > 0 ? (
                                      parsed.map((c: string, i: number) => (
                                        <span key={i} className="text-[9px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded">
                                          {c}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-emerald-450 text-emerald-450 print:text-emerald-700 font-bold">No missing concepts - all key details matched!</span>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* RIGHT COLUMN: VIDEO REPLAY & BEHAVIORAL DETAILS */}
                        <div className="md:col-span-2 space-y-4 print:hidden">
                          
                          {/* Replay player */}
                          {q.answer?.videoRecordingUrl ? (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Video Replay</span>
                              <video src={q.answer.videoRecordingUrl} controls className="w-full aspect-video rounded-xl border border-slate-800 bg-slate-950 shadow" />
                            </div>
                          ) : q.answer?.voiceRecordingUrl ? (
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block">Voice Replay</span>
                              <audio src={q.answer.voiceRecordingUrl} controls className="w-full bg-slate-950 rounded-lg border border-slate-850 p-1" />
                            </div>
                          ) : (
                            <div className="p-4 bg-slate-900/50 border border-slate-850 border-dashed rounded-xl text-center text-[10px] text-slate-500 italic font-semibold">
                              No media recording available
                            </div>
                          )}

                          {/* Behavioral details */}
                          {q.answer?.behavioralDetails && (() => {
                            let details: any = {};
                            try { details = JSON.parse(q.answer.behavioralDetails); } catch {}
                            return (
                              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl space-y-3">
                                <div className="flex justify-between items-center border-b border-slate-800 pb-2 mb-1">
                                  <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Presentation Feedback</span>
                                  <span className="text-[10px] font-bold text-slate-400">Score: {q.answer.behavioralScore}%</span>
                                </div>

                                <div className="space-y-2 text-[10px] leading-relaxed">
                                  {q.answer.videoRecordingUrl && (
                                    <>
                                      <div>
                                        <span className="text-slate-400 font-bold">Eye Contact: </span>
                                        <span className="text-slate-300 font-medium">{details.eyeContactFeedback}</span>
                                      </div>
                                      <div>
                                        <span className="text-slate-400 font-bold">Posture & Body Language: </span>
                                        <span className="text-slate-300 font-medium">{details.bodyLanguageFeedback}</span>
                                      </div>
                                    </>
                                  )}
                                  <div>
                                    <span className="text-slate-400 font-bold">Speaking Pace: </span>
                                    <span className="text-slate-300 font-medium">{details.speakingPaceFeedback}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 font-bold">Voice Clarity: </span>
                                    <span className="text-slate-300 font-medium">{details.voiceAnalysisFeedback}</span>
                                  </div>
                                  {details.fillerWordCount > 0 && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 p-2 rounded text-[9px] text-amber-400 font-semibold mt-1">
                                      Filler words count: {details.fillerWordCount} ({Object.entries(details.fillerWordsList || {}).map(([w, c]) => `"${w}" x${c}`).join(', ')})
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })()}

                        </div>

                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </LayoutShell>
  );
}
