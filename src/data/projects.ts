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
  // Orlando Area
  {
    id: "1",
    name: "Gucci - Mall at Millenia",
    description: "Complete electrical buildout for luxury retail store including custom lighting design, display case power, and security system integration.",
    type: "Retail",
    value: "$180,000",
    year: "2024",
    location: {
      lat: 28.4851,
      lng: -81.4318,
      address: "Mall at Millenia, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  },
  {
    id: "2",
    name: "Capital Grille Restaurant",
    description: "Full commercial electrical buildout for upscale restaurant including kitchen equipment circuits, ambient lighting, and emergency systems.",
    type: "Restaurant",
    value: "$145,000",
    year: "2024",
    location: {
      lat: 28.4867,
      lng: -81.4302,
      address: "Millenia Plaza, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "3",
    name: "Orlando Health Medical Pavilion",
    description: "Specialized electrical installation for medical facility including exam room lighting, medical equipment circuits, and emergency backup systems.",
    type: "Medical",
    value: "$320,000",
    year: "2024",
    location: {
      lat: 28.5239,
      lng: -81.3801,
      address: "Downtown Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  {
    id: "4",
    name: "Marriott Conference Center",
    description: "Audio/visual electrical infrastructure, conference room power distribution, and smart lighting control systems.",
    type: "Hospitality",
    value: "$275,000",
    year: "2024",
    location: {
      lat: 28.4176,
      lng: -81.4558,
      address: "International Drive, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1431540015161-0bf868a2d407?w=800"
  },
  {
    id: "5",
    name: "Amazon Distribution Center",
    description: "Industrial electrical installation for 200,000 sq ft warehouse including LED high-bay lighting, conveyor systems, and EV charging stations.",
    type: "Industrial",
    value: "$850,000",
    year: "2024",
    location: {
      lat: 28.4521,
      lng: -81.2987,
      address: "Airport Industrial Park, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"
  },
  // Oviedo Area
  {
    id: "6",
    name: "Oviedo Medical Center Expansion",
    description: "Hospital wing electrical expansion including OR lighting, patient monitoring circuits, and nurse call systems.",
    type: "Medical",
    value: "$420,000",
    year: "2024",
    location: {
      lat: 28.6692,
      lng: -81.2079,
      address: "Oviedo, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  {
    id: "7",
    name: "Publix Supermarket",
    description: "Complete grocery store electrical including refrigeration circuits, bakery equipment, and LED lighting retrofit.",
    type: "Retail",
    value: "$195,000",
    year: "2024",
    location: {
      lat: 28.6612,
      lng: -81.1987,
      address: "Oviedo Marketplace, FL"
    },
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"
  },
  {
    id: "8",
    name: "LA Fitness",
    description: "Fitness center electrical buildout including treadmill circuits, locker room lighting, and pool equipment power.",
    type: "Commercial",
    value: "$165,000",
    year: "2023",
    location: {
      lat: 28.6701,
      lng: -81.2234,
      address: "Oviedo, FL"
    },
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
  },
  // Winter Park / Maitland
  {
    id: "9",
    name: "Ruth's Chris Steak House",
    description: "Upscale restaurant electrical including custom chandeliers, kitchen hood circuits, and wine cellar climate control.",
    type: "Restaurant",
    value: "$135,000",
    year: "2024",
    location: {
      lat: 28.5994,
      lng: -81.3515,
      address: "Winter Park, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "10",
    name: "SunTrust Office Tower",
    description: "Commercial office electrical including cubicle power, server room infrastructure, and emergency lighting.",
    type: "Commercial",
    value: "$380,000",
    year: "2023",
    location: {
      lat: 28.5728,
      lng: -81.3393,
      address: "Maitland, FL"
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
  },
  // Dr. Phillips / Sand Lake
  {
    id: "11",
    name: "Fleming's Prime Steakhouse",
    description: "Full restaurant electrical with custom bar lighting, open kitchen circuits, and outdoor patio power.",
    type: "Restaurant",
    value: "$125,000",
    year: "2024",
    location: {
      lat: 28.4489,
      lng: -81.4697,
      address: "Restaurant Row, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800"
  },
  {
    id: "12",
    name: "Apple Store - Florida Mall",
    description: "High-end retail electrical including display lighting, genius bar power, and back-of-house systems.",
    type: "Retail",
    value: "$210,000",
    year: "2023",
    location: {
      lat: 28.4748,
      lng: -81.3903,
      address: "Florida Mall, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  },
  // Lake Mary / Sanford
  {
    id: "13",
    name: "Seminole State College",
    description: "Educational facility electrical including smart classroom technology, lab equipment circuits, and campus lighting.",
    type: "Education",
    value: "$290,000",
    year: "2024",
    location: {
      lat: 28.7461,
      lng: -81.3033,
      address: "Sanford, FL"
    },
    image: "https://images.unsplash.com/photo-1562774053-701939374585?w=800"
  },
  {
    id: "14",
    name: "Deloitte Office Complex",
    description: "Corporate office electrical buildout including conference room AV, raised floor power, and building automation.",
    type: "Commercial",
    value: "$445,000",
    year: "2024",
    location: {
      lat: 28.7564,
      lng: -81.3186,
      address: "Lake Mary, FL"
    },
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"
  },
  // Kissimmee / Celebration
  {
    id: "15",
    name: "Margaritaville Resort",
    description: "Resort electrical including pool area, tiki bar, guest rooms, and entertainment venue.",
    type: "Hospitality",
    value: "$520,000",
    year: "2024",
    location: {
      lat: 28.3093,
      lng: -81.4212,
      address: "Kissimmee, FL"
    },
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  },
  {
    id: "16",
    name: "AdventHealth Celebration",
    description: "Hospital electrical systems including surgical suites, ICU monitoring, and emergency generator installation.",
    type: "Medical",
    value: "$680,000",
    year: "2023",
    location: {
      lat: 28.3203,
      lng: -81.5334,
      address: "Celebration, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  // Winter Garden / Windermere
  {
    id: "17",
    name: "Hamlin Town Center",
    description: "Mixed-use development electrical including retail spaces, restaurants, and common area lighting.",
    type: "Commercial",
    value: "$375,000",
    year: "2024",
    location: {
      lat: 28.4985,
      lng: -81.5431,
      address: "Winter Garden, FL"
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
  },
  {
    id: "18",
    name: "Lakeside Church",
    description: "Complete low-voltage installation including structured cabling, audio system, video displays, and stage lighting.",
    type: "Religious",
    value: "$185,000",
    year: "2023",
    location: {
      lat: 28.5494,
      lng: -81.5231,
      address: "Windermere, FL"
    },
    image: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800"
  },
  // Altamonte Springs / Casselberry
  {
    id: "19",
    name: "Altamonte Mall Renovation",
    description: "Mall common area electrical upgrade including LED conversion, escalator systems, and food court power.",
    type: "Retail",
    value: "$340,000",
    year: "2024",
    location: {
      lat: 28.6611,
      lng: -81.3978,
      address: "Altamonte Springs, FL"
    },
    image: "https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=800"
  },
  {
    id: "20",
    name: "Planet Fitness",
    description: "24-hour fitness center electrical with energy-efficient lighting, equipment circuits, and security systems.",
    type: "Commercial",
    value: "$98,000",
    year: "2023",
    location: {
      lat: 28.6180,
      lng: -81.2849,
      address: "Casselberry, FL"
    },
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
  },
  // Clermont / Leesburg
  {
    id: "21",
    name: "Clermont Medical Plaza",
    description: "Multi-tenant medical building electrical including imaging suites, dental offices, and pharmacy.",
    type: "Medical",
    value: "$255,000",
    year: "2024",
    location: {
      lat: 28.5494,
      lng: -81.7729,
      address: "Clermont, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  {
    id: "22",
    name: "Tractor Supply Co.",
    description: "Large retail store electrical including warehouse racking lighting, POS systems, and loading dock power.",
    type: "Retail",
    value: "$145,000",
    year: "2023",
    location: {
      lat: 28.8109,
      lng: -81.8781,
      address: "Leesburg, FL"
    },
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"
  },
  // Daytona Beach Area
  {
    id: "23",
    name: "Daytona International Speedway",
    description: "Motorsports facility electrical including infield lighting, garage circuits, and broadcast infrastructure.",
    type: "Sports/Entertainment",
    value: "$920,000",
    year: "2024",
    location: {
      lat: 29.1872,
      lng: -81.0707,
      address: "Daytona Beach, FL"
    },
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
  },
  {
    id: "24",
    name: "Cobb Theatres Daytona",
    description: "Movie theater electrical including projection rooms, IMAX systems, and concession equipment.",
    type: "Entertainment",
    value: "$285,000",
    year: "2023",
    location: {
      lat: 29.2108,
      lng: -81.0234,
      address: "Daytona Beach, FL"
    },
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800"
  },
  // Melbourne / Space Coast
  {
    id: "25",
    name: "Northrop Grumman Facility",
    description: "Aerospace manufacturing electrical including cleanroom power, testing equipment, and security systems.",
    type: "Industrial",
    value: "$1,200,000",
    year: "2024",
    location: {
      lat: 28.0836,
      lng: -80.6081,
      address: "Melbourne, FL"
    },
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"
  },
  {
    id: "26",
    name: "Ron Jon Surf Shop",
    description: "Iconic retail store electrical including neon signage, display lighting, and security infrastructure.",
    type: "Retail",
    value: "$175,000",
    year: "2023",
    location: {
      lat: 28.3689,
      lng: -80.6067,
      address: "Cocoa Beach, FL"
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  },
  // Additional Orlando Projects
  {
    id: "27",
    name: "Cheesecake Factory",
    description: "Large format restaurant electrical with extensive kitchen hood circuits, bakery equipment, and decorative lighting.",
    type: "Restaurant",
    value: "$195,000",
    year: "2024",
    location: {
      lat: 28.4862,
      lng: -81.4287,
      address: "Mall at Millenia, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "28",
    name: "Louis Vuitton",
    description: "Luxury retail buildout with precision display lighting, VIP room power, and advanced security systems.",
    type: "Retail",
    value: "$225,000",
    year: "2024",
    location: {
      lat: 28.4856,
      lng: -81.4312,
      address: "Mall at Millenia, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  },
  {
    id: "29",
    name: "SeaWorld Orlando - Maintenance",
    description: "Theme park electrical maintenance including ride systems, show lighting, and aquarium life support.",
    type: "Entertainment",
    value: "$480,000",
    year: "2023",
    location: {
      lat: 28.4119,
      lng: -81.4612,
      address: "SeaWorld, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
  },
  {
    id: "30",
    name: "Whole Foods Market",
    description: "Premium grocery electrical including cold cases, hot bar equipment, and specialty department circuits.",
    type: "Retail",
    value: "$230,000",
    year: "2024",
    location: {
      lat: 28.5419,
      lng: -81.3687,
      address: "Downtown Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"
  },
  {
    id: "31",
    name: "Lockheed Martin Building",
    description: "Defense contractor facility electrical including SCIF rooms, secure communications, and backup power.",
    type: "Industrial",
    value: "$780,000",
    year: "2024",
    location: {
      lat: 28.5167,
      lng: -81.4523,
      address: "Sand Lake Road, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
  },
  {
    id: "32",
    name: "Eddie V's Prime Seafood",
    description: "Fine dining restaurant electrical with custom bar lighting, live music stage, and premium kitchen equipment.",
    type: "Restaurant",
    value: "$155,000",
    year: "2023",
    location: {
      lat: 28.4501,
      lng: -81.4678,
      address: "Sand Lake Road, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800"
  },
  {
    id: "33",
    name: "CVS Pharmacy",
    description: "Retail pharmacy electrical including drive-thru systems, refrigeration, and 24-hour lighting.",
    type: "Retail",
    value: "$85,000",
    year: "2024",
    location: {
      lat: 28.5934,
      lng: -81.2145,
      address: "Winter Springs, FL"
    },
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"
  },
  {
    id: "34",
    name: "Aloft Hotel",
    description: "Boutique hotel electrical including guest rooms, lobby bar, and rooftop lounge.",
    type: "Hospitality",
    value: "$345,000",
    year: "2024",
    location: {
      lat: 28.5412,
      lng: -81.3756,
      address: "Downtown Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  },
  {
    id: "35",
    name: "First Watch Restaurant",
    description: "Breakfast restaurant electrical buildout with open kitchen circuits and specialty lighting.",
    type: "Restaurant",
    value: "$78,000",
    year: "2023",
    location: {
      lat: 28.6287,
      lng: -81.2934,
      address: "Casselberry, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "36",
    name: "Bank of America Branch",
    description: "Financial institution electrical including vault systems, ATM power, and security infrastructure.",
    type: "Commercial",
    value: "$125,000",
    year: "2024",
    location: {
      lat: 28.5523,
      lng: -81.3456,
      address: "Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
  },
  {
    id: "37",
    name: "Chick-fil-A",
    description: "Quick service restaurant electrical with drive-thru systems, kitchen equipment, and playground power.",
    type: "Restaurant",
    value: "$92,000",
    year: "2024",
    location: {
      lat: 28.6534,
      lng: -81.2123,
      address: "Oviedo, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "38",
    name: "Wawa Convenience Store",
    description: "24-hour convenience store electrical including fuel canopy, food service, and EV charging.",
    type: "Retail",
    value: "$165,000",
    year: "2024",
    location: {
      lat: 28.4789,
      lng: -81.3234,
      address: "Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"
  },
  {
    id: "39",
    name: "Hyatt Regency Orlando",
    description: "Convention hotel electrical including ballrooms, meeting spaces, and back-of-house systems.",
    type: "Hospitality",
    value: "$580,000",
    year: "2023",
    location: {
      lat: 28.4234,
      lng: -81.4589,
      address: "International Drive, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"
  },
  {
    id: "40",
    name: "Lifetime Fitness",
    description: "Large athletic club electrical including indoor/outdoor pools, basketball courts, and spa facilities.",
    type: "Commercial",
    value: "$420,000",
    year: "2024",
    location: {
      lat: 28.6012,
      lng: -81.3678,
      address: "Winter Park, FL"
    },
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
  },
  // More spread across Central Florida
  {
    id: "41",
    name: "Advent Health Imaging Center",
    description: "Medical imaging facility electrical including MRI suite, CT scanner power, and lead-lined room installation.",
    type: "Medical",
    value: "$275,000",
    year: "2024",
    location: {
      lat: 28.7234,
      lng: -81.3087,
      address: "Lake Mary, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  {
    id: "42",
    name: "Bass Pro Shops",
    description: "Large format retail electrical including aquarium systems, shooting range, and restaurant.",
    type: "Retail",
    value: "$485,000",
    year: "2023",
    location: {
      lat: 28.4123,
      lng: -81.4234,
      address: "International Drive, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800"
  },
  {
    id: "43",
    name: "Universal CityWalk",
    description: "Entertainment district electrical including outdoor stages, restaurant patios, and themed lighting.",
    type: "Entertainment",
    value: "$620,000",
    year: "2024",
    location: {
      lat: 28.4728,
      lng: -81.4678,
      address: "Universal Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
  },
  {
    id: "44",
    name: "Brightline Station",
    description: "Transit station electrical including platform systems, ticketing, and passenger amenities.",
    type: "Transportation",
    value: "$890,000",
    year: "2024",
    location: {
      lat: 28.5401,
      lng: -81.3823,
      address: "Downtown Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
  },
  {
    id: "45",
    name: "Shake Shack",
    description: "Fast casual restaurant electrical with modern kitchen equipment and outdoor seating power.",
    type: "Restaurant",
    value: "$68,000",
    year: "2024",
    location: {
      lat: 28.5623,
      lng: -81.3489,
      address: "Winter Park Village, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "46",
    name: "Tesla Service Center",
    description: "Electric vehicle service center including high-power charging stations and diagnostic equipment.",
    type: "Automotive",
    value: "$245,000",
    year: "2024",
    location: {
      lat: 28.5389,
      lng: -81.3601,
      address: "Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"
  },
  {
    id: "47",
    name: "Nemours Children's Hospital",
    description: "Pediatric hospital electrical including patient rooms, surgical suites, and family areas.",
    type: "Medical",
    value: "$1,100,000",
    year: "2023",
    location: {
      lat: 28.3778,
      lng: -81.3845,
      address: "Lake Nona, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800"
  },
  {
    id: "48",
    name: "TopGolf Orlando",
    description: "Entertainment venue electrical including driving range systems, bars, and climate control.",
    type: "Entertainment",
    value: "$380,000",
    year: "2024",
    location: {
      lat: 28.4312,
      lng: -81.4567,
      address: "International Drive, Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"
  },
  {
    id: "49",
    name: "Starbucks Reserve",
    description: "Premium coffee location electrical with specialty roasting equipment and unique lighting design.",
    type: "Restaurant",
    value: "$75,000",
    year: "2024",
    location: {
      lat: 28.5578,
      lng: -81.3512,
      address: "Winter Park, FL"
    },
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
  },
  {
    id: "50",
    name: "Darden Corporate HQ",
    description: "Corporate headquarters electrical including test kitchens, training facilities, and executive offices.",
    type: "Commercial",
    value: "$520,000",
    year: "2023",
    location: {
      lat: 28.5234,
      lng: -81.3901,
      address: "Orlando, FL"
    },
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800"
  }
];
