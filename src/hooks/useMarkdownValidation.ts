import { useEffect, useState } from 'react';
import { validateMarkdownString } from '@/lib/validation';

// Debounced markdown validation. Empty/initial state is valid.
// ponytail: plain setTimeout debounce, no external debounce dep.
export function useMarkdownValidation(
  markdown: string,
  delayMs = 80,
): { valid: boolean; error?: string } {
  const [result, setResult] = useState<{ valid: boolean; error?: string }>({ valid: true });

  useEffect(() => {
    const id = setTimeout(() => setResult(validateMarkdownString(markdown)), delayMs);
    return () => clearTimeout(id);
  }, [markdown, delayMs]);

  return result;
}
