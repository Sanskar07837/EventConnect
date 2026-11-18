"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import Controls from "./Controls";
import { desktopMedia, sceneInterval, scenes, transitionDuration } from "./scenes";
import styles from "./landing.module.css";

type Frame = { index: number; sequence: number };
type SceneState = { active: Frame; outgoing: Frame | null; pending: boolean; decoded: boolean };
type Phase = "initial" | "pending" | "holding" | "incoming" | "outgoing";
const imagePreparationLead = 750;

function usePlaybackEnvironment() {
  const [environment, setEnvironment] = useState({ reducedMotion: false, hidden: true });

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnvironment({
      reducedMotion: preference.matches,
      hidden: document.hidden,
    });
    sync();
    preference.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      preference.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return environment;
}

function SceneLayer({ frame, phase, layerRef, onSettled }: {
  frame: Frame;
  phase: Phase;
  layerRef?: Ref<HTMLDivElement>;
  onSettled?: () => void;
}) {
  const scene = scenes[frame.index];

  return (
    <div
      className={styles.layer}
      ref={layerRef}
      aria-hidden={phase === "outgoing" || phase === "pending" || undefined}
      role="group"
      aria-label={scene.title}
      data-scene={scene.id}
      data-transition={scene.transition}
      data-phase={phase}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget) onSettled?.();
      }}
    >
      {scene.tiles.map((tile) => {
        const hero = frame.sequence === 0 && tile.slot === "06";
        return (
          <picture
            key={tile.slot}
            className={styles.tile}
            data-slot={tile.slot}
            data-desktop-only={!tile.mobile || undefined}
          >
            <source media={desktopMedia} srcSet={tile.desktopSrc} width={1600} height={1195} />
            {/* Use a native picture to serve the exact local variant and omit the mobile fallback for desktop-only tiles. */}
            <img
              src={tile.mobile ? tile.mobileSrc : undefined}
              width={800}
              height={597}
              alt={tile.alt}
              loading={hero || frame.sequence > 0 ? "eager" : "lazy"}
              fetchPriority={hero ? "high" : undefined}
              decoding={hero ? undefined : "async"}
            />
          </picture>
        );
      })}
    </div>
  );
}

export default function Scene({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SceneState>({
    active: { index: 0, sequence: 0 },
    outgoing: null,
    pending: false,
    decoded: false,
  });
  const [manuallyPaused, setManuallyPaused] = useState(false);
  const incomingRef = useRef<HTMLDivElement>(null);
  const playback = useRef({ sequence: 0, remaining: sceneInterval });
  const { reducedMotion, hidden } = usePlaybackEnvironment();
  const { active, outgoing, pending, decoded } = state;
  const visibleSequence = pending && outgoing ? outgoing.sequence : active.sequence;
  const canAdvance = !reducedMotion && !hidden && !manuallyPaused;

  useLayoutEffect(() => {
    const clock = playback.current;
    if (clock.sequence !== visibleSequence) {
      clock.sequence = visibleSequence;
      clock.remaining = sceneInterval;
    }

    if (!canAdvance) return;

    const startedAt = performance.now();
    function advance() {
      if (document.hidden) return;
      if (pending) {
        setState((current) => ({ ...current, pending: false }));
        return;
      }

      setState({
        active: { index: (active.index + 1) % scenes.length, sequence: active.sequence + 1 },
        outgoing: active,
        pending: true,
        decoded: false,
      });
    }

    // Decode just the next scene near the end of the dwell period. If decoding
    // takes longer than the remaining dwell time, keep the current scene visible.
    const delay = pending ? clock.remaining : clock.remaining - imagePreparationLead;
    const timer = !pending || decoded ? window.setTimeout(advance, Math.max(0, delay)) : undefined;

    return () => {
      window.clearTimeout(timer);
      clock.remaining = Math.max(0, clock.remaining - (performance.now() - startedAt));
    };
  }, [active, canAdvance, decoded, pending, visibleSequence]);

  useEffect(() => {
    if (reducedMotion || !pending || !incomingRef.current) return;
    const images = Array.from(incomingRef.current.querySelectorAll("img"))
      .filter((img) => img.getClientRects().length > 0);
    let cancelled = false;

    // Leave the current collage in view while the browser decodes the selected variants.
    void Promise.allSettled(images.map((img) => img.decode())).then(() => {
      if (!cancelled) {
        setState((current) =>
          current.pending && current.active === active
            ? { ...current, decoded: true }
            : current,
        );
      }
    });

    return () => { cancelled = true; };
  }, [active, pending, reducedMotion]);

  useEffect(() => {
    if (!reducedMotion || !outgoing) return;
    const frame = window.requestAnimationFrame(() => {
      setState((current) => ({
        active: current.pending && current.outgoing ? current.outgoing : current.active,
        outgoing: null,
        pending: false,
        decoded: false,
      }));
    });
    return () => window.cancelAnimationFrame(frame);
  }, [outgoing, pending, reducedMotion]);

  return (
    <div className={styles.stage} style={{ "--scene-transition": `${transitionDuration}ms` } as CSSProperties}>
      {children}
      {outgoing && (
        <SceneLayer key={outgoing.sequence} frame={outgoing} phase={pending ? "holding" : "outgoing"} />
      )}
      <SceneLayer
        key={active.sequence}
        frame={active}
        phase={pending ? "pending" : outgoing ? "incoming" : "initial"}
        layerRef={incomingRef}
        onSettled={() => setState((current) => ({ ...current, outgoing: null }))}
      />
      {!reducedMotion && <Controls paused={manuallyPaused} onTogglePlayback={() => setManuallyPaused((paused) => !paused)} />}
    </div>
  );
}
