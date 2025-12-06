import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Building2 } from "lucide-react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { projects, type Project } from "@/data/projects";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ProjectsMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string>("");
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-81.38, 28.54],
      zoom: 9,
      pitch: 30,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      setIsMapReady(true);

      // Add markers for each project
      projects.forEach((project) => {
        const markerEl = document.createElement("div");
        markerEl.className = "project-marker";
        markerEl.innerHTML = `
          <div class="w-8 h-8 bg-[hsl(187,100%,42%)] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg shadow-[hsl(187,100%,42%)/0.3]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="hsl(210,20%,8%)" stroke-width="2.5">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
          </div>
        `;

        markerEl.addEventListener("click", () => {
          setSelectedProject(project);
          map.current?.flyTo({
            center: [project.location.lng, project.location.lat],
            zoom: 12,
            duration: 1000,
          });
        });

        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([project.location.lng, project.location.lat])
          .addTo(map.current!);

        markersRef.current.push(marker);
      });
    });
  };

  useEffect(() => {
    // Check for saved token
    const savedToken = localStorage.getItem("mapbox_token");
    if (savedToken) {
      setMapboxToken(savedToken);
      initializeMap(savedToken);
    }

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.current?.remove();
    };
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mapboxToken.trim()) {
      localStorage.setItem("mapbox_token", mapboxToken.trim());
      initializeMap(mapboxToken.trim());
    }
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    map.current?.flyTo({
      center: [-81.38, 28.54],
      zoom: 9,
      duration: 1000,
    });
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
          {!localStorage.getItem("mapbox_token") && !isMapReady ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-display text-2xl text-foreground mb-2">Interactive Project Map</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Enter your Mapbox public token to view our project locations. Get your free token at{" "}
                    <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      mapbox.com
                    </a>
                  </p>
                </div>
                <form onSubmit={handleTokenSubmit} className="flex gap-4 max-w-md mx-auto">
                  <Input
                    type="text"
                    placeholder="Enter Mapbox public token..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                    className="flex-1 bg-secondary border-border"
                  />
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Load Map
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="relative h-[600px] rounded-lg overflow-hidden border border-border">
              <div ref={mapContainer} className="absolute inset-0" />

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
                            onClick={closeProjectDetails}
                            className="absolute top-2 right-2 p-1 bg-background/80 rounded-full hover:bg-background transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
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
                  <div className="w-3 h-3 bg-primary rounded-full" />
                  <span className="text-xs text-foreground">Project Location</span>
                </div>
              </div>
            </div>
          )}
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
