'use client';

import { copyToClipboard, downloadMarkdown } from '@/lib/fileOps';
import { CopyIcon, DownloadIcon } from './Icons';

// Right-side export group: copy the markdown, or download it as a .md file.
// Only shown when there is actual content (hidden for an empty document); the
// group bounces in when it first appears. Copy is the primary action.
export default function ExportActions({
  content,
  onNotify,
}: {
  content: string;
  onNotify: (msg: string, type: 'error' | 'success') => void;
}) {
  const handleCopy = async () => {
    const ok = await copyToClipboard(content);
    onNotify(ok ? 'Copied to clipboard' : 'Copy failed', ok ? 'success' : 'error');
  };

  // Nothing to export from an empty document.
  if (content.trim() === '') return null;

  return (
    <div className="bounce-in flex items-center gap-2">
      <button
        type="button"
        onClick={() => downloadMarkdown(content)}
        className="inline-flex items-center gap-1.5 rounded-lg border border-hairline px-3 py-1.5 text-sm text-inksoft transition-colors hover:border-ink hover:text-ink"
      >
        <DownloadIcon className="h-4 w-4" />
        <span className="btn-label">Download .md</span>
      </button>
      <button
        type="button"
        onClick={() => void handleCopy()}
        className="inline-flex items-center gap-1.5 rounded-lg bg-mark px-3 py-1.5 text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
      >
        <CopyIcon className="h-4 w-4" />
        <span className="btn-label">Copy to clipboard</span>
      </button>
    </div>
  );
}
