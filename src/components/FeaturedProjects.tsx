import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects } from "@/data/projects";

// Import existing project images
import projectGucci from "@/assets/project-gucci.jpeg";
import projectRetail from "@/assets/project-retail.jpeg";
import projectRestaurant from "@/assets/project-restaurant.jpeg";
import projectCommercial from "@/assets/project-commercial.jpeg";
import projectElectrical from "@/assets/project-electrical.jpeg";

// Map project types to images
const getProjectImage = (type: string, name: string) => {
  if (name.toLowerCase().includes("gucci") || name.toLowerCase().includes("versace") || 
      name.toLowerCase().includes("louboutin") || name.toLowerCase().includes("hublot") ||
      name.toLowerCase().includes("omega") || name.toLowerCase().includes("marc jacobs")) {
    return projectGucci;
  }
  if (type === "Restaurant" || type === "Fitness" || type === "Wellness") {
    return projectRestaurant;
  }
  if (type === "Retail" || type === "Luxury Retail") {
    return projectRetail;
  }
  if (type === "Commercial" || type === "Financial" || type === "Medical") {
    return projectCommercial;
  }
  return projectElectrical;
};

// Get top 6 featured projects (luxury retail brands)
const featuredProjectNames = [
  "Gucci - Mall at Millenia",
  "Christian Louboutin - Millenia Mall",
  "Versace - Vineland Shops",
  "Hublot - Millenia Mall",
  "Marc Jacobs - Vineland Shops",
  "Omega - Millenia Mall"
];

const featuredProjects = projects.filter(p => 
  featuredProjectNames.some(name => p.name.includes(name.split(" - ")[0]))
).slice(0, 6);

// If not enough luxury brands, add more from the list
const additionalProjects = projects.filter(p => 
  !featuredProjects.includes(p) && 
  (p.type === "Luxury Retail" || p.type === "Restaurant" || p.name.includes("Disney"))
).slice(0, 6 - featuredProjects.length);

const displayProjects = [...featuredProjects, ...additionalProjects].slice(0, 6);

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
              From luxury retail brands to commercial complexes, explore some of our most impactful electrical installations across Florida.
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
          {displayProjects.map((project, index) => (
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
                
                {/* Background image */}
                <div className="absolute inset-0">
                  <img 
                    src={getProjectImage(project.type, project.name)} 
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                  <h3 className="text-xl md:text-2xl font-display text-foreground mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>{project.city}, {project.state}</span>
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
