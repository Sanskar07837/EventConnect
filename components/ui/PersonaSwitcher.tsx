"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { resetDemoAction, startDemoAction, switchPersonaAction } from "../../app/(app)/actions";

type Persona = { id: string; label: string };

export default function PersonaSwitcher({ current, personas }: {
  current: Persona | null;
  personas: Persona[];
}) {
  const router = useRouter();
  const [error, submit, pending] = useActionState(async (_previous: string, formData: FormData) => {
    const operation = formData.get("operation");
    if (operation !== "start" && operation !== "switch" && operation !== "reset") return "Choose a demo action.";
    try {
      const result = operation === "start" ? await startDemoAction()
        : operation === "switch" ? await switchPersonaAction(formData)
        : await resetDemoAction();

      if (result.ok) {
        if (operation === "start") router.refresh();
        else window.location.reload();
        return "";
      }
      if (result.reason === "guest") {
        return "Your demo session ended. Start a new demo to continue.";
      }
      if (result.reason === "invalid-persona") return "Choose a listed demo persona.";
      if (result.reason === "conflict") {
        return "The demo changed in another tab. Refresh the page and try again.";
      }
    } catch {
      // Present a stable message for transport failures as well as storage failures.
    }
    if (operation === "start") return "Couldn’t start the demo. You can still browse events as a guest.";
    if (operation === "switch") return "Couldn’t switch persona. Try again.";
    return "Couldn’t reset the demo. Try again.";
  }, "");

  return (
    <section aria-label="Demo controls" className="app-card mb-8 px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{current ? `Browsing as ${current.label}` : "Browsing as a guest"}</p>
          <p className="app-muted mt-1 text-sm">
            {current ? <span className="app-badge">Fictional demo persona</span> : "Try a fictional demo persona to change how you participate."}
          </p>
        </div>
        {current ? (
          <div className="flex flex-wrap items-center gap-2">
            <form action={submit} className="flex flex-wrap items-center gap-2">
              <input type="hidden" name="operation" value="switch" />
              <label htmlFor="demo-persona" className="sr-only">Demo persona</label>
              <select
                key={current.id}
                id="demo-persona"
                name="personaId"
                defaultValue={current.id}
                disabled={pending}
                className="app-input"
              >
                {personas.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
              <button className="app-button app-button-primary" type="submit" disabled={pending}>Switch persona</button>
            </form>
            <form action={submit}>
              <input type="hidden" name="operation" value="reset" />
              <button className="app-button" type="submit" disabled={pending}>Reset demo</button>
            </form>
          </div>
        ) : (
          <form action={submit}>
            <input type="hidden" name="operation" value="start" />
            <button className="app-button app-button-primary" type="submit" disabled={pending}>Try demo as Karthik</button>
          </form>
        )}
      </div>
      {pending && <p role="status" className="app-feedback mt-2">Updating demo…</p>}
      {error && <p role="alert" className="app-feedback mt-2">{error}</p>}
    </section>
  );
}
