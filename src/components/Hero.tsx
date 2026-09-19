"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { CosmicMorph } from "@/components/hero/CosmicMorph";
import { ServicesGrid } from "@/components/hero/Services";
import type { ServiceInteraction, ViewportProfile } from "@/components/hero/types";
import { SocialLinks } from "@/components/SocialLinks";
import { brand, hero } from "@/lib/copy";
import { cn } from "@/lib/utils";

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
  starCount: 2500,
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
      starCount: 650,
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
      starCount: 1400,
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
   3D — Starfield
═══════════════════════════════════════════════════════════════════════════ */

const starVertexShader = /* glsl */ `
  attribute float aPhase;
  attribute float aBaseOpacity;
  uniform float uTime;
  uniform float uPulse;
  varying float vOpacity;

  void main() {
    float twinkle = 0.55 + 0.45 * sin(uTime * 1.15 + aPhase);
    vOpacity = aBaseOpacity * twinkle * (1.0 + uPulse * 0.35);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = clamp(1.4 * (140.0 / -mvPosition.z), 0.6, 2.4);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const starFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  varying float vOpacity;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float dist = length(uv);
    if (dist > 0.5) discard;
    float alpha = smoothstep(0.5, 0.08, dist) * vOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

function CosmicStarfield({ starCount }: { starCount: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const serviceInteraction = useServiceInteraction();

  const geometry = useMemo(() => {
    const positions = new Float32Array(starCount * 3);
    const phases = new Float32Array(starCount);
    const baseOpacities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 2] = -10 - Math.random() * 40;
      phases[i] = Math.random() * Math.PI * 2;
      baseOpacities[i] = 0.3 + Math.random() * 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute(
      "aBaseOpacity",
      new THREE.BufferAttribute(baseOpacities, 1)
    );
    return geo;
  }, [starCount]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = serviceInteraction.current.pulse;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
      materialRef.current.uniforms.uPulse.value = pulse;
    }
    if (pointsRef.current) {
      pointsRef.current.position.y = Math.sin(t * 0.06) * 0.35;
      pointsRef.current.position.z = Math.cos(t * 0.045) * 0.5;
      const s = 1 + pulse * 0.12;
      pointsRef.current.scale.setScalar(s);
    }
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        vertexShader={starVertexShader}
        fragmentShader={starFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uPulse: { value: 0 },
          uColor: { value: new THREE.Color("#e8eaed") },
        }}
        transparent
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

function HeroCanvas({
  scrollState,
  pointer,
  dpr,
  viewport,
  serviceInteraction,
}: {
  scrollState: ScrollState;
  pointer: { x: number; y: number };
  dpr: number | [number, number];
  viewport: ViewportProfile;
  serviceInteraction: MutableRefObject<ServiceInteraction>;
}) {
  return (
    <Canvas
      className="absolute inset-0"
      camera={{
        fov: viewport.isMobile ? 42 : 40,
        near: 0.1,
        far: 50,
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
          <ScrollContext.Provider value={scrollState}>
            <PointerContext.Provider value={pointer}>
              <Suspense fallback={null}>
                <HeroScene />
                <Preload all />
              </Suspense>
            </PointerContext.Provider>
          </ScrollContext.Provider>
        </ServiceInteractionContext.Provider>
      </ViewportContext.Provider>
    </Canvas>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   UI — Cursor, glass cards, split headline
═══════════════════════════════════════════════════════════════════════════ */

function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const ringPos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    let id: number;
    const tick = () => {
      const { x, y } = target.current;
      ringPos.current.x += (x - ringPos.current.x) * 0.72;
      ringPos.current.y += (y - ringPos.current.y) * 0.72;
      const dotT = `translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
      const ringT = `translate3d(${ringPos.current.x}px,${ringPos.current.y}px,0) translate(-50%,-50%)`;
      if (dotRef.current) dotRef.current.style.transform = dotT;
      if (ringRef.current) ringRef.current.style.transform = ringT;
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
        className="pointer-events-none fixed left-0 top-0 z-[200] h-7 w-7 rounded-full border border-white/10"
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
  const serviceInteraction = useRef<ServiceInteraction>({
    activeIndex: null,
    targetAngle: 0,
    pulse: 0,
  });

  return (
    <section className="relative min-h-[100dvh] bg-obsidian px-4 py-20 sm:px-6 sm:py-28">
      <header className="mx-auto mb-12 flex max-w-3xl items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-bone/40">
          {brand.name}
        </span>
        <SocialLinks />
      </header>
      <div className="mx-auto max-w-3xl">
        <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.35em] text-champagne/60">
          {hero.eyebrow}
        </p>
        <h1 className="text-3xl font-medium leading-[1.08] tracking-tighter text-bone break-words sm:text-5xl md:text-6xl">
          {hero.headline}
        </h1>
        <p className="mt-6 max-w-lg text-sm leading-relaxed text-bone/50 sm:mt-8">
          {hero.subheading}
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

  const onServiceInteraction = useCallback(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh());
    window.setTimeout(() => ScrollTrigger.refresh(), 380);
  }, []);

  useEffect(() => {
    if (fallback) return;
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    return () => window.removeEventListener("mousemove", onPointerMove);
  }, [fallback, onPointerMove]);

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

    gsap.set(sub, { autoAlpha: 0.6 });
    gsap.set(grid, { autoAlpha: 0 });
    gsap.set(cards, { autoAlpha: 0 });

    const mobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: mobile ? "bottom bottom" : "+=90%",
          scrub: true,
          pin: false,
          anticipatePin: 0,
          invalidateOnRefresh: true,
        },
      });

      // 3D morph 0→1 (0–50% warp / 50–100% compass lock)
      tl.to(
        scrollState.current,
        { morph: 1, ease: "none", duration: 0.55 },
        0
      );

      // Headline split-text out (early in scroll)
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

      tl.to(sub, { autoAlpha: 0, y: -20, duration: 0.08, ease: "power2.in" }, 0.06);

      // UI + services reveal (second half of scroll)
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

  const headlineWords = hero.headline.split(" ");

  return (
    <>
      {!viewport.isMobile && <CursorFollower />}

      <section
        ref={sectionRef}
        className="relative w-full min-h-[100dvh] h-auto overflow-visible bg-obsidian"
        aria-label="Namoon Compass hero"
        onMouseMove={onPointerMove}
        onTouchMove={onTouchMove}
      >
        {viewport.isMobile ? (
          <>
            {/* Sticky 3D backdrop — compass visible behind cards while scrolling */}
            <div className="pointer-events-none sticky top-0 -mb-[100dvh] h-[100dvh] w-full">
              <div
                ref={gridRef}
                className="hero-grid absolute inset-0 z-[1] opacity-0"
                aria-hidden
              />
              <div className="absolute inset-0 z-0">
                <HeroCanvas
                  scrollState={scrollState.current}
                  pointer={pointer.current}
                  dpr={dpr}
                  viewport={viewport}
                  serviceInteraction={serviceInteraction}
                />
              </div>
            </div>

            <div className="relative z-10">
              <div className="relative flex min-h-[100dvh] h-auto flex-col px-4">
                <header className="flex shrink-0 items-center justify-between py-4">
                  <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-bone/40">
                    {brand.name}
                  </span>
                  <SocialLinks />
                </header>
                <div className="pointer-events-none absolute inset-x-0 top-[28%] flex -translate-y-1/2 justify-center px-4">
                  <div className="max-w-4xl text-center">
                    <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-champagne/55">
                      {hero.eyebrow}
                    </p>
                    <h1
                      ref={headlineRef}
                      className="text-3xl font-medium leading-[1.08] tracking-tighter text-bone break-words"
                    >
                      {headlineWords.map((word, i) => (
                        <span
                          key={`${word}-${i}`}
                          className="inline-block overflow-hidden"
                        >
                          <span
                            data-word
                            className="inline-block will-change-transform"
                          >
                            {word}
                            {i < headlineWords.length - 1 ? "\u00A0" : ""}
                          </span>
                        </span>
                      ))}
                    </h1>
                    <p
                      ref={subRef}
                      className="mx-auto mt-4 max-w-md px-2 text-[12px] leading-relaxed text-bone/45"
                    >
                      {hero.subheading}
                    </p>
                  </div>
                </div>
              </div>

              <div
                ref={servicesRef}
                id="services"
                className="services-snap-scroll pb-10 pt-2"
              >
                <ServicesGrid
                  serviceInteraction={serviceInteraction}
                  onInteractionPulse={onServiceInteraction}
                  gridClassName="grid grid-cols-1 gap-2 px-4"
                />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="pointer-events-none absolute inset-0 z-0">
              <div
                ref={gridRef}
                className="hero-grid absolute inset-0 z-[1] opacity-0"
                aria-hidden
              />
              <div className="absolute inset-0 z-0">
                <HeroCanvas
                  scrollState={scrollState.current}
                  pointer={pointer.current}
                  dpr={dpr}
                  viewport={viewport}
                  serviceInteraction={serviceInteraction}
                />
              </div>
            </div>

            <div className="relative z-10 flex min-h-[100dvh] h-auto flex-col px-4 sm:px-10 lg:px-16">
              <header className="flex shrink-0 items-center justify-between py-4 sm:py-8">
                <span className="font-mono text-[9px] uppercase tracking-[0.35em] text-bone/40 sm:text-[10px] sm:tracking-[0.4em]">
                  {brand.name}
                </span>
                <div className="flex items-center gap-4 sm:gap-6">
                  <SocialLinks />
                  <span className="hidden font-mono text-[10px] tracking-[0.25em] text-bone/25 md:block">
                    Scroll
                  </span>
                </div>
              </header>

              <div className="pointer-events-none absolute inset-x-0 top-[28%] flex -translate-y-1/2 justify-center px-4 sm:top-[34%] md:top-[38%]">
                <div className="max-w-4xl text-center">
                  <p className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-champagne/55 sm:mb-5 sm:text-[10px] sm:tracking-[0.35em]">
                    {hero.eyebrow}
                  </p>
                  <h1
                    ref={headlineRef}
                    className="text-3xl font-medium leading-[1.08] tracking-tighter text-bone break-words sm:text-5xl md:text-6xl lg:text-7xl"
                  >
                    {headlineWords.map((word, i) => (
                      <span
                        key={`${word}-${i}`}
                        className="inline-block overflow-hidden"
                      >
                        <span
                          data-word
                          className="inline-block will-change-transform"
                        >
                          {word}
                          {i < headlineWords.length - 1 ? "\u00A0" : ""}
                        </span>
                      </span>
                    ))}
                  </h1>
                  <p
                    ref={subRef}
                    className="mx-auto mt-4 max-w-md px-2 text-[12px] leading-relaxed text-bone/45 sm:mt-6 sm:text-[13px]"
                  >
                    {hero.subheading}
                  </p>
                </div>
              </div>

              <div
                ref={servicesRef}
                id="services"
                className="services-snap-scroll mt-auto w-full pb-2 sm:pb-6"
              >
                <ServicesGrid
                  serviceInteraction={serviceInteraction}
                  onInteractionPulse={onServiceInteraction}
                  gridClassName="origin-bottom scale-[0.98] grid grid-cols-1 gap-1.5 sm:grid-cols-2 sm:gap-1.5 lg:grid-cols-3 lg:gap-1.5"
                />
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
