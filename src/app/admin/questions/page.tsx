'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { adminApi } from '../../../lib/api';
import { 
  Search, Plus, Trash2, Edit3, RefreshCw, SlidersHorizontal, 
  AlertCircle, CheckCircle2, Sparkles, X, Eye, BookOpen, Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PREDEFINED_ROLES = [
  "Software Engineer",
  "Frontend Developer",
  "Backend Developer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "AI Engineer",
  "Data Scientist",
  "Data Analyst",
  "Cloud Engineer",
  "DevOps Engineer",
  "QA Engineer",
  "Product Manager",
  "UI/UX Designer"
];

const PREDEFINED_COMPANIES = [
  "Google", "Microsoft", "Meta", "Amazon", "Apple", "Netflix", 
  "Uber", "Airbnb", "Stripe", "Salesforce", "Spotify", "Oracle", "IBM"
];

const CATEGORIES = [
  "TECHNICAL", "HR", "BEHAVIORAL", "SYSTEM_DESIGN", "CODING", "PROBLEM_SOLVING", "DOMAIN_SPECIFIC"
];

export default function AdminQuestionsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Questions state
  const [questions, setQuestions] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters state
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [category, setCategory] = useState('');

  // Single Question Modals (Create/Edit)
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  // Single Question Form State
  const [formText, setFormText] = useState('');
  const [formCategory, setFormCategory] = useState('TECHNICAL');
  const [formRole, setFormRole] = useState('');
  const [formDifficulty, setFormDifficulty] = useState('MEDIUM');
  const [formExpectedAnswer, setFormExpectedAnswer] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formHints, setFormHints] = useState('');
  const [formEvaluationCriteria, setFormEvaluationCriteria] = useState('');

  // AI Generator Modal
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiRole, setAiRole] = useState('');
  const [aiCompany, setAiCompany] = useState('');
  const [aiDifficulty, setAiDifficulty] = useState('MEDIUM');
  const [aiType, setAiType] = useState('TECHNICAL');
  const [aiCount, setAiCount] = useState(5);
  const [aiSkills, setAiSkills] = useState('');
  const [aiQuestionType, setAiQuestionType] = useState('Conceptual');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // AI Preview State
  const [previewQuestions, setPreviewQuestions] = useState<any[]>([]);
  const [selectedPreviewIndices, setSelectedPreviewIndices] = useState<Set<number>>(new Set());
  const [editingPreviewIndex, setEditingPreviewIndex] = useState<number | null>(null);

  // Load questions on mount and filter changes
  useEffect(() => {
    fetchQuestions();
  }, [search, role, company, difficulty, category]);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const params: any = {};
      if (search) params.search = search;
      if (role) params.role = role;
      if (company) params.company = company;
      if (difficulty) params.difficulty = difficulty;
      if (category) params.category = category;

      const data = await adminApi.getQuestions(params);
      setQuestions(data.questions || []);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingQuestion(null);
    setFormText('');
    setFormCategory('TECHNICAL');
    setFormRole('');
    setFormDifficulty('MEDIUM');
    setFormExpectedAnswer('');
    setFormCompany('');
    setFormTags('');
    setFormHints('');
    setFormEvaluationCriteria('');
    setShowSingleModal(true);
  };

  const handleOpenEditModal = (q: any) => {
    setEditingQuestion(q);
    setFormText(q.questionText || '');
    setFormCategory(q.category || 'TECHNICAL');
    setFormRole(q.role || '');
    setFormDifficulty(q.difficulty || 'MEDIUM');
    setFormExpectedAnswer(q.expectedAnswer || '');
    setFormCompany(q.company || '');
    
    // Parse tags list
    let tagsStr = '';
    if (q.tags) {
      try {
        const parsed = JSON.parse(q.tags);
        if (Array.isArray(parsed)) tagsStr = parsed.join(', ');
      } catch {
        tagsStr = q.tags;
      }
    }
    setFormTags(tagsStr);
    setFormHints(q.hints || '');
    setFormEvaluationCriteria(q.evaluationCriteria || '');
    setShowSingleModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await adminApi.deleteQuestion(id);
      showSuccessMessage('Question deleted successfully.');
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to delete question.');
    }
  };

  const handleSaveSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Format tags
    const tagsArr = formTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const payload = {
      questionText: formText,
      category: formCategory,
      role: formRole,
      difficulty: formDifficulty,
      expectedAnswer: formExpectedAnswer,
      company: formCompany || null,
      tags: JSON.stringify(tagsArr),
      hints: formHints || null,
      evaluationCriteria: formEvaluationCriteria || null
    };

    try {
      if (editingQuestion) {
        await adminApi.editQuestion(editingQuestion.id, payload);
        showSuccessMessage('Question updated successfully.');
      } else {
        await adminApi.addQuestion(payload);
        showSuccessMessage('Question created successfully.');
      }
      setShowSingleModal(false);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to save question.');
    }
  };

  const handleAIGenerate = async () => {
    setError('');
    if (!aiRole || !aiType || !aiDifficulty || !aiSkills || !aiCount || !aiQuestionType) {
      setError('Please complete all required fields before generating questions.');
      return;
    }
    
    setIsGenerating(true);
    setPreviewQuestions([]);
    setSelectedPreviewIndices(new Set());
    
    try {
      const data = await adminApi.aiGenerateQuestions({
        role: aiRole,
        company: aiCompany || 'General',
        difficulty: aiDifficulty,
        category: aiType,
        skills: aiSkills,
        count: aiCount,
        questionType: aiQuestionType
      });
      
      const qList = data.questions || [];
      setPreviewQuestions(qList);
      
      // Auto-select all by default
      const defaultSet = new Set<number>();
      qList.forEach((_: any, idx: number) => defaultSet.add(idx));
      setSelectedPreviewIndices(defaultSet);
    } catch (err: any) {
      setError(err.message || 'AI generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePreviewSelect = (idx: number) => {
    setSelectedPreviewIndices((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  };

  const handleRemovePreviewItem = (idx: number) => {
    setPreviewQuestions((prev) => prev.filter((_, i) => i !== idx));
    setSelectedPreviewIndices((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < idx) next.add(i);
        if (i > idx) next.add(i - 1);
      });
      return next;
    });
  };

  const handleBulkSave = async () => {
    const selected = previewQuestions.filter((_, idx) => selectedPreviewIndices.has(idx));
    if (selected.length === 0) {
      alert('No questions selected for saving.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const res = await adminApi.bulkSaveQuestions(selected);
      const savedCount = res.count !== undefined ? res.count : selected.length;
      const skippedCount = res.skipped !== undefined ? res.skipped : 0;
      
      showSuccessMessage(`${savedCount} new questions added. ${skippedCount} duplicates skipped.`);
      setShowAiModal(false);
      setPreviewQuestions([]);
      fetchQuestions();
    } catch (err: any) {
      setError(err.message || 'Failed to bulk save questions.');
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-2xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Question Bank</h1>
          <p className="text-slate-500 text-xs">Manage mock interview questions, filter by role/company, or bulk generate questions using AI.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAiModal(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition select-none shadow-md shadow-purple-600/20"
          >
            <Sparkles size={14} />
            <span>AI Bulk Generator</span>
          </button>
          <button
            onClick={handleOpenAddModal}
            className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer transition select-none border ${
              isDark ? 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-white' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <Plus size={14} />
            <span>Manual Add</span>
          </button>
        </div>
      </div>

      {success && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 size={16} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-950/40 border border-rose-900/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Filters Section */}
      <div className={`p-4 rounded-2xl border ${isDark ? 'bg-[#111111] border-[#2A2A2A]' : 'bg-slate-50 border-slate-200'} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3`}>
        <div className="relative col-span-1 md:col-span-1">
          <Search size={14} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-4 py-2 border rounded-xl text-xs outline-none transition ${
              isDark ? 'bg-[#000000] border-slate-800 focus:border-purple-500 text-white' : 'bg-white border-slate-200 focus:border-purple-500 text-slate-900'
            }`}
          />
        </div>

        <div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer transition ${
              isDark ? 'bg-[#000000] border-slate-800 text-slate-300 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-700 focus:border-purple-500'
            }`}
          >
            <option value="">-- All Roles --</option>
            {PREDEFINED_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <select
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer transition ${
              isDark ? 'bg-[#000000] border-slate-800 text-slate-300 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-700 focus:border-purple-500'
            }`}
          >
            <option value="">-- All Companies --</option>
            {PREDEFINED_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer transition ${
              isDark ? 'bg-[#000000] border-slate-800 text-slate-300 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-700 focus:border-purple-500'
            }`}
          >
            <option value="">-- All Difficulties --</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={`w-full px-3 py-2 border rounded-xl text-xs outline-none cursor-pointer transition ${
              isDark ? 'bg-[#000000] border-slate-800 text-slate-300 focus:border-purple-500' : 'bg-white border-slate-200 text-slate-700 focus:border-purple-500'
            }`}
          >
            <option value="">-- All Categories --</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {/* Main Grid List */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="animate-spin text-purple-600 mb-3" size={28} />
          <span className="text-xs text-slate-500">Loading question bank...</span>
        </div>
      ) : questions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {questions.map((q) => (
            <div
              key={q.id}
              className={`p-5 rounded-2xl border transition duration-300 flex flex-col justify-between space-y-4 ${
                isDark ? 'bg-[#111111] border-[#2A2A2A] hover:border-purple-500/20' : 'bg-white border-slate-200 hover:border-purple-500/20'
              }`}
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded tracking-wider uppercase ${
                    q.difficulty === 'HARD' ? 'text-rose-450 bg-rose-500/10' :
                    q.difficulty === 'MEDIUM' ? 'text-amber-450 bg-amber-500/10' : 'text-emerald-450 bg-emerald-500/10'
                  }`}>
                    {q.difficulty}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEditModal(q)}
                      className={`p-1.5 rounded-lg border transition ${
                        isDark ? 'hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className={`p-1.5 rounded-lg border transition ${
                        isDark ? 'hover:bg-rose-950/20 border-slate-800 text-rose-400 hover:text-rose-350' : 'hover:bg-rose-50 border-slate-200 text-rose-600 hover:text-rose-700'
                      }`}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <h4 className={`text-xs font-bold leading-relaxed ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {q.questionText}
                </h4>
              </div>

              <div className="border-t border-slate-850/60 pt-3 flex flex-wrap gap-2 items-center justify-between text-[10px]">
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/25 text-purple-400 rounded-md">
                    {q.role}
                  </span>
                  {q.company && (
                    <span className="px-2 py-0.5 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-md">
                      {q.company}
                    </span>
                  )}
                  <span className="px-2 py-0.5 bg-slate-950/80 border border-slate-800 text-slate-400 rounded-md uppercase">
                    {q.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={`p-16 border border-dashed rounded-2xl text-center ${
          isDark ? 'border-slate-800' : 'border-slate-300'
        }`}>
          <BookOpen className="text-slate-500 mx-auto mb-2" size={32} />
          <p className="text-xs text-slate-500">No questions found matching your filter conditions.</p>
        </div>
      )}

      {/* Manual ADD/EDIT Question Modal */}
      {showSingleModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`w-full max-w-2xl rounded-2xl border p-6 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-sm font-extrabold uppercase tracking-wide">
                {editingQuestion ? 'Edit Question Details' : 'Create New Question'}
              </h3>
              <button
                onClick={() => setShowSingleModal(false)}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveSingle} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Question Text</label>
                <textarea
                  required
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  rows={3}
                  placeholder="What is the difference between SQL and NoSQL databases?"
                  className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-650' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Difficulty</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Job Role</label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder="e.g. Backend Developer"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Target Company (Optional)</label>
                  <input
                    type="text"
                    value={formCompany}
                    onChange={(e) => setFormCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Expected Ideal Answer Guide</label>
                <textarea
                  required
                  value={formExpectedAnswer}
                  onChange={(e) => setFormExpectedAnswer(e.target.value)}
                  rows={4}
                  placeholder="Expected points: SQL is relational and uses structured schema, NoSQL is non-relational and scales horizontally..."
                  className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Skills / Tags (Comma separated)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="e.g. SQL, Database, Scaling"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Evaluation Criteria / Keywords</label>
                  <input
                    type="text"
                    value={formEvaluationCriteria}
                    onChange={(e) => setFormEvaluationCriteria(e.target.value)}
                    placeholder="e.g. Horizontal scaling, ACID properties"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1.5">Hints for Candidate (Optional)</label>
                <input
                  type="text"
                  value={formHints}
                  onChange={(e) => setFormHints(e.target.value)}
                  placeholder="Think about schema structure and scaling methods..."
                  className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-800 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowSingleModal(false)}
                  className={`px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition ${
                    isDark ? 'text-slate-400' : 'text-slate-600 hover:bg-slate-105'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition shadow-lg"
                >
                  Save Question
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* AI BULK GENERATOR MODAL */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full max-w-4xl rounded-3xl border p-6 max-h-[90vh] overflow-y-auto ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Sparkles className="text-purple-400" size={18} />
                <h3 className="text-sm font-extrabold uppercase tracking-wide">AI Bulk Question Generator</h3>
              </div>
              <button
                onClick={() => {
                  setShowAiModal(false);
                  setPreviewQuestions([]);
                }}
                className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
              >
                <X size={16} />
              </button>
            </div>

            {error && (
              <div className="p-3 mb-4 bg-rose-955/40 border border-rose-900/40 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Config Box */}
            {previewQuestions.length === 0 && !isGenerating && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Target Job Role</label>
                  <input
                    type="text"
                    required
                    value={aiRole}
                    onChange={(e) => setAiRole(e.target.value)}
                    placeholder="e.g. Machine Learning Engineer"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {PREDEFINED_ROLES.slice(0, 4).map(r => (
                      <span
                        key={r}
                        onClick={() => setAiRole(r)}
                        className={`text-[9px] px-1.5 py-0.5 rounded-md border cursor-pointer ${
                          aiRole === r ? 'bg-purple-600/10 border-purple-500 text-purple-400' : 'bg-slate-950/40 border-slate-850 text-slate-500'
                        }`}
                      >
                        {r}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Skills (Comma separated)</label>
                  <input
                    type="text"
                    required
                    value={aiSkills}
                    onChange={(e) => setAiSkills(e.target.value)}
                    placeholder="e.g. React, JavaScript"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Difficulty Level</label>
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none cursor-pointer ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Category</label>
                  <select
                    value={aiType}
                    onChange={(e) => setAiType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none cursor-pointer ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Question Type</label>
                  <select
                    value={aiQuestionType}
                    onChange={(e) => setAiQuestionType(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-xl outline-none cursor-pointer ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="Conceptual">Conceptual</option>
                    <option value="Coding/Practical">Coding/Practical</option>
                    <option value="Scenario-based">Scenario-based</option>
                    <option value="Mixed">Mixed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Number of Questions</label>
                  <select
                    value={aiCount}
                    onChange={(e) => setAiCount(parseInt(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-xl outline-none cursor-pointer ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value={3}>3 Questions</option>
                    <option value={5}>5 Questions</option>
                    <option value={8}>8 Questions</option>
                    <option value={10}>10 Questions</option>
                    <option value={20}>20 Questions</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1.5">Target Company (Optional)</label>
                  <input
                    type="text"
                    value={aiCompany}
                    onChange={(e) => setAiCompany(e.target.value)}
                    placeholder="e.g. Google"
                    className={`w-full px-3 py-2 border rounded-xl outline-none focus:border-purple-500 ${
                      isDark ? 'bg-slate-955 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-end col-span-1 sm:col-span-2">
                  <button
                    onClick={handleAIGenerate}
                    className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition cursor-pointer flex justify-center items-center gap-1.5 select-none"
                  >
                    <Sparkles size={14} />
                    <span>Generate Questions</span>
                  </button>
                </div>
              </div>
            )}

            {/* Generating loader */}
            {isGenerating && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <RefreshCw className="animate-spin text-purple-500 mb-4" size={32} />
                <h4 className="text-xs font-bold text-white mb-1">Generating Interview Questions...</h4>
                <p className="text-[10px] text-slate-500">Evaluating role requirements and drafting ideal expected answers.</p>
              </div>
            )}

            {/* Draft Questions Preview list */}
            {previewQuestions.length > 0 && !isGenerating && (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-450">Generated Drafts Preview ({previewQuestions.length} Questions)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPreviewQuestions([])}
                      className={`px-3 py-1.5 border rounded-lg hover:bg-slate-850 transition ${
                        isDark ? 'border-slate-805 text-slate-400' : 'border-slate-200 text-slate-650'
                      }`}
                    >
                      Clear / Back
                    </button>
                    <button
                      onClick={handleBulkSave}
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
                    >
                      Save Selected ({selectedPreviewIndices.size})
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {previewQuestions.map((draft, idx) => {
                    const isSelected = selectedPreviewIndices.has(idx);
                    const isEditing = editingPreviewIndex === idx;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border transition ${
                          isSelected 
                            ? isDark ? 'bg-purple-950/10 border-purple-550/40' : 'bg-purple-50/40 border-purple-200' 
                            : isDark ? 'bg-slate-950/40 border-slate-850' : 'bg-slate-50/50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePreviewSelect(idx)}
                            className="mt-1 cursor-pointer rounded border-slate-800 text-purple-650"
                          />
                          <div className="flex-1 space-y-3 text-xs">
                            {isEditing ? (
                              <div className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-450 uppercase mb-1">Question Text</label>
                                  <textarea
                                    value={draft.questionText}
                                    onChange={(e) => {
                                      const textVal = e.target.value;
                                      setPreviewQuestions(prev => prev.map((q, i) => i === idx ? { ...q, questionText: textVal } : q));
                                    }}
                                    rows={2}
                                    className="w-full px-2 py-1.5 border rounded-lg bg-slate-950 border-slate-800 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-slate-455 uppercase mb-1">Ideal Expected Answer</label>
                                  <textarea
                                    value={draft.expectedAnswer}
                                    onChange={(e) => {
                                      const ansVal = e.target.value;
                                      setPreviewQuestions(prev => prev.map((q, i) => i === idx ? { ...q, expectedAnswer: ansVal } : q));
                                    }}
                                    rows={3}
                                    className="w-full px-2 py-1.5 border rounded-lg bg-slate-950 border-slate-800 text-white"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setEditingPreviewIndex(null)}
                                  className="px-3 py-1 bg-purple-655 text-white font-bold rounded"
                                >
                                  Save Edit
                                </button>
                              </div>
                            ) : (
                              <div>
                                <h5 className="font-bold text-white leading-relaxed">{draft.questionText}</h5>
                                <p className="text-[11px] text-slate-400 mt-2 line-clamp-2"><strong>Ideal Answer:</strong> {draft.expectedAnswer}</p>
                              </div>
                            )}

                            {/* Tags list */}
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              <span className="text-[9px] px-2 py-0.5 bg-slate-950 border border-slate-850 rounded-md font-mono font-bold text-slate-450">
                                {draft.difficulty}
                              </span>
                              {(draft.tags || []).map((t: string, i: number) => (
                                <span key={i} className="text-[9px] px-2 py-0.5 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-md">
                                  {t}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingPreviewIndex(isEditing ? null : idx)}
                              className={`p-1.5 rounded-lg border transition ${
                                isDark ? 'hover:bg-slate-850 border-slate-805 text-slate-400' : 'hover:bg-slate-100 border-slate-200 text-slate-500'
                              }`}
                            >
                              <Edit3 size={12} />
                            </button>
                            <button
                              onClick={() => handleRemovePreviewItem(idx)}
                              className="p-1.5 rounded-lg border border-slate-800 text-rose-400 hover:bg-rose-950/20 transition"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
