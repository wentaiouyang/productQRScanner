"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { Panorama, ResolvedHotspot } from "@/lib/panorama";

type Status = "loading" | "ready" | "error";

/**
 * The camera's vertical field of view is derived from the aspect ratio rather than fixed.
 *
 * A fixed 72° vertical fov behaves completely differently between shapes: on a desktop
 * window it gives ~97° horizontally, but on a portrait phone (aspect ≈ 0.46) it collapses
 * to ~40°, which is a keyhole — markers 26° apart fall off both edges. Holding the
 * horizontal view roughly constant instead keeps the scene legible on any device.
 */
const TARGET_HORIZONTAL_FOV = 95;
/** Past this, a portrait phone's vertical stretch starts to look like a fisheye. */
const VERTICAL_FOV_MAX = 100;
const VERTICAL_FOV_MIN = 24;

/** 1 is "fit"; larger magnifies. Zoom is stored separately so a device rotation, which
 *  changes the aspect and therefore the base fov, does not discard the user's zoom. */
const ZOOM_MIN = 1;
/**
 * Capped by the panorama's own resolution, not by taste. The source is 2880 × 1440, so at
 * this zoom a portrait phone shows roughly 25° of arc — about 200 source pixels stretched
 * across 750 device pixels. Going further just magnifies the blur. Re-exporting the
 * panorama at 5760 × 2880 or larger is what would buy more usable zoom.
 */
const ZOOM_MAX = 2;

/** Looking fully vertical inverts the horizon, so pitch stops short of the poles. */
const MAX_PITCH = 85;

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

function verticalFovFor(aspect: number): number {
  const halfHorizontal = (TARGET_HORIZONTAL_FOV / 2) * (Math.PI / 180);
  const halfVertical = Math.atan(Math.tan(halfHorizontal) / aspect);
  return clamp((halfVertical * 360) / Math.PI, VERTICAL_FOV_MIN, VERTICAL_FOV_MAX);
}

