import type { Metadata, Viewport } from "next";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";
import DevArt from "@/components/DevArt";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const SITE = "https://markdown67.app";
const DESCRIPTION =
  "A free, client-side Markdown editor. Write in a visual, Notion-style editor or in raw Markdown, kept in sync, then export a ready-to-use .md file. No account, no server — your text never leaves your browser.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Markdown67 — visual + raw Markdown editor, no sign-up",
    template: "%s · Markdown67",
  },
  description: DESCRIPTION,
  applicationName: "Markdown67",
  keywords: [
    "markdown editor",
    "online markdown editor",
    "wysiwyg markdown editor",
    "notion-style markdown",
    "free markdown editor",
    "markdown editor no signup",
    "raw markdown editor",
    "export markdown",
    "client-side markdown editor",
    ".md editor",
  ],
  authors: [{ name: "Romano Battiti", url: "https://www.linkedin.com/in/battiti/" }],
  creator: "Romano Battiti",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "MD67", statusBarStyle: "default" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  category: "productivity",
  openGraph: {
    type: "website",
    url: SITE + "/",
    siteName: "Markdown67",
    title: "Markdown67 — visual + raw Markdown editor, no sign-up",
    description:
      "Write Markdown without memorizing syntax. Visual + raw editors in sync, export ready-to-use .md. 100% client-side — nothing leaves your browser.",
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Markdown67 — visual + raw Markdown editor" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Markdown67 — visual + raw Markdown editor",
    description:
      "Free, client-side Markdown editor. Visual + raw in sync, export .md. No account, nothing leaves your browser.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#E9EBF0" },
    { media: "(prefers-color-scheme: dark)", color: "#15161C" },
  ],
};

// Anti-flash: set the theme on <html> before first paint (E9). Static-export
// safe — pure client script, no server. Stored choice wins; otherwise follow the
// OS preference. Kept in sync with EditorApp's toggle (localStorage `md67_theme`).
const themeScript = `(function(){try{var s=localStorage.getItem('md67_theme');document.documentElement.dataset.theme=(s==='light'||s==='dark')?s:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');}catch(e){document.documentElement.dataset.theme='light';}})();`;

// Structured data so search engines and AI assistants can understand and cite
// the app without relying on rendered client content.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Markdown67",
  url: SITE,
  applicationCategory: "ProductivityApplication",
  operatingSystem: "Web browser",
  browserRequirements: "Requires JavaScript. Desktop viewport (min 1024px) for the editor.",
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Visual (WYSIWYG) and raw Markdown editing kept in sync",
    "Export and download .md files",
    "Copy to clipboard",
    "Upload and drag-and-drop .md files",
    "Local autosave for 72 hours",
    "No account, fully client-side — nothing leaves the browser",
  ],
  author: { "@type": "Person", name: "Romano Battiti", url: "https://www.linkedin.com/in/battiti/" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        {/* First body child: runs before the rest of the body paints, so the
            theme is set with no flash (App Router discourages a manual <head>). */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <PwaRegister />
        <DevArt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
