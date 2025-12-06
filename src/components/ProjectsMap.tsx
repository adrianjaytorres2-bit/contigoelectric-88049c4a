import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Building2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { projects, type Project } from "@/data/projects";
import { Card, CardContent } from "@/components/ui/card";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom orange marker icon
const createNumberedIcon = (number: number) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: #f97316;
        border: 3px solid #fff;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 14px;
        color: white;
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.5);
        cursor: pointer;
      ">
        ${number}
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
};

// Component to fly to location
function FlyToLocation({ project }: { project: Project | null }) {
  const map = useMap();
  
  if (project) {
    map.flyTo([project.location.lat, project.location.lng], 14, {
      duration: 1.5,
    });
  }
  
  return null;
}

export function ProjectsMap() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleMarkerClick = (project: Project) => {
    setSelectedProject(project);
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
  };

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
          <div className="relative h-[500px] md:h-[650px] rounded-lg overflow-hidden border border-border shadow-xl">
            <MapContainer
              center={[28.54, -81.38]}
              zoom={10}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
              style={{ background: "#1a1a2e" }}
            >
              {/* Dark themed map tiles */}
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Fly to selected project */}
              <FlyToLocation project={selectedProject} />

              {/* Project Markers */}
              {projects.map((project, index) => (
                <Marker
                  key={project.id}
                  position={[project.location.lat, project.location.lng]}
                  icon={createNumberedIcon(index + 1)}
                  eventHandlers={{
                    click: () => handleMarkerClick(project),
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="text-sm font-semibold">{project.name}</div>
                    <div className="text-xs text-gray-500">{project.location.address}</div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>

            {/* Project Details Panel - Mobile: bottom sheet, Desktop: side panel */}
            <AnimatePresence>
              {selectedProject && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-4 md:left-4 md:right-auto md:w-80 max-h-[60%] md:max-h-[calc(100%-2rem)] overflow-y-auto z-[1000]"
                >
                  <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl rounded-t-2xl md:rounded-lg">
                    <CardContent className="p-0">
                      <div className="relative">
                        {/* Mobile drag indicator */}
                        <div className="md:hidden absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-muted-foreground/30 rounded-full z-10" />
                        <img
                          src={selectedProject.image}
                          alt={selectedProject.name}
                          className="w-full h-32 md:h-44 object-cover rounded-t-2xl md:rounded-t-lg"
                        />
                        <button
                          onClick={closeProjectDetails}
                          className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <div className="absolute bottom-2 left-2 w-8 h-8 md:w-10 md:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg text-sm md:text-base">
                          {projects.findIndex((p) => p.id === selectedProject.id) + 1}
                        </div>
                      </div>
                      <div className="p-4 md:p-5">
                        <h3 className="font-display text-lg md:text-xl text-foreground mb-2">{selectedProject.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">{selectedProject.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                            <Building2 className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                            <span className="text-foreground truncate">{selectedProject.type}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                            <DollarSign className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                            <span className="text-foreground">{selectedProject.value}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                            <span className="text-foreground">{selectedProject.year}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm col-span-2 md:col-span-1">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                            <span className="text-foreground truncate">{selectedProject.location.address}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend - hidden on mobile when project selected */}
            <div className={`absolute bottom-4 left-4 bg-card/90 backdrop-blur-md rounded-lg p-3 md:p-4 border border-border shadow-lg z-[999] ${selectedProject ? 'hidden md:block' : ''}`}>
              <p className="text-[10px] md:text-xs text-muted-foreground mb-1 md:mb-2">Drag to pan • Pinch to zoom</p>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 bg-orange-500 rounded-full flex items-center justify-center text-[8px] md:text-[10px] text-white font-bold border-2 border-white">
                  1
                </div>
                <span className="text-[10px] md:text-xs text-foreground">Tap marker for details</span>
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