import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TrailPoint {
  id: number;
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;
}

interface LightningBolt {
  id: number;
  points: { x: number; y: number }[];
}

export const SparkCursor = () => {
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const [bolts, setBolts] = useState<LightningBolt[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const idRef = useRef(0);
  const boltIdRef = useRef(0);

  // Generate lightning bolt points between two positions
  const generateBoltPoints = (startX: number, startY: number, endX: number, endY: number) => {
    const points: { x: number; y: number }[] = [];
    const segments = 8 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const baseX = startX + (endX - startX) * t;
      const baseY = startY + (endY - startY) * t;
      
      // Add jagged offset (less at start and end)
      const jitter = Math.sin(t * Math.PI) * 30;
      const offsetX = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * jitter;
      const offsetY = i === 0 || i === segments ? 0 : (Math.random() - 0.5) * jitter;
      
      points.push({ x: baseX + offsetX, y: baseY + offsetY });
    }
    
    return points;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      const newPoint: TrailPoint = {
        id: idRef.current++,
        x: e.clientX,
        y: e.clientY,
        offsetX: (Math.random() - 0.5) * 12,
        offsetY: (Math.random() - 0.5) * 12,
      };
      
      setTrail(prev => [...prev.slice(-15), newPoint]);
    };

    const handleClick = (e: MouseEvent) => {
      // Create lightning bolt from slightly above click to click position
      const startX = e.clientX + (Math.random() - 0.5) * 100;
      const startY = e.clientY - 80 - Math.random() * 40;
      const points = generateBoltPoints(startX, startY, e.clientX, e.clientY);
      
      const newBolt: LightningBolt = {
        id: boltIdRef.current++,
        points,
      };
      
      setBolts(prev => [...prev, newBolt]);
      
      // Remove bolt after animation
      setTimeout(() => {
        setBolts(prev => prev.filter(b => b.id !== newBolt.id));
      }, 300);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
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
      <svg className="absolute inset-0 w-full h-full overflow-visible">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <filter id="boltGlow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Lightning trail */}
        {trail.length > 1 && isVisible && trail.slice(0, -1).map((point, index) => {
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

        {/* Lightning bolts on click */}
        <AnimatePresence>
          {bolts.map((bolt) => (
            <motion.g
              key={bolt.id}
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Main bolt */}
              <motion.polyline
                points={bolt.points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="white"
                strokeWidth="3"
                filter="url(#boltGlow)"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 1 }}
                animate={{ pathLength: 1, opacity: [1, 1, 0] }}
                transition={{ duration: 0.15, opacity: { duration: 0.3 } }}
              />
              {/* Cyan glow layer */}
              <motion.polyline
                points={bolt.points.map(p => `${p.x},${p.y}`).join(' ')}
                fill="none"
                stroke="hsl(var(--electric-cyan))"
                strokeWidth="6"
                filter="url(#boltGlow)"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.6}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.15 }}
              />
              {/* Impact flash */}
              <motion.circle
                cx={bolt.points[bolt.points.length - 1].x}
                cy={bolt.points[bolt.points.length - 1].y}
                fill="white"
                filter="url(#boltGlow)"
                initial={{ r: 0, opacity: 1 }}
                animate={{ r: 20, opacity: 0 }}
                transition={{ duration: 0.2 }}
              />
            </motion.g>
          ))}
        </AnimatePresence>
      </svg>

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
