import AudioButton from "./AudioButton";
import type { TranslateResponse } from "@/lib/groq";

interface Props {
  data: TranslateResponse | null;
  loading: boolean;
  error: string;
}

export default function TranslateResult({ data, loading, error }: Props) {
  if (loading) {
    return (
      <div className="magic-card flex items-center gap-3 px-6 py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-magic-gold border-t-transparent" />
        <p className="text-magic-text-light">Pensando... 🧙‍♂️</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="magic-card border-red-200 px-6 py-4">
        <p className="text-red-600">❌ {error}</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="magic-card w-full max-w-lg space-y-5 px-6 py-6">
      {/* Translation + Audio */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-magic-text-light">
          Traducción
        </p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-3xl font-bold text-magic-purple">
            {data.translation}
          </p>
          <AudioButton
            text={data.translation}
            audioUrl={data.audioUrl}
            label={`Escuchar "${data.translation}"`}
            size="md"
          />
        </div>
        {data.ipa && (
          <p className="mt-0.5 text-sm text-magic-text-light">
            /{data.ipa}/
          </p>
        )}
        {data.phonetic && data.phonetic !== data.ipa && (
          <p className="text-xs text-magic-text-light/60">
            Fonética nativa: {data.phonetic}
          </p>
        )}
      </div>

      {/* Explanation */}
      <div className="rounded-xl bg-magic-bg-alt/50 px-4 py-3">
        <p className="text-sm leading-relaxed text-magic-text">
          {data.explanation}
        </p>
      </div>

      {/* Example */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-magic-text-light">
          Ejemplo
        </p>
        <div className="mt-1 flex items-start gap-2">
          <p className="text-lg text-magic-text">{data.example}</p>
          <AudioButton
            text={data.example}
            label='Escuchar ejemplo'
            size="sm"
          />
        </div>
        <p className="text-sm text-magic-text-light">
          {data.exampleTranslation}
        </p>
      </div>

      {/* Definitions */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-magic-text-light">
          Definiciones
        </p>
        {data.definitions.map((def, i) => (
          <div key={i} className="rounded-lg border border-magic-purple/10 bg-white p-3">
            <p className="text-sm font-medium text-magic-purple">
              {def.definition}
            </p>
            <p className="mt-0.5 text-xs italic text-magic-text-light">
              {def.definitionEn}
            </p>
            <div className="mt-2 flex items-start gap-2">
              <p className="text-sm text-magic-text">
                &ldquo;{def.example}&rdquo;
              </p>
              <AudioButton
                text={def.example}
                label='Escuchar ejemplo'
                size="sm"
              />
            </div>
            <p className="text-xs text-magic-text-light">
              {def.exampleTranslation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
