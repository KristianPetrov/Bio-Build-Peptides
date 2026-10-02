"use client";

import { useEffect, useRef } from "react";

/**
 * Gilded double helix rendered as true 3D geometry: two ribbon strands wound on a
 * cylinder plus base-pair rods, perspective-projected and painted back to front so the
 * strands pass behind and in front of each other as it turns about its own axis.
 */

// Metallic gold ramp, dark to highlight; matches the emblem artwork.
const GOLD: [number, [number, number, number]][] = [
  [0, [26, 17, 6]],
  [0.22, [74, 52, 18]],
  [0.45, [138, 106, 47]],
  [0.65, [201, 161, 91]],
  [0.82, [243, 217, 160]],
  [1, [255, 246, 222]],
];

function gold(value: number, alpha: number) {
  const v = Math.min(1, Math.max(0, value));
  let i = 1;
  while (i < GOLD.length - 1 && GOLD[i][0] < v) i++;
  const [p0, c0] = GOLD[i - 1];
  const [p1, c1] = GOLD[i];
  const k = (v - p0) / (p1 - p0);
  const c = c0.map((n, j) => Math.round(n + (c1[j] - n) * k));
  return `rgba(${c[0]},${c[1]},${c[2]},${alpha.toFixed(3)})`;
}

// Key light from the upper left, slightly in front.
const LIGHT = (() => {
  const v = [-0.45, -0.5, 0.74];
  const m = Math.hypot(...v);
  return v.map((n) => n / m);
})();

/** Shade a surface with normal (nx, ny, nz) facing the viewer: diffuse plus a tight metallic sheen. */
function shade(nx: number, ny: number, nz: number) {
  const diffuse = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2]);
  // Half vector between light and view (0, 0, 1).
  const hx = LIGHT[0];
  const hy = LIGHT[1];
  const hz = LIGHT[2] + 1;
  const hm = Math.hypot(hx, hy, hz);
  const spec = Math.pow(Math.max(0, (nx * hx + ny * hy + nz * hz) / hm), 28);
  return 0.18 + diffuse * 0.62 + spec * 0.55;
}

type Shape = {
  z: number;
  draw: (ctx: CanvasRenderingContext2D) => void;
};

type Options = {
  /** Fraction of the canvas height the helix spans. */
  span: number;
  /** Full turns over the helix height. */
  turns: number;
  rungs: number;
};

