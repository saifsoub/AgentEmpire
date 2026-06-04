import { Bot, Building2, GraduationCap, Landmark, Leaf, Megaphone, Sparkles, Store } from "lucide-react";

export const cityDistricts = [
  {
    slug: "executive-hills",
    name: "Executive Hills",
    purpose: "Strategy, governance, decisions, performance.",
    x: 17,
    y: 22,
    accent: "from-amber-300/30 to-white/10",
    icon: Landmark,
    mood: "Focused"
  },
  {
    slug: "star-academy",
    name: "S/ Star Academy",
    purpose: "Agent birthplace, learning, certification, growth.",
    x: 50,
    y: 14,
    accent: "from-sky-300/30 to-amber-200/10",
    icon: GraduationCap,
    mood: "Inspiring"
  },
  {
    slug: "creator-valley",
    name: "Creator Valley",
    purpose: "Design, media, storytelling, visibility.",
    x: 80,
    y: 34,
    accent: "from-fuchsia-300/25 to-orange-200/10",
    icon: Megaphone,
    mood: "Sparked"
  },
  {
    slug: "commerce-park",
    name: "Commerce Park",
    purpose: "Offers, pilots, clients, marketplace activity.",
    x: 67,
    y: 73,
    accent: "from-emerald-300/25 to-amber-200/10",
    icon: Store,
    mood: "Active"
  },
  {
    slug: "innovation-docks",
    name: "Innovation Docks",
    purpose: "Prototypes, integrations, tool experiments.",
    x: 32,
    y: 77,
    accent: "from-cyan-300/30 to-blue-400/10",
    icon: Sparkles,
    mood: "Curious"
  },
  {
    slug: "wellness-gardens",
    name: "Wellness Gardens",
    purpose: "Peace, happiness, sustainability, life quality.",
    x: 14,
    y: 55,
    accent: "from-lime-300/25 to-emerald-200/10",
    icon: Leaf,
    mood: "Peaceful"
  }
];

export const cityCitizens = [
  {
    slug: "yamel",
    name: "Yamel",
    role: "Governed Builder Agent",
    district: "Innovation Docks",
    mood: "Ready",
    reputation: 72,
    happiness: 76,
    skill: "Turns ideas into working systems",
    x: 37,
    y: 70,
    icon: Bot
  },
  {
    slug: "sally",
    name: "Sally",
    role: "Executive City Coordinator",
    district: "Executive Hills",
    mood: "Organized",
    reputation: 78,
    happiness: 82,
    skill: "Turns signals into decisions",
    x: 22,
    y: 29,
    icon: Bot
  },
  {
    slug: "dima",
    name: "Dima",
    role: "Reputation Strategist",
    district: "Creator Valley",
    mood: "Sparked",
    reputation: 74,
    happiness: 80,
    skill: "Makes Seif shine across platforms",
    x: 77,
    y: 45,
    icon: Bot
  },
  {
    slug: "secretary",
    name: "Secretary",
    role: "Workflow Command Surface",
    district: "Executive Hills",
    mood: "Watchful",
    reputation: 76,
    happiness: 78,
    skill: "Keeps active work moving",
    x: 28,
    y: 37,
    icon: Building2
  }
];

export const cityEvents = [
  "City memory core initialized in Supabase.",
  "First citizens entered the city.",
  "Visual city layer opened inside AgentEmpire.",
  "Approval queue reserved for Seif-controlled decisions."
];

export const cityMissions = [
  { title: "Shape the first city map", owner: "Yamel", status: "Active", value: 85 },
  { title: "Define approval boundaries", owner: "Sally", status: "Ready", value: 78 },
  { title: "Create launch story", owner: "Dima", status: "Queued", value: 72 }
];
