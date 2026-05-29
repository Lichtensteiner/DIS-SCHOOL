/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LDSLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  light?: boolean;
}

export default function LDSLogo({
  className = '',
  size = 'md',
  showText = true,
  light = true, // By default, let's keep text contrast perfect for the dark background
}: LDSLogoProps) {
  const [imageError, setImageError] = React.useState(false);

  // Dimensions based on size
  const baseSize = {
    sm: { width: 32, height: 32 },
    md: { width: 56, height: 56 },
    lg: { width: 88, height: 88 },
    xl: { width: 140, height: 140 },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {!imageError ? (
        <img
          src="/logo.png"
          alt="LDS DIS'SCHOOL Logo"
          referrerPolicy="no-referrer"
          className="object-contain drop-shadow-lg transition-transform hover:scale-105 duration-300 rounded-xl"
          style={{ width: `${baseSize.width}px`, height: `${baseSize.height}px` }}
          onError={() => setImageError(true)}
        />
      ) : (
        /* Pristine Modern Academic Crest SVG fallback */
        <svg
          width={baseSize.width}
          height={baseSize.height}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-lg transition-transform hover:scale-105 duration-300"
        >
          <defs>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF4D0" />
              <stop offset="50%" stopColor="#D4AF37" />
              <stop offset="100%" stopColor="#AA7C11" />
            </linearGradient>
          </defs>

          {/* 1. Shield Outline representing Pôle de Confiance / Academic Security */}
          <path
            d="M 50 12 C 50 12, 85 24, 85 45 C 85 64, 68 78, 50 88 C 32 78, 15 64, 15 45 C 15 24, 50 12, 50 12 Z"
            fill="#0F172A"
            stroke="url(#goldGrad)"
            strokeWidth="3.5"
            strokeLinejoin="round"
            opacity="0.95"
          />

          {/* Inner thin accent outline */}
          <path
            d="M 50 18 C 50 18, 79 28, 79 45 C 79 60, 65 72, 50 81 C 35 72, 21 60, 21 45 C 21 28, 50 18, 50 18 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="1"
            opacity="0.35"
          />

          {/* 2. Elegant Stylized Open Book in the core */}
          <path
            d="M 50 63 C 58 55, 68 55, 75 58 V 38 C 68 35, 58 35, 50 43 C 42 35, 32 35, 25 38 V 58 C 32 55, 42 55, 50 63 Z"
            fill="none"
            stroke="url(#goldGrad)"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          
          {/* Central golden bind bookmark line */}
          <line
            x1="50"
            y1="43"
            x2="50"
            y2="63"
            stroke="url(#goldGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* 3. Sleek, Modern Graduation Hat / Mortarboard on Top */}
          <g id="mini-cap" transform="translate(0, -6)">
            <polygon
              points="50,22 74,31 50,40 26,31"
              fill="#0F172A"
              stroke="url(#goldGrad)"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            {/* Tassel line */}
            <path
              d="M 50 31.5 Q 38 31.5 34 40"
              stroke="url(#goldGrad)"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Small star icon between book and cap */}
            <polygon
              points="50,45 51.5,48.5 55,48.5 52,50.5 53.5,54 50,52 46.5,54 48,50.5 45,48.5 48.5,48.5"
              fill="url(#goldGrad)"
            />
          </g>
        </svg>
      )}

      {/* Simplified, elegant Brand Text below the vector mark */}
      {showText && (
        <div className="mt-3 text-center">
          <p
            className={`font-mono uppercase tracking-[0.2em] text-amber-500 font-bold ${
              size === 'sm' ? 'text-[8px]' : size === 'md' ? 'text-[11px]' : size === 'lg' ? 'text-sm' : 'text-base'
            } mt-1`}
          >
            Soutien Scolaire d&apos;Élite
          </p>
        </div>
      )}
    </div>
  );
}
