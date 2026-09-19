export const brand = {
  name: "Namoon Compass",
  tagline: "Strategic direction for brands in complex markets",
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
  eyebrow: "Marketing Agency",
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

export const services: Service[] = [
  {
    id: "web-dev",
    index: "01",
    title: "Web Development",
    description:
      "Architectural digital products — fast, refined, and built to convert with quiet confidence.",
    capabilities: [
      "Next.js & React product builds",
      "Performance-first architecture",
      "Design system integration",
    ],
    tags: ["Next.js", "React", "TypeScript", "Tailwind"],
  },
  {
    id: "video-audio",
    index: "02",
    title: "Video & Audio",
    description:
      "Editorial motion and sound design that carries narrative weight without spectacle.",
    capabilities: [
      "Brand films & social cutdowns",
      "Podcast & voice production",
      "Sound design & mixing",
    ],
    tags: ["Premiere", "After Effects", "Audition", "Motion"],
  },
  {
    id: "digital-ads",
    index: "03",
    title: "Digital Advertising",
    description:
      "Measured campaigns with creative restraint — reach the right audience, not the loudest one.",
    capabilities: [
      "Meta & Google campaign strategy",
      "Creative A/B testing",
      "Conversion tracking & reporting",
    ],
    tags: ["Meta Ads", "Google Ads", "Analytics", "CRO"],
  },
  {
    id: "consulting",
    index: "04",
    title: "Management Consulting",
    description:
      "Operational clarity and positioning frameworks for teams navigating structural change.",
    capabilities: [
      "Brand positioning workshops",
      "Go-to-market planning",
      "Team alignment frameworks",
    ],
    tags: ["Strategy", "Ops", "Positioning", "Workshops"],
  },
  {
    id: "print",
    index: "05",
    title: "Print Design",
    description:
      "Tactile brand systems with the same rigor as their digital counterparts.",
    capabilities: [
      "Packaging & editorial layout",
      "Large-format & signage",
      "Print-ready production files",
    ],
    tags: ["InDesign", "Illustrator", "Print", "Packaging"],
  },
  {
    id: "chatbot",
    index: "06",
    title: "Chatbot Services",
    description:
      "Intelligent conversational agents that guide customers, qualify leads, and support your brand around the clock.",
    capabilities: [
      "AI chatbot design & deployment",
      "CRM & webhook integrations",
      "24/7 lead qualification flows",
    ],
    tags: ["AI", "Automation", "CRM", "Support"],
  },
];
