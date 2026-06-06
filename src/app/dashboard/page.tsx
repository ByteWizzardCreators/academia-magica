"use client";

import WizardCharacter from "@/components/wizard/WizardCharacter";

export default function DashboardPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <WizardCharacter size={120} />
      <h1 className="text-3xl font-bold text-magic-purple sm:text-5xl">
        Mi Progreso 🚧
      </h1>
      <p className="max-w-md text-lg text-magic-text-light">
        Tu dashboard de progreso está en construcción.
        <br />
        Pronto vas a poder ver tus estrellas, rachas y logros.
      </p>
      <a
        href="/traductor"
        className="magic-gradient mt-4 inline-block rounded-xl px-8 py-3 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
      >
        Probar el Traductor mientras tanto ✨
      </a>
    </div>
  );
}
