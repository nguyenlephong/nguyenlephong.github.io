"use client";

import { useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { track, type AnalyticsEvent } from "@/lib/analytics";

type StudioCopyButtonProps = {
  /** id of the element whose text is copied, so the text ships once in the HTML. */
  sourceId: string;
  label: string;
  copiedLabel: string;
  failedLabel: string;
  event: AnalyticsEvent;
  eventProps: Readonly<Record<string, string>>;
};

export default function StudioCopyButton({ sourceId, label, copiedLabel, failedLabel, event, eventProps }: StudioCopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");

  const copy = async () => {
    const text = document.getElementById(sourceId)?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
      track(event, { ...eventProps, success: true });
    } catch {
      setState("failed");
      track(event, { ...eventProps, success: false });
    }
    window.setTimeout(() => setState("idle"), 1800);
  };

  return (
    <button type="button" className="studio-copy" data-state={state} onClick={() => void copy()}>
      {state === "copied" ? <LuCheck aria-hidden="true" /> : <LuCopy aria-hidden="true" />}
      <span aria-live="polite">{state === "copied" ? copiedLabel : state === "failed" ? failedLabel : label}</span>
    </button>
  );
}
