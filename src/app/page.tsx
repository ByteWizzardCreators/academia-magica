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
      {/* Background — subtle texture for the whole page */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <Image
          src="/images/backgrounds/hero-bg.png"
          alt=""
          fill
          className="object-cover opacity-10"
          priority
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-magic-bg via-magic-bg to-magic-bg" />
      </div>

      {/* HERO — full-viewport dramatic intro */}
      <section className="relative z-10 flex min-h-[90vh] w-full flex-col items-center justify-center gap-10 px-4 overflow-hidden">
        {/* Deep purple gradient background for the hero area */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A0230] via-[#2D054D] to-magic-purple/80" />

        {/* Radial gold glow behind the wizard */}
        <div className="absolute top-[30%] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-magic-gold/10 blur-[100px]" />

        {/* Floating decorative sparkles */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <span className="absolute left-[15%] top-[20%] h-1 w-1 animate-pulse rounded-full bg-magic-gold/60" />
          <span
            className="absolute left-[75%] top-[15%] h-2 w-2 animate-pulse rounded-full bg-magic-gold/40"
            style={{ animationDelay: "1s" }}
          />
          <span
            className="absolute left-[25%] top-[70%] h-1.5 w-1.5 animate-pulse rounded-full bg-white/30"
            style={{ animationDelay: "2s" }}
          />
          <span
            className="absolute left-[80%] top-[60%] h-1 w-1 animate-pulse rounded-full bg-magic-gold/50"
            style={{ animationDelay: "0.5s" }}
          />
          <span
            className="absolute left-[50%] top-[85%] h-2 w-2 animate-pulse rounded-full bg-white/20"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <WizardCharacter size={200} />

          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold leading-tight text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] sm:text-7xl">
              Aprendé inglés con
              <span className="text-magic-gold drop-shadow-[0_0_16px_rgba(255,184,0,0.6)]">
                {" "}magia
              </span>
            </h1>
            <p className="mt-6 text-lg text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)] sm:text-xl">
              Un profesor mágico con IA para chicos de 6 a 10 años.
              <br />
              Divertido, educativo y mágico.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <a
              href="/traductor"
              className="magic-gradient inline-block rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-lg shadow-magic-purple/30 transition-all hover:scale-110 hover:shadow-xl active:scale-95"
            >
              Probar Traductor ✨
            </a>
            <a
              href="/clases"
              className="inline-block rounded-2xl border-2 border-white/30 bg-white/10 px-10 py-4 text-lg font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:border-magic-gold hover:bg-magic-gold/20 hover:scale-110 active:scale-95"
            >
              Ver Clases 📚
            </a>
          </div>
        </div>

        {/* Bottom fade transition */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-magic-bg to-transparent" />
      </section>

      {/* Features / Products Section */}
      <section className="relative z-10 w-full max-w-5xl px-4 pb-24 -mt-16">
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="magic-card group flex flex-col items-center gap-4 px-6 py-8 text-center shadow-lg transition-all hover:-translate-y-2 hover:shadow-xl"
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
