"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { resetDemoAction, startDemoAction, switchPersonaAction } from "../../app/(app)/actions";

type Persona = { id: string; label: string };

const buttonStyle = "min-h-11 rounded-md px-4 py-2 text-sm font-semibold";
const primaryStyle = `${buttonStyle} bg-emerald-900 text-white hover:bg-emerald-800 disabled:opacity-60`;
const secondaryStyle = `${buttonStyle} border border-stone-400 bg-white hover:bg-stone-100 disabled:opacity-60`;

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
    <section aria-label="Demo controls" className="mb-8 rounded-lg border border-stone-300 bg-white px-4 py-3 sm:px-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{current ? `Browsing as ${current.label}` : "Browsing as a guest"}</p>
          <p className="mt-1 text-sm text-stone-600">
            {current ? "Fictional demo persona" : "Try a fictional demo persona to change how you participate."}
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
                className="min-h-11 rounded-md border border-stone-400 bg-white px-3 text-sm disabled:opacity-60"
              >
                {personas.map(({ id, label }) => <option key={id} value={id}>{label}</option>)}
              </select>
              <button className={primaryStyle} type="submit" disabled={pending}>Switch persona</button>
            </form>
            <form action={submit}>
              <input type="hidden" name="operation" value="reset" />
              <button className={secondaryStyle} type="submit" disabled={pending}>Reset demo</button>
            </form>
          </div>
        ) : (
          <form action={submit}>
            <input type="hidden" name="operation" value="start" />
            <button className={primaryStyle} type="submit" disabled={pending}>Try demo as Karthik</button>
          </form>
        )}
      </div>
      {pending && <p role="status" className="mt-2 text-sm text-stone-600">Updating demo…</p>}
      {error && <p role="alert" className="mt-2 text-sm font-medium text-red-800">{error}</p>}
    </section>
  );
}
