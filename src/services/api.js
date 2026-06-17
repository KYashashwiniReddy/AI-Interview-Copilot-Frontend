/**
 * AI Interview Copilot — Unified API Service Layer
 * All backend operations are centralized here.
 * Mock data schemas mirror RAG/LLM API outputs.
 */

// ─── Latency simulation flag (set false for instant responses) ───
const SIMULATE_LATENCY = true;
const LATENCY_MS = { min: 600, max: 1400 };

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const simulateLatency = async () => {
  if (!SIMULATE_LATENCY) return;
  const ms =
    Math.random() * (LATENCY_MS.max - LATENCY_MS.min) + LATENCY_MS.min;
  await delay(ms);
};

// ─── Mock Database Schemas ───────────────────────────────────────

const MOCK_DASHBOARD = {
  user: {
    name: "Kya Shashwini Reddy",
    avatar: null,
    role: "Senior Frontend Engineer",
    targetRole: "Staff Software Engineer @ Google",
  },
  readinessScore: 78,
  atsScoreAggregate: 82,
  interviewsCompleted: 14,
  skillGapsClosed: 7,
  recentActivity: [
    {
      id: 1,
      type: "ats_scan",
      label: "ATS Scan: Google SWE Resume",
      score: 84,
      ts: "2026-06-17T03:10:00Z",
      delta: +4,
    },
    {
      id: 2,
      type: "mock_interview",
      label: "Mock Interview: System Design",
      score: 72,
      ts: "2026-06-16T21:00:00Z",
      delta: +8,
    },
    {
      id: 3,
      type: "skill_gap",
      label: "Skill Gap: ML Fundamentals",
      score: null,
      ts: "2026-06-16T18:30:00Z",
      delta: null,
    },
    {
      id: 4,
      type: "ats_scan",
      label: "ATS Scan: Meta E6 Resume",
      score: 79,
      ts: "2026-06-15T14:45:00Z",
      delta: -2,
    },
    {
      id: 5,
      type: "feedback_report",
      label: "Feedback Report: Behavioral Round",
      score: 88,
      ts: "2026-06-14T11:20:00Z",
      delta: +12,
    },
  ],
  diagnostics: {
    communication: 85,
    technical: 72,
    problemSolving: 79,
    cultural: 91,
    atsOptimization: 82,
  },
  weeklyProgress: [
    { day: "Mon", score: 62 },
    { day: "Tue", score: 68 },
    { day: "Wed", score: 71 },
    { day: "Thu", score: 74 },
    { day: "Fri", score: 78 },
    { day: "Sat", score: 76 },
    { day: "Sun", score: 80 },
  ],
};

const MOCK_ATS_RESULT = {
  scanId: "ats-2026-061703",
  fileName: "KyaShashwini_Resume_v4.pdf",
  overallScore: 84,
  dimensions: [
    {
      key: "formatting",
      label: "Formatting & Structure",
      score: 91,
      notes: "Clean single-column layout, consistent heading hierarchy detected.",
    },
    {
      key: "keywords",
      label: "Keyword Matching",
      score: 78,
      notes: "17 of 22 JD keywords matched. Missing: Terraform, K8s, gRPC.",
    },
    {
      key: "impact",
      label: "Impact & Metrics",
      score: 83,
      notes: "8 quantified achievements found. Recommend adding 2–3 more.",
    },
    {
      key: "length",
      label: "Length & Density",
      score: 95,
      notes: "Optimal 1-page format for 6 YOE.",
    },
    {
      key: "readability",
      label: "ATS Readability",
      score: 88,
      notes: "No tables or graphics detected. Machine-parseable.",
    },
  ],
  missingKeywords: [
    { word: "Terraform", priority: "high" },
    { word: "Kubernetes", priority: "high" },
    { word: "gRPC", priority: "medium" },
    { word: "Protocol Buffers", priority: "medium" },
    { word: "OpenTelemetry", priority: "low" },
    { word: "FinOps", priority: "low" },
    { word: "Canary Deployments", priority: "medium" },
    { word: "SLO/SLA", priority: "high" },
  ],
  suggestions: [
    "Add a 'Core Competencies' section listing cloud-native keywords.",
    "Include SLO compliance metric from your observability project.",
    "Replace 'worked on' with action verbs: architected, orchestrated, owned.",
  ],
};

