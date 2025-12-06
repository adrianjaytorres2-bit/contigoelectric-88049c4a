import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Calendar, DollarSign, Building2, ZoomIn } from "lucide-react";
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
  const [tokenInput, setTokenInput] = useState<string>("");
  const [isMapReady, setIsMapReady] = useState(false);

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    try {
      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [-81.38, 28.54],
        zoom: 10,
        pitch: 45,
        bearing: -10,
      });

      // Add navigation controls (zoom in/out)
      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: true,
        }),
        "top-right"
      );

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");

      map.current.on("load", () => {
        setIsMapReady(true);

        // Add markers for each project
        projects.forEach((project, index) => {
          // Create custom marker element
          const markerEl = document.createElement("div");
          markerEl.className = "project-marker";
          markerEl.style.cssText = `
            width: 36px;
            height: 36px;
            background: #f97316;
            border: 3px solid #fff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            font-size: 14px;
            color: white;
            box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
            transition: transform 0.2s, box-shadow 0.2s;
          `;
          markerEl.textContent = String(index + 1);

          markerEl.addEventListener("mouseenter", () => {
            markerEl.style.transform = "scale(1.2)";
            markerEl.style.boxShadow = "0 6px 20px rgba(249, 115, 22, 0.6)";
          });

          markerEl.addEventListener("mouseleave", () => {
            markerEl.style.transform = "scale(1)";
            markerEl.style.boxShadow = "0 4px 12px rgba(249, 115, 22, 0.4)";
          });

          markerEl.addEventListener("click", () => {
            setSelectedProject(project);
            map.current?.flyTo({
              center: [project.location.lng, project.location.lat],
              zoom: 14,
              duration: 1500,
              pitch: 60,
            });
          });

          const marker = new mapboxgl.Marker(markerEl)
            .setLngLat([project.location.lng, project.location.lat])
            .addTo(map.current!);

          markersRef.current.push(marker);
        });
      });

      map.current.on("error", () => {
        setIsMapReady(false);
        localStorage.removeItem("mapbox_token");
      });
    } catch {
      console.error("Failed to initialize map");
    }
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
      map.current = null;
    };
  }, []);

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      const token = tokenInput.trim();
      localStorage.setItem("mapbox_token", token);
      setMapboxToken(token);
      initializeMap(token);
    }
  };

  const closeProjectDetails = () => {
    setSelectedProject(null);
    map.current?.flyTo({
      center: [-81.38, 28.54],
      zoom: 10,
      duration: 1500,
      pitch: 45,
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
          {!mapboxToken ? (
            <Card className="bg-card border-border">
              <CardContent className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ZoomIn className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-display text-2xl text-foreground mb-2">Interactive Project Map</h3>
                  <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
                    Enter your Mapbox public token to explore our project locations with full zoom and pan controls.
                  </p>
                  <a
                    href="https://account.mapbox.com/access-tokens/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    Get your free token at mapbox.com →
                  </a>
                </div>
                <form onSubmit={handleTokenSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <Input
                    type="text"
                    placeholder="pk.eyJ1Ijoi... (paste your public token)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1 bg-secondary border-border"
                  />
                  <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Load Map
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="relative h-[500px] md:h-[650px] rounded-lg overflow-hidden border border-border shadow-xl">
              <div ref={mapContainer} className="absolute inset-0" />

              {/* Project Details Panel */}
              <AnimatePresence>
                {selectedProject && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="absolute top-4 left-4 w-80 max-h-[calc(100%-2rem)] overflow-y-auto z-10"
                  >
                    <Card className="bg-card/95 backdrop-blur-md border-border shadow-2xl">
                      <CardContent className="p-0">
                        <div className="relative">
                          <img
                            src={selectedProject.image}
                            alt={selectedProject.name}
                            className="w-full h-44 object-cover"
                          />
                          <button
                            onClick={closeProjectDetails}
                            className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full hover:bg-background transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-2 left-2 w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                            {projects.findIndex((p) => p.id === selectedProject.id) + 1}
                          </div>
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-xl text-foreground mb-2">{selectedProject.name}</h3>
                          <p className="text-sm text-muted-foreground mb-4">{selectedProject.description}</p>
                          <div className="space-y-3">
                            <div className="flex items-center gap-3 text-sm">
                              <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{selectedProject.type}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <DollarSign className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{selectedProject.value}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{selectedProject.year}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                              <span className="text-foreground">{selectedProject.location.address}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-md rounded-lg p-4 border border-border shadow-lg z-10">
                <p className="text-xs text-muted-foreground mb-2">Drag to pan • Scroll to zoom</p>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                    1
                  </div>
                  <span className="text-xs text-foreground">Click marker for details</span>
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