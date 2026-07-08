import Link from "next/link";
import EditorContainer from "@/components/Editor/EditorContainer";

export default function Home() {
  return (
    <>
      {/*
        Crawlable summary for search engines and AI assistants. Visually hidden
        (the app UI is the visible experience); the full, visible version lives
        on /about.
      */}
      <section className="sr-only">
        <h1>Markdown67 — free visual and raw Markdown editor</h1>
        <p>
          Markdown67 is a free, client-side Markdown editor. Write in a visual,
          Notion-style editor or in raw Markdown — the two panels stay in sync — then
          export a ready-to-use .md file. There is no account and no server: your text
          never leaves your browser, and drafts are saved locally for 72 hours.
        </p>
        <p>
          <Link href="/about">Learn more about Markdown67</Link>
        </p>
      </section>

      <EditorContainer />
    </>
  );
}
