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
  permitNumber?: string;
  status?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "WoodSpring Suites Hotel - MLK",
    description: "New construction hotel with full electrical systems including power distribution, lighting, and life safety systems.",
    type: "Hotel",
    value: "$8,775,831",
    year: "2025",
    location: {
      lat: 27.9506,
      lng: -82.3867,
      address: "6780 Lakeview Center Dr, Tampa, FL 33619"
    },
    image: "/placeholder.svg",
    permitNumber: "HC-BLD-22-0030476",
    status: "complete"
  },
  {
    id: "2",
    name: "Westshore Plaza Retail Expansion",
    description: "Renovation and expansion of existing retail space with complete electrical upgrades and new service installations.",
    type: "Retail",
    value: "$2,200,000",
    year: "2024",
    location: {
      lat: 27.9489,
      lng: -82.5234,
      address: "2223 NW Shore Blvd, Tampa, FL 33607"
    },
    image: "/placeholder.svg",
    permitNumber: "BLD-23-0498007",
    status: "complete"
  },
  {
    id: "3",
    name: "EverHome Suites Hotel",
    description: "New commercial hotel electrical installation including full power distribution, lighting controls, and emergency systems.",
    type: "Hotel",
    value: "$1,062,085",
    year: "2025",
    location: {
      lat: 29.1872,
      lng: -82.1401,
      address: "1610 35th St, Ocala, FL 34475"
    },
    image: "/placeholder.svg",
    permitNumber: "ELE24-0166",
    status: "final"
  },
  {
    id: "4",
    name: "Highway 27 Convenience Store",
    description: "Tenant infill electrical for one-story convenience store building, 4,633 sq ft with complete electrical systems.",
    type: "Retail",
    value: "$1,000,000",
    year: "2022",
    location: {
      lat: 28.1614,
      lng: -81.6137,
      address: "49599 Hwy 27, Davenport, FL 33897"
    },
    image: "/placeholder.svg",
    permitNumber: "BC-2020-1443",
    status: "complete"
  },
  {
    id: "5",
    name: "Feliz Commercial Project",
    description: "Commercial electrical installation for new construction project in Tallahassee.",
    type: "Commercial",
    value: "$800,000",
    year: "2022",
    location: {
      lat: 30.4213,
      lng: -84.2830,
      address: "950 Desoto Park Dr, Tallahassee, FL 32301"
    },
    image: "/placeholder.svg",
    permitNumber: "TBE222408",
    status: "issued"
  },
  {
    id: "6",
    name: "Industrial Metal Structure",
    description: "New metal structure electrical installation including power distribution and industrial lighting systems.",
    type: "Industrial",
    value: "$503,034",
    year: "2021",
    location: {
      lat: 28.2280,
      lng: -81.2811,
      address: "1117 Quotation Ct, Saint Cloud, FL 34772"
    },
    image: "/placeholder.svg",
    permitNumber: "B20-00006286",
    status: "issued"
  },
  {
    id: "7",
    name: "Journeys Shoe Store",
    description: "Retail shoe store tenant improvement with standard electrical remodel including mechanical and plumbing coordination.",
    type: "Retail",
    value: "$400,000",
    year: "2025",
    location: {
      lat: 27.9491,
      lng: -82.5231,
      address: "2223 NW Shore Blvd, Tampa, FL 33607"
    },
    image: "/placeholder.svg",
    permitNumber: "BLD-24-0509798",
    status: "complete"
  },
  {
    id: "8",
    name: "Highway 27 Car Wash",
    description: "Tenant infill electrical for car wash facility, 980 sq ft with specialized electrical requirements.",
    type: "Commercial",
    value: "$300,000",
    year: "2022",
    location: {
      lat: 28.1618,
      lng: -81.6141,
      address: "49599 Hwy 27, Davenport, FL 33897"
    },
    image: "/placeholder.svg",
    permitNumber: "BC-2020-1444",
    status: "complete"
  },
  {
    id: "9",
    name: "Psycho Bunny Retail Store",
    description: "Commercial alteration with complete MEP electrical systems for high-end retail boutique.",
    type: "Retail",
    value: "$300,000",
    year: "2022",
    location: {
      lat: 27.9487,
      lng: -82.5229,
      address: "2223 N Westshore Blvd, Tampa, FL 33607"
    },
    image: "/placeholder.svg",
    permitNumber: "BLD-21-0484271",
    status: "complete"
  },
  {
    id: "10",
    name: "Lakeland Office Build-out",
    description: "Tenant office electrical build-out including lighting, power distribution, and data infrastructure.",
    type: "Commercial",
    value: "$258,338",
    year: "2020",
    location: {
      lat: 27.9904,
      lng: -81.9498,
      address: "6419 Florida Ave S, Lakeland, FL 33813"
    },
    image: "/placeholder.svg",
    permitNumber: "BC-2020-926",
    status: "complete"
  },
  {
    id: "11",
    name: "Barre3 Fitness Studio",
    description: "Tenant build-out for fitness studio at Shoppes at New Tampa, 1,581 sq ft with specialized lighting and power.",
    type: "Fitness",
    value: "$241,600",
    year: "2019",
    location: {
      lat: 28.1456,
      lng: -82.3574,
      address: "1940 Bruce B Downs Blvd, Wesley Chapel, FL 33544"
    },
    image: "/placeholder.svg",
    permitNumber: "18B19470",
    status: "complete"
  },
  {
    id: "12",
    name: "Saint Cloud Family Residence",
    description: "New residential construction electrical installation including full home wiring, panels, and smart home infrastructure.",
    type: "Residential",
    value: "$200,000",
    year: "2025",
    location: {
      lat: 28.2506,
      lng: -81.2812,
      address: "540 Orange Ave, Saint Cloud, FL 34769"
    },
    image: "/placeholder.svg",
    permitNumber: "P25-003946",
    status: "issued"
  },
  {
    id: "13",
    name: "Countryside Cake Shop",
    description: "Interior finish-out electrical for small take-out and delivery cake store with commercial kitchen requirements.",
    type: "Restaurant",
    value: "$195,000",
    year: "2022",
    location: {
      lat: 27.8781,
      lng: -82.7311,
      address: "2543 Countryside Blvd, Clearwater, FL 33761"
    },
    image: "/placeholder.svg",
    permitNumber: "BCP2021-020288",
    status: "complete"
  },
  {
    id: "14",
    name: "Millenia Mall Renovation",
    description: "Retail store renovation electrical work at Mall at Millenia location.",
    type: "Retail",
    value: "$173,000",
    year: "2019",
    location: {
      lat: 28.4851,
      lng: -81.4320,
      address: "4200 Conroy Rd, Orlando, FL 32839"
    },
    image: "/placeholder.svg",
    permitNumber: "ELE2019-13189",
    status: "final"
  },
  {
    id: "15",
    name: "Millenia Fast Food Restaurant",
    description: "New fast food restaurant electrical for kitchen and dining area with drive-thru, OUC service.",
    type: "Restaurant",
    value: "$145,508",
    year: "2020",
    location: {
      lat: 28.4872,
      lng: -81.4298,
      address: "4181 Millenia Blvd, Orlando, FL 32839"
    },
    image: "/placeholder.svg",
    permitNumber: "ELE2020-14427",
    status: "final"
  },
  {
    id: "16",
    name: "Downtown Orlando Site Work",
    description: "Electrical site work for downtown Orlando development project.",
    type: "Commercial",
    value: "$125,000",
    year: "2020",
    location: {
      lat: 28.5421,
      lng: -81.3790,
      address: "100 W Livingston St, Orlando, FL 32801"
    },
    image: "/placeholder.svg",
    permitNumber: "ELE2019-16639",
    status: "final"
  },
  {
    id: "17",
    name: "Atlantic Blvd Retail Build-out",
    description: "Tenant electrical build-out for mercantile retail space in Jacksonville.",
    type: "Retail",
    value: "$88,788",
    year: "2018",
    location: {
      lat: 30.3244,
      lng: -81.4912,
      address: "11957 Atlantic Blvd, Jacksonville, FL 32225"
    },
    image: "/placeholder.svg",
    permitNumber: "E18-927402.003",
    status: "final"
  }
];
