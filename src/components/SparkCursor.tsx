import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Spark {
  id: number;
  x: number;
  y: number;
}

export const SparkCursor = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let sparkId = 0;
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
      
      // Create sparks occasionally
      if (Math.random() > 0.7) {
        const newSpark: Spark = {
          id: sparkId++,
          x: e.clientX + (Math.random() - 0.5) * 20,
          y: e.clientY + (Math.random() - 0.5) * 20,
        };
        
        setSparks(prev => [...prev.slice(-8), newSpark]);
        
        // Remove spark after animation
        setTimeout(() => {
          setSparks(prev => prev.filter(s => s.id !== newSpark.id));
        }, 400);
      }
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

  // Don't render on touch devices
  if (typeof window !== "undefined" && "ontouchstart" in window) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] hidden md:block">
      {/* Main spark glow */}
      <motion.div
        className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2"
        animate={{
          x: mousePos.x,
          y: mousePos.y,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      >
        <div className="absolute inset-0 rounded-full bg-electric-cyan blur-sm animate-pulse" />
        <div className="absolute inset-1 rounded-full bg-white" />
      </motion.div>

      {/* Trailing sparks */}
      <AnimatePresence>
        {sparks.map((spark) => (
          <motion.div
            key={spark.id}
            className="absolute w-1 h-1 rounded-full bg-electric-cyan"
            initial={{ 
              x: spark.x, 
              y: spark.y, 
              scale: 1, 
              opacity: 1 
            }}
            animate={{ 
              y: spark.y + 30,
              scale: 0,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 6px hsl(var(--electric-cyan))",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
