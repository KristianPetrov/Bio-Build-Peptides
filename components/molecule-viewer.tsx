"use client";

import { useEffect, useRef, useState } from "react";
import type { MoleculeEntry } from "@/lib/molecules";

type Viewer = {
  addModel: (data: string, format: string) => unknown;
  setStyle: (selection: object, style: object) => void;
  addSurface: (type: unknown, style: object) => void;
  removeAllModels: () => void;
  removeAllSurfaces: () => void;
  zoomTo: () => void;
  zoom: (factor: number) => void;
  spin: (axis: string | boolean, speed?: number) => void;
  render: () => void;
  resize: () => void;
  clear: () => void;
};

type ThreeDmol = {
  createViewer: (element: HTMLElement, config: object) => Viewer;
  SurfaceType: { VDW: unknown };
};

let modulePromise: Promise<ThreeDmol> | null = null;
function load3Dmol() {
  modulePromise ??= import("3dmol").then(
    (module) => ((module as { default?: unknown }).default ?? module) as ThreeDmol,
  );
  return modulePromise;
}

// Gilded element palette: carbon in gold, heteroatoms in warm neutrals.
const ELEMENT_COLORS = {
  prop: "elem",
  map: {
    C: "#D9B672",
    N: "#F2EADB",
    O: "#E0866A",
    S: "#F3D9A0",
    H: "#6F6658",
    P: "#C9A15B",
    Cu: "#E08A4F",
    Co: "#A9BD8A",
    I: "#B48ACF",
  },
};

export function MoleculeViewer({ molecules }: { molecules: MoleculeEntry[] }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [active, setActive] = useState(0);
  const [result, setResult] = useState<{ index: number; ok: boolean } | null>(null);
  const [visible, setVisible] = useState(false);
  const status =
    result?.index === active ? (result.ok ? "ready" : "error") : "loading";

  // Defer the 3Dmol bundle until the viewer scrolls near the viewport.
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || !molecules[active]) return;
    let cancelled = false;
    const controller = new AbortController();

    (async () => {
      try {
        const $3Dmol = await load3Dmol();
        if (cancelled || !hostRef.current) return;
        viewerRef.current ??= $3Dmol.createViewer(hostRef.current, {
          backgroundColor: "#0c0b09",
          backgroundAlpha: 0,
          antialias: true,
        });
        const viewer = viewerRef.current;
        const molecule = molecules[active];
        const response = await fetch(`/molecules/${molecule.file}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Structure not found");
        const data = await response.text();
        if (cancelled) return;

        const format = molecule.file.endsWith(".pdb") ? "pdb" : "sdf";
        viewer.removeAllModels();
        viewer.removeAllSurfaces();
        viewer.addModel(data, format);
        if (format === "pdb") {
          viewer.setStyle({}, { cartoon: { color: "#D9B672", opacity: 0.95 } });
        } else {
          viewer.setStyle(
            {},
            {
              stick: { radius: 0.16, colorscheme: ELEMENT_COLORS },
              sphere: { scale: 0.22, colorscheme: ELEMENT_COLORS },
            },
          );
        }
        viewer.zoomTo();
        viewer.zoom(1.05);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        viewer.spin(reduce ? false : "y", 0.6);
        viewer.render();
        setResult({ index: active, ok: true });
      } catch (error) {
        if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) {
          setResult({ index: active, ok: false });
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [visible, active, molecules]);

  useEffect(() => {
    const onResize = () => viewerRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (molecules.length === 0) return null;

  return (
    <div>
      {molecules.length > 1 ? (
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Molecular structures">
          {molecules.map((molecule, index) => (
            <button
              key={molecule.file + index}
              type="button"
              role="tab"
              aria-selected={index === active}
              onClick={() => setActive(index)}
              className={`border px-3.5 py-2 text-[0.6875rem] tracking-[0.18em] uppercase transition-colors ${
                index === active
                  ? "border-gold-300 text-gold-100"
                  : "hairline text-stone hover:text-parchment"
              }`}
            >
              {molecule.name}
            </button>
          ))}
        </div>
      ) : null}
      <div className="relative aspect-[4/3] w-full overflow-hidden border hairline bg-[radial-gradient(ellipse_at_center,#1e1912_0%,#0c0b09_70%)] sm:aspect-[16/9]">
        <div
          ref={hostRef}
          className="absolute inset-0"
          role="img"
          aria-label={`Rotating 3D model of ${molecules[active]?.name}`}
        />
        {status !== "ready" ? (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-xs tracking-[0.24em] text-stone uppercase">
            {status === "error" ? "Structure unavailable" : "Loading structure…"}
          </div>
        ) : null}
        <p className="pointer-events-none absolute bottom-3 left-4 text-[0.625rem] tracking-[0.24em] text-ash uppercase">
          {molecules[active]?.name} · drag to rotate
        </p>
      </div>
    </div>
  );
}
