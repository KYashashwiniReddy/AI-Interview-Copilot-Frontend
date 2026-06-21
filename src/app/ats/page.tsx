'use client';

import React, { useState, useEffect, useRef } from 'react';
import LayoutShell from '../../components/LayoutShell';
import { api, atsApi } from '../../lib/api';
import { FileUp, Sparkles, CheckCircle2, AlertCircle, RefreshCw, FileText, ArrowRight, Briefcase, Download, TrendingUp, Plus, Minus, RotateCcw, ArrowLeft, Check, X, Sun, Moon, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

const detectSectionsInResume = (text: string): string[] => {
  if (!text) return [];
  const lines = text.split('\n').map(l => l.trim());
  const found: string[] = [];
  
  const headerKeywords = [
    'summary', 'professional summary', 'career summary', 'profile summary', 'overview', 'about me', 'professional profile', 'career objective', 'objective', 'personal statement',
    'technical skills', 'core competencies', 'expertise', 'skills', 'technologies',
    'projects', 'academic projects', 'key projects',
    'professional experience', 'work experience', 'experience', 'internships', 'employment history', 'work history',
    'certifications', 'certification', 'licenses', 'courses',
    'achievements', 'awards', 'honors',
    'education', 'academic qualifications', 'academic background'
  ];

  for (const line of lines) {
    if (line.length > 2 && line.length < 40) {
      const cleanLine = line.replace(/[\[\]\*\:#]/g, '').trim();
      const lower = cleanLine.toLowerCase();
      if (headerKeywords.includes(lower)) {
        if (!found.includes(cleanLine)) {
          found.push(cleanLine);
        }
      }
    }
  }
  return found;
};

const linkify = (text: string, previewTheme: 'LIGHT' | 'DARK'): React.ReactNode => {
  if (!text) return text;
  const regex = /(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b|\b(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  const parts = text.split(regex);
  if (parts.length <= 1) return text;
  
  return (
    <>
      {parts.map((part, index) => {
        if (regex.test(part)) {
          const isEmail = part.includes('@');
          const href = isEmail ? `mailto:${part}` : (part.startsWith('http') ? part : `https://${part}`);
          const linkColor = previewTheme === 'DARK' ? 'text-blue-400 hover:underline' : 'text-blue-600 hover:underline';
          return (
            <a key={index} href={href} target="_blank" rel="noopener noreferrer" className={`${linkColor} font-semibold`}>
              {part}
            </a>
          );
        }
        return part;
      })}
    </>
  );
};

const renderDiffText = (text: string) => {
  if (!text) return null;
  const tagRegex = /(<(?:ins|mark|del)>[\s\S]*?<\/(?:ins|mark|del)>)/g;
  const parts = text.split(tagRegex);

  return parts.map((part, index) => {
    if (part.startsWith('<ins>')) {
      const content = part.replace(/<\/?ins>/g, '');
      return (
        <ins key={index} className="bg-emerald-950/70 text-emerald-400 no-underline px-1 py-0.5 rounded font-bold border border-emerald-500/30">
          {content}
        </ins>
      );
    } else if (part.startsWith('<mark>')) {
      const content = part.replace(/<\/?mark>/g, '');
      return (
        <mark key={index} className="bg-amber-950/70 text-amber-400 px-1 py-0.5 rounded font-bold border border-amber-500/30">
          {content}
        </mark>
      );
    } else if (part.startsWith('<del>')) {
      const content = part.replace(/<\/?del>/g, '');
      return (
        <del key={index} className="bg-rose-950/50 text-rose-450 line-through px-1 py-0.5 rounded border border-rose-900/30">
          {content}
        </del>
      );
    } else {
      return <React.Fragment key={index}>{linkify(part, 'DARK')}</React.Fragment>;
    }
  });
};

const renderDiffTextLight = (text: string) => {
  if (!text) return null;
  const tagRegex = /(<(?:ins|mark|del)>[\s\S]*?<\/(?:ins|mark|del)>)/g;
  const parts = text.split(tagRegex);

  return parts.map((part, index) => {
    if (part.startsWith('<ins>')) {
      const content = part.replace(/<\/?ins>/g, '');
      return (
        <ins key={index} className="bg-emerald-100 text-emerald-800 no-underline px-1 py-0.5 rounded font-bold border border-emerald-300/40">
          {content}
        </ins>
      );
    } else if (part.startsWith('<mark>')) {
      const content = part.replace(/<\/?mark>/g, '');
      return (
        <mark key={index} className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-bold border border-amber-300/40">
          {content}
        </mark>
      );
    } else if (part.startsWith('<del>')) {
      const content = part.replace(/<\/?del>/g, '');
      return (
        <del key={index} className="bg-rose-100 text-rose-800 line-through px-1 py-0.5 rounded border border-rose-300/30">
          {content}
        </del>
      );
    } else {
      return <React.Fragment key={index}>{linkify(part, 'LIGHT')}</React.Fragment>;
    }
  });
};

const parseResumeTextToLines = (text: string) => {
  if (!text) return [];
  const lines = text.split('\n');
  const sectionHeadersKeywords = [
    'summary', 'professional summary', 'career summary', 'executive summary', 'profile', 'about me', 'personal statement',
    'objective', 'career objective',
    'experience', 'work experience', 'professional experience', 'employment history', 'employment', 'work history', 'job history',
    'skills', 'technical skills', 'key skills', 'core competencies', 'technologies', 'languages', 'frameworks', 'tools', 'skills & technologies',
    'projects', 'key projects', 'academic projects', 'personal projects',
    'education', 'academic background', 'academic history', 'academics',
    'certifications', 'certificates', 'credentials', 'licenses',
    'achievements', 'awards', 'honors',
    'publications', 'patents', 'presentations',
    'interests', 'hobbies', 'languages', 'skills & tools'
  ];

  const getSectionHeader = (line: string): string | null => {
    const trimmed = line.trim();
    if (trimmed.length < 2 || trimmed.length > 40) return null;
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed.substring(1, trimmed.length - 1).trim();
    }
    const clean = trimmed.replace(/[:.]$/, '').trim();
    const lower = clean.toLowerCase();
    const isKeyword = sectionHeadersKeywords.some(keyword => {
      return lower === keyword || lower === `${keyword}s` || lower.startsWith(`${keyword} `) || lower.endsWith(` ${keyword}`);
    });
    if (isKeyword) return clean;
    return null;
  };

  let isFirstNonEmpty = true;
  return lines.map((line) => {
    const cleanLine = line.replace(/<\/?[^>]+(>|$)/g, "").trim();
    if (!cleanLine) {
      return { type: 'empty', rawText: line };
    }
    
    const sectionHeader = getSectionHeader(cleanLine);
    if (sectionHeader) {
      return { type: 'sectionHeader', text: sectionHeader.toUpperCase(), rawText: line };
    }
    
    if (cleanLine.startsWith('-') || cleanLine.startsWith('•') || cleanLine.startsWith('*')) {
      const bulletText = line.replace(/^(\s*[-•*]\s*)/, '');
      return { type: 'bullet', text: bulletText, rawText: line };
    }
    
    if (isFirstNonEmpty) {
      isFirstNonEmpty = false;
      return { type: 'name', text: cleanLine, rawText: line };
    }
    
    if (cleanLine.includes('@') || cleanLine.includes('|') || cleanLine.includes('+') || cleanLine.includes('linkedin.com') || cleanLine.includes('github.com')) {
      const isMetadata = cleanLine.includes('|') && (cleanLine.includes('20') || cleanLine.includes('Present') || cleanLine.includes('19'));
      if (isMetadata) {
        return { type: 'metadata', text: line, rawText: line };
      }
      return { type: 'contact', text: cleanLine, rawText: line };
    }
    
    const isMetadata = cleanLine.includes('|') && (cleanLine.includes('20') || cleanLine.includes('Present') || cleanLine.includes('19'));
    if (isMetadata) {
      return { type: 'metadata', text: line, rawText: line };
    }

    return { type: 'body', text: line, rawText: line };
  });
};

const renderResumeLine = (parsedLine: any, index: number, mode: string, previewTheme: 'LIGHT' | 'DARK' = 'LIGHT') => {
  const isDark = previewTheme === 'DARK';
  
  const headingColorClass = mode === 'GENERATE_NEW'
    ? (isDark ? 'text-blue-400' : 'text-blue-900')
    : (isDark ? 'text-white' : 'text-slate-900');
    
  const bodyColorClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const metadataColorClass = isDark ? 'text-slate-300' : 'text-slate-700';
  const alignClass = mode === 'GENERATE_NEW' ? 'text-left' : 'text-center';
  const renderText = (t: string) => isDark ? renderDiffText(t) : renderDiffTextLight(t);

  switch (parsedLine.type) {
    case 'empty':
      return <div key={index} className="h-2" />;
    
    case 'name':
      return (
        <h1 
          key={index} 
          className={`font-sans font-bold tracking-tight ${headingColorClass} ${
            mode === 'GENERATE_NEW' ? 'text-xl text-left' : 'text-lg text-center'
          } mb-1`}
        >
          {renderText(parsedLine.rawText)}
        </h1>
      );
      
    case 'contact':
      return (
        <div 
          key={index} 
          className={`text-[9.5px] ${isDark ? 'text-slate-400' : 'text-slate-500'} font-sans tracking-wide leading-normal ${alignClass} mb-2`}
        >
          {renderText(parsedLine.rawText)}
          {mode === 'GENERATE_NEW' && <div className={`border-b ${isDark ? 'border-slate-800' : 'border-slate-200'} w-full mt-1.5`} />}
        </div>
      );
      
    case 'sectionHeader':
      return (
        <div key={index} className="mt-3 mb-1.5">
          <h2 className={`text-[10.5px] font-bold font-sans tracking-wider ${headingColorClass}`}>
            {parsedLine.text}
          </h2>
          <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-300'} mt-0.5`} />
        </div>
      );
      
    case 'metadata':
      if (mode === 'GENERATE_NEW') {
        const parts = parsedLine.rawText.split('|').map((p: string) => p.trim());
        const datePart = parts[parts.length - 1];
        const mainText = parts.slice(0, -1).join('  |  ');
        
        return (
          <div key={index} className="flex justify-between items-baseline text-[9.5px] leading-relaxed mb-0.5 font-sans">
            <span className={`font-bold ${headingColorClass}`}>{renderText(mainText)}</span>
            <span className={`italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{renderText(datePart)}</span>
          </div>
        );
      } else {
        return (
          <div key={index} className={`text-[10px] ${metadataColorClass} font-medium font-sans leading-relaxed mb-0.5`}>
            {renderText(parsedLine.rawText)}
          </div>
        );
      }
      
    case 'bullet':
      return (
        <div key={index} className={`pl-4 relative text-[9.5px] ${bodyColorClass} leading-relaxed mb-0.5 font-sans`}>
          <span className="absolute left-0 text-slate-400 font-bold">•</span>
          <div>{renderText(parsedLine.text)}</div>
        </div>
      );
      
    case 'body':
    default:
      return (
        <p key={index} className={`text-[9.5px] ${bodyColorClass} leading-relaxed mb-0.5 text-justify font-sans`}>
          {renderText(parsedLine.rawText)}
        </p>
      );
  }
};

const getImprovedSections = (optimizedText: string, resumeText: string): string[] => {
  if (!optimizedText) return [];
  const sections = detectSectionsInResume(resumeText);
  if (sections.length === 0) return ['Overview', 'Skills', 'Experience'];
  
  const improved: string[] = [];
  const lines = optimizedText.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const cleanLine = line.replace(/[\[\]\*\:#]/g, '').trim().toLowerCase();
    const matchedSection = sections.find(s => s.toLowerCase() === cleanLine);
    if (matchedSection) {
      currentSection = matchedSection;
    } else if (currentSection) {
      if (line.includes('<ins>') || line.includes('<mark>') || line.includes('<del>')) {
        if (!improved.includes(currentSection)) {
          improved.push(currentSection);
        }
      }
    }
  }
  return improved.length > 0 ? improved : ['Experience', 'Projects', 'Skills'];
};

const filterEmptySections = (parsedLines: any[]) => {
  const result: any[] = [];
  for (let i = 0; i < parsedLines.length; i++) {
    const current = parsedLines[i];
    if (current.type === 'sectionHeader') {
      let hasContent = false;
      for (let j = i + 1; j < parsedLines.length; j++) {
        const next = parsedLines[j];
        if (next.type === 'sectionHeader') {
          break;
        }
        if (next.type !== 'empty') {
          hasContent = true;
          break;
        }
      }
      if (hasContent) {
        result.push(current);
      }
    } else {
      result.push(current);
    }
  }
  return result;
};

export default function ATSPage() {
  const router = useRouter();

  const [jobTitle, setJobTitle] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [experienceLevel, setExperienceLevel] = useState('');
  
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('');
  const [error, setError] = useState('');
  
  const [report, setReport] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  // Twin JD Option States
  const [jdOption, setJdOption] = useState<'predefined' | 'custom'>('predefined');
  const [selectedRole, setSelectedRole] = useState('');
  const [generatedJd, setGeneratedJd] = useState<any>(null);
  const [isGeneratingJd, setIsGeneratingJd] = useState(false);

  // Optimized Resume States
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<any>(null);
  const [optimizationError, setOptimizationError] = useState('');
  const [optimizationMode, setOptimizationMode] = useState<'MODIFY_EXISTING' | 'GENERATE_NEW'>('MODIFY_EXISTING');

  // Form states for Option 2: Generate New Resume
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formLinkedin, setFormLinkedin] = useState('');
  const [formGithub, setFormGithub] = useState('');
  const [formPortfolio, setFormPortfolio] = useState('');
  const [formEducation, setFormEducation] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formProjects, setFormProjects] = useState('');
  const [formSkills, setFormSkills] = useState('');
  const [formCertifications, setFormCertifications] = useState('');
  const [formAchievements, setFormAchievements] = useState('');
  const [formTargetRole, setFormTargetRole] = useState('');
  const [formTargetJd, setFormTargetJd] = useState('');
  const [formResumeStyle, setFormResumeStyle] = useState('Modern Professional');
  const [detectedSections, setDetectedSections] = useState<string[]>([]);

  // Zoom & Preview Height States
  const [zoom, setZoom] = useState(0.85);
  const [previewTab, setPreviewTab] = useState<'original' | 'enhanced'>('original');
  const [pageHeight, setPageHeight] = useState(1130);
  const [previewTheme, setPreviewTheme] = useState<'LIGHT' | 'DARK'>('LIGHT');
  const [showOriginalPreview, setShowOriginalPreview] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Sync previewTab on optimizedResult update
  useEffect(() => {
    if (optimizedResult) {
      setPreviewTab('enhanced');
    } else {
      setPreviewTab('original');
    }
  }, [optimizedResult]);

  // ResizeObserver for A4 preview wrapper
  useEffect(() => {
    if (pageRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setPageHeight(entry.target.scrollHeight);
        }
      });
      resizeObserver.observe(pageRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [optimizedResult, previewTab, report]);

  // Load state from sessionStorage on mount (client-only) and load reports history
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const isFresh = params.get('new') === 'true' || params.get('fresh') === 'true';

        if (isFresh) {
          sessionStorage.removeItem('ats_jdOption');
          sessionStorage.removeItem('ats_selectedRole');
          sessionStorage.removeItem('ats_experienceLevel');
          sessionStorage.removeItem('ats_jobTitle');
          sessionStorage.removeItem('ats_jobDescription');
          sessionStorage.removeItem('ats_generatedJd');
          sessionStorage.removeItem('ats_report');

          setJdOption('predefined');
          setSelectedRole('');
          setExperienceLevel('');
          setJobTitle('');
          setJobDescription('');
          setGeneratedJd(null);
          setReport(null);
          setFile(null);

          // Clean query params so refresh doesn't trigger state wipe again
          window.history.replaceState(null, '', '/ats');
        } else {
          const savedJdOption = sessionStorage.getItem('ats_jdOption');
          if (savedJdOption) setJdOption(savedJdOption as 'predefined' | 'custom');

          const savedSelectedRole = sessionStorage.getItem('ats_selectedRole');
          if (savedSelectedRole) setSelectedRole(savedSelectedRole);

          const savedExperienceLevel = sessionStorage.getItem('ats_experienceLevel');
          if (savedExperienceLevel) setExperienceLevel(savedExperienceLevel);

          const savedJobTitle = sessionStorage.getItem('ats_jobTitle');
          if (savedJobTitle) setJobTitle(savedJobTitle);

          const savedJobDescription = sessionStorage.getItem('ats_jobDescription');
          if (savedJobDescription) setJobDescription(savedJobDescription);

          const savedGeneratedJd = sessionStorage.getItem('ats_generatedJd');
          if (savedGeneratedJd) setGeneratedJd(JSON.parse(savedGeneratedJd));

          const savedReport = sessionStorage.getItem('ats_report');
          if (savedReport) setReport(JSON.parse(savedReport));
        }
      } catch (e) {
        console.error('Failed to parse or restore ATS state on mount:', e);
      }
    }
    loadATSReports();
  }, []);

  // Save state to sessionStorage when any input or report changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('ats_jdOption', jdOption);
      sessionStorage.setItem('ats_selectedRole', selectedRole);
      sessionStorage.setItem('ats_experienceLevel', experienceLevel);
      sessionStorage.setItem('ats_jobTitle', jobTitle);
      sessionStorage.setItem('ats_jobDescription', jobDescription);
      sessionStorage.setItem('ats_generatedJd', generatedJd ? JSON.stringify(generatedJd) : '');
      sessionStorage.setItem('ats_report', report ? JSON.stringify(report) : '');
    }
  }, [jdOption, selectedRole, experienceLevel, jobTitle, jobDescription, generatedJd, report]);

  const parseResumeText = (text: string) => {
    const details = {
      fullName: '',
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      portfolio: '',
      education: '',
      experience: '',
      projects: '',
      skills: '',
      certifications: '',
      achievements: ''
    };

    if (!text) return details;

    // 1. Email extraction
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const emails = text.match(emailRegex);
    if (emails && emails.length > 0) {
      details.email = emails[0];
    }

    // 2. Phone extraction
    const phoneRegex = /(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const phones = text.match(phoneRegex);
    if (phones && phones.length > 0) {
      details.phone = phones[0];
    }

    // 3. Socials extraction
    const lines = text.split('\n').map(l => l.trim());
    
    for (const line of lines) {
      if (line.toLowerCase().includes('linkedin.com')) {
        const match = line.match(/(https?:\/\/[^\s]+linkedin\.com\/[^\s]+)/gi) || line.match(/(linkedin\.com\/[^\s]+)/gi);
        if (match) details.linkedin = match[0];
      }
      if (line.toLowerCase().includes('github.com')) {
        const match = line.match(/(https?:\/\/[^\s]+github\.com\/[^\s]+)/gi) || line.match(/(github\.com\/[^\s]+)/gi);
        if (match) details.github = match[0];
      }
      if (line.toLowerCase().includes('portfolio') || line.toLowerCase().includes('personal website') || line.toLowerCase().includes('website:')) {
        const match = line.match(/(https?:\/\/[^\s]+)/gi);
        if (match) {
          const url = match.find(u => !u.includes('linkedin.com') && !u.includes('github.com'));
          if (url) details.portfolio = url;
        }
      }
    }

    // 4. Try to parse Name (usually on the first few lines)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      if (line && 
          !line.includes('@') && 
          !line.match(/\d{4,}/) && 
          !line.toLowerCase().includes('resume') && 
          !line.toLowerCase().includes('curriculum') && 
          line.split(/\s+/).length >= 2 && 
          line.split(/\s+/).length <= 4) {
        details.fullName = line;
        break;
      }
    }

    // 5. Section extraction by headers
    const sections: { [key: string]: string[] } = {
      education: [],
      experience: [],
      projects: [],
      skills: [],
      certifications: [],
      achievements: []
    };

    let currentSection: keyof typeof sections | null = null;

    const sectionKeywords: { [key in keyof typeof sections]: string[] } = {
      education: ['education', 'academic', 'qualification', 'degree', 'university', 'college'],
      experience: ['experience', 'employment', 'work history', 'professional background', 'work experience', 'career'],
      projects: ['projects', 'personal projects', 'key projects', 'academic projects'],
      skills: ['skills', 'technical skills', 'core competencies', 'expertise', 'technologies'],
      certifications: ['certifications', 'certification', 'licenses', 'courses', 'credentials'],
      achievements: ['achievements', 'awards', 'honors', 'extra-curricular', 'publications']
    };

    for (const line of lines) {
      let headerMatched = false;
      const lowerLine = line.toLowerCase();
      
      if (line.length > 2 && line.length < 40) {
        for (const [sectionKey, keywords] of Object.entries(sectionKeywords)) {
          const cleanHeader = lowerLine.replace(/[\[\]]/g, '').trim();
          if (keywords.some(kw => cleanHeader === kw || cleanHeader.startsWith(kw + ' ') || cleanHeader.endsWith(' ' + kw))) {
            currentSection = sectionKey as keyof typeof sections;
            headerMatched = true;
            break;
          }
        }
      }

      if (headerMatched) continue;

      if (currentSection) {
        sections[currentSection].push(line);
      }
    }

    details.education = sections.education.join('\n').trim();
    details.experience = sections.experience.join('\n').trim();
    details.projects = sections.projects.join('\n').trim();
    details.skills = sections.skills.join('\n').trim();
    details.certifications = sections.certifications.join('\n').trim();
    details.achievements = sections.achievements.join('\n').trim();

    return details;
  };

  // Prepopulate form on report load and detect sections
  useEffect(() => {
    if (report && report.resumeText) {
      const parsed = parseResumeText(report.resumeText);
      const user = api.getUser();
      setFormFullName(parsed.fullName || (user && (user.fullName || user.name)) || '');
      setFormEmail(parsed.email || (user && user.email) || '');
      setFormPhone(parsed.phone || '');
      setFormLinkedin(parsed.linkedin || '');
      setFormGithub(parsed.github || '');
      setFormPortfolio(parsed.portfolio || '');
      setFormEducation(parsed.education || '');
      setFormExperience(parsed.experience || '');
      setFormProjects(parsed.projects || '');
      setFormSkills(parsed.skills || '');
      setFormCertifications(parsed.certifications || '');
      setFormAchievements(parsed.achievements || '');
      setFormTargetRole(report.jobTitle || '');
      setFormTargetJd(report.jobDescription || '');
      
      const sections = detectSectionsInResume(report.resumeText);
      setDetectedSections(sections);
    } else {
      setDetectedSections([]);
    }
  }, [report]);

  // Load cache on report change
  useEffect(() => {
    setOptimizedResult(null);
    setOptimizationError('');
    if (report && report.id) {
      const checkCache = async () => {
        try {
          const data = await atsApi.optimizeResume(report.id, { checkOnly: true });
          if (data && data.optimized) {
            setOptimizedResult(data.optimized);
            if (data.optimized.mode) {
              setOptimizationMode(data.optimized.mode);
            }
          }
        } catch (e) {
          console.log("No cached optimized resume found", e);
        }
      };
      checkCache();
    }
  }, [report]);

  const handleModeChange = async (mode: 'MODIFY_EXISTING' | 'GENERATE_NEW') => {
    setOptimizationMode(mode);
    setOptimizationError('');
    
    if (optimizedResult && optimizedResult.mode === mode) {
      return;
    }

    setIsOptimizing(true);
    try {
      const data = await atsApi.optimizeResume(report.id, { mode, checkOnly: true });
      if (data && data.optimized && data.optimized.mode === mode) {
        setOptimizedResult(data.optimized);
      } else {
        setOptimizedResult(null);
      }
    } catch (e) {
      setOptimizedResult(null);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleOptimizeResume = async () => {
    if (!report) return;
    setIsOptimizing(true);
    setOptimizationError('');
    try {
      const data = await atsApi.optimizeResume(report.id, {
        mode: 'MODIFY_EXISTING'
      });
      setOptimizedResult(data.optimized);
    } catch (err: any) {
      setOptimizationError(err.message || 'Failed to optimize resume.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleGenerateNewResume = async () => {
    if (!report) return;
    setIsOptimizing(true);
    setOptimizationError('');
    
    const applicantDetails = {
      fullName: formFullName,
      email: formEmail,
      phone: formPhone,
      linkedin: formLinkedin,
      github: formGithub,
      portfolio: formPortfolio,
      education: formEducation,
      experience: formExperience,
      projects: formProjects,
      skills: formSkills,
      certifications: formCertifications,
      achievements: formAchievements,
      targetRole: formTargetRole,
      targetJd: formTargetJd,
      resumeStyle: formResumeStyle
    };

    try {
      const data = await atsApi.optimizeResume(report.id, {
        mode: 'GENERATE_NEW',
        applicantDetails
      });
      setOptimizedResult(data.optimized);
    } catch (err: any) {
      setOptimizationError(err.message || 'Failed to generate optimized resume.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleDownloadOptimized = async (format: 'pdf' | 'docx') => {
    if (!report) return;
    try {
      const token = localStorage.getItem('token');
      const downloadUrl = atsApi.downloadOptimizedResumeUrl(report.id, format);
      const response = await fetch(downloadUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Failed to download ${format.toUpperCase()}.`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      const fileExt = format === 'docx' ? 'docx' : 'pdf';
      const modeSuffix = optimizationMode === 'GENERATE_NEW' ? 'new' : 'modified';
      a.download = `optimized_resume_${modeSuffix}_${report.jobTitle.replace(/\s+/g, '_')}.${fileExt}`;
      
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || `Failed to download ${format.toUpperCase()}.`);
    }
  };

  const loadATSReports = async () => {
    try {
      const data = await atsApi.getHistory();
      const reports = data.reports || [];
      setHistory(reports);

      // Verify if currently restored report still exists in the fetched list
      setReport((prevReport: any) => {
        if (prevReport) {
          const exists = reports.some((h: any) => h.id === prevReport.id);
          if (!exists) {
            if (typeof window !== 'undefined') {
              sessionStorage.removeItem('ats_report');
              sessionStorage.removeItem('ats_jdOption');
              sessionStorage.removeItem('ats_selectedRole');
              sessionStorage.removeItem('ats_experienceLevel');
              sessionStorage.removeItem('ats_jobTitle');
              sessionStorage.removeItem('ats_jobDescription');
              sessionStorage.removeItem('ats_generatedJd');
            }
            setTimeout(() => {
              setJdOption('predefined');
              setSelectedRole('');
              setExperienceLevel('');
              setJobTitle('');
              setJobDescription('');
              setGeneratedJd(null);
              setFile(null);
            }, 0);
            return null;
          }
        }
        return prevReport;
      });

      // Check query param inside loadATSReports after history is loaded
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const reportId = params.get('reportId') || params.get('id');
        if (reportId) {
          const matched = reports.find((h: any) => h.id === reportId);
          if (matched) {
            setReport(matched);
          } else {
            setReport(null);
            sessionStorage.removeItem('ats_report');
            sessionStorage.removeItem('ats_jdOption');
            sessionStorage.removeItem('ats_selectedRole');
            sessionStorage.removeItem('ats_experienceLevel');
            sessionStorage.removeItem('ats_jobTitle');
            sessionStorage.removeItem('ats_jobDescription');
            sessionStorage.removeItem('ats_generatedJd');
            setJdOption('predefined');
            setSelectedRole('');
            setExperienceLevel('');
            setJobTitle('');
            setJobDescription('');
            setGeneratedJd(null);
            setFile(null);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load ATS history:', e);
    }
  };

  const handleRoleChange = async (role: string) => {
    setSelectedRole(role);
    if (!role) {
      setGeneratedJd(null);
      setJobTitle('');
      setJobDescription('');
      return;
    }

    setIsGeneratingJd(true);
    setError('');
    try {
      const response = await api.post('/job-roles/generate-jd', { role });
      const jdData = response.jobDescription;
      setGeneratedJd(jdData);
      setJobTitle(role);
      
      const formattedDescription = `
Experience Level: ${jdData.experienceLevel || 'Not specified'}

Key Responsibilities:
${(jdData.responsibilities || []).map((r: string) => `- ${r}`).join('\n')}

Required Skills:
${(jdData.requiredSkills || []).map((s: string) => `- ${s}`).join('\n')}

Preferred Skills:
${(jdData.preferredSkills || []).map((s: string) => `- ${s}`).join('\n')}

Tools:
${(jdData.tools || []).map((t: string) => `- ${t}`).join('\n')}

Frameworks:
${(jdData.frameworks || []).map((f: string) => `- ${f}`).join('\n')}
      `.trim();
      setJobDescription(formattedDescription);
    } catch (err: any) {
      setError(err.message || 'Failed to generate job description.');
      setGeneratedJd(null);
    } finally {
      setIsGeneratingJd(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword'
      ];
      
      if (!validTypes.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a PDF or DOCX file.');
        setFile(null);
        return;
      }
      
      setError('');
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !jobTitle || !jobDescription || !experienceLevel) {
      setError('Please fill in all fields, select an experience level, and upload your resume.');
      return;
    }

    setError('');
    setIsScanning(true);
    setScanProgress(10);
    setScanStatusText('Extracting resume content...');

    // Simulate scanning ticks
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        if (prev === 30) setScanStatusText('Comparing skills with Job Description...');
        if (prev === 60) setScanStatusText('Analyzing structure and keywords...');
        if (prev === 80) setScanStatusText('Evaluating overall score...');
        return prev + 10;
      });
    }, 800);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('jobTitle', jobTitle);
      formData.append('jobDescription', jobDescription);
      formData.append('experienceLevel', experienceLevel);

      const data = await atsApi.analyzeResume(formData);
      
      clearInterval(interval);
      setScanProgress(100);
      setScanStatusText('Success!');
      
      setTimeout(() => {
        setReport(data.report);
        setIsScanning(false);
        loadATSReports();
      }, 500);

    } catch (err: any) {
      clearInterval(interval);
      setIsScanning(false);
      setError(err.message || 'Failed to analyze resume. Please verify your connection.');
    }
  };

  const parseJsonList = (str: string): string[] => {
    try {
      return JSON.parse(str);
    } catch {
      return [];
    }
  };

  const parseJsonObj = (str: string): any => {
    try {
      return JSON.parse(str);
    } catch {
      return {};
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <Sparkles className="text-purple-500" size={24} />
              <span>ATS Resume Gap & Keyword Analyzer</span>
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">Compare your resume against any target role to identify gaps, keywords, and structural improvements.</p>
          </div>
          {report && (
            <button
              onClick={() => {
                setReport(null);
                setFile(null);
                setError('');
                if (typeof window !== 'undefined') {
                  window.history.replaceState(null, '', '/ats');
                }
              }}
              className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-350 hover:text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Analyze Another Resume</span>
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-450 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* SCANNING PROGRESS ANIMATION LAYOUT */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center py-16"
            >
              <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6" />
              <h3 className="text-lg font-bold text-white mb-2">Analyzing Resume ATS...</h3>
              <p className="text-slate-400 text-xs max-w-sm mb-6">{scanStatusText}</p>
              
              <div className="w-64 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${scanProgress}%` }}
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
                />
              </div>
              <span className="text-[10px] text-purple-400 font-bold mt-2">{scanProgress}%</span>
            </motion.div>
          )}
        </AnimatePresence>

        {!isScanning && (
          <>
            {!report ? (
              /* INPUT AND UPLOADER VIEW (col-span-3) */
              <div className="grid lg:grid-cols-3 gap-8">
                
                {/* UPLOADER & CONFIGS (Left side or grid column) */}
                <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-6 rounded-2xl h-fit space-y-6">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Analyze New Resume</h3>
                  
                  {/* Option Tabs */}
                  <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setJdOption('predefined');
                        setGeneratedJd(null);
                        setSelectedRole('');
                        setJobTitle('');
                        setJobDescription('');
                      }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                        jdOption === 'predefined'
                          ? 'bg-purple-650 text-white'
                          : 'text-slate-455 hover:text-slate-200'
                      }`}
                    >
                      Predefined Role
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setJdOption('custom');
                        setGeneratedJd(null);
                        setSelectedRole('');
                        setJobTitle('');
                        setJobDescription('');
                      }}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                        jdOption === 'custom'
                          ? 'bg-purple-650 text-white'
                          : 'text-slate-455 hover:text-slate-200'
                      }`}
                    >
                      Custom JD
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {jdOption === 'predefined' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Role</label>
                            <select
                              required
                              value={selectedRole}
                              onChange={(e) => handleRoleChange(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-955 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm transition"
                            >
                              <option value="">-- Choose a Role --</option>
                              {PREDEFINED_ROLES.map((role) => (
                                <option key={role} value={role}>{role}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                            <select
                              required
                              value={experienceLevel}
                              onChange={(e) => setExperienceLevel(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-955 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm transition"
                            >
                              <option value="">-- Choose Experience Level --</option>
                              <option value="Fresher">Fresher</option>
                              <option value="0-1 Years">0-1 Years</option>
                              <option value="1-3 Years">1-3 Years</option>
                              <option value="3-5 Years">3-5 Years</option>
                              <option value="5+ Years">5+ Years</option>
                              <option value="Senior">Senior</option>
                            </select>
                          </div>
                        </div>

                        {isGeneratingJd && (
                          <div className="flex items-center justify-center py-6 gap-2">
                            <RefreshCw className="animate-spin text-purple-500" size={16} />
                            <span className="text-xs text-slate-450">Fetching job profile...</span>
                          </div>
                        )}

                        {!isGeneratingJd && generatedJd && (
                          <div className="p-4 bg-slate-955 rounded-xl border border-slate-800 space-y-3 mt-4 text-xs">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Skills</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {generatedJd.requiredSkills.map((s: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-[9px] font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {generatedJd.frameworks && generatedJd.frameworks.length > 0 && (
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Frameworks & Tools</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {generatedJd.frameworks.concat(generatedJd.tools || []).slice(0, 8).map((f: string, i: number) => (
                                    <span key={i} className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[9px] font-medium">
                                      {f}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Title</label>
                            <input
                              type="text"
                              required
                              value={jobTitle}
                              onChange={(e) => setJobTitle(e.target.value)}
                              placeholder="e.g. Software Engineer Intern"
                              className="w-full px-4 py-2 bg-slate-955 border border-slate-800 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 text-sm transition"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Experience Level</label>
                            <select
                              required
                              value={experienceLevel}
                              onChange={(e) => setExperienceLevel(e.target.value)}
                              className="w-full px-4 py-2 bg-slate-955 border border-slate-800 rounded-lg text-white focus:outline-none focus:border-purple-500 text-sm transition"
                            >
                              <option value="">-- Choose Experience Level --</option>
                              <option value="Fresher">Fresher</option>
                              <option value="0-1 Years">0-1 Years</option>
                              <option value="1-3 Years">1-3 Years</option>
                              <option value="3-5 Years">3-5 Years</option>
                              <option value="5+ Years">5+ Years</option>
                              <option value="Senior">Senior</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Job Description</label>
                          <textarea
                            required
                            value={jobDescription}
                            onChange={(e) => setJobDescription(e.target.value)}
                            placeholder="Paste the full job requirements and specifications here..."
                            rows={5}
                            className="w-full px-4 py-2 bg-slate-955 border border-slate-800 rounded-lg text-white placeholder-slate-700 focus:outline-none focus:border-purple-500 text-sm transition resize-none"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Upload Resume (PDF/DOCX)</label>
                      <div className="relative border border-dashed border-slate-800 hover:border-purple-500/50 rounded-lg bg-slate-955 p-6 text-center cursor-pointer transition">
                        <input
                          type="file"
                          required
                          onChange={handleFileChange}
                          accept=".pdf,.docx,.doc"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center justify-center">
                          <FileUp size={24} className="text-slate-500 mb-2" />
                          {file ? (
                            <div>
                              <p className="text-xs font-bold text-purple-400 truncate max-w-[200px]">{file.name}</p>
                              <p className="text-[10px] text-slate-550">{(file.size / 1024).toFixed(0)} KB</p>
                            </div>
                          ) : (
                            <>
                              <p className="text-xs font-semibold text-slate-400">Drag or browse resume</p>
                              <p className="text-[9px] text-slate-650 mt-1">Accepts PDF or DOCX up to 10MB</p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isScanning || isGeneratingJd}
                      className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg font-bold text-xs transition duration-300 shadow-md flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles size={16} />
                      <span>Scan & Evaluate</span>
                    </button>
                  </form>
                </div>

                {/* HELP CARD AND INFO / HISTORY TABLE (Right side) */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">How It Works</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mt-4">
                      <div className="p-4 bg-slate-955 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] bg-purple-500/10 text-purple-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">1. Scan</span>
                        <h4 className="font-bold text-white mt-1">Upload & Analyze</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px]">Upload your resume and enter the target role. Our system parses the content and checks for ATS keyword matches.</p>
                      </div>
                      <div className="p-4 bg-slate-955 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] bg-teal-500/10 text-teal-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">2. Review</span>
                        <h4 className="font-bold text-white mt-1">ATS Gaps Report</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px]">Check keywords added, missing terms, score indicators, and custom recommendations tailored for your role.</p>
                      </div>
                      <div className="p-4 bg-slate-955 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">3. Align</span>
                        <h4 className="font-bold text-white mt-1">Review Gaps</h4>
                        <p className="text-slate-400 leading-relaxed text-[11px]">Address the highlighted skill gaps and missing keywords in your resume to maximize your match score.</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* PARSED RESUMES HISTORY */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Parsed Resumes History</h3>
                    {history.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {history.slice(0, 6).map((h) => (
                          <div
                            key={h.id}
                            onClick={() => {
                              setReport(h);
                              if (typeof window !== 'undefined') {
                                window.history.pushState(null, '', `/ats?reportId=${h.id}`);
                              }
                            }}
                            className="p-4 border border-slate-800 bg-slate-955 hover:border-purple-500/30 rounded-xl flex justify-between items-center cursor-pointer transition"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 shrink-0">
                                <FileText size={18} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-white truncate">{h.jobTitle}</h4>
                                <p className="text-[9px] text-slate-500 mt-0.5">{new Date(h.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="shrink-0 ml-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded-full text-purple-400 bg-purple-500/10">
                                {h.overallScore}/100
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-550 text-xs">
                        No analyzed reports found. Fill out the scan form to check your ATS metrics.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* REPORT RESULTS SPLIT SCREEN VIEW (col-span-12) */
              <div className="space-y-4">
                {/* BACK BUTTON */}
                <div className="flex justify-start">
                  <button
                    onClick={() => {
                      setReport(null);
                      setFile(null);
                      setError('');
                      if (typeof window !== 'undefined') {
                        window.history.replaceState(null, '', '/ats');
                      }
                    }}
                    className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all text-xs font-bold select-none cursor-pointer"
                  >
                    <ArrowLeft size={16} className="text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to ATS Scanner & History</span>
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-8 items-start">
                
                {/* LEFT PANEL: ATS Metrics & Controls Dashboard (col-span-5) */}
                <div className="col-span-12 lg:col-span-5 space-y-6">
                  
                  {/* ATS Score and Metrics Overview Card */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp size={16} className="text-purple-400" />
                      <span>ATS Resume Score</span>
                    </h3>

                    {/* Progress Dashboard linear layout */}
                    <div className="space-y-4">
                      <div className="border-b border-slate-850 pb-4 text-center">
                        <div className="bg-slate-955 py-4 px-6 rounded-2xl border border-slate-850 max-w-xs mx-auto">
                          <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-1">Overall ATS Score</span>
                          <div className="flex justify-center items-baseline gap-1">
                            <span className="text-3xl font-black text-purple-400 font-mono">{report.overallScore}</span>
                            <span className="text-slate-500 text-xs font-semibold">/ 100</span>
                          </div>
                        </div>
                      </div>

                      {/* Category Scores breakdown */}
                      <div className="space-y-2.5">
                        <h4 className="text-[10px] uppercase font-bold text-slate-450 tracking-wider font-mono">Scoring Breakdown</h4>
                        {Object.entries(parseJsonObj(report.categoryScores)).map(([key, val]: [string, any]) => (
                          <div key={key} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-400 capitalize">
                              <span>{key}</span>
                              <span>{val}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-955 rounded-full overflow-hidden border border-slate-850">
                              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500" style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* REDIRECT TO SKILL GAP BUTTON */}
                    <div className="border-t border-slate-850 pt-4">
                      <button
                        onClick={() => router.push(`/skill-gap?reportId=${report.id}`)}
                        className="w-full py-2 bg-purple-650/10 hover:bg-purple-650/20 border border-purple-500/25 text-purple-450 rounded-xl font-bold text-xs transition duration-300 flex justify-center items-center gap-1.5 cursor-pointer"
                      >
                        <span>Detailed Skill Gap Analysis</span>
                        <ArrowRight size={12} />
                      </button>
                    </div>

                  </div>

                  {/* Keywords checklists (Added vs Missing) */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Target Keywords Checklist</h3>
                      
                      {/* Added Keywords List */}
                      {optimizedResult && parseJsonList(optimizedResult.addedKeywords).length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Keywords Added</span>
                          <div className="flex flex-wrap gap-1.5">
                            {parseJsonList(optimizedResult.addedKeywords).map((kw, i) => (
                              <span key={i} className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                                <Check size={11} className="text-emerald-400 shrink-0" />
                                <span>{kw}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Missing Keywords List */}
                      <div className="space-y-2">
                        <span className="text-[9px] font-bold text-rose-400 uppercase tracking-wider block">Missing Keywords</span>
                        <div className="flex flex-wrap gap-1.5">
                          {parseJsonList(report.missingKeywords).map((kw, i) => (
                            <span key={i} className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[10px] font-semibold flex items-center gap-1">
                              <X size={11} className="text-rose-400 shrink-0" />
                              <span>{kw}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                  </div>
                </div>

                {/* RIGHT PANEL: Strengths, Weaknesses, and Recommendations (col-span-7) */}
                <div className="col-span-12 lg:col-span-7 space-y-6">
                  
                  {/* Strengths Card */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                      <span className="p-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                        <Check size={16} />
                      </span>
                      <span>Resume Strengths</span>
                    </h3>
                    <div className="space-y-3">
                      {parseJsonList(report.strengths).length > 0 ? (
                        parseJsonList(report.strengths).map((str, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-slate-300 text-xs leading-relaxed">
                            <span className="text-emerald-400 font-extrabold mt-0.5">•</span>
                            <span>{str}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No significant strengths highlighted for this role.</p>
                      )}
                    </div>
                  </div>

                  {/* Weaknesses Card */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                      <span className="p-1 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg">
                        <X size={16} />
                      </span>
                      <span>Areas for Improvement & Weaknesses</span>
                    </h3>
                    <div className="space-y-3">
                      {parseJsonList(report.weaknesses).length > 0 ? (
                        parseJsonList(report.weaknesses).map((wk, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-slate-300 text-xs leading-relaxed">
                            <span className="text-rose-400 font-extrabold mt-0.5">•</span>
                            <span>{wk}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No critical weaknesses identified for this role.</p>
                      )}
                    </div>
                  </div>

                  {/* Recommendations Card */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-lg">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-850 pb-3">
                      <span className="p-1 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-lg">
                        <Lightbulb size={16} />
                      </span>
                      <span>Strategic Recommendations</span>
                    </h3>
                    <div className="space-y-3">
                      {parseJsonList(report.recommendations).length > 0 ? (
                        parseJsonList(report.recommendations).map((rec, idx) => (
                          <div key={idx} className="flex items-start gap-3 text-slate-300 text-xs leading-relaxed">
                            <span className="text-purple-400 font-bold mt-0.5">•</span>
                            <span>{rec}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No recommendations generated.</p>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </div>

              </div>
            )}
          </>
        )}

      </div>
    </LayoutShell>
  );
}
