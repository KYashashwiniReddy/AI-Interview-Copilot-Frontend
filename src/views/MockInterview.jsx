import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video, Mic, MicOff, Square, Play, SkipForward,
  Building2, ChevronRight, Wifi, Clock
} from 'lucide-react';
import ApiService from '../services/api';
import AudioPulse from '../components/AudioPulse';
import Teleprompter from '../components/Teleprompter';
import { useStreaming } from '../context/StreamingContext';

function VideoFeed() {
  const [scanPos, setScanPos] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setScanPos(p => (p + 1) % 100);
    }, 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-obsidian-900 border border-white/[0.08]"
      style={{ boxShadow: '0 0 30px rgba(6,182,212,0.08), inset 0 0 60px rgba(0,0,0,0.6)' }}
    >
      {/* Simulated camera feed with noise + gradient */}
      <div className="absolute inset-0 cyber-grid-bg opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-obsidian-950/80" />

      {/* User silhouette placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 opacity-30">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/40 to-cyan-500/20 border border-white/10" />
          <div className="w-24 h-16 rounded-t-3xl bg-gradient-to-b from-slate-700/30 to-transparent" />
        </div>
      </div>

      {/* Scan line */}
      <div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent pointer-events-none"
        style={{ top: `${scanPos}%`, transition: 'top 30ms linear' }}
      />

      {/* Corner overlays */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LIVE • CAM 01</span>
      </div>
      <div className="absolute top-3 right-3">
        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1"><Wifi size={10} />HD 1080p</span>
      </div>
      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
        <span className="text-[10px] font-mono text-slate-500">Kya Shashwini Reddy</span>
        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500">
          <Clock size={9} />
          <span id="session-clock">00:00</span>
        </div>
      </div>

      {/* Grid corners */}
      {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((cls, i) => (
        <div key={i} className={`absolute w-4 h-4 ${cls} border-cyan-400/30`} />
      ))}
    </div>
  );
}

export default function MockInterview({ setActiveView }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [micOn, setMicOn] = useState(false);
  const [amplitude, setAmplitude] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const clockRef = useRef(null);
  const ampRef = useRef(null);

  const { startQuestionStream, abortStream, resetStream, isStreaming } = useStreaming();

  useEffect(() => {
    ApiService.startInterviewSession().then(({ data }) => {
      setSession(data);
      setLoading(false);
    });
  }, []);

  // Session clock
  useEffect(() => {
    if (!sessionStarted) return;
    clockRef.current = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(clockRef.current);
  }, [sessionStarted]);

  useEffect(() => {
    const el = document.getElementById('session-clock');
    if (el) {
      const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const s = String(elapsed % 60).padStart(2, '0');
      el.textContent = `${m}:${s}`;
    }
  }, [elapsed]);

  // Mic amplitude simulation
  useEffect(() => {
    if (micOn) {
      ampRef.current = setInterval(() => {
        setAmplitude(20 + Math.random() * 60);
      }, 120);
    } else {
      clearInterval(ampRef.current);
      setAmplitude(0);
    }
    return () => clearInterval(ampRef.current);
  }, [micOn]);

  const handleStart = useCallback(() => {
    if (!session) return;
    setSessionStarted(true);
    setMicOn(true);
    startQuestionStream(session.questions[0]);
  }, [session, startQuestionStream]);

  const handleNextQuestion = useCallback(() => {
    if (!session) return;
    const nextIdx = questionIndex + 1;
    if (nextIdx < session.questions.length) {
      abortStream();
      setQuestionIndex(nextIdx);
      setTimeout(() => startQuestionStream(session.questions[nextIdx]), 400);
    }
  }, [session, questionIndex, abortStream, startQuestionStream]);

  const handleEnd = useCallback(() => {
    abortStream();
    setMicOn(false);
    setSessionStarted(false);
    clearInterval(clockRef.current);
    if (setActiveView) setActiveView('feedback');
  }, [abortStream, setActiveView]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="skeleton h-8 w-48 mb-6" />
        <div className="skeleton h-56 rounded-2xl" />
        <div className="skeleton h-40 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <p className="section-title mb-1">Simulation Chamber</p>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Video size={22} className="text-indigo-400" />
            Mock Interview
          </h1>
        </div>
        {sessionStarted && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/20">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
            <span className="text-xs font-medium text-rose-400 font-mono">REC</span>
          </div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Left: camera + controls */}
        <div className="xl:col-span-3 space-y-4">
          {/* Video feed */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <VideoFeed />
          </motion.div>

          {/* Audio visualizer + controls */}
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-4 flex items-center gap-4"
          >
            <button
              onClick={() => setMicOn(v => !v)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300 ${
                micOn
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400 glow-indigo'
                  : 'bg-white/[0.04] border-white/[0.08] text-slate-500'
              }`}
            >
              {micOn ? <Mic size={16} /> : <MicOff size={16} />}
            </button>
            <div className="flex-1">
              <AudioPulse amplitude={amplitude} isActive={micOn && sessionStarted} barCount={32} />
            </div>
            <div className="flex items-center gap-2">
              {!sessionStarted ? (
                <button onClick={handleStart} className="cyber-btn-primary flex items-center gap-2">
                  <Play size={14} />
                  Start Session
                </button>
              ) : (
                <>
                  <button
                    onClick={handleNextQuestion}
                    disabled={questionIndex >= session.questions.length - 1 || isStreaming}
                    className="cyber-btn flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <SkipForward size={13} />
                    Next
                  </button>
                  <button onClick={handleEnd} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-rose-500/15 border border-rose-500/25 text-rose-400 hover:bg-rose-500/25 transition-all">
                    <Square size={12} fill="currentColor" />
                    End
                  </button>
                </>
              )}
            </div>
          </motion.div>

          {/* Question progress */}
          {sessionStarted && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-3 flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-medium">Progress</span>
              <div className="flex gap-1.5 flex-1">
                {session.questions.map((_, qi) => (
                  <div
                    key={qi}
                    className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                      qi < questionIndex ? 'bg-emerald-500' :
                      qi === questionIndex ? 'bg-indigo-500' : 'bg-white/[0.08]'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500">Q{questionIndex + 1}/{session.questions.length}</span>
            </motion.div>
          )}
        </div>

        {/* Right: JD context + AI interviewer */}
        <div className="xl:col-span-2 space-y-4">
          {/* JD Context Window */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
            className="glass-card p-4 border border-cyan-500/10"
            style={{ boxShadow: '0 0 20px rgba(6,182,212,0.05)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={14} className="text-cyan-400" />
              <h3 className="text-xs font-semibold text-slate-300">Target Job Context</h3>
              <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-medium">
                {session.targetJD.level}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-xs font-bold text-slate-200">{session.targetJD.company}</p>
                <p className="text-xs text-slate-400">{session.targetJD.role}</p>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {session.targetJD.focus.map((f) => (
                  <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                    {f}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed border-t border-white/[0.05] pt-2">
                {session.targetJD.description}
              </p>
            </div>
          </motion.div>

          {/* AI Interviewer teleprompter */}
          <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="glass-card p-4" style={{ minHeight: 260 }}
          >
            <Teleprompter className="h-full" />
          </motion.div>

          {/* Pre-session prompt */}
          {!sessionStarted && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="glass-card p-4 border border-indigo-500/10 text-center space-y-2"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                <Play size={16} className="text-indigo-400" />
              </div>
              <p className="text-xs text-slate-400">Click <span className="text-indigo-400 font-medium">Start Session</span> to begin your simulated interview. The AI will stream questions in real-time.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
