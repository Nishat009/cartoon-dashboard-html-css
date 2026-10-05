import { Cartoon } from "./models";

// Pink / burgundy / purple palettes for the generated cartoon posters.
const PALETTES = [
  { bg1: "#3a0a26", bg2: "#7b2cbf", glow: "#ff5fa2", body: "#ffd6e8", hill: "#24061a", inner: "#ff8cc6" },
  { bg1: "#5a0f32", bg2: "#c2185b", glow: "#ffb3d9", body: "#f3e3ff", hill: "#2d0619", inner: "#d9a7ff" },
  { bg1: "#22072e", bg2: "#8b5cf6", glow: "#f472b6", body: "#ffc8dd", hill: "#170420", inner: "#ff7eb6" },
  { bg1: "#4a0d2b", bg2: "#9d174d", glow: "#c084fc", body: "#ffe4f1", hill: "#1f0512", inner: "#f9a8d4" },
  { bg1: "#2b0a3d", bg2: "#db2777", glow: "#fbcfe8", body: "#e9d5ff", hill: "#1a0624", inner: "#f0abfc" }
];

const STARS = [[48, 60, 3], [330, 48, 2.5], [300, 120, 2], [70, 150, 2], [360, 210, 3], [30, 260, 2.5], [250, 40, 2]];

function ears(kind: number, body: string, inner: string): string {
  if (kind === 0) {
    return `<path d='M112 178 L128 74 L192 140Z' fill='${body}'/><path d='M288 178 L272 74 L208 140Z' fill='${body}'/>
      <path d='M128 160 L137 102 L172 140Z' fill='${inner}'/><path d='M272 160 L263 102 L228 140Z' fill='${inner}'/>`;
  }
  if (kind === 1) {
    return `<ellipse cx='158' cy='100' rx='24' ry='74' transform='rotate(-12 158 100)' fill='${body}'/>
      <ellipse cx='242' cy='100' rx='24' ry='74' transform='rotate(12 242 100)' fill='${body}'/>
      <ellipse cx='158' cy='106' rx='11' ry='52' transform='rotate(-12 158 106)' fill='${inner}'/>
      <ellipse cx='242' cy='106' rx='11' ry='52' transform='rotate(12 242 106)' fill='${inner}'/>`;
  }
  return `<circle cx='122' cy='146' r='40' fill='${body}'/><circle cx='278' cy='146' r='40' fill='${body}'/>
    <circle cx='122' cy='146' r='20' fill='${inner}'/><circle cx='278' cy='146' r='20' fill='${inner}'/>`;
}

/** Builds a cute cartoon character poster as an SVG data URI. */
export function poster(seed: number): string {
  const p = PALETTES[Math.abs(seed) % PALETTES.length];
  const kind = Math.abs(seed) % 3;
  const stars = STARS.map(([x, y, r]) => `<circle cx='${x}' cy='${y}' r='${r}' fill='#fff' opacity='.8'/>`).join("");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${p.bg1}'/><stop offset='1' stop-color='${p.bg2}'/></linearGradient>
      <radialGradient id='l' cx='.5' cy='.44' r='.5'><stop offset='0' stop-color='${p.glow}' stop-opacity='.8'/><stop offset='1' stop-color='${p.glow}' stop-opacity='0'/></radialGradient>
    </defs>
    <rect width='400' height='500' fill='url(#g)'/>
    <circle cx='200' cy='220' r='220' fill='url(#l)'/>
    ${stars}
    <path d='M0 410 Q100 350 200 400 T400 380 V500 H0Z' fill='${p.hill}'/>
    <ellipse cx='200' cy='430' rx='100' ry='86' fill='${p.body}'/>
    <ellipse cx='200' cy='440' rx='56' ry='50' fill='${p.inner}' opacity='.45'/>
    ${ears(kind, p.body, p.inner)}
    <circle cx='200' cy='238' r='108' fill='${p.body}'/>
    <ellipse cx='160' cy='228' rx='22' ry='27' fill='#fff'/><ellipse cx='240' cy='228' rx='22' ry='27' fill='#fff'/>
    <circle cx='164' cy='234' r='13' fill='#2b0b23'/><circle cx='244' cy='234' r='13' fill='#2b0b23'/>
    <circle cx='169' cy='228' r='4.5' fill='#fff'/><circle cx='249' cy='228' r='4.5' fill='#fff'/>
    <ellipse cx='136' cy='272' rx='17' ry='10' fill='#ff7eb6' opacity='.75'/><ellipse cx='264' cy='272' rx='17' ry='10' fill='#ff7eb6' opacity='.75'/>
    <path d='M192 262 Q200 270 208 262' fill='#2b0b23'/>
    <path d='M176 278 Q200 304 224 278' stroke='#2b0b23' stroke-width='6' fill='none' stroke-linecap='round'/>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function seedFrom(text: string): number {
  let hash = 0;
  for (const char of text) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return Math.abs(hash);
}

const DEMO = [
  { title: "Oggy and the Cockroaches", description: "A laid-back cat faces nonstop chaos from three mischievous cockroaches.", genre: "Comedy", year: 1998, rating: 8.2, episodes: 156, views: 9800, featured: true },
  { title: "Spider-Man: Animated Adventures", description: "A young hero balances everyday life with protecting his city.", genre: "Action", year: 1994, rating: 8.5, episodes: 65, views: 9100, featured: true },
  { title: "Minions: Little Mischief", description: "Small yellow troublemakers set off on a series of big adventures.", genre: "Adventure", year: 2015, rating: 7.8, episodes: 24, views: 7400, featured: true },
  { title: "Anime Worlds", description: "Discover imaginative animated stories from worlds near and far.", genre: "Anime", year: 2022, rating: 9.1, episodes: 48, views: 8300, featured: true },
  { title: "Captain America: Hero Files", description: "A brave hero and his friends stand up for what's right.", genre: "Action", year: 2018, rating: 8.1, episodes: 32, views: 6700, featured: false },
  { title: "The Curious Bunny", description: "A curious little bunny explores a colorful world with friends.", genre: "Family", year: 2023, rating: 8.7, episodes: 20, views: 6100, featured: false },
  { title: "Summer Tales", description: "Sunny-day adventures with a lovable cast of characters.", genre: "Family", year: 2021, rating: 7.9, episodes: 26, views: 5300, featured: false },
  { title: "Tiger's Kitchen", description: "A cheerful young tiger discovers the fun of cooking.", genre: "Comedy", year: 2020, rating: 7.6, episodes: 18, views: 4200, featured: false }
];

export const DEMO_CARTOONS: Cartoon[] = DEMO.map((item, index) => ({
  ...item,
  _id: `demo-${index + 1}`,
  image: poster(index)
}));
