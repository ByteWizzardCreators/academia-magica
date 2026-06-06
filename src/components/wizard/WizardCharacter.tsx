"use client";

import Image from "next/image";
import { useState } from "react";

interface Props {
  size?: number;
}

export default function WizardCharacter({ size = 120 }: Props) {
  const [sparkle, setSparkle] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const triggerSparkle = () => {
    setSparkle(true);
    setTimeout(() => setSparkle(false), 600);
  };

  return (
    <button
      onClick={triggerSparkle}
      className="relative inline-flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer"
      style={{ width: size, height: size }}
      aria-label="¡Mago!"
    >
      {/* Sparkle effect */}
      {sparkle && (
        <span className="absolute inset-0 animate-ping rounded-full bg-magic-gold/30" />
      )}

      {/* SVG fallback — always rendered (fades out when image loads) */}
      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        className={`absolute drop-shadow-lg transition-opacity duration-500 ${
          imgLoaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <rect x="35" y="50" width="50" height="55" rx="10" fill="#4A0E7E" />
        <polygon points="60,5 30,50 90,50" fill="#2D054D" />
        <rect x="25" y="48" width="70" height="8" rx="4" fill="#FFB800" />
        <circle cx="60" cy="60" r="18" fill="#FDEBD0" />
        <circle cx="53" cy="58" r="3" fill="#2D054D" />
        <circle cx="67" cy="58" r="3" fill="#2D054D" />
        <path d="M52,68 Q60,76 68,68" stroke="#2D054D" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M45,72 Q60,95 75,72" fill="#E8D5F5" />
        <line x1="85" y1="55" x2="105" y2="35" stroke="#8B4513" strokeWidth="3" strokeLinecap="round" />
        <polygon points="105,35 108,28 112,32" fill="#FFB800" />
        <polygon
          points="110,26 112,30 116,30 113,33 114,37 110,35 106,37 107,33 104,30 108,30"
          fill={sparkle ? "#FFD84D" : "#FFB800"}
          className={sparkle ? "animate-pulse" : ""}
        />
        <rect x="20" y="60" width="18" height="6" rx="3" fill="#4A0E7E" />
        <rect x="82" y="60" width="18" height="6" rx="3" fill="#4A0E7E" />
        <ellipse cx="45" cy="105" rx="12" ry="5" fill="#2D054D" />
        <ellipse cx="75" cy="105" rx="12" ry="5" fill="#2D054D" />
      </svg>

      {/* Real image — fades in when loaded */}
      <Image
        src="/images/wizard/wizard-main.png"
        alt="Mago"
        width={size}
        height={size}
        className={`drop-shadow-lg object-contain transition-opacity duration-500 ${
          imgLoaded ? "opacity-100" : "opacity-0"
        }`}
        priority
        onLoad={() => setImgLoaded(true)}
      />
    </button>
  );
}
