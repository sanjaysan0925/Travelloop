export const CITIES = [
  { name: 'Paris',        country: 'France',        lat: 48.8566,   lng: 2.3522,    costIndex: 85, emoji: '🗼', region: 'Europe' },
  { name: 'Rome',         country: 'Italy',          lat: 41.9028,   lng: 12.4964,   costIndex: 72, emoji: '🏛️', region: 'Europe' },
  { name: 'Kyoto',        country: 'Japan',          lat: 35.0116,   lng: 135.7681,  costIndex: 68, emoji: '⛩️', region: 'Asia' },
  { name: 'Barcelona',    country: 'Spain',          lat: 41.3851,   lng: 2.1734,    costIndex: 70, emoji: '🎨', region: 'Europe' },
  { name: 'New York',     country: 'USA',            lat: 40.7128,   lng: -74.0060,  costIndex: 95, emoji: '🗽', region: 'Americas' },
  { name: 'Bangkok',      country: 'Thailand',       lat: 13.7563,   lng: 100.5018,  costIndex: 40, emoji: '🛕', region: 'Asia' },
  { name: 'Istanbul',     country: 'Turkey',         lat: 41.0082,   lng: 28.9784,   costIndex: 48, emoji: '🕌', region: 'Europe/Asia' },
  { name: 'Cape Town',    country: 'South Africa',   lat: -33.9249,  lng: 18.4241,   costIndex: 45, emoji: '🏔️', region: 'Africa' },
  { name: 'Reykjavik',    country: 'Iceland',        lat: 64.1355,   lng: -21.8954,  costIndex: 92, emoji: '🌋', region: 'Europe' },
  { name: 'Bali',         country: 'Indonesia',      lat: -8.3405,   lng: 115.0920,  costIndex: 35, emoji: '🌴', region: 'Asia' },
  { name: 'Marrakech',    country: 'Morocco',        lat: 31.6295,   lng: -7.9811,   costIndex: 38, emoji: '🕍', region: 'Africa' },
  { name: 'Buenos Aires', country: 'Argentina',      lat: -34.6037,  lng: -58.3816,  costIndex: 42, emoji: '💃', region: 'Americas' },
  { name: 'Prague',       country: 'Czech Republic', lat: 50.0755,   lng: 14.4378,   costIndex: 58, emoji: '🏰', region: 'Europe' },
  { name: 'Singapore',    country: 'Singapore',      lat: 1.3521,    lng: 103.8198,  costIndex: 88, emoji: '🌆', region: 'Asia' },
  { name: 'Lisbon',       country: 'Portugal',       lat: 38.7223,   lng: -9.1393,   costIndex: 62, emoji: '🚃', region: 'Europe' },
  { name: 'Dubai',        country: 'UAE',            lat: 25.2048,   lng: 55.2708,   costIndex: 82, emoji: '🏙️', region: 'Middle East' },
  { name: 'Mexico City',  country: 'Mexico',         lat: 19.4326,   lng: -99.1332,  costIndex: 44, emoji: '🌮', region: 'Americas' },
  { name: 'Amsterdam',    country: 'Netherlands',    lat: 52.3676,   lng: 4.9041,    costIndex: 80, emoji: '🚲', region: 'Europe' },
  { name: 'Cartagena',    country: 'Colombia',       lat: 10.3910,   lng: -75.4794,  costIndex: 36, emoji: '🏖️', region: 'Americas' },
  { name: 'Vienna',       country: 'Austria',        lat: 48.2082,   lng: 16.3738,   costIndex: 74, emoji: '🎭', region: 'Europe' },
  { name: 'Tokyo',        country: 'Japan',          lat: 35.6762,   lng: 139.6503,  costIndex: 78, emoji: '🗾', region: 'Asia' },
  { name: 'Mumbai',       country: 'India',          lat: 19.0760,   lng: 72.8777,   costIndex: 32, emoji: '🌊', region: 'Asia' },
  { name: 'Delhi',        country: 'India',          lat: 28.6139,   lng: 77.2090,   costIndex: 28, emoji: '🏯', region: 'Asia' },
  { name: 'Goa',          country: 'India',          lat: 15.2993,   lng: 74.1240,   costIndex: 30, emoji: '🏄', region: 'Asia' },
  { name: 'London',       country: 'UK',             lat: 51.5074,   lng: -0.1278,   costIndex: 90, emoji: '🎡', region: 'Europe' },
  { name: 'Sydney',       country: 'Australia',      lat: -33.8688,  lng: 151.2093,  costIndex: 88, emoji: '🦘', region: 'Oceania' },
  { name: 'Seoul',        country: 'South Korea',    lat: 37.5665,   lng: 126.9780,  costIndex: 65, emoji: '🎎', region: 'Asia' },
  { name: 'Santorini',    country: 'Greece',         lat: 36.3932,   lng: 25.4615,   costIndex: 78, emoji: '🌅', region: 'Europe' },
  { name: 'Maldives',     country: 'Maldives',       lat: 3.2028,    lng: 73.2207,   costIndex: 92, emoji: '🐠', region: 'Asia' },
  { name: 'Phuket',       country: 'Thailand',       lat: 7.8804,    lng: 98.3923,   costIndex: 42, emoji: '⛵', region: 'Asia' },
];

export function estimateDailyCost(costIndex) {
  if (costIndex < 40) return 45;
  if (costIndex < 55) return 75;
  if (costIndex < 70) return 110;
  if (costIndex < 85) return 160;
  return 220;
}

export const ACTIVITY_COSTS = {
  sightseeing: { min: 0,  max: 25,  avg: 12  },
  food:        { min: 10, max: 60,  avg: 25  },
  adventure:   { min: 30, max: 150, avg: 70  },
  transport:   { min: 20, max: 400, avg: 80  },
  stay:        { min: 40, max: 300, avg: 100 },
  shopping:    { min: 0,  max: 200, avg: 50  },
};

export function searchCities(query) {
  if (!query) return CITIES.slice(0, 8);
  const q = query.toLowerCase();
  return CITIES.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.country.toLowerCase().includes(q) ||
    c.region.toLowerCase().includes(q)
  ).slice(0, 10);
}
