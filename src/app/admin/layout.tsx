'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '../../lib/api';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Sliders,
  ClipboardList,
  Activity,
  Settings,
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [authorized, setAuthorized] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  useEffect(() => {
    const user = api.getUser();
    if (!user || (user.role || '').toUpperCase() !== 'ADMIN') {
      router.push('/unauthorized');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Question Bank', href: '/admin/questions', icon: BookOpen },
    { label: 'ATS & Interview', href: '/admin/ats-settings', icon: Sliders },
    { label: 'Audit Logs', href: '/admin/audit-logs', icon: ClipboardList },
    { label: 'AI Monitoring', href: '/admin/ai-monitoring', icon: Activity },
    { label: 'Settings', href: '/admin/settings', icon: Settings }
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      isDark ? 'bg-[#000000] text-[#FFFFFF]' : 'bg-[#FFFFFF] text-[#000000]'
    }`}>
      {/* MOBILE HEADER */}
      <header className={`md:hidden flex justify-between items-center p-4 border-b ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB]'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-sm">NH</span>
          <span className="font-extrabold text-sm tracking-tight">NovaHire Admin</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className={`p-2 rounded-lg ${isDark ? 'hover:bg-slate-900' : 'hover:bg-slate-100'}`}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* MOBILE SIDEBAR DROPDOWN */}
      {mobileMenuOpen && (
        <div className={`md:hidden flex flex-col p-4 border-b space-y-2 ${
          isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB]'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition ${
                  active 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : isDark ? 'text-slate-400 hover:bg-slate-900 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-black'
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase transition cursor-pointer ${
              isDark ? 'text-rose-400 hover:bg-rose-950/20' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className={`hidden md:flex flex-col w-64 border-r shrink-0 ${
        isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB]'
      }`}>
        <div className="p-6 border-b border-inherit">
          <Link href="/admin/dashboard" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-black text-base shadow-md shadow-purple-500/25">NH</div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block">NovaHire AI</span>
              <span className="text-[9px] font-bold tracking-widest uppercase text-purple-500 block">Admin Portal</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition ${
                  active 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : isDark ? 'text-slate-400 hover:bg-slate-900/60 hover:text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-black'
                }`}
              >
                <Icon size={16} className={active ? 'text-white' : 'text-purple-500'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-inherit">
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
              isDark ? 'text-rose-400 hover:bg-rose-950/20' : 'text-rose-600 hover:bg-rose-50'
            }`}
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
