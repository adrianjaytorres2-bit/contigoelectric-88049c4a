import { useState, useEffect, memo } from "react";
import { motion } from "framer-motion";
import { ChevronRight, ChevronDown, Shield, Clock, Award, DollarSign } from "lucide-react";

import blueOrigin1 from "@/assets/projects/blue-origin-1.webp";
import celesteShowcase1 from "@/assets/projects/celeste-hotel-showcase-1.jpg";
import celesteShowcase2 from "@/assets/projects/celeste-hotel-showcase-2.jpg";
import marriottShowcase from "@/assets/projects/marriott-showcase.jpg";

const heroImages = [
  blueOrigin1,
  marriottShowcase,
  celesteShowcase1,
  celesteShowcase2,
];

const features = [
  { icon: Shield, title: "TRUSTED EXPERTISE", desc: "Decades of combined commercial electrical experience" },
  { icon: Clock, title: "RELIABLE SERVICE", desc: "On time, on budget, and aligned with your goals" },
  { icon: Award, title: "SAFETY-DRIVEN", desc: "Fully compliant with all state, federal, and jobsite safety standards" },
  { icon: DollarSign, title: "COMPETITIVE PRICING", desc: "High-quality work with transparent, fair pricing" },
];

// Preload images for smoother transitions
heroImages.forEach((src) => {
  const img = new Image();
  img.src = src;
});

const FeatureCard = memo(({ feature, index }: { feature: typeof features[0]; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
    className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 p-3 md:p-4 text-center sm:text-left"
  >
    <feature.icon className="w-6 h-6 md:w-8 md:h-8 text-primary flex-shrink-0" />
    <div>
      <h3 className="font-display text-sm md:text-lg text-foreground">{feature.title}</h3>
      <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">{feature.desc}</p>
    </div>
  </motion.div>
));

FeatureCard.displayName = "FeatureCard";

export function Hero() {
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToServices = () => {
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col">
      {/* Background Images Slideshow */}
      <div className="absolute inset-0">
        {heroImages.map((src, index) => (
          <div
            key={index}
            className="absolute inset-0 transition-opacity duration-1000"
            style={{ opacity: index === currentImage ? 1 : 0 }}
          >
            <img
              src={src}
              alt="Featured project"
              className="w-full h-full object-cover"
              loading={index === 0 ? "eager" : "lazy"}
            />
          </div>
        ))}
        <div className="absolute inset-0 hero-overlay" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center text-center px-4 pt-24 md:pt-20">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl tracking-wider text-foreground"
        >
          POWERING
        </motion.h1>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="font-display text-3xl sm:text-5xl md:text-7xl lg:text-8xl tracking-wider text-gradient-cyan"
        >
          YOUR SUCCESS
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-4 md:mt-6 text-base md:text-xl text-muted-foreground max-w-2xl px-2"
        >
          A Full-Service Commercial Electrical Contractor with Comprehensive Projects Across Central Florida.
        </motion.p>
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          onClick={scrollToContact}
          className="mt-6 md:mt-8 flex items-center gap-2 text-primary hover:gap-4 transition-all duration-300 group"
        >
          <span className="text-xs sm:text-sm tracking-widest font-medium">REQUEST A PROPOSAL</span>
          <ChevronRight className="w-4 h-4 md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Image Indicators */}
        <div className="flex gap-2 mt-8 md:mt-12">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`h-1 transition-all duration-300 ${
                index === currentImage ? "w-6 md:w-8 bg-primary" : "w-3 md:w-4 bg-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          onClick={scrollToServices}
          className="absolute bottom-4 md:bottom-8 animate-bounce"
        >
          <ChevronDown className="w-6 h-6 md:w-8 md:h-8 text-primary" />
        </motion.button>
      </div>

      {/* Feature Cards */}
      <div className="relative z-10 bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
