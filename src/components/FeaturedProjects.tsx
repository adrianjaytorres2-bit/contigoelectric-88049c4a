import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projects, type Project } from "@/data/projects";
import { getProjectImage, getProjectImages } from "@/lib/projectImages";
import { ImageLightbox } from "@/components/ImageLightbox";

// Featured project categories
const luxuryRetailNames = [
  "Gucci - Mall at Millenia",
  "Christian Louboutin - Millenia Mall",
  "Versace - Vineland Shops",
  "Hublot - Millenia Mall",
  "Marc Jacobs - Vineland Shops",
  "Omega - Millenia Mall"
];

const multiFamilyNames = [
  "Celeste Hotel UCF",
  "Palm Place Apartments",
  "The Sevens Apartments"
];

const governmentNames = [
  "Sanford Orlando International Airport",
  "Viera Middle School"
];

// Get projects by name list
const getProjectsByNames = (names: string[]) => {
  return names.map(name => 
    projects.find(p => p.name === name)
  ).filter(Boolean) as typeof projects;
};

// Get projects by type
const getProjectsByType = (type: string, limit: number = 6) => {
  return projects.filter(p => p.type === type).slice(0, limit);
};

const luxuryProjects = getProjectsByNames(luxuryRetailNames);
const multiFamilyProjects = getProjectsByNames(multiFamilyNames);
const governmentProjects = getProjectsByNames(governmentNames);

interface ProjectRowProps {
  title: string;
  subtitle: string;
  projects: typeof projects;
  delay?: number;
  onProjectClick: (project: Project) => void;
}

const ProjectRow = ({ title, subtitle, projects: rowProjects, delay = 0, onProjectClick }: ProjectRowProps) => {
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

  if (rowProjects.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true }}
      className="mb-12 last:mb-0"
    >
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-display text-foreground mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="rounded-full border-border hover:border-primary hover:text-primary h-8 w-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="rounded-full border-border hover:border-primary hover:text-primary h-8 w-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {rowProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            viewport={{ once: true }}
            className="flex-shrink-0 w-[280px] md:w-[320px] snap-start group cursor-pointer"
            onClick={() => onProjectClick(project)}
          >
            <div className="relative h-[220px] md:h-[260px] rounded-lg overflow-hidden bg-card border border-border group-hover:border-primary/50 transition-all duration-300">
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent z-10" />
              
              {/* Project type badge */}
              <div className="absolute top-3 left-3 z-20">
                <span className="px-2 py-1 bg-primary/90 text-primary-foreground text-xs font-semibold uppercase tracking-wider rounded-full">
                  {project.type}
                </span>
              </div>
              
              {/* Zoom icon - appears on hover */}
              <div className="absolute top-3 right-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2 bg-background/80 rounded-full">
                  <ZoomIn className="w-4 h-4 text-foreground" />
                </div>
              </div>
              
              {/* Background image */}
              <div className="absolute inset-0">
                <img 
                  src={getProjectImage(project.type, project.name, project.city)} 
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                <h4 className="text-lg md:text-xl font-display text-foreground mb-1 group-hover:text-primary transition-colors">
                  {project.name}
                </h4>
                <div className="flex items-center gap-2 text-muted-foreground text-xs">
                  <MapPin className="w-3 h-3" />
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
    </motion.div>
  );
};

export const FeaturedProjects = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [selectedProjectName, setSelectedProjectName] = useState("");

  const handleProjectClick = (project: Project) => {
    const images = getProjectImages(project.type, project.name, project.city);
    setLightboxImages(images);
    setLightboxIndex(0);
    setSelectedProjectName(project.name);
    setLightboxOpen(true);
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
          className="mb-12"
        >
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display text-foreground mb-4">
            FEATURED <span className="text-primary">PROJECTS</span>
          </h2>
          <p className="text-muted-foreground max-w-xl">
            From luxury retail brands to government facilities, explore some of our most impactful electrical installations across Florida.
          </p>
        </motion.div>

        {/* Luxury Retail Row */}
        <ProjectRow
          title="Luxury Retail"
          subtitle="High-end retail and designer boutiques"
          projects={luxuryProjects}
          delay={0.1}
          onProjectClick={handleProjectClick}
        />

        {/* Multi-Family Row */}
        <ProjectRow
          title="Multi-Family"
          subtitle="Hotels, apartments, and residential complexes"
          projects={multiFamilyProjects}
          delay={0.2}
          onProjectClick={handleProjectClick}
        />

        {/* Government & Institutional Row */}
        <ProjectRow
          title="Government & Institutional"
          subtitle="Healthcare, education, and public facilities"
          projects={governmentProjects}
          delay={0.3}
          onProjectClick={handleProjectClick}
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
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

      {/* Lightbox */}
      <ImageLightbox
        images={lightboxImages}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setLightboxIndex}
        projectName={selectedProjectName}
      />
    </section>
  );
};