const MOCK_SKILL_GAP = {
  targetRole: "Staff Software Engineer @ Google",
  analysisDate: "2026-06-17",
  skills: [
    {
      id: 1,
      name: "System Design (Distributed)",
      required: 90,
      current: 72,
      status: "intermediate",
      category: "Technical",
      resources: [
        { type: "course", label: "System Design Interview – Grokking", url: "#" },
        { type: "project", label: "Build a URL shortener with sharding", url: "#" },
      ],
    },
    {
      id: 2,
      name: "Go / Golang",
      required: 80,
      current: 45,
      status: "critical",
      category: "Technical",
      resources: [
        { type: "course", label: "Learn Go with Tests", url: "#" },
        { type: "project", label: "Port a Node.js microservice to Go", url: "#" },
      ],
    },
    {
      id: 3,
      name: "Kubernetes & Container Orchestration",
      required: 75,
      current: 38,
      status: "critical",
      category: "DevOps",
      resources: [
        { type: "course", label: "KodeKloud CKA Prep", url: "#" },
        { type: "project", label: "Deploy a full-stack app to K8s", url: "#" },
      ],
    },
    {
      id: 4,
      name: "React & Frontend Architecture",
      required: 85,
      current: 92,
      status: "mastered",
      category: "Technical",
      resources: [],
    },
    {
      id: 5,
      name: "Data Structures & Algorithms",
      required: 95,
      current: 78,
      status: "intermediate",
      category: "Core CS",
      resources: [
        { type: "course", label: "LeetCode Top 150 Interview Questions", url: "#" },
        { type: "project", label: "Solve 2 hard problems per week", url: "#" },
      ],
    },
    {
      id: 6,
      name: "Machine Learning Fundamentals",
      required: 60,
      current: 30,
      status: "critical",
      category: "Emerging",
      resources: [
        { type: "course", label: "fast.ai Practical Deep Learning", url: "#" },
        { type: "project", label: "Fine-tune a small LLM for classification", url: "#" },
      ],
    },
    {
      id: 7,
      name: "Leadership & Mentorship",
      required: 80,
      current: 85,
      status: "mastered",
      category: "Soft Skills",
      resources: [],
    },
    {
      id: 8,
      name: "Technical Communication",
      required: 90,
      current: 75,
      status: "intermediate",
      category: "Soft Skills",
      resources: [
        { type: "course", label: "Writing for Engineers – LFD103", url: "#" },
        { type: "project", label: "Write a technical design document (TDD)", url: "#" },
      ],
    },
  ],
};

const MOCK_INTERVIEW_SESSION = {
  sessionId: "sess-20260617-001",
  targetJD: {
    company: "Google",
    role: "Staff Software Engineer, Platforms",
    level: "L7",
    focus: ["Distributed Systems", "API Design", "Technical Leadership"],
    description:
      "You'll be leading architecture decisions for Google's internal developer platform serving 40,000+ engineers across 200+ microservices...",
  },
  questions: [
    {
      id: 1,
      type: "system_design",
      question:
        "Design a globally distributed rate-limiting service that can handle 10 million requests per second with sub-5ms latency. Walk me through your architecture decisions.",
    },
    {
      id: 2,
      type: "behavioral",
      question:
        "Tell me about a time you had to make a critical architectural decision under significant time pressure. What was your process, and what was the outcome?",
    },
    {
      id: 3,
      type: "technical",
      question:
        "You're debugging a production incident where a microservice is experiencing 40% error rates intermittently. How do you approach the investigation?",
    },
  ],
  currentQuestion: 1,
};

