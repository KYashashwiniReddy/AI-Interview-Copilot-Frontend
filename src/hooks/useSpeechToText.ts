import { useState, useRef, useEffect } from 'react';

export interface UseSpeechToTextReturn {
  isListening: boolean;
  transcript: string;
  isRecording: boolean;
  audioUrl: string | null;
  audioBlob: Blob | null;
  microphoneAccess: boolean;
  error: string | null;
  startRecording: () => void;
  pauseRecording: () => void;
  stopRecording: () => void;
  deleteRecording: () => void;
  setTranscript: (text: string) => void;
}

export const useSpeechToText = (): UseSpeechToTextReturn => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const finalizedTextRef = useRef('');
  const lastSessionFinalRef = useRef('');
  const allowUpdatesRef = useRef(true);

  // Request Microphone permission and initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 1. Initialize Web Speech API
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          if (!allowUpdatesRef.current) return;
          let sessionFinal = '';
          let sessionInterim = '';

          for (let i = 0; i < event.results.length; ++i) {
            const segment = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              sessionFinal += (sessionFinal ? ' ' : '') + segment.trim();
            } else {
              sessionInterim += (sessionInterim ? ' ' : '') + segment.trim();
            }
          }

          lastSessionFinalRef.current = sessionFinal;

          const prefix = finalizedTextRef.current;
          let combined = prefix;
          if (sessionFinal) {
            combined = prefix ? `${prefix} ${sessionFinal}` : sessionFinal;
          }
          if (sessionInterim) {
            combined = combined ? `${combined} ${sessionInterim}` : sessionInterim;
          }

          setTranscript(combined);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setMicrophoneAccess(false);
            setError('Microphone permission blocked.');
          }
        };

        recognition.onend = () => {
          if (!allowUpdatesRef.current) return;
          // When the session ends, finalize the accumulated text of this session
          if (lastSessionFinalRef.current) {
            finalizedTextRef.current = (finalizedTextRef.current ? `${finalizedTextRef.current} ${lastSessionFinalRef.current}` : lastSessionFinalRef.current).trim();
            lastSessionFinalRef.current = '';
          }
          
          if (isListening) {
            try {
              recognition.start();
            } catch (err) {
              console.warn('Failed to auto-restart recognition:', err);
            }
          }
        };

        recognitionRef.current = recognition;
      } else {
        console.warn('SpeechRecognition API not supported in this browser.');
      }

      // Check mic permissions upfront
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          setMicrophoneAccess(true);
          stream.getTracks().forEach((track) => track.stop()); // Stop immediate track usage
        })
        .catch(() => {
          setMicrophoneAccess(false);
          setError('Microphone access denied. Please enable permission.');
        });
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isListening]);

  const startRecording = async () => {
    setError(null);
    allowUpdatesRef.current = true;
    finalizedTextRef.current = '';
    lastSessionFinalRef.current = '';
    setTranscript('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setMicrophoneAccess(true);

      // MediaRecorder config (using WebM)
      const options = { mimeType: 'audio/webm' };
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn('SpeechRecognition start error:', e);
        }
      }
    } catch (err: any) {
      console.error('Error starting recording:', err);
      setError('Could not access microphone. Ensure permissions are allowed.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.pause();
      } else if (mediaRecorderRef.current.state === 'paused') {
        mediaRecorderRef.current.resume();
      }
    }

    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
        setIsListening(false);
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const stopRecording = () => {
    allowUpdatesRef.current = false;
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const deleteRecording = () => {
    stopRecording();
    setAudioBlob(null);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    finalizedTextRef.current = '';
    lastSessionFinalRef.current = '';
    setTranscript('');
    audioChunksRef.current = [];
  };

  return {
    isListening,
    transcript,
    isRecording,
    audioUrl,
    audioBlob,
    microphoneAccess,
    error,
    startRecording,
    pauseRecording,
    stopRecording,
    deleteRecording,
    setTranscript
  };
};
