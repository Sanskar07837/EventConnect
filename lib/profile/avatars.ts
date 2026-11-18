export const avatarOptions = [
  { id: "canopy", label: "Park canopy" },
  { id: "knight", label: "Chess knight" },
  { id: "terminal", label: "Code terminal" },
  { id: "glasshouse", label: "Garden glasshouse" },
  { id: "coffee", label: "Filter coffee" },
  { id: "skyline", label: "City skyline" },
  { id: "book", label: "Open book" },
  { id: "metro", label: "Metro train" },
] as const;

export type AvatarId = (typeof avatarOptions)[number]["id"];

export function isAvatarId(value: unknown): value is AvatarId {
  return avatarOptions.some(({ id }) => id === value);
}
