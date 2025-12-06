import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

export const SparkCursor = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const idRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setIsVisible(true);
      
      // Create jagged lightning trail points
      const newPoint: TrailPoint = {
        id: idRef.current++,
        x: e.clientX,
        y: e.clientY,
        offsetX: (Math.random() - 0.5) * 12,
        offsetY: (Math.random() - 0.5) * 12,
      };
      
      setTrail(prev => [...prev.slice(-15), newPoint]);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, []);

  // Clean up old trail points
  useEffect(() => {
    const interval = setInterval(() => {
      setTrail(prev => prev.slice(-12));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Don't render on touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {/* Lightning trail SVG */}
      {trail.length > 1 && isVisible && (
        <svg className="absolute inset-0 w-full h-full overflow-visible">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          {trail.slice(0, -1).map((point, index) => {
            const nextPoint = trail[index + 1];
            if (!nextPoint) return null;
            
            const opacity = (index + 1) / trail.length;
            const strokeWidth = 1 + (index / trail.length) * 2;
            
            return (
              <line
                key={point.id}
                x1={point.x + point.offsetX}
                y1={point.y + point.offsetY}
                x2={nextPoint.x + nextPoint.offsetX}
                y2={nextPoint.y + nextPoint.offsetY}
                stroke="hsl(var(--electric-cyan))"
                strokeWidth={strokeWidth}
                opacity={opacity * 0.8}
                filter="url(#glow)"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      )}

      {/* Random micro sparks */}
      <AnimatePresence>
        {isVisible && trail.slice(-3).map((point) => (
          <motion.div
            key={`spark-${point.id}`}
            className="absolute w-0.5 h-0.5 rounded-full bg-white"
            initial={{ 
              x: point.x + (Math.random() - 0.5) * 20, 
              y: point.y + (Math.random() - 0.5) * 20,
              scale: 1,
              opacity: 0.8,
            }}
            animate={{ 
              x: point.x + (Math.random() - 0.5) * 40,
              y: point.y + (Math.random() - 0.5) * 40,
              scale: 0,
              opacity: 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 4px hsl(var(--electric-cyan))",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
