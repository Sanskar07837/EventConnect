import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { initialDemoState, isDemoPersonaId, isDemoState } from "../data/demo-state";
import type { DemoState } from "../data/repository";
import { getDemoStore } from "./supabase";

const cookieName = "eventconnect_demo";
const maxAge = 12 * 60 * 60;
const maxAgeMs = maxAge * 1000;
const clockSkewMs = 30_000;
const maxCommitAttempts = 3;
const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  path: "/",
  secure: process.env.NODE_ENV === "production",
} as const;

type Token = { id: string; issuedAt: number; expiresAt: number };
type SessionRow = { state: DemoState; revision: number; issuedAt: number; expiresAt: number };
type Lookup =
  | { kind: "guest" | "invalid" | "unavailable" }
  | { kind: "active"; row: SessionRow; sessionHash: string };

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type Store = NonNullable<ReturnType<typeof getDemoStore>>;
type Config = { secret: Buffer; store: Store };

export type DemoActionResult =
  | { ok: true }
  | { ok: false; reason: "unavailable" | "guest" | "invalid-persona" | "conflict" };

function decodeBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const decoded = Buffer.from(value, "base64url");
  return decoded.toString("base64url") === value ? decoded : null;
}

function getConfig(): Config | null {
  if (process.env.DEMO_MODE !== "true") return null;
  const secret = decodeBase64Url(process.env.DEMO_SESSION_SECRET ?? "");
  if (!secret || secret.length < 32) return null;
  const store = getDemoStore();
  return store ? { secret, store } : null;
}

function hmac(payload: string, secret: Buffer) {
  return createHmac("sha256", secret).update(payload).digest();
}

function hashId(id: string) {
  return createHash("sha256").update(id).digest("hex");
}

function validLifetime(issuedAt: number, expiresAt: number) {
  const now = Date.now();
  return Number.isSafeInteger(issuedAt) && Number.isSafeInteger(expiresAt)
    && issuedAt > 0 && issuedAt <= now + clockSkewMs
    && expiresAt - issuedAt === maxAgeMs && expiresAt > now;
}

function readToken(value: string, secret: Buffer): Token | null {
  if (value.length > 256) return null;
  const parts = value.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  const supplied = decodeBase64Url(signature);
  const expected = hmac(payload, secret);
  if (!supplied || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) return null;

  const decoded = decodeBase64Url(payload);
  if (!decoded) return null;
  try {
    const token = JSON.parse(decoded.toString("utf8")) as Partial<Token> | null;
    if (!token || typeof token !== "object" || Object.keys(token).length !== 3
      || typeof token.id !== "string" || decodeBase64Url(token.id)?.length !== 32
      || typeof token.issuedAt !== "number" || typeof token.expiresAt !== "number"
      || !validLifetime(token.issuedAt, token.expiresAt)) return null;
    return { id: token.id, issuedAt: token.issuedAt, expiresAt: token.expiresAt };
  } catch {
    return null;
  }
}

function parseRow(value: unknown, sessionHash: string): SessionRow | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if (row.session_id_hash !== sessionHash || typeof row.revision !== "number"
    || !Number.isSafeInteger(row.revision) || row.revision < 0
    || typeof row.created_at !== "string" || typeof row.expires_at !== "string"
    || !isDemoState(row.state)) return null;

  const issuedAt = Date.parse(row.created_at);
  const expiresAt = Date.parse(row.expires_at);
  if (!validLifetime(issuedAt, expiresAt)) return null;
  return { state: row.state, revision: row.revision, issuedAt, expiresAt };
}

async function lookup(store: CookieStore, config: Config): Promise<Lookup> {
  const cookie = store.get(cookieName);
  if (!cookie) return { kind: "guest" };
  const token = readToken(cookie.value, config.secret);
  if (!token) return { kind: "invalid" };
  const sessionHash = hashId(token.id);

  try {
    const row = parseRow(await config.store.read(sessionHash), sessionHash);
    if (!row || row.issuedAt !== token.issuedAt || row.expiresAt !== token.expiresAt) return { kind: "invalid" };
    return { kind: "active", row, sessionHash };
  } catch {
    return { kind: "unavailable" };
  }
}

function clearCookie(store: CookieStore) {
  store.set(cookieName, "", { ...cookieOptions, maxAge: 0 });
}

export async function readDemoSession(): Promise<DemoState | null> {
  const config = getConfig();
  if (!config) return null;
  const session = await lookup(await cookies(), config);
  return session.kind === "active" ? session.row.state : null;
}

export async function startDemoSession(): Promise<DemoActionResult> {
  const config = getConfig();
  if (!config) return { ok: false, reason: "unavailable" };
  const cookieStore = await cookies();
  const current = await lookup(cookieStore, config);
  if (current.kind === "active") return { ok: true };
  if (current.kind === "unavailable") return { ok: false, reason: "unavailable" };
  if (current.kind === "invalid") clearCookie(cookieStore);

  const id = randomBytes(32).toString("base64url");
  const sessionHash = hashId(id);
  try {
    const row = parseRow(await config.store.create(sessionHash, initialDemoState()), sessionHash);
    if (!row) return { ok: false, reason: "unavailable" };
    const token: Token = { id, issuedAt: row.issuedAt, expiresAt: row.expiresAt };
    const payload = Buffer.from(JSON.stringify(token)).toString("base64url");
    cookieStore.set(cookieName, `${payload}.${hmac(payload, config.secret).toString("base64url")}`, {
      ...cookieOptions,
      maxAge,
      expires: new Date(row.expiresAt),
    });
    return { ok: true };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}

// The caller applies the operation's authorization and business rules to the
// latest snapshot on every attempt. A retry must never silently change actors.
export async function mutateDemoSession(
  update: (state: DemoState) => DemoState | null,
): Promise<DemoActionResult> {
  const config = getConfig();
  if (!config) return { ok: false, reason: "unavailable" };
  const cookieStore = await cookies();
  let actor: string | undefined;

  for (let attempt = 0; attempt < maxCommitAttempts; attempt++) {
    const session = await lookup(cookieStore, config);
    if (session.kind === "unavailable") return { ok: false, reason: "unavailable" };
    if (session.kind === "invalid") clearCookie(cookieStore);
    if (session.kind !== "active") return { ok: false, reason: "guest" };

    actor ??= session.row.state.activePersonaId;
    if (actor !== session.row.state.activePersonaId) return { ok: false, reason: "conflict" };
    const nextState = update(session.row.state);
    if (!nextState || !isDemoState(nextState)) return { ok: false, reason: "conflict" };

    try {
      if (await config.store.commit(session.sessionHash, session.row.revision, nextState)) return { ok: true };
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }
  return { ok: false, reason: "conflict" };
}

export async function switchDemoPersona(personaId: unknown): Promise<DemoActionResult> {
  if (!isDemoPersonaId(personaId)) return { ok: false, reason: "invalid-persona" };
  return mutateDemoSession((state) => ({ ...state, activePersonaId: personaId }));
}

export async function resetDemoSession(): Promise<DemoActionResult> {
  const config = getConfig();
  if (!config) return { ok: false, reason: "unavailable" };
  const cookieStore = await cookies();
  const session = await lookup(cookieStore, config);
  if (session.kind === "unavailable") return { ok: false, reason: "unavailable" };

  if (session.kind === "active") {
    try {
      await config.store.remove(session.sessionHash);
    } catch {
      return { ok: false, reason: "unavailable" };
    }
  }
  if (session.kind !== "guest") clearCookie(cookieStore);
  return { ok: true };
}
