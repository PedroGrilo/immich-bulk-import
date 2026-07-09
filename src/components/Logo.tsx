/**
 * Immich Bulk Import brand assets.
 *
 * <AppMark />  – the square "liquid glass" icon: a stack of photos with an
 *                import arrow badge. Recreated as vector art from the logo so
 *                it stays crisp at any size and adapts to the app icon.
 * <Wordmark />  – the tri-colour "immich bulk import" lockup.
 * <BrandLockup /> – mark + wordmark side by side.
 */

export function AppMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Immich Bulk Import"
    >
      <defs>
        <linearGradient id="ibi-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b7cff" />
          <stop offset="0.55" stopColor="#3f5bd6" />
          <stop offset="1" stopColor="#1e2a63" />
        </linearGradient>
        <linearGradient id="ibi-sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ibi-mtn" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4ade80" />
          <stop offset="1" stopColor="#16a34a" />
        </linearGradient>
        <linearGradient id="ibi-arrow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#5b8cff" />
          <stop offset="1" stopColor="#2f6bff" />
        </linearGradient>
      </defs>

      {/* Glass tile */}
      <rect x="40" y="40" width="432" height="432" rx="108" fill="url(#ibi-tile)" />
      <rect x="40" y="40" width="432" height="432" rx="108" fill="url(#ibi-sheen)" />
      <rect
        x="41.5"
        y="41.5"
        width="429"
        height="429"
        rx="106.5"
        stroke="#ffffff"
        strokeOpacity="0.35"
        strokeWidth="3"
      />

      {/* Photo stack */}
      <g transform="translate(232 226)">
        {/* back card (purple) */}
        <rect
          x="-78"
          y="-78"
          width="156"
          height="156"
          rx="30"
          fill="#b7a6ff"
          transform="rotate(-16)"
        />
        {/* middle card (light blue) */}
        <rect
          x="-80"
          y="-80"
          width="160"
          height="160"
          rx="30"
          fill="#8fb0ff"
          transform="rotate(-8)"
        />
        {/* front photo card */}
        <g>
          <rect x="-84" y="-84" width="168" height="168" rx="30" fill="#f7fafc" />
          <clipPath id="ibi-photo">
            <rect x="-70" y="-70" width="140" height="140" rx="18" />
          </clipPath>
          <g clipPath="url(#ibi-photo)">
            <rect x="-70" y="-70" width="140" height="140" fill="#eaf1f8" />
            {/* sun */}
            <circle cx="-28" cy="-30" r="20" fill="#f5b301" />
            {/* mountains */}
            <path d="M-70 70 L-14 4 L26 46 L70 -4 L70 70 Z" fill="url(#ibi-mtn)" />
            <path d="M-70 70 L4 18 L44 70 Z" fill="#22c55e" opacity="0.85" />
          </g>
        </g>
      </g>

      {/* Import arrow badge */}
      <g transform="translate(346 350)">
        <circle cx="0" cy="0" r="66" fill="#ffffff" />
        <circle cx="0" cy="0" r="66" fill="url(#ibi-sheen)" />
        <path
          d="M-26 0 H20 M4 -18 L26 0 L4 18"
          stroke="url(#ibi-arrow)"
          strokeWidth="16"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  );
}

export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-semibold tracking-tight lowercase ${className}`}>
      <span style={{ color: 'rgb(var(--text))' }}>immich </span>
      <span style={{ color: 'rgb(var(--accent))' }}>bulk </span>
      <span style={{ color: 'rgb(var(--accent-2))' }}>import</span>
    </span>
  );
}

export function BrandLockup({
  size = 40,
  markClassName,
  className = '',
  textClassName = 'text-lg',
}: {
  size?: number;
  markClassName?: string;
  className?: string;
  textClassName?: string;
}) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <AppMark size={size} className={markClassName} />
      <Wordmark className={textClassName} />
    </div>
  );
}
