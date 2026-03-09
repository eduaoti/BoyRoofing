"use client";

const iconClass = "w-10 h-10 mx-auto text-br-red-light benefit-icon";

export function ShieldCheckAnimated() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" className="benefit-shield" />
      <path d="M9 12l2 2 4-4" className="benefit-check" strokeWidth="2.5" />
    </svg>
  );
}

export function ClockAnimated() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" className="benefit-clock-face" />
      <g className="benefit-clock-minute" style={{ transformOrigin: "12px 12px" }}>
        <line x1="12" y1="12" x2="12" y2="6" />
      </g>
      <g className="benefit-clock-hour" style={{ transformOrigin: "12px 12px" }}>
        <line x1="12" y1="12" x2="16" y2="12" />
      </g>
    </svg>
  );
}

export function CheckBadgeAnimated() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" className="benefit-badge-circle" />
      <path d="M9 12l2 2 4-4" className="benefit-badge-check" strokeWidth="2.5" />
    </svg>
  );
}

export function SparklesAnimated() {
  return (
    <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" className="benefit-sparkle benefit-sparkle-1" />
      <path d="M19 8l.75 2.25L22 11l-2.25.75L19 14l-.75-2.25L16 11l2.25-.75L19 8z" className="benefit-sparkle benefit-sparkle-2" />
      <path d="M5 16l.75 2.25L8 19l-2.25.75L5 22l-.75-2.25L2 19l2.25-.75L5 16z" className="benefit-sparkle benefit-sparkle-3" />
    </svg>
  );
}
