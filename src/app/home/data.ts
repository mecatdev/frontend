import type { Business } from "@/types/business";

export const DISCOVERY_BUSINESSES: Business[] = [
  {
    id: "1",
    slug: "greenroot-foods",
    name: "GreenRoot Foods",
    industry: "F&B",
    description:
      "A plant-based food startup focused on making sustainable nutrition accessible to everyday Indonesians. We produce ready-to-eat meals using locally sourced organic ingredients across 12 cities.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Rina Susanti",
    location: "Jakarta",
    stage: "Series A",
  },
  {
    id: "2",
    slug: "logify",
    name: "Logify",
    industry: "Retail",
    description:
      "Last-mile delivery platform optimised for tier-2 and tier-3 cities in Indonesia. Using AI routing, we reduce delivery costs by up to 35% while maintaining next-day SLA.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Budi Prasetyo",
    location: "Surabaya",
    stage: "Seed",
  },
  {
    id: "3",
    slug: "edupath",
    name: "EduPath",
    industry: "Education",
    description:
      "Adaptive learning platform for vocational high school students. Our content library covers 40+ skills and integrates with DUDI partnerships to ensure students are job-ready upon graduation.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Maya Dewi",
    location: "Bandung",
    stage: "Pre-Seed",
  },
  {
    id: "4",
    slug: "meditrack",
    name: "MediTrack",
    industry: "Health and Wellness",
    description:
      "Digital health records management system tailored for clinics and puskesmas across rural Indonesia. We bridge the gap between government BPJS data and real-time patient management.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Dr. Hendra Kurniawan",
    location: "Yogyakarta",
    stage: "Series A",
  },
  {
    id: "5",
    slug: "solarnusa",
    name: "SolarNusa",
    industry: "Technology and Research",
    description:
      "Affordable rooftop solar installation and financing platform for SMEs in Indonesia. We partner with local banks to offer 0% down payment programs and manage the full installation lifecycle.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Agus Wibowo",
    location: "Denpasar",
    stage: "Seed",
  },
  {
    id: "6",
    slug: "ternak-id",
    name: "Ternak.id",
    industry: "Agriculture",
    description:
      "Digital marketplace and advisory platform for livestock farmers in East Java. We connect smallholder farmers directly with feed suppliers and buyers, cutting out intermediaries.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Sari Lestari",
    location: "Malang",
    stage: "Pre-Seed",
  },
];

export const TRENDING_BUSINESSES: Business[] = [
  {
    id: "t1",
    slug: "finflow",
    name: "FinFlow",
    industry: "Finance and Banking",
    description:
      "B2B embedded finance platform helping Indonesian SMEs access working capital by integrating with their existing accounting tools. Approval in under 24 hours.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Dian Permata",
    location: "Jakarta",
    stage: "Series B",
  },
  {
    id: "t2",
    slug: "coldchain-go",
    name: "ColdChain Go",
    industry: "Retail",
    description:
      "Temperature-controlled logistics network for food and pharma across Kalimantan and Sulawesi. Asset-light model via a fleet partnership with local cooperatives.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Reza Fauzan",
    location: "Balikpapan",
    stage: "Seed",
  },
  {
    id: "t3",
    slug: "ruang-guru-pro",
    name: "Ruang Guru Pro",
    industry: "Education",
    description:
      "White-label LMS for vocational training providers and corporate L&D teams. Includes AI-driven skill gap analysis and real-time learner dashboards.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Tika Rahayu",
    location: "Semarang",
    stage: "Series A",
  },
  {
    id: "t4",
    slug: "aquasync",
    name: "AquaSync",
    industry: "Agriculture",
    description:
      "IoT-based aquaculture monitoring system for shrimp and fish farmers. Sensors track water quality, feed cycles, and disease risk, pushing alerts to a mobile dashboard.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Fajar Nugroho",
    location: "Makassar",
    stage: "Pre-Seed",
  },
  {
    id: "t5",
    slug: "sehatku",
    name: "Sehatku",
    industry: "Health and Wellness",
    description:
      "Telemedicine app specialising in mental health, offering on-demand consultations with licensed psychologists and a CBT-based self-help programme.",
    logoUrl: "/logo.svg",
    ownerPhotoUrl: "https://images.unsplash.com/photo-1461988320302-91bde64fc8e4?auto=format&fit=crop&w=1500&q=80",
    ownerName: "Putri Anjani",
    location: "Jakarta",
    stage: "Seed",
  },
];

export const ALL_BUSINESSES: Business[] = [...DISCOVERY_BUSINESSES, ...TRENDING_BUSINESSES];

export function getBusinessBySlug(slug: string): Business | undefined {
  return ALL_BUSINESSES.find((b) => b.slug === slug);
}

const PAGE_SIZE = 4;
const MIN_FOR_INFINITE = 4;

export type BusinessPage = {
  businesses: Business[];
  hasMore: boolean;
};

export function fetchBusinessPage(
  page: number,
  sector?: string | null,
  query?: string,
): BusinessPage {
  let filtered: Business[] = ALL_BUSINESSES;

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    filtered = filtered.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.industry.toLowerCase().includes(q) ||
        b.description.toLowerCase().includes(q) ||
        b.location.toLowerCase().includes(q),
    );
  }

  if (sector) {
    filtered = filtered.filter((b) => b.industry === sector);
  }

  const total = filtered.length;
  if (total === 0) return { businesses: [], hasMore: false };

  const isInfinite = total >= MIN_FOR_INFINITE;

  if (!isInfinite) {
    const start = page * PAGE_SIZE;
    return {
      businesses: filtered.slice(start, start + PAGE_SIZE),
      hasMore: start + PAGE_SIZE < total,
    };
  }

  const start = page * PAGE_SIZE;
  const businesses: Business[] = [];
  for (let i = 0; i < PAGE_SIZE; i++) {
    const src = filtered[(start + i) % total];
    businesses.push({ ...src, id: `${src.id}_p${page}_${i}` });
  }

  return { businesses, hasMore: true };
}
