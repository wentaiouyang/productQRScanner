"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { Panorama, ResolvedHotspot } from "@/lib/panorama";

/**
 * The viewer pulls in three.js, so it is code-split away from the product page and only
 * fetched once someone opens it. Server rendering is off because it needs WebGL.
 */
const PanoramaViewer = dynamic(() => import("./PanoramaViewer"), { ssr: false });

export function ThreeDView({
  panorama,
  hotspots,
}: {
  panorama: Panorama;
  hotspots: ResolvedHotspot[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 border border-ink px-5 py-2.5 text-sm transition-colors hover:bg-ink hover:text-canvas"
      >
        {/* A cube reads as "3D" without needing a label to explain the label. */}
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinejoin="round"
        >
          <path d="M8 1.5 14.5 5v6L8 14.5 1.5 11V5L8 1.5Z" />
          <path d="M1.5 5 8 8.5 14.5 5M8 8.5v6" />
        </svg>
        3D view
      </button>

      {open && (
        <PanoramaViewer
          panorama={panorama}
          hotspots={hotspots}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
