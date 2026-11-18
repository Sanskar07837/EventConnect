import "server-only";

import type { DemoState } from "../data/repository";

const sessionColumns = "session_id_hash,state,revision,created_at,expires_at";

export function getDemoStore() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || !/^sb_secret_[A-Za-z0-9_-]+$/.test(key)) return null;
  const apiKey = key;

  let origin: URL;
  try {
    origin = new URL(url);
  } catch {
    return null;
  }
  if (origin.protocol !== "https:" || origin.username || origin.password
    || origin.pathname !== "/" || origin.search || origin.hash) return null;

  async function request(path: string, method: "GET" | "POST" | "DELETE", body?: object): Promise<Response> {
    const headers = new Headers({ apikey: apiKey, Accept: "application/json" });
    if (body) headers.set("Content-Type", "application/json");
    if (method === "POST" && path.startsWith("demo_session_state?")) {
      headers.set("Prefer", "return=representation");
    }

    const response = await fetch(new URL(`/rest/v1/${path}`, origin), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Demo state store request failed");
    return response;
  }

  function sessionPath(sessionHash: string) {
    return `demo_session_state?${new URLSearchParams({
      session_id_hash: `eq.${sessionHash}`,
      select: sessionColumns,
    })}`;
  }

  async function oneRow(response: Response): Promise<unknown> {
    const rows: unknown = await response.json();
    if (!Array.isArray(rows) || rows.length > 1) throw new Error("Invalid demo store response");
    if (rows.length === 0) return null;
    if (rows[0] === null || typeof rows[0] !== "object") throw new Error("Invalid demo store row");
    return rows[0];
  }

  return {
    async create(sessionHash: string, state: DemoState) {
      return oneRow(await request(`demo_session_state?select=${sessionColumns}`, "POST", {
        session_id_hash: sessionHash,
        state,
      }));
    },

    async read(sessionHash: string) {
      return oneRow(await request(sessionPath(sessionHash), "GET"));
    },

    async remove(sessionHash: string) {
      await request(sessionPath(sessionHash), "DELETE");
    },

    async commit(sessionHash: string, revision: number, state: DemoState) {
      const response = await request("rpc/commit_demo_session_state", "POST", {
        p_session_id_hash: sessionHash,
        p_expected_revision: revision,
        p_next_state: state,
      });
      const committed: unknown = await response.json();
      if (typeof committed !== "boolean") throw new Error("Invalid demo store commit response");
      return committed;
    },
  };
}
