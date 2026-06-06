"use client";

import { useState, type FormEvent } from "react";

interface Props {
  onResult: (data: unknown) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
}

export default function TranslateForm({ onResult, onError, onLoading }: Props) {
  const [phrase, setPhrase] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!phrase.trim()) return;

    onLoading(true);
    onError("");

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phrase: phrase.trim(), language: "es" }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Error desconocido" }));
        throw new Error(err.error || `Error ${res.status}`);
      }

      const data = await res.json();
      onResult(data);
    } catch (err) {
      onError(err instanceof Error ? err.message : "Algo salió mal");
    } finally {
      onLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-lg gap-3">
      <input
        type="text"
        value={phrase}
        onChange={(e) => setPhrase(e.target.value)}
        placeholder="Escribí una palabra en español..."
        className="flex-1 rounded-xl border-2 border-magic-purple/20 bg-white px-5 py-3 text-base text-magic-text outline-none transition-all placeholder:text-magic-text-light/50 focus:border-magic-gold focus:shadow-[0_0_12px_rgba(255,184,0,0.3)]"
      />
      <button
        type="submit"
        disabled={!phrase.trim()}
        className="magic-gradient cursor-pointer rounded-xl px-6 py-3 font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Traducir
      </button>
    </form>
  );
}
