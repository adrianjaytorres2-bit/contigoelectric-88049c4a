import { useEffect, useRef } from "react";

interface TrailPt { x: number; y: number; life: number }
interface Spark   { x: number; y: number; vx: number; vy: number; life: number }

const TRAIL_MAX   = 40;
const TRAIL_DECAY = 0.045;
const SPARK_DECAY = 0.07;
const JITTER      = 7;

export function TouchLight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    const trail: TrailPt[] = [];
    const sparks: Spark[]  = [];
    let animId = 0;

    const addPoint = (x: number, y: number) => {
      trail.unshift({ x, y, life: 1 });
      if (trail.length > TRAIL_MAX) trail.pop();

      // scatter sparks from the tip
      for (let i = 0; i < 4; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = 1.5 + Math.random() * 3.5;
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.7 + Math.random() * 0.3 });
      }
      if (sparks.length > 300) sparks.splice(0, sparks.length - 300);
    };

    const onPointerMove = (e: PointerEvent) => addPoint(e.clientX, e.clientY);
    const onTouchMove   = (e: TouchEvent)   => { const t = e.touches[0]; if (t) addPoint(t.clientX, t.clientY); };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove",   onTouchMove,   { passive: true });

    // draw one jagged electric segment between two points
    const zapSegment = (x1: number, y1: number, x2: number, y2: number, jitter: number) => {
      const steps = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 6));
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let s = 1; s < steps; s++) {
        const t  = s / steps;
        ctx.lineTo(
          x1 + (x2 - x1) * t + (Math.random() - 0.5) * jitter,
          y1 + (y2 - y1) * t + (Math.random() - 0.5) * jitter,
        );
      }
      ctx.lineTo(x2, y2);
      ctx.stroke();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (trail.length >= 2) {
        // --- outer glow pass ---
        ctx.save();
        ctx.lineWidth   = 7;
        ctx.lineCap     = "round";
        ctx.shadowBlur  = 22;
        ctx.shadowColor = "hsl(187 100% 55%)";
        for (let i = 0; i < trail.length - 1; i++) {
          const { x: x1, y: y1, life: l1 } = trail[i];
          const { x: x2, y: y2, life: l2 } = trail[i + 1];
          const a = ((l1 + l2) / 2) * 0.35;
          ctx.strokeStyle = `hsla(187,100%,55%,${a})`;
          zapSegment(x1, y1, x2, y2, JITTER * 1.8);
        }
        ctx.restore();

        // --- bright core pass ---
        ctx.save();
        ctx.lineWidth   = 1.8;
        ctx.lineCap     = "round";
        ctx.shadowBlur  = 10;
        ctx.shadowColor = "hsl(187 100% 80%)";
        for (let i = 0; i < trail.length - 1; i++) {
          const { x: x1, y: y1, life: l1 } = trail[i];
          const { x: x2, y: y2, life: l2 } = trail[i + 1];
          const a = ((l1 + l2) / 2) * 0.95;
          ctx.strokeStyle = `hsla(187,100%,88%,${a})`;
          zapSegment(x1, y1, x2, y2, JITTER * 0.4);
        }
        ctx.restore();
      }

      // --- sparks ---
      ctx.save();
      ctx.shadowBlur  = 10;
      ctx.shadowColor = "hsl(187 100% 70%)";
      for (const s of sparks) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.life * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(187,100%,82%,${s.life})`;
        ctx.fill();
      }
      ctx.restore();

      // --- update ---
      for (const p of trail)  p.life -= TRAIL_DECAY;
      for (const s of sparks) { s.x += s.vx; s.y += s.vy; s.vy += 0.06; s.vx *= 0.96; s.life -= SPARK_DECAY; }

      for (let i = trail.length - 1; i >= 0; i--)  if (trail[i].life  <= 0) trail.splice(i, 1);
      for (let i = sparks.length - 1; i >= 0; i--)  if (sparks[i].life <= 0) sparks.splice(i, 1);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove",   onTouchMove);
      window.removeEventListener("resize",       resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9997 }}
    />
  );
}
