"use client";

import Image from "next/image";
import Link from "next/link";

const FEATURES = [
  {
    href: "/traductor",
    img: "/images/wizard/wizard-main.png",
    title: "Traductor Mágico",
    status: "Ya disponible",
    desc: "Escribí una palabra y el mago te enseña cómo se dice en inglés con ejemplos y pronunciación.",
    cta: "Probar traductor →",
  },
  {
    href: "/clases",
    img: "/images/clases/clases-logo.png",
    title: "Clases",
    status: "Próximamente",
    desc: "Lecciones interactivas con IA adaptadas a tu nivel. Aprendé jugando.",
    cta: "Ver clases →",
  },
  {
    href: "/dashboard",
    img: null,
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
      {/* HERO — full-viewport dramatic impact */}
      <section className="relative flex min-h-[90vh] w-full flex-col items-center justify-center gap-10 px-4 py-20 overflow-hidden">
        {/* Background image — high impact */}
        <div className="absolute inset-0">
          <Image
            src="/images/backgrounds/hero-bg.png"
            alt=""
            fill
            className="object-cover opacity-80"
            priority
          />
          {/* Subtle gold glow behind the logo — doesn't hide the image */}
          <div className="absolute top-[30%] left-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-magic-gold/15 blur-[120px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-8">
          {/* Logo with stronger glow */}
          <Image
            src="/images/logo/logo.png"
            alt="Academia Mágica"
            width={220}
            height={220}
            className="object-contain drop-shadow-[0_0_30px_rgba(255,184,0,0.4)]"
            priority
          />

          <div className="max-w-3xl text-center">
            <h1 className="text-6xl font-bold leading-tight text-white drop-shadow-[0_6px_24px_rgba(0,0,0,0.85)] sm:text-8xl">
              Aprendé inglés con{" "}
              <span className="text-magic-gold drop-shadow-[0_0_40px_rgba(255,184,0,0.95)]">
                magia
              </span>
            </h1>
            <p className="mt-6 text-xl font-semibold text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] sm:text-2xl">
              Un profesor mágico con IA para chicos de 6 a 10 años.
              <br />
              Divertido, educativo y mágico.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="/traductor"
              className="magic-gradient rounded-2xl px-10 py-4 text-lg font-bold text-white shadow-lg shadow-magic-purple/30 transition-all hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Probar Traductor ✨
            </a>
            <Link
              href="/clases"
              className="rounded-2xl border-2 border-white/50 bg-white/10 px-10 py-4 text-lg font-bold text-white shadow-lg backdrop-blur-sm transition-all hover:border-magic-gold hover:bg-magic-gold/20 hover:scale-105 active:scale-95"
            >
              Ver Clases 📚
            </Link>
          </div>
        </div>

        {/* Bottom fade — hero image → gradient section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-magic-purple-dark to-transparent" />
      </section>

      {/* Features / Products Section — wrapped in purple gradient */}
      <div className="w-full bg-gradient-to-b from-magic-purple-dark via-magic-purple to-magic-bg">
        <section className="mx-auto w-full max-w-5xl px-4 pb-24 pt-20">
          <div className="grid gap-8 md:grid-cols-3">
          {FEATURES.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className="magic-card flex flex-col items-center gap-4 px-6 py-8 text-center shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Image or emoji for the card */}
              {feature.img ? (
                <Image
                  src={feature.img}
                  alt={feature.title}
                  width={72}
                  height={72}
                  className="object-contain"
                />
              ) : (
                <span className="text-5xl">{feature.icon}</span>
              )}

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
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom fade — gradient section → footer */}
      <div className="h-16 bg-gradient-to-t from-magic-bg to-transparent" />
      </div>
    </div>
  );
}
