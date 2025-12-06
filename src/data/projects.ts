export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  value: string;
  year: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  image: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "Custom Home Build",
    description: "Complete electrical installation for a luxury custom home including smart home integration, LED lighting design, and 400-amp service upgrade.",
    type: "Residential",
    value: "$85,000",
    year: "2024",
    location: {
      lat: 28.6692,
      lng: -81.2079,
      address: "Oviedo, FL"
    },
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800"
  },
  {
    id: "2",
    name: "Restaurant Buildout",
    description: "Full commercial electrical buildout for upscale restaurant including kitchen equipment circuits, ambient lighting, and emergency systems.",
    type: "Commercial",
    value: "$120,000",
    year: "2024",
    location: {
      lat: 28.5383,
      lng: -81.3792,
      address: "Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "3",
    name: "Swimming Pool Project",
    description: "Electrical installation for resort-style pool including underwater lighting, pump systems, and outdoor entertainment area.",
    type: "Residential",
    value: "$45,000",
    year: "2024",
    location: {
      lat: 28.4015,
      lng: -81.4382,
      address: "Dr. Phillips, FL"
    },
    image: "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800"
  },
  {
    id: "4",
    name: "Kitchen Remodel",
    description: "Complete kitchen electrical upgrade including under-cabinet lighting, appliance circuits, and modern switch installation.",
    type: "Residential",
    value: "$28,000",
    year: "2023",
    location: {
      lat: 28.5947,
      lng: -81.2058,
      address: "Winter Springs, FL"
    },
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
  },
  {
    id: "5",
    name: "Bathroom Remodel",
    description: "Bathroom electrical renovation including GFCI outlets, vanity lighting, exhaust fan installation, and heated floor wiring.",
    type: "Residential",
    value: "$15,000",
    year: "2023",
    location: {
      lat: 28.6180,
      lng: -81.2849,
      address: "Casselberry, FL"
    },
    image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800"
  },
  {
    id: "6",
    name: "Medical Office Buildout",
    description: "Specialized electrical installation for medical facility including exam room lighting, medical equipment circuits, and emergency backup systems.",
    type: "Commercial",
    value: "$200,000",
    year: "2024",
    location: {
      lat: 28.5019,
      lng: -81.4559,
      address: "Sand Lake, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  {
    id: "7",
    name: "Retail Store Electrical",
    description: "Complete electrical installation for retail space including display lighting, POS system wiring, and security system integration.",
    type: "Commercial",
    value: "$75,000",
    year: "2023",
    location: {
      lat: 28.4594,
      lng: -81.4697,
      address: "International Drive, FL"
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  },
  {
    id: "8",
    name: "Warehouse Lighting Upgrade",
    description: "LED lighting retrofit for 50,000 sq ft warehouse including motion sensors, emergency lighting, and energy management system.",
    type: "Industrial",
    value: "$150,000",
    year: "2024",
    location: {
      lat: 28.4839,
      lng: -81.2973,
      address: "Airport Area, FL"
    },
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"
  },
  {
    id: "9",
    name: "Church Audio/Visual",
    description: "Complete low-voltage installation including structured cabling, audio system, video displays, and stage lighting.",
    type: "Commercial",
    value: "$95,000",
    year: "2023",
    location: {
      lat: 28.5494,
      lng: -81.5231,
      address: "Windermere, FL"
    },
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800"
  },
  {
    id: "10",
    name: "Fire Alarm System",
    description: "Design and installation of complete fire alarm system for commercial building including smoke detectors, pull stations, and monitoring.",
    type: "Life Safety",
    value: "$65,000",
    year: "2024",
    location: {
      lat: 28.5728,
      lng: -81.3393,
      address: "Maitland, FL"
    },
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
  }
];
