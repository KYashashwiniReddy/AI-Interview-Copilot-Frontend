import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

export default function Login({ setActiveView }) {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setActiveView('dashboard');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Ambient blobs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/6 rounded-full blur-3xl" />
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
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-sm text-slate-400 mt-1">Sign in to continue your interview prep</p>
          </div>

          {/* Social logins */}
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
            {/* Email */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible">
              <label className="text-xs font-medium text-slate-400 mb-1.5 block">Email address</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
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
            <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-400">Password</label>
                <button
                  type="button"
                  onClick={() => setActiveView('forgot-password')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
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
              custom={4} variants={fadeUp} initial="hidden" animate="visible"
              type="submit"
              id="login-submit"
              disabled={loading}
              className="w-full cyber-btn-primary py-3 rounded-xl flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={15} /></>
              )}
            </motion.button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account?{' '}
            <button
              onClick={() => setActiveView('signup')}
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Create one free
            </button>
          </p>
        </motion.div>

        <p className="text-center text-[11px] text-slate-700 mt-4">
          By signing in you agree to our Terms & Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
