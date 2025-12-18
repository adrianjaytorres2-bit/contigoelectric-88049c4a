import { useEffect, useRef, useState } from "react";
import { Building2, DollarSign, Calendar, MapPin } from "lucide-react";
import { motion, useInView } from "framer-motion";

interface StatItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay: number;
}

const AnimatedCounter = ({ target, suffix = "", prefix = "" }: { target: number; suffix?: string; prefix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};

const StatItem = ({ icon, value, label, delay }: StatItemProps) => {
  const isAnimated = value.includes("+") || value.includes("$");
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="flex flex-col items-center text-center group"
    >
      <div className="mb-4 p-4 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110">
        {icon}
      </div>
      <div className="text-5xl md:text-6xl lg:text-7xl font-display text-foreground mb-2">
        {value === "250+" && <><AnimatedCounter target={250} suffix="+" /></>}
        {value === "$100M+" && <><AnimatedCounter target={100} prefix="$" suffix="M+" /></>}
        {value === "75+ Combined" && <><AnimatedCounter target={75} suffix="+" /></>}
        {value === "400+" && <><AnimatedCounter target={400} suffix="+" /></>}
      </div>
      <div className="text-muted-foreground text-sm md:text-base uppercase tracking-widest">
        {label}
      </div>
    </motion.div>
  );
};

export const Statistics = () => {
  const stats = [
    {
      icon: <Building2 className="w-8 h-8" />,
      value: "250+",
      label: "Projects Completed",
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      value: "$100M+",
      label: "Total Project Experience",
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      value: "75+ Combined",
      label: "Combined Years of Experience",
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      value: "400+",
      label: "Serving Florida Cities",
    },
  ];

  return (
    <section className="py-20 md:py-32 bg-secondary/50 relative overflow-hidden">
      {/* Decorative circuit pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
        <div className="absolute left-1/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
        <div className="absolute left-3/4 top-0 h-full w-px bg-gradient-to-b from-transparent via-primary to-transparent" />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground mb-4">
            BY THE <span className="text-primary">NUMBERS</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto" />
        </motion.div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              icon={stat.icon}
              value={stat.value}
              label={stat.label}
              delay={index * 0.15}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
