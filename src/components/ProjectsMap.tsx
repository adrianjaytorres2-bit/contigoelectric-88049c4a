import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Building2 } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { Card, CardContent } from "@/components/ui/card";

// Project positions on Florida map (percentage based)
const projectPositions = [
  { x: 62, y: 32, city: "Oviedo" },
  { x: 48, y: 45, city: "Orlando" },
  { x: 38, y: 58, city: "Dr. Phillips" },
  { x: 58, y: 28, city: "Winter Springs" },
  { x: 55, y: 35, city: "Casselberry" },
  { x: 35, y: 52, city: "Sand Lake" },
  { x: 32, y: 62, city: "I-Drive" },
  { x: 52, y: 48, city: "Airport" },
  { x: 28, y: 42, city: "Windermere" },
  { x: 50, y: 25, city: "Maitland" },
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
          <div className="relative h-[500px] md:h-[600px] rounded-lg overflow-hidden border border-border">
            {/* Map Container */}
            <div className="absolute inset-0 bg-[#1a2332]">
              {/* Water/Ocean base */}
              <div className="absolute inset-0 bg-[#1e3a5f]" />
              
              {/* Florida Land Mass SVG */}
              <svg
                viewBox="0 0 100 100"
                className="absolute inset-0 w-full h-full"
                preserveAspectRatio="xMidYMid slice"
              >
                {/* Land - Florida shape */}
                <defs>
                  <linearGradient id="landGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#2d3b4a" />
                    <stop offset="100%" stopColor="#1f2937" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="0.5" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>

                {/* Central Florida land area */}
                <path
                  d="M 0 0 L 100 0 L 100 100 L 0 100 Z"
                  fill="url(#landGradient)"
                />

                {/* Major Lakes */}
                <ellipse cx="20" cy="45" rx="8" ry="6" fill="#1e3a5f" opacity="0.8" />
                <ellipse cx="45" cy="38" rx="5" ry="4" fill="#1e3a5f" opacity="0.8" />
                <ellipse cx="70" cy="50" rx="6" ry="5" fill="#1e3a5f" opacity="0.8" />
                <ellipse cx="35" cy="65" rx="4" ry="3" fill="#1e3a5f" opacity="0.8" />
                <ellipse cx="60" cy="25" rx="3" ry="2.5" fill="#1e3a5f" opacity="0.8" />
                <ellipse cx="25" cy="30" rx="4" ry="3" fill="#1e3a5f" opacity="0.8" />
                <ellipse cx="80" cy="35" rx="5" ry="4" fill="#1e3a5f" opacity="0.8" />

                {/* Major Highways */}
                {/* I-4 */}
                <path
                  d="M 5 70 Q 30 50 50 45 Q 70 40 95 30"
                  fill="none"
                  stroke="#4a5568"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* 408 */}
                <path
                  d="M 25 45 L 75 45"
                  fill="none"
                  stroke="#4a5568"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* 417 */}
                <path
                  d="M 55 15 Q 60 40 65 70 Q 68 85 70 95"
                  fill="none"
                  stroke="#4a5568"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* 429 */}
                <path
                  d="M 20 20 Q 22 45 25 70"
                  fill="none"
                  stroke="#4a5568"
                  strokeWidth="1"
                  strokeLinecap="round"
                />
                {/* US 192 */}
                <path
                  d="M 5 75 L 95 75"
                  fill="none"
                  stroke="#3d4852"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                {/* US 17-92 */}
                <path
                  d="M 50 5 L 50 95"
                  fill="none"
                  stroke="#3d4852"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />

                {/* Secondary roads grid */}
                {[20, 35, 50, 65, 80].map((y) => (
                  <path
                    key={`h-${y}`}
                    d={`M 10 ${y} L 90 ${y}`}
                    fill="none"
                    stroke="#2d3748"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                ))}
                {[20, 35, 50, 65, 80].map((x) => (
                  <path
                    key={`v-${x}`}
                    d={`M ${x} 10 L ${x} 90`}
                    fill="none"
                    stroke="#2d3748"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                ))}

                {/* City labels */}
                <text x="48" y="52" fontSize="2.5" fill="#64748b" fontFamily="system-ui" fontWeight="500">ORLANDO</text>
                <text x="28" y="43" fontSize="1.8" fill="#4a5568" fontFamily="system-ui">Windermere</text>
                <text x="58" y="30" fontSize="1.8" fill="#4a5568" fontFamily="system-ui">Winter Park</text>
                <text x="32" y="68" fontSize="1.8" fill="#4a5568" fontFamily="system-ui">I-Drive</text>
                <text x="70" y="55" fontSize="1.8" fill="#4a5568" fontFamily="system-ui">UCF</text>
                <text x="15" y="50" fontSize="1.8" fill="#4a5568" fontFamily="system-ui">Disney</text>

                {/* Project Markers */}
                {projects.map((project, index) => {
                  const pos = projectPositions[index];
                  const isSelected = selectedProject?.id === project.id;
                  const isHovered = hoveredProject === index;
                  
                  return (
                    <g key={project.id} filter={isHovered || isSelected ? "url(#glow)" : undefined}>
                      {/* Pulse animation ring */}
                      {(isHovered || isSelected) && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="4"
                          fill="none"
                          stroke="#f97316"
                          strokeWidth="0.5"
                          opacity="0.5"
                        >
                          <animate
                            attributeName="r"
                            from="2.5"
                            to="5"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                          <animate
                            attributeName="opacity"
                            from="0.6"
                            to="0"
                            dur="1s"
                            repeatCount="indefinite"
                          />
                        </circle>
                      )}
                      
                      {/* Main marker circle */}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={isHovered || isSelected ? "3" : "2.5"}
                        fill="#f97316"
                        stroke="#fff"
                        strokeWidth="0.4"
                        className="cursor-pointer transition-all duration-200"
                        style={{
                          filter: isHovered || isSelected ? "drop-shadow(0 0 4px #f97316)" : "drop-shadow(0 1px 2px rgba(0,0,0,0.5))"
                        }}
                        onMouseEnter={() => setHoveredProject(index)}
                        onMouseLeave={() => setHoveredProject(null)}
                        onClick={() => setSelectedProject(project)}
                      />
                      
                      {/* Number label */}
                      <text
                        x={pos.x}
                        y={pos.y + 0.8}
                        textAnchor="middle"
                        fontSize="2"
                        fontWeight="bold"
                        fill="#fff"
                        className="pointer-events-none select-none"
                        style={{ fontFamily: "system-ui" }}
                      >
                        {index + 1}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Map overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent pointer-events-none" />
            </div>

            {/* Project Details Panel */}
            <AnimatePresence>
              {selectedProject && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="absolute top-4 left-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto z-10"
                >
                  <Card className="bg-card/95 backdrop-blur-sm border-border shadow-xl">
                    <CardContent className="p-0">
                      <div className="relative">
                        <img
                          src={selectedProject.image}
                          alt={selectedProject.name}
                          className="w-full h-40 object-cover"
                        />
                        <button
                          onClick={() => setSelectedProject(null)}
                          className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
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
            <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg p-4 border border-border shadow-lg z-10">
              <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wider">Central Florida</h4>
              <p className="text-xs text-muted-foreground mb-3">Click markers to view projects</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold shadow">1</div>
                <span className="text-xs text-foreground">Project Location</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-5 h-0.5 bg-[#4a5568] rounded" />
                <span className="text-xs text-muted-foreground">Major Highway</span>
              </div>
            </div>

            {/* Map Title */}
            <div className="absolute top-4 right-4 bg-card/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-border shadow-lg z-10">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">Orlando Metro Area</span>
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