export interface Project {
  id: string;
  name: string;
  description: string;
  type: string;
  city: string;
  state: string;
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
    name: "Clean Juice",
    description: "Commercial electrical installation for juice bar franchise location.",
    type: "Restaurant",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5383, lng: -81.3792, address: "Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "2",
    name: "Venetian Nail Salon",
    description: "Full electrical fit-out for nail salon including specialty lighting.",
    type: "Retail",
    city: "Jacksonville",
    state: "FL",
    location: { lat: 30.3322, lng: -81.6557, address: "Jacksonville, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "3",
    name: "Hot Topic",
    description: "Retail store electrical installation with custom lighting design.",
    type: "Retail",
    city: "Altamonte Springs",
    state: "FL",
    location: { lat: 28.6611, lng: -81.3656, address: "Altamonte Springs, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "4",
    name: "Pizza Hut",
    description: "Restaurant electrical systems including kitchen equipment power.",
    type: "Restaurant",
    city: "Lakeland",
    state: "FL",
    location: { lat: 28.0395, lng: -81.9498, address: "Lakeland, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "5",
    name: "UCEDA Kirkman Oaks",
    description: "Educational facility electrical installation.",
    type: "Commercial",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5200, lng: -81.4500, address: "Kirkman Oaks, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "6",
    name: "Hamlin Nail Spa",
    description: "Spa electrical fit-out with ambient lighting systems.",
    type: "Retail",
    city: "Winter Garden",
    state: "FL",
    location: { lat: 28.5653, lng: -81.5862, address: "Winter Garden, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "7",
    name: "Chronic Taco",
    description: "Restaurant electrical installation with commercial kitchen power.",
    type: "Restaurant",
    city: "Dr. Phillips",
    state: "FL",
    location: { lat: 28.4500, lng: -81.4900, address: "Dr. Phillips, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "8",
    name: "Aldo Millenia Mall",
    description: "High-end retail electrical with designer lighting installation.",
    type: "Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4851, lng: -81.4320, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "9",
    name: "Barre3",
    description: "Fitness studio electrical with specialized lighting and sound systems.",
    type: "Fitness",
    city: "Tampa",
    state: "FL",
    location: { lat: 27.9506, lng: -82.4572, address: "Tampa, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "10",
    name: "Uniqlo",
    description: "Major retail brand electrical installation with advanced lighting.",
    type: "Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4855, lng: -81.4315, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "11",
    name: "Madrag",
    description: "Retail store electrical installation.",
    type: "Retail",
    city: "Waterford Lakes",
    state: "FL",
    location: { lat: 28.5600, lng: -81.2200, address: "Waterford Lakes, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "12",
    name: "Gucci - Mall at Millenia",
    description: "Luxury retail flagship electrical with premium lighting design.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4853, lng: -81.4322, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "13",
    name: "Windermere Village",
    description: "Commercial plaza electrical installation.",
    type: "Commercial",
    city: "Windermere",
    state: "FL",
    location: { lat: 28.4956, lng: -81.5348, address: "Windermere, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "14",
    name: "Luma Medical",
    description: "Medical facility electrical with specialized equipment power.",
    type: "Medical",
    city: "Oviedo",
    state: "FL",
    location: { lat: 28.6700, lng: -81.2081, address: "Oviedo, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "15",
    name: "Christian Louboutin - Millenia Mall",
    description: "Luxury retail electrical with designer lighting.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4852, lng: -81.4318, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "16",
    name: "Hublot - Millenia Mall",
    description: "Luxury watch boutique electrical with display lighting.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4854, lng: -81.4319, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "17",
    name: "Ace Café",
    description: "Restaurant and entertainment venue electrical installation.",
    type: "Restaurant",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5450, lng: -81.3750, address: "Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "18",
    name: "Marc Jacobs - Vineland Shops",
    description: "Designer retail electrical with premium lighting systems.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4750, lng: -81.4550, address: "Vineland Premium Outlets, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "19",
    name: "Omega - Millenia Mall",
    description: "Luxury watch store electrical with display case lighting.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4856, lng: -81.4321, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "20",
    name: "Versace - Vineland Shops",
    description: "High-end fashion boutique electrical installation.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4752, lng: -81.4548, address: "Vineland Premium Outlets, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "21",
    name: "Picciotto",
    description: "Retail electrical installation.",
    type: "Retail",
    city: "Ft Lauderdale",
    state: "FL",
    location: { lat: 26.1224, lng: -80.1373, address: "Ft Lauderdale, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "22",
    name: "Float 8",
    description: "Wellness spa electrical with specialized equipment.",
    type: "Wellness",
    city: "Ft Lauderdale",
    state: "FL",
    location: { lat: 26.1200, lng: -80.1350, address: "Ft Lauderdale, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "23",
    name: "Sawgrass Mills",
    description: "Large retail mall electrical installation.",
    type: "Retail",
    city: "Sunrise",
    state: "FL",
    location: { lat: 26.1512, lng: -80.3228, address: "Sawgrass Mills, Sunrise, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "24",
    name: "7-Eleven",
    description: "Convenience store electrical systems.",
    type: "Retail",
    city: "Sebastian",
    state: "FL",
    location: { lat: 27.8164, lng: -80.4706, address: "Sebastian, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "25",
    name: "Chick-fil-A",
    description: "Restaurant electrical with commercial kitchen power systems.",
    type: "Restaurant",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5400, lng: -81.3800, address: "Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "26",
    name: "Tropical Smoothie",
    description: "Restaurant electrical installation.",
    type: "Restaurant",
    city: "Mt Dora",
    state: "FL",
    location: { lat: 28.8025, lng: -81.6445, address: "Mt Dora, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "27",
    name: "Charles Schwab",
    description: "Financial office electrical with data center requirements.",
    type: "Commercial",
    city: "Lakeland",
    state: "FL",
    location: { lat: 28.0400, lng: -81.9500, address: "Lakeland, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "28",
    name: "Mavis Tires",
    description: "Automotive service center electrical installation.",
    type: "Automotive",
    city: "Bradenton",
    state: "FL",
    location: { lat: 27.4989, lng: -82.5748, address: "Bradenton, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "29",
    name: "Tropical Smoothie",
    description: "Restaurant electrical installation.",
    type: "Restaurant",
    city: "Bradenton",
    state: "FL",
    location: { lat: 27.5000, lng: -82.5750, address: "Bradenton, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "30",
    name: "Taco Bell",
    description: "Fast food restaurant electrical with drive-thru systems.",
    type: "Restaurant",
    city: "Apopka",
    state: "FL",
    location: { lat: 28.6934, lng: -81.5322, address: "Apopka, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "31",
    name: "Regions Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Kissimmee",
    state: "FL",
    location: { lat: 28.2920, lng: -81.4076, address: "Kissimmee, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "32",
    name: "Nothing Bundt Cakes",
    description: "Bakery electrical with commercial kitchen equipment.",
    type: "Restaurant",
    city: "Clearwater",
    state: "FL",
    location: { lat: 27.9659, lng: -82.8001, address: "Clearwater, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "33",
    name: "Palm City Place Apartments",
    description: "Multi-family residential electrical installation.",
    type: "Residential",
    city: "Winter Haven",
    state: "FL",
    location: { lat: 28.0222, lng: -81.7329, address: "Winter Haven, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "34",
    name: "Regions Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Lake Nona",
    state: "FL",
    location: { lat: 28.3700, lng: -81.2800, address: "Lake Nona, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "35",
    name: "Bed Bath and Beyond",
    description: "Large retail store electrical installation.",
    type: "Retail",
    city: "Kissimmee",
    state: "FL",
    location: { lat: 28.2900, lng: -81.4100, address: "Kissimmee, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "36",
    name: "Cora Physical Therapy",
    description: "Medical facility electrical with therapy equipment power.",
    type: "Medical",
    city: "Clermont",
    state: "FL",
    location: { lat: 28.5494, lng: -81.7729, address: "Clermont, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "37",
    name: "Restore",
    description: "Wellness center electrical installation.",
    type: "Wellness",
    city: "Winter Park",
    state: "FL",
    location: { lat: 28.5997, lng: -81.3393, address: "Winter Park, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "38",
    name: "7-Eleven",
    description: "Convenience store electrical systems.",
    type: "Retail",
    city: "Davenport",
    state: "FL",
    location: { lat: 28.1614, lng: -81.6137, address: "Davenport, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "39",
    name: "Regions Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Waterford Lakes",
    state: "FL",
    location: { lat: 28.5650, lng: -81.2200, address: "Waterford Lakes, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "40",
    name: "Psycho Bunny",
    description: "Fashion retail electrical with custom lighting.",
    type: "Retail",
    city: "Tampa",
    state: "FL",
    location: { lat: 27.9487, lng: -82.5229, address: "Tampa, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "41",
    name: "Regions Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Pinellas Park",
    state: "FL",
    location: { lat: 27.8428, lng: -82.6995, address: "Pinellas Park, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "42",
    name: "7-Eleven",
    description: "Convenience store electrical systems.",
    type: "Retail",
    city: "Winter Garden",
    state: "FL",
    location: { lat: 28.5650, lng: -81.5860, address: "Winter Garden, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "43",
    name: "Discount Tires",
    description: "Automotive service center electrical.",
    type: "Automotive",
    city: "Titusville",
    state: "FL",
    location: { lat: 28.6122, lng: -80.8076, address: "Titusville, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "44",
    name: "7-Eleven",
    description: "Convenience store electrical systems.",
    type: "Retail",
    city: "Sarasota",
    state: "FL",
    location: { lat: 27.3364, lng: -82.5307, address: "Sarasota, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "45",
    name: "Under Armour - Millenia Mall",
    description: "Athletic retail electrical with dynamic lighting.",
    type: "Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4857, lng: -81.4323, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "46",
    name: "LabCorp",
    description: "Medical laboratory electrical with specialized equipment.",
    type: "Medical",
    city: "Winter Springs",
    state: "FL",
    location: { lat: 28.6989, lng: -81.3081, address: "Winter Springs, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "47",
    name: "LensCrafters",
    description: "Optical retail electrical with display lighting.",
    type: "Retail",
    city: "Sanford",
    state: "FL",
    location: { lat: 28.8028, lng: -81.2731, address: "Sanford, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "48",
    name: "Lululemon - Millenia Mall",
    description: "Athletic retail electrical with modern lighting design.",
    type: "Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4858, lng: -81.4324, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "52",
    name: "ISI Demo Shop Building",
    description: "Commercial building electrical installation.",
    type: "Commercial",
    city: "Kissimmee",
    state: "FL",
    location: { lat: 28.2950, lng: -81.4050, address: "Kissimmee, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "53",
    name: "Fidelity Investments",
    description: "Financial office electrical with data infrastructure.",
    type: "Financial",
    city: "Vero Beach",
    state: "FL",
    location: { lat: 27.6386, lng: -80.3973, address: "Vero Beach, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "54",
    name: "Aritzia - International Mall",
    description: "Fashion retail electrical with designer lighting.",
    type: "Retail",
    city: "Tampa",
    state: "FL",
    location: { lat: 27.9560, lng: -82.5260, address: "International Mall, Tampa, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "55",
    name: "DoorDash",
    description: "Commercial facility electrical installation.",
    type: "Commercial",
    city: "Casselberry",
    state: "FL",
    location: { lat: 28.6778, lng: -81.3278, address: "Casselberry, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "56",
    name: "Grissom Pkwy Boat & RV Storage",
    description: "Storage facility electrical with security lighting.",
    type: "Industrial",
    city: "Cocoa",
    state: "FL",
    location: { lat: 28.3861, lng: -80.7420, address: "Cocoa, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "59",
    name: "Dry Storage Boat & RV Storage",
    description: "Storage facility electrical with security systems.",
    type: "Industrial",
    city: "Winter Haven",
    state: "FL",
    location: { lat: 28.0200, lng: -81.7300, address: "Winter Haven, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "60",
    name: "Ghirardelli - Disney Springs",
    description: "Premium chocolate shop electrical at Disney Springs.",
    type: "Restaurant",
    city: "Celebration",
    state: "FL",
    location: { lat: 28.3713, lng: -81.5184, address: "Disney Springs, Celebration, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "61",
    name: "Jeremiah's Italian Ice",
    description: "Dessert shop electrical installation.",
    type: "Restaurant",
    city: "St Cloud",
    state: "FL",
    location: { lat: 28.2506, lng: -81.2812, address: "St Cloud, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "62",
    name: "Fidelity Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Winter Park",
    state: "FL",
    location: { lat: 28.6000, lng: -81.3400, address: "Winter Park, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "63",
    name: "Apopka House",
    description: "Residential electrical installation.",
    type: "Residential",
    city: "Apopka",
    state: "FL",
    location: { lat: 28.6900, lng: -81.5300, address: "Apopka, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "64",
    name: "Tropical Smoothie",
    description: "Restaurant electrical installation.",
    type: "Restaurant",
    city: "Sanford",
    state: "FL",
    location: { lat: 28.8000, lng: -81.2700, address: "Sanford, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "65",
    name: "Lululemon - Millenia Mall",
    description: "Athletic retail electrical renovation.",
    type: "Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4859, lng: -81.4325, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "66",
    name: "Journeys",
    description: "Footwear retail electrical installation.",
    type: "Retail",
    city: "Tampa",
    state: "FL",
    location: { lat: 27.9491, lng: -82.5231, address: "Tampa, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "67",
    name: "DMS Hurston Towers Elevators",
    description: "Elevator electrical systems installation.",
    type: "Commercial",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5450, lng: -81.3800, address: "Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "68",
    name: "DMS Hurston Towers Bathrooms",
    description: "Commercial bathroom electrical renovation.",
    type: "Commercial",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5451, lng: -81.3801, address: "Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "69",
    name: "LaserAway",
    description: "Medical spa electrical with specialized equipment.",
    type: "Medical",
    city: "Winter Park",
    state: "FL",
    location: { lat: 28.6010, lng: -81.3380, address: "Winter Park, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "70",
    name: "Fifth Third Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Stuart",
    state: "FL",
    location: { lat: 27.1975, lng: -80.2528, address: "Stuart, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "71",
    name: "Gucci - Mall at Millenia",
    description: "Luxury retail renovation electrical.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4860, lng: -81.4326, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "72",
    name: "Vilebrequin",
    description: "Luxury swimwear retail electrical.",
    type: "Luxury Retail",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.4861, lng: -81.4327, address: "Mall at Millenia, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "73",
    name: "Chase Bank",
    description: "Bank branch electrical with security systems.",
    type: "Financial",
    city: "Metro West",
    state: "FL",
    location: { lat: 28.5100, lng: -81.4300, address: "Metro West, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "74",
    name: "Texas Roadhouse",
    description: "Full-service restaurant electrical installation.",
    type: "Restaurant",
    city: "Winter Garden",
    state: "FL",
    location: { lat: 28.5600, lng: -81.5900, address: "Winter Garden, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "75",
    name: "Ballins Private Residence",
    description: "High-end residential electrical installation.",
    type: "Residential",
    city: "Sarasota",
    state: "FL",
    location: { lat: 27.3400, lng: -82.5300, address: "Sarasota, FL" },
    image: "/placeholder.svg"
  },
  // Multi-Family Projects
  {
    id: "76",
    name: "Celeste Hotel UCF",
    description: "Full electrical installation for boutique hotel near UCF campus.",
    type: "Multi-Family",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.6024, lng: -81.2001, address: "UCF Area, Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "77",
    name: "Palm Place Apartments",
    description: "Multi-family residential complex electrical systems.",
    type: "Multi-Family",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5500, lng: -81.3600, address: "Orlando, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "78",
    name: "The Sevens Apartments",
    description: "Downtown high-rise residential electrical installation.",
    type: "Multi-Family",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5421, lng: -81.3790, address: "Downtown Orlando, FL" },
    image: "/placeholder.svg"
  },
  // Government & Institutional Projects
  {
    id: "80",
    name: "Sanford Orlando International Airport",
    description: "Airport terminal electrical infrastructure.",
    type: "Government",
    city: "Sanford",
    state: "FL",
    location: { lat: 28.7776, lng: -81.2375, address: "Sanford, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "81",
    name: "Viera Middle School",
    description: "Educational facility electrical installation.",
    type: "Education",
    city: "Viera",
    state: "FL",
    location: { lat: 28.2550, lng: -80.7300, address: "Viera, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "82",
    name: "Blue Origin",
    description: "Complete electrical installation for aerospace facility.",
    type: "Government",
    city: "Cape Canaveral",
    state: "FL",
    location: { lat: 28.4892, lng: -80.5772, address: "Cape Canaveral, FL" },
    image: "/placeholder.svg"
  },
  {
    id: "83",
    name: "Marriott Downtown Orlando",
    description: "Full electrical installation for luxury hotel.",
    type: "Multi-Family",
    city: "Orlando",
    state: "FL",
    location: { lat: 28.5421, lng: -81.3789, address: "Downtown Orlando, FL" },
    image: "/placeholder.svg"
  }
];
