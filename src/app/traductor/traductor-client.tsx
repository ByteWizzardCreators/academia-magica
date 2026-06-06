"use client";

import { useState } from "react";
import Image from "next/image";
import WizardCharacter from "@/components/wizard/WizardCharacter";
import TranslateForm from "@/components/translate/TranslateForm";
import TranslateResult from "@/components/translate/TranslateResult";
import type { TranslateResponse } from "@/lib/groq";

export default function TraductorClient() {
  const [result, setResult] = useState<TranslateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="relative flex flex-col items-center px-4 py-12 sm:py-20">
      {/* Background image with gradient overlay */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <Image
          src="/images/backgrounds/hero-bg.png"
          alt=""
          fill
          className="object-cover opacity-25"
          priority
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        {/* Gradient overlay — fades the bg at the edges so content stays readable */}
        <div className="absolute inset-0 bg-gradient-to-b from-magic-bg/80 via-magic-bg/40 to-magic-bg" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center gap-6 text-center">
        <WizardCharacter size={140} />

        <h1 className="max-w-2xl text-3xl font-bold leading-tight text-magic-purple sm:text-5xl">
          Traductor Mágico
        </h1>

        <p className="max-w-md text-lg text-magic-text-light">
          Escribí una palabra en español y el mago te va a enseñar cómo se dice en inglés.
          ¡Es divertido y fácil!
        </p>
      </section>

      {/* Translate Section */}
      <section className="relative z-10 mt-10 flex w-full flex-col items-center gap-6">
        <TranslateForm
          onResult={(data) => setResult(data as TranslateResponse)}
          onError={(msg) => setError(msg)}
          onLoading={(l) => setLoading(l)}
        />

        <TranslateResult
          data={result}
          loading={loading}
          error={error}
        />
      </section>

      {/* Features hint */}
      <section className="relative z-10 mt-20 grid gap-6 text-center sm:grid-cols-3">
        {[
          {
            icon: "🧙‍♂️",
            title: "Profe Mago",
            desc: "Te explica todo en español, como un amigo",
          },
          {
            icon: "🎯",
            title: "Ejemplos",
            desc: "Vas a ver cómo se usa en la vida real",
          },
          {
            icon: "🔊",
            title: "Pronunciación",
            desc: "Escuchás cómo se dice bien clarito",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="magic-card flex flex-col items-center gap-2 px-4 py-6 transition-transform hover:scale-105"
          >
            <span className="text-4xl">{feature.icon}</span>
            <h3 className="text-lg font-bold text-magic-purple">
              {feature.title}
            </h3>
            <p className="text-sm text-magic-text-light">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
