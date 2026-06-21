import { useState, useRef, useEffect } from 'react';

export interface VideoTelemetry {
  eyeContactScore: number;
  bodyLanguageScore: number;
  voiceQualityScore: number;
  professionalismScore: number;
  durationSeconds: number;
}

export interface UseVideoRecorderReturn {
  stream: MediaStream | null;
  isRecording: boolean;
  videoUrl: string | null;
  videoBlob: Blob | null;
  cameraAccess: boolean;
  error: string | null;
  coachingTips: string[];
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  deleteRecording: () => void;
  stopTracks: () => void;
  telemetryData: VideoTelemetry;
}

export const useVideoRecorder = (
  transcript: string,
  isCoachingEnabled: boolean = false,
  questionIndex: number = 0,
  isCameraOn: boolean = false
): UseVideoRecorderReturn => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [cameraAccess, setCameraAccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coachingTips, setCoachingTips] = useState<string[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const checkIntervalRef = useRef<any>(null);

  // Dynamic telemetry scores
  const [telemetryData, setTelemetryData] = useState<VideoTelemetry>({
    eyeContactScore: 90,
    bodyLanguageScore: 85,
    voiceQualityScore: 85,
    professionalismScore: 90,
    durationSeconds: 0
  });

  // Request permissions when camera is enabled
  useEffect(() => {
    if (typeof window !== 'undefined' && isCameraOn) {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: true })
        .then((s) => {
          setCameraAccess(true);
          setStream(s);
          setError(null);
        })
        .catch((err) => {
          console.error('Camera/Mic permission error:', err);
          setCameraAccess(false);
          setError('Camera and Microphone access are required for Video Behavioral Analysis.');
        });
    } else {
      stopTracks();
    }

    return () => {
      stopTracks();
    };
  }, [questionIndex, isCameraOn]);

  const stopTracks = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraAccess(false);
  };

  // Real-time analysis simulation and coaching suggestions loop
  useEffect(() => {
    if (isRecording) {
      recordStartTimeRef.current = Date.now();
      
      checkIntervalRef.current = setInterval(() => {
        const elapsed = (Date.now() - recordStartTimeRef.current) / 1000;
        
        // Simulate minor variations in eye contact & posture stability
        const eyeGaze = Math.max(50, Math.min(100, 92 - Math.floor(Math.random() * 15)));
        const postureVal = Math.max(60, Math.min(100, 88 - Math.floor(Math.random() * 10)));
        const voiceVal = Math.max(70, Math.min(100, 85 + Math.floor(Math.random() * 8)));
        const profVal = Math.max(70, Math.min(100, 90 - Math.floor(Math.random() * 5)));

        setTelemetryData((prev) => ({
          eyeContactScore: Math.round((prev.eyeContactScore * 4 + eyeGaze) / 5),
          bodyLanguageScore: Math.round((prev.bodyLanguageScore * 4 + postureVal) / 5),
          voiceQualityScore: Math.round((prev.voiceQualityScore * 4 + voiceVal) / 5),
          professionalismScore: Math.round((prev.professionalismScore * 4 + profVal) / 5),
          durationSeconds: Math.round(elapsed)
        }));

        // Dynamic coaching prompts if enabled
        if (isCoachingEnabled) {
          const tips: string[] = [];
          
          if (eyeGaze < 85) {
            tips.push('Maintain eye contact with the camera.');
          }
          if (postureVal < 80) {
            tips.push('Maintain a steady sitting posture.');
          }

          // Check filler words counts inside transcription
          const fillers = ['like', 'basically', 'actually', 'you know', 'umm', 'uh'];
          const matchedFillers = fillers.filter(word => 
            new RegExp(`\\b${word}\\b`, 'gi').test(transcript)
          );
          if (matchedFillers.length > 0) {
            tips.push('Try using pauses instead of filler words.');
          }

          // Check speaking pace WPM
          const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;
          if (elapsed > 3 && wordCount > 0) {
            const wpm = Math.round((wordCount / elapsed) * 60);
            if (wpm > 155) {
              tips.push('Slow down slightly for better clarity.');
            } else if (wpm < 95) {
              tips.push('Speak up and try a more active pace.');
            }
          }

          setCoachingTips(tips.slice(0, 3)); // show top 3 suggestions max
        } else {
          setCoachingTips([]);
        }
      }, 3000);
    } else {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
      setCoachingTips([]);
    }

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [isRecording, transcript, isCoachingEnabled]);

  const startRecording = async () => {
    setError(null);
    setVideoUrl(null);
    setVideoBlob(null);
    chunksRef.current = [];
    setTelemetryData({
      eyeContactScore: 92,
      bodyLanguageScore: 88,
      voiceQualityScore: 85,
      professionalismScore: 90,
      durationSeconds: 0
    });

    try {
      let activeStream = stream;
      if (!activeStream || !activeStream.active) {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(activeStream);
        setCameraAccess(true);
      }

      // Check supported types
      let options = { mimeType: 'video/webm;codecs=vp9,opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm;codecs=vp8,opus' };
      }
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        options = { mimeType: 'video/webm' };
      }

      const mediaRecorder = new MediaRecorder(activeStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setVideoBlob(blob);
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Error starting video recording:', err);
      setError('Could not access camera/microphone stream. Ensure devices are enabled.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const deleteRecording = () => {
    stopRecording();
    stopTracks();
    setVideoBlob(null);
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    chunksRef.current = [];
  };

  return {
    stream,
    isRecording,
    videoUrl,
    videoBlob,
    cameraAccess,
    error,
    coachingTips,
    startRecording,
    stopRecording,
    deleteRecording,
    stopTracks,
    telemetryData
  };
};
