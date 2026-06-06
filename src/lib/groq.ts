import Groq from "groq-sdk";
import { GROQ_MODEL, GROQ_TEMPERATURE, GROQ_MAX_TOKENS } from "./constants";

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface TranslateResponse {
  translation: string;
  ipa: string;
  explanation: string;
  example: string;
  exampleTranslation: string;
  definitions: Array<{
    definition: string;
    definitionEn: string;
    example: string;
    exampleTranslation: string;
  }>;
  // Enriched by backend after Groq response
  audioUrl?: string | null;
  phonetic?: string;
}

const SYSTEM_PROMPT = `You are a fun and patient English teacher for KIDS (ages 6-10).
You ONLY respond in valid JSON. No markdown, no extra text.
Keep language simple and friendly. Use a magical/wizard theme in your explanations.`;

function buildPrompt(phrase: string, language: string): string {
  return `Translate the ${language} word/phrase "${phrase}" to English.

Return ONLY valid JSON with these fields:
{
  "translation": "the english translation",
  "ipa": "the IPA pronunciation",
  "explanation": "a fun kid-friendly explanation in ${language}",
  "example": "a simple example sentence in English",
  "exampleTranslation": "the example translated to ${language}",
  "definitions": [
    {
      "definition": "a simple definition in ${language} for kids",
      "definitionEn": "a simple definition in English for kids",
      "example": "example sentence in English",
      "exampleTranslation": "example translated to ${language}"
    }
  ]
}

Provide exactly 2 definitions. Make them positive, fun, and useful for children. No violence, no scary themes.`;
}

export async function translate(
  phrase: string,
  language: string = "es",
): Promise<TranslateResponse> {
  const completion = await client.chat.completions.create({
    model: GROQ_MODEL,
    temperature: GROQ_TEMPERATURE,
    max_tokens: GROQ_MAX_TOKENS,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildPrompt(phrase, language) },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from Groq");
  }

  // Extract JSON from response (handles potential markdown wrapping)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in Groq response");
  }

  return JSON.parse(jsonMatch[0]) as TranslateResponse;
}
