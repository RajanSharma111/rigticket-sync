// ============================================================================
// Interactive HTML5 Canvas "Sign on Glass" pad (mouse + touch).
// Stroke-based: strokes are kept in a ref and redrawn, so the signature never
// vanishes when the pointer is lifted or the component re-renders.
// ============================================================================
import { useEffect, useRef } from 'react';
import { Eraser, PenTool } from 'lucide-react';

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
}

type Point = { x: number; y: number };

export default function SignaturePad({ value, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const strokes = useRef<Point[][]>([]); // completed + in-progress strokes
  const sizeRef = useRef({ w: 0, h: 0 });

  // --- Draw everything currently in `strokes` onto a freshly cleared canvas ---
  const redraw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const c = canvas.getContext('2d');
    if (!c) return;
    const { w, h } = sizeRef.current;
    c.save();
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.restore();
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#0f172a';
    c.lineWidth = 2.6;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    for (const stroke of strokes.current) {
      if (stroke.length === 1) {
        // a dot
        const p = stroke[0];
        c.beginPath();
        c.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
        c.fillStyle = '#0f172a';
        c.fill();
        c.fillStyle = '#ffffff';
        continue;
      }
      c.beginPath();
      c.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) c.lineTo(stroke[i].x, stroke[i].y);
      c.stroke();
    }
  };

  // --- Size the canvas for devicePixelRatio and (re)draw existing content ---
  const setup = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const c = canvas.getContext('2d');
    if (!c) return;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeRef.current = { w: rect.width, h: rect.height };
    if (strokes.current.length > 0) {
      // We still have the live strokes — redraw them (sharp vector).
      redraw();
    } else if (value) {
      // Remounted / first mount with a saved signature — paint it back from the image.
      paintValue(value);
    } else {
      redraw(); // just the white background
    }
  };

  // Paint a saved signature data-url onto the (already sized) canvas.
  const paintValue = (dataUrl: string) => {
    const canvas = canvasRef.current;
    const c = canvas?.getContext('2d');
    if (!canvas || !c) return;
    const { w, h } = sizeRef.current;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, w, h);
    const img = new Image();
    img.onload = () => {
      c.drawImage(img, 0, 0, w, h);
    };
    img.src = dataUrl;
  };

  useEffect(() => {
    setup();
    const onResize = () => setup();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync canvas to the external `value` prop:
  //  - value cleared  -> wipe strokes + canvas
  //  - value present but no live strokes (e.g. after a remount or Auto-Sign
  //    set from the parent) -> repaint it from the image
  useEffect(() => {
    if (value === null) {
      if (strokes.current.length > 0) {
        strokes.current = [];
        redraw();
      }
    } else if (strokes.current.length === 0) {
      paintValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const pos = (e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const commit = () => {
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL('image/png'));
  };

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
    drawing.current = true;
    strokes.current.push([pos(e)]);
    canvasRef.current?.setPointerCapture(e.pointerId);
    redraw();
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    e.preventDefault();
    const cur = strokes.current[strokes.current.length - 1];
    cur.push(pos(e));
    redraw();
  };

  const end = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    drawing.current = false;
    try {
      canvasRef.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    redraw();
    commit(); // persist the finished signature to the parent
  };

  const clear = () => {
    strokes.current = [];
    redraw();
    onChange(null);
  };

  const autoSign = () => {
    const { w, h } = sizeRef.current;
    if (w === 0) return;
    // Build a flowing signature as one dense stroke so it survives redraw.
    const pts: Point[] = [];
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = w * (0.08 + 0.84 * t);
      const y =
        h *
        (0.55 +
          0.3 * Math.sin(t * Math.PI * 3.2) * (1 - t * 0.3) +
          0.05 * Math.sin(t * Math.PI * 9));
      pts.push({ x, y });
    }
    // underline flourish
    const underline: Point[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      underline.push({ x: w * (0.1 + 0.8 * t), y: h * (0.82 - 0.03 * t) });
    }
    strokes.current = [pts, underline];
    redraw();
    commit();
  };

  return (
    <div>
      <div className="overflow-hidden rounded-lg border-2 border-dashed border-rig-border bg-white">
        <canvas
          ref={canvasRef}
          className="block h-40 w-full cursor-crosshair"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={clear}
          className="flex items-center gap-1.5 rounded-lg border border-rig-border bg-rig-bg px-3 py-2 text-xs font-semibold text-slate-300 hover:bg-rig-card"
        >
          <Eraser size={14} /> Clear
        </button>
        <button
          type="button"
          onClick={autoSign}
          className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/20"
        >
          <PenTool size={14} /> Auto-Sign Demo Signature
        </button>
      </div>
    </div>
  );
}
