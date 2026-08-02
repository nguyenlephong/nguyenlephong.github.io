"use client";

import dynamic from "next/dynamic";

const ArchitectureBackdrop = dynamic(
  () => import("@/components/cv/ArchitectureBackdrop"),
  { ssr: false }
);

export default function HomeBackdrop() {
  return (
    <div className="home-architecture" aria-hidden="true">
      <div className="home-architecture-viewport">
        <ArchitectureBackdrop />
      </div>
    </div>
  );
}
