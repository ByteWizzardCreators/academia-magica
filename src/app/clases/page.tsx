"use client";

import Image from "next/image";

export default function ClasesPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 py-20 text-center">
      <Image
        src="/images/clases/clases-logo.png"
        alt="Clases Academia Mágica"
        width={140}
        height={140}
        className="object-contain drop-shadow-lg"
        priority
      />
      <h1 className="text-3xl font-bold text-magic-purple sm:text-5xl">
        Clases 🚧
      </h1>
      <p className="max-w-md text-lg text-magic-text-light">
        Las clases con el profesor mágico están en camino.
        <br />
        Muy pronto vas a poder aprender con lecciones interactivas.
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
