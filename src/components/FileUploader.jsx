import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const states = {
  idle:       { label: 'Drop your resume here',      sub: 'PDF, DOCX up to 10MB',                   color: 'indigo' },
  dragging:   { label: 'Release to upload',           sub: 'Looking good!',                           color: 'cyan'   },
  uploading:  { label: 'Analyzing your resume...',    sub: 'Running ATS simulation',                  color: 'indigo' },
  success:    { label: 'Analysis complete!',          sub: 'Scroll down to view results',             color: 'emerald'},
  error:      { label: 'Upload failed',               sub: 'Please try a valid PDF or DOCX file',    color: 'rose'   },
};

const colorMap = {
  indigo:  { border: 'border-indigo-500/30', bg: 'bg-indigo-500/5',  icon: 'text-indigo-400', glow: 'glow-indigo' },
  cyan:    { border: 'border-cyan-500/50',   bg: 'bg-cyan-500/10',   icon: 'text-cyan-400',   glow: 'glow-cyan'   },
  emerald: { border: 'border-emerald-500/40',bg: 'bg-emerald-500/5', icon: 'text-emerald-400',glow: 'glow-emerald'},
  rose:    { border: 'border-rose-500/40',   bg: 'bg-rose-500/5',    icon: 'text-rose-400',   glow: 'glow-rose'   },
};

export default function FileUploader({ onFileReady }) {
  const [uploadState, setUploadState] = useState('idle');
  const [file, setFile] = useState(null);

  const processFile = useCallback(async (f) => {
    if (!f) return;
    const valid = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!valid.includes(f.type) && !f.name.match(/\.(pdf|docx)$/i)) {
      setUploadState('error');
      return;
    }
    setFile(f);
    setUploadState('uploading');
    try {
      await onFileReady(f);
      setUploadState('success');
    } catch {
      setUploadState('error');
    }
  }, [onFileReady]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setUploadState('idle');
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleDragOver = (e) => { e.preventDefault(); setUploadState('dragging'); };
  const handleDragLeave = () => { if (uploadState === 'dragging') setUploadState('idle'); };
  const handleFileInput = (e) => processFile(e.target.files[0]);

  const reset = () => { setUploadState('idle'); setFile(null); };

  const stateData = states[uploadState];
  const colors = colorMap[stateData.color];

  const IconComponent = {
    idle: Upload,
    dragging: Upload,
    uploading: Loader2,
    success: CheckCircle2,
    error: AlertCircle,
  }[uploadState];

  return (
    <motion.div
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
        ${colors.border} ${colors.bg} ${uploadState === 'dragging' ? 'drag-active' : ''}
        ${uploadState === 'success' || uploadState === 'error' ? colors.glow : ''}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      whileHover={uploadState === 'idle' ? { scale: 1.005 } : {}}
      onClick={() => uploadState === 'idle' && document.getElementById('resume-file-input').click()}
    >
      <input
        id="resume-file-input"
        type="file"
        accept=".pdf,.docx"
        className="hidden"
        onChange={handleFileInput}
      />

      <div className="flex flex-col items-center justify-center py-14 px-8 text-center gap-4">
        {/* Animated scan line when uploading */}
        {uploadState === 'uploading' && <div className="scan-line" />}

        <motion.div
          key={uploadState}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className={`w-16 h-16 rounded-2xl flex items-center justify-center ${colors.bg} border border-current ${colors.icon}`}
        >
          <IconComponent
            size={28}
            className={`${colors.icon} ${uploadState === 'uploading' ? 'animate-spin' : ''}`}
          />
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={uploadState}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-1.5"
          >
            <p className={`text-base font-semibold ${colors.icon}`}>{stateData.label}</p>
            <p className="text-sm text-slate-500">{stateData.sub}</p>
            {file && uploadState !== 'idle' && (
              <div className="flex items-center gap-2 mt-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mx-auto">
                <FileText size={12} className="text-slate-400" />
                <span className="text-xs text-slate-400 font-mono">{file.name}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {(uploadState === 'success' || uploadState === 'error') && (
          <button
            onClick={(e) => { e.stopPropagation(); reset(); }}
            className="mt-2 text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors"
          >
            Upload another file
          </button>
        )}

        {uploadState === 'idle' && (
          <p className="text-xs text-slate-600 mt-1">
            or{' '}
            <span className="text-indigo-400 hover:text-indigo-300 cursor-pointer transition-colors">
              click to browse
            </span>
          </p>
        )}
      </div>

      {/* Corner decorations */}
      <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-indigo-500/40 rounded-tl-lg" />
      <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-indigo-500/40 rounded-tr-lg" />
      <div className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-indigo-500/40 rounded-bl-lg" />
      <div className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-indigo-500/40 rounded-br-lg" />
    </motion.div>
  );
}