const MOCK_FEEDBACK_REPORT = {
  reportId: "rpt-20260617-001",
  sessionDate: "2026-06-17",
  overallScore: 81,
  percentile: 89,
  roundType: "System Design",
  targetRole: "Staff SWE @ Google L7",
  softSkills: [
    { skill: "Clarity of Communication", score: 87, delta: +5 },
    { skill: "Structured Thinking", score: 82, delta: +8 },
    { skill: "Confidence & Presence", score: 76, delta: -2 },
    { skill: "Active Listening", score: 91, delta: +3 },
    { skill: "Conciseness", score: 74, delta: +11 },
  ],
  toneAnalysis: {
    positive: 42,
    neutral: 38,
    filler: 12,
    negative: 8,
    topFillerWords: ["um", "like", "basically", "you know"],
    sentiment: "Predominantly confident with occasional hedging language.",
  },
  qaReviews: [
    {
      id: 1,
      question:
        "Design a globally distributed rate-limiting service that can handle 10M RPS with sub-5ms latency.",
      candidateAnswer:
        "I'd start with a token bucket algorithm at the edge using Redis for shared state. We'd deploy Redis clusters in each region with eventual consistency between them using a gossip protocol. The API gateway would check local Redis first, then fall back to a central coordinator. For sub-5ms latency, I'd keep hot counters in memory with periodic flushes...",
      aiScore: 78,
      feedback:
        "Good foundational approach. However, you didn't address the CAP theorem trade-offs explicitly. The interviewer was probing your awareness of consistency vs availability in a rate-limiting context.",
      perfectResponse:
        "I'd design this as a multi-tier distributed token bucket system. At the edge layer, each PoP maintains in-memory local counters using a sliding window algorithm (more accurate than fixed windows under bursts). These are backed by regional Redis clusters for persistence, with async replication between regions using CRDT counters — specifically, a G-counter CRDT gives us strong eventual consistency without coordination overhead. For the 5ms SLA: local in-memory check is O(1) at ~0.1ms, regional Redis roundtrip adds ~1–2ms within the same AZ. I'd explicitly favor availability over strict consistency here per the CAP theorem — a brief over-allowance of 1–2% traffic during a network partition is preferable to blocking 100% of requests. At L7, I'd also discuss the implications for single-tenant vs multi-tenant scenarios and whether you need per-user, per-IP, or per-service-key granularity...",
    },
    {
      id: 2,
      question:
        "Tell me about a time you had to make a critical architectural decision under significant time pressure.",
      candidateAnswer:
        "During a Black Friday incident, our payment service went down 2 hours before peak. I had to decide between a quick cache-only fallback or a full DB failover. I chose the cache fallback, communicated the risk to leadership, and we maintained 95% uptime. Post-incident, I led the design of a proper active-active setup to prevent recurrence.",
      aiScore: 91,
      feedback:
        "Excellent STAR format. You demonstrated ownership, risk communication, and follow-through. The post-incident ownership especially signals Staff-level thinking. Perfect response.",
      perfectResponse:
        "Your answer was already near-ideal. For a Staff-level bar, consider explicitly quantifying the business impact avoided (e.g., '$2M revenue at risk'), and mention how you coordinated with cross-functional teams like SRE and Product simultaneously. You could also close with the structural change you drove org-wide from this experience.",
    },
  ],
  improvementPlan: [
    "Practice explicitly naming trade-offs (CAP, ACID vs BASE) before diving into solutions.",
    "Reduce filler word frequency — target under 5% in next session.",
    "Add quantified business impact to STAR stories.",
  ],
};

// ─── API Service Methods ─────────────────────────────────────────

export const ApiService = {
  async getDashboard() {
    await simulateLatency();
    return { success: true, data: MOCK_DASHBOARD };
  },

  async analyzeResume(file) {
    // Simulate a longer processing time for file analysis
    await delay(2200);
    return {
      success: true,
      data: {
        ...MOCK_ATS_RESULT,
        fileName: file?.name || MOCK_ATS_RESULT.fileName,
        scanId: `ats-${Date.now()}`,
      },
    };
  },

  async getSkillGapAnalysis() {
    await simulateLatency();
    return { success: true, data: MOCK_SKILL_GAP };
  },

  async startInterviewSession(config = {}) {
    await simulateLatency();
    return {
      success: true,
      data: { ...MOCK_INTERVIEW_SESSION, ...config },
    };
  },

  async getFeedbackReport(sessionId) {
    await simulateLatency();
    return {
      success: true,
      data: { ...MOCK_FEEDBACK_REPORT, reportId: sessionId || MOCK_FEEDBACK_REPORT.reportId },
    };
  },

  // Streams AI tokens word-by-word via callback
  async streamInterviewerQuestion(questionText, onToken, onComplete) {
    const words = questionText.split(" ");
    for (let i = 0; i < words.length; i++) {
      await delay(60 + Math.random() * 80);
      onToken(words[i] + (i < words.length - 1 ? " " : ""));
    }
    onComplete?.();
  },
};

export default ApiService;
