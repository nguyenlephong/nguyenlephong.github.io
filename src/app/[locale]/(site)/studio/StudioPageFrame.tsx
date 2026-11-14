import type { ReactNode } from "react";
import AppsLinkTracker from "@/components/analytics/AppsLinkTracker";
import PageTracker from "@/components/analytics/PageTracker";
import { serializeJsonLd } from "@/lib/seo/json-ld";
import "./studio.css";

type StudioPageFrameProps = {
  jsonLd: readonly object[];
  trackerContext?: Readonly<Record<string, unknown>>;
  children: ReactNode;
};

/** Shared by the Studio index and module pages: JSON-LD, page view and delegated link tracking. */
export default function StudioPageFrame({ jsonLd, trackerContext, children }: StudioPageFrameProps) {
  return (
    <>
      {jsonLd.map((value, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(value) }}
        />
      ))}
      <PageTracker page="studio" eventName="studio_view" section="notes_admin" context={trackerContext} />
      <AppsLinkTracker />
      {children}
    </>
  );
}
