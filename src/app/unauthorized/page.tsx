'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    // Clear tokens to avoid redirect loops
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    router.push('/');
  };

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background gradients */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6"
        >
          <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert size={32} className="animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tight">403 - Access Denied</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Unauthorized Access. You do not have permissions to view this administrator resource.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleGoBack}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-sm transition duration-300 shadow-md shadow-purple-900/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowLeft size={16} />
              <span>Back to Login</span>
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
