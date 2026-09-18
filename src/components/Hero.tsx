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
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Preload } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { CosmicMorph } from "@/components/hero/CosmicMorph";
import type { ViewportProfile } from "@/components/hero/types";
import { SocialLinks } from "@/components/SocialLinks";
import { brand, hero, services, type Service } from "@/lib/copy";
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

const defaultViewport: ViewportProfile = {
  isMobile: false,
  sceneScale: 1,
  sceneYOffset: 0,
  cameraZ: 5.2,
  cameraY: 0.55,
  lookAtY: 0,
  starCount: 2500,
};

const ViewportContext = createContext<ViewportProfile>(defaultViewport);
const useViewport = () => useContext(ViewportContext);

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
      starCount: 1200,
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
      starCount: 1800,
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
        dpr: reduced ? 1 : viewport.isMobile ? 1 : [1, 1.5],
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
  varying float vOpacity;

  void main() {
    vOpacity = aBaseOpacity * (0.55 + 0.45 * sin(uTime * 1.15 + aPhase));
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
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = t;
    }
    if (pointsRef.current) {
      pointsRef.current.position.y = Math.sin(t * 0.06) * 0.35;
      pointsRef.current.position.z = Math.cos(t * 0.045) * 0.5;
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
  const { camera } = useThree();

  useFrame(() => {
    const p = scroll.morph;
    const settle = THREE.MathUtils.smoothstep(scroll.ui, 0, 1);

    const radius = THREE.MathUtils.lerp(
      viewport.cameraZ,
      viewport.cameraZ - 0.6,
      settle
    );
    const height = THREE.MathUtils.lerp(viewport.cameraY, viewport.cameraY - 0.2, p);
    const offsetX = THREE.MathUtils.lerp(0, viewport.isMobile ? -0.25 : -0.6, settle);

    camera.position.set(offsetX, height, radius);
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

      <Environment preset="warehouse" environmentIntensity={0.38} />

      <CosmicStarfield starCount={viewport.starCount} />

      <CosmicMorph scroll={scroll} pointer={pointer} viewport={viewport} />

      <EffectComposer multisampling={0}>
        <Bloom
          intensity={bloomIntensity}
          luminanceThreshold={0.22}
          luminanceSmoothing={0.35}
          mipmapBlur
        />
      </EffectComposer>
    </>
  );
}

function HeroCanvas({
  scrollState,
  pointer,
  dpr,
  viewport,
}: {
  scrollState: ScrollState;
  pointer: { x: number; y: number };
  dpr: number | [number, number];
  viewport: ViewportProfile;
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
        <ScrollContext.Provider value={scrollState}>
          <PointerContext.Provider value={pointer}>
            <Suspense fallback={null}>
              <HeroScene />
              <Preload all />
            </Suspense>
          </PointerContext.Provider>
        </ScrollContext.Provider>
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
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMove);
    let id: number;
    const tick = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.11;
      pos.current.y += (target.current.y - pos.current.y) * 0.11;
      const t = `translate3d(${pos.current.x}px,${pos.current.y}px,0) translate(-50%,-50%)`;
      if (dotRef.current) dotRef.current.style.transform = t;
      if (ringRef.current) ringRef.current.style.transform = t;
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

function GlassCard({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-sm border border-white/[0.08] bg-white/[0.03] backdrop-blur-md",
        "transition-colors duration-700 hover:bg-white/[0.045]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function ServiceRow({ service }: { service: Service }) {
  return (
    <GlassCard
      data-service-card
      className="group flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:gap-8 sm:p-6"
    >
      <span className="font-mono text-[10px] tracking-[0.2em] text-champagne/70">
        {service.index}
      </span>
      <div className="flex-1">
        <h3 className="text-sm font-medium tracking-tight text-bone">
          {service.title}
        </h3>
        <p className="mt-1.5 text-[13px] leading-relaxed text-bone/45 transition-colors duration-500 group-hover:text-bone/60">
          {service.description}
        </p>
      </div>
    </GlassCard>
  );
}

function HeroFallback() {
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
        <div className="mt-12 grid grid-cols-1 gap-2 sm:mt-16 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <ServiceRow key={s.id} service={s} />
          ))}
        </div>
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

  useLayoutEffect(() => {
    if (fallback) return;

    const section = sectionRef.current;
    const headline = headlineRef.current;
    const sub = subRef.current;
    const grid = gridRef.current;
    const servicesEl = servicesRef.current;
    if (!section || !headline || !servicesEl) return;

    const words = headline.querySelectorAll<HTMLElement>("[data-word]");
    const cards = servicesEl.querySelectorAll("[data-service-card]");

    gsap.set(sub, { autoAlpha: 0.6 });
    gsap.set(grid, { autoAlpha: 0 });
    gsap.set(cards, { autoAlpha: 0, y: 28 });

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=90%",
          scrub: true,
          pin: true,
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
          y: 0,
          stagger: 0.03,
          duration: 0.1,
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
  }, [fallback]);

  if (fallback) return <HeroFallback />;

  const headlineWords = hero.headline.split(" ");

  return (
    <>
      {!viewport.isMobile && <CursorFollower />}

      <section
        ref={sectionRef}
        className="relative h-[100dvh] w-full overflow-hidden bg-obsidian"
        aria-label="Namoon Compass hero"
        onMouseMove={onPointerMove}
        onTouchMove={onTouchMove}
      >
        {/* Subtle editorial grid — revealed on scroll */}
        <div
          ref={gridRef}
          className="hero-grid pointer-events-none absolute inset-0 z-[1] opacity-0"
          aria-hidden
        />

        {/* WebGL — pointer-events-none so touch scroll is never blocked */}
        <div className="pointer-events-none absolute inset-0 z-0">
          <HeroCanvas
            scrollState={scrollState.current}
            pointer={pointer.current}
            dpr={dpr}
            viewport={viewport}
          />
        </div>

        {/* UI */}
        <div className="relative z-10 flex h-full flex-col px-4 sm:px-10 lg:px-16">
          {/* Header */}
          <header className="flex shrink-0 items-center justify-between py-5 sm:py-8">
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

          {/* Centered headline — initial state */}
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
                  <span key={`${word}-${i}`} className="inline-block overflow-hidden">
                    <span data-word className="inline-block will-change-transform">
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

          {/* Services — bottom, revealed on scroll end */}
          <div
            ref={servicesRef}
            id="services"
            className="mt-auto grid grid-cols-1 gap-2 pb-6 sm:grid-cols-2 sm:pb-10 lg:grid-cols-3 lg:gap-3"
          >
            {services.map((service) => (
              <ServiceRow key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
