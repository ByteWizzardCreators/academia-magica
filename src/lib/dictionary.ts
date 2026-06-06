// Free Dictionary API — native phonetics and audio for English words
const DICTIONARY_API = "https://api.dictionaryapi.dev/api/v2/entries/en";

export interface DictionaryResult {
  word: string;
  phonetic: string;
  audioUrl: string | null;
}

export async function lookupWord(word: string): Promise<DictionaryResult | null> {
  try {
    const res = await fetch(`${DICTIONARY_API}/${encodeURIComponent(word.toLowerCase())}`);

    if (!res.ok) return null;

    const data = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    const entry = data[0];
    const phonetic = entry.phonetic || entry.phonetics?.[0]?.text || "";
    const audioUrl = findAudio(entry.phonetics);

    return {
      word: entry.word,
      phonetic,
      audioUrl,
    };
  } catch {
    return null;
  }
}

function findAudio(phonetics: Array<{ text?: string; audio?: string }> | undefined): string | null {
  if (!phonetics) return null;

  // Prefer US pronunciation
  const usAudio = phonetics.find((p) => p.audio?.includes("-us") || p.audio?.includes("_us"));
  if (usAudio?.audio) return usAudio.audio;

  // Fallback to any audio
  const anyAudio = phonetics.find((p) => p.audio && p.audio.length > 0);
  return anyAudio?.audio || null;
}
