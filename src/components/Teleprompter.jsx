import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles } from 'lucide-react';
import { useStreaming } from '../context/StreamingContext';

/**
 * Teleprompter — streams AI interviewer tokens into the UI word-by-word
 */
export default function Teleprompter({ className = '' }) {
  const { streamedTokens, isStreaming, currentQuestion, fullText } = useStreaming();
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [streamedTokens.length]);

  return (
    <div className={`relative flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4 px-1">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <Bot size={14} className="text-indigo-400" />
          </div>
          {isStreaming && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-obsidian-950 animate-pulse" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">AI Interviewer</p>
          <p className="text-xs text-slate-500 flex items-center gap-1">
            {isStreaming ? (
              <>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                Generating response...
              </>
            ) : currentQuestion ? (
              'Question delivered'
            ) : (
              'Waiting for session...'
            )}
          </p>
        </div>
        {currentQuestion && (
          <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            <Sparkles size={10} className="text-indigo-400" />
            <span className="text-[10px] text-indigo-400 font-medium capitalize">
              {currentQuestion.type?.replace('_', ' ')}
            </span>
          </div>
        )}
      </div>

      {/* Streaming text area */}
      <div
        className="flex-1 overflow-y-auto rounded-xl bg-obsidian-900/60 border border-white/[0.06] p-4 relative"
        style={{ minHeight: 120 }}
      >
        {!currentQuestion && !fullText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Bot size={20} className="text-indigo-500/60" />
            </div>
            <p className="text-sm text-slate-600">Start the session to receive your first question</p>
          </div>
        )}

        <div className="token-stream leading-relaxed">
          <AnimatePresence>
            {streamedTokens.map((token, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 2 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.12 }}
                className="text-slate-200 text-sm"
              >
                {token}
              </motion.span>
            ))}
          </AnimatePresence>

          {isStreaming && (
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: 'reverse' }}
              className="inline-block w-0.5 h-4 bg-indigo-400 ml-0.5 align-text-bottom"
            />
          )}
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}
