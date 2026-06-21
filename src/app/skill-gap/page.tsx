'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../../components/LayoutShell';
import { atsApi } from '../../lib/api';
import { Check, X, ArrowRight, Briefcase } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SkillGapPage() {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSkillGap() {
      try {
        let params: any = {};
        let reportId = null;
        let jobProfileId = null;
        
        if (typeof window !== 'undefined') {
          const searchParams = new URLSearchParams(window.location.search);
          reportId = searchParams.get('reportId');
          jobProfileId = searchParams.get('jobProfileId');
        }

        // Retrieve from sessionStorage if no query params present
        if (!reportId && !jobProfileId && typeof window !== 'undefined') {
          const savedReport = sessionStorage.getItem('ats_report');
          if (savedReport) {
            try {
              const parsed = JSON.parse(savedReport);
              if (parsed && parsed.id) {
                reportId = parsed.id;
              }
            } catch (e) {}
          }
        }

        // If there's no selected report / active profile, show empty state immediately
        if (!reportId && !jobProfileId) {
          setReport(null);
          setIsLoading(false);
          return;
        }

        if (reportId) params.reportId = reportId;
        if (jobProfileId) params.jobProfileId = jobProfileId;

        const data = await atsApi.analyzeSkillGap(params);
        setReport(data.report);
      } catch (err: any) {
        // 404 is expected if they haven't uploaded a resume yet
        if (err.message && err.message.includes('No skill gap reports')) {
          setReport(null);
        } else {
          setError(err.message || 'Failed to load skill gap report.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadSkillGap();
  }, []);

  const parseMatchingList = (str: string): Array<{ skill: string; category?: string }> => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { skill: item };
          }
          return {
            skill: item.skill || 'Unknown Skill',
            category: item.category
          };
        });
      }
    } catch {
      return [];
    }
    return [];
  };

  const parseMissingSkills = (str: string): Array<{ skill: string; category?: string }> => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => {
          if (typeof item === 'string') {
            return { skill: item };
          }
          return {
            skill: item.skill || 'Unknown Skill',
            category: item.category
          };
        });
      }
    } catch {
      return [];
    }
    return [];
  };

  const matchingList = report ? parseMatchingList(report.matchingSkills) : [];
  const missingList = report ? parseMissingSkills(report.missingSkills) : [];

  const totalSkillsCount = matchingList.length + missingList.length;
  const matchPct = totalSkillsCount > 0 
    ? Math.round((matchingList.length / totalSkillsCount) * 100) 
    : 0;

  // Maps any skill category dynamically to one of the 5 simplified categories
  const getSkillCategory = (skillName: string, itemCategory?: string): string => {
    const normalizedName = skillName.toLowerCase().trim();
    
    const languages = [
      'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'c', 'go', 'golang', 
      'rust', 'ruby', 'php', 'swift', 'kotlin', 'solidity', 'r', 'html', 'css', 'sql', 
      'shell', 'bash', 'powershell', 'scala', 'haskell', 'perl', 'sass', 'less', 'graphql'
    ];
    
    const frameworks = [
      'react', 'angular', 'vue', 'vue.js', 'next.js', 'nextjs', 'nuxt', 'express', 
      'nestjs', 'spring boot', 'spring', 'flask', 'django', 'fastapi', 'laravel', 
      'rails', 'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'keras', 
      'flutter', 'react native', 'svelte', 'tailwindcss', 'bootstrap', 'jquery', 
      'hibernate', 'prisma', 'sequelize', 'mongoose', 'redux', 'mobx', 'webpack', 
      'vite', 'pnpm', 'npm', 'yarn', 'jest', 'cypress', 'playwright', 'selenium', 
      'mocha', 'chai', 'junit', 'pytest'
    ];
    
    const databases = [
      'postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'oracle', 
      'sql server', 'cassandra', 'dynamodb', 'neo4j', 'firebase', 'elasticsearch', 
      'mariadb', 'couchdb'
    ];
    
    const cloud = [
      'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'terraform', 
      'ansible', 'git', 'github', 'gitlab', 'jenkins', 'ci/cd', 'circleci', 'prometheus', 
      'grafana', 'elk', 'splunk', 'datadog', 'nginx', 'apache'
    ];

    if (languages.includes(normalizedName)) return 'Programming Languages';
    if (frameworks.includes(normalizedName)) return 'Frameworks';
    if (databases.includes(normalizedName)) return 'Databases';
    if (cloud.includes(normalizedName)) return 'Cloud';

    if (itemCategory) {
      const cat = itemCategory.toLowerCase();
      if (cat.includes('language')) return 'Programming Languages';
      if (cat.includes('framework') || cat.includes('librar')) return 'Frameworks';
      if (cat.includes('cloud') || cat.includes('devops') || cat.includes('platform')) return 'Cloud';
      if (cat.includes('database') || cat.includes('db')) return 'Databases';
      if (cat.includes('tool')) return 'Tools';
    }

    return 'Tools';
  };

  const CATEGORY_ORDER = [
    'Programming Languages',
    'Frameworks',
    'Tools',
    'Cloud',
    'Databases'
  ];

  // Group matching skills by category
  const groupedMatching: Record<string, string[]> = {
    'Programming Languages': [],
    'Frameworks': [],
    'Tools': [],
    'Cloud': [],
    'Databases': []
  };
  matchingList.forEach(item => {
    if (item.skill) {
      const cat = getSkillCategory(item.skill, item.category);
      if (!groupedMatching[cat]) groupedMatching[cat] = [];
      groupedMatching[cat].push(item.skill);
    }
  });

  // Group missing skills by category
  const groupedMissing: Record<string, string[]> = {
    'Programming Languages': [],
    'Frameworks': [],
    'Tools': [],
    'Cloud': [],
    'Databases': []
  };
  missingList.forEach(item => {
    if (item.skill) {
      const cat = getSkillCategory(item.skill, item.category);
      if (!groupedMissing[cat]) groupedMissing[cat] = [];
      groupedMissing[cat].push(item.skill);
    }
  });

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-white mb-1">NovaHire AI</h1>
          <p className="text-slate-400 text-sm">Target Role Skill Gap Analysis</p>
        </div>

        {isLoading ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading skills gap analysis from your target profile...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/40 border border-rose-900/40 rounded-xl text-rose-300 text-sm text-center">
            {error}
          </div>
        ) : report ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Active Profile Info */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex justify-between items-center">
              <div>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">Target Profile</span>
                <h2 className="text-lg font-bold text-white mt-1">{report.jobTitle}</h2>
              </div>
              <span className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-slate-400 text-xs font-semibold">
                Dynamic Analysis Active
              </span>
            </div>

            {/* Skill Match compatibility meter */}
            <div className="bg-slate-900 border border-slate-850 p-6 rounded-2xl flex flex-col sm:flex-row items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center relative shadow-inner shrink-0">
                <div className="text-center">
                  <span className="text-2xl font-black text-purple-400">{matchPct}%</span>
                  <span className="block text-[8px] text-slate-550 font-bold uppercase mt-0.5">Match</span>
                </div>
              </div>

              <div className="flex-1 w-full">
                <h3 className="text-base font-bold text-white mb-1">Skill Match: {matchPct}%</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-3">
                  Based on: (Number of matching skills / Total required skills)
                </p>
                <div className="w-full h-2.5 bg-slate-950 border border-slate-855 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${matchPct}%` }} />
                </div>
              </div>
            </div>

            {/* Existing vs Missing Skills side-by-side */}
            <div className="grid md:grid-cols-2 gap-6">
              
              {/* EXISTING SKILLS COLUMN */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Existing Skills</h3>
                  <p className="text-xs text-slate-400 mt-1">Skills already present in the resume.</p>
                </div>

                <div className="space-y-6">
                  {CATEGORY_ORDER.map(category => {
                    const skills = groupedMatching[category] || [];
                    if (skills.length === 0) return null;
                    return (
                      <div key={category} className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">{category}</span>
                        <div className="space-y-2">
                          {skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <Check size={10} className="text-emerald-400" />
                              </div>
                              <span className="text-xs font-semibold text-slate-200">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {Object.values(groupedMatching).every(arr => arr.length === 0) && (
                    <p className="text-xs text-slate-500">No existing skills recognized in this category.</p>
                  )}
                </div>
              </div>

              {/* MISSING SKILLS COLUMN */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="border-b border-slate-800 pb-3">
                  <h3 className="text-lg font-bold text-white">Missing Skills</h3>
                  <p className="text-xs text-slate-400 mt-1">Skills required for the role but missing from the resume.</p>
                </div>

                <div className="space-y-6">
                  {CATEGORY_ORDER.map(category => {
                    const skills = groupedMissing[category] || [];
                    if (skills.length === 0) return null;
                    return (
                      <div key={category} className="space-y-2">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">{category}</span>
                        <div className="space-y-2">
                          {skills.map((skill, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded-full bg-rose-500/10 flex items-center justify-center shrink-0">
                                <X size={10} className="text-rose-455" />
                              </div>
                              <span className="text-xs font-semibold text-slate-200">{skill}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {Object.values(groupedMissing).every(arr => arr.length === 0) && (
                    <p className="text-xs text-emerald-400 font-medium">No missing skills! You meet all requirement criteria.</p>
                  )}
                </div>
              </div>

            </div>

            {/* GENERATE ROADMAP TRIGGER BOX */}
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-6">
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Bridge your missing skill gaps!</h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Generate a personalized learning roadmap directly focusing on your detected skill gaps.
                </p>
              </div>
              
              <button
                onClick={() => router.push(report ? `/roadmap?jobProfileId=${report.jobProfileId}` : '/roadmap')}
                className="w-full sm:w-auto px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <span>Build Learning Roadmap</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </motion.div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center py-16 flex flex-col items-center justify-center max-w-xl mx-auto">
            <Briefcase size={40} className="text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Active Skill Gap Report</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-sm leading-relaxed">
              Before calculating skill gaps, you must upload your resume and enter a target Job Description in the ATS Analyzer.
            </p>
            <button
              onClick={() => router.push('/ats')}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
            >
              Analyze Resume now
            </button>
          </div>
        )}
      </div>
    </LayoutShell>
  );
}
