"use client";

import { useEffect } from "react";

const lastReadKey = (module: string) => `studio:last-read:${module}`;

function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Private mode or blocked storage: the line still works, it just forgets.
  }
}

/**
 * Keeps the module line in step with the reader: the stop for the part in view
 * is current, and the part read last time carries a flag on return.
 */
export default function StudioReadingState({ module }: Readonly<{ module: string }>) {
  useEffect(() => {
    const line = document.querySelector<HTMLElement>(`[data-studio-line="${module}"]`);
    if (!line) return;
    const stops = new Map(
      [...line.querySelectorAll<HTMLElement>("[data-studio-stop]")].map((stop) => [stop.dataset["studioStop"] ?? "", stop])
    );
    const remembered = readStorage(lastReadKey(module));
    if (remembered && remembered !== [...stops.keys()][0]) stops.get(remembered)?.setAttribute("data-last-read", "true");

    const parts = [...document.querySelectorAll<HTMLElement>("[data-studio-part]")];
    const setCurrent = (id: string) => {
      for (const [stopId, stop] of stops) {
        if (stopId === id) stop.setAttribute("aria-current", "true");
        else stop.removeAttribute("aria-current");
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = (top?.target as HTMLElement | undefined)?.dataset["studioPart"];
        if (!id || !stops.has(id)) return;
        setCurrent(id);
        writeStorage(lastReadKey(module), id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    for (const part of parts) observer.observe(part);
    return () => observer.disconnect();
  }, [module]);

  return null;
}
