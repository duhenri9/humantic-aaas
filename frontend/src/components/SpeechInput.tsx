"use client";

import React, { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api'; // Path from frontend/src/components to frontend/convex/_generated/api

interface SpeechInputProps {
  onTranscriptionComplete: (text: string) => void;
  className?: string;
}

export const SpeechInput: React.FC<SpeechInputProps> = ({ onTranscriptionComplete, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string>(""); // For displaying locally if needed

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Make sure your backend `speechToText.ts` has `generateTextFromSpeech` mutation
  const sttMutation = useMutation(api.speechToText.generateTextFromSpeech);

  const startRecording = async () => {
    setError(null);
    setTranscribedText(""); // Clear previous transcription
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      setError("Media devices API not supported on your browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Ensure a supported MIME type. Common options: 'audio/webm', 'audio/ogg', 'audio/wav'
      // Check what your STT service prefers. 'audio/webm' is widely supported.
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback or error if preferred mimeType isn't supported
        console.warn(`${options.mimeType} is not supported. Trying default.`);
        mediaRecorderRef.current = new MediaRecorder(stream);
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, options);
      }


      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsLoading(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorderRef.current?.mimeType || 'audio/webm' });
        audioChunksRef.current = []; // Reset for next recording

        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = reader.result?.toString().split(',')[1];
          if (base64Audio) {
            try {
              const transcription = await sttMutation({ audioAsBase64: base64Audio });
              setTranscribedText(transcription);
              onTranscriptionComplete(transcription);
            } catch (e: any) {
              console.error("STT API Error:", e);
              setError(`Transcription failed: ${e.data?.value || e.message || 'Unknown error'}`);
            }
          } else {
            setError("Failed to convert audio to base64.");
          }
          setIsLoading(false);
        };
        reader.onerror = () => {
          setError("Error reading audio data.");
          setIsLoading(false);
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      setError(`Microphone error: ${err.message}. Please ensure permission is granted.`);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      // `onstop` handler will be triggered, which sets isLoading and calls API
    }
    setIsRecording(false); // Set recording state immediately
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className={`p-4 border rounded-lg shadow-md bg-white dark:bg-slate-800 w-full ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-sky-600 dark:text-sky-500">Record Audio</h3>
      <button
        onClick={handleToggleRecording}
        disabled={isLoading}
        type="button"
        className={`px-4 py-2 rounded-md text-white font-medium transition-colors w-full mb-3
          ${isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          ${isLoading ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isLoading ? 'Processing...' : (isRecording ? 'Stop Recording' : 'Start Recording')}
      </button>

      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">Error: {error}</p>}

      {/* Displaying transcription locally can be optional if parent handles it */}
      {/* {transcribedText && !error && (
        <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded">
          <p className="font-medium text-slate-700 dark:text-slate-300">Transcription Preview:</p>
          <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">{transcribedText}</p>
        </div>
      )} */}
    </div>
  );
};
