export type IntentPrefetchMode = false | null;

export function resolveIntentPrefetch(hasIntent: boolean): IntentPrefetchMode {
  return hasIntent ? null : false;
}
