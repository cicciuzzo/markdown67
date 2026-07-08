"use client";

import { useEffect, useRef } from "react";

// Minimal, chromeless demo loop: muted autoplay so it needs no controls.
// Respects prefers-reduced-motion — those users get a paused video with controls
// instead of an involuntary loop.
export default function VideoDemo() {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      v.pause();
      v.loop = false;
    }
  }, []);

  return (
    <video
      ref={ref}
      className="block h-auto w-full"
      src="/md67-demo.mp4"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-label="Markdown67 in action: the visual and raw Markdown panels editing in sync"
    />
  );
}
