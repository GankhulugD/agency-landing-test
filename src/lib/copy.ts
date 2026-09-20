export const brand = {
  name: "NAMOON COMPASS",
  tagline: "Strategic Marketing & Brand Agency",
} as const;

export const socialLinks = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/youth_marketing_agency/",
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61577766861545",
  },
] as const;

export const contact = {
  email: "youthmarketingll@gmail.com",
  phones: [
    { display: "6023 8717", tel: "+97660238717" },
    { display: "8538 6530", tel: "+97685386530" },
  ],
} as const;

export const hero = {
  eyebrow: "Strategic Marketing & Brand Agency",
  headline: "WHERE NOISE TURNS INTO DIRECTION.",
  subheading:
    "We translate market ambiguity into decisive brand strategy — with precision across digital, physical, and cultural touchpoints.",
} as const;

export type Service = {
  id: string;
  index: string;
  title: string;
  description: string;
  capabilities: string[];
  tags: string[];
};

export const partners = [
  "Aurora Retail",
  "Northline Finance",
  "Velvet Hospitality",
  "Summit Health",
  "Kite Mobility",
  "Lumen Studio",
  "Atlas Foods",
  "Orbit Logistics",
] as const;

export type WorkProject = {
  id: string;
  title: string;
  category: string;
  outcome: string;
  year: string;
};

export const workProjects: WorkProject[] = [
  {
    id: "northline",
    title: "Northline Rebrand",
    category: "Brand Strategy · Web",
    outcome: "Unified positioning across 4 markets in 90 days.",
    year: "2025",
  },
  {
    id: "aurora",
    title: "Aurora Launch Film",
    category: "Video · Digital Ads",
    outcome: "3.2× engagement lift on flagship campaign.",
    year: "2025",
  },
  {
    id: "summit",
    title: "Summit Patient Journey",
    category: "Consulting · Chatbot",
    outcome: "Reduced intake friction by 41% with guided flows.",
    year: "2024",
  },
  {
    id: "kite",
    title: "Kite Product Site",
    category: "Web Development",
    outcome: "Sub-second LCP on a conversion-first architecture.",
    year: "2024",
  },
];

export const impactStats = [
  { id: "campaigns", value: 47, suffix: "+", label: "Campaigns delivered" },
  { id: "markets", value: 12, suffix: "", label: "Markets navigated" },
  { id: "retention", value: 98, suffix: "%", label: "Client retention" },
  { id: "years", value: 6, suffix: "+", label: "Years of direction" },
] as const;

export const processSteps = [
  {
    id: "step1",
    index: "01",
    title: "Discover",
    description:
      "We analyze market dynamics, target audiences, and operational challenges to pinpoint the true growth opportunity.",
  },
  {
    id: "step2",
    index: "02",
    title: "Strategize",
    description:
      "Designing clear brand positioning, channel strategies, and campaign narratives aligned with business goals.",
  },
  {
    id: "step3",
    index: "03",
    title: "Execute",
    description:
      "Deploying high-crafted creative assets, web platforms, and ad campaigns with precision and agility.",
  },
  {
    id: "step4",
    index: "04",
    title: "Measure & Scale",
    description:
      "Measuring performance through real metrics and optimizing direction based on dynamic evidence, not assumptions.",
  },
] as const;

export const testimonial = {
  quote:
    "They turned our market noise into a clear direction — and every touchpoint finally felt intentional.",
  author: "Director of Brand",
  company: "Northline Finance",
} as const;

export const services: Service[] = [
  {
    id: "web-dev",
    index: "01",
    title: "Web Development & Digital Products",
    description:
      "High-performance, architectural digital products built for seamless user experience and maximum conversion.",
    capabilities: [
      "Next.js & React Applications",
      "Performance Optimization",
      "Design System Integration",
    ],
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    id: "video-audio",
    index: "02",
    title: "Video & Audio Production",
    description:
      "Narrative-driven motion and audio production that captures attention and reinforces brand authority.",
    capabilities: [
      "Brand Commercials & Social Content",
      "Podcast & Audio Production",
      "Sound Design & Post-Production",
    ],
    tags: ["Premiere", "After Effects", "Audition", "Motion"],
  },
  {
    id: "digital-ads",
    index: "03",
    title: "Digital Advertising & Performance",
    description:
      "Targeted, data-driven advertising strategies designed to reach the right audience and drive measurable ROI.",
    capabilities: [
      "Meta & Google Campaign Strategy",
      "Creative A/B Testing",
      "Conversion Tracking & Analytics",
    ],
    tags: ["Meta Ads", "Google Ads", "Analytics", "CRO"],
  },
  {
    id: "consulting",
    index: "04",
    title: "Marketing Strategy & Management",
    description:
      "Operational clarity and strategic positioning frameworks for organizations navigating growth and change.",
    capabilities: [
      "Brand Positioning Workshops",
      "Go-To-Market Planning",
      "Team Alignment & Operations",
    ],
    tags: ["Strategy", "Ops", "Positioning", "Workshops"],
  },
  {
    id: "print",
    index: "05",
    title: "Graphic & Print Design",
    description:
      "High-impact visual systems across physical and social media platforms with rigorous print-ready standards.",
    capabilities: [
      "Packaging & Editorial Layout",
      "Social Media Visual Assets",
      "Print-Ready Production Files",
    ],
    tags: ["InDesign", "Illustrator", "Print", "Packaging"],
  },
  {
    id: "chatbot",
    index: "06",
    title: "AI Chatbot & Automation",
    description:
      "Intelligent conversational AI systems that engage users, qualify leads, and support your business 24/7.",
    capabilities: [
      "Custom AI Chatbot Design",
      "CRM & System Integration",
      "Automated Lead Generation Flows",
    ],
    tags: ["AI", "Automation", "CRM", "Support"],
  },
];
