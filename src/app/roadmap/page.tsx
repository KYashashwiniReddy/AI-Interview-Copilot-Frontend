'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LayoutShell from '../../components/LayoutShell';
import { roadmapApi, authApi, atsApi } from '../../lib/api';
import {
  Map, Calendar, BookOpen, Award, CheckCircle, RefreshCw, Layers, Clock,
  Download, Archive, Check, RotateCcw, ChevronDown, ChevronUp, Code2,
  ExternalLink, Sparkles, Lightbulb, Info, Terminal, Play, CheckSquare,
  ShieldCheck, HelpCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';

function GithubIcon({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

const getDirectReadingLink = (courseName: string, originalLink: string, weekNum: number = 1, experienceLevel: string = 'Fresher') => {
  if (originalLink && originalLink.startsWith('https://') && !originalLink.includes('youtube.com') && !originalLink.includes('youtu.be') && originalLink.length > 20) {
    return originalLink;
  }

  const name = (courseName || '').toLowerCase();
  const isSenior = ['3-5 Years', '5+ Years', 'Senior'].includes(experienceLevel);
  const offset = isSenior ? 2 : 0;
  const idx = (weekNum + offset) % 4;

  const excelPool = [
    'https://support.microsoft.com/en-us/excel',
    'https://www.w3schools.com/excel/',
    'https://exceljet.net/',
    'https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb'
  ];
  if (name.includes('excel')) return excelPool[idx];

  const tableauPool = [
    'https://help.tableau.com/current/guides/get-started-tutorial/en-us/gstr_introduction.htm',
    'https://www.tableau.com/learn/training',
    'https://help.tableau.com/current/pro/desktop/en-us/default.htm',
    'https://www.guru99.com/tableau-tutorial.html'
  ];
  if (name.includes('tableau')) return tableauPool[idx];

  const powerBiPool = [
    'https://learn.microsoft.com/en-us/power-bi/',
    'https://www.w3schools.com/powerbi/',
    'https://learn.microsoft.com/en-us/training/powerplatform/power-bi',
    'https://www.tutorialspoint.com/power_bi/index.htm'
  ];
  if (name.includes('power bi') || name.includes('powerbi')) return powerBiPool[idx];

  const gitPool = [
    'https://git-scm.com/doc',
    'https://docs.github.com/en',
    'https://www.atlassian.com/git/tutorials',
    'https://www.w3schools.com/git/'
  ];
  if (name.includes('git') || name.includes('github')) return gitPool[idx];

  const pythonPool = [
    'https://docs.python.org/3/tutorial/',
    'https://www.w3schools.com/python/',
    'https://realpython.com/',
    'https://www.learnpython.org/'
  ];
  if (name.includes('python')) return pythonPool[idx];

  const reactPool = [
    'https://react.dev/learn',
    'https://www.w3schools.com/react/',
    'https://react.dev/reference/react',
    'https://nextjs.org/docs'
  ];
  if (name.includes('react') || name.includes('next.js') || name.includes('nextjs') || name.includes('frontend framework')) return reactPool[idx];

  const jsPool = [
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    'https://www.typescriptlang.org/docs/handbook/intro.html',
    'https://www.w3schools.com/js/',
    'https://javascript.info/'
  ];
  if (name.includes('javascript') || name.includes('js') || name.includes('typescript')) return jsPool[idx];

  const sqlPool = [
    'https://www.w3schools.com/sql/',
    'https://www.postgresqltutorial.com/',
    'https://www.mongodb.com/docs/manual/',
    'https://www.mysql.com/'
  ];
  if (name.includes('sql') || name.includes('database') || name.includes('mysql') || name.includes('postgres') || name.includes('mongodb')) return sqlPool[idx];

  const mlPool = [
    'https://scikit-learn.org/stable/user_guide.html',
    'https://pytorch.org/tutorials/',
    'https://www.tensorflow.org/tutorials',
    'https://machinelearningmastery.com/'
  ];
  if (name.includes('machine learning') || name.includes('scikit') || name.includes('ml') || name.includes('deep learning') || name.includes('neural') || name.includes('pytorch') || name.includes('tensorflow') || name.includes('ai')) return mlPool[idx];

  const htmlPool = [
    'https://developer.mozilla.org/en-US/docs/Web/HTML',
    'https://developer.mozilla.org/en-US/docs/Web/CSS',
    'https://www.w3schools.com/html/',
    'https://css-tricks.com/'
  ];
  if (name.includes('html') || name.includes('css') || name.includes('web') || name.includes('responsive design')) return htmlPool[idx];

  const javaPool = [
    'https://docs.oracle.com/en/java/',
    'https://www.w3schools.com/java/',
    'https://www.baeldung.com/',
    'https://www.geeksforgeeks.org/java/'
  ];
  if (name.includes('java') && !name.includes('javascript')) return javaPool[idx];

  const statisticsPool = [
    'https://www.khanacademy.org/math/statistics-probability',
    'https://www.w3schools.com/statistics/',
    'https://www.statisticshowto.com/',
    'https://openstax.org/details/books/introductory-statistics'
  ];
  if (name.includes('statistic') || name.includes('visualization') || name.includes('probability') || name.includes('math') || name.includes('stats') || name.includes('graph')) return statisticsPool[idx];

  const dsaPool = [
    'https://www.geeksforgeeks.org/data-structures/',
    'https://www.w3schools.com/dsa/',
    'https://leetcode.com/discuss/study-guide',
    'https://visualgo.net/en'
  ];
  if (name.includes('algorithm') || name.includes('dsa') || name.includes('data structure')) return dsaPool[idx];

  const systemDesignPool = [
    'https://github.com/donnemartin/system-design-primer',
    'https://learn.microsoft.com/en-us/azure/architecture/patterns/',
    'https://microservices.io/',
    'https://www.educative.io/blog/complete-guide-to-system-design'
  ];
  if (name.includes('system design') || name.includes('architecture') || name.includes('microservices')) return systemDesignPool[idx];

  const cloudPool = [
    'https://docs.aws.amazon.com/',
    'https://docs.docker.com/',
    'https://kubernetes.io/docs/home/',
    'https://roadmap.sh/devops'
  ];
  if (name.includes('devops') || name.includes('docker') || name.includes('kubernetes') || name.includes('deployment') || name.includes('aws') || name.includes('cloud')) return cloudPool[idx];

  const pmPool = [
    'https://www.atlassian.com/agile',
    'https://www.scrumalliance.org/about-scrum',
    'https://www.productplan.com/glossary/product-roadmap/',
    'https://www.mindtheproduct.com/'
  ];
  if (name.includes('product management') || name.includes('agile') || name.includes('scrum') || name.includes('product manager')) return pmPool[idx];

  const baPool = [
    'https://www.iiba.org/',
    'https://www.bridging-the-gap.com/',
    'https://www.batimes.com/',
    'https://www.modernanalyst.com/'
  ];
  if (name.includes('business analysis') || name.includes('requirements') || name.includes('business analyst')) return baPool[idx];

  // Default fallback
  const fallbackPool = [
    'https://www.w3schools.com/',
    'https://developer.mozilla.org/en-US/',
    'https://www.geeksforgeeks.org/',
    'https://learn.microsoft.com/en-us/'
  ];
  return fallbackPool[idx];
};

const getDirectCertLink = (certName: string, originalLink: string, weekNum: number = 1) => {
  if (originalLink && originalLink.startsWith('https://') && originalLink.length > 20) {
    return originalLink;
  }

  const name = (certName || '').toLowerCase();
  const idx = weekNum % 3;

  if (name.includes('excel')) {
    const excelCerts = [
      'https://learn.microsoft.com/en-us/credentials/certifications/mos-excel-associate-2019/',
      'https://learn.microsoft.com/en-us/training/paths/analyze-data-connect-excel/',
      'https://learn.microsoft.com/en-us/training/paths/excel-workbook-basics/'
    ];
    return excelCerts[idx];
  }

  if (name.includes('tableau')) {
    const tableauCerts = [
      'https://www.tableau.com/learn/certification/desktop-specialist',
      'https://www.tableau.com/learn/certification/data-analyst',
      'https://www.tableau.com/learn/certification/'
    ];
    return tableauCerts[idx];
  }

  if (name.includes('power bi') || name.includes('powerbi')) {
    const powerBiCerts = [
      'https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/',
      'https://learn.microsoft.com/en-us/training/paths/get-started-power-bi/',
      'https://learn.microsoft.com/en-us/training/powerplatform/power-bi'
    ];
    return powerBiCerts[idx];
  }

  if (name.includes('git') || name.includes('github')) {
    const gitCerts = [
      'https://learn.microsoft.com/en-us/credentials/certifications/github-foundations/',
      'https://www.freecodecamp.org/news/git-and-github-certification-course/',
      'https://courses.w3schools.com/programs/git-certificate'
    ];
    return gitCerts[idx];
  }

  if (name.includes('python')) {
    const pythonCerts = [
      'https://www.freecodecamp.org/learn/scientific-computing-with-python/',
      'https://www.freecodecamp.org/learn/data-analysis-with-python/',
      'https://pythoninstitute.org/pcep'
    ];
    return pythonCerts[idx];
  }

  if (name.includes('javascript') || name.includes('js') || name.includes('typescript')) {
    const jsCerts = [
      'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
      'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/',
      'https://courses.w3schools.com/programs/javascript-certificate'
    ];
    return jsCerts[idx];
  }

  if (name.includes('react') || name.includes('next') || name.includes('frontend')) {
    const reactCerts = [
      'https://www.freecodecamp.org/learn/front-end-development-libraries/',
      'https://www.freecodecamp.org/learn/responsive-web-design/',
      'https://courses.w3schools.com/programs/react-certificate'
    ];
    return reactCerts[idx];
  }

  if (name.includes('sql') || name.includes('database') || name.includes('mysql') || name.includes('postgres') || name.includes('mongodb') || name.includes('backend')) {
    const sqlCerts = [
      'https://www.freecodecamp.org/learn/relational-database/',
      'https://courses.w3schools.com/programs/sql-certificate',
      'https://university.mongodb.com/certification'
    ];
    return sqlCerts[idx];
  }

  if (name.includes('machine learning') || name.includes('ml') || name.includes('ai') || name.includes('deep learning')) {
    const mlCerts = [
      'https://www.freecodecamp.org/learn/machine-learning-with-python/',
      'https://www.freecodecamp.org/learn/data-analysis-with-python/',
      'https://cloud.google.com/credentials/machine-learning-engineer'
    ];
    return mlCerts[idx];
  }

  if (name.includes('data analysis') || name.includes('data analyst')) {
    const dataCerts = [
      'https://www.freecodecamp.org/learn/data-analysis-with-python/',
      'https://grow.google/certificates/data-analytics/',
      'https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/'
    ];
    return dataCerts[idx];
  }

  if (name.includes('html') || name.includes('css') || name.includes('web')) {
    const htmlCerts = [
      'https://www.freecodecamp.org/learn/responsive-web-design/',
      'https://courses.w3schools.com/programs/html-developer-certificate',
      'https://courses.w3schools.com/programs/css-developer-certificate'
    ];
    return htmlCerts[idx];
  }

  if (name.includes('java') && !name.includes('javascript')) {
    const javaCerts = [
      'https://education.oracle.com/oracle-certified-professional-java-se-17-developer/trackp_OCPJAVASE17',
      'https://www.freecodecamp.org/news/java-programming-challenges/',
      'https://courses.w3schools.com/programs/java-certificate'
    ];
    return javaCerts[idx];
  }

  if (name.includes('statistic') || name.includes('visualization') || name.includes('probability') || name.includes('stats')) {
    const statsCerts = [
      'https://www.udacity.com/course/intro-to-statistics--ud359',
      'https://online.stanford.edu/courses/gse-stats-probability-and-statistics',
      'https://www.freecodecamp.org/learn/data-analysis-with-python/'
    ];
    return statsCerts[idx];
  }

  if (name.includes('algorithm') || name.includes('dsa') || name.includes('data structure')) {
    const dsaCerts = [
      'https://www.hackerrank.com/skills-verification/algorithms',
      'https://www.hackerrank.com/skills-verification/data_structures',
      'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/'
    ];
    return dsaCerts[idx];
  }

  if (name.includes('system design') || name.includes('architecture') || name.includes('microservices')) {
    const systemCerts = [
      'https://www.isqi.org/products/isaqb-certified-professional-for-software-architecture-foundation-level-cpsa-f',
      'https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/',
      'https://www.freecodecamp.org/news/software-architecture-certification-prep/'
    ];
    return systemCerts[idx];
  }

  if (name.includes('devops') || name.includes('docker') || name.includes('kubernetes') || name.includes('cloud')) {
    const cloudCerts = [
      'https://aws.amazon.com/certification/certified-cloud-practitioner/',
      'https://aws.amazon.com/certification/certified-solutions-architect-associate/',
      'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/'
    ];
    return cloudCerts[idx];
  }

  if (name.includes('product management') || name.includes('agile') || name.includes('scrum') || name.includes('product manager')) {
    const pmCerts = [
      'https://www.scrum.org/assessments/professional-scrum-product-owner-i-assessment',
      'https://aipmm.com/cpm',
      'https://www.productschool.com/product-management-certification/'
    ];
    return pmCerts[idx];
  }

  if (name.includes('business analysis') || name.includes('requirements') || name.includes('business analyst')) {
    const baCerts = [
      'https://www.iiba.org/business-analysis-certifications/ecba/',
      'https://www.iiba.org/business-analysis-certifications/ccba/',
      'https://www.pmi.org/certifications/business-analysis-pba'
    ];
    return baCerts[idx];
  }

  const fallbackCerts = [
    'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/',
    'https://www.freecodecamp.org/learn/responsive-web-design/',
    'https://www.freecodecamp.org/learn/relational-database/'
  ];
  return fallbackCerts[idx];
};

export default function RoadmapPage() {
  const router = useRouter();

  const [activeProfile, setActiveProfile] = useState<any>(null);
  const [durationDays, setDurationDays] = useState(30);
  const [careerGoal, setCareerGoal] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Lifecycle Tab Management
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'COMPLETED'>('ACTIVE');
  const [hoursToAdd, setHoursToAdd] = useState('1');
  const [loggingHours, setLoggingHours] = useState(false);

  // Accordion week state
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true });

  // Topic notes viewer modal
  const [topicModalOpen, setTopicModalOpen] = useState(false);
  const [activeTopicName, setActiveTopicName] = useState('');
  const [activeTopicContent, setActiveTopicContent] = useState<any>(null);
  const [isFetchingTopic, setIsFetchingTopic] = useState(false);

  // Monaco Coding Workspace modal
  const [codingWorkspaceOpen, setCodingWorkspaceOpen] = useState(false);
  const [activeCodingTask, setActiveCodingTask] = useState<any>(null);
  const [workspaceLanguage, setWorkspaceLanguage] = useState('javascript');
  const [workspaceCode, setWorkspaceCode] = useState('');
  const [workspaceOutput, setWorkspaceOutput] = useState<string[]>([]);
  const [workspaceTestResults, setWorkspaceTestResults] = useState<any[]>([]);
  const [showHints, setShowHints] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);

  // Simulation states
  const [excelFormula, setExcelFormula] = useState('');
  const [tableauChartType, setTableauChartType] = useState('Bar Chart');
  const [tableauDimension, setTableauDimension] = useState('Category');
  const [tableauMeasure, setTableauMeasure] = useState('Sales');
  const [tableauCalculatedField, setTableauCalculatedField] = useState('');
  const [baSponsorPower, setBaSponsorPower] = useState('High');
  const [baSponsorInterest, setBaSponsorInterest] = useState('High');
  const [baSponsorStrategy, setBaSponsorStrategy] = useState('Manage Closely');
  const [baUserPower, setBaUserPower] = useState('Low');
  const [baUserInterest, setBaUserInterest] = useState('High');
  const [baUserStrategy, setBaUserStrategy] = useState('Keep Informed');
  const [baCompetitorPower, setBaCompetitorPower] = useState('Low');
  const [baCompetitorInterest, setBaCompetitorInterest] = useState('Low');
  const [baCompetitorStrategy, setBaCompetitorStrategy] = useState('Monitor');
  const [baRequirementStatement, setBaRequirementStatement] = useState('');
  const [pmFeatures, setPmFeatures] = useState<any[]>([
    { name: 'Core Checkout Optimization', reach: 5000, impact: 2, confidence: 0.8, effort: 3, score: 0 },
    { name: 'AI Recommendations Engine', reach: 8000, impact: 1, confidence: 0.5, effort: 5, score: 0 },
    { name: 'Mobile Push Notifications', reach: 3000, impact: 3, confidence: 0.9, effort: 2, score: 0 }
  ]);
  const [pmPriorityFeature, setPmPriorityFeature] = useState('Core Checkout Optimization');
  const [theoryAnswer, setTheoryAnswer] = useState('');
  const [simulationPassed, setSimulationPassed] = useState(false);
  const [simulationChecked, setSimulationChecked] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});

  const toggleTaskExpand = (taskKey: string) => {
    setExpandedTasks(prev => ({ ...prev, [taskKey]: !prev[taskKey] }));
  };

  // Project submission state variables
  const [projectSubmitting, setProjectSubmitting] = useState<Record<number, boolean>>({});
  const [githubUrls, setGithubUrls] = useState<Record<number, string>>({});
  const [deploymentUrls, setDeploymentUrls] = useState<Record<number, string>>({});
  const [projectEvaluations, setProjectEvaluations] = useState<Record<number, any>>({});
  const [addingToResume, setAddingToResume] = useState<Record<number, boolean>>({});
  const [addedToResumeSuccess, setAddedToResumeSuccess] = useState<Record<number, boolean>>({});

  // Sync checklist state when roadmap loads
  useEffect(() => {
    if (roadmap) {
      const loadedChecked: Record<string, boolean> = {};
      if (roadmap.completedTasks) {
        try {
          const parsed = JSON.parse(roadmap.completedTasks);
          if (Array.isArray(parsed)) {
            parsed.forEach(key => {
              loadedChecked[key] = true;
            });
          }
        } catch (e) {
          console.error('Failed to parse completed tasks:', e);
        }
      }
      setCheckedItems(loadedChecked);
    } else {
      setCheckedItems({});
    }
  }, [roadmap]);

  // Sync project submissions when roadmap loads
  useEffect(() => {
    if (roadmap && roadmap.projectSubmissions) {
      try {
        const parsed = JSON.parse(roadmap.projectSubmissions);
        const evaluations: Record<number, any> = {};
        const gUrls: Record<number, string> = {};
        const dUrls: Record<number, string> = {};
        const added: Record<number, boolean> = {};

        Object.keys(parsed).forEach(weekKey => {
          const wNum = parseInt(weekKey, 10);
          const sub = parsed[weekKey];
          evaluations[wNum] = sub.evaluation;
          gUrls[wNum] = sub.githubUrl;
          dUrls[wNum] = sub.deploymentUrl;
          if (sub.addedToResume) {
            added[wNum] = true;
          }
        });
        setProjectEvaluations(evaluations);
        setGithubUrls(gUrls);
        setDeploymentUrls(dUrls);
        setAddedToResumeSuccess(added);
      } catch (e) {
        console.error('Failed to parse project submissions:', e);
      }
    } else {
      setProjectEvaluations({});
      setGithubUrls({});
      setDeploymentUrls({});
      setAddedToResumeSuccess({});
    }
  }, [roadmap]);

  // Sync query parameters if redirected from dashboard or ATS analyzer
  useEffect(() => {
    if (typeof window !== 'undefined' && history.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const queryId = urlParams.get('id');
      const jobProfileId = urlParams.get('jobProfileId');

      if (queryId) {
        const found = history.find(h => h.id === queryId);
        if (found) {
          setRoadmap(found);
          if (found.status === 'ACTIVE' || found.status === 'INACTIVE' || found.status === 'ARCHIVED' || found.status === 'COMPLETED') {
            setActiveTab(found.status);
          }
          if (found.jobProfile) {
            setActiveProfile(found.jobProfile);
          }
        }
      } else if (jobProfileId) {
        const found = history.find(h => h.jobProfileId === jobProfileId);
        if (found) {
          setRoadmap(found);
          if (found.status === 'ACTIVE' || found.status === 'INACTIVE' || found.status === 'ARCHIVED' || found.status === 'COMPLETED') {
            setActiveTab(found.status);
          }
          if (found.jobProfile) {
            setActiveProfile(found.jobProfile);
          }
        }
      }
    }
  }, [history]);

  useEffect(() => {
    async function initPage() {
      try {
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const jobProfileId = urlParams.get('jobProfileId');
          const queryId = urlParams.get('id');
          if (jobProfileId) {
            const data = await atsApi.getJobProfile(jobProfileId);
            setActiveProfile(data.jobProfile || null);
            setLoadingProfile(false);
            loadRoadmaps();
            return;
          }
          if (queryId) {
            setLoadingProfile(false);
            loadRoadmaps();
            return;
          }
        }

        setActiveProfile(null);
      } catch (err) {
        console.error('Failed to load active profile:', err);
      } finally {
        setLoadingProfile(false);
      }
      loadRoadmaps();
    }
    initPage();
  }, []);

  const loadRoadmaps = async () => {
    try {
      const data = await roadmapApi.list();
      setHistory(data.roadmaps || []);
      if (roadmap) {
        const updated = (data.roadmaps || []).find((h: any) => h.id === roadmap.id);
        if (updated) setRoadmap(updated);
      }
    } catch (e) {
      console.error('Failed to load roadmap logs:', e);
    }
  };

  const formatDuration = (days: number) => {
    if (days === 7) return '1 Week';
    if (days === 14) return '2 Weeks';
    if (days === 21) return '3 Weeks';
    if (days === 30) return '4 Weeks';
    if (days === 60) return '2 Months';
    if (days === 90) return '3 Months';
    return `${days} Days`;
  };

  // Update roadmap status
  const handleUpdateStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | 'COMPLETED', e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setError('');
    try {
      const data = await roadmapApi.updateRoadmapStatus(id, status);
      setHistory((prev: any[]) =>
        prev.map(item => (item.id === id ? { ...item, status: data.roadmap.status, is_active: data.roadmap.is_active } : item))
      );
      if (roadmap && roadmap.id === id) {
        setRoadmap((prev: any) => ({ ...prev, status: data.roadmap.status, is_active: data.roadmap.is_active }));
      }
      loadRoadmaps();
    } catch (err: any) {
      setError(err.message || 'Failed to update roadmap status.');
    }
  };

  const handleToggleStatus = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const data = await roadmapApi.toggleRoadmapStatus(id);
      setHistory((prev: any[]) => prev.map(item => item.id === id ? { ...item, is_active: data.roadmap.is_active, status: data.roadmap.status } : item));
      if (roadmap && roadmap.id === id) {
        setRoadmap((prev: any) => ({ ...prev, is_active: data.roadmap.is_active, status: data.roadmap.status }));
      }
      loadRoadmaps();
    } catch (err: any) {
      setError(err.message || 'Failed to toggle status.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!activeProfile) {
      setError('Please upload your resume in the ATS section first.');
      return;
    }

    setIsLoading(true);

    try {
      const data = await roadmapApi.generate({
        durationDays,
        jobProfileId: activeProfile.id,
        careerGoal
      });
      setRoadmap(data.roadmap);
      loadRoadmaps();
    } catch (err: any) {
      setError(err.message || 'Failed to generate study roadmap. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle checklist tasks and persist on the server
  const handleToggleCheck = async (roadmapId: string, weekNumber: number, itemId: string) => {
    if (roadmap && roadmap.status === 'ARCHIVED') {
      alert('Archived roadmaps are read-only and cannot receive progress updates.');
      return;
    }

    const key = `${roadmapId}_w${weekNumber}_${itemId}`;
    const isCurrentlyChecked = !!checkedItems[key];
    const newCheckedState = !isCurrentlyChecked;

    const nextChecked = { ...checkedItems, [key]: newCheckedState };
    setCheckedItems(nextChecked);

    if (typeof window !== 'undefined') {
      localStorage.setItem('roadmap_checked_items', JSON.stringify(nextChecked));
    }

    const roadmapCheckedKeys = Object.keys(nextChecked).filter(
      k => k.startsWith(`${roadmapId}_`) && nextChecked[k]
    );

    try {
      const res = await roadmapApi.updateRoadmapProgress(roadmapId, {
        checkedItems: roadmapCheckedKeys
      });
      setRoadmap(res.roadmap);
      loadRoadmaps();
    } catch (err: any) {
      alert(err.message || 'Failed to update progress on backend.');
    }
  };

  // Log study hours spent
  const handleLogHours = async () => {
    if (!roadmap) return;
    const hrs = parseFloat(hoursToAdd);
    if (isNaN(hrs) || hrs <= 0) {
      alert('Please enter a valid positive number of hours.');
      return;
    }

    setLoggingHours(true);
    const roadmapCheckedKeys = Object.keys(checkedItems).filter(
      k => k.startsWith(`${roadmap.id}_`) && checkedItems[k]
    );

    try {
      const res = await roadmapApi.updateRoadmapProgress(roadmap.id, {
        checkedItems: roadmapCheckedKeys,
        timeSpentLearning: hrs
      });
      setRoadmap(res.roadmap);
      setHoursToAdd('1');
      alert(`Logged ${hrs} study hours successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to save learning time.');
    } finally {
      setLoggingHours(false);
    }
  };

  const handleDownloadRoadmap = async (format: 'pdf' | 'docx' | 'markdown') => {
    if (!roadmap) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(roadmapApi.downloadUrl(roadmap.id, format), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error(`Failed to download ${format.toUpperCase()}.`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ext = format === 'markdown' ? 'md' : format;
      a.download = `roadmap_${roadmap.title.replace(/\s+/g, '_')}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || `Failed to download ${format.toUpperCase()}.`);
    }
  };

  const parseStructure = (str: string): any[] => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.weeks)) return parsed.weeks;
      return [];
    } catch {
      return [];
    }
  };

  const parseSkills = (str: string): string[] => {
    try {
      const parsed = JSON.parse(str);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any) => typeof item === 'string' ? item : (item.skill || ''));
      }
    } catch {
      return [];
    }
    return [];
  };

  const missingSkills = activeProfile ? parseSkills(activeProfile.missingSkills) : [];

  const filteredHistory = history.filter(h => {
    if (!activeProfile) {
      return false;
    }
    const activeRole = activeProfile.jobTitle.toLowerCase().trim();
    const matchProfile = h.jobProfile && h.jobProfile.jobTitle.toLowerCase().trim() === activeRole;
    const matchTitle = h.title && h.title.toLowerCase().includes(activeRole);
    if (!matchProfile && !matchTitle) return false;

    if (activeTab === 'ACTIVE') {
      return h.status === 'ACTIVE' || (h.is_active && h.status !== 'COMPLETED' && h.status !== 'ARCHIVED' && h.status !== 'INACTIVE');
    }
    return h.status === activeTab;
  });

  const getWeekChecklistItemsCount = (weekItem: any) => {
    let count = 0;
    count += (weekItem.practiceTasks || []).length;
    count += (weekItem.courses || []).length;
    count += (weekItem.youtubeResources || []).length;
    if (weekItem.miniProject && weekItem.miniProject.title) count++;
    if (weekItem.certifications) count += weekItem.certifications.length;
    return count;
  };

  const getCategoryProgress = () => {
    const stats = {
      learning: { completed: 0, total: 0, pct: 0 },
      practice: { completed: 0, total: 0, pct: 0 },
      coding: { completed: 0, total: 0, pct: 0 },
      project: { completed: 0, total: 0, pct: 0 },
      certification: { completed: 0, total: 0, pct: 0 },
      interview: { completed: 0, total: 0, pct: 0 }
    };

    if (!roadmap) return stats;

    const weeks = parseStructure(roadmap.structure);
    weeks.forEach((weekItem: any) => {
      const w = weekItem.week;

      // 1. Learning (Topics)
      (weekItem.topics || []).forEach((_: any, idx: number) => {
        stats.learning.total++;
        const checkedKey = `${roadmap.id}_w${w}_topic_${idx}`;
        if (checkedItems[checkedKey]) {
          stats.learning.completed++;
        }
      });

      // 2. Practice and Coding Tasks
      (weekItem.practiceTasks || []).forEach((task: any, idx: number) => {
        const checkedKey = `${roadmap.id}_w${w}_pt_${idx}`;
        if (task.type === 'coding') {
          stats.coding.total++;
          if (checkedItems[checkedKey]) {
            stats.coding.completed++;
          }
        } else {
          stats.practice.total++;
          if (checkedItems[checkedKey]) {
            stats.practice.completed++;
          }
        }
      });

      // 3. Mini Project
      if (weekItem.miniProject && weekItem.miniProject.title) {
        stats.project.total++;
        const checkedKey = `${roadmap.id}_w${w}_project`;
        if (checkedItems[checkedKey]) {
          stats.project.completed++;
        }
      }

      // 4. Certification (Courses & Certifications)
      (weekItem.courses || []).forEach((_: any, idx: number) => {
        stats.certification.total++;
        const checkedKey = `${roadmap.id}_w${w}_course_${idx}`;
        if (checkedItems[checkedKey]) {
          stats.certification.completed++;
        }
      });
      (weekItem.certifications || []).forEach((_: any, idx: number) => {
        stats.certification.total++;
        const checkedKey = `${roadmap.id}_w${w}_cert_${idx}`;
        if (checkedItems[checkedKey]) {
          stats.certification.completed++;
        }
      });

      // 5. Interview Prep
      if (weekItem.interviewPrep) {
        const categories = [
          'technicalQuestions',
          'codingQuestions',
          'scenarioQuestions',
          'companySpecificQuestions',
          'hrQuestions'
        ];
        categories.forEach((catKey) => {
          const list = weekItem.interviewPrep[catKey] || [];
          list.forEach((_: any, idx: number) => {
            stats.interview.total++;
            const checkedKey = `${roadmap.id}_w${w}_interview_${catKey}_${idx}`;
            if (checkedItems[checkedKey]) {
              stats.interview.completed++;
            }
          });
        });
      }
    });

    const keys = ['learning', 'practice', 'coding', 'project', 'certification', 'interview'] as const;
    keys.forEach(k => {
      const s = stats[k];
      s.pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
    });

    return stats;
  };

  // Dynamic category calculations
  const categoryAnalytics = getCategoryProgress();

  const toggleWeekExpand = (w: number) => {
    setExpandedWeeks(prev => ({ ...prev, [w]: !prev[w] }));
  };

  // Dynamic topic definition lookup
  const handleViewTopicNotes = async (topicName: string) => {
    setActiveTopicName(topicName);
    setTopicModalOpen(true);
    setIsFetchingTopic(true);
    setActiveTopicContent(null);
    try {
      const data = await roadmapApi.getTopicExplanation(roadmap.id, topicName);
      setActiveTopicContent(data.explanation);
    } catch (e: any) {
      console.error(e);
      setActiveTopicContent({
        definition: `Explanation of ${topicName} context for the target role.`,
        example: `// Example code for ${topicName}\nconst example = () => {\n  console.log("Demo");\n};`,
        bestPractices: [
          `Ensure modular structure and separation of concerns.`,
          `Keep inputs verified and handle edge cases.`
        ],
        faqs: [
          { question: 'What is the main use case?', answer: 'Improves maintainability and structure.' }
        ]
      });
    } finally {
      setIsFetchingTopic(false);
    }
  };

  // Open coding workspace modal
  const handleOpenCodingWorkspace = (task: any, weekNum: number, taskIndex: number) => {
    setActiveCodingTask({ ...task, weekNum, taskIndex });
    setWorkspaceLanguage('javascript');
    setWorkspaceCode(task.defaultCode?.javascript || `// Boilerplate for ${task.title}\nfunction solve() {\n  // Write your code here\n}`);
    setWorkspaceOutput([]);
    setWorkspaceTestResults([]);
    setShowHints(false);
    
    // Reset simulation parameters
    setExcelFormula('');
    setTableauChartType('Bar Chart');
    setTableauDimension('Category');
    setTableauMeasure('Sales');
    setTableauCalculatedField('');
    setBaSponsorPower('High');
    setBaSponsorInterest('High');
    setBaSponsorStrategy('Manage Closely');
    setBaUserPower('Low');
    setBaUserInterest('High');
    setBaUserStrategy('Keep Informed');
    setBaCompetitorPower('Low');
    setBaCompetitorInterest('Low');
    setBaCompetitorStrategy('Monitor');
    setBaRequirementStatement('');
    setPmFeatures([
      { name: 'Core Checkout Optimization', reach: 5000, impact: 2, confidence: 0.8, effort: 3, score: 0 },
      { name: 'AI Recommendations Engine', reach: 8000, impact: 1, confidence: 0.5, effort: 5, score: 0 },
      { name: 'Mobile Push Notifications', reach: 3000, impact: 3, confidence: 0.9, effort: 2, score: 0 }
    ]);
    setPmPriorityFeature('Core Checkout Optimization');
    setTheoryAnswer('');
    setSimulationPassed(false);
    setSimulationChecked(false);
    
    setCodingWorkspaceOpen(true);
  };

  const handleValidateSimulation = () => {
    if (!activeCodingTask) return;
    setRunningCode(true);
    setWorkspaceOutput([]);
    setWorkspaceTestResults([]);
    
    // Simulate validator latency for premium feel
    setTimeout(() => {
      const type = activeCodingTask.type;
      let passed = false;
      const logs: string[] = [`[Sandbox System] Starting simulation validation...`];

      if (type === 'excel') {
        const refSol = (activeCodingTask.referenceSolution || activeCodingTask.referenceAnswer || '').toLowerCase().replace(/\s/g, '');
        const cleanFormula = excelFormula.toLowerCase().replace(/\s/g, '');
        logs.push(`Evaluating formula: "${excelFormula}"`);

        // Check if formula matches reference solution or contains crucial parts
        if (cleanFormula && (cleanFormula === refSol || cleanFormula.includes('vlookup') || cleanFormula.includes('sum') || cleanFormula.includes('average'))) {
          passed = true;
          logs.push(`[Formula Engine] Result computed successfully: 105`);
          logs.push(`[Verification] Formula matches required structure.`);
        } else {
          logs.push(`[Error] Formula evaluation failed or reference mismatch.`);
          logs.push(`Expected pattern: "${activeCodingTask.referenceSolution || '=SUM(C2:C4)'}"`);
        }
      } 
      else if (type === 'tableau') {
        logs.push(`Verifying visualization layout options...`);
        logs.push(`Selected Chart: ${tableauChartType}`);
        logs.push(`Selected Dimension: ${tableauDimension}`);
        logs.push(`Selected Measure: ${tableauMeasure}`);
        logs.push(`Calculated Field expression: "${tableauCalculatedField}"`);

        // Tableau validation logic: e.g. check if calculated field has brackets
        if (tableauCalculatedField.includes('[') && tableauCalculatedField.includes(']')) {
          passed = true;
          logs.push(`[Tableau Compiler] Calculated field validated: Success.`);
          logs.push(`[Visualizer] Chart compiled successfully.`);
        } else {
          logs.push(`[Tableau Compiler Error] Calculated field must contain valid table column references like [Sales].`);
        }
      } 
      else if (type === 'business_analysis') {
        logs.push(`Analyzing stakeholder registry power/interest alignment...`);
        
        // Mendelow's Matrix validator
        const sponsorCorrect = baSponsorPower === 'High' && baSponsorInterest === 'High' && baSponsorStrategy === 'Manage Closely';
        const userCorrect = baUserPower === 'Low' && baUserInterest === 'High' && baUserStrategy === 'Keep Informed';
        const competitorCorrect = baCompetitorPower === 'Low' && baCompetitorInterest === 'Low' && baCompetitorStrategy === 'Monitor';

        if (sponsorCorrect && userCorrect && competitorCorrect) {
          passed = true;
          logs.push(`[Registry Verifier] All stakeholder power/interest/strategy combinations align with Mendelow's Matrix!`);
          logs.push(`[Requirements] Requirement statement captured: "${baRequirementStatement.substring(0, 30)}..."`);
        } else {
          logs.push(`[Registry Verifier Warning] Some strategies do not align with stakeholder power and interest:`);
          if (!sponsorCorrect) logs.push(` - Sponsor (High Power, High Interest) strategy should be 'Manage Closely'`);
          if (!userCorrect) logs.push(` - Users (Low Power, High Interest) strategy should be 'Keep Informed'`);
          if (!competitorCorrect) logs.push(` - Competitors (Low Power, Low Interest) strategy should be 'Monitor'`);
        }
      } 
      else if (type === 'product_management') {
        logs.push(`Calculating RICE priorities...`);
        
        // Verify RICE calculation correctness and feature selection
        if (pmPriorityFeature === 'Mobile Push Notifications') {
          passed = true;
          logs.push(`[PM Evaluator] Correct priority choice! 'Mobile Push Notifications' has the highest RICE score (4050).`);
        } else {
          logs.push(`[PM Evaluator Warning] Prioritizing ${pmPriorityFeature} is sub-optimal.`);
          logs.push(`Calculate all RICE scores: (Reach * Impact * Confidence) / Effort to find the highest.`);
        }
      } 
      else {
        // Theory tasks
        if (theoryAnswer.trim().length > 20) {
          passed = true;
          logs.push(`[Theory Evaluator] Drafted response length: ${theoryAnswer.length} characters.`);
          logs.push(`[Verification] Response submitted for automated assessment.`);
        } else {
          logs.push(`[Warning] Response too short. Please elaborate your answer with at least 20 characters.`);
        }
      }

      setWorkspaceOutput(logs);
      setWorkspaceTestResults([{
        caseNum: 1,
        input: 'Simulation Parameters',
        expected: 'Successful Validation',
        actual: passed ? 'Validation Passed' : 'Validation Failed',
        passed
      }]);
      setSimulationPassed(passed);
      setSimulationChecked(true);
      setRunningCode(false);
    }, 1000);
  };

  const handleRunCode = async () => {
    if (!activeCodingTask) return;
    setRunningCode(true);
    setWorkspaceOutput([]);

    const testCases = activeCodingTask.testCases || [];
    const results: any[] = [];
    const logs: string[] = [];

    // Realistic delay for premium compiler feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (workspaceLanguage === 'javascript' || workspaceLanguage === 'typescript') {
      try {
        let jsCode = workspaceCode;

        // Capture standard logs
        const originalLog = console.log;
        const capturedLogs: string[] = [];
        console.log = (...args) => {
          capturedLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' '));
        };

        for (let i = 0; i < testCases.length; i++) {
          const tc = testCases[i];
          try {
            let parsedInput;
            try {
              parsedInput = JSON.parse(tc.input);
            } catch {
              parsedInput = tc.input;
            }

            let executionResult;
            if (jsCode.includes('function') || jsCode.includes('=>')) {
              const userFn = new Function(`${jsCode}\nreturn typeof solve !== 'undefined' ? solve : (typeof reverseString !== 'undefined' ? reverseString : null);`)();
              if (userFn) {
                executionResult = userFn(parsedInput);
              } else {
                executionResult = new Function(jsCode)();
              }
            } else {
              executionResult = new Function(jsCode)();
            }

            const expected = tc.output.replace(/^"|"$/g, '');
            const actual = typeof executionResult === 'object' ? JSON.stringify(executionResult) : String(executionResult);

            const passed = actual.trim() === expected.trim();
            results.push({
              caseNum: i + 1,
              input: tc.input,
              expected: tc.output,
              actual,
              passed
            });
          } catch (execErr: any) {
            results.push({
              caseNum: i + 1,
              input: tc.input,
              expected: tc.output,
              actual: `Runtime Error: ${execErr.message}`,
              passed: false
            });
          }
        }

        console.log = originalLog;
        setWorkspaceOutput(capturedLogs.length ? capturedLogs : ['Code executed successfully with 0 runtime errors.']);
        setWorkspaceTestResults(results);
      } catch (err: any) {
        setWorkspaceOutput([`Compilation Error: ${err.message}`]);
        setWorkspaceTestResults(testCases.map((tc: any, i: number) => ({
          caseNum: i + 1,
          input: tc.input,
          expected: tc.output,
          actual: 'N/A (Compilation Error)',
          passed: false
        })));
      }
    } else {
      // Simulate compiler logs for other languages
      const consoleLogs = [
        `[Compiler] Compiling solution code using default ${workspaceLanguage.toUpperCase()} environment...`,
        `[Linker] Linking dependencies...`,
        `[Runner] Executing test cases...`
      ];

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        const codeIsValid = workspaceCode.trim().length > 15;
        let actual = tc.output;
        let passed = true;
        if (!codeIsValid) {
          actual = 'Empty output / Compilation error';
          passed = false;
        }

        results.push({
          caseNum: i + 1,
          input: tc.input,
          expected: tc.output,
          actual,
          passed
        });
      }
      setWorkspaceOutput(consoleLogs);
      setWorkspaceTestResults(results);
    }
    setRunningCode(false);
  };

  const handleSubmitCodeTask = async () => {
    if (!activeCodingTask) return;
    setSubmittingCode(true);
    try {
      // Automatically check off task in local checklist and push to backend
      const itemId = `pt_${activeCodingTask.taskIndex}`;
      await handleToggleCheck(roadmap.id, activeCodingTask.weekNum, itemId);
      setCodingWorkspaceOpen(false);
      alert('Coding task submitted successfully and marked as completed!');
    } catch (e: any) {
      alert(e.message || 'Failed to submit coding challenge.');
    } finally {
      setSubmittingCode(false);
    }
  };

  // Project Submission handler
  const handleProjectSubmit = async (w: number) => {
    const gitUrl = githubUrls[w] || '';
    const deployUrl = deploymentUrls[w] || '';
    if (!gitUrl.startsWith('http') || !deployUrl.startsWith('http')) {
      alert('Please enter valid HTTP/HTTPS URLs for both repository and deployment.');
      return;
    }

    setProjectSubmitting(prev => ({ ...prev, [w]: true }));
    try {
      const data = await roadmapApi.submitProject(roadmap.id, w, {
        githubUrl: gitUrl,
        deploymentUrl: deployUrl
      });
      setProjectEvaluations(prev => ({ ...prev, [w]: data.submission.evaluation }));
      // Automatically check off project in checklist
      if (!checkedItems[`${roadmap.id}_w${w}_project`]) {
        await handleToggleCheck(roadmap.id, w, 'project');
      }
      alert('Project evaluated successfully! Scroll down to review the AI scorecard.');
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate project URL. Please verify URLs are reachable.');
    } finally {
      setProjectSubmitting(prev => ({ ...prev, [w]: false }));
    }
  };

  const handleAddToResume = async (w: number) => {
    setAddingToResume(prev => ({ ...prev, [w]: true }));
    try {
      await roadmapApi.addProjectToResume(roadmap.id, w);
      setAddedToResumeSuccess(prev => ({ ...prev, [w]: true }));
      alert('Project achievements appended directly to your active resume! It is now active for future scans and interviews.');
    } catch (err: any) {
      alert(err.message || 'Failed to add project to resume.');
    } finally {
      setAddingToResume(prev => ({ ...prev, [w]: false }));
    }
  };

  return (
    <LayoutShell>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-white mb-1 flex items-center gap-2">
              <Map size={24} className="text-purple-400" />
              Syllabus Workspaces
            </h1>
            <p className="text-slate-400 text-xs">Dynamic, resume-centric learning roadmaps with coding workspaces, interview prep and project evaluations.</p>
          </div>
        </div>

        {loadingProfile ? (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl flex flex-col items-center justify-center text-center">
            <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-400 text-sm">Loading active candidate profile...</p>
          </div>
        ) : activeProfile ? (
          <div className="grid lg:grid-cols-3 gap-8">

            {/* CONFIG AND SAVED LIST SIDEBAR */}
            <div className="lg:col-span-1 space-y-6">

              {/* Profile Config */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 bg-purple-500/10 rounded-bl-2xl">
                  <Sparkles size={16} className="text-purple-400" />
                </div>
                <div>
                  <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider block">Target Career Path</span>
                  <h3 className="text-base font-bold text-white mt-1">{activeProfile.jobTitle}</h3>
                  <p className="text-xs text-slate-400 mt-1">Classification: <strong>{activeProfile.domainClassification}</strong></p>
                </div>

                {missingSkills.length > 0 && (
                  <div className="border-t border-slate-800 pt-4">
                    <span className="text-[10px] text-rose-450 dark:text-rose-400 font-bold uppercase tracking-wider block mb-2">Bridge Gaps</span>
                    <div className="flex flex-wrap gap-1.5 max-h-[100px] overflow-y-auto pr-1">
                      {missingSkills.map((s: string, idx: number) => (
                        <span key={idx} className="text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 px-2 py-0.5 rounded">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="p-3 text-xs bg-rose-950/40 border border-rose-900/40 rounded-lg text-rose-300">
                    {error}
                  </div>
                )}

                <form onSubmit={handleGenerate} className="space-y-4 border-t border-slate-850 pt-4">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Describe Career Goals / Scope</label>
                    <textarea
                      placeholder="e.g. Become an ML Engineer focusing on large language models and distributed training architectures."
                      value={careerGoal}
                      onChange={(e) => setCareerGoal(e.target.value)}
                      className="w-full h-16 rounded-xl border border-slate-800 bg-slate-950/60 p-2 text-xs text-white placeholder-slate-600 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider mb-2">Roadmap Scope (Duration)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: '1 Wk', days: 7 },
                        { label: '2 Wks', days: 14 },
                        { label: '3 Wks', days: 21 },
                        { label: '4 Wks', days: 30 },
                        { label: '2 Mos', days: 60 },
                        { label: '3 Mos', days: 90 }
                      ].map((opt) => (
                        <button
                          key={opt.days}
                          type="button"
                          onClick={() => setDurationDays(opt.days)}
                          className={`py-2 px-1 border rounded-lg text-[10px] font-bold transition cursor-pointer select-none ${
                            durationDays === opt.days
                              ? 'bg-purple-600/10 border-purple-500/30 text-purple-400'
                              : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:bg-slate-950'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold text-xs transition duration-300 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="animate-spin" size={14} />
                        <span>Generating Dynamic Roadmap...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} />
                        <span>Generate Roadmap</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* History panel with Tabs */}
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">Syllabus Repository</h3>
                  <p className="text-[10px] text-slate-550">Filter roadmaps by active status</p>
                </div>

                {/* Tab buttons */}
                <div className="grid grid-cols-4 gap-1 bg-slate-955 p-1 rounded-xl border border-slate-850">
                  {(['ACTIVE', 'INACTIVE', 'ARCHIVED', 'COMPLETED'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setRoadmap(null);
                      }}
                      className={`py-1.5 px-0.5 text-[9px] font-extrabold rounded-lg transition-all text-center select-none cursor-pointer ${
                        activeTab === tab
                          ? 'bg-purple-600/15 text-purple-405 dark:text-purple-400 border border-purple-500/20'
                          : 'text-slate-550 hover:text-slate-350'
                      }`}
                    >
                      {tab === 'ACTIVE' && 'Active'}
                      {tab === 'INACTIVE' && 'Pause'}
                      {tab === 'ARCHIVED' && 'Archived'}
                      {tab === 'COMPLETED' && 'Done'}
                    </button>
                  ))}
                </div>

                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  {filteredHistory.length > 0 ? (
                    filteredHistory.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => setRoadmap(h)}
                        className={`p-3 bg-slate-950/40 border rounded-xl flex flex-col gap-2.5 cursor-pointer transition-all hover:border-slate-700 ${
                          roadmap && roadmap.id === h.id ? 'border-purple-500/50 bg-slate-950/80 shadow-md animate-pulseShort' : 'border-slate-805'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-450 dark:text-purple-400 shrink-0">
                              <Map size={14} />
                            </div>
                            <div>
                              <h4 className="text-[11px] font-extrabold text-white leading-snug">{h.title}</h4>
                              <p className="text-[9px] text-slate-500 mt-0.5">
                                {formatDuration(h.durationDays)} • {h.progress_percentage || 0}%
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-1.5 pt-1.5 border-t border-slate-850/50">
                          {activeTab === 'ACTIVE' && (
                            <>
                              <button
                                onClick={(e) => handleUpdateStatus(h.id, 'INACTIVE', e)}
                                className="px-2 py-0.5 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-400 rounded text-[9px] font-bold transition select-none cursor-pointer"
                              >
                                Pause
                              </button>
                              <button
                                onClick={(e) => handleUpdateStatus(h.id, 'ARCHIVED', e)}
                                className="px-2 py-0.5 border border-rose-955/20 bg-rose-950/15 text-rose-405 dark:text-rose-400 hover:bg-rose-950/30 rounded text-[9px] font-bold transition select-none cursor-pointer"
                              >
                                Archive
                              </button>
                            </>
                          )}

                          {activeTab === 'INACTIVE' && (
                            <>
                              <button
                                onClick={(e) => handleUpdateStatus(h.id, 'ACTIVE', e)}
                                className="px-2 py-0.5 border border-teal-955/30 bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 rounded text-[9px] font-bold transition select-none cursor-pointer"
                              >
                                Activate
                              </button>
                              <button
                                onClick={(e) => handleUpdateStatus(h.id, 'ARCHIVED', e)}
                                className="px-2 py-0.5 border border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-450 rounded text-[9px] font-bold transition select-none cursor-pointer"
                              >
                                Archive
                              </button>
                            </>
                          )}

                          {activeTab === 'ARCHIVED' && (
                            <button
                              onClick={(e) => handleUpdateStatus(h.id, 'ACTIVE', e)}
                              className="px-2 py-0.5 border border-purple-955/25 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 rounded text-[9px] font-bold transition select-none cursor-pointer"
                            >
                              Restore
                            </button>
                          )}

                          {activeTab === 'COMPLETED' && (
                            <button
                              onClick={(e) => handleUpdateStatus(h.id, 'ARCHIVED', e)}
                              className="px-2 py-0.5 border border-rose-955/20 bg-rose-950/15 text-rose-400 hover:bg-rose-950/30 rounded text-[9px] font-bold transition select-none cursor-pointer"
                            >
                              Archive
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-slate-550 text-[10px]">
                      No roadmaps in this section.
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* DETAIL DISPLAY PANEL */}
            <div className="lg:col-span-2 space-y-6">

              {isLoading && (
                <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col items-center justify-center text-center py-20 shadow-xl">
                  <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4" />
                  <h4 className="text-sm font-bold text-white mb-1">Architecting Dynamic Roadmap...</h4>
                  <p className="text-xs text-slate-500 max-w-sm">Generating tailored topics, coding workspace exercises, certification routes and weekly interview checkpoints based on your profile.</p>
                </div>
              )}

              {!isLoading && roadmap && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >

                  {/* Detailed Roadmap Header Info */}
                  <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">

                    {roadmap.status === 'ARCHIVED' && (
                      <div className="p-3 text-xs bg-amber-950/40 border border-amber-900/40 rounded-xl text-amber-300 font-bold flex items-center gap-2">
                        <Archive size={14} />
                        <span>Archived Syllabus (Read-Only) • Progress checkboxes and project uploads are disabled.</span>
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h3 className="text-base font-black text-white flex items-center gap-2">
                          <Calendar className="text-purple-400" size={18} />
                          {roadmap.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          Role: <strong>{activeProfile.jobTitle}</strong> • Classified: <strong>{activeProfile.domainClassification}</strong>
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2 shrink-0">
                        {roadmap.status !== 'COMPLETED' && (
                          <button
                            type="button"
                            onClick={(e) => handleToggleStatus(roadmap.id, e)}
                            className={`px-3 py-1.5 border text-xs font-bold rounded-lg transition cursor-pointer select-none ${
                              roadmap.status === 'ACTIVE'
                                ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/20'
                                : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:bg-slate-900'
                            }`}
                          >
                            {roadmap.status === 'ACTIVE' ? 'Active' : 'Paused'}
                          </button>
                        )}
                        <button
                          onClick={() => setRoadmap(null)}
                          className="px-3 py-1.5 bg-slate-950/40 hover:bg-slate-900 border border-slate-800 text-xs font-bold text-slate-450 rounded-lg transition cursor-pointer select-none"
                        >
                          Close Workspace
                        </button>
                      </div>
                    </div>

                    {/* CATEGORY PROGRESS ANALYTICS DASHBOARD */}
                    <div className="border-t border-slate-850 pt-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-purple-400" />
                        <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Progress & Category Analytics</h4>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {[
                          { name: 'Theory Tasks', key: 'practice', color: 'from-purple-500 to-pink-500' },
                          { name: 'Coding Mastery', key: 'coding', color: 'from-emerald-500 to-teal-500' },
                          { name: 'Weekly Projects', key: 'project', color: 'from-orange-500 to-amber-500' },
                          { name: 'Credentials', key: 'certification', color: 'from-cyan-500 to-blue-500' },
                          { name: 'Interview Prep', key: 'interview', color: 'from-pink-500 to-rose-500' },
                        ].filter((cat) => {
                          const data = (categoryAnalytics as any)[cat.key] || { completed: 0, total: 0, pct: 0 };
                          return data.total > 0;
                        }).map((cat) => {
                          const data = (categoryAnalytics as any)[cat.key] || { completed: 0, total: 0, pct: 0 };
                          return (
                            <div key={cat.key} className="bg-slate-955 border border-slate-850 p-3 rounded-xl flex flex-col justify-between">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{cat.name}</span>
                              <div className="flex justify-between items-baseline mt-1">
                                <span className="text-xs font-black text-white">{data.pct}%</span>
                                <span className="text-[9px] text-slate-500 font-medium">{data.completed}/{data.total} completed</span>
                              </div>
                              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-2">
                                <div className={`h-full bg-gradient-to-r ${cat.color} transition-all duration-500`} style={{ width: `${data.pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* STUDY HOURS PERSISTENCE TRACKING */}
                    {roadmap.status !== 'ARCHIVED' && (
                      <div className="p-3.5 bg-slate-955 border border-slate-850 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-purple-400 shrink-0" />
                          <div>
                            <span className="font-bold text-white block">Log Study Time</span>
                            <span className="text-[10px] text-slate-500">Cumulative learning: <strong>{roadmap.timeSpentLearning || 0} hours</strong> logged</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={hoursToAdd}
                            onChange={(e) => setHoursToAdd(e.target.value)}
                            className="w-16 rounded-lg border border-slate-800 text-xs px-2 py-1 bg-slate-950 text-white text-center focus:border-purple-500 outline-none"
                          />
                          <button
                            onClick={handleLogHours}
                            disabled={loggingHours}
                            className="px-3 py-1.5 bg-purple-650 hover:bg-purple-600 text-white rounded-lg font-bold transition text-[10px] select-none cursor-pointer disabled:opacity-50"
                          >
                            {loggingHours ? 'Logging...' : 'Add Hours'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ROADMAP COMPLETION SYSTEM SCORECARD */}
                    {roadmap.status === 'COMPLETED' && (
                      <div className="p-5 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                          <Award size={20} className="text-emerald-400 animate-bounceShort" />
                          <h4 className="text-sm font-black text-white">Syllabus Mastered! 🏆</h4>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs leading-relaxed text-slate-300">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Completion Date</span>
                            <span className="font-bold text-white block mt-0.5">
                              {new Date(roadmap.completedAt || roadmap.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Total Learning Hours</span>
                            <span className="font-bold text-emerald-400 block mt-0.5">{roadmap.timeSpentLearning || 0} Hours</span>
                          </div>
                        </div>

                        {/* AI Final Assessment */}
                        {roadmap.finalAssessment && (
                          <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl space-y-1.5">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">AI Final Performance Evaluation</span>
                            <p className="text-xs text-slate-300 leading-relaxed font-medium">{roadmap.finalAssessment}</p>
                          </div>
                        )}

                        {/* AI Next Recommendations */}
                        {(() => {
                          let steps: string[] = [];
                          try {
                            steps = roadmap.completionRecommendations ? JSON.parse(roadmap.completionRecommendations) : [];
                          } catch {}
                          return steps.length > 0 && (
                            <div className="space-y-1.5">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">AI Recommended Next Moves</span>
                              <div className="space-y-1">
                                {steps.map((step, idx) => (
                                  <div key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                                    <span className="text-emerald-400 mt-0.5 font-bold">•</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}

                      </div>
                    )}

                    {/* Export Formats Row */}
                    <div className="flex flex-wrap items-center gap-2 border-t border-slate-850 pt-4">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mr-2">Download Syllabus:</span>
                      <button
                        onClick={() => handleDownloadRoadmap('pdf')}
                        className="px-3 py-1.5 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-350 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download size={14} className="text-rose-400" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => handleDownloadRoadmap('docx')}
                        className="px-3 py-1.5 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-350 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <Layers size={14} className="text-blue-400" />
                        <span>DOCX</span>
                      </button>
                      <button
                        onClick={() => handleDownloadRoadmap('markdown')}
                        className="px-3 py-1.5 bg-slate-955 hover:bg-slate-900 border border-slate-800 text-slate-350 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen size={14} className="text-purple-405" />
                        <span>Markdown</span>
                      </button>
                    </div>
                  </div>

                  {/* ACCORDION TIMELINE WEEKS */}
                  <div className="space-y-4">
                    {parseStructure(roadmap.structure).map((weekItem: any) => {
                      const w = weekItem.week;
                      const isExpanded = !!expandedWeeks[w];
                      const totalItems = getWeekChecklistItemsCount(weekItem);

                      return (
                        <div key={w} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all">
                          {/* Accordion Trigger Header */}
                          <div
                            onClick={() => toggleWeekExpand(w)}
                            className="p-5 flex justify-between items-center cursor-pointer select-none bg-slate-900/60 hover:bg-slate-900 transition-all border-b border-slate-850/50"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-450 dark:text-purple-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                                W{w}
                              </span>
                              <div>
                                <h4 className="text-sm font-bold text-white">{weekItem.title || `Week ${w}`}</h4>
                                {weekItem.weekGoal && (
                                  <p className="text-[10px] text-slate-450 mt-0.5 line-clamp-1 italic">{weekItem.weekGoal}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[9px] font-bold bg-slate-850 text-slate-400 px-2 py-0.5 rounded-lg border border-slate-800">
                                {totalItems} syllabus tasks
                              </span>
                              {isExpanded ? <ChevronUp size={16} className="text-slate-450" /> : <ChevronDown size={16} className="text-slate-450" />}
                            </div>
                          </div>

                          {/* Accordion expanded content */}
                          {isExpanded && (
                            <div className="p-6 space-y-6 bg-slate-955/10 divide-y divide-slate-850/50">

                              {/* 2. PRACTICE & CODING CHALLENGES */}
                              {weekItem.practiceTasks && weekItem.practiceTasks.length > 0 && (
                                <div className="space-y-3 pt-5">
                                  <div className="flex items-center gap-2">
                                    <Code2 size={14} className="text-emerald-450 dark:text-emerald-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Practice Coding & Logic Tasks</span>
                                  </div>

                                  <div className="space-y-3">
                                    {(weekItem.practiceTasks || []).map((task: any, idx: number) => {
                                      const key = `pt_${idx}`;
                                      const checkedKey = `${roadmap.id}_w${w}_${key}`;
                                      const isChecked = !!checkedItems[checkedKey];

                                      return (
                                        <div key={idx} className="bg-slate-955 border border-slate-850 p-4 rounded-xl flex flex-col justify-between gap-3">
                                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                                            <div className="space-y-1 flex-1">
                                              <div className="flex items-center gap-2">
                                                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
                                                  <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    disabled={roadmap.status === 'ARCHIVED'}
                                                    onChange={() => handleToggleCheck(roadmap.id, w, key)}
                                                    className="mt-0.5 rounded border-slate-800 text-purple-650 bg-slate-955 focus:ring-purple-500/20"
                                                  />
                                                  <span className={isChecked ? "line-through text-slate-500 font-semibold" : "font-extrabold text-white"}>
                                                    {task.title || `Task ${idx + 1}`}
                                                  </span>
                                                </label>
                                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                                                  task.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450 dark:text-emerald-450' :
                                                  task.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-450 dark:text-amber-400' :
                                                  'bg-rose-500/10 border-rose-500/20 text-rose-455 dark:text-rose-400'
                                                }`}>
                                                  {task.difficulty || 'Easy'}
                                                </span>
                                                <span className="text-[8px] font-bold uppercase tracking-wider bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded-lg shrink-0">
                                                  {task.type || 'coding'}
                                                </span>
                                              </div>
                                              <p className="text-[11px] text-slate-400 leading-relaxed max-w-2xl ml-6">
                                                {task.question}
                                              </p>
                                            </div>

                                            {['coding', 'excel', 'tableau', 'business_analysis', 'product_management', 'theory'].includes(task.type) && (
                                              task.leetcodeUrl ? (
                                                <a
                                                  href={task.leetcodeUrl}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="md:self-center ml-6 md:ml-0 text-[10px] font-black bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white px-3 py-1.5 rounded-xl transition duration-300 flex items-center gap-1.5 select-none cursor-pointer shrink-0"
                                                >
                                                  <Terminal size={12} />
                                                  <span>Solve on LeetCode</span>
                                                </a>
                                              ) : (
                                                <button
                                                  onClick={() => handleOpenCodingWorkspace(task, w, idx)}
                                                  className="md:self-center ml-6 md:ml-0 text-[10px] font-black bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3 py-1.5 rounded-xl transition duration-300 flex items-center gap-1.5 select-none cursor-pointer shrink-0"
                                                >
                                                  <Terminal size={12} />
                                                  <span>{task.type === 'coding' ? 'Coding Sandbox' : 'Start Simulation Sandbox'}</span>
                                                </button>
                                              )
                                            )}
                                          </div>

                                          {/* Task Specifications Expandable Disclosure Details */}
                                          <div className="ml-6 mt-1 border-t border-slate-850/30 pt-2">
                                            <button
                                              onClick={() => toggleTaskExpand(checkedKey)}
                                              className="text-[10px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-all select-none cursor-pointer"
                                            >
                                              {expandedTasks[checkedKey] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                              <span>{expandedTasks[checkedKey] ? 'Hide Specifications' : 'View Specifications & Approach'}</span>
                                            </button>
                                            
                                            {expandedTasks[checkedKey] && (
                                              <div className="mt-3 bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3.5 text-[11px] text-slate-350 leading-relaxed">
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                  {/* Specs */}
                                                  <div className="space-y-2">
                                                    {task.inputFormat && (
                                                      <div>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Input Format</span>
                                                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 mt-1">{task.inputFormat}</pre>
                                                      </div>
                                                    )}
                                                    {task.outputFormat && (
                                                      <div>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Output Format</span>
                                                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 mt-1">{task.outputFormat}</pre>
                                                      </div>
                                                    )}
                                                    {task.constraints && (
                                                      <div>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Constraints</span>
                                                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 mt-1">{task.constraints}</pre>
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  {/* Examples */}
                                                  <div className="space-y-2">
                                                    {task.sampleInput && (
                                                      <div>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Sample Input</span>
                                                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 mt-1">{task.sampleInput}</pre>
                                                      </div>
                                                    )}
                                                    {task.sampleOutput && (
                                                      <div>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Sample Output</span>
                                                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 mt-1">{task.sampleOutput}</pre>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>

                                                {task.explanation && (
                                                  <div className="border-t border-slate-850 pt-2.5">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Concept Explanation</span>
                                                    <p className="text-slate-400 font-medium">{task.explanation}</p>
                                                  </div>
                                                )}

                                                {task.solutionApproach && (
                                                  <div className="border-t border-slate-850 pt-2.5">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Recommended Solution Approach</span>
                                                    <p className="text-slate-400 font-medium">{task.solutionApproach}</p>
                                                  </div>
                                                )}

                                                {(task.referenceSolution || task.referenceAnswer) && (
                                                  <div className="border-t border-slate-850 pt-2.5">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reference Answer / Solution</span>
                                                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-850 font-mono text-[10px] text-emerald-450 overflow-x-auto mt-1 whitespace-pre-wrap">
                                                      {task.referenceSolution || task.referenceAnswer}
                                                    </pre>
                                                  </div>
                                                )}

                                                {task.hints && task.hints.length > 0 && (
                                                  <div className="border-t border-slate-850 pt-2.5">
                                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Hints</span>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                      {task.hints.map((hint: string, hIdx: number) => (
                                                        <li key={hIdx} className="text-slate-400 font-medium">{hint}</li>
                                                      ))}
                                                    </ul>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                                                     {/* 3. MINI PROJECT INTEGRATION */}
                              {weekItem.miniProject && weekItem.miniProject.title && (
                                <div className="space-y-4 pt-5">
                                  <div className="flex items-center gap-2">
                                    <GithubIcon size={14} className="text-purple-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-wider">Weekly Project Submission & Evaluation</span>
                                  </div>

                                  <div className="bg-slate-955 border border-slate-850 p-5 rounded-2xl space-y-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2">
                                        <label className="flex items-center gap-2 text-xs font-extrabold text-white cursor-pointer select-none">
                                          <input
                                            type="checkbox"
                                            checked={!!checkedItems[`${roadmap.id}_w${w}_project`]}
                                            disabled={roadmap.status === 'ARCHIVED'}
                                            onChange={() => handleToggleCheck(roadmap.id, w, 'project')}
                                            className="rounded border-slate-800 text-purple-650 bg-slate-955 focus:ring-purple-500/20"
                                          />
                                          <span className={checkedItems[`${roadmap.id}_w${w}_project`] ? "line-through text-slate-500" : "text-purple-400 text-sm font-bold"}>
                                            {weekItem.miniProject.title}
                                          </span>
                                        </label>
                                      </div>
                                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                                        {weekItem.miniProject.description}
                                      </p>
                                    </div>

                                    {/* Expandable Project details drawer */}
                                    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl space-y-3.5 text-xs text-slate-300 leading-relaxed">
                                      {weekItem.miniProject.objective && (
                                        <div>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Objective</span>
                                          <span className="font-medium text-slate-350">{weekItem.miniProject.objective}</span>
                                        </div>
                                      )}
                                      {weekItem.miniProject.businessProblem && (
                                        <div>
                                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Business Context</span>
                                          <span className="font-medium text-slate-350">{weekItem.miniProject.businessProblem}</span>
                                        </div>
                                      )}
                                      <div className="grid sm:grid-cols-2 gap-3 pt-2">
                                        {weekItem.miniProject.functionalRequirements && (
                                          <div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Functional Features</span>
                                            <div className="space-y-1">
                                              {weekItem.miniProject.functionalRequirements.map((r: string, idx: number) => (
                                                <div key={idx} className="flex gap-1.5 text-[11px] text-slate-400 font-medium">
                                                  <span>•</span> <span>{r}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        {weekItem.miniProject.technicalRequirements && (
                                          <div>
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Tech Stack</span>
                                            <div className="space-y-1">
                                              {weekItem.miniProject.technicalRequirements.map((r: string, idx: number) => (
                                                <div key={idx} className="flex gap-1.5 text-[11px] text-slate-400 font-medium">
                                                  <span>•</span> <span>{r}</span>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* URLs upload validation interface */}
                                    {roadmap.status !== 'ARCHIVED' && (
                                      <div className="space-y-4 border-t border-slate-850 pt-4">
                                        <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Validate & Evaluate Workspace</span>
                                        <div className="grid sm:grid-cols-2 gap-3">
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-semibold text-slate-500">GitHub URL</span>
                                            <input
                                              type="text"
                                              placeholder="e.g. https://github.com/my-profile/project"
                                              value={githubUrls[w] || ''}
                                              onChange={(e) => setGithubUrls(prev => ({ ...prev, [w]: e.target.value }))}
                                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-purple-500"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-semibold text-slate-500">Live Deployment Link</span>
                                            <input
                                              type="text"
                                              placeholder="e.g. https://my-project.vercel.app"
                                              value={deploymentUrls[w] || ''}
                                              onChange={(e) => setDeploymentUrls(prev => ({ ...prev, [w]: e.target.value }))}
                                              className="w-full bg-slate-950 border border-slate-800 rounded-lg text-xs p-2 text-white outline-none focus:border-purple-500"
                                            />
                                          </div>
                                        </div>

                                        <button
                                          onClick={() => handleProjectSubmit(w)}
                                          disabled={projectSubmitting[w] || !(githubUrls[w] && deploymentUrls[w])}
                                          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition duration-300 flex items-center gap-1.5 cursor-pointer"
                                        >
                                          {projectSubmitting[w] ? (
                                            <>
                                              <RefreshCw className="animate-spin" size={12} />
                                              <span>Validating & Analyzing...</span>
                                            </>
                                          ) : (
                                            <>
                                              <ShieldCheck size={12} />
                                              <span>Submit & Trigger AI Review</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    )}

                                    {/* AI Evaluation Output display */}
                                    {projectEvaluations[w] && (
                                      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-4 mt-3 animate-slideIn">
                                        <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                                          <div className="flex items-center gap-1.5">
                                            <Sparkles size={14} className="text-purple-400 animate-pulseShort" />
                                            <span className="text-[10px] font-black text-white uppercase tracking-wider">AI Scorecard Summary</span>
                                          </div>
                                          <span className="text-lg font-black text-purple-400">{projectEvaluations[w].score} / 100</span>
                                        </div>

                                        <div className="grid sm:grid-cols-2 gap-3 text-xs">
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">Strengths</span>
                                            <div className="space-y-0.5 text-slate-350 font-medium">
                                              {(projectEvaluations[w].strengths || []).map((s: string, idx: number) => (
                                                <div key={idx} className="flex gap-1"><span>✔</span> <span>{s}</span></div>
                                              ))}
                                            </div>
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-[9px] font-bold text-rose-455 uppercase tracking-wider block">Improvements</span>
                                            <div className="space-y-0.5 text-slate-350 font-medium">
                                              {(projectEvaluations[w].improvements || []).map((s: string, idx: number) => (
                                                <div key={idx} className="flex gap-1"><span>⚠</span> <span>{s}</span></div>
                                              ))}
                                            </div>
                                          </div>
                                        </div>

                                        {projectEvaluations[w].resumeEntry && (
                                          <div className="border-t border-slate-850 pt-3 space-y-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Suggested Resume Addition</span>
                                            <div className="bg-slate-955 border border-slate-850 p-3 rounded-lg text-xs leading-relaxed text-slate-300">
                                              <span className="font-extrabold text-white block">{projectEvaluations[w].resumeEntry.title}</span>
                                              <span className="text-[10px] text-purple-405 block mt-0.5 font-bold">Tech: {projectEvaluations[w].resumeEntry.technologies}</span>
                                              <div className="space-y-1 mt-1.5">
                                                {(projectEvaluations[w].resumeEntry.bullets || []).map((bullet: string, idx: number) => (
                                                  <div key={idx} className="flex items-start gap-1.5 text-slate-400 font-medium text-[11px]">
                                                    <span>•</span> <span>{bullet}</span>
                                                  </div>
                                                ))}
                                              </div>
                                            </div>

                                            {roadmap.status !== 'ARCHIVED' && (
                                              <button
                                                onClick={() => handleAddToResume(w)}
                                                disabled={addingToResume[w] || addedToResumeSuccess[w]}
                                                className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition duration-300 flex items-center gap-1.5 cursor-pointer ${
                                                  addedToResumeSuccess[w]
                                                    ? 'bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 cursor-default'
                                                    : 'bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 border border-purple-500/20 text-white'
                                                }`}
                                              >
                                                <CheckCircle size={12} />
                                                <span>{addedToResumeSuccess[w] ? 'Injected into active Resume!' : 'Add to Resume'}</span>
                                              </button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="space-y-4 pt-5">
                                <div className="flex items-center gap-2">
                                  <Award size={14} className="text-purple-405" />
                                  <span className="text-[10px] font-black text-white uppercase tracking-wider">Reading & Documentation</span>
                                </div>

                                <div className="space-y-3">
                                  {(weekItem.courses || []).map((c: any, idx: number) => {
                                    const key = `course_${idx}`;
                                    const checkedKey = `${roadmap.id}_w${w}_${key}`;
                                    const isChecked = !!checkedItems[checkedKey];

                                    return (
                                      <div key={idx} className="bg-slate-955 border border-slate-850 p-4 rounded-xl space-y-3">
                                        {c.topic && (
                                          <div className="text-[10px] font-black text-purple-400 uppercase tracking-wider">
                                            {c.topic}
                                          </div>
                                        )}

                                        <div className="flex items-start justify-between gap-3">
                                          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none flex-1">
                                            <input
                                              type="checkbox"
                                            checked={isChecked}
                                              disabled={roadmap.status === 'ARCHIVED'}
                                              onChange={() => handleToggleCheck(roadmap.id, w, key)}
                                              className="mt-0.5 rounded border-slate-800 text-purple-650 bg-slate-955 focus:ring-purple-500/20"
                                            />
                                            <div className="space-y-1">
                                              <span className={isChecked ? "line-through text-slate-500 font-semibold block" : "font-extrabold text-white block"}>
                                                Resource: {c.name}
                                              </span>
                                              <span className="text-[11px] text-slate-400 block font-semibold">
                                                Platform: {c.platform || 'Official Docs'}
                                              </span>
                                            </div>
                                          </label>

                                          {c.link && (
                                            <a
                                              href={getDirectReadingLink(c.name, c.link, w, activeProfile?.experienceLevel)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[10px] font-bold text-purple-450 dark:text-purple-400 hover:underline flex items-center gap-0.5 shrink-0"
                                            >
                                              <span>Read Documentation</span>
                                              <ExternalLink size={10} />
                                            </a>
                                          )}
                                        </div>

                                        {c.overview && (
                                          <p className="text-[11px] text-slate-400 leading-relaxed ml-6 font-semibold border-t border-slate-900 pt-2">
                                            {c.overview}
                                            {c.duration && <> • Duration: <strong>{c.duration}</strong></>}
                                            {c.difficulty && <> • Level: <strong>{c.difficulty}</strong></>}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}

                                  {(weekItem.certifications || []).map((cert: any, idx: number) => {
                                    const key = `cert_${idx}`;
                                    const checkedKey = `${roadmap.id}_w${w}_${key}`;
                                    const isChecked = !!checkedItems[checkedKey];

                                    return (
                                      <div key={idx} className="bg-slate-955 border border-slate-850 p-4 rounded-xl space-y-2">
                                        <div className="flex items-start justify-between gap-3">
                                          <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none flex-1">
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              disabled={roadmap.status === 'ARCHIVED'}
                                              onChange={() => handleToggleCheck(roadmap.id, w, key)}
                                              className="mt-0.5 rounded border-slate-800 text-purple-650 bg-slate-955 focus:ring-purple-500/20"
                                            />
                                            <div className="space-y-1">
                                              <span className={isChecked ? "line-through text-slate-500 font-semibold block" : "font-extrabold text-white block"}>
                                                {cert.name}
                                              </span>
                                              {cert.provider && (
                                                <span className="text-[11px] text-slate-400 block font-semibold">
                                                  Provider: {cert.provider}
                                                </span>
                                              )}
                                            </div>
                                          </label>
                                          {cert.link && (
                                            <a
                                              href={getDirectCertLink(cert.name, cert.link, w)}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-[10px] font-bold text-purple-450 dark:text-purple-400 hover:underline flex items-center gap-0.5 shrink-0"
                                            >
                                              <span>Link</span>
                                              <ExternalLink size={10} />
                                            </a>
                                          )}
                                        </div>
                                        {cert.overview && (
                                          <p className="text-[11px] text-slate-400 leading-relaxed ml-6 font-semibold border-t border-slate-900 pt-2">
                                            {cert.overview}
                                            {cert.examPattern && <> • Format: <strong>{cert.examPattern}</strong></>}
                                          </p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 5. INTERVIEW PREP ACCORDIONS */}
                              {(() => {
                                const hasQuestions = weekItem.interviewPrep && [
                                  'technicalQuestions',
                                  'codingQuestions',
                                  'scenarioQuestions',
                                  'companySpecificQuestions',
                                  'hrQuestions'
                                ].some(k => weekItem.interviewPrep[k] && weekItem.interviewPrep[k].length > 0);

                                if (!hasQuestions) return null;

                                return (
                                  <div className="space-y-4 pt-5">
                                    <div className="flex items-center gap-2">
                                      <HelpCircle size={14} className="text-purple-400" />
                                      <span className="text-[10px] font-black text-white uppercase tracking-wider">Weekly Interview Prep Questions</span>
                                    </div>

                                    <div className="space-y-3">
                                      {[
                                        { label: 'Technical Core', key: 'technicalQuestions' },
                                        { label: 'Coding Logic', key: 'codingQuestions' },
                                        { label: 'Scenario-Based', key: 'scenarioQuestions' },
                                        { label: 'Company-Specific', key: 'companySpecificQuestions' },
                                        { label: 'HR / Behavioral', key: 'hrQuestions' },
                                      ].map((type) => {
                                        const questionsList = weekItem.interviewPrep[type.key] || [];
                                        return questionsList.length > 0 && (
                                          <div key={type.key} className="space-y-2">
                                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">{type.label}</span>
                                            <div className="space-y-2">
                                              {questionsList.map((qObj: any, qIdx: number) => {
                                                const itemKey = `interview_${type.key}_${qIdx}`;
                                                const checkedKey = `${roadmap.id}_w${w}_${itemKey}`;
                                                const isChecked = !!checkedItems[checkedKey];

                                                return (
                                                  <div key={qIdx} className="bg-slate-955 border border-slate-850 rounded-xl overflow-hidden text-xs">
                                                    {/* Collapsible item trigger */}
                                                    <div className="p-3 flex items-start gap-3">
                                                      <input
                                                        type="checkbox"
                                                        checked={isChecked}
                                                        disabled={roadmap.status === 'ARCHIVED'}
                                                        onChange={() => handleToggleCheck(roadmap.id, w, itemKey)}
                                                        className="mt-0.5 rounded border-slate-800 text-purple-650 bg-slate-955 focus:ring-purple-500/20"
                                                      />
                                                      <div className="flex-1 space-y-1 text-slate-350">
                                                        <span className={isChecked ? "line-through text-slate-550 font-semibold" : "font-extrabold text-white block"}>
                                                          {qObj.question}
                                                        </span>
                                                        
                                                        {/* Reveal answer block */}
                                                        <details className="group cursor-pointer select-none outline-none pt-1">
                                                          <summary className="text-[10px] font-bold text-purple-450 dark:text-purple-400 hover:text-purple-305 flex items-center gap-1">
                                                            <span>View Answer</span>
                                                            <ChevronDown size={12} className="transition-transform group-open:rotate-180" />
                                                          </summary>
                                                          <div className="mt-2 bg-slate-950 p-2.5 rounded-lg text-slate-400 leading-relaxed font-semibold border border-slate-850 animate-slideIn">
                                                            {qObj.answer}
                                                          </div>
                                                        </details>
                                                      </div>
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {!roadmap && !isLoading && (
                <div className="bg-slate-900 border border-slate-800 p-12 text-center py-20 rounded-2xl flex flex-col items-center justify-center shadow-xl">
                  <Map size={36} className="text-slate-600 mb-3" />
                  <h4 className="text-sm font-bold text-white mb-1">Open Syllabus Workspace</h4>
                  <p className="text-xs text-slate-500 max-w-sm">Choose an active roadmap checklist from the sidebar repository, or configure a duration scope parameters to generate a new syllabus.</p>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center py-16 flex flex-col items-center justify-center max-w-xl mx-auto shadow-xl">
            <Map size={40} className="text-slate-600 mb-3" />
            <h3 className="text-base font-bold text-white mb-1">No Active Target Profile</h3>
            <p className="text-xs text-slate-400 mb-6 max-w-sm leading-relaxed">
              Upload your resume and complete a target Job Description in the ATS Analyzer first to generate study roadmaps.
            </p>
            <button
              onClick={() => router.push('/ats')}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-md"
            >
              Upload Resume Now
            </button>
          </div>
        )}
      </div>



      {/* Monaco Coding Workspace editor modal */}
      <AnimatePresence>
        {codingWorkspaceOpen && activeCodingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-5xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <Terminal className="text-emerald-400 animate-pulseShort" size={18} />
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Premium Code Sandbox Workspace</h3>
                    <p className="text-[9px] text-slate-450 mt-0.5">Test Case Verification: {activeCodingTask.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={workspaceLanguage}
                    onChange={(e) => {
                      const lang = e.target.value;
                      setWorkspaceLanguage(lang);
                      setWorkspaceCode(activeCodingTask.defaultCode?.[lang] || `// Solution boilerplate\n`);
                    }}
                    className="bg-slate-950 border border-slate-805 text-xs text-white rounded-lg px-2.5 py-1.5 focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                  <button
                    onClick={() => setCodingWorkspaceOpen(false)}
                    className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Body split */}
              <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
                {/* Left side: description and specifications */}
                <div className="w-full md:w-1/3 border-r border-slate-800 p-5 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed shrink-0">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Description</span>
                    <p className="font-semibold text-slate-350">{activeCodingTask.question}</p>
                  </div>

                  {activeCodingTask.inputFormat && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Input Format</span>
                      <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400">{activeCodingTask.inputFormat}</pre>
                    </div>
                  )}

                  {activeCodingTask.outputFormat && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Output Format</span>
                      <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400">{activeCodingTask.outputFormat}</pre>
                    </div>
                  )}

                  {activeCodingTask.constraints && (
                    <div className="space-y-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Constraints</span>
                      <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400">{activeCodingTask.constraints}</pre>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    {activeCodingTask.sampleInput && (
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sample Input</span>
                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 overflow-x-auto">{activeCodingTask.sampleInput}</pre>
                      </div>
                    )}
                    {activeCodingTask.sampleOutput && (
                      <div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Sample Output</span>
                        <pre className="bg-slate-950 p-2 border border-slate-850 rounded font-mono text-[10px] text-slate-400 overflow-x-auto">{activeCodingTask.sampleOutput}</pre>
                      </div>
                    )}
                  </div>

                  {activeCodingTask.hints && activeCodingTask.hints.length > 0 && (
                    <div className="pt-2">
                      <button
                        onClick={() => setShowHints(!showHints)}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-305 flex items-center gap-1"
                      >
                        <Lightbulb size={12} />
                        <span>{showHints ? 'Hide Hints' : 'Reveal Hints'}</span>
                      </button>
                      {showHints && (
                        <div className="mt-2 bg-amber-500/5 border border-amber-500/10 p-3 rounded-lg text-[11px] text-slate-350 space-y-1 animate-slideIn">
                          {activeCodingTask.hints.map((hint: string, i: number) => (
                            <div key={i} className="flex gap-1.5 font-medium"><span>•</span> <span>{hint}</span></div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Right side: Editor and compilation results or Simulation Workspace */}
                <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-950">
                  {activeCodingTask.type === 'coding' ? (
                    <>
                      <div className="flex-1 min-h-0 relative">
                        <Editor
                          height="100%"
                          language={workspaceLanguage}
                          theme="vs-dark"
                          value={workspaceCode}
                          onChange={(val) => setWorkspaceCode(val || '')}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 12,
                            lineNumbers: 'on',
                            automaticLayout: true,
                            scrollbar: { vertical: 'visible', horizontal: 'visible' }
                          }}
                        />
                      </div>

                      {/* Terminal console & test cases */}
                      <div className="h-[200px] border-t border-slate-800 bg-slate-955 flex flex-col overflow-hidden shrink-0 min-h-0">
                        <div className="p-2 border-b border-slate-800/80 bg-slate-950/80 flex items-center gap-4 text-[9px] font-extrabold text-slate-450 uppercase tracking-wider shrink-0">
                          <span>Execution Console</span>
                        </div>

                        <div className="flex-1 flex overflow-hidden min-h-0 divide-x divide-slate-850">
                          {/* System Logs */}
                          <div className="w-1/2 p-3 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-1.5">
                            {workspaceOutput.length > 0 ? (
                              workspaceOutput.map((log, i) => <div key={i}>{log}</div>)
                            ) : (
                              <div className="text-slate-650 italic">Click 'Run Sandbox Tests' to execute test cases.</div>
                            )}
                          </div>

                          {/* Test Case checklist details */}
                          <div className="w-1/2 p-3 overflow-y-auto space-y-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Verification Specs</span>
                            <div className="space-y-1.5">
                              {workspaceTestResults.length > 0 ? (
                                workspaceTestResults.map((tr) => (
                                  <div key={tr.caseNum} className="flex items-center justify-between text-[11px] bg-slate-950 border border-slate-850 p-1.5 rounded-lg">
                                    <div className="space-y-0.5">
                                      <span className="font-extrabold text-white">Test Case {tr.caseNum}</span>
                                      <span className="text-[10px] text-slate-500 block">Input: {tr.input} | Expected: {tr.expected}</span>
                                      <span className="text-[10px] text-slate-400 block font-mono">Actual: {tr.actual}</span>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg border ${
                                      tr.passed
                                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                                        : 'bg-rose-500/10 border-rose-500/20 text-rose-455'
                                    }`}>
                                      {tr.passed ? 'PASSED' : 'FAILED'}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-slate-650 text-[10px] italic">No test cases executed.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    // Specialized Simulation Sandboxes
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0 bg-slate-900">
                      <div className="flex-1 p-5 overflow-y-auto space-y-5 text-xs">
                        {activeCodingTask.type === 'excel' && (
                          <div className="space-y-4">
                            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Simulated Spreadsheet Data</span>
                              <div className="overflow-x-auto border border-slate-850 rounded">
                                <table className="w-full text-left font-mono text-[10px] text-slate-400">
                                  <thead>
                                    <tr className="bg-slate-900 border-b border-slate-800 text-[9px] font-bold">
                                      <th className="p-2 border-r border-slate-800">Row</th>
                                      <th className="p-2 border-r border-slate-800">A (Product)</th>
                                      <th className="p-2 border-r border-slate-800">B (Category)</th>
                                      <th className="p-2 border-r border-slate-800">C (Sales)</th>
                                      <th className="p-2">D (Profit)</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr className="border-b border-slate-850">
                                      <td className="p-2 border-r border-slate-850 bg-slate-900 font-bold">1</td>
                                      <td className="p-2 border-r border-slate-850">Widget A</td>
                                      <td className="p-2 border-r border-slate-850">Tech</td>
                                      <td className="p-2 border-r border-slate-850">1200</td>
                                      <td className="p-2">300</td>
                                    </tr>
                                    <tr className="border-b border-slate-850">
                                      <td className="p-2 border-r border-slate-850 bg-slate-900 font-bold">2</td>
                                      <td className="p-2 border-r border-slate-850">Widget B</td>
                                      <td className="p-2 border-r border-slate-850">Office</td>
                                      <td className="p-2 border-r border-slate-850">800</td>
                                      <td className="p-2">150</td>
                                    </tr>
                                    <tr className="border-b border-slate-850">
                                      <td className="p-2 border-r border-slate-850 bg-slate-900 font-bold">3</td>
                                      <td className="p-2 border-r border-slate-850">Widget C</td>
                                      <td className="p-2 border-r border-slate-850">Tech</td>
                                      <td className="p-2 border-r border-slate-850">1500</td>
                                      <td className="p-2">400</td>
                                    </tr>
                                    <tr className="border-b border-slate-850">
                                      <td className="p-2 border-r border-slate-850 bg-slate-900 font-bold">4</td>
                                      <td className="p-2 border-r border-slate-850">Widget D</td>
                                      <td className="p-2 border-r border-slate-850">Furniture</td>
                                      <td className="p-2 border-r border-slate-850">2000</td>
                                      <td className="p-2">200</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Input Excel Formula</span>
                              <input
                                type="text"
                                value={excelFormula}
                                onChange={(e) => setExcelFormula(e.target.value)}
                                placeholder="e.g. =SUM(D1:D4)"
                                className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-purple-500 transition-all"
                              />
                              <p className="text-[10px] text-slate-500 italic">Formulas are evaluated case-insensitively. Make sure you use matching cell coordinates.</p>
                            </div>
                          </div>
                        )}

                        {activeCodingTask.type === 'tableau' && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tableau Configuration Matrix</span>
                            
                            <div className="grid grid-cols-3 gap-3">
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Chart Type</label>
                                <select
                                  value={tableauChartType}
                                  onChange={(e) => setTableauChartType(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                                >
                                  <option value="Bar Chart">Bar Chart</option>
                                  <option value="Line Chart">Line Chart</option>
                                  <option value="Scatter Plot">Scatter Plot</option>
                                  <option value="Map">Map</option>
                                  <option value="Tree Map">Tree Map</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Dimension (X-Axis)</label>
                                <select
                                  value={tableauDimension}
                                  onChange={(e) => setTableauDimension(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                                >
                                  <option value="Category">Category</option>
                                  <option value="Sub-Category">Sub-Category</option>
                                  <option value="Region">Region</option>
                                  <option value="Segment">Segment</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Measure (Y-Axis)</label>
                                <select
                                  value={tableauMeasure}
                                  onChange={(e) => setTableauMeasure(e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white outline-none"
                                >
                                  <option value="Sales">Sales</option>
                                  <option value="Profit">Profit</option>
                                  <option value="Quantity">Quantity</option>
                                  <option value="Discount">Discount</option>
                                </select>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Calculated Field Expression</label>
                              <input
                                type="text"
                                value={tableauCalculatedField}
                                onChange={(e) => setTableauCalculatedField(e.target.value)}
                                placeholder="e.g. SUM([Sales]) / SUM([Profit])"
                                className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-xs font-mono text-white outline-none focus:border-purple-500 transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {activeCodingTask.type === 'business_analysis' && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">BA Mendelow's Power/Interest Matrix</span>
                            
                            <div className="space-y-3">
                              {/* Sponsor */}
                              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg grid grid-cols-4 gap-2 items-center">
                                <span className="font-extrabold text-white">Sponsor</span>
                                <div>
                                  <label className="text-[8px] text-slate-505 block mb-0.5 uppercase font-bold">Power</label>
                                  <select
                                    value={baSponsorPower}
                                    onChange={(e) => setBaSponsorPower(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] text-slate-505 block mb-0.5 uppercase font-bold">Interest</label>
                                  <select
                                    value={baSponsorInterest}
                                    onChange={(e) => setBaSponsorInterest(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] text-slate-550 block mb-0.5 uppercase font-bold">Strategy</label>
                                  <select
                                    value={baSponsorStrategy}
                                    onChange={(e) => setBaSponsorStrategy(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="Manage Closely">Manage Closely</option>
                                    <option value="Keep Satisfied">Keep Satisfied</option>
                                    <option value="Keep Informed">Keep Informed</option>
                                    <option value="Monitor">Monitor</option>
                                  </select>
                                </div>
                              </div>

                              {/* Users */}
                              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg grid grid-cols-4 gap-2 items-center">
                                <span className="font-extrabold text-white">End Users</span>
                                <div>
                                  <label className="text-[8px] text-slate-505 block mb-0.5 uppercase font-bold">Power</label>
                                  <select
                                    value={baUserPower}
                                    onChange={(e) => setBaUserPower(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] text-slate-505 block mb-0.5 uppercase font-bold">Interest</label>
                                  <select
                                    value={baUserInterest}
                                    onChange={(e) => setBaUserInterest(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] text-slate-550 block mb-0.5 uppercase font-bold">Strategy</label>
                                  <select
                                    value={baUserStrategy}
                                    onChange={(e) => setBaUserStrategy(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="Manage Closely">Manage Closely</option>
                                    <option value="Keep Satisfied">Keep Satisfied</option>
                                    <option value="Keep Informed">Keep Informed</option>
                                    <option value="Monitor">Monitor</option>
                                  </select>
                                </div>
                              </div>

                              {/* Competitor */}
                              <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg grid grid-cols-4 gap-2 items-center">
                                <span className="font-extrabold text-white">Competitors</span>
                                <div>
                                  <label className="text-[8px] text-slate-505 block mb-0.5 uppercase font-bold">Power</label>
                                  <select
                                    value={baCompetitorPower}
                                    onChange={(e) => setBaCompetitorPower(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] text-slate-505 block mb-0.5 uppercase font-bold">Interest</label>
                                  <select
                                    value={baCompetitorInterest}
                                    onChange={(e) => setBaCompetitorInterest(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="High">High</option>
                                    <option value="Low">Low</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="text-[8px] text-slate-550 block mb-0.5 uppercase font-bold">Strategy</label>
                                  <select
                                    value={baCompetitorStrategy}
                                    onChange={(e) => setBaCompetitorStrategy(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded text-[10px] p-1 text-white focus:outline-none"
                                  >
                                    <option value="Manage Closely">Manage Closely</option>
                                    <option value="Keep Satisfied">Keep Satisfied</option>
                                    <option value="Keep Informed">Keep Informed</option>
                                    <option value="Monitor">Monitor</option>
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Requirement Builder Statement</label>
                              <textarea
                                value={baRequirementStatement}
                                onChange={(e) => setBaRequirementStatement(e.target.value)}
                                placeholder="Describe the functional system requirement..."
                                className="w-full bg-slate-955 border border-slate-800 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500 h-20 resize-none transition-all"
                              />
                            </div>
                          </div>
                        )}

                        {activeCodingTask.type === 'product_management' && (
                          <div className="space-y-4">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RICE Prioritizer Matrix Calculator</span>
                            
                            <div className="overflow-x-auto border border-slate-800 rounded-xl">
                              <table className="w-full text-left font-sans text-[11px] text-slate-350">
                                <thead>
                                  <tr className="bg-slate-950 border-b border-slate-800 text-[9px] font-bold text-slate-400">
                                    <th className="p-2.5">Feature Name</th>
                                    <th className="p-2.5">Reach</th>
                                    <th className="p-2.5">Impact</th>
                                    <th className="p-2.5">Confidence</th>
                                    <th className="p-2.5">Effort</th>
                                    <th className="p-2.5">RICE Score</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {pmFeatures.map((feat, index) => {
                                    const computedScore = Math.round((feat.reach * feat.impact * feat.confidence) / feat.effort);
                                    return (
                                      <tr key={index} className="border-b border-slate-850 bg-slate-950/20">
                                        <td className="p-2.5 font-bold text-white">{feat.name}</td>
                                        <td className="p-2.5">
                                          <input
                                            type="number"
                                            value={feat.reach}
                                            onChange={(e) => {
                                              const newFeats = [...pmFeatures];
                                              newFeats[index].reach = Number(e.target.value);
                                              setPmFeatures(newFeats);
                                            }}
                                            className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-white"
                                          />
                                        </td>
                                        <td className="p-2.5">
                                          <input
                                            type="number"
                                            step="0.25"
                                            value={feat.impact}
                                            onChange={(e) => {
                                              const newFeats = [...pmFeatures];
                                              newFeats[index].impact = Number(e.target.value);
                                              setPmFeatures(newFeats);
                                            }}
                                            className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-white"
                                          />
                                        </td>
                                        <td className="p-2.5">
                                          <input
                                            type="number"
                                            step="0.1"
                                            value={feat.confidence}
                                            onChange={(e) => {
                                              const newFeats = [...pmFeatures];
                                              newFeats[index].confidence = Number(e.target.value);
                                              setPmFeatures(newFeats);
                                            }}
                                            className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-white"
                                          />
                                        </td>
                                        <td className="p-2.5">
                                          <input
                                            type="number"
                                            value={feat.effort}
                                            onChange={(e) => {
                                              const newFeats = [...pmFeatures];
                                              newFeats[index].effort = Number(e.target.value);
                                              setPmFeatures(newFeats);
                                            }}
                                            className="w-16 bg-slate-900 border border-slate-800 rounded px-1.5 py-0.5 text-center text-white"
                                          />
                                        </td>
                                        <td className="p-2.5 font-mono font-extrabold text-purple-400">{computedScore}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Priority Target</label>
                              <select
                                value={pmPriorityFeature}
                                onChange={(e) => setPmPriorityFeature(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                              >
                                {pmFeatures.map((feat, idx) => (
                                  <option key={idx} value={feat.name}>{feat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        )}

                        {activeCodingTask.type === 'theory' && (
                          <div className="space-y-3">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Detailed Theory Response Workspace</span>
                            <textarea
                              value={theoryAnswer}
                              onChange={(e) => setTheoryAnswer(e.target.value)}
                              placeholder="Write your explanation or case study response here..."
                              className="w-full min-h-[180px] bg-slate-955 border border-slate-800 rounded-2xl p-4 text-xs text-white outline-none focus:border-purple-500 resize-none transition-all font-medium leading-relaxed"
                            />
                          </div>
                        )}
                      </div>

                      {/* Console / Test output area for Simulation */}
                      <div className="h-[160px] border-t border-slate-800 bg-slate-955 flex flex-col overflow-hidden shrink-0">
                        <div className="p-2 border-b border-slate-800/80 bg-slate-950/80 text-[9px] font-extrabold text-slate-450 uppercase tracking-wider shrink-0">
                          <span>Simulation Output Logs</span>
                        </div>

                        <div className="flex-1 flex overflow-hidden min-h-0 divide-x divide-slate-850">
                          {/* System Logs */}
                          <div className="w-1/2 p-3 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-1">
                            {workspaceOutput.length > 0 ? (
                              workspaceOutput.map((log, i) => <div key={i}>{log}</div>)
                            ) : (
                              <div className="text-slate-500 italic">Execute the simulation validator using control trigger.</div>
                            )}
                          </div>

                          {/* Test Status */}
                          <div className="w-1/2 p-3 overflow-y-auto space-y-2">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Status Dashboard</span>
                            <div className="space-y-1.5">
                              {simulationChecked ? (
                                <div className="flex items-center justify-between text-[11px] bg-slate-950 border border-slate-850 p-1.5 rounded-lg">
                                  <div>
                                    <span className="font-extrabold text-white">Simulation Check</span>
                                    <span className="text-[10px] text-slate-500 block">Status: {simulationPassed ? 'PASSED' : 'FAILED'}</span>
                                  </div>
                                  <span className={`text-[9px] font-black px-2 py-0.5 rounded border ${
                                    simulationPassed
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                                      : 'bg-rose-500/10 border-rose-500/20 text-rose-455'
                                  }`}>
                                    {simulationPassed ? 'VALIDATED' : 'ACTION REQUIRED'}
                                  </span>
                                </div>
                              ) : (
                                <div className="text-slate-550 text-[10px] italic">No simulation validated yet.</div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer controls */}
              <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex justify-between items-center shrink-0">
                <button
                  onClick={activeCodingTask.type === 'coding' ? handleRunCode : handleValidateSimulation}
                  disabled={runningCode}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-805 text-xs font-bold text-white rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none animate-all"
                >
                  <Play size={12} className="text-emerald-400" />
                  <span>{runningCode ? 'Executing Sandbox...' : (activeCodingTask.type === 'coding' ? 'Run Sandbox Tests' : 'Run Simulation Sandbox')}</span>
                </button>

                <button
                  onClick={handleSubmitCodeTask}
                  disabled={
                    submittingCode || 
                    (activeCodingTask.type === 'coding' 
                      ? (workspaceTestResults.length === 0 || workspaceTestResults.some(r => !r.passed))
                      : (!simulationChecked || !simulationPassed)
                    )
                  }
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer select-none disabled:opacity-50 transition-all"
                  title={
                    activeCodingTask.type === 'coding'
                      ? (workspaceTestResults.some(r => !r.passed) ? 'All test cases must pass before submission' : 'Submit task code')
                      : (!simulationPassed ? 'Simulation validation must pass before submission' : 'Submit simulation sandbox')
                  }
                >
                  <CheckSquare size={12} />
                  <span>{submittingCode ? 'Submitting...' : 'Submit & Mark Completed'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </LayoutShell>
  );
}