function render(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  spin: number,
  { span, turns, rungs }: Options,
) {
  ctx.clearRect(0, 0, width, height);

  const helixHeight = height * span;
  const radius = Math.min(width * 0.36, helixHeight * 0.16);
  const ribbon = helixHeight * 0.075;
  const camera = radius * 5; // distance to the axis; sets how strong the perspective is
  const cx = width / 2;
  const cy = height / 2;
  const top = cy - helixHeight / 2;
  const samples = Math.max(48, Math.round(helixHeight / 1.5));
  // Ribbons taper to points at both ends, like the emblem.
  const taper = (t: number) => {
    const edge = Math.min(t, 1 - t) / 0.12;
    return edge >= 1 ? 1 : Math.sin((edge * Math.PI) / 2);
  };

  const project = (x: number, y: number, z: number) => {
    const s = camera / (camera - z);
    return [cx + x * s, cy + (y - cy) * s, s] as const;
  };
  // Far parts are dimmer, near parts brighter.
  const depthLight = (z: number) => 0.5 + 0.5 * ((z / radius + 1) / 2);

  const shapes: Shape[] = [];

  for (const phase of [0, Math.PI]) {
    for (let i = 0; i < samples; i++) {
      const t0 = i / samples;
      const t1 = (i + 1) / samples;
      const a0 = t0 * turns * Math.PI * 2 + spin + phase;
      const a1 = t1 * turns * Math.PI * 2 + spin + phase;
      const w0 = (ribbon / 2) * taper(t0);
      const w1 = (ribbon / 2) * taper(t1);
      const y0 = top + t0 * helixHeight;
      const y1 = top + t1 * helixHeight;
      const x0 = Math.sin(a0) * radius;
      const z0 = Math.cos(a0) * radius;
      const x1 = Math.sin(a1) * radius;
      const z1 = Math.cos(a1) * radius;

      const p = [
        project(x0, y0 - w0, z0),
        project(x1, y1 - w1, z1),
        project(x1, y1 + w1, z1),
        project(x0, y0 + w0, z0),
      ];

      // Outward normal of the band; when it faces away we see its inner face.
      const mid = (a0 + a1) / 2;
      let nx = Math.sin(mid);
      let nz = Math.cos(mid);
      const inner = nz < 0;
      if (inner) {
        nx = -nx;
        nz = -nz;
      }
      const z = (z0 + z1) / 2;
      const light = shade(nx, -0.15, nz) * depthLight(z) * (inner ? 0.62 : 1);
      const color = gold(light, 1);

      shapes.push({
        z,
        draw: (c) => {
          c.beginPath();
          c.moveTo(p[0][0], p[0][1]);
          c.lineTo(p[1][0], p[1][1]);
          c.lineTo(p[2][0], p[2][1]);
          c.lineTo(p[3][0], p[3][1]);
          c.closePath();
          c.fillStyle = color;
          c.strokeStyle = color;
          c.fill();
          c.stroke(); // closes hairline seams between neighbouring quads
        },
      });
    }
  }

  // Base-pair rods joining the strands, kept clear of the tapered ends.
  const rodSegments = 14;
  const rodWidth = ribbon * 0.32;
  for (let r = 0; r < rungs; r++) {
    const t = 0.16 + (r / Math.max(1, rungs - 1)) * 0.68;
    const angle = t * turns * Math.PI * 2 + spin;
    const y = top + t * helixHeight;
    const reach = radius * 0.94;
    const ax = Math.sin(angle) * reach;
    const az = Math.cos(angle) * reach;
    for (let s = 0; s < rodSegments; s++) {
      const u0 = s / rodSegments;
      const u1 = (s + 1) / rodSegments;
      const x0 = ax * (1 - 2 * u0);
      const z0 = az * (1 - 2 * u0);
      const x1 = ax * (1 - 2 * u1);
      const z1 = az * (1 - 2 * u1);
      // Overlap neighbouring segments slightly so no seams show between them.
      const a = project(x0 + (x0 - x1) * 0.15, y, z0 + (z0 - z1) * 0.15);
      const b = project(x1 + (x1 - x0) * 0.15, y, z1 + (z1 - z0) * 0.15);
      const z = (z0 + z1) / 2;
      const light = shade(0, -0.6, 0.8) * depthLight(z);
      shapes.push({
        z: z - 0.001, // rods sit just inside the ribbons
        draw: (c) => {
          const scale = (a[2] + b[2]) / 2;
          const half = (rodWidth * scale) / 2;
          // Cylinder shading across the rod: dark rim, bright core.
          const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
          const nx = (-(b[1] - a[1]) / len) * half;
          const ny = ((b[0] - a[0]) / len) * half;
          const mx = (a[0] + b[0]) / 2;
          const my = (a[1] + b[1]) / 2;
          const grad = c.createLinearGradient(mx + nx, my + ny, mx - nx, my - ny);
          grad.addColorStop(0, gold(light * 0.45, 1));
          grad.addColorStop(0.35, gold(light * 1.15, 1));
          grad.addColorStop(1, gold(light * 0.4, 1));
          c.beginPath();
          c.moveTo(a[0], a[1]);
          c.lineTo(b[0], b[1]);
          c.lineWidth = rodWidth * scale;
          c.lineCap = "butt";
          c.strokeStyle = grad;
          c.stroke();
        },
      });
    }
  }

  shapes.sort((p, q) => p.z - q.z);
  ctx.lineWidth = 0.6;
  ctx.lineJoin = "round";
  for (const shape of shapes) {
    ctx.save();
    shape.draw(ctx);
    ctx.restore();
  }
}

export function SpinningHelix({
  className = "",
  span = 0.92,
  turns = 1.45,
  rungs = 9,
  period = 14,
}: {
  className?: string;
  span?: number;
  turns?: number;
  rungs?: number;
  /** Seconds per full revolution. */
  period?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const options = { span, turns, rungs };
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    const start = performance.now();
    // A three-quarter view reads well when the helix is still.
    const restingSpin = -0.35;

    const paint = (now: number) => {
      const spin = reduceMotion.matches
        ? restingSpin
        : restingSpin - ((now - start) / 1000 / period) * Math.PI * 2;
      render(ctx, width, height, spin, options);
    };

    const loop = (now: number) => {
      paint(now);
      frame = visible && !reduceMotion.matches ? requestAnimationFrame(loop) : 0;
    };
    const restart = () => {
      if (!frame) frame = requestAnimationFrame(loop);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(performance.now());
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    // Only animate while on screen.
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) restart();
    });
    intersection.observe(canvas);
    reduceMotion.addEventListener("change", restart);

    resize();
    restart();

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      reduceMotion.removeEventListener("change", restart);
    };
  }, [span, turns, rungs, period]);

  return <canvas ref={canvasRef} className={`block h-full w-full ${className}`} aria-hidden />;
}
