import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, ArrowRight, ArrowLeft, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const STEPS = ['request', 'verify', 'reset', 'success'];

export default function ForgotPassword({ setActiveView }) {
  const [step, setStep] = useState('request'); // request | verify | reset | success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stepIndex = STEPS.indexOf(step);

  const handleRequest = (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('verify'); }, 1200);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    setError('');
    const fullCode = code.join('');
    if (fullCode.length < 6) { setError('Please enter the 6-digit code.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('reset'); }, 1000);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setError('');
    if (!password || !confirmPassword) { setError('Please fill in both fields.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep('success'); }, 1300);
  };

  const handleCodeChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus();
    }
  };

  const handleCodeKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center justify-center gap-3 mb-8"
        >
          <div className="relative w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center animate-glow-pulse">
            <Zap size={20} className="text-indigo-400" />
            <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 blur-lg" />
          </div>
          <div>
            <p className="text-base font-bold text-white tracking-tight leading-none">Interview</p>
            <p className="text-sm font-semibold text-gradient-indigo">Copilot AI</p>
          </div>
        </motion.div>

        {/* Step progress */}
        <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="flex items-center justify-center gap-2 mb-6"
        >
          {['Email', 'Verify', 'Reset', 'Done'].map((label, idx) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-1.5">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300
                  ${idx <= stepIndex ? 'bg-indigo-500 text-white' : 'bg-white/[0.05] text-slate-600 border border-white/[0.08]'}`}
                >
                  {idx < stepIndex ? <CheckCircle2 size={12} /> : idx + 1}
                </div>
                <span className={`text-[11px] font-medium hidden sm:block ${idx <= stepIndex ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
              </div>
              {idx < 3 && <div className={`h-px w-6 transition-all duration-300 ${idx < stepIndex ? 'bg-indigo-500/60' : 'bg-white/[0.06]'}`} />}
            </React.Fragment>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Request ── */}
          {step === 'request' && (
            <motion.div key="request"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 border border-white/[0.08]"
              style={{ boxShadow: '0 0 40px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Forgot password?</h1>
                <p className="text-sm text-slate-400 mt-1">Enter your email and we'll send a reset code</p>
              </div>
              <form onSubmit={handleRequest} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600
                        focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" id="forgot-submit"
                  disabled={loading}
                  className="w-full cyber-btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Mail size={15} /> Send Reset Code</>}
                </button>
              </form>
              <button onClick={() => setActiveView('login')}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto mt-5"
              >
                <ArrowLeft size={12} /> Back to sign in
              </button>
            </motion.div>
          )}

          {/* ── STEP 2: Verify OTP ── */}
          {step === 'verify' && (
            <motion.div key="verify"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 border border-white/[0.08]"
              style={{ boxShadow: '0 0 40px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Check your email</h1>
                <p className="text-sm text-slate-400 mt-1">
                  We sent a 6-digit code to <span className="text-indigo-400">{email}</span>
                </p>
              </div>
              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-3 block">Verification code</label>
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(e.target.value, idx)}
                        onKeyDown={(e) => handleCodeKeyDown(e, idx)}
                        className="w-11 h-12 text-center bg-white/[0.04] border border-white/[0.08] rounded-xl text-lg font-bold text-white
                          focus:outline-none focus:border-indigo-500/60 focus:bg-indigo-500/5 transition-all duration-200"
                      />
                    ))}
                  </div>
                </div>
                {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" id="verify-submit"
                  disabled={loading}
                  className="w-full cyber-btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Verify Code <ArrowRight size={15} /></>}
                </button>
              </form>
              <p className="text-center text-xs text-slate-500 mt-5">
                Didn't receive it?{' '}
                <button onClick={() => setStep('request')} className="text-indigo-400 hover:text-indigo-300 transition-colors">Resend code</button>
              </p>
            </motion.div>
          )}

          {/* ── STEP 3: New Password ── */}
          {step === 'reset' && (
            <motion.div key="reset"
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 border border-white/[0.08]"
              style={{ boxShadow: '0 0 40px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-white">Set new password</h1>
                <p className="text-sm text-slate-400 mt-1">Create a strong password for your account</p>
              </div>
              <form onSubmit={handleReset} className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">New password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="reset-password"
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600
                        focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">Confirm password</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      id="reset-confirm-password"
                      type={showPw ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600
                        focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                    />
                  </div>
                </div>
                {error && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}
                <button type="submit" id="reset-submit"
                  disabled={loading}
                  className="w-full cyber-btn-primary py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <ArrowRight size={15} /></>}
                </button>
              </form>
            </motion.div>
          )}

          {/* ── STEP 4: Success ── */}
          {step === 'success' && (
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-8 border border-emerald-500/20 text-center"
              style={{ boxShadow: '0 0 40px rgba(16,185,129,0.08), 0 8px 32px rgba(0,0,0,0.5)' }}
            >
              <motion.div
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-5"
                style={{ boxShadow: '0 0 30px rgba(16,185,129,0.2)' }}
              >
                <CheckCircle2 size={32} className="text-emerald-400" />
              </motion.div>
              <h1 className="text-2xl font-bold text-white mb-2">Password reset!</h1>
              <p className="text-sm text-slate-400 mb-6">Your password has been successfully updated. You can now sign in with your new password.</p>
              <button
                id="goto-login"
                onClick={() => setActiveView('login')}
                className="cyber-btn-primary px-8 py-3 rounded-xl flex items-center justify-center gap-2 mx-auto"
              >
                Go to Sign In <ArrowRight size={15} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
