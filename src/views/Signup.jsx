import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Github, Chrome, CheckCircle2 } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const passwordRules = [
  { label: 'At least 8 characters', test: (p) => p.length >= 8 },
  { label: 'Contains uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Contains a number', test: (p) => /\d/.test(p) },
];

export default function Signup({ setActiveView }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwStrength = passwordRules.filter((r) => r.test(form.password)).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    if (pwStrength < 3) {
      setError('Please meet all password requirements.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setActiveView('dashboard');
    }, 1400);
  };

  const strengthColor = pwStrength === 0 ? '#f43f5e' : pwStrength === 1 ? '#f59e0b' : pwStrength === 2 ? '#6366f1' : '#10b981';
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong'][pwStrength];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
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

        {/* Card */}
        <motion.div
          custom={1} variants={fadeUp} initial="hidden" animate="visible"
          className="glass-card p-8 border border-white/[0.08]"
          style={{ boxShadow: '0 0 40px rgba(99,102,241,0.08), 0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-sm text-slate-400 mt-1">Start acing interviews with AI-powered prep</p>
          </div>

          {/* Social */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button className="cyber-btn flex items-center justify-center gap-2 py-2.5 w-full">
              <Github size={15} /> GitHub
            </button>
            <button className="cyber-btn flex items-center justify-center gap-2 py-2.5 w-full"
              style={{ borderColor: 'rgba(6,182,212,0.3)', color: '#22d3ee', background: 'rgba(6,182,212,0.06)' }}>
              <Chrome size={15} /> Google
            </button>
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-xs text-slate-600 font-medium">or continue with email</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Full name</label>
              <div className="relative">
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-name"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Vishw"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600
                    focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                />
              </div>
            </motion.div>

            {/* Email */}
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-sm text-slate-200 placeholder-slate-600
                    focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                />
              </div>
            </motion.div>

            {/* Password */}
            <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600
                    focus:outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Strength bar */}
              {form.password.length > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex gap-1">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex-1 h-1 rounded-full overflow-hidden bg-white/[0.05]">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: idx < pwStrength ? strengthColor : 'transparent' }}
                            initial={{ width: 0 }}
                            animate={{ width: idx < pwStrength ? '100%' : '0%' }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-[11px] font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                  </div>
                  <div className="space-y-1">
                    {passwordRules.map((rule) => (
                      <div key={rule.label} className="flex items-center gap-1.5">
                        <CheckCircle2
                          size={11}
                          className={rule.test(form.password) ? 'text-emerald-400' : 'text-slate-600'}
                        />
                        <span className={`text-[11px] ${rule.test(form.password) ? 'text-slate-400' : 'text-slate-600'}`}>
                          {rule.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Error */}
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2"
              >
                {error}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              custom={5} variants={fadeUp} initial="hidden" animate="visible"
              type="submit"
              id="signup-submit"
              disabled={loading}
              className="w-full cyber-btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Create Account <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <button
              onClick={() => setActiveView('login')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </button>
          </p>
        </motion.div>

        <p className="text-center text-[11px] text-slate-700 mt-4">
          By creating an account you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
