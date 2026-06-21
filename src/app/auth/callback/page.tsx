'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabaseClient';
import { authApi, api } from '../../../lib/api';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Completing OAuth handshake...');
  const [error, setError] = useState('');

  useEffect(() => {
    async function handleCallback() {
      if (!supabase) {
        setError('Supabase is not configured. Please supply keys in your .env.local file.');
        return;
      }

      try {
        setStatus('Retrieving authentication session from Supabase...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session || !session.user) {
          setError('No active session found. Please try logging in again.');
          return;
        }

        setStatus('Synchronizing user details with local database...');
        const user = session.user;
        const provider = user.app_metadata.provider || 'oauth';
        const fullName = user.user_metadata.full_name || user.email?.split('@')[0] || 'OAuth User';

        // Call express backend to merge accounts and return internal session JWT
        const syncResponse = await authApi.oauth({
          email: user.email,
          fullName,
          provider
        });

        // Store internal credentials
        localStorage.setItem('token', syncResponse.token);

        const localTheme = localStorage.getItem('theme') || localStorage.getItem('landing_theme');
        let finalUser = syncResponse.user;
        if (localTheme) {
          try {
            await api.put('/auth/theme', { theme: localTheme.toUpperCase() });
            finalUser = { ...finalUser, theme: localTheme.toUpperCase() };
          } catch (themeErr) {
            console.error('Failed to sync theme preference during OAuth callback:', themeErr);
          }
        }
        localStorage.setItem('user', JSON.stringify(finalUser));

        setStatus('Success! Redirecting to dashboard...');
        setTimeout(() => {
          if (syncResponse.user?.role?.toUpperCase() === 'ADMIN') {
            router.push('/admin/dashboard');
          } else {
            router.push('/dashboard');
          }
        }, 800);

      } catch (err: any) {
        console.error('OAuth Callback Sync Error:', err);
        setError(err.message || 'OAuth synchronization failed.');
      }
    }

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl w-full max-w-md shadow-2xl text-center space-y-6">
        
        {error ? (
          <>
            <div className="w-12 h-12 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-white">Handshake Failed</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{error}</p>
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Back to Login
            </button>
          </>
        ) : (
          <>
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-white">OAuth Verification</h3>
            <p className="text-xs text-slate-400 animate-pulse">{status}</p>
          </>
        )}

      </div>
    </div>
  );
}
