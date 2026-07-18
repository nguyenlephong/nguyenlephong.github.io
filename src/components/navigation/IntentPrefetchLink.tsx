"use client";

import { useState, type ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { resolveIntentPrefetch } from "./intent-prefetch";

export type IntentPrefetchLinkProps = Omit<
  ComponentProps<typeof Link>,
  "prefetch"
>;

/**
 * Keeps large link collections quiet until keyboard or pointer intent is clear.
 * `null` restores Next's native App Router prefetch policy for the active link.
 */
export default function IntentPrefetchLink({
  onFocus,
  onMouseEnter,
  ...linkProps
}: IntentPrefetchLinkProps) {
  const [hasIntent, setHasIntent] = useState(false);

  return (
    <Link
      {...linkProps}
      prefetch={resolveIntentPrefetch(hasIntent)}
      onFocus={(event) => {
        onFocus?.(event);
        if (!event.defaultPrevented) setHasIntent(true);
      }}
      onMouseEnter={(event) => {
        onMouseEnter?.(event);
        if (!event.defaultPrevented) setHasIntent(true);
      }}
    />
  );
}
