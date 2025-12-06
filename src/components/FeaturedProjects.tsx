import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";

// Get top 6 projects by value
const featuredProjects = [...projects]
  .sort((a, b) => {
    const valueA = parseFloat(a.value.replace(/[$,]/g, ""));
    const valueB = parseFloat(b.value.replace(/[$,]/g, ""));
    return valueB - valueA;
  })
  .slice(0, 6);

export const FeaturedProjects = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const scrollToMap = () => {
    const mapSection = document.getElementById("projects");
    if (mapSection) {
      mapSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-20 md:py-32 bg-background relative overflow-hidden">
      {/* Subtle glow effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between mb-12"
        >
          <div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground mb-4">
              FEATURED <span className="text-primary">PROJECTS</span>
            </h2>
            <p className="text-muted-foreground max-w-xl">
              From luxury hotels to commercial complexes, explore some of our most impactful electrical installations across Florida.
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("left")}
              className="rounded-full border-border hover:border-primary hover:text-primary"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => scroll("right")}
              className="rounded-full border-border hover:border-primary hover:text-primary"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </motion.div>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex-shrink-0 w-[320px] md:w-[380px] snap-start group"
            >
              <div className="relative h-[280px] md:h-[320px] rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/50 transition-all duration-300">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
                
                {/* Project type badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-full">
                    {project.type}
                  </span>
                </div>
                
                {/* Project value */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="text-2xl font-display text-primary">
                    {project.value}
                  </span>
                </div>
                
                {/* Background pattern */}
                <div className="absolute inset-0 bg-secondary">
                  <div className="absolute inset-0 opacity-20">
                    <Building2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 text-primary" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl md:text-2xl font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location.address.split(",").slice(-2).join(",").trim()}</span>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute inset-0 bg-primary/5" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <Button
            onClick={scrollToMap}
            variant="outline"
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            View All Projects on Map
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
