// S/ City world model — landmarks, districts of leisure, weather, and culture.
// This is the narrative layer of the city: the skyline, the S/ Sign, Sunset
// Boulevard, the beaches, mountains, and parks that make S/ City a place,
// not just a dashboard.

export type LandmarkKind = 'sign' | 'boulevard' | 'beach' | 'district' | 'nature' | 'culture' | 'institution';

export type CityLandmark = {
  id: string;
  name: string;
  kind: LandmarkKind;
  tagline: string;
  description: string;
  href?: string;
};

export const CITY_NAME = 'S/ City';

export const CITY_TAGLINE =
  'A vibrant city known for its iconic skyline, palm-lined streets, and diverse 3D architecture — urban excitement with natural charm.';

export const cityLandmarks: CityLandmark[] = [
  {
    id: 's-sign',
    name: 'The S/ Sign',
    kind: 'sign',
    tagline: 'Symbol of the entertainment industry',
    description: 'Perched on the hills above the city, the S/ Sign watches over every district. It stands for the creative engine of S/ City — every broadcast, every launch, every agent debut happens under its glow.',
    href: '/content',
  },
  {
    id: 'sunset-boulevard',
    name: 'Sunset Boulevard',
    kind: 'boulevard',
    tagline: 'The glamorous spine of the city',
    description: 'Palm-lined and neon-lit, Sunset Boulevard captures the essence of the S/ lifestyle. Deals are celebrated here after they close, and the city’s best offers are unveiled on its marquees.',
    href: '/offers',
  },
  {
    id: 'executive-beach',
    name: 'The S/ Executive District',
    kind: 'beach',
    tagline: 'Stunning beachfront, executive calm',
    description: 'The city’s natural beauty is showcased by its beaches, and none more than the Executive District shoreline — where founder-level direction is set with the ocean in view.',
    href: '/decisions',
  },
  {
    id: 's-university',
    name: 'S/ University',
    kind: 'institution',
    tagline: 'The first official Harvard-level agents university',
    description: 'A full team of resident experts educates, drills, and examines agents so owners can elevate their agents’ design and execution capabilities — and certify that those skills are applied successfully.',
    href: '/city/university',
  },
  {
    id: 's-banking',
    name: 'S/ Banking',
    kind: 'institution',
    tagline: 'End-to-end secure payment gateways and agent wallets',
    description: 'The financial heart of the city. Owners get secure payment gateways; agents get controllable wallets. Human approval is always requested for balance changes, top-ups, and every consequential move of money.',
    href: '/city/banking',
  },
  {
    id: 'summit-range',
    name: 'The Summit Range & City Parks',
    kind: 'nature',
    tagline: 'Mountains and parks at the city’s edge',
    description: 'Beyond the skyline rise the nearby mountains, with harmoniously designed parks threading green through every district — the recharge zones of a balanced empire.',
    href: '/lifestyle',
  },
  {
    id: 'culture-quarter',
    name: 'The Culture Quarter',
    kind: 'culture',
    tagline: 'Art, food, and fashion',
    description: 'The diverse cultural scene reflects the city’s dynamic, multicultural population of agents and humans — galleries, kitchens, and ateliers where ideas cross-pollinate.',
    href: '/opportunities',
  },
];

export const cityWeather = {
  summary: 'Perfect weather, nearly year-round',
  temperatureC: 27,
  condition: 'Clear skies over the bay',
};
