'use client';

import { useEffect, useState } from 'react';

// Reusable light/dark toggle. Same semantics as EditorApp's inline toggle:
// the inline script in layout.tsx resolves the effective theme onto
// <html data-theme> before paint; we read it back, persist explicit choices to
// localStorage `md67_theme`, and let matchMedia keep auto users (no stored
// choice) tracking the OS while the page is open.
type Theme = 'light' | 'dark';

const iconProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function SunIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg className={className} {...iconProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle({ className }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const d = document.documentElement.dataset.theme;
    setTheme(d === 'dark' ? 'dark' : 'light');
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      try {
        if (localStorage.getItem('md67_theme')) return; // user chose explicitly
      } catch {
        /* ignore */
      }
      const next = mq.matches ? 'dark' : 'light';
      setTheme(next);
      document.documentElement.dataset.theme = next;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Write <html data-theme> only on an explicit action (never on mount), so the
  // value the anti-flash script resolved from the OS preference isn't clobbered.
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('md67_theme', next);
    } catch {
      /* private mode: theme still applies for this session */
    }
    document.documentElement.dataset.theme = next;
  };

  return (
    <button
      type="button"
      aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      className={
        className ??
        'grid h-7 w-7 place-items-center rounded-md border border-hairline bg-surface text-inksoft shadow-sm transition hover:text-ink'
      }
      onClick={toggleTheme}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
