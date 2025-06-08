"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useConvex } from 'convex/react'; // To get the Convex client for manual queries
import { api } from '../../convex/_generated/api'; // Path from frontend/src/components to frontend/convex/_generated/api

interface AudioOutputProps {
  textToSpeak: string;
  className?: string;
}

export const AudioOutput: React.FC<AudioOutputProps> = ({ textToSpeak, className }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null); // Store the base64 data URL

  const convex = useConvex(); // Get the Convex client

  const handlePlayAudio = async () => {
    if (!textToSpeak) {
      setError("No text provided to speak.");
      setAudioSrc(null);
      return;
    }
    setError(null);
    setIsLoading(true);
    setAudioSrc(null);

    try {
      // Manually call the query using the Convex client
      const result = await convex.query(api.textToSpeech.generateSpeechFromText, { text: textToSpeak });

      if (result && result.audioBase64 && result.mimeType) {
        const newAudioSrc = `data:${result.mimeType};base64,${result.audioBase64}`;
        setAudioSrc(newAudioSrc);
        // Autoplay handled by useEffect below
      } else {
        throw new Error("Invalid audio data received from backend.");
      }
    } catch (e: any) {
      console.error("Error calling textToSpeech query:", e);
      setError(`Error generating speech: ${e.data?.value || e.message || 'Unknown error'}`);
      setAudioSrc(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Autoplay when audioSrc is set
    if (audioSrc && audioRef.current) {
      audioRef.current.play().catch(playError => {
        console.error("Error auto-playing audio:", playError);
        // Browsers often restrict autoplay until user interaction.
        // The controls attribute on the audio element allows manual play.
        setError("Could not auto-play audio. Please use controls or ensure browser allows autoplay.");
      });
    }
  }, [audioSrc]);

  return (
    <div className={`p-4 border rounded-lg shadow-md bg-white dark:bg-slate-800 w-full ${className}`}>
      <h3 className="text-lg font-semibold mb-3 text-sky-600 dark:text-sky-500">Text to Speech Output</h3>
      <div className="mb-3 p-3 bg-slate-50 dark:bg-slate-700 rounded min-h-[60px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
        {textToSpeak || "Text to synthesize will appear here once transcribed or entered."}
      </div>
      <button
        onClick={handlePlayAudio}
        disabled={isLoading || !textToSpeak}
        type="button"
        className={`px-4 py-2 rounded-md text-white font-medium transition-colors w-full mb-3
          bg-blue-600 hover:bg-blue-700
          ${(isLoading || !textToSpeak) ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isLoading ? 'Generating Audio...' : 'Play Generated Audio'}
      </button>

      {error && <p className="text-red-500 dark:text-red-400 text-sm mt-2">{error}</p>}

      {audioSrc && (
        <audio ref={audioRef} controls src={audioSrc} className="w-full mt-2">
          Your browser does not support the audio element.
        </audio>
      )}
      {!audioSrc && !isLoading && (
         <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center">Click button to generate and play audio.</p>
      )}
    </div>
  );
};
