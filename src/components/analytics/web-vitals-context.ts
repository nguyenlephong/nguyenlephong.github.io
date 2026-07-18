export type WebVitalSurface = "site" | "studio";

export function resolveWebVitalSurface(pathname: string): WebVitalSurface {
  const [pathOnly] = pathname.split(/[?#]/, 1);
  const segments = pathOnly.split("/").filter(Boolean);
  return segments[1] === "studio" ? "studio" : "site";
}
