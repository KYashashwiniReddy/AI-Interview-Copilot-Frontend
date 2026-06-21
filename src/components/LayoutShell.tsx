'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api, authApi } from '../lib/api';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  FileSearch,
  Sparkles,
  Map,
  MessageSquareCode,
  History,
  Shield,
  LogOut,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User as UserIcon,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';
  
  // Notification items
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    // 1. Fetch user context
    const token = localStorage.getItem('token');
    const cachedUser = api.getUser();

    if (!token || !cachedUser) {
      api.clearToken();
      router.push('/');
      return;
    }

    setUser(cachedUser);
    setLoading(false);

    // 2. Fetch Notifications (dummy fallback or API)
    setNotifications([
      { id: '1', title: 'Welcome!', message: 'Explore the ATS analyzer and generated roadmaps.', isRead: false, type: 'SUCCESS' },
      { id: '2', title: 'New Category Added', message: 'Admin uploaded System Design questions.', isRead: true, type: 'INFO' }
    ]);

    // 3. Fetch fresh profile from DB to sync user context
    authApi.me()
      .then((res) => {
        if (res.user) {
          setUser(res.user);
          api.setUser(res.user);
        }
      })
      .catch((err) => {
        console.error('Failed to sync user context from DB:', err);
      });

    const handleProfileUpdate = () => {
      const freshUser = api.getUser();
      if (freshUser) {
        setUser(freshUser);
      }
    };

    window.addEventListener('user-profile-updated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('user-profile-updated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [router]);

  const handleLogout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Supabase auth sign out error:', err);
      }
    }
    const savedTheme = localStorage.getItem('theme');
    const savedLandingTheme = localStorage.getItem('landing_theme');
    api.clearToken();
    localStorage.clear();
    sessionStorage.clear();
    if (savedTheme) localStorage.setItem('theme', savedTheme);
    if (savedLandingTheme) localStorage.setItem('landing_theme', savedLandingTheme);
    window.location.href = '/';
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, role: 'STUDENT' },
    { name: 'ATS Analyzer', href: '/ats', icon: FileSearch, role: 'STUDENT' },
    { name: 'Skill Gap', href: '/skill-gap', icon: Sparkles, role: 'STUDENT' },
    { name: 'Roadmaps', href: '/roadmap', icon: Map, role: 'STUDENT' },
    { name: 'Mock Interview', href: '/mock-interview', icon: MessageSquareCode, role: 'STUDENT' },
    { name: 'History Logs', href: '/history', icon: History, role: 'STUDENT' },
    { name: 'Settings', href: '/settings', icon: Settings, role: 'STUDENT' },
    { name: 'NovaHire AI Admin', href: '/admin', icon: Shield, role: 'ADMIN' },
  ];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background text-foreground transition-colors duration-250">
      
      {/* MOBILE HEADER */}
      <header className="md:hidden w-full h-16 bg-card border-b border-border px-4 flex items-center justify-between z-30">
        <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400 text-lg tracking-wider">
          NOVAHIRE AI
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            type="button"
            className="p-1.5 rounded-lg border border-border text-text-muted hover:text-foreground hover:bg-background transition cursor-pointer"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setSidebarOpen(true)} className="text-text-muted hover:text-foreground transition">
            <Menu size={22} />
          </button>
        </div>
      </header>

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-card border-r border-border flex-col z-40 transition-transform duration-350 md:translate-x-0 md:static md:flex ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="h-16 border-b border-border flex items-center justify-between px-6 bg-card">
          <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400 text-xl tracking-wider">
            NOVAHIRE AI
          </span>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-text-muted hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        {/* User Context card */}
        <Link href="/settings" className="block p-4 border-b border-border bg-card/25 hover:bg-card/75 transition cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.fullName ? user.fullName[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')
              )}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-foreground truncate">{user?.fullName || (user?.email ? user.email.split('@')[0] : 'User')}</h4>
              <p className="text-[10px] text-text-muted truncate mt-0.5">{user?.email}</p>
              <span className="text-[9px] uppercase font-bold text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-full inline-block mt-1">
                {user?.role || 'STUDENT'}
              </span>
            </div>
          </div>
        </Link>

        {/* Links lists */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks
            .filter(link => link.role === 'STUDENT' || user?.role === 'ADMIN')
            .map((link) => {
              const Icon = link.icon;
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition duration-200 cursor-pointer border ${
                    isActive
                      ? 'bg-primary/10 border-primary/20 text-primary'
                      : 'border-transparent text-text-muted hover:bg-background hover:text-foreground'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </Link>
              );
            })}
        </nav>

        {/* Bottom Panel controls */}
        <div className="p-4 border-t border-border space-y-2 bg-card">
          <button
            onClick={toggleTheme}
            type="button"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-muted hover:bg-background hover:text-foreground border border-transparent hover:border-border transition cursor-pointer"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span>{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-text-muted hover:bg-error/10 hover:text-error border border-transparent hover:border-error/20 transition cursor-pointer"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* CONTENT WORKSPACE WRAP */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar header */}
        <header className="hidden md:flex h-16 bg-card border-b border-border px-8 items-center justify-between z-20">
          <h2 className="text-lg font-bold text-foreground">
            {navLinks.find(l => pathname.startsWith(l.href))?.name || 'NovaHire AI Workspace'}
          </h2>
          
          <div className="flex items-center gap-4">
            {/* Theme Toggle Button (Desktop) */}
            <button
              onClick={toggleTheme}
              type="button"
              className="w-9 h-9 rounded-lg border border-border text-text-muted hover:text-foreground hover:bg-background flex items-center justify-center cursor-pointer transition duration-200"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification trigger button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-9 h-9 rounded-lg border border-border text-text-muted hover:text-foreground hover:bg-background flex items-center justify-center relative cursor-pointer"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-card animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-50 text-foreground"
                  >
                    <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                      <h4 className="font-bold text-sm">Notifications</h4>
                      <button onClick={markAllRead} className="text-xs text-primary hover:text-primary-hover font-semibold cursor-pointer">
                        Mark all read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-border">
                      {notifications.map((n) => (
                        <div key={n.id} className={`p-4 text-xs ${!n.isRead ? 'bg-primary/5' : 'bg-card'}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-bold ${n.type === 'SUCCESS' ? 'text-success' : 'text-primary'}`}>{n.title}</span>
                            {!n.isRead && <span className="w-1.5 h-1.5 bg-primary rounded-full" />}
                          </div>
                          <p className="text-text-muted leading-relaxed">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Avatar details */}
            <Link href="/settings" className="flex items-center gap-3 border-l border-border pl-4 hover:opacity-85 transition cursor-pointer">
              <div className="w-9 h-9 rounded-full bg-background border border-border text-text-muted flex items-center justify-center font-bold overflow-hidden shrink-0">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-text-muted">
                    {user?.fullName ? user.fullName[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')}
                  </span>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold leading-none text-foreground">{user?.fullName || (user?.email ? user.email.split('@')[0] : 'User')}</p>
                <p className="text-[10px] text-text-muted truncate mt-1 leading-none">{user?.email}</p>
                <span className="text-[10px] text-text-muted font-medium capitalize mt-1 inline-block leading-none">{(user?.role || 'STUDENT').toLowerCase()}</span>
              </div>
            </Link>
          </div>
        </header>

        {/* WORKSPACE PAGES PANEL CONTAINER */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background/50">
          {children}
        </main>
      </div>

      {/* MOBILE SIDEBAR NAV OVERLAY */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/40 dark:bg-slate-950/80 backdrop-blur-sm z-30 md:hidden animate-fade-in"
        />
      )}
    </div>
  );
}
