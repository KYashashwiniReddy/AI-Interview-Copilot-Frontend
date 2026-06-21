'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import LayoutShell from '../../../components/LayoutShell';
import { useSpeechToText } from '../../../hooks/useSpeechToText';
import { useVideoRecorder } from '../../../hooks/useVideoRecorder';
import { interviewApi } from '../../../lib/api';
import {
  Mic,
  Square,
  Pause,
  Trash2,
  Play,
  Keyboard,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  TrendingUp,
  UserCheck,
  AlertCircle,
  Video,
  VideoOff,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InterviewRoom() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Session states
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Input states
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);

  // Evaluation modal/card
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evalTab, setEvalTab] = useState<'content' | 'behavioral'>('content');

  // Call Speech hook
  const {
    isListening,
    transcript,
    isRecording,
    audioUrl,
    audioBlob,
    microphoneAccess,
    startRecording,
    pauseRecording,
    stopRecording,
    deleteRecording,
    setTranscript
  } = useSpeechToText();

  // Call Video telemetry hook
  const [isCoachingEnabled, setIsCoachingEnabled] = useState(false);
  const {
    stream: videoStream,
    isRecording: isVideoRecording,
    videoUrl,
    videoBlob,
    cameraAccess,
    error: videoError,
    coachingTips,
    startRecording: startVideoRecording,
    stopRecording: stopVideoRecording,
    deleteRecording: deleteVideoRecording,
    stopTracks: stopVideoTracks,
    telemetryData
  } = useVideoRecorder(transcript, isCoachingEnabled, currentIdx, isCameraOn);

  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (videoRef.current && videoStream) {
      videoRef.current.srcObject = videoStream;
    }
  }, [videoStream]);

  useEffect(() => {
    async function loadSession() {
      try {
        const data = await interviewApi.getReport(sessionId);
        setSession(data.session);
        const qs = data.session.questions || [];
        setQuestions(qs);
        
        const nextUnanswered = qs.findIndex((q: any) => !q.answer);
        setCurrentIdx(nextUnanswered !== -1 ? nextUnanswered : 0);
        
        if (nextUnanswered === -1 && qs.length > 0) {
          router.push(`/mock-interview/${sessionId}/report`);
        }
      } catch (err: any) {
        setError('Failed to load active mock room session metadata.');
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, [sessionId, router]);

  useEffect(() => {
    if (transcript) {
      setTypedAnswer(transcript);
    }
  }, [transcript]);

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
      stopVideoRecording();
    } else {
      startRecording();
      if (isCameraOn) {
        startVideoRecording();
      }
    }
  };

  const handleAnswerSubmit = async () => {
    const finalAnswer = typedAnswer.trim();
    if (!finalAnswer && !audioBlob && !videoBlob) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const activeQ = questions[currentIdx];
      const formData = new FormData();
      formData.append('questionId', activeQ.id);
      formData.append('answerText', finalAnswer);
      
      if (audioBlob) {
        formData.append('voice', audioBlob, 'candidate_response.webm');
      }
      if (videoBlob) {
        formData.append('video', videoBlob, 'candidate_response_video.webm');
      }
      formData.append('behavioralTelemetry', JSON.stringify({
        eyeContactScore: telemetryData.eyeContactScore,
        bodyLanguageScore: telemetryData.bodyLanguageScore,
        voiceQualityScore: telemetryData.voiceQualityScore,
        professionalismScore: telemetryData.professionalismScore,
        durationSeconds: telemetryData.durationSeconds
      }));

      const data = await interviewApi.submitAnswer(sessionId, formData);
      const currentQ = data.questions?.find((q: any) => q.id === activeQ.id);
      const answerObj = currentQ?.answer;

      setEvaluation({
        ...data.evaluation,
        behavioralScore: answerObj?.behavioralScore !== null ? answerObj?.behavioralScore : null,
        eyeContactScore: answerObj?.eyeContactScore !== null ? answerObj?.eyeContactScore : null,
        bodyLanguageScore: answerObj?.bodyLanguageScore !== null ? answerObj?.bodyLanguageScore : null,
        voiceQualityScore: answerObj?.voiceQualityScore !== null ? answerObj?.voiceQualityScore : null,
        professionalismScore: answerObj?.professionalismScore !== null ? answerObj?.professionalismScore : null,
        behavioralDetails: answerObj?.behavioralDetails ? JSON.parse(answerObj.behavioralDetails) : null
      });

      if (data.questions) {
        setQuestions(data.questions);
      }
      deleteRecording();
      deleteVideoRecording();
      setTypedAnswer('');
      setEvalTab('content');
    } catch (err: any) {
      setError(err.message || 'Answer submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    deleteRecording();
    deleteVideoRecording();
    setTypedAnswer('');
    setError('');
    setEvaluation(null);
    const nextVal = currentIdx + 1;
    if (nextVal < questions.length) {
      setCurrentIdx(nextVal);
    } else {
      handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    setIsSubmitting(true);
    try {
      await interviewApi.complete(sessionId);
      router.push(`/mock-interview/${sessionId}/report`);
    } catch (err: any) {
      setError('Failed to finalize the interview reports.');
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LayoutShell>
        <div className="min-h-[450px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </LayoutShell>
    );
  }

  const activeQuestion = questions[currentIdx];
  const progressPercent = questions.length > 0 ? Math.round(((currentIdx) / questions.length) * 100) : 0;

  return (
    <LayoutShell>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div className="bg-slate-900 border border-slate-800 px-6 py-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
              Active Room: {session?.type} Session
            </span>
            <h2 className="text-sm font-bold text-white leading-none flex items-center gap-2">
              Role: {session?.role} <span className="text-slate-500">at</span> {session?.company}
            </h2>
          </div>
          <div className="w-full sm:w-48 text-right space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              <span>Question Progress</span>
              <span>{currentIdx + 1} / {questions.length}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-850">
              <div className="h-full bg-purple-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 text-xs bg-rose-950/40 border border-rose-900/40 rounded-xl text-rose-300 flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <div className="grid md:grid-cols-5 gap-6">
          
          <div className="md:col-span-2 space-y-6 flex flex-col">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between min-h-[220px] shadow-lg">
              <div className="p-5 bg-slate-950/50 border-b border-slate-850 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  AI
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Interviewer Agent</h4>
                  <p className="text-[9px] font-semibold text-emerald-400">Online</p>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIdx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquare size={20} className="text-purple-400/80" />
                      {activeQuestion?.isFollowUp && (
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 tracking-wider uppercase animate-pulse">
                          AI Follow-Up Question
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm font-semibold text-slate-100 leading-relaxed italic">
                      "{activeQuestion?.text}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="p-4 bg-slate-950/30 text-center border-t border-slate-850">
                <p className="text-[9px] text-slate-500 font-medium">Answer using typing text box or microphone speech capture.</p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Video size={14} className="text-purple-400" />
                    <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">Camera Feed</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (isCameraOn) {
                        setIsCameraOn(false);
                        stopVideoTracks();
                      } else {
                        setIsCameraOn(true);
                      }
                    }}
                    className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase transition flex items-center gap-1 cursor-pointer ${
                      isCameraOn ? 'bg-purple-650/30 text-purple-400 border border-purple-500/25' : 'bg-slate-950 text-slate-500 border border-slate-850'
                    }`}
                  >
                    {isCameraOn ? <Video size={10} /> : <VideoOff size={10} />}
                    <span>{isCameraOn ? 'Video On' : 'Video Off'}</span>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Live Coaching</span>
                  <button
                    type="button"
                    onClick={() => setIsCoachingEnabled(!isCoachingEnabled)}
                    className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isCoachingEnabled ? 'bg-purple-600' : 'bg-slate-800'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        isCoachingEnabled ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="relative aspect-video rounded-xl bg-slate-950 overflow-hidden border border-slate-850 flex items-center justify-center shadow-inner">
                {cameraAccess && videoStream && isCameraOn ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="text-center p-4">
                    <VideoOff size={24} className="text-slate-600 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
                      {!isCameraOn ? 'Camera is turned off. Click "Enable Video" below or toggle above to turn it on.' : (videoError || 'Accessing camera/microphone stream...')}
                    </p>
                  </div>
                )}

                {isRecording && (
                  <div className="absolute top-3 left-3 bg-rose-600/90 backdrop-blur text-[8px] font-black text-white px-2 py-0.5 rounded-md flex items-center gap-1.5 animate-pulse uppercase tracking-wider shadow">
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    REC VIDEO
                  </div>
                )}
              </div>

              {isCoachingEnabled && (
                <div className="space-y-2 border-t border-slate-850/80 pt-3">
                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    <Sparkles size={10} className="text-amber-400" />
                    <span>Live AI Presentation Feedback</span>
                  </div>
                  <div className="space-y-1.5 min-h-[45px] flex flex-col justify-center">
                    {isRecording ? (
                      coachingTips.length > 0 ? (
                        <AnimatePresence>
                          {coachingTips.map((tip) => (
                            <motion.div
                              key={tip}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              className="bg-amber-500/10 border border-amber-500/20 text-amber-300 px-3 py-2 rounded-xl text-[9px] font-bold flex items-center gap-2"
                            >
                              <div className="w-1 h-1 rounded-full bg-amber-400" />
                              <span>{tip}</span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      ) : (
                        <p className="text-[9px] text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2 rounded-xl text-center font-bold">
                          Speech pace & posture stable. Keep going!
                        </p>
                      )
                    ) : (
                      <p className="text-[9px] text-slate-500 text-center italic font-bold">
                        Real-time pointers start when you begin speaking.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-3 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[350px] shadow-lg">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Candidate Response</h3>
              <div className="flex bg-slate-950 border border-slate-850 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setInputMode('voice')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                    inputMode === 'voice' ? 'bg-purple-600/15 text-purple-400' : 'text-slate-500'
                  }`}
                >
                  <Mic size={12} />
                  Voice + Video
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('text')}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase transition flex items-center gap-1.5 cursor-pointer ${
                    inputMode === 'text' ? 'bg-purple-600/15 text-purple-400' : 'text-slate-500'
                  }`}
                >
                  <Keyboard size={12} />
                  Type Text
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-4">
              
              {inputMode === 'voice' && (
                <div className="text-center space-y-6">
                  <div className="h-20 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-center p-4 relative overflow-hidden shadow-inner">
                    {isRecording ? (
                      <div className="flex items-end gap-1.5 h-10">
                        <div className="wave-bar h-6 animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="wave-bar h-9 animate-bounce" style={{ animationDelay: '0.3s' }} />
                        <div className="wave-bar h-5 animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <div className="wave-bar h-8 animate-bounce" style={{ animationDelay: '0.4s' }} />
                        <div className="wave-bar h-4 animate-bounce" style={{ animationDelay: '0.15s' }} />
                      </div>
                    ) : (
                      <div className="text-slate-500 text-xs font-semibold">
                        {videoUrl ? '🎥 WebM Video response recorded. Preview below.' : 'Click mic to record Response'}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center mb-4">
                    {!isCameraOn ? (
                      <button
                        type="button"
                        id="btn-enable-video"
                        onClick={() => setIsCameraOn(true)}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition select-none cursor-pointer"
                      >
                        Enable Video
                      </button>
                    ) : (
                      <button
                        type="button"
                        id="btn-disable-video"
                        onClick={() => {
                          setIsCameraOn(false);
                          stopVideoTracks();
                        }}
                        className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 rounded-lg text-xs font-bold transition select-none cursor-pointer"
                      >
                        Disable Video
                      </button>
                    )}
                    <button
                      type="button"
                      id="btn-record-answer"
                      onClick={handleMicToggle}
                      className={`px-3 py-1.5 text-white rounded-lg text-xs font-bold transition select-none cursor-pointer ${
                        isRecording ? 'bg-rose-600 hover:bg-rose-500' : 'bg-purple-600 hover:bg-purple-500'
                      }`}
                    >
                      {isRecording ? 'Stop Recording' : 'Record Answer'}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-4">
                    {(audioUrl || videoUrl) && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteRecording();
                          deleteVideoRecording();
                        }}
                        className="p-3 bg-slate-950 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 border border-slate-850 hover:border-rose-900/30 rounded-full transition cursor-pointer shadow"
                        title="Delete recording"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleMicToggle}
                      className={`p-6 rounded-full transition duration-300 flex items-center justify-center cursor-pointer shadow-lg ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-500 text-white mic-active-pulse'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'
                      }`}
                    >
                      {isRecording ? <Square size={20} /> : <Mic size={24} />}
                    </button>

                    {isRecording && (
                      <button
                        type="button"
                        onClick={pauseRecording}
                        className="p-3 bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-850 rounded-full transition cursor-pointer shadow"
                        title="Pause/Resume"
                      >
                        <Pause size={16} />
                      </button>
                    )}
                  </div>

                  {videoUrl ? (
                    <div className="flex flex-col items-center gap-2 mt-2">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Video Replay</span>
                      <video src={videoUrl} controls className="w-full max-w-xs aspect-video rounded-xl border border-slate-800 shadow-lg" />
                    </div>
                  ) : audioUrl ? (
                    <div className="flex justify-center">
                      <audio src={audioUrl} controls className="h-8 max-w-xs outline-none bg-slate-950 rounded-full border border-slate-800" />
                    </div>
                  ) : null}

                </div>
              )}

              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                  {inputMode === 'voice' ? 'Real-time Speech Transcription (Editable)' : 'Type response details'}
                </span>
                <textarea
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder={inputMode === 'voice' ? 'Transcription streams here as you speak. You can click here to edit or add details.' : 'Provide your structured response here...'}
                  rows={5}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-850 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500 transition resize-none leading-relaxed shadow-inner"
                />
              </div>

            </div>

            <div className="border-t border-slate-850 pt-4 mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleAnswerSubmit}
                disabled={isSubmitting || (!typedAnswer.trim() && !audioBlob && !videoBlob)}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-850 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition select-none disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? 'Evaluating...' : 'Submit Response'}
                <Send size={12} />
              </button>
            </div>

          </div>
        </div>
      </div>

      <AnimatePresence>
        {evaluation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-block">
                    Evaluation Complete
                  </span>
                  <h3 className="text-base font-black text-white mt-2">Question Performance breakdown</h3>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-black text-purple-400">{evalTab === 'content' ? evaluation.score : evaluation.behavioralScore}</span>
                  <span className="text-xs text-slate-500"> /100</span>
                </div>
              </div>

              {(() => {
                const hasVideoEval = evaluation && evaluation.eyeContactScore !== null && evaluation.eyeContactScore !== undefined && evaluation.eyeContactScore !== 0;
                return (
                  <>
                    <div className="flex border-b border-slate-800 gap-6">
                      <button
                        type="button"
                        onClick={() => setEvalTab('content')}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                          evalTab === 'content' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        Technical Content
                      </button>
                      <button
                        type="button"
                        onClick={() => setEvalTab('behavioral')}
                        className={`pb-3 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                          evalTab === 'behavioral' ? 'border-purple-500 text-purple-400' : 'border-transparent text-slate-500 hover:text-slate-400'
                        }`}
                      >
                        {hasVideoEval ? 'Presentation & Behavioral' : 'Communication Clarity'}
                      </button>
                    </div>

                    {evalTab === 'content' ? (
                      <>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Technical Score', value: evaluation.correctnessScore, color: 'text-purple-400' },
                            { label: 'Communication', value: evaluation.communicationScore, color: 'text-indigo-400' },
                            { label: 'Confidence', value: evaluation.confidenceScore, color: 'text-pink-400' },
                            { label: 'Grammar & Clarity', value: evaluation.grammarScore, color: 'text-emerald-400' }
                          ].map((scoreItem) => (
                            <div key={scoreItem.label} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center shadow-inner">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{scoreItem.label}</span>
                              <span className={`text-base font-black ${scoreItem.color}`}>{scoreItem.value}%</span>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-1">
                            <h4 className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                              <UserCheck size={12} />
                              Expected Ideal Answer
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{evaluation.expectedAnswer}</p>
                          </div>

                          <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-1">
                            <h4 className="text-[10px] font-black text-pink-400 uppercase tracking-widest flex items-center gap-1.5">
                              <TrendingUp size={12} />
                              Improvement Tips
                            </h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{evaluation.improvementTips}</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {hasVideoEval ? (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                              { label: 'Eye Contact', value: evaluation.eyeContactScore, color: 'text-purple-400' },
                              { label: 'Body Language', value: evaluation.bodyLanguageScore, color: 'text-indigo-400' },
                              { label: 'Voice Quality', value: evaluation.voiceQualityScore, color: 'text-pink-400' },
                              { label: 'Professionalism', value: evaluation.professionalismScore, color: 'text-emerald-400' }
                            ].map((scoreItem) => (
                              <div key={scoreItem.label} className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center shadow-inner">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">{scoreItem.label}</span>
                                <span className={`text-base font-black ${scoreItem.color}`}>{scoreItem.value}%</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {evaluation.voiceQualityScore !== null && evaluation.voiceQualityScore !== undefined && evaluation.voiceQualityScore > 0 && (
                              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center shadow-inner">
                                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Voice Quality</span>
                                <span className="text-base font-black text-purple-400">{evaluation.voiceQualityScore}%</span>
                              </div>
                            )}
                            <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-center shadow-inner">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Clarity & Pacing Score</span>
                              <span className="text-base font-black text-indigo-400">{evaluation.communicationScore || 0}%</span>
                            </div>
                          </div>
                        )}

                        {evaluation.behavioralDetails && (
                          <div className="space-y-4 text-xs">
                            {hasVideoEval && (
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-1.5">
                                  <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Eye Gaze & Expressions</span>
                                  <p className="text-slate-300 leading-relaxed font-semibold">{evaluation.behavioralDetails.eyeContactFeedback}</p>
                                  <p className="text-slate-400 text-[10px] leading-relaxed">{evaluation.behavioralDetails.facialExpressionsFeedback}</p>
                                  <p className="text-slate-400 text-[10px] leading-relaxed">{evaluation.behavioralDetails.smileFeedback}</p>
                                </div>

                                <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-1.5">
                                  <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider block">Body Posture & Movement</span>
                                  <p className="text-slate-300 leading-relaxed font-semibold">{evaluation.behavioralDetails.bodyLanguageFeedback}</p>
                                  <p className="text-slate-400 text-[10px] leading-relaxed">{evaluation.behavioralDetails.headMovementFeedback}</p>
                                </div>
                              </div>
                            )}

                            <div className="p-4 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                              <div className="flex justify-between items-center border-b border-slate-850 pb-2 mb-2">
                                <span className="text-[9px] font-bold text-purple-400 uppercase tracking-wider">Voice Clarity & Speaking Pace</span>
                                <div className="flex gap-4 text-[9px] font-bold text-slate-400">
                                  <span>SPEED: {evaluation.behavioralDetails.speakingPaceWpm} WPM</span>
                                  <span>FILLER WORDS: {evaluation.behavioralDetails.fillerWordCount}</span>
                                </div>
                              </div>
                              <p className="text-slate-300 leading-relaxed font-semibold">{evaluation.behavioralDetails.speakingPaceFeedback}</p>
                              <p className="text-slate-400 text-[10px] leading-relaxed">{evaluation.behavioralDetails.voiceAnalysisFeedback}</p>
                              {evaluation.behavioralDetails.fillerWordCount > 0 && (
                                <div className="mt-2 text-[9px] text-amber-400 font-bold bg-amber-500/5 p-2 rounded-lg border border-amber-500/10">
                                  Filler words detected: {Object.entries(evaluation.behavioralDetails.fillerWordsList || {})
                                    .map(([word, count]) => `"${word}" (${count}x)`)
                                    .join(', ')}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </>
                );
              })()}

              <div className="border-t border-slate-800 pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer transition shadow"
                >
                  <span>
                    {currentIdx + 1 < questions.length ? 'Next Question' : 'Complete and Generate Report'}
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </LayoutShell>
  );
}
