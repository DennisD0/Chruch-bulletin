"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
} // all fractions of the displayed image, 0..1

type Mode = "move" | "nw" | "ne" | "sw" | "se";

const INIT: Box = { x: 0.08, y: 0.08, w: 0.84, h: 0.84 };

/**
 * Full-screen "crop to one hymn" step. The user drags a box around the hymn
 * they actually want (an open-book photo often shows two hymns plus the facing
 * page); only that region is exported and sent to OMR — capturing intent the
 * software can't infer. Rotate handles sideways shots.
 */
export default function CropModal({
  file,
  onConfirm,
  onCancel,
}: {
  file: File;
  onConfirm: (cropped: File) => void;
  onCancel: () => void;
}) {
  const [src, setSrc] = useState("");
  const [box, setBox] = useState<Box>(INIT);
  const imgRef = useRef<HTMLImageElement>(null);
  const urlRef = useRef<string>("");
  const drag = useRef<{ mode: Mode; px: number; py: number; box: Box } | null>(null);

  // Swap in a new object URL for the working image, revoking the old one. Object
  // URLs (not data URLs) keep multi-MB images out of the DOM string.
  const swapSrc = useCallback((blob: Blob) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(blob);
    setSrc(urlRef.current);
  }, []);

  // Decode the file to an EXIF-corrected image so it shows upright.
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
        // Cap the working image so the modal stays light (phones, screenshots);
        // ~2400px is still plenty of detail to crop a single hymn for OMR.
        const scale = Math.min(1, 2400 / Math.max(bmp.width, bmp.height));
        const c = document.createElement("canvas");
        c.width = Math.round(bmp.width * scale);
        c.height = Math.round(bmp.height * scale);
        c.getContext("2d")?.drawImage(bmp, 0, 0, c.width, c.height);
        if ("close" in bmp) bmp.close();
        c.toBlob((blob) => alive && blob && swapSrc(blob), "image/jpeg", 0.9);
      } catch {
        if (alive) swapSrc(file);
      }
    })();
    return () => {
      alive = false;
    };
  }, [file, swapSrc]);

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    []
  );

  const move = useCallback((e: PointerEvent) => {
    const d = drag.current;
    const img = imgRef.current;
    if (!d || !img) return;
    const r = img.getBoundingClientRect();
    const dx = (e.clientX - d.px) / r.width;
    const dy = (e.clientY - d.py) / r.height;
    let { x, y, w, h } = d.box;
    const MIN = 0.06;
    if (d.mode === "move") {
      x = Math.min(Math.max(0, x + dx), 1 - w);
      y = Math.min(Math.max(0, y + dy), 1 - h);
    } else {
      if (d.mode.includes("e")) w = Math.min(Math.max(MIN, w + dx), 1 - x);
      if (d.mode.includes("s")) h = Math.min(Math.max(MIN, h + dy), 1 - y);
      if (d.mode.includes("w")) {
        const nx = Math.min(Math.max(0, x + dx), x + w - MIN);
        w = w + x - nx;
        x = nx;
      }
      if (d.mode.includes("n")) {
        const ny = Math.min(Math.max(0, y + dy), y + h - MIN);
        h = h + y - ny;
        y = ny;
      }
    }
    setBox({ x, y, w, h });
  }, []);

  const up = useCallback(() => {
    drag.current = null;
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
  }, [move]);

  const down = (mode: Mode) => (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    drag.current = { mode, px: e.clientX, py: e.clientY, box };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  useEffect(
    () => () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    },
    [move, up]
  );

  const rotate = () => {
    const img = imgRef.current;
    if (!img) return;
    const c = document.createElement("canvas");
    c.width = img.naturalHeight;
    c.height = img.naturalWidth;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.translate(c.width / 2, c.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
    c.toBlob((blob) => blob && swapSrc(blob), "image/jpeg", 0.9);
    setBox(INIT);
  };

  const exportRegion = (b: Box) => {
    const img = imgRef.current;
    if (!img) return;
    const sx = b.x * img.naturalWidth;
    const sy = b.y * img.naturalHeight;
    const sw = Math.max(1, b.w * img.naturalWidth);
    const sh = Math.max(1, b.h * img.naturalHeight);
    const c = document.createElement("canvas");
    c.width = Math.round(sw);
    c.height = Math.round(sh);
    c.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    const base = file.name.replace(/\.[^.]+$/, "");
    c.toBlob(
      (blob) => {
        if (blob) onConfirm(new File([blob], `${base}.jpg`, { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-stone-900/95"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between gap-2 px-4 py-3">
        <span className="text-sm font-bold text-white">Crop to one hymn</span>
        <button
          onClick={onCancel}
          aria-label="Cancel"
          className="rounded-full px-3 py-1 text-2xl leading-none text-white/80 hover:text-white"
        >
          ×
        </button>
      </div>
      <p className="px-4 text-xs text-stone-300">
        Drag the box around the hymn you want — only that part is recognized.
      </p>

      <div className="flex min-h-0 flex-1 items-center justify-center p-3">
        <div className="relative inline-block touch-none">
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              ref={imgRef}
              src={src}
              alt=""
              draggable={false}
              className="block max-h-[64vh] max-w-full select-none"
            />
          )}
          {src && (
            <div
              className="absolute border-2 border-blue-400 bg-blue-500/15"
              style={{
                left: `${box.x * 100}%`,
                top: `${box.y * 100}%`,
                width: `${box.w * 100}%`,
                height: `${box.h * 100}%`,
                cursor: "move",
              }}
              onPointerDown={down("move")}
            >
              {(["nw", "ne", "sw", "se"] as Mode[]).map((m) => (
                <span
                  key={m}
                  onPointerDown={down(m)}
                  className="absolute h-5 w-5 rounded-full border-2 border-white bg-blue-500 shadow"
                  style={{
                    left: m.includes("w") ? -10 : "auto",
                    right: m.includes("e") ? -10 : "auto",
                    top: m.includes("n") ? -10 : "auto",
                    bottom: m.includes("s") ? -10 : "auto",
                    cursor: `${m}-resize`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 px-4 py-4">
        <button
          onClick={rotate}
          className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/25"
        >
          ↻ Rotate
        </button>
        <button
          onClick={() => exportRegion({ x: 0, y: 0, w: 1, h: 1 })}
          className="rounded-full bg-white/15 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/25"
        >
          Use whole photo
        </button>
        <button
          onClick={() => exportRegion(box)}
          className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-500"
        >
          Crop &amp; recognize
        </button>
      </div>
    </div>
  );
}
