import { NextRequest, NextResponse } from "next/server";
import { translate } from "@/lib/groq";
import type { TranslateResponse } from "@/lib/groq";
import { lookupWord } from "@/lib/dictionary";
import { getCachedTranslation, cacheTranslation } from "@/lib/cache";

// Common Spanish words — if example field has these, it's likely Spanish, not English
const SPANISH_PATTERN = /\b(el|la|los|las|un|una|mi|tu|su|es|son|que|del|con|por|para|como|muy|pero|más|cuando|este|esta|estos|estas|tiene|puede|hace|dice|cosa|casa|amo|ama|niño|niña|perro|gato|animal|jugar|juego|feliz|triste|grande|pequeño|divertido|amable|bonito|contento|correr|cantar|comer|beber|dormir|vivir|hablar|decir|hacer|poder|saber|querer|gustar|encantar|siempre|nunca|todos|todo|nada|algo|alguien|nadie|bueno|malo|nuevo|viejo)\b/i;

function isSpanish(text: string): boolean {
  return SPANISH_PATTERN.test(text);
}

function fixLanguageSwap(result: TranslateResponse): void {
  // Fix main example
  if (isSpanish(result.example) && !isSpanish(result.exampleTranslation)) {
    [result.example, result.exampleTranslation] = [result.exampleTranslation, result.example];
  }

  // Fix definitions
  for (const def of result.definitions) {
    if (isSpanish(def.example) && !isSpanish(def.exampleTranslation)) {
      [def.example, def.exampleTranslation] = [def.exampleTranslation, def.example];
    }
    if (isSpanish(def.definitionEn) && !isSpanish(def.definition)) {
      [def.definitionEn, def.definition] = [def.definition, def.definitionEn];
    }
  }
}

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

    // Fix Groq's language swapping (it often puts Spanish in English fields)
    fixLanguageSwap(result);

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
