"use client";

import dynamic from "next/dynamic";

const MemoryBloomBackdrop = dynamic(
  () => import("@/components/gallery/MemoryBloomBackdrop"),
  { ssr: false }
);

export default function GalleryBackdrop() {
  return (
    <div className="gallery-memory-bloom" aria-hidden="true">
      <div className="gallery-memory-bloom-viewport">
        <MemoryBloomBackdrop />
      </div>
    </div>
  );
}
