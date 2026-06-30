"use client";

import { useLayoutEffect } from "react";

export interface BulletinFitReport {
  ready: boolean;
  overflowingSections: string[];
  scales: Record<string, number>;
}

const MIN_SCALE = 2 / 3; // 9 pt reference body text may shrink to 6 pt.
const SCALE_STEP = 1 / 36; // 0.25 pt steps from a 9 pt baseline.

function applyScale(element: HTMLElement, scale: number) {
  element.style.transformOrigin = "top left";
  element.style.transform = `scale(${scale})`;
  element.style.width = `${100 / scale}%`;
}

function fits(section: HTMLElement, body: HTMLElement, scale: number) {
  applyScale(body, scale);
  const bodyTop = body.offsetTop - section.offsetTop;
  const availableHeight = section.clientHeight - bodyTop;
  return (
    body.scrollHeight * scale <= availableHeight + 0.5 &&
    body.scrollWidth * scale <= section.clientWidth + 0.5
  );
}

async function waitForAssets(root: HTMLElement) {
  await document.fonts.ready;
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;
      try {
        await image.decode();
      } catch {
        await new Promise<void>((resolve) => {
          image.addEventListener("load", () => resolve(), { once: true });
          image.addEventListener("error", () => resolve(), { once: true });
        });
      }
    })
  );
}

export default function BulletinFitController({ fitKey }: { fitKey: string }) {
  useLayoutEffect(() => {
    let cancelled = false;
    const root = document.getElementById("bulletin-preview");
    if (!root) return;

    root.dataset.fitStatus = "running";
    root.dataset.overflowingSections = "";

    const run = async () => {
      await waitForAssets(root);
      if (cancelled) return;

      const overflowingSections: string[] = [];
      const scales: Record<string, number> = {};

      for (const section of root.querySelectorAll<HTMLElement>("[data-fit-section]")) {
        const name = section.dataset.fitSection || "unnamed-section";
        const body = section.querySelector<HTMLElement>(":scope > [data-fit-body]");
        if (!body) continue;

        body.style.transform = "none";
        body.style.width = "100%";

        let scale = 1;
        while (scale > MIN_SCALE && !fits(section, body, scale)) {
          scale = Math.max(MIN_SCALE, scale - SCALE_STEP);
        }

        const didFit = fits(section, body, scale);
        section.dataset.fitScale = scale.toFixed(4);
        section.dataset.overflow = didFit ? "false" : "true";
        scales[name] = scale;
        if (!didFit) overflowingSections.push(name);
      }

      if (cancelled) return;
      const report: BulletinFitReport = {
        ready: true,
        overflowingSections,
        scales,
      };
      root.dataset.fitStatus = overflowingSections.length ? "error" : "ready";
      root.dataset.overflowingSections = overflowingSections.join(",");
      window.dispatchEvent(new CustomEvent("bulletin-fit", { detail: report }));
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [fitKey]);

  return null;
}
