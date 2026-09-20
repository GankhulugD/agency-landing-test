"use client";

import {
  createContext,
  memo,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type RefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { CosmicMorph } from "@/components/hero/CosmicMorph";
import {
  ScrollActivityContext,
  useScrollActivity,
} from "@/components/hero/contexts";
import { ServicesGrid } from "@/components/hero/Services";
import type {
  ScrollActivity,
  ServiceInteraction,
  ViewportProfile,
} from "@/components/hero/types";
import { SocialLinks } from "@/components/SocialLinks";
import { brand, hero, services } from "@/lib/copy";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/lib/useTranslations";

gsap.registerPlugin(ScrollTrigger);

/* ═══════════════════════════════════════════════════════════════════════════
   Scroll & pointer stores — GSAP writes, R3F reads (no React re-renders)
═══════════════════════════════════════════════════════════════════════════ */

type ScrollState = { morph: number; ui: number };

const ScrollContext = createContext<ScrollState>({ morph: 0, ui: 0 });
const PointerContext = createContext({ x: 0, y: 0 });

const useScrollState = () => useContext(ScrollContext);
const usePointer = () => useContext(PointerContext);

const ServiceInteractionContext =
  createContext<MutableRefObject<ServiceInteraction> | null>(null);

const useServiceInteraction = () => {
  const ctx = useContext(ServiceInteractionContext);
  if (!ctx) {
    throw new Error("useServiceInteraction requires ServiceInteractionContext");
  }
  return ctx;
};

const defaultViewport: ViewportProfile = {
  isMobile: false,
  sceneScale: 1,
  sceneYOffset: 0,
  cameraZ: 5.2,
  cameraY: 0.55,
  lookAtY: 0,
  starCount: 3000,
  ringSegments: 128,
  tubeSegments: 16,
  sphereSegments: 64,
  enableBloom: true,
  enableTransmission: true,
  envIntensity: 0.38,
};

const ViewportContext = createContext<ViewportProfile>(defaultViewport);
const useViewport = () => useContext(ViewportContext);

function getOptimalDpr(): number | [number, number] {
  if (typeof window === "undefined") return 1;
  return [1, Math.min(2, window.devicePixelRatio || 1)];
}

function buildViewport(width: number): ViewportProfile {
  const mobile = width < 768;
  const tablet = width >= 768 && width < 1024;

  if (mobile) {
    return {
      isMobile: true,
      sceneScale: 0.6,
      sceneYOffset: 0.55,
      cameraZ: 6.5,
      cameraY: 0.72,
      lookAtY: 0.4,
      starCount: 3000,
      ringSegments: 32,
      tubeSegments: 8,
      sphereSegments: 32,
      enableBloom: false,
      enableTransmission: false,
      envIntensity: 0.22,
    };
  }

  if (tablet) {
    return {
      isMobile: false,
      sceneScale: 0.78,
      sceneYOffset: 0.25,
      cameraZ: 5.8,
      cameraY: 0.62,
      lookAtY: 0.15,
      starCount: 3000,
      ringSegments: 64,
      tubeSegments: 12,
      sphereSegments: 48,
      enableBloom: true,
      enableTransmission: true,
      envIntensity: 0.3,
    };
  }

  return defaultViewport;
}

/* ═══════════════════════════════════════════════════════════════════════════
   Device profile
═══════════════════════════════════════════════════════════════════════════ */

function useDeviceProfile() {
  const [profile, setProfile] = useState({
    fallback: true,
    dpr: 1 as number | [number, number],
    viewport: defaultViewport,
  });

  useEffect(() => {
    const apply = () => {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      const viewport = buildViewport(window.innerWidth);
      setProfile({
        fallback: reduced,
        dpr: reduced ? 1 : getOptimalDpr(),
        viewport,
      });
    };

    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, []);

  return profile;
}

/* ═══════════════════════════════════════════════════════════════════════════
   3D — Starfield (micro-point THREE.Points, deep Z distribution)
═══════════════════════════════════════════════════════════════════════════ */

const STAR_PALETTE = [
  new THREE.Color("#ffffff"),
  new THREE.Color("#b0d2ff"),
  new THREE.Color("#ffe5b4"),
] as const;

function CosmicStarfield({ starCount }: { starCount: number }) {
  const pointsRef = useRef<THREE.Points>(null);

  const starGeometry = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = -Math.random() * 80 - 10;

      const color =
        STAR_PALETTE[Math.floor(Math.random() * STAR_PALETTE.length)]!;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return geometry;
  }, [starCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.01;
  });

  return (
    <points ref={pointsRef} geometry={starGeometry} frustumCulled={false}>
      <pointsMaterial
        size={0.08}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   3D — Scene
═══════════════════════════════════════════════════════════════════════════ */

function HeroScene() {
  const scroll = useScrollState();
  const pointer = usePointer();
  const viewport = useViewport();
  const serviceInteraction = useServiceInteraction();
  const { camera } = useThree();

  useFrame(() => {
    const p = scroll.morph;
    const settle = THREE.MathUtils.smoothstep(scroll.ui, 0, 1);
    const pulse = serviceInteraction.current.pulse;

    const radius = THREE.MathUtils.lerp(
      viewport.cameraZ,
      viewport.cameraZ - 0.6,
      settle
    );
    const height = THREE.MathUtils.lerp(viewport.cameraY, viewport.cameraY - 0.2, p);
    const offsetX = THREE.MathUtils.lerp(0, viewport.isMobile ? -0.25 : -0.6, settle);
    const tiltX = pulse * 0.06;
    const tiltY = pulse * 0.04;

    camera.position.set(offsetX + tiltY, height + tiltX, radius);
    camera.lookAt(
      THREE.MathUtils.lerp(0, viewport.isMobile ? 0.35 : 0.8, settle),
      viewport.lookAtY,
      0
    );
  });

  const bloomIntensity = viewport.isMobile ? 1.05 : 1.35;

  return (
    <>
      <color attach="background" args={["#080808"]} />
      <fog attach="fog" args={["#080808", 18, 45]} />

      <ambientLight intensity={0.55} />
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.2}
        color="#ffffff"
      />
      <pointLight position={[8, 8, 8]} intensity={2.2} color="#ffffff" />
      <pointLight position={[-6, -4, 4]} intensity={1.2} color="#d1c7bd" />
      <hemisphereLight args={["#e0e6ed", "#080808", 0.28]} />

      <Environment
        preset="warehouse"
        environmentIntensity={viewport.envIntensity}
      />

      <CosmicStarfield starCount={viewport.starCount} />

      <CosmicMorph
        scroll={scroll}
        pointer={pointer}
        viewport={viewport}
        serviceInteraction={serviceInteraction}
      />

      {viewport.enableBloom && (
        <EffectComposer multisampling={0}>
          <Bloom
            intensity={bloomIntensity}
            luminanceThreshold={0.22}
            luminanceSmoothing={0.35}
            mipmapBlur
          />
        </EffectComposer>
      )}
    </>
  );
}

const HeroCanvas = memo(function HeroCanvas({
  scrollState,
  pointer,
  dpr,
  viewport,
  serviceInteraction,
  scrollActivity,
}: {
  scrollState: ScrollState;
  pointer: { x: number; y: number };
  dpr: number | [number, number];
  viewport: ViewportProfile;
  serviceInteraction: MutableRefObject<ServiceInteraction>;
  scrollActivity: MutableRefObject<ScrollActivity>;
}) {
  return (
    <Canvas
      className="absolute inset-0 transform-gpu"
      camera={{
        fov: viewport.isMobile ? 42 : 40,
        near: 0.1,
        far: 120,
        position: [0, viewport.cameraY, viewport.cameraZ],
      }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.08,
      }}
      dpr={dpr}
    >
      <ViewportContext.Provider value={viewport}>
        <ServiceInteractionContext.Provider value={serviceInteraction}>
          <ScrollActivityContext.Provider value={scrollActivity}>
            <ScrollContext.Provider value={scrollState}>
              <PointerContext.Provider value={pointer}>
                <Suspense fallback={null}>
                  <HeroScene />
                  <Preload all />
                </Suspense>
              </PointerContext.Provider>
            </ScrollContext.Provider>
          </ScrollActivityContext.Provider>
        </ServiceInteractionContext.Provider>
      </ViewportContext.Provider>
    </Canvas>
  );
});

