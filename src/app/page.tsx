"use client";

import Image from "next/image";
import WizardCharacter from "@/components/wizard/WizardCharacter";

const FEATURES = [
  {
    href: "/traductor",
    icon: "✨",
    title: "Traductor Mágico",
    status: "Ya disponible",
    desc: "Escribí una palabra y el mago te enseña cómo se dice en inglés con ejemplos y pronunciación.",
    cta: "Probar traductor →",
  },
  {
    href: "/clases",
    icon: "📚",
    title: "Clases",
    status: "Próximamente",
    desc: "Lecciones interactivas con IA adaptadas a tu nivel. Aprendé jugando.",
    cta: "Ver clases →",
  },
  {
    href: "/dashboard",
    icon: "📊",
    title: "Mi Progreso",
    status: "Próximamente",
    desc: "Seguí tu avance, estrellas, rachas y logros. Cada día cuenta.",
    cta: "Ver progreso →",
  },
];

export default function LandingPage() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Background image with gradient overlay */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
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
        <div className="absolute inset-0 bg-gradient-to-b from-magic-bg/90 via-magic-bg/60 to-magic-bg" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[70vh] flex-col items-center justify-center gap-8 px-4 py-20 text-center">
        <WizardCharacter size={160} />

        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold leading-tight text-magic-purple sm:text-6xl">
            Aprendé inglés con
            <span className="text-magic-gold"> magia</span>
          </h1>
          <p className="mt-4 text-lg text-magic-text-light sm:text-xl">
            Un profesor mágico con IA para chicos de 6 a 10 años.
            <br />
            Divertido, educativo y mágico.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/traductor"
            className="magic-gradient inline-block rounded-xl px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
          >
            Probar Traductor ✨
          </a>
          <a
            href="/clases"
            className="inline-block rounded-xl border-2 border-magic-purple/30 px-8 py-3 text-lg font-bold text-magic-purple transition-all hover:border-magic-gold hover:bg-magic-gold/10 hover:scale-105 active:scale-95"
          >
            Ver Clases 📚
          </a>
        </div>
      </section>

      {/* Features / Products Section */}
      <section className="relative z-10 w-full max-w-5xl px-4 pb-24">
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="magic-card group flex flex-col items-center gap-4 px-6 py-8 text-center transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <span className="text-5xl">{feature.icon}</span>

              <div>
                <h3 className="text-xl font-bold text-magic-purple">
                  {feature.title}
                </h3>
                <span
                  className={`mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${
                    feature.status === "Ya disponible"
                      ? "bg-green-100 text-green-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {feature.status}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-magic-text-light">
                {feature.desc}
              </p>

              <span className="mt-auto text-sm font-bold text-magic-gold transition-all group-hover:translate-x-1">
                {feature.cta}
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
