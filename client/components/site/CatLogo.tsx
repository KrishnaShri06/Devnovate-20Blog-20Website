import React from "react";

export function CatLogo({ size = 32 }: { size?: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600"
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        width={Math.round(size * 0.8)}
        height={Math.round(size * 0.8)}
        className="text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M8 9 L6 5 L10 8" />
        <path d="M16 9 L18 5 L14 8" />
        <circle cx="12" cy="14" r="5" />
        <circle cx="10" cy="13" r="0.5" fill="currentColor" stroke="none" />
        <circle cx="14" cy="13" r="0.5" fill="currentColor" stroke="none" />
        <path d="M11.5 15.5 L12 16 L12.5 15.5" />
        <path d="M4 13 L8 13" />
        <path d="M4 15 L8 15" />
        <path d="M16 13 L20 13" />
        <path d="M16 15 L20 15" />
      </svg>
    </span>
  );
}
