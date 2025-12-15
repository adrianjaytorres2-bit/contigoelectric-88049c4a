import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Building2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { projects, type Project } from "@/data/projects";
import { Card, CardContent } from "@/components/ui/card";
import { getProjectImage } from "@/lib/projectImages";

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom red marker icon (like BuildZoom's main location marker)
const redMarkerIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Default blue marker icon
const blueMarkerIcon = L.icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom cluster icon creator (like BuildZoom)
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = "small";
  let bgColor = "rgba(181, 226, 140, 0.8)";
  let borderColor = "rgba(110, 204, 57, 1)";
  
  if (count >= 10 && count < 50) {
    size = "medium";
    bgColor = "rgba(241, 211, 87, 0.8)";
    borderColor = "rgba(240, 194, 12, 1)";
  } else if (count >= 50) {
    size = "large";
    bgColor = "rgba(253, 156, 115, 0.8)";
    borderColor = "rgba(241, 128, 23, 1)";
  }

  return L.divIcon({
    html: `<div class="cluster-inner"><span>${count}</span></div>`,
    className: `marker-cluster marker-cluster-${size}`,
    iconSize: L.point(40, 40, true),
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

  // Main office location (Oviedo)
  const mainOffice = { lat: 28.6692, lng: -81.2079 };

  return (
    <section id="projects" className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 md:mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">OUR PROJECTS</h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto mb-2">
            Explore our {projects.length}+ completed projects across Central Florida. Click on any marker to view project details.
          </p>
          <p className="text-xs md:text-sm text-primary">
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
          <div className="relative h-[300px] md:h-[380px] lg:h-[450px] rounded-lg overflow-hidden border border-border shadow-xl">
            <MapContainer
              center={[28.54, -81.38]}
              zoom={9}
              scrollWheelZoom={true}
              className="h-full w-full z-0"
            >
              {/* Dark themed map tiles */}
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />

              {/* Fly to selected project */}
              <FlyToLocation project={selectedProject} />

              {/* Marker Cluster Group */}
              <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createClusterCustomIcon}
                maxClusterRadius={60}
                spiderfyOnMaxZoom={true}
                showCoverageOnHover={false}
                zoomToBoundsOnClick={true}
              >
                {/* Main office marker (red) */}
                <Marker position={[mainOffice.lat, mainOffice.lng]} icon={redMarkerIcon}>
                  <Popup>
                    <div className="text-sm font-semibold">Contigo Electric HQ</div>
                    <div className="text-xs text-gray-500">Oviedo, FL</div>
                  </Popup>
                </Marker>

                {/* Project Markers (blue) */}
                {projects.map((project) => (
                  <Marker
                    key={project.id}
                    position={[project.location.lat, project.location.lng]}
                    icon={blueMarkerIcon}
                    eventHandlers={{
                      click: () => handleMarkerClick(project),
                    }}
                  >
                    <Popup>
                      <div className="text-sm font-semibold">{project.name}</div>
                      <div className="text-xs text-gray-500">{project.location.address}</div>
                    </Popup>
                  </Marker>
                ))}
              </MarkerClusterGroup>
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
                          src={getProjectImage(selectedProject.type, selectedProject.name, selectedProject.city)}
                          alt={selectedProject.name}
                          className="w-full h-32 md:h-44 object-cover rounded-t-2xl md:rounded-t-lg"
                        />
                        <button
                          onClick={closeProjectDetails}
                          className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-4 md:p-5">
                        <h3 className="font-display text-lg md:text-xl text-foreground mb-2">{selectedProject.name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 md:mb-4 line-clamp-2 md:line-clamp-none">{selectedProject.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm">
                            <Building2 className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                            <span className="text-foreground truncate">{selectedProject.type}</span>
                          </div>
                          <div className="flex items-center gap-2 md:gap-3 text-xs md:text-sm col-span-2 md:col-span-1">
                            <MapPin className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                            <span className="text-foreground truncate">{selectedProject.city}, {selectedProject.state}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Legend - hidden on mobile when project selected */}
            <div className={`absolute bottom-4 right-4 bg-card/90 backdrop-blur-md rounded-lg p-2 md:p-3 border border-border shadow-lg z-[999] ${selectedProject ? 'hidden md:block' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <img src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png" alt="HQ" className="w-3 h-5" />
                <span className="text-[10px] md:text-xs text-foreground">Headquarters</span>
              </div>
              <div className="flex items-center gap-2">
                <img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png" alt="Project" className="w-3 h-5" />
                <span className="text-[10px] md:text-xs text-foreground">Project Location</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12">
          {[
            { value: `${projects.length}+`, label: "Projects Completed" },
            { value: "108", label: "BuildZoom Score" },
            { value: "Top 5%", label: "FL Contractors" },
            { value: "EC13007893", label: "License Number" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="text-center p-4 md:p-6 bg-card rounded-lg border border-border"
            >
              <div className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary mb-1 md:mb-2">{stat.value}</div>
              <div className="text-xs md:text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cluster styling */}
      <style>{`
        .marker-cluster {
          background-clip: padding-box;
          border-radius: 20px;
        }
        .marker-cluster div {
          width: 30px;
          height: 30px;
          margin-left: 5px;
          margin-top: 5px;
          text-align: center;
          border-radius: 15px;
          font: 12px "Helvetica Neue", Arial, Helvetica, sans-serif;
          font-weight: bold;
        }
        .marker-cluster span {
          line-height: 30px;
        }
        .marker-cluster-small {
          background-color: rgba(181, 226, 140, 0.6);
        }
        .marker-cluster-small div {
          background-color: rgba(110, 204, 57, 0.6);
          color: #fff;
        }
        .marker-cluster-medium {
          background-color: rgba(241, 211, 87, 0.6);
        }
        .marker-cluster-medium div {
          background-color: rgba(240, 194, 12, 0.6);
          color: #fff;
        }
        .marker-cluster-large {
          background-color: rgba(253, 156, 115, 0.6);
        }
        .marker-cluster-large div {
          background-color: rgba(241, 128, 23, 0.6);
          color: #fff;
        }
        .cluster-inner {
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
        }
      `}</style>
    </section>
  );
}
