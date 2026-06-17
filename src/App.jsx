import React, { useState } from 'react';
import { StreamingProvider } from './context/StreamingContext';
import SidebarNav from './components/SidebarNav';
import Dashboard from './views/Dashboard';
import ResumeAnalyzer from './views/ResumeAnalyzer';
import SkillGap from './views/SkillGap';
import MockInterview from './views/MockInterview';
import FeedbackReport from './views/FeedbackReport';
import { AnimatePresence, motion } from 'framer-motion';

const VIEWS = {
  dashboard: Dashboard,
  resume: ResumeAnalyzer,
  skillgap: SkillGap,
  interview: MockInterview,
  feedback: FeedbackReport,
};

const pageVariants = {
  initial: { opacity: 0, x: 24, filter: 'blur(4px)' },
  animate: { opacity: 1, x: 0, filter: 'blur(0px)', transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
  exit:    { opacity: 0, x: -12, filter: 'blur(2px)', transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const ActiveComponent = VIEWS[activeView] || Dashboard;

  return (
    <StreamingProvider>
      <div className="flex h-screen w-screen overflow-hidden bg-obsidian-950 cyber-grid-bg">
        {/* Mesh gradient overlays */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        {/* Sidebar */}
        <SidebarNav activeView={activeView} setActiveView={setActiveView} />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="h-full overflow-y-auto"
            >
              <ActiveComponent setActiveView={setActiveView} />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </StreamingProvider>
  );
}
