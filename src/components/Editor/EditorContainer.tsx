'use client';

import dynamic from 'next/dynamic';
import EditorLoading from './EditorLoading';

// SSR-safe boundary. BlockNote's editor touches `document` during render, which
// crashes static prerender, so the real app is loaded client-only (ssr: false).
// Phase 4 can import this default export directly into a page.
const EditorApp = dynamic(() => import('./EditorApp'), {
  ssr: false,
  loading: () => <EditorLoading />,
});

export default function EditorContainer() {
  return <EditorApp />;
}
