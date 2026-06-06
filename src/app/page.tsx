"use client";

import Image from "next/image";

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
      {/* Hero section with background */}
      <section className="relative flex min-h-[85vh] w-full flex-col items-center justify-center gap-8 px-4 py-20">
        {/* Background image with soft overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/backgrounds/hero-bg.png"
            alt=""
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-magic-bg/70 via-magic-bg/30 to-magic-bg" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-6">
          {/* Logo */}
          <Image
            src="/images/logo/logo.png"
            alt="Academia Mágica"
            width={180}
            height={180}
            className="object-contain drop-shadow-lg"
            priority
          />

          <div className="max-w-2xl text-center">
            <h1 className="text-4xl font-bold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)] sm:text-6xl">
              Aprendé inglés con{" "}
              <span className="text-magic-gold">magia</span>
            </h1>
            <p className="mt-4 text-lg text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.3)] sm:text-xl">
              Un profesor mágico con IA para chicos de 6 a 10 años.
              <br />
              Divertido, educativo y mágico.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="/traductor"
              className="magic-gradient rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Probar Traductor ✨
            </a>
            <a
              href="/clases"
              className="rounded-2xl border-2 border-white/40 bg-white/10 px-10 py-4 text-lg font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:border-magic-gold hover:bg-magic-gold/20 hover:scale-105 active:scale-95"
            >
              Ver Clases 📚
            </a>
          </div>
        </div>
      </section>

      {/* Features / Products Section */}
      <section className="w-full max-w-5xl px-4 pb-24 pt-16">
        <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <a
              key={feature.title}
              href={feature.href}
              className="magic-card flex flex-col items-center gap-4 px-6 py-8 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
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
