'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '../../../lib/api';
import { useTheme } from '../../../context/ThemeContext';
import {
  Sliders,
  Video,
  Layers,
  Save,
  Undo,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';

export default function AtsSettings() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ATS Weights state
  const [atsScoreWeight, setAtsScoreWeight] = useState(0.15);
  const [skillMatchWeight, setSkillMatchWeight] = useState(0.20);
  const [projectWeight, setProjectWeight] = useState(0.15);
  const [experienceWeight, setExperienceWeight] = useState(0.15);
  const [educationWeight, setEducationWeight] = useState(0.10);
  const [certificationWeight, setCertificationWeight] = useState(0.10);
  const [keywordWeight, setKeywordWeight] = useState(0.15);

  // Interview Weights state
  const [technicalScoreWeight, setTechnicalScoreWeight] = useState(0.30);
  const [communicationWeight, setCommunicationWeight] = useState(0.20);
  const [confidenceWeight, setConfidenceWeight] = useState(0.15);
  const [problemSolvingWeight, setProblemSolvingWeight] = useState(0.20);
  const [domainKnowledgeWeight, setDomainKnowledgeWeight] = useState(0.15);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSettings();
      if (res.settings) {
        setAtsScoreWeight(res.settings.atsScoreWeight);
        setSkillMatchWeight(res.settings.skillMatchWeight);
        setProjectWeight(res.settings.projectWeight);
        setExperienceWeight(res.settings.experienceWeight);
        setEducationWeight(res.settings.educationWeight);
        setCertificationWeight(res.settings.certificationWeight);
        setKeywordWeight(res.settings.keywordWeight);

        setTechnicalScoreWeight(res.settings.technicalScoreWeight);
        setCommunicationWeight(res.settings.communicationWeight);
        setConfidenceWeight(res.settings.confidenceWeight);
        setProblemSolvingWeight(res.settings.problemSolvingWeight);
        setDomainKnowledgeWeight(res.settings.domainKnowledgeWeight);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve admin scoring configuration.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    
    try {
      const payload = {
        atsScoreWeight,
        skillMatchWeight,
        projectWeight,
        experienceWeight,
        educationWeight,
        certificationWeight,
        keywordWeight,
        technicalScoreWeight,
        communicationWeight,
        confidenceWeight,
        problemSolvingWeight,
        domainKnowledgeWeight
      };

      await adminApi.updateSettings(payload);
      setSuccess('Scoring configuration weights saved successfully! Future evaluations will reflect these weights.');
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to update settings.');
    }
  };

  // Helper calculation for weights summation
  const atsSum = atsScoreWeight + skillMatchWeight + projectWeight + experienceWeight + educationWeight + certificationWeight + keywordWeight;
  const interviewSum = technicalScoreWeight + communicationWeight + confidenceWeight + problemSolvingWeight + domainKnowledgeWeight;

  if (loading) {
    return (
      <div className="min-h-[450px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Scoring Configurations</h1>
        <p className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Tune system-wide mathematical weights for ATS resume parser and mock interview evaluation algorithms.
        </p>
      </div>

      {success && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 text-xs font-semibold ${
          isDark ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold ${
          isDark ? 'bg-rose-950/20 border-rose-900/30 text-rose-450' : 'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* ATS SCORING WEIGHTS PANEL */}
          <div className={`border p-6 rounded-2xl space-y-5 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <Layers size={14} />
              <span>ATS Resume Evaluation Weights</span>
            </h3>

            <div className="space-y-4">
              {[
                { label: 'ATS Score Weight (Overall multiplier)', val: atsScoreWeight, set: setAtsScoreWeight },
                { label: 'Skill Match Weight', val: skillMatchWeight, set: setSkillMatchWeight },
                { label: 'Project Depth Weight', val: projectWeight, set: setProjectWeight },
                { label: 'Experience Alignment Weight', val: experienceWeight, set: setExperienceWeight },
                { label: 'Education Weight', val: educationWeight, set: setEducationWeight },
                { label: 'Certification Weight', val: certificationWeight, set: setCertificationWeight },
                { label: 'Keyword Density Weight', val: keywordWeight, set: setKeywordWeight }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>{item.label}</span>
                    <span>{Math.round(item.val * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={item.val}
                      onChange={(e) => item.set(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-900 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-xl border flex justify-between items-center text-[10px] font-bold ${
              Math.abs(atsSum - 1.0) < 0.01 
                ? isDark ? 'bg-emerald-950/10 border-emerald-900/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : isDark ? 'bg-amber-950/10 border-amber-900/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
              <span>Total Combined ATS Weight:</span>
              <span className="text-xs font-black">{Math.round(atsSum * 100)}%</span>
            </div>
          </div>

          {/* INTERVIEW EVALUATION WEIGHTS PANEL */}
          <div className={`border p-6 rounded-2xl space-y-5 ${
            isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
          }`}>
            <h3 className="text-xs font-black uppercase tracking-wider text-purple-500 flex items-center gap-2">
              <Video size={14} />
              <span>Mock Interview Room Weights</span>
            </h3>

            <div className="space-y-4">
              {[
                { label: 'Technical Score Weight', val: technicalScoreWeight, set: setTechnicalScoreWeight },
                { label: 'Communication Pacing Weight', val: communicationWeight, set: setCommunicationWeight },
                { label: 'Confidence & Grammar Weight', val: confidenceWeight, set: setConfidenceWeight },
                { label: 'Problem Solving Methodologies', val: problemSolvingWeight, set: setProblemSolvingWeight },
                { label: 'Domain Knowledge Score', val: domainKnowledgeWeight, set: setDomainKnowledgeWeight }
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-slate-500">
                    <span>{item.label}</span>
                    <span>{Math.round(item.val * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={item.val}
                      onChange={(e) => item.set(parseFloat(e.target.value))}
                      className="w-full h-1 bg-slate-900 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className={`p-4 rounded-xl border flex justify-between items-center text-[10px] font-bold ${
              Math.abs(interviewSum - 1.0) < 0.01 
                ? isDark ? 'bg-emerald-950/10 border-emerald-900/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                : isDark ? 'bg-amber-950/10 border-amber-900/20 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'
            }`}>
              <span>Total Combined Interview Weight:</span>
              <span className="text-xs font-black">{Math.round(interviewSum * 100)}%</span>
            </div>
          </div>

        </div>

        {/* SUBMIT BUTTON BAR */}
        <div className={`border p-4 rounded-2xl flex items-center justify-between gap-4 ${
          isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-[#FFFFFF] border-[#E5E7EB] shadow-sm'
        }`}>
          <div className="flex items-center gap-2 text-slate-550 text-[10px] font-bold">
            <ShieldCheck size={14} className="text-purple-500" />
            <span>Configured weights are applied on the server during new evaluations.</span>
          </div>

          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={loadSettings}
              className={`px-4 py-2 border rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer ${
                isDark ? 'bg-slate-900 border-[#2A2A2A] text-slate-300 hover:bg-slate-800' : 'bg-white border-[#E5E7EB] text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Undo size={13} />
              <span>Reset Values</span>
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={13} />
              <span>Save Scoring Configuration</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
