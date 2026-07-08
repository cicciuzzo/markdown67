import type { Metadata } from "next";
import Link from "next/link";
import { ColumnsIcon, WifiOffIcon, DownloadIcon, MarkdownIcon } from "@/components/Icons";
import ThemeToggle from "@/components/ThemeToggle";
import Shrug from "@/components/Shrug";
import VideoDemo from "@/components/VideoDemo";

export const metadata: Metadata = {
  title: "About: what it is, how it works, FAQ",
  description:
    "Markdown67 is a free, client-side Markdown editor: a visual, Notion-style editor and a raw Markdown view kept in sync. No account, nothing leaves your browser. Learn how it works and read the FAQ.",
  alternates: { canonical: "/about" },
  openGraph: {
    type: "article",
    url: "https://markdown67.app/about",
    title: "About Markdown67: visual + raw Markdown editor",
    description:
      "How Markdown67 works: visual + raw editors in sync, export ready-to-use .md, 100% client-side. Features and FAQ.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
};

const FEATURES = [
  {
    icon: ColumnsIcon,
    title: "Visual + raw, in sync",
    body: "Type in a Notion-style visual editor or edit raw Markdown. Switch sides anytime; the Markdown is always the source of truth.",
  },
  {
    icon: WifiOffIcon,
    title: "Nothing leaves your browser",
    body: "No account, no server, no upload. Everything runs client-side and your text stays on your device.",
  },
  {
    icon: DownloadIcon,
    title: "Export in one click",
    body: "Download a clean .md file, copy the Markdown to your clipboard, or drag-and-drop a file to edit it.",
  },
  {
    icon: MarkdownIcon,
    title: "GitHub Flavored Markdown",
    body: "Headings, lists, tables, code blocks, quotes, links and emphasis: the syntax you already expect.",
  },
];

const FAQ = [
  {
    q: "What is Markdown67?",
    a: "A free, browser-based Markdown editor with a visual (Notion-style) editor and a raw Markdown view kept in sync. Write however you prefer and export a ready-to-use .md file.",
  },
  {
    q: "Do I need an account?",
    a: "No. There is no sign-up, no email and no login. Open the page and start writing.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Markdown67 runs entirely in your browser. Nothing you type is uploaded or sent to a server, and drafts are saved locally on your device for 72 hours.",
  },
  {
    q: "Can I export or import my Markdown?",
    a: "Yes. Download a ready-to-use .md file, copy the Markdown to your clipboard, or upload and drag-and-drop an existing .md file to keep editing it.",
  },
  {
    q: "Does it work on mobile?",
    a: "Yes. On narrow screens the two panels collapse to one full-width editor at a time; switch between the visual and raw view with the selector on top. Editing is still most comfortable on a larger screen.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function About() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* sticky bar — reveals as you scroll down (CSS-only) */}
      <div className="about-sticky -mx-6 mb-[-1px]">
        <div className="flex items-center justify-between gap-4 border-b border-hairline bg-surface px-6 py-3 shadow-card">
          <Link href="/" className="flex select-none items-center gap-2">
            <span
              aria-hidden
              className="grid h-6 w-6 place-items-center rounded-md bg-mark font-mono text-sm font-bold text-ink"
            >
              ツ
            </span>
            <span className="font-display text-base font-bold leading-none tracking-tight text-ink">
              Markdown67
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/"
              className="rounded-lg bg-mark px-3.5 py-1.5 text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
            >
              Start writing
            </Link>
          </div>
        </div>
      </div>

      {/* top bar */}
      <div className="mb-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex select-none items-center gap-2">
          <span
            aria-hidden
            className="grid h-7 w-7 place-items-center rounded-md bg-mark font-mono text-base font-bold text-ink"
          >
            ツ
          </span>
          <span className="font-display text-[19px] font-bold leading-none tracking-tight text-ink">
            Markdown67
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="rounded-lg bg-mark px-4 py-2 text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
          >
            Start writing
          </Link>
        </div>
      </div>

      {/* hero */}
      <header className="mb-16">
        <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
          Write Markdown{" "}
          <span className="mark-static mark-draw">the way you think it</span>
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-inksoft">
          Markdown67 is a free, client-side Markdown editor. Type in a visual, Notion-style editor
          or in raw Markdown, then export a ready-to-use{" "}
          <span className="font-mono text-ink">.md</span> file. No account, and nothing you type ever
          leaves your browser.
        </p>
      </header>

      {/* demo */}
      <section className="mb-16">
        <div className="group relative overflow-hidden rounded-2xl border border-hairline bg-surface shadow-card ring-1 ring-black/10">
          <VideoDemo />
          <Link
            href="/"
            aria-label="Start writing"
            className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
          >
            <span className="rounded-lg bg-mark px-5 py-2.5 text-sm font-medium text-ink shadow-sm">
              Start writing
            </span>
          </Link>
        </div>
      </section>

      {/* features */}
      <section className="mb-16">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-ink">What you get</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-xl border border-hairline bg-surface p-5 shadow-card">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-ink">
                <f.icon className="h-5 w-5 shrink-0 text-inksoft" />
                {f.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-inksoft">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="mb-16">
        <h2 className="mb-4 font-display text-2xl font-bold tracking-tight text-ink">How it works</h2>
        <p className="max-w-2xl text-base leading-relaxed text-inksoft">
          Two panels sit side by side: a visual editor on the left and the raw Markdown on the right.
          Edit either one and the other keeps up instantly. Between them sits a little{" "}
          <span className="font-mono text-ink">¯\(ツ)/¯</span>. Click it to switch which side you are
          writing in. Your work autosaves to your browser for 72 hours, so a refresh never loses it.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-ink">FAQ</h2>
        <dl className="space-y-6">
          {FAQ.map((f) => (
            <div key={f.q}>
              <dt className="font-display text-base font-bold text-ink">{f.q}</dt>
              <dd className="mt-1.5 max-w-2xl text-sm leading-relaxed text-inksoft">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section className="mb-16 rounded-2xl border border-hairline bg-surface p-8 text-center shadow-card">
        <p className="font-display text-2xl font-bold tracking-tight text-ink">Ready to write?</p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-inksoft">
          No sign-up, no setup. Open the editor and start typing.
        </p>
        <Link
          href="/"
          className="mt-5 inline-block rounded-lg bg-mark px-5 py-2.5 text-sm font-medium text-ink shadow-sm transition-[filter] hover:brightness-95"
        >
          Start writing
        </Link>
      </section>

      <footer className="text-center text-xs text-inksoft">
        Made with <Shrug /> by{" "}
        <a
          href="https://www.linkedin.com/in/battiti/"
          target="_blank"
          rel="noreferrer noopener"
          className="font-medium underline decoration-hairline underline-offset-2 hover:text-ink"
        >
          Romano Battiti
        </a>
        <div className="mt-1">
          Free &amp; open source under{" "}
          <a
            href="https://github.com/cicciuzzo/markdown67/blob/main/LICENSE"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium underline decoration-hairline underline-offset-2 hover:text-ink"
          >
            MIT
          </a>
          {" · "}
          <a
            href="https://github.com/cicciuzzo/markdown67"
            target="_blank"
            rel="noreferrer noopener"
            className="font-medium underline decoration-hairline underline-offset-2 hover:text-ink"
          >
            GitHub
          </a>
        </div>
      </footer>
    </main>
  );
}
