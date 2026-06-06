import { createAdminClient } from "./supabase/server";
import { createHash } from "crypto";
import type { TranslateResponse } from "./groq";

function hashPhrase(phrase: string, language: string): string {
  return createHash("sha256")
    .update(`${language}:${phrase.toLowerCase().trim()}`)
    .digest("hex");
}

export async function getCachedTranslation(
  phrase: string,
  language: string,
): Promise<TranslateResponse | null> {
  const supabase = createAdminClient();
  const hash = hashPhrase(phrase, language);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = await (supabase as any)
    .from("translations")
    .select("response_json")
    .eq("phrase_hash", hash)
    .single();

  return data?.response_json as TranslateResponse | null;
}

export async function cacheTranslation(
  phrase: string,
  language: string,
  response: TranslateResponse,
): Promise<void> {
  const supabase = createAdminClient();
  const hash = hashPhrase(phrase, language);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("translations")
    .upsert(
      {
        phrase_hash: hash,
        phrase: phrase.toLowerCase().trim(),
        language,
        response_json: response,
      },
      { onConflict: "phrase_hash" },
    );
}
