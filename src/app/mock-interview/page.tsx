'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../../components/LayoutShell';
import { interviewApi, authApi } from '../../lib/api';
import { Sparkles, Video, AlertCircle, RefreshCw } from 'lucide-react';

const PREDEFINED_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "AI Engineer",
  "Data Scientist",
  "Data Analyst",
  "Business Analyst",
  "Cloud Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Automation Test Engineer",
  "Cybersecurity Analyst",
  "Site Reliability Engineer",
  "Product Manager",
  "UI/UX Designer",
  "Mobile App Developer",
  "Game Developer"
];

const EXPERIENCE_LEVELS = [
  "Fresher",
  "0-1 Years",
  "1-3 Years",
  "3-5 Years",
  "5+ Years",
  "Senior"
];

export default function MockInterviewSetup() {
  const router = useRouter();

  // Config States
  const [type, setType] = useState('MIXED'); // Default changed to MIXED
  const [company, setCompany] = useState('Google');
  const [customCompany, setCustomCompany] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM'); // Default is MEDIUM
  const [questionCount, setQuestionCount] = useState(10); // Default changed to 10
  const [role, setRole] = useState('Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Fresher');
  const [questionSource, setQuestionSource] = useState('AI');
  const [customQuestionsText, setCustomQuestionsText] = useState('');
  const [customCountActive, setCustomCountActive] = useState(false);
  const [customCountValue, setCustomCountValue] = useState('10');

  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isPrepopulated, setIsPrepopulated] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function initPage() {
      try {
        const data = await authApi.getDashboardStats();
        const profile = data.activeJobProfile || null;
        setActiveProfile(profile);
        
        let initialRole = 'Software Engineer';
        let initialExp = 'Fresher';
        let populated = false;

        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const qRole = urlParams.get('role');
          const qExp = urlParams.get('experience');

          if (qRole) {
            initialRole = qRole;
            populated = true;
          } else if (profile) {
            initialRole = profile.domainClassification || profile.jobTitle || 'Software Engineer';
            populated = true;
          }

          if (qExp) {
            initialExp = qExp;
          } else if (profile && profile.experienceLevel) {
            initialExp = profile.experienceLevel;
          }
        }

        setRole(initialRole);
        setExperienceLevel(initialExp);
        setIsPrepopulated(populated);
      } catch (err) {
        console.error('Failed to load active profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    }
    initPage();
  }, []);

  const typesList = [
    { value: 'MIXED', label: 'Mixed Session', desc: 'A custom blended mix of general tech, behavioral, and HR.' },
    { value: 'TECHNICAL', label: 'Technical', desc: 'Focuses on coding, algorithms, and system architecture.' },
    { value: 'BEHAVIORAL', label: 'Behavioral', desc: 'STAR questions evaluating cooperation and culture fit.' },
    { value: 'SYSTEM_DESIGN', label: 'System Design', desc: 'Evaluates scalability, microservices, and databases.' },
    { value: 'HR', label: 'HR & Screening', desc: 'General screening, professional background, and aspirations.' }
  ];

  const companiesList = [
    'Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Netflix', 
    'Uber', 'Airbnb', 'Stripe', 'Salesforce', 'Spotify', 'Oracle', 
    'IBM', 'Adobe', 'Intel', 'Deloitte', 'Accenture', 'Custom'
  ];

  const handleLaunch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const finalCompany = company === 'Custom' ? customCompany : company;
    if (company === 'Custom' && !customCompany) {
      setError('Please provide a custom company name.');
      setIsLoading(false);
      return;
    }

    let finalCount = customCountActive ? parseInt(customCountValue, 10) : questionCount;
    let customQuestionsList: string[] = [];
    if (questionSource === 'CUSTOM') {
      customQuestionsList = customQuestionsText
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0);
      if (customQuestionsList.length === 0) {
        setError('Please provide at least one custom question.');
        setIsLoading(false);
        return;
      }
      finalCount = customQuestionsList.length;
    }
    if (isNaN(finalCount) || finalCount < 1 || finalCount > 25) {
      setError('Please provide a valid question count between 1 and 25.');
      setIsLoading(false);
      return;
    }

    try {
      const data = await interviewApi.start({
        type,
        company: finalCompany,
        difficulty,
        questionCount: finalCount,
        role,
        experienceLevel,
        questionSource,
        customQuestions: questionSource === 'CUSTOM' ? customQuestionsList : undefined
      });

      router.push(`/mock-interview/${data.session.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize mock interview. Please try again.');
      setIsLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <LayoutShell>
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading active candidate profile...</p>
          </div>
        </div>
      </LayoutShell>
    );
  }

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-white mb-1">AI Mock Interview Room</h1>
            <p className="text-slate-400 text-sm">Launch a customized, company-specific simulated voice/text room.</p>
          </div>
          <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl shrink-0">
            <Video size={24} />
          </div>
        </div>

        {isPrepopulated && (
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 text-slate-300 text-xs flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <span>We pre-populated target role and experience level from your active ATS resume profile. You can still modify them below.</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* SETUP FORM */}
        <form onSubmit={handleLaunch} className="grid md:grid-cols-3 gap-6">
          
          {/* COLUMN 1 & 2: Main configurations */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Interview Type Selector cards */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">1. Select Interview Type</h3>
              <div className="space-y-3">
                {typesList.map((t) => (
                  <label
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition select-none ${
                      type === t.value
                        ? 'bg-purple-600/5 border-purple-500 text-purple-400'
                        : 'bg-slate-950 border-slate-850 hover:bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewType"
                      checked={type === t.value}
                      onChange={() => {}}
                      className="mt-1 accent-purple-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block mb-0.5">{t.label}</span>
                      <span className="text-[10px] text-slate-500 leading-relaxed block">{t.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Select Question Source Card */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Select Question Source</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { value: 'AI', label: 'AI Generated', desc: 'Dynamically drafted' },
                  { value: 'ADMIN', label: 'Admin Question Bank', desc: 'Pre-vetted db pool' },
                  { value: 'COMPANY', label: 'Company-Specific', desc: 'Vetted by employer' },
                  { value: 'CUSTOM', label: 'Custom Questions', desc: 'Type/paste your own' }
                ].map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setQuestionSource(s.value)}
                    className={`p-3.5 border rounded-xl text-left transition select-none flex flex-col justify-between ${
                      questionSource === s.value
                        ? 'bg-purple-600/5 border-purple-500 text-purple-450 dark:text-purple-400'
                        : 'bg-slate-955 border-slate-850 hover:bg-slate-900/50 text-slate-500'
                    }`}
                  >
                    <span className="text-xs font-bold text-white mb-0.5 block">{s.label}</span>
                    <span className="text-[10px] text-slate-550 leading-normal block">{s.desc}</span>
                  </button>
                ))}
              </div>

              {questionSource === 'CUSTOM' && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Custom Questions (one per line, up to 25)</label>
                  <textarea
                    rows={6}
                    value={customQuestionsText}
                    onChange={(e) => setCustomQuestionsText(e.target.value)}
                    placeholder="e.g.&#10;What is React Fiber?&#10;Explain closures in JavaScript.&#10;How does a LEFT JOIN differ from an INNER JOIN?"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                    Enter each question on a new line. The interview count will dynamically match the number of questions entered.
                  </p>
                </div>
              )}
            </div>

            {/* Target Role & Company Grid */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl grid md:grid-cols-2 gap-6">
              
              {/* Job Role Choice */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Target Job Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition"
                >
                  {PREDEFINED_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Select your target job role. Questions will be generated specific to this domain.
                </p>
              </div>

              {/* Experience Level Choice */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition"
                >
                  {EXPERIENCE_LEVELS.map(exp => <option key={exp} value={exp}>{exp}</option>)}
                </select>
                <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">
                  Questions will scale in complexity matching your target experience seniority.
                </p>
              </div>

            </div>
          </div>

          {/* COLUMN 3: Question metadata scopes */}
          <div className="space-y-6">
            
            {/* Target Company */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">2. Company Target</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Company</label>
                <select
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-850 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-purple-500 transition mb-3"
                >
                  {companiesList.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                {company === 'Custom' && (
                  <input
                    type="text"
                    required
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="Enter custom company name"
                    className="w-full px-4 py-2 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition"
                  />
                )}
              </div>
            </div>

            {/* Difficulty and Question count settings */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">3. Interview Details</h3>
              
              {/* Difficulty */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Difficulty Level</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {['EASY', 'MEDIUM', 'HARD'].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDifficulty(d)}
                      className={`py-2 px-1 border rounded-lg text-[10px] font-bold tracking-wider cursor-pointer uppercase transition ${
                        difficulty === d
                          ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:bg-slate-900'
                      }`}
                    >
                      {d.toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Question count settings */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block">Number of Questions</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {[5, 10, 15, 20, 25].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setQuestionCount(c);
                        setCustomCountActive(false);
                      }}
                      className={`py-2 px-1 border rounded-lg text-[10px] font-bold cursor-pointer transition ${
                        !customCountActive && questionCount === c
                          ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                          : 'bg-slate-950 border-slate-850 text-slate-500 hover:bg-slate-900'
                      }`}
                    >
                      {c} Questions
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setCustomCountActive(true)}
                    className={`py-2 px-1 border rounded-lg text-[10px] font-bold cursor-pointer transition ${
                      customCountActive
                        ? 'bg-purple-600/10 border-purple-500 text-purple-400'
                        : 'bg-slate-955 border-slate-850 text-slate-500 hover:bg-slate-900'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {customCountActive && (
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={customCountValue}
                    onChange={(e) => setCustomCountValue(e.target.value)}
                    placeholder="Enter count (1-25)"
                    className="w-full mt-2 px-3 py-2 bg-slate-955 border border-slate-850 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 transition"
                  />
                )}
              </div>
            </div>

            {/* Launch Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-sm transition duration-300 shadow-lg shadow-purple-900/30 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Configuring Room...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Launch Interview Room</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </LayoutShell>
  );
}
