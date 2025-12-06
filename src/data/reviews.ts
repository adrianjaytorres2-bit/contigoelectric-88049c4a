export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string;
  source: "yelp" | "google" | "buildzoom";
  avatar?: string;
  projectType?: string;
}

export const reviews: Review[] = [
  {
    id: "1",
    author: "Michael R.",
    rating: 5,
    date: "November 2024",
    text: "Contigo Electric did an outstanding job on our commercial build-out. David and his team were professional, punctual, and their attention to detail was impressive. They completed the work ahead of schedule and within budget. Highly recommend for any commercial electrical needs!",
    source: "yelp",
    projectType: "Commercial Build-out"
  },
  {
    id: "2",
    author: "Sarah L.",
    rating: 5,
    date: "October 2024",
    text: "We hired Contigo for a complete electrical upgrade in our restaurant. They handled everything from the panel upgrade to installing new kitchen circuits. The team was knowledgeable about code requirements and worked around our business hours. Excellent service!",
    source: "yelp",
    projectType: "Restaurant Electrical"
  },
  {
    id: "3",
    author: "Robert T.",
    rating: 5,
    date: "September 2024",
    text: "Professional and reliable! Contigo Electric installed our fire alarm system and emergency lighting. They were thorough with inspections and made sure everything was up to NFPA standards. Great communication throughout the project.",
    source: "buildzoom",
    projectType: "Life Safety Systems"
  },
  {
    id: "4",
    author: "Jennifer M.",
    rating: 5,
    date: "August 2024",
    text: "Used Contigo for our office low-voltage installation including structured cabling and access control. Their team was incredibly organized and clean. Everything was installed perfectly and they provided detailed documentation. Will definitely use again!",
    source: "yelp",
    projectType: "Low Voltage"
  },
  {
    id: "5",
    author: "David P.",
    rating: 5,
    date: "July 2024",
    text: "Contigo Electric is the real deal. They handled a complex tenant build-out for us with multiple phases. Their project management was excellent, and they coordinated seamlessly with other trades. Pricing was competitive and fair.",
    source: "buildzoom",
    projectType: "Tenant Build-out"
  },
  {
    id: "6",
    author: "Amanda K.",
    rating: 5,
    date: "June 2024",
    text: "Fantastic experience from start to finish! The Contigo team installed our new panel and upgraded all the wiring in our commercial space. They were respectful of our property and left everything spotless. Top-notch electricians!",
    source: "yelp",
    projectType: "Panel Upgrade"
  },
  {
    id: "7",
    author: "Construction Manager",
    rating: 5,
    date: "May 2024",
    text: "We've used Contigo Electric on multiple commercial projects. Their consistency and quality of work is unmatched. They understand construction timelines and always meet their deadlines. A trusted partner for any electrical work.",
    source: "buildzoom",
    projectType: "Commercial Construction"
  },
  {
    id: "8",
    author: "Patricia W.",
    rating: 5,
    date: "April 2024",
    text: "Called Contigo for emergency electrical work and they responded quickly. Their technician diagnosed the issue fast and had it fixed the same day. Fair pricing and excellent customer service. They've earned a customer for life!",
    source: "yelp",
    projectType: "Emergency Service"
  }
];