export default function PanoramaViewer({
  panorama,
  hotspots = [],
  onClose,
}: {
  panorama: Panorama;
  hotspots?: ResolvedHotspot[];
  onClose: () => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  // Markers are positioned imperatively from the render loop: doing it through React
  // state would re-render the tree on every frame of a drag.
  const markersRef = useRef(new Map<string, HTMLDivElement>());
  const [status, setStatus] = useState<Status>("loading");
  const [hasInteracted, setHasInteracted] = useState(false);
  const [openHotspot, setOpenHotspot] = useState<string | null>(null);

  const openDetails = hotspots.find((hotspot) => hotspot.sku === openHotspot) ?? null;

  const hotspotKey = hotspots
    .map((hotspot) => `${hotspot.sku}:${hotspot.bearing}:${hotspot.elevation}`)
    .join("|");

  // Escape closes, and the page behind must not scroll while the overlay is open.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    const teardown: (() => void)[] = [];

    void (async () => {
      // three is ~600 KB, so it is fetched only once someone opens the viewer.
      const THREE = await import("three");
      if (disposed) return;

      let texture: import("three").Texture;
      try {
        texture = await new THREE.TextureLoader().loadAsync(panorama.src);
      } catch {
        if (!disposed) setStatus("error");
        return;
      }
      if (disposed) {
        texture.dispose();
        return;
      }

      texture.colorSpace = THREE.SRGBColorSpace;

      const scene = new THREE.Scene();
      const aspect = container.clientWidth / Math.max(container.clientHeight, 1);
      const camera = new THREE.PerspectiveCamera(verticalFovFor(aspect), aspect, 0.1, 1100);

      // The image is mapped to the inside of the sphere, so the back faces are the
      // visible ones.
      const geometry = new THREE.SphereGeometry(500, 60, 40);
      const material = new THREE.MeshBasicMaterial({
        map: texture,
        side: THREE.BackSide,
      });
      scene.add(new THREE.Mesh(geometry, material));

      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.domElement.className = "block h-full w-full touch-none";
      container.appendChild(renderer.domElement);

      let bearing = panorama.initialBearing ?? 0;
      let pitch = 0;
      let zoom = ZOOM_MIN;
      let dirty = true;

      const applyZoom = () => {
        camera.fov = verticalFovFor(camera.aspect) / zoom;
        camera.updateProjectionMatrix();
        dirty = true;
      };

      const target = new THREE.Vector3();
      const projected = new THREE.Vector3();

      /**
       * Markers live in the DOM but are anchored to points in the scene, so their screen
       * position is recomputed from the camera each time the view changes.
       */
      const positionMarkers = () => {
        const { clientWidth, clientHeight } = container;

        for (const hotspot of hotspots) {
          const element = markersRef.current.get(hotspot.sku);
          if (!element) continue;

          projected.setFromSphericalCoords(
            400,
            THREE.MathUtils.degToRad(90 - hotspot.elevation),
            THREE.MathUtils.degToRad(hotspot.bearing),
          );
          projected.project(camera);

          // z > 1 means the point is behind the camera, where projection wraps around
          // and would otherwise place the marker back on screen, mirrored.
          const behind = projected.z > 1;
          const x = (projected.x * 0.5 + 0.5) * clientWidth;
          const y = (-projected.y * 0.5 + 0.5) * clientHeight;
          const offscreen = x < -80 || y < -80 || x > clientWidth + 80 || y > clientHeight + 80;

          if (behind || offscreen) {
            element.style.visibility = "hidden";
          } else {
            element.style.visibility = "visible";
            element.style.transform = `translate3d(${Math.round(x)}px, ${Math.round(y)}px, 0)`;
          }
        }
      };

      const render = () => {
        const phi = THREE.MathUtils.degToRad(90 - pitch);
        const theta = THREE.MathUtils.degToRad(bearing);
        target.setFromSphericalCoords(500, phi, theta);
        camera.lookAt(target);
        renderer.render(scene, camera);
        positionMarkers();
      };

      // Rendering only on change rather than every frame — a showroom phone should not
      // burn battery holding a still image.
      let frame = requestAnimationFrame(function loop() {
        if (dirty) {
          render();
          dirty = false;
        }
        frame = requestAnimationFrame(loop);
      });
      teardown.push(() => cancelAnimationFrame(frame));

      const canvas = renderer.domElement;

      // Every active pointer is tracked, not just the first: two fingers is a pinch, and
      // the canvas sets `touch-action: none`, so the browser's own pinch is unavailable.
      const pointers = new Map<number, { x: number; y: number }>();
      let pinchStartDistance = 0;
      let pinchStartZoom = zoom;

      const pinchDistance = () => {
        const [first, second] = [...pointers.values()];
        return Math.hypot(first.x - second.x, first.y - second.y);
      };

      const onPointerDown = (event: PointerEvent) => {
        pointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        try {
          canvas.setPointerCapture(event.pointerId);
        } catch {
          // Capture fails if the pointer has already gone away; dragging still works via
          // the element's own move events, so this must not abort the handler.
        }
        setHasInteracted(true);
        // Starting a gesture on the image dismisses an open marker panel.
        setOpenHotspot(null);

        if (pointers.size === 2) {
          pinchStartDistance = pinchDistance();
          pinchStartZoom = zoom;
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        const previous = pointers.get(event.pointerId);
        if (!previous) return;

        const x = event.clientX;
        const y = event.clientY;
        pointers.set(event.pointerId, { x, y });

        if (pointers.size >= 2) {
          if (pinchStartDistance > 0) {
            // Fingers apart → more zoom → narrower field of view.
            const scale = pinchDistance() / pinchStartDistance;
            zoom = clamp(pinchStartZoom * scale, ZOOM_MIN, ZOOM_MAX);
            applyZoom();
          }
          return;
        }

        // Degrees per pixel derived from the current field of view, so the image tracks
        // the finger at any zoom level. A fixed sensitivity felt right at one zoom only,
        // and far too fast once zoomed in.
        const perPixel = camera.fov / container.clientHeight;
        bearing -= (x - previous.x) * perPixel;
        pitch = clamp(pitch + (y - previous.y) * perPixel, -MAX_PITCH, MAX_PITCH);
        dirty = true;
      };

      const onPointerUp = (event: PointerEvent) => {
        pointers.delete(event.pointerId);
        if (canvas.hasPointerCapture(event.pointerId)) {
          canvas.releasePointerCapture(event.pointerId);
        }
        // Lifting one finger of a pinch leaves the other mid-gesture; its stored position
        // is already current, so dragging continues without a jump.
        pinchStartDistance = 0;
      };

      const onWheel = (event: WheelEvent) => {
        event.preventDefault();
        zoom = clamp(zoom * (1 - event.deltaY * 0.0012), ZOOM_MIN, ZOOM_MAX);
        applyZoom();
      };

      // Keyboard panning, so the viewer is usable without a pointer.
      const onKeyDown = (event: KeyboardEvent) => {
        const step = event.shiftKey ? 15 : 5;
        if (event.key === "ArrowLeft") bearing -= step;
        else if (event.key === "ArrowRight") bearing += step;
        else if (event.key === "ArrowUp") pitch = Math.min(MAX_PITCH, pitch + step);
        else if (event.key === "ArrowDown") pitch = Math.max(-MAX_PITCH, pitch - step);
        else return;
        event.preventDefault();
        setHasInteracted(true);
        dirty = true;
      };

      canvas.addEventListener("pointerdown", onPointerDown);
      canvas.addEventListener("pointermove", onPointerMove);
      canvas.addEventListener("pointerup", onPointerUp);
      canvas.addEventListener("pointercancel", onPointerUp);
      canvas.addEventListener("wheel", onWheel, { passive: false });
      container.addEventListener("keydown", onKeyDown);

      teardown.push(() => {
        canvas.removeEventListener("pointerdown", onPointerDown);
        canvas.removeEventListener("pointermove", onPointerMove);
        canvas.removeEventListener("pointerup", onPointerUp);
        canvas.removeEventListener("pointercancel", onPointerUp);
        canvas.removeEventListener("wheel", onWheel);
        container.removeEventListener("keydown", onKeyDown);
      });

      const observer = new ResizeObserver(() => {
        const { clientWidth, clientHeight } = container;
        if (clientWidth === 0 || clientHeight === 0) return;
        camera.aspect = clientWidth / clientHeight;
        // Re-derives the base fov for the new shape while preserving the user's zoom, so
        // rotating a phone widens the view instead of narrowing it.
        applyZoom();
        renderer.setSize(clientWidth, clientHeight);
      });
      observer.observe(container);
      teardown.push(() => observer.disconnect());

      teardown.push(() => {
        canvas.remove();
        geometry.dispose();
        material.dispose();
        texture.dispose();
        renderer.dispose();
      });

      setStatus("ready");
      // The first render ran before this point, so ask for one more frame now that the
      // scene exists — that pass is what places the hotspot markers.
      dirty = true;
    })();

    return () => {
      disposed = true;
      for (const fn of teardown) fn();
    };
    // Hotspots are keyed by position rather than array identity, so a re-render with an
    // equivalent array doesn't tear down and rebuild the whole scene.
  }, [panorama.src, panorama.initialBearing, hotspotKey]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`360 degree view — ${panorama.label}`}
      // 100dvh rather than relying on inset-0 alone: on iOS the fixed containing block is
      // the large viewport, so the bottom of the panel hides behind the browser toolbar.
      className="fixed inset-0 z-50 flex h-[100dvh] flex-col bg-ink"
    >
      <div className="flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-canvas/70">
          {panorama.label}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="border border-canvas/30 px-4 py-1.5 text-sm text-canvas transition-colors hover:border-canvas/70"
        >
          Close
        </button>
      </div>

      <div
        ref={containerRef}
        tabIndex={0}
        aria-label="Drag to look around. Arrow keys also pan."
        className="relative flex-1 cursor-grab overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-canvas/60 active:cursor-grabbing"
      >
        {status === "loading" && (
          <p className="absolute inset-0 flex items-center justify-center font-mono text-[11px] uppercase tracking-[0.14em] text-canvas/60">
            Loading view…
          </p>
        )}

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-canvas">This view couldn&rsquo;t be loaded.</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-canvas/60">
              {panorama.src}
            </p>
          </div>
        )}

        {status === "ready" && !hasInteracted && (
          <p className="pointer-events-none absolute inset-x-0 bottom-6 px-6 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-canvas/70">
            {/* The gesture differs by device, so name the one the reader actually has. */}
            <span className="[@media(hover:none)]:hidden">Drag to look around · scroll to zoom</span>
            <span className="hidden [@media(hover:none)]:inline">
              Swipe to look around · pinch to zoom
            </span>
          </p>
        )}

        {/* Mounted regardless of status: the render loop needs these elements to already
            exist in the DOM when it first positions them. They stay hidden until then. */}
        {hotspots.map((hotspot) => {
          const isOpen = openHotspot === hotspot.sku;

            return (
              <div
                key={hotspot.sku}
                ref={(element) => {
                  if (element) markersRef.current.set(hotspot.sku, element);
                  else markersRef.current.delete(hotspot.sku);
                }}
                // Positioned from the render loop; starts hidden so it never flashes at
                // the top-left corner before the first frame.
                style={{ visibility: "hidden" }}
                className="pointer-events-none absolute left-0 top-0"
              >
                <div className="group relative -translate-x-1/2 -translate-y-1/2">
                  <button
                    type="button"
                    // Tap opens it on a phone, where there is no hover at all.
                    onClick={() => setOpenHotspot(isOpen ? null : hotspot.sku)}
                    aria-expanded={isOpen}
                    // The button is a 44px touch target; the visible dot is the 20px span
                    // inside it. Sizing the button itself rather than extending it with a
                    // pseudo-element keeps the hit area real and testable.
                    className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black/40"
                  >
                    <span className="sr-only">
                      {hotspot.name} — {hotspot.finish}
                    </span>
                    <span
                      aria-hidden
                      className="relative block h-5 w-5 rounded-full bg-white shadow-[0_0_0_1.5px_rgba(0,0,0,0.28),0_2px_10px_rgba(0,0,0,0.45)] transition-transform group-hover:scale-110"
                    >
                      <span className="motion-safe:animate-ping absolute inset-0 rounded-full bg-white/60" />
                    </span>
                  </button>

                  {/* Floating tooltip, hover devices only. On a phone a 240px panel
                      anchored to a marker near the edge gets clipped by the viewer's
                      overflow, so touch gets the bottom sheet below instead. */}
                  <div
                    className={`pointer-events-auto absolute bottom-full left-1/2 mb-3 w-60 -translate-x-1/2 border border-black/10 bg-white p-4 text-left shadow-[0_12px_32px_-8px_rgba(0,0,0,0.5)] transition-opacity [@media(hover:none)]:hidden ${
                      isOpen
                        ? "opacity-100"
                        : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                    }`}
                  >
                    <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                      SKU {hotspot.sku}
                      {hotspot.isCurrent && " · on this page"}
                    </p>
                    <p className="font-display mt-1 text-lg leading-tight text-ink">
                      {hotspot.name}
                    </p>
                    <p className="font-display text-sm italic text-ink-soft">{hotspot.finish}</p>

                    <div className="mt-2.5 flex items-baseline justify-between gap-3 border-t border-rule pt-2.5">
                      <span className="font-display text-lg text-ink">
                        {hotspot.price ?? "On application"}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                        {hotspot.availability}
                      </span>
                    </div>

                    {!hotspot.isCurrent && (
                      <Link
                        href={`/p/${hotspot.sku}`}
                        className="mt-3 block text-sm underline underline-offset-2"
                      >
                        View this product
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/*
        Touch presentation of a marker's details. It lives outside the scrolling viewer so
        the viewer's overflow cannot clip it, and it is full width, so a marker's position
        on screen has no bearing on whether the panel is readable.
      */}
      {openDetails && (
        <div className="border-t border-canvas/15 bg-white [@media(hover:hover)]:hidden">
          <div className="flex items-start justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-ink-faint">
                SKU {openDetails.sku}
                {openDetails.isCurrent && " · on this page"}
              </p>
              <p className="font-display mt-1 text-xl leading-tight text-ink">
                {openDetails.name}
              </p>
              <p className="font-display text-sm italic text-ink-soft">{openDetails.finish}</p>

              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-display text-xl text-ink">
                  {openDetails.price ?? "On application"}
                </span>
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-ink-faint">
                  {openDetails.availability}
                </span>
              </div>

              {!openDetails.isCurrent && (
                <Link
                  href={`/p/${openDetails.sku}`}
                  className="mt-3 inline-block text-sm underline underline-offset-2"
                >
                  View this product
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOpenHotspot(null)}
              className="-m-2 shrink-0 p-2 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
