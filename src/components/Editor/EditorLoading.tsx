'use client';

import { useEffect, useState } from 'react';

// Same full-screen style as MobileBlocker. The shrug flips every 0.3s while the
// editor chunk loads.
const FRAMES = ['¯\\(ツ)_-', '-_(ツ)/¯'];

export default function EditorLoading() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % FRAMES.length), 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-paper p-8 text-center">
      <div>
        <p className="mb-4 select-none font-mono text-3xl text-ink" aria-hidden>
          {FRAMES[i]}
        </p>
        <p className="text-sm text-inksoft">Loading Markdown67..</p>
      </div>
    </div>
  );
}
