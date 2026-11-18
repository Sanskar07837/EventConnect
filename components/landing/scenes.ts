const assets = {
  "01": ["chess-overhead", "Hands moving wooden pieces on a chessboard"],
  "02": ["chess-clock-detail", "A chess clock beside a player's hand and scoresheet"],
  "04": ["sticky-note-wall", "A wall of colourful sticky notes and interface sketches"],
  "05": ["filter-coffee", "South Indian filter coffee in a brass tumbler and dabara"],
  "06": ["vidhana-soudha-dusk", "An illustrated view of Vidhana Soudha in the late afternoon"],
  "07": ["glasshouse", "Sunlight through the arched roof of a garden glasshouse"],
  "08": ["metro-platform", "A metro train alongside a platform"],
  "09": ["park-morning", "Distant walkers on a tree-lined park path"],
  "10": ["workshop-room", "Workshop attendees facing a whiteboard"],
  "11": ["blank-lanyards", "Blank name badges and lanyards laid out on a table"],
  "12": ["map-pins-flatlay", "Coloured pins and a pen on a generic paper map"],
} as const;

type Slot = keyof typeof assets;

function tile(slot: Slot, mobile = true) {
  const [name, alt] = assets[slot];
  const path = `/landing/slot-${slot}-${name}`;

  return {
    slot,
    alt,
    mobile,
    mobileSrc: `${path}-800.webp`,
    desktopSrc: `${path}-1600.webp`,
  };
}

export const desktopMedia = "(min-width: 768px) and (min-height: 540px)";
export const sceneInterval = 2500;
export const transitionDuration = 460;

export const scenes = [
  {
    id: "bengaluru",
    title: "Bengaluru atmosphere",
    transition: "scale",
    tiles: [tile("06"), tile("07", false), tile("08"), tile("09", false), tile("05", false)],
  },
  {
    id: "chess",
    title: "Over-the-board chess",
    transition: "circle",
    tiles: [tile("01"), tile("02"), tile("11", false)],
  },
  {
    id: "hackathon",
    title: "Hackathon teamwork",
    transition: "fan",
    tiles: [tile("04"), tile("10"), tile("11", false)],
  },
  {
    id: "workshop",
    title: "Building and workshops",
    transition: "bleed",
    tiles: [tile("10")],
  },
  {
    id: "community",
    title: "Community",
    transition: "grid",
    tiles: [tile("09", false), tile("11", false), tile("12"), tile("05")],
  },
] as const;
