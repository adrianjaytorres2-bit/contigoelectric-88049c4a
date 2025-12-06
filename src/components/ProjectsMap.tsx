import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Building2 } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { Card, CardContent } from "@/components/ui/card";

// Florida-focused project locations (approximate positions on our custom map)
const projectPositions = [
  { x: 72, y: 58 },   // Project 1 - Oviedo
  { x: 68, y: 62 },   // Project 2 - Orlando
  { x: 65, y: 66 },   // Project 3 - Dr. Phillips
  { x: 70, y: 56 },   // Project 4 - Winter Springs
  { x: 69, y: 58 },   // Project 5 - Casselberry
  { x: 64, y: 64 },   // Project 6 - Sand Lake
  { x: 63, y: 68 },   // Project 7 - International Drive
  { x: 71, y: 63 },   // Project 8 - Airport Area
  { x: 62, y: 60 },   // Project 9 - Windermere
  { x: 67, y: 55 },   // Project 10 - Maitland
];

export function ProjectsMap() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);

  return (
    <section id="projects" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-5xl md:text-6xl text-foreground mb-4">OUR PROJECTS</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-2">
            Explore our 64+ completed projects across Central Florida. Click on any marker to view project details.
          </p>
          <p className="text-sm text-primary">
            BuildZoom Score: 108 • Top 5% of Florida Licensed Contractors
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-border bg-card">
            {/* Custom SVG World Map - Minimalist Style */}
            <svg
              viewBox="0 0 100 60"
              className="w-full h-full"
              preserveAspectRatio="xMidYMid slice"
            >
              {/* Background */}
              <rect width="100" height="60" fill="hsl(var(--card))" />
              
              {/* Grid lines for style */}
              {[...Array(10)].map((_, i) => (
                <line
                  key={`h-${i}`}
                  x1="0"
                  y1={i * 6}
                  x2="100"
                  y2={i * 6}
                  stroke="hsl(var(--border))"
                  strokeWidth="0.1"
                  opacity="0.3"
                />
              ))}
              {[...Array(15)].map((_, i) => (
                <line
                  key={`v-${i}`}
                  x1={i * 7}
                  y1="0"
                  x2={i * 7}
                  y2="60"
                  stroke="hsl(var(--border))"
                  strokeWidth="0.1"
                  opacity="0.3"
                />
              ))}

              {/* Simplified World Continents - Very minimal outlines */}
              {/* North America */}
              <path
                d="M 10 12 Q 15 8 25 10 Q 30 12 32 18 Q 28 22 25 28 Q 22 32 18 35 Q 14 32 12 28 Q 8 22 10 12"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.3"
                opacity="0.4"
              />
              
              {/* South America */}
              <path
                d="M 22 36 Q 25 38 26 42 Q 27 48 24 52 Q 22 54 20 52 Q 18 48 19 42 Q 20 38 22 36"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.3"
                opacity="0.4"
              />
              
              {/* Europe */}
              <path
                d="M 45 14 Q 50 12 55 14 Q 52 18 48 20 Q 44 18 45 14"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.3"
                opacity="0.4"
              />
              
              {/* Africa */}
              <path
                d="M 48 24 Q 54 22 58 26 Q 60 32 58 40 Q 54 44 50 42 Q 46 38 46 32 Q 46 26 48 24"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.3"
                opacity="0.4"
              />
              
              {/* Asia */}
              <path
                d="M 58 10 Q 70 8 82 12 Q 88 16 90 22 Q 86 28 80 30 Q 72 32 65 28 Q 58 24 56 18 Q 56 12 58 10"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.3"
                opacity="0.4"
              />
              
              {/* Australia */}
              <path
                d="M 78 42 Q 84 40 88 44 Q 90 48 86 52 Q 82 54 78 50 Q 76 46 78 42"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="0.3"
                opacity="0.4"
              />

              {/* Florida Highlight - Where our projects are */}
              <path
                d="M 24 26 Q 26 25 28 27 Q 29 30 27 33 Q 25 32 24 29 Q 23 27 24 26"
                fill="hsl(var(--primary))"
                opacity="0.15"
                stroke="hsl(var(--primary))"
                strokeWidth="0.2"
              />

              {/* Project Markers - Orange circles with numbers */}
              {projects.map((project, index) => {
                const pos = projectPositions[index];
                // Scale positions to be within Florida area
                const scaledX = 20 + (pos.x - 60) * 0.8;
                const scaledY = 22 + (pos.y - 55) * 0.8;
                
                return (
                  <g key={project.id}>
                    {/* Glow effect for hovered/selected */}
                    {(hoveredProject === index || selectedProject?.id === project.id) && (
                      <circle
                        cx={scaledX}
                        cy={scaledY}
                        r="2.5"
                        fill="hsl(25, 95%, 53%)"
                        opacity="0.3"
                      />
                    )}
                    
                    {/* Main circle */}
                    <circle
                      cx={scaledX}
                      cy={scaledY}
                      r="1.5"
                      fill="hsl(25, 95%, 53%)"
                      stroke="hsl(var(--background))"
                      strokeWidth="0.2"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        filter: hoveredProject === index || selectedProject?.id === project.id 
                          ? "drop-shadow(0 0 3px hsl(25, 95%, 53%))" 
                          : "none"
                      }}
                      onMouseEnter={() => setHoveredProject(index)}
                      onMouseLeave={() => setHoveredProject(null)}
                      onClick={() => setSelectedProject(project)}
                    />
                    
                    {/* Number */}
                    <text
                      x={scaledX}
                      y={scaledY + 0.5}
                      textAnchor="middle"
                      fontSize="1.2"
                      fontWeight="bold"
                      fill="hsl(var(--background))"
                      className="pointer-events-none select-none"
                      style={{ fontFamily: "system-ui" }}
                    >
                      {index + 1}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Project Details Panel */}
            <AnimatePresence>
              {selectedProject && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-4 left-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto"
                >
                  <Card className="bg-card/95 backdrop-blur-sm border-border">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={selectedProject.image}
                          alt={selectedProject.name}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-background font-bold text-sm">
                          {projects.findIndex(p => p.id === selectedProject.id) + 1}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-display text-xl text-foreground mb-2">{selectedProject.name}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{selectedProject.description}</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Building2 className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{selectedProject.type}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{selectedProject.value}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{selectedProject.year}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="text-muted-foreground">{selectedProject.location.address}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Click markers to view projects</p>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-[8px] text-background font-bold">1</div>
                <span className="text-xs text-foreground">Project Location</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            { value: "64+", label: "Projects Completed" },
            { value: "108", label: "BuildZoom Score" },
            { value: "Top 5%", label: "FL Contractors" },
            { value: "6+", label: "Licenses Held" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-6 bg-card rounded-lg border border-border"
            >
              <div className="font-display text-3xl md:text-4xl text-primary mb-2">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}