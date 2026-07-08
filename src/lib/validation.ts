import { marked } from 'marked';

export function validateMarkdownString(input: string): { valid: boolean; error?: string } {
  if (input === '') return { valid: true };
  try {
    marked.parse(input, { gfm: true });
    return { valid: true };
  } catch (e) {
    // ponytail: marked rarely throws on normal text; defensive gate only
    return { valid: false, error: e instanceof Error ? e.message : String(e) };
  }
}

export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!file.name.toLowerCase().endsWith('.md')) {
    return { valid: false, error: 'File must have a .md extension' };
  }
  return { valid: true };
}
