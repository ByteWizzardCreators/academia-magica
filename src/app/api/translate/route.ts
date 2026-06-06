import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/lib/groq";
import { lookupWord } from "@/lib/dictionary";
import { getCachedTranslation, cacheTranslation } from "@/lib/cache";

export async function POST(request: NextRequest) {
  try {
    const { phrase, language = "es" } = await request.json();

    if (!phrase || typeof phrase !== "string" || !phrase.trim()) {
      return NextResponse.json(
        { error: "La frase es requerida" },
        { status: 400 },
      );
    }

    // Check cache first
    const cached = await getCachedTranslation(phrase, language);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Call Groq
    const result = await translate(phrase, language);

    // Enrich with Free Dictionary API (native audio + phonetic)
    const dict = await lookupWord(result.translation);
    if (dict) {
      result.audioUrl = dict.audioUrl;
      result.phonetic = dict.phonetic || result.ipa;
    }

    // Cache the result (fire-and-forget)
    cacheTranslation(phrase, language, result).catch(console.error);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Translate error:", error);

    // Handle Groq rate limit
    if (error instanceof Error && error.message.includes("429")) {
      return NextResponse.json(
        { error: "Demasiadas consultas. Esperá un momento y volvé a intentar." },
        {
          status: 503,
          headers: { "Retry-After": "30" },
        },
      );
    }

    return NextResponse.json(
      { error: "Algo salió mal. ¡Intentalo de nuevo!" },
      { status: 500 },
    );
  }
}
