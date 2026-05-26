import { useEffect, useRef } from "react";

export function TouchLight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let rafId = 0;
    let cx = -600;
    let cy = -600;

    const paint = () => {
      el.style.background = [
        `radial-gradient(220px circle at ${cx}px ${cy}px,`,
        `  hsl(187 100% 60% / 0.18) 0%,`,
        `  hsl(187 100% 42% / 0.10) 40%,`,
        `  transparent 70%`,
        `)`,
      ].join(" ");
    };

    const schedule = (x: number, y: number) => {
      cx = x;
      cy = y;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(paint);
    };

    const onPointerMove = (e: PointerEvent) => schedule(e.clientX, e.clientY);

    // touchmove fires during scroll on iOS when pointermove doesn't
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) schedule(t.clientX, t.clientY);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 9997, mixBlendMode: "screen" }}
    />
  );
}