const HeroBackdrop = memo(function HeroBackdrop({
  gridRef,
  scrollState,
  pointer,
  dpr,
  viewport,
  serviceInteraction,
  scrollActivity,
  variant,
}: {
  gridRef: RefObject<HTMLDivElement | null>;
  scrollState: ScrollState;
  pointer: { x: number; y: number };
  dpr: number | [number, number];
  viewport: ViewportProfile;
  serviceInteraction: MutableRefObject<ServiceInteraction>;
  scrollActivity: MutableRefObject<ScrollActivity>;
  variant: "mobile" | "desktop";
}) {
  const canvas = (
    <HeroCanvas
      scrollState={scrollState}
      pointer={pointer}
      dpr={dpr}
      viewport={viewport}
      serviceInteraction={serviceInteraction}
      scrollActivity={scrollActivity}
    />
  );

  if (variant === "mobile") {
    return (
      <div className="pointer-events-none sticky top-0 -mb-[100dvh] h-[100dvh] w-full">
        <div
          ref={gridRef}
          className="hero-grid absolute inset-0 z-[1] opacity-0"
          aria-hidden
        />
        <div className="absolute inset-0 z-0">{canvas}</div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-0">
      <div
        ref={gridRef}
        className="hero-grid absolute inset-0 z-[1] opacity-0"
        aria-hidden
      />
      <div className="absolute inset-0 z-0">{canvas}</div>
    </div>
  );
});

/* ═══════════════════════════════════════════════════════════════════════════
   UI — Cursor, glass cards, split headline
═══════════════════════════════════════════════════════════════════════════ */

function HeroHeadline({
  lines,
  className,
  headlineRef,
}: {
  lines: readonly string[];
  className: string;
  headlineRef: RefObject<HTMLHeadingElement | null>;
}) {
  return (
    <h1 ref={headlineRef} className={className}>
      {lines.map((line, lineIdx) => (
        <span key={lineIdx} className="block whitespace-nowrap">
          {line.split(" ").map((word, i, words) => (
            <span
              key={`${lineIdx}-${word}-${i}`}
              className="inline-block overflow-hidden"
            >
              <span data-word className="inline-block will-change-transform">
                {word}
                {i < words.length - 1 ? "\u00A0" : ""}
              </span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const hoverState = useRef({ magnetic: false, service: false });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      hoverState.current.magnetic = !!el?.closest("[data-magnetic]");
      hoverState.current.service = !!el?.closest("[data-service-card]");

      let { x, y } = { x: e.clientX, y: e.clientY };
      const magneticEl = el?.closest("[data-magnetic]") as HTMLElement | null;
      if (magneticEl) {
        const rect = magneticEl.getBoundingClientRect();
        const pull = 0.22;
        x += (rect.left + rect.width / 2 - x) * pull;
        y += (rect.top + rect.height / 2 - y) * pull;
      }

      target.current = { x, y };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    let id: number;
    const tick = () => {
      const { x, y } = target.current;
      ringPos.current.x += (x - ringPos.current.x) * 0.72;
      ringPos.current.y += (y - ringPos.current.y) * 0.72;
      const dotT = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      const scale =
        hoverState.current.magnetic ? 1.75 : hoverState.current.service ? 1.45 : 1;
      const ringT = `translate3d(${ringPos.current.x}px,${ringPos.current.y}px,0) translate(-50%,-50%) scale(${scale})`;
      if (dotRef.current) dotRef.current.style.transform = dotT;
      if (ringRef.current) {
        ringRef.current.style.transform = ringT;
        ringRef.current.style.borderColor =
          hoverState.current.service
            ? "rgba(209, 199, 189, 0.45)"
            : "rgba(255, 255, 255, 0.1)";
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(id);
    };
  }, []);

  return (
    <>
      <div
        ref={ringRef}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-7 w-7 rounded-full border border-white/10 transition-[border-color] duration-300"
        aria-hidden
      />
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[200] h-[3px] w-[3px] rounded-full bg-champagne"
        aria-hidden
      />
    </>
  );
}

function HeroFallback() {
  const t = useTranslations();
  const serviceInteraction = useRef<ServiceInteraction>({
    activeIndex: null,
    targetAngle: 0,
    pulse: 0,
  });

  return (
    <section className="relative min-h-[100dvh] bg-obsidian px-4 py-20 sm:px-6 sm:py-28">
      <header className="mx-auto mb-12 flex max-w-3xl items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone/40">
          {t.brand.name}
        </span>
        <SocialLinks />
      </header>
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/60">
          {t.hero.eyebrow}
        </p>
        <h1 className="text-[clamp(1.35rem,4.8vw,4.75rem)] font-medium leading-[1.08] tracking-tighter text-bone">
          {t.hero.headlineLines.map((line, lineIdx) => (
            <span key={lineIdx} className="block whitespace-nowrap">
              {line}
            </span>
          ))}
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-bone/50 sm:mt-8">
          {t.hero.subheading}
        </p>
        <ServicesGrid
          serviceInteraction={serviceInteraction}
          gridClassName="mt-12 grid grid-cols-1 gap-2 sm:mt-16 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   Hero — export
═══════════════════════════════════════════════════════════════════════════ */

export function Hero() {
  const t = useTranslations();
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLDivElement>(null);
  const scrollState = useRef<ScrollState>({ morph: 0, ui: 0 });
  const pointer = useRef({ x: 0, y: 0 });
  const serviceInteraction = useRef<ServiceInteraction>({
    activeIndex: null,
    targetAngle: 0,
    pulse: 0,
  });
  const scrollActivity = useRef<ScrollActivity>({ active: false });

  const { fallback, dpr, viewport } = useDeviceProfile();

  const updatePointer = useCallback((clientX: number, clientY: number) => {
    pointer.current.x = (clientX / window.innerWidth) * 2 - 1;
    pointer.current.y = -(clientY / window.innerHeight) * 2 + 1;
  }, []);

  const onPointerMove = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    },
    [updatePointer]
  );

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touch = e.touches[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    },
    [updatePointer]
  );

  useEffect(() => {
    if (fallback) return;
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", onPointerMove);
  }, [fallback, onPointerMove]);

  useEffect(() => {
    if (fallback) return;

    let idleTimer = 0;
    const markScrolling = () => {
      scrollActivity.current.active = true;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        scrollActivity.current.active = false;
      }, 140);
    };

    window.addEventListener("scroll", markScrolling, { passive: true });
    window.addEventListener("wheel", markScrolling, { passive: true });
    window.addEventListener("touchmove", markScrolling, { passive: true });

    return () => {
      window.clearTimeout(idleTimer);
      window.removeEventListener("scroll", markScrolling);
      window.removeEventListener("wheel", markScrolling);
      window.removeEventListener("touchmove", markScrolling);
    };
  }, [fallback]);

  useLayoutEffect(() => {
    if (fallback) return;

    const section = sectionRef.current;
    const headline = headlineRef.current;
    const sub = subRef.current;
    const grid = gridRef.current;
    const servicesEl = servicesRef.current;
    if (!section || !headline || !servicesEl) return;

    const words = headline.querySelectorAll<HTMLElement>("[data-word]");
    const cards = servicesEl.querySelectorAll("[data-service-card-wrap]");

    scrollState.current.morph = 0;
    scrollState.current.ui = 0;

    gsap.set(words, { yPercent: 110 });
    gsap.set(sub, { autoAlpha: 0, y: 12 });
    gsap.set(grid, { autoAlpha: 0 });
    gsap.set(cards, { autoAlpha: 0 });

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (!reducedMotion) {
      gsap
        .timeline({ delay: 0.2 })
        .to(words, {
          yPercent: 0,
          duration: 0.85,
          stagger: 0.035,
          ease: "power3.out",
        })
        .to(
          sub,
          { autoAlpha: 0.6, y: 0, duration: 0.65, ease: "power2.out" },
          0.12
        );
    } else {
      gsap.set(words, { yPercent: 0 });
      gsap.set(sub, { autoAlpha: 0.6, y: 0 });
    }

    const mobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: mobile ? "bottom bottom" : "+=90%",
          scrub: true,
          pin: !mobile,
          anticipatePin: 0,
          invalidateOnRefresh: true,
        },
      });

      tl.to(
        scrollState.current,
        { morph: 1, ease: "none", duration: 0.55 },
        0
      );

      tl.to(
        words,
        {
          y: -72,
          autoAlpha: 0,
          stagger: 0.015,
          ease: "power2.in",
          duration: 0.12,
        },
        0.05
      );

      tl.to(
        sub,
        { autoAlpha: 0, y: -20, duration: 0.08, ease: "power2.in" },
        0.06
      );

      tl.to(
        scrollState.current,
        { ui: 1, ease: "none", duration: 0.35 },
        0.45
      );

      tl.to(grid, { autoAlpha: 0.55, duration: 0.15, ease: "none" }, 0.48);

      tl.to(
        cards,
        {
          autoAlpha: 1,
          stagger: 0.015,
          duration: 0.08,
          ease: "power1.out",
        },
        0.52
      );
    }, section);

    const onResize = () => ScrollTrigger.refresh();
    window.addEventListener("resize", onResize);
    return () => {
      ctx.revert();
      window.removeEventListener("resize", onResize);
    };
  }, [fallback, viewport.isMobile]);

  if (fallback) return <HeroFallback />;

  const headlineLines = t.hero.headlineLines;

  return (
    <>
      {!viewport.isMobile && <CursorFollower />}

      <section
        id="hero"
        ref={sectionRef}
        className={cn(
          "relative w-full bg-obsidian",
          viewport.isMobile ? "min-h-0" : "h-[100dvh] overflow-hidden"
        )}
        aria-label="Namoon Compass hero"
        onMouseMove={onPointerMove}
        onTouchMove={onTouchMove}
      >
        {viewport.isMobile ? (
          <>
            <HeroBackdrop
              variant="mobile"
              gridRef={gridRef}
              scrollState={scrollState.current}
              pointer={pointer.current}
              dpr={dpr}
              viewport={viewport}
              serviceInteraction={serviceInteraction}
              scrollActivity={scrollActivity}
            />

            <div className="relative z-10">
              <div className="relative flex min-h-[100dvh] h-auto flex-col px-4">
                <header className="flex shrink-0 items-center justify-between py-4 pr-20">
                  <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-bone/40">
                    {t.brand.name}
                  </span>
                  <SocialLinks />
                </header>
                <div className="pointer-events-none absolute inset-x-0 top-[28%] flex -translate-y-1/2 justify-center px-4">
                  <div className="max-w-4xl text-center">
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-champagne/55">
                      {t.hero.eyebrow}
                    </p>
                    <HeroHeadline
                      lines={headlineLines}
                      headlineRef={headlineRef}
                      className="hero-headline text-[clamp(1.35rem,4.8vw,2.25rem)] font-medium leading-[1.1] tracking-tighter text-bone"
                    />
                    <p
                      ref={subRef}
                      className="mx-auto mt-4 max-w-md px-2 text-[12px] leading-relaxed text-bone/45"
                    >
                      {t.hero.subheading}
                    </p>
                  </div>
                </div>
              </div>

              <div ref={servicesRef} id="services" className="px-4 pb-10 pt-2">
                <ServicesGrid
                  serviceInteraction={serviceInteraction}
                  gridClassName="grid grid-cols-1 gap-2"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <HeroBackdrop
              variant="desktop"
              gridRef={gridRef}
              scrollState={scrollState.current}
              pointer={pointer.current}
              dpr={dpr}
              viewport={viewport}
              serviceInteraction={serviceInteraction}
              scrollActivity={scrollActivity}
            />

            <div className="relative z-10 flex h-full min-h-0 flex-col overflow-y-auto px-4 sm:px-10 lg:px-16">
              <header className="flex shrink-0 items-center justify-between py-4 pr-20 sm:py-8 sm:pr-24">
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-bone/40 sm:text-[10px] sm:tracking-[0.4em]">
                  {t.brand.name}
                </span>
                <SocialLinks />
              </header>

              <div className="pointer-events-none absolute inset-x-0 top-[28%] flex -translate-y-1/2 justify-center px-4 sm:top-[34%] md:top-[38%]">
                <div className="max-w-4xl text-center">
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-champagne/55 sm:mb-5 sm:text-[10px] sm:tracking-[0.35em]">
                    {t.hero.eyebrow}
                  </p>
                  <HeroHeadline
                    lines={headlineLines}
                    headlineRef={headlineRef}
                    className="hero-headline text-[clamp(1.75rem,5.2vw,4.75rem)] font-medium leading-[1.08] tracking-tighter text-bone"
                  />
                  <p
                    ref={subRef}
                    className="mx-auto mt-4 max-w-md px-2 text-[12px] leading-relaxed text-bone/45 sm:mt-6 sm:text-[13px]"
                  >
                    {t.hero.subheading}
                  </p>
                </div>
              </div>

              <div
                ref={servicesRef}
                id="services"
                className="mt-auto w-full origin-bottom scale-[0.98] pb-2 sm:pb-6"
              >
                <ServicesGrid
                  serviceInteraction={serviceInteraction}
                  scrollIntoViewOnExpand={false}
                  gridClassName="grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-1.5 lg:grid-cols-3 lg:gap-1.5"
                />
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
