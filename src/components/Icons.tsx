// Small inline stroke icons (Lucide-style geometry, no dependency). They inherit
// color via `currentColor` and size via className (default 1rem square).

type IconProps = { className?: string };

const common = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

export function TrashIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

export function CopyIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function DownloadIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M7 10l5 5 5-5" />
      <path d="M12 15V3" />
    </svg>
  );
}

export function UploadIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v12" />
    </svg>
  );
}

// Two synced panels — "Visual + raw, in sync".
export function ColumnsIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M12 3v18" />
    </svg>
  );
}

// Wi-Fi off — "Nothing leaves your browser".
export function WifiOffIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <path d="M2 3l20 20" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0" />
      <path d="M5 12.9a10 10 0 0 1 5.2-2.6" />
      <path d="M19 12.9a10 10 0 0 0-3.7-2.4" />
      <path d="M2 8.8a15 15 0 0 1 4.2-2.5" />
      <path d="M22 8.8a15 15 0 0 0-8.6-2.7" />
      <path d="M12 20h.01" />
    </svg>
  );
}

// Markdown "M▾" — "GitHub Flavored Markdown".
export function MarkdownIcon({ className = 'h-4 w-4' }: IconProps) {
  return (
    <svg className={className} {...common}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M7 15V9l2.5 3L12 9v6" />
      <path d="M17 9v3.5" />
      <path d="M15 12l2 2 2-2" />
    </svg>
  );
}
