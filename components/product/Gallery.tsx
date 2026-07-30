"use client";

import Image from "next/image";
import { useState } from "react";

/**
 * Only the first image is eager — the rest are behind a tap, and the page is opened on
 * showroom mobile data where every unrequested image is a slower first paint.
 */
export function Gallery({
  images,
  productName,
}: {
  images: { src: string; alt: string }[];
  productName: string;
}) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface border border-rule flex items-center justify-center">
        <span className="eyebrow">No image available</span>
      </div>
    );
  }

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div>
      <div className="relative aspect-square bg-surface border border-rule overflow-hidden">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt || productName}
          fill
          priority
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <li key={image.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={`relative block h-16 w-16 bg-surface border transition-colors ${
                  index === active ? "border-brass" : "border-rule hover:border-ink-faint"
                }`}
              >
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="64px"
                  loading="lazy"
                  className="object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
