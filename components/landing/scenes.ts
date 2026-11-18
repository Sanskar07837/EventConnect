const candidates = {
  "bengaluru-skyline": [800, 800, "The Bengaluru skyline at golden hour"],
  "chess-community-overhead": [2048, 1529, "Players gathered around a wooden chessboard"],
  "chess-hand-move": [1105, 830, "A hand moving a chess piece on a sunlit board"],
  "conference-auditorium": [964, 698, "An audience facing a warmly lit auditorium stage"],
  "library-reading-room": [1201, 804, "A library reading room with a timber ceiling and large windows"],
  "metro-platform": [2048, 1529, "A metro train alongside a busy platform"],
  "vidhana-soudha-golden-hour": [2048, 1529, "Vidhana Soudha beneath a golden-hour sky"],
  "vintage-world-map": [1201, 811, "A vintage world map spread across a desk"],
  "workshop-brainstorm": [1233, 802, "Two collaborators sorting ideas on a sticky-note wall"],
  "workshop-idea-wall": [2048, 1529, "A wall of colourful sticky notes and interface sketches"],
} as const;

type Candidate = keyof typeof candidates;

export type LandingTile = {
  id: string;
  alt: string;
  mobile: boolean;
  image: { src: string; width: number; height: number; sizes: string }
    | { mobileSrc: string; desktopSrc: string };
};

function tile(id: Candidate, desktopWidth: string, mobileWidth?: string): LandingTile {
  const [width, height, alt] = candidates[id];
  return {
    id,
    alt,
    mobile: mobileWidth !== undefined,
    image: {
      src: `/landing/candidates/${id}.webp`,
      width,
      height,
      sizes: mobileWidth ? `${desktopMedia} ${desktopWidth}, ${mobileWidth}` : desktopWidth,
    },
  };
}

function legacyTile(slot: string, id: string, alt: string, mobile = false): LandingTile {
  const path = `/landing/slot-${slot}-${id}`;
  return { id, alt, mobile, image: { mobileSrc: `${path}-800.webp`, desktopSrc: `${path}-1600.webp` } };
}

export const desktopMedia = "(min-width: 768px) and (min-height: 540px)";
export const sceneInterval = 2500;
export const transitionDuration = 460;
export const openingImage = "vidhana-soudha-golden-hour";

export const scenes = [
  {
    id: "bengaluru",
    title: "Bengaluru atmosphere",
    transition: "collage",
    tiles: [
      tile(openingImage, "42vw", "92vw"),
      legacyTile("07", "glasshouse", "Sunlight through the arched roof of a garden glasshouse"),
      tile("metro-platform", "41vw", "78vw"),
      legacyTile("09", "park-morning", "Distant walkers on a tree-lined park path"),
      legacyTile("05", "filter-coffee", "South Indian filter coffee in a brass tumbler and dabara"),
    ],
  },
  {
    id: "chess",
    title: "Over-the-board chess",
    transition: "collage",
    tiles: [
      tile("chess-community-overhead", "53vw", "90vw"),
      tile("chess-hand-move", "43vw", "84vw"),
      tile("library-reading-room", "32vw"),
    ],
  },
  {
    id: "hackathon",
    title: "Collaborative building",
    transition: "collage",
    tiles: [
      tile("workshop-idea-wall", "51vw", "90vw"),
      tile("workshop-brainstorm", "51vw", "86vw"),
      tile("conference-auditorium", "32vw"),
    ],
  },
  {
    id: "workshop",
    title: "Building and workshops",
    transition: "bleed",
    tiles: [legacyTile("10", "workshop-room", "Workshop attendees facing a whiteboard", true)],
  },
  {
    id: "community",
    title: "Community",
    transition: "collage",
    tiles: [
      tile("bengaluru-skyline", "42vw"),
      tile("conference-auditorium", "33vw"),
      tile("vintage-world-map", "45vw", "89vw"),
      tile("library-reading-room", "44vw", "78vw"),
    ],
  },
] as const satisfies readonly {
  id: string;
  title: string;
  transition: "collage" | "bleed";
  tiles: readonly LandingTile[];
}[];
