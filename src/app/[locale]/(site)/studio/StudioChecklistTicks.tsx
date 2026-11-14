"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

const TICKS_KEY = "studio:ticks:v1";

function loadTicks(): Set<string> {
  try {
    const raw = window.localStorage.getItem(TICKS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set();
  }
}

function saveTicks(ticks: ReadonlySet<string>): void {
  try {
    window.localStorage.setItem(TICKS_KEY, JSON.stringify([...ticks]));
  } catch {
    // Storage blocked: ticks last for this visit only.
  }
}

/** Restores and saves checklist ticks in this browser; the checkboxes themselves are plain HTML. */
export default function StudioChecklistTicks() {
  useEffect(() => {
    const ticks = loadTicks();
    for (const input of document.querySelectorAll<HTMLInputElement>("input[data-studio-step]")) {
      input.checked = ticks.has(input.dataset["studioStep"] ?? "");
    }
    const onChange = (event: Event) => {
      const input = event.target;
      if (!(input instanceof HTMLInputElement) || !input.dataset["studioStep"]) return;
      const key = input.dataset["studioStep"];
      if (input.checked) ticks.add(key);
      else ticks.delete(key);
      saveTicks(ticks);
      const [checklistId = "", sectionId = "", stepId = ""] = key.split("/");
      track("studio_checklist_item_toggle", {
        checklist_id: checklistId,
        section_id: sectionId,
        step_id: stepId,
        checked: input.checked
      });
    };
    document.addEventListener("change", onChange);
    return () => document.removeEventListener("change", onChange);
  }, []);

  return null;
}
