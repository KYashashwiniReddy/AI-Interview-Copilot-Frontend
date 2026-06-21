'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api, authApi } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { Mail, Lock, User, Key, ShieldAlert, Check, X, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';

export default function AuthPage() {
  const router = useRouter();

  // Landing Page Theme State from Theme Provider
  const { theme, setThemeMode } = useTheme();

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<'STUDENT' | 'ADMIN'>('STUDENT');

  // Sign In Form States
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register Form States
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Show/Hide password toggles
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);

  // Alert Banner
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('message') === 'session_expired') {
        triggerToast('Session expired. Please log in again.', 'error');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }

    // Redirect to dashboard if token exists
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      const cachedUser = api.getUser();
      if (cachedUser?.role?.toUpperCase() === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    }
  }, [router]);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    setIsSendingForgot(true);

    try {
      const data = await authApi.forgotPassword({ 
        email: forgotEmail,
        origin: typeof window !== 'undefined' ? window.location.origin : ''
      });
      const msg = 'Password reset email sent successfully. Please check your inbox and spam folder.';
      setForgotSuccess(msg);
      triggerToast(msg, 'success');
      setTimeout(() => setShowForgotModal(false), 5000);
    } catch (err: any) {
      const errMsg = (err.message || '').toLowerCase();
      if (errMsg.includes('not registered') || errMsg.includes('not found')) {
        setForgotError('Email not registered.');
      } else if (err.name === 'TypeError' || errMsg.includes('fetch') || errMsg.includes('network')) {
        setForgotError('Network error. Please check your connection and try again.');
      } else {
        setForgotError(err.message || 'Failed to initiate password reset.');
      }
    } finally {
      setIsSendingForgot(false);
    }
  };

  // Sign In submit
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      const data = await authApi.login({ 
        email: loginEmail, 
        password: loginPassword,
        role: selectedRole 
      });

      const userRole = (data.user?.role || '').toUpperCase();
      if (selectedRole === 'ADMIN' && userRole !== 'ADMIN') {
        setLoginError('Unauthorized Access. This account is not an administrator.');
        api.clearToken();
        setIsLoggingIn(false);
        return;
      }
      if (selectedRole === 'STUDENT' && userRole !== 'STUDENT') {
        setLoginError('Unauthorized Access. This account is not a student.');
        api.clearToken();
        setIsLoggingIn(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Save theme settings, preserving any active local selection first
      const localTheme = localStorage.getItem('theme') || localStorage.getItem('landing_theme');
      if (localTheme) {
        setThemeMode(localTheme as 'light' | 'dark');
      } else if (data.user?.theme) {
        setThemeMode(data.user.theme.toLowerCase() as 'light' | 'dark');
      }

      triggerToast('Login successful! Redirecting...', 'success');
      setTimeout(() => {
        if (userRole === 'ADMIN') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Password validation rules
  const hasMinLength = regPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(regPassword);
  const hasLowercase = /[a-z]/.test(regPassword);
  const hasNumber = /[0-9]/.test(regPassword);
  const hasSpecialChar = /[!@#$%^&*]/.test(regPassword);

  const satisfiedCount = [
    hasMinLength,
    hasUppercase,
    hasLowercase,
    hasNumber,
    hasSpecialChar
  ].filter(Boolean).length;

  const isPasswordValid = satisfiedCount === 5;
  const passwordsMatch = regPassword && regConfirmPassword && regPassword === regConfirmPassword;

  const getStrengthInfo = () => {
    if (!regPassword) return { label: '', color: '', emoji: '', text: '' };
    if (satisfiedCount <= 2) {
      return { label: 'Weak', color: 'bg-rose-500 w-1/4', emoji: '🔴', text: 'text-rose-500' };
    }
    if (satisfiedCount <= 4) {
      return { label: 'Medium', color: 'bg-amber-500 w-2/4', emoji: '🟡', text: 'text-amber-500' };
    }
    if (regPassword.length >= 12) {
      return { label: 'Very Strong', color: 'bg-purple-600 w-full', emoji: '🟣', text: 'text-purple-600' };
    }
    return { label: 'Strong', color: 'bg-emerald-500 w-3/4', emoji: '🟢', text: 'text-emerald-500' };
  };

  const strengthInfo = getStrengthInfo();

  const handleGeneratePassword = () => {
    const words = ['Nova', 'Hire', 'Career', 'AI', 'Interview', 'Cloud', 'Dev', 'ML', 'Engineer', 'Code', 'Tech', 'Talent', 'Pro', 'Smart', 'Future', 'Apex', 'Build', 'Success', 'Match', 'Skill', 'Path', 'Roadmap', 'Secure', 'Staff', 'Team', 'Lead', 'Flow', 'Web', 'Data', 'Cyber'];
    const specials = ['!', '@', '#', '$', '%', '^', '&', '*'];
    
    const w1 = words[Math.floor(Math.random() * words.length)];
    let w2 = words[Math.floor(Math.random() * words.length)];
    while (w1 === w2) {
      w2 = words[Math.floor(Math.random() * words.length)];
    }
    
    const spec = specials[Math.floor(Math.random() * specials.length)];
    
    const useFourDigits = Math.random() > 0.5;
    const digitsVal = useFourDigits
      ? Math.floor(1000 + Math.random() * 9000)
      : Math.floor(100 + Math.random() * 900);
      
    const generated = `${w1}${w2}${spec}${digitsVal}`;
    setRegPassword(generated);
    setRegConfirmPassword(generated);
    triggerToast(`Generated Password: ${generated}`, 'success');
  };

  // Register submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!isPasswordValid) {
      setRegError('Password does not meet strength requirements.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError('Passwords do not match.');
      return;
    }

    setIsRegistering(true);

    try {
      const data = await authApi.register({
        email: regEmail,
        password: regPassword,
        fullName: regName
      });
      setOtpEmail(regEmail);
      triggerToast(data.message || 'OTP verification sent to your email.', 'success');
      setShowOtpOverlay(true);
    } catch (err: any) {
      if (err.message && err.message.includes('already exists')) {
        setRegError('Account already exists. Please sign in.');
      } else {
        setRegError(err.message || 'Failed to register account.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  // OTP Verify submit
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');
    setIsVerifying(true);

    try {
      const data = await authApi.verifyOtp({ email: otpEmail, code: otpCode });
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      // Save theme settings, preserving any active local selection first
      const localTheme = localStorage.getItem('theme') || localStorage.getItem('landing_theme');
      if (localTheme) {
        setThemeMode(localTheme as 'light' | 'dark');
      } else if (data.user?.theme) {
        setThemeMode(data.user.theme.toLowerCase() as 'light' | 'dark');
      }
      triggerToast('Email verified successfully! Redirecting...', 'success');
      setShowOtpOverlay(false);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setOtpError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  // OAuth handlers (real production Supabase OAuth integration)
  const handleOAuthLogin = async (provider: 'Google' | 'GitHub') => {
    try {
      if (supabase) {
        triggerToast(`Connecting to ${provider} OAuth...`, 'success');
        const { error } = await supabase.auth.signInWithOAuth({
          provider: provider.toLowerCase() as any,
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            queryParams: provider === 'Google' ? { prompt: 'select_account' } : undefined
          }
        });
        if (error) throw error;
        return;
      }

      // Local Dev Fallback (if Supabase credentials are not supplied in env.local)
      triggerToast(`Supabase keys missing in .env.local. Real OAuth is unavailable. Using dev fallback...`, 'error');
      setTimeout(async () => {
        try {
          const mockOAuthEmail = provider === 'Google' ? 'google.student@novahire.com' : 'github.student@novahire.com';
          const mockOAuthName = provider === 'Google' ? 'Google Student Account' : 'GitHub Student Account';

          const data = await authApi.oauth({
            email: mockOAuthEmail,
            fullName: mockOAuthName,
            provider: provider.toLowerCase()
          });

          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          // Save theme settings, preserving any active local selection first
          const localTheme = localStorage.getItem('theme') || localStorage.getItem('landing_theme');
          if (localTheme) {
            setThemeMode(localTheme as 'light' | 'dark');
          } else if (data.user?.theme) {
            setThemeMode(data.user.theme.toLowerCase() as 'light' | 'dark');
          }
          triggerToast(`Simulated authentication via ${provider} successful! Redirecting...`, 'success');
          router.push('/dashboard');
        } catch (err: any) {
          triggerToast(`Failed dev authentication: ${err.message}`, 'error');
        }
      }, 2000);

    } catch (err: any) {
      triggerToast(`Failed to authenticate via ${provider}: ${err.message}`, 'error');
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-250 bg-background text-foreground animate-fade-in">
      {/* Theme Toggle Selector in top-right */}
      <div className="absolute top-4 right-4 z-50 flex items-center p-1 rounded-full border text-xs transition-colors duration-200 bg-card border-border">
        <button
          type="button"
          onClick={() => setThemeMode('light')}
          className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-colors select-none ${
            theme === 'light' ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:text-white'
          }`}
        >
          ☀️ Light
        </button>
        <button
          type="button"
          onClick={() => setThemeMode('dark')}
          className={`px-3 py-1.5 rounded-full font-bold flex items-center gap-1 cursor-pointer transition-colors select-none ${
            theme === 'dark' ? 'bg-primary/15 text-primary' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          🌙 Dark
        </button>
      </div>

      {/* Decorative backdrop shapes */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-300" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-opacity duration-300" />

      {/* Global alert notifications */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-6 z-50 px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 border text-sm max-w-md ${
              toastMessage.type === 'success'
                ? 'bg-success/15 border-success text-success'
                : 'bg-error/15 border-error text-error'
            }`}
          >
            <ShieldAlert size={18} />
            <span>{toastMessage.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-5xl z-10">
        {/* Title logo block */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400 tracking-tight mb-2">
            NovaHire AI
          </h1>
          <p className="text-sm md:text-base text-text-muted">
            Elevate your interview preparation, analyze resume gaps & keywords, and practice with real-time feedback
          </p>
        </div>

        {/* Combined split Card */}
        <div className={`border rounded-2xl overflow-hidden shadow-2xl grid relative transition-all duration-300 bg-card border-border divide-y md:divide-y-0 md:divide-x divide-border ${
          selectedRole === 'ADMIN' ? 'grid-cols-1 max-w-lg mx-auto divide-y-0' : 'md:grid-cols-2'
        }`}>
          
          {/* LEFT: Sign In */}
          <div className="p-8 md:p-12 flex flex-col justify-center transition-colors duration-300 bg-card/40">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 text-foreground">Welcome Back</h2>
              <p className="text-sm text-text-muted">Sign in to resume your preparation dashboard.</p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 rounded-lg text-xs border bg-error/15 border-error text-error">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">Login As</label>
                <div className="grid grid-cols-2 gap-2 p-1 rounded-lg border transition-colors bg-background border-border">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('STUDENT')}
                    className={`py-1.5 text-xs font-bold rounded-md transition select-none cursor-pointer ${
                      selectedRole === 'STUDENT'
                        ? 'bg-primary text-white shadow-sm font-semibold'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRole('ADMIN')}
                    className={`py-1.5 text-xs font-bold rounded-md transition select-none cursor-pointer ${
                      selectedRole === 'ADMIN'
                        ? 'bg-primary text-white shadow-sm font-semibold'
                        : 'text-text-muted hover:text-foreground'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted"><Mail size={16} /></span>
                  <input
                    type="email"
                    required
                    autoComplete="off"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail('');
                      setForgotError('');
                      setForgotSuccess('');
                      setShowForgotModal(true);
                    }}
                    className="text-xs font-semibold cursor-pointer transition text-primary hover:text-primary-hover"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted"><Lock size={16} /></span>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    autoComplete="new-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground transition cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-500 text-white rounded-lg font-semibold text-sm transition duration-300 shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            {selectedRole === 'STUDENT' && (
              <>
                <div className="relative my-6 flex items-center justify-center">
                  <span className="absolute px-4 text-xs font-bold text-text-muted uppercase tracking-wider bg-card">or sign in with</span>
                  <div className="w-full border-t border-border" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleOAuthLogin('Google')}
                    className="py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 border-border text-foreground"
                  >
                    <svg className="w-4 h-4 text-rose-500 fill-current" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.51 0-6.377-2.86-6.377-6.377s2.867-6.377 6.377-6.377c1.62 0 3.096.55 4.266 1.458l3.15-3.15C19.26 1.77 15.939 1 12.24 1 5.922 1 12.24S1 5.922 1 12.24s4.922 11.24 11.24 11.24c6.318 0 11.24-4.922 11.24-11.24 0-.89-.096-1.53-.288-2.225H12.24z"/>
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={() => handleOAuthLogin('GitHub')}
                    className="py-2.5 px-4 rounded-lg font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer border bg-card hover:bg-slate-100 dark:hover:bg-slate-800 border-border text-foreground"
                  >
                    <svg className="w-4 h-4 fill-current text-foreground" viewBox="0 0 24 24" fill="currentColor">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.577.688.479C19.138 20.161 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
                    </svg>
                    GitHub
                  </button>
                </div>
              </>
            )}
          </div>

          {/* RIGHT: Register */}
          {selectedRole === 'STUDENT' && (
            <div className="p-8 md:p-12 flex flex-col justify-center transition-colors duration-300 bg-card/20">
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-2 text-foreground">Create Account</h2>
                <p className="text-sm text-text-muted">Join the platform to access learning pathways & AI mock rooms.</p>
              </div>

              {regError && (
                <div className="mb-4 p-3 rounded-lg text-xs border bg-error/15 border-error text-error">
                  {regError}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted"><User size={16} /></span>
                    <input
                      type="text"
                      required
                      autoComplete="name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted"><Mail size={16} /></span>
                    <input
                      type="email"
                      required
                      autoComplete="off"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="name@university.edu"
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-text-muted">Password</label>
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      className="text-xs text-primary hover:text-primary-hover font-semibold flex items-center gap-1 cursor-pointer transition"
                    >
                      <RefreshCw size={12} /> Generate Strong Password
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted"><Lock size={16} /></span>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="Enter strong password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground transition cursor-pointer"
                    >
                      {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {regPassword && (
                    <div className="mt-3 p-3 rounded-lg border bg-card border-border space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-text-muted font-medium">Strength:</span>
                        <span className={`font-bold flex items-center gap-1 ${strengthInfo.text}`}>
                          {strengthInfo.label} {strengthInfo.emoji}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                        <div className={`h-full transition-all duration-300 ${strengthInfo.color}`} />
                      </div>
                      <div className="grid grid-cols-1 gap-1 pt-1 text-[10px]">
                        <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-emerald-500' : 'text-text-muted'}`}>
                          {hasMinLength ? <Check size={10} className="stroke-[3]" /> : <X size={10} className="stroke-[3] opacity-60" />} At least 8 characters
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasUppercase ? 'text-emerald-500' : 'text-text-muted'}`}>
                          {hasUppercase ? <Check size={10} className="stroke-[3]" /> : <X size={10} className="stroke-[3] opacity-60" />} One uppercase letter (A-Z)
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasLowercase ? 'text-emerald-500' : 'text-text-muted'}`}>
                          {hasLowercase ? <Check size={10} className="stroke-[3]" /> : <X size={10} className="stroke-[3] opacity-60" />} One lowercase letter (a-z)
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-emerald-500' : 'text-text-muted'}`}>
                          {hasNumber ? <Check size={10} className="stroke-[3]" /> : <X size={10} className="stroke-[3] opacity-60" />} One number (0-9)
                        </div>
                        <div className={`flex items-center gap-1.5 ${hasSpecialChar ? 'text-emerald-500' : 'text-text-muted'}`}>
                          {hasSpecialChar ? <Check size={10} className="stroke-[3]" /> : <X size={10} className="stroke-[3] opacity-60" />} One special character (!@#$%^&*)
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-text-muted"><Lock size={16} /></span>
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-foreground transition cursor-pointer"
                    >
                      {showRegConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {regConfirmPassword && !passwordsMatch && (
                    <div className="text-[10px] pt-1">
                      <span className="text-rose-500 font-semibold flex items-center gap-1">
                        <X size={10} className="stroke-[3]" /> Passwords do not match
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isRegistering || !isPasswordValid || !passwordsMatch}
                  className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-semibold text-sm transition duration-300 shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistering ? 'Registering...' : 'Register'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* OTP verification Overlay */}
      <AnimatePresence>
        {showOtpOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="p-8 rounded-2xl w-full max-w-md shadow-2xl border relative bg-card border-border text-foreground"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border bg-primary/10 border-primary/20 text-primary">
                  <Key size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Verify Your Email</h3>
                <p className="text-sm text-text-muted">
                  We have sent a verification code to <span className="text-primary font-semibold">{otpEmail}</span>. Enter the code below to complete registration.
                </p>
              </div>

              {otpError && (
                <div className="mb-4 p-3 rounded-lg text-xs border bg-error/15 border-error text-error">
                  {otpError}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-center text-text-muted">Verification Code (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="w-full text-center tracking-widest text-2xl font-black py-3 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition border bg-background border-border text-foreground placeholder-text-muted"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowOtpOverlay(false)}
                    className="w-1/2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-1/2 py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-500 text-white rounded-lg font-semibold text-sm transition duration-300 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isVerifying ? 'Verifying...' : 'Verify Email'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Forgot Password Overlay */}
      <AnimatePresence>
        {showForgotModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForgotModal(false)}
              className="absolute inset-0"
            />
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="p-8 rounded-2xl w-full max-w-md shadow-2xl relative border z-10 bg-card border-border text-foreground"
            >
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 border bg-primary/10 border-primary/20 text-primary">
                  <Mail size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-foreground">Reset Password</h3>
                <p className="text-sm text-text-muted">
                  Enter your registered email address below, and we will send you a secure link to reset your password.
                </p>
              </div>

              {forgotSuccess && (
                <div className="mb-4 p-3 rounded-lg text-xs border bg-success/15 border-success text-success">
                  {forgotSuccess}
                </div>
              )}
              {forgotError && (
                <div className="mb-4 p-3 rounded-lg text-xs border bg-error/15 border-error text-error">
                  {forgotError}
                </div>
              )}

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-text-muted">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@university.edu"
                    className="w-full px-4 py-2.5 rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition border bg-background border-border text-foreground placeholder-text-muted"
                  />
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-1/2 py-2.5 rounded-lg text-sm font-semibold transition cursor-pointer border bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground border-border"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingForgot}
                    className="w-1/2 py-2.5 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-500 text-white rounded-lg font-semibold text-sm transition duration-300 shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSendingForgot ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
