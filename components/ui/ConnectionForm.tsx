"use client";

import { useActionState } from "react";
import { changeContactSharingAction, sendConnectionAction, transitionConnectionAction } from "../../app/(app)/actions";

type Props = { personaId: string } & (
  | { kind: "send"; eventId: string; targetId: string; label: string }
  | { kind: "transition"; requestId: string; direction: "incoming" | "outgoing" }
  | { kind: "sharing"; enabled: boolean }
);

const primary = "app-button app-button-primary";
const secondary = "app-button";

export default function ConnectionForm(props: Props) {
  const action = props.kind === "send" ? sendConnectionAction
    : props.kind === "transition" ? transitionConnectionAction : changeContactSharingAction;
  const [error, submit, pending] = useActionState(action, "");

  return (
    <form action={submit} className="mt-4">
      <input type="hidden" name="expectedPersona" value={props.personaId} />
      {props.kind === "send" && (
        <div className="grid gap-2">
          <input type="hidden" name="eventId" value={props.eventId} />
          <input type="hidden" name="targetId" value={props.targetId} />
          <label className="grid gap-1 text-sm font-medium">
            Note to {props.label}
            <textarea
              name="note"
              required
              maxLength={280}
              rows={2}
              className="app-input min-w-0 font-normal"
            />
          </label>
          <p className="text-xs app-muted">Up to 280 characters. Use fictional information and omit contact details.</p>
          <button type="submit" disabled={pending} className={`${primary} justify-self-start`}>Send request</button>
        </div>
      )}
      {props.kind === "transition" && (
        <div className="flex flex-wrap gap-2">
          <input type="hidden" name="requestId" value={props.requestId} />
          {props.direction === "incoming" ? (
            <>
              <button type="submit" name="transition" value="accepted" disabled={pending} className={primary}>Accept</button>
              <button type="submit" name="transition" value="declined" disabled={pending} className={secondary}>Decline</button>
            </>
          ) : (
            <button type="submit" name="transition" value="cancelled" disabled={pending} className={secondary}>Cancel request</button>
          )}
        </div>
      )}
      {props.kind === "sharing" && (
        <>
          <input type="hidden" name="enabled" value={String(!props.enabled)} />
          <button type="submit" disabled={pending} className={props.enabled ? secondary : primary}>
            {props.enabled ? "Disable contact sharing" : "Enable contact sharing"}
          </button>
        </>
      )}
      {pending && <p role="status" className="app-feedback mt-2">Updating demo…</p>}
      {error && <p role="alert" className="app-feedback mt-2">{error}</p>}
    </form>
  );
}
