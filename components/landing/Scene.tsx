"use client";

import { getImageProps } from "next/image";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode, type Ref } from "react";
import Controls from "./Controls";
import { desktopMedia, openingImage, sceneInterval, scenes, transitionDuration, type LandingTile } from "./scenes";
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

/* eslint-disable @next/next/no-img-element -- Native picture delivery selects the optimized candidate or exact legacy variant. */
function SceneTile({ tile, eager, hero, index, exitIndex }: {
  tile: LandingTile;
  eager: boolean;
  hero: boolean;
  index: number;
  exitIndex: number;
}) {
  const loading = eager ? "eager" : "lazy";
  const legacy = "desktopSrc" in tile.image ? tile.image : null;
  const candidate = "src" in tile.image ? getImageProps({
    ...tile.image, alt: tile.alt, loading,
    fetchPriority: hero ? "high" : undefined,
    decoding: hero ? undefined : "async",
  }).props : null;

  // A desktop-only tile has no fallback URL, so it cannot fetch on mobile.
  return (
    <picture
      className={styles.tile}
      data-image={tile.id}
      data-desktop-only={!tile.mobile || undefined}
      style={{ "--tile-delay": `${index * 26}ms`, "--tile-exit-delay": `${140 + exitIndex * 24}ms` } as CSSProperties}
    >
      {legacy && <source media={desktopMedia} srcSet={legacy.desktopSrc} width={1600} height={1195} />}
      {candidate && !tile.mobile && (
        <source media={desktopMedia} srcSet={candidate.srcSet} sizes={candidate.sizes} />
      )}
      {legacy && (
        <img src={tile.mobile ? legacy.mobileSrc : undefined} width={800} height={597} alt={tile.alt} loading={loading} decoding="async" />
      )}
      {candidate && (
        <img {...candidate} alt={tile.alt} {...(!tile.mobile && { src: undefined, srcSet: undefined, sizes: undefined })} />
      )}
    </picture>
  );
}
/* eslint-enable @next/next/no-img-element */

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
      {scene.tiles.map((tile, index) => {
        const hero = frame.sequence === 0 && tile.id === openingImage;
        return (
          <SceneTile
            key={tile.id}
            tile={tile}
            index={index}
            exitIndex={scene.tiles.length - index - 1}
            eager={hero || frame.sequence > 0}
            hero={hero}
          />
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
