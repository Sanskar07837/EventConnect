import type { ReactNode } from "react";
import type { AvatarId } from "../../lib/profile/avatars";

export function personName(label: string) {
  return label.replace(/ \(demo\)$/, "");
}

const illustrations: Record<AvatarId, ReactNode> = {
  canopy: (
    <>
      <path fill="var(--app-sand)" d="M11 32c-5-4-3-12 4-13-1-8 9-13 15-7 7-2 13 4 10 10 6 5 1 12-5 11z" />
      <path d="M25 42V23m0 8-9-5m9 8 10-8m-17 16h15" />
    </>
  ),
  knight: (
    <>
      <path fill="var(--app-sand)" d="M13 38h24v4H13zm5 0c-1-7 9-11 9-17-3 4-7 4-10 4l-5-5 9-7 1-6 6 5c8 1 12 12 8 26z" />
      <path d="m19 19 1.8-1.1" />
    </>
  ),
  terminal: (
    <>
      <rect x="8" y="12" width="32" height="24" rx="4" fill="var(--app-sand)" />
      <path d="M8 19h32m-25 5 4 3-4 3m8 0h7m-15 11h18" />
    </>
  ),
  glasshouse: (
    <>
      <path fill="var(--app-sand)" d="M9 38V25l6-11 9-6 9 6 6 11v13z" />
      <path d="M9 25h30m-24-11h18m-9-6v30m-8 0V25m16 13V25M7 38h34" />
    </>
  ),
  coffee: (
    <>
      <path fill="var(--app-sand)" d="M13 21h22l-3 13a4 4 0 0 1-4 3h-8a4 4 0 0 1-4-3z" />
      <path d="M12 21c0-2 4-3 12-3s12 1 12 3m-25 18h26m-19 3h12m-9-28c-3-3 3-3 0-6m6 6c-3-3 3-3 0-6" />
    </>
  ),
  skyline: (
    <>
      <path fill="var(--app-sand)" d="M8 39V28h11v-7h10v7h11v11z" />
      <path d="M18 21h12l-2-4c-1-3-2-5-4-6-2 1-3 3-4 6zm6-10V7M6 39h36m-29-6v2m5-2v2m6-8v8m6-2v2m5-2v2" />
    </>
  ),
  book: (
    <>
      <path fill="var(--app-sand)" d="M8 13c6-2 11-1 16 3 5-4 10-5 16-3v22c-6-2-11-1-16 3-5-4-10-5-16-3z" />
      <path d="M24 16v22m-12-17c3 0 5 1 7 2m-7 4c3 0 5 1 7 2m10-6c2-1 4-2 7-2m-7 8c2-1 4-2 7-2" />
    </>
  ),
  metro: (
    <>
      <rect x="12" y="9" width="24" height="27" rx="6" fill="var(--app-sand)" />
      <path d="M16 15h16v10H16zm8 0v10m-6 5h1m10 0h1M17 36l-4 6m18-6 4 6m-18-2h14" />
    </>
  ),
};

export default function PersonAvatar({ name, avatarId, large = false }: {
  name?: string;
  avatarId?: AvatarId | null;
  large?: boolean;
}) {
  const initials = name && personName(name).trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();

  return (
    <span
      aria-hidden="true"
      data-avatar={avatarId ?? "initials"}
      className={`grid shrink-0 place-items-center rounded-full border app-divider bg-(--app-sand) font-serif app-accent ${large ? "size-20 text-4xl" : "size-12 text-xl"}`}
    >
      {avatarId ? (
        <svg viewBox="0 0 48 48" fill="var(--app-paper)" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className="size-full">
          <circle cx="24" cy="24" r="21" stroke="var(--app-brass)" strokeWidth=".65" />
          {illustrations[avatarId]}
        </svg>
      ) : initials || (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
        </svg>
      )}
    </span>
  );
}
