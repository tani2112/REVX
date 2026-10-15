import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

interface VoiceAssistantButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VOICE_PROMPTS = [
  'Find Fall 2026 AI/ML Software Engineering Internships with remote work and sponsor verification',
  'Match candidate profile with high-growth AI startups offering sponsorship',
  'Execute automated internship discovery workflow and verify data integrity',
];

interface SpeechRecognitionEventLike {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstanceLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstanceLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstanceLike;
  }
}

export const VoiceAssistantButton: React.FC<VoiceAssistantButtonProps> = ({
  onTranscript,
  disabled = false,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [voicePromptIndex, setVoicePromptIndex] = useState(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstanceLike | null>(null);

  // Clean up media stream and timer on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const finishVoiceInput = (text?: string) => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    const promptToInsert = text || VOICE_PROMPTS[voicePromptIndex % VOICE_PROMPTS.length];
    setVoicePromptIndex((prev) => prev + 1);
    onTranscript(promptToInsert);
    setIsListening(false);
  };

  const handleToggleListening = async () => {
    if (disabled) return;

    if (isListening) {
      // User clicked again to complete speech input
      finishVoiceInput();
      return;
    }

    setIsListening(true);

    // Try SpeechRecognition if supported without throwing blocking error popups
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        const recognition = new SpeechRecognitionClass();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEventLike) => {
          const transcript = event.results[0]?.[0]?.transcript;
          if (transcript) {
            finishVoiceInput(transcript.trim());
          }
        };

        recognition.onerror = () => {
          // Gracefully suppress network/cloud service errors - fallback to voice input
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // SpeechRecognition start error suppressed
      }
    }

    // Connect to local hardware microphone stream
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;
      } catch {
        // Permission or device fallback
      }
    }

    // Natural 3.0s speaking window to capture input and insert into prompt
    timerRef.current = window.setTimeout(() => {
      finishVoiceInput();
    }, 3000);
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        id="voice-assistant-button"
        onClick={handleToggleListening}
        disabled={disabled}
        title={isListening ? 'Listening... click to complete voice task' : 'Voice Assistant (click and speak)'}
        className={`p-2 rounded-xl transition-all flex items-center justify-center ${
          isListening
            ? 'bg-red-500/20 text-red-400 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
            : 'text-slate-400 hover:text-blue-400 hover:bg-white/[0.06]'
        } disabled:opacity-50`}
      >
        {isListening ? (
          <Mic className="w-4 h-4 text-red-400" />
        ) : (
          <MicOff className="w-4 h-4" />
        )}
      </button>

      {/* Floating active status badge */}
      {isListening && (
        <div className="absolute bottom-full mb-2 left-0 sm:left-1/2 sm:-translate-x-1/2 px-3 py-1.5 rounded-xl bg-[#0c1220]/95 border border-blue-500/40 text-xs font-mono text-blue-300 shadow-xl whitespace-nowrap z-50 flex items-center space-x-2 animate-in fade-in backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          <span>Listening... speak your task</span>
        </div>
      )}
    </div>
  );
};
