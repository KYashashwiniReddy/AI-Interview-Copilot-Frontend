'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';
import { authApi, api } from '../../lib/api';
import { Lock, Check, X, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResetPasswordPage() {
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Show/Hide password toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  // Recovery modes
  const [isSupabaseMode, setIsSupabaseMode] = useState(false);
  const [localToken, setLocalToken] = useState('');
  const [supabaseUserEmail, setSupabaseUserEmail] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  useEffect(() => {
    async function initRecovery() {
      // 1. Check for local token in query params
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const urlError = urlParams.get('error') || urlParams.get('error_description');

      if (urlError) {
        const errorMsg = urlError.toLowerCase();
        if (errorMsg.includes('expired')) {
          setError('Expired reset link.');
        } else if (errorMsg.includes('network') || errorMsg.includes('fetch')) {
          setError('Network error. Please check your connection.');
        } else {
          setError('Invalid reset link.');
        }
        return;
      }

      if (token) {
        setLocalToken(token);
        setIsSupabaseMode(false);
        return;
      }

      // 2. Check for access_token in hash fragment (Supabase flow)
      const hash = window.location.hash;
      if (hash && hash.includes('access_token=')) {
        setIsSupabaseMode(true);
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const errorDescription = params.get('error_description') || params.get('error');

        if (errorDescription) {
          const msg = errorDescription.toLowerCase();
          if (msg.includes('expired')) {
            setError('Expired reset link.');
          } else if (msg.includes('network') || msg.includes('fetch')) {
            setError('Network error. Please check your connection.');
          } else {
            setError('Invalid reset link.');
          }
          return;
        }

        if (accessToken && refreshToken && supabase) {
          try {
            const { error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken
            });
            if (sessionError) throw sessionError;

            // Get logged-in user to find email
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            if (userError) throw userError;
            if (user && user.email) {
              setSupabaseUserEmail(user.email);
            }
          } catch (err: any) {
            console.error('Failed to set Supabase recovery session:', err);
            const msg = (err.message || '').toLowerCase();
            if (msg.includes('expired')) {
              setError('Expired reset link.');
            } else if (msg.includes('network') || msg.includes('fetch')) {
              setError('Network error. Please check your connection.');
            } else {
              setError('Invalid reset link.');
            }
          }
        } else if (!supabase) {
          setError('Invalid reset link.');
        }
      } else {
        // No recovery tokens found in URL, allow manual code entry
        setIsSupabaseMode(false);
      }
    }
    initRecovery();
  }, []);

  // Password validation rules
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSpecialChar = /[^a-zA-Z0-9]/.test(newPassword);

  const getStrengthScore = () => {
    let score = 0;
    if (newPassword.length === 0) return 0;
    if (hasMinLength) score += 20;
    if (hasUppercase) score += 20;
    if (hasLowercase) score += 20;
    if (hasNumber) score += 20;
    if (hasSpecialChar) score += 20;
    return score;
  };

  const strengthScore = getStrengthScore();

  const getStrengthLabel = () => {
    if (strengthScore <= 40) return { label: 'Weak', color: 'bg-rose-500', text: 'text-rose-400' };
    if (strengthScore <= 80) return { label: 'Medium', color: 'bg-amber-500', text: 'text-amber-400' };
    return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
  };

  const strengthInfo = getStrengthLabel();

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (strengthScore < 100) {
      setError('Password does not meet strength requirements.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseMode && supabase) {
        // 1. Update password in Supabase Auth
        const { error: updateError } = await supabase.auth.updateUser({
          password: newPassword
        });
        if (updateError) throw updateError;

        // 2. Sync to local database
        if (supabaseUserEmail) {
          try {
            const data = await authApi.login({
              email: supabaseUserEmail,
              password: newPassword
            });
            localStorage.setItem('token', data.token);
            
            const localTheme = localStorage.getItem('theme') || localStorage.getItem('landing_theme');
            let finalUser = data.user;
            if (localTheme) {
              try {
                await api.put('/auth/theme', { theme: localTheme.toUpperCase() });
                finalUser = { ...finalUser, theme: localTheme.toUpperCase() };
              } catch (themeErr) {
                console.error('Failed to sync theme preference during password reset auto-login:', themeErr);
              }
            }
            localStorage.setItem('user', JSON.stringify(finalUser));
          } catch (syncErr) {
            console.error('Failed to auto-login to sync session locally:', syncErr);
          }
        }

        setSuccess('Password updated successfully.');
        triggerToast('Password updated successfully.', 'success');
        setTimeout(() => router.push('/'), 3000);
      } else {
        // Local fallback recovery
        await authApi.resetPassword({
          token: localToken,
          password: newPassword
        });
        setSuccess('Password updated successfully.');
        triggerToast('Password updated successfully.', 'success');
        setTimeout(() => router.push('/'), 3000);
      }
    } catch (err: any) {
      const msg = (err.message || '').toLowerCase();
      if (msg.includes('expired')) {
        setError('Expired reset link.');
      } else if (msg.includes('network') || msg.includes('fetch')) {
        setError('Network error. Please check your connection.');
      } else if (msg.includes('invalid')) {
        setError('Invalid reset link.');
      } else {
        setError(err.message || 'Failed to reset password. The link may have expired.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border text-sm max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-800 text-emerald-300'
                : 'bg-rose-950/90 border-rose-800 text-rose-300'
            }`}
          >
            <ShieldAlert size={18} />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10 space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-white mb-2">Set New Password</h1>
          <p className="text-slate-400 text-sm">Create a strong, secure password for your account.</p>
        </div>

        {success && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-xs rounded-xl">
            {success}
          </div>
        )}
        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-900/50 text-rose-400 text-xs rounded-xl">
            {error}
          </div>
        )}

        {!success && !error.includes('Expired') && !error.includes('Invalid') && !error.includes('Network') && (
          <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
            {!localToken && (
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Reset Code / Token</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
                  <input
                    type="text"
                    required
                    value={localToken}
                    onChange={(e) => setLocalToken(e.target.value.trim())}
                    placeholder="Enter code or paste token"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition cursor-pointer"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Confirm New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500"><Lock size={16} /></span>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm transition"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <div className="text-[10px] pt-1">
                  <span className="text-rose-500 font-semibold flex items-center gap-1">
                    <X size={10} className="stroke-[3]" /> Passwords do not match
                  </span>
                </div>
              )}
            </div>

            {/* PASSWORD STRENGTH */}
            {newPassword && (
              <div className="bg-slate-950 p-4 border border-slate-850 rounded-lg space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Strength:</span>
                  <span className={`font-bold ${strengthInfo.text}`}>{strengthInfo.label}</span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1 overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strengthInfo.color}`} style={{ width: `${strengthScore}%` }} />
                </div>
                <div className="grid grid-cols-1 gap-1 pt-1">
                  <div className={`flex items-center gap-1 text-[9px] ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasMinLength ? <Check size={8} /> : <X size={8} />} Minimum 8 characters
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] ${hasUppercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasUppercase ? <Check size={8} /> : <X size={8} />} At least 1 uppercase letter
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] ${hasLowercase ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasLowercase ? <Check size={8} /> : <X size={8} />} At least 1 lowercase letter
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasNumber ? <Check size={8} /> : <X size={8} />} At least 1 number
                  </div>
                  <div className={`flex items-center gap-1 text-[9px] ${hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {hasSpecialChar ? <Check size={8} /> : <X size={8} />} At least 1 special character
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || strengthScore < 100 || !passwordsMatch}
              className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-semibold text-sm transition duration-300 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
            </button>
          </form>
        )}

        {(error || success) && (
          <div className="pt-2 text-center">
            <button
              onClick={() => router.push('/')}
              className="text-xs text-purple-400 hover:text-purple-300 font-semibold cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
