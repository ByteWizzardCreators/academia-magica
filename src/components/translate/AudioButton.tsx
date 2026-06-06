"use client";

import { useRef, useState, useCallback } from "react";

interface Props {
  text: string;
  audioUrl?: string | null;
  label?: string;
  size?: "sm" | "md";
  lang?: string;
}

export default function AudioButton({ text, audioUrl, label, size = "sm", lang = "en-US" }: Props) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback(() => {
    if (playing) return;
    setPlaying(true);

    if (audioUrl && lang === "en-US") {
      // Native audio only available for English
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onerror = () => {
        setPlaying(false);
        speakWithWebSpeech(text, lang);
      };
      audio.play().catch(() => {
        setPlaying(false);
        speakWithWebSpeech(text, lang);
      });
    } else {
      speakWithWebSpeech(text, lang);
    }
  }, [text, audioUrl, playing, lang]);

  const speakWithWebSpeech = (txt: string, language: string) => {
    if (!window.speechSynthesis) {
      setPlaying(false);
      return;
    }
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const sizeClass = size === "sm" ? "h-7 w-7" : "h-9 w-9";

  return (
    <button
      onClick={play}
      disabled={playing}
      className={`${sizeClass} inline-flex cursor-pointer items-center justify-center rounded-full transition-all hover:bg-magic-purple/10 active:scale-90 disabled:opacity-50`}
      title={label || `Escuchar "${text}"`}
      aria-label={label || `Escuchar "${text}"`}
    >
      {playing ? (
        <svg className="h-4 w-4 text-magic-purple" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      ) : (
        <svg className="h-4 w-4 text-magic-purple" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 8.5v7a4.49 4.49 0 0 0 2.5-3.5zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
      )}
    </button>
  );
}
