"use client";

import { useActionState, useState } from "react";
import { changeAvatarAction } from "../../app/(app)/actions";
import { avatarOptions, type AvatarId } from "../../lib/profile/avatars";
import PersonAvatar from "./PersonAvatar";

const choices = [{ id: "", label: "Use initials" }, ...avatarOptions] as const;

export default function AvatarPicker({ personaId, name, avatarId }: {
  personaId: string;
  name: string;
  avatarId: AvatarId | null;
}) {
  const [result, submit, pending] = useActionState(changeAvatarAction, null);
  const [draft, setDraft] = useState<AvatarId | "" | null>(null);
  const saved = avatarId ?? "";
  const selected = draft ?? saved;

  return (
    <form action={submit} className="mt-4">
      <input type="hidden" name="expectedPersona" value={personaId} />
      <fieldset disabled={pending} aria-describedby="avatar-scope">
        <legend className="sr-only">Choose an avatar</legend>
        <div className="grid grid-cols-3 gap-2">
          {choices.map(({ id, label }) => (
            <label key={id} className="relative min-w-0 cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="avatar"
                value={id}
                checked={id === selected}
                onChange={() => setDraft(id)}
              />
              <span className="flex h-full min-h-24 flex-col items-center justify-start gap-1.5 rounded-lg border app-divider p-2 text-center text-xs leading-tight peer-checked:bg-(--app-ivory) peer-checked:ring-2 peer-checked:ring-(--app-forest) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--app-focus)">
                <PersonAvatar name={name} avatarId={id || null} />
                <span>{label}</span>
                <span aria-hidden="true" className="text-[.65rem] font-semibold app-accent">{id === selected ? "✓ Selected" : ""}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <button type="submit" disabled={pending || selected === saved} className="mt-4 app-button app-button-primary">
        {pending ? "Saving avatar…" : "Save avatar"}
      </button>
      {result && !pending && (result.ok ? selected === saved : true) && (
        <p className="mt-2 app-feedback" role={result.ok ? "status" : "alert"}>{result.message}</p>
      )}
    </form>
  );
}
