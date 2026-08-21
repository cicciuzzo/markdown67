'use client';

import { useEffect, useRef } from 'react';

// A little easter egg for anyone who opens devtools or View Source.
// No `-->` anywhere in the art, so it can't break the HTML comment below.
const ART = `
███╗   ███╗██████╗  ██████╗ ███████╗
████╗ ████║██╔══██╗██╔════╝ ╚════██║
██╔████╔██║██║  ██║██║  ███╗   ██╔═╝
██║╚██╔╝██║██║  ██║██║   ██║  ██╔╝
██║ ╚═╝ ██║██████╔╝╚██████╔╝  ██║
╚═╝     ╚═╝╚═════╝  ╚═════╝   ╚═╝   ツ

Markdown67 — made by Romano Battiti — https://romanobattiti.com/
`;

export default function DevArt() {
  const ranOnce = useRef(false);

  useEffect(() => {
    if (ranOnce.current) return; // guard StrictMode double-invoke
    ranOnce.current = true;
    console.log('%c' + ART, 'font-family:monospace; color:#2563eb');
  }, []);

  // Also surface it in View Source / Elements as an HTML comment.
  return <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: '\n<!--\n' + ART + '\n-->\n' }} />;
}
