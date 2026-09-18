"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import type { MorphUniforms, Pointer, ViewportProfile } from "./types";

const CHAMPAGNE = "#d1c7bd";
const BH_R = 0.56;
const LENS_R = 1.12;
const LENS_TUBE = 0.008;

function setGroupFade(group: THREE.Group, scale: number, opacity: number) {
  group.scale.setScalar(scale);
  group.visible = opacity > 0.01;
  group.traverse((obj) => {
    if (!(obj instanceof THREE.Mesh)) return;
    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
    mats.forEach((mat) => {
      if (!mat || mat instanceof THREE.ShaderMaterial) return;
      const base =
        (mat.userData.baseOpacity as number | undefined) ?? 1;
      mat.transparent = base < 1 || opacity < 1;
      mat.opacity = base * opacity;
      mat.depthWrite = opacity > 0.5 && base > 0.5;
    });
  });
}

/* ─── Image 3 black hole: void + horizontal disk + vertical lens halo ─── */

function BlackHoleModel({ scroll }: { scroll: MorphUniforms }) {
  const groupRef = useRef<THREE.Group>(null);
  const diskRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const m = scroll.morph;
    const fadeOut = 1 - THREE.MathUtils.smoothstep(m, 0.28, 0.55);
    const scale = THREE.MathUtils.lerp(
      1,
      0.35,
      THREE.MathUtils.smoothstep(m, 0, 0.55)
    );

    if (groupRef.current) {
      setGroupFade(groupRef.current, scale, fadeOut);
      groupRef.current.rotation.y = t * 0.035;
    }
    if (diskRef.current) {
      diskRef.current.rotation.z = t * 0.06;
    }
  });

  const glowMat = {
    color: CHAMPAGNE,
    emissive: "#e8d3b7",
    emissiveIntensity: 0.74,
    metalness: 0.4,
    roughness: 0.2,
    toneMapped: false as const,
  };

  const lensArchMat = {
    color: CHAMPAGNE,
    emissive: "#fff4e8",
    emissiveIntensity: 0.54,
    metalness: 0.3,
    roughness: 0.18,
    transparent: true,
    opacity: 0.63,
    toneMapped: false as const,
  };

  return (
    <group ref={groupRef}>
      <pointLight
        position={[0, 0, 0]}
        intensity={2.45}
        color="#e8d3b7"
        distance={5}
        decay={2}
      />

      {/* Thin horizontal accretion disk */}
      <group ref={diskRef} rotation={[1.12, 0.06, 0]} renderOrder={2}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.18, 0.022, 16, 128]} />
          <meshStandardMaterial {...glowMat} transparent opacity={0.84} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.18, 0.038, 12, 128]} />
          <meshBasicMaterial
            color="#fff8f0"
            transparent
            opacity={0.31}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.78, 0.014, 12, 96]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.48}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Vertical lens halo — thin wide arcs behind the void (no center fill) */}
      <group renderOrder={1}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[LENS_R, LENS_TUBE, 32, 160, Math.PI * 0.94]}
          />
          <meshStandardMaterial {...lensArchMat} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry
            args={[LENS_R, LENS_TUBE * 1.6, 24, 160, Math.PI * 0.94]}
          />
          <meshBasicMaterial
            color="#e2d4c1"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, Math.PI]}>
          <torusGeometry
            args={[LENS_R, LENS_TUBE, 32, 160, Math.PI * 0.94]}
          />
          <meshStandardMaterial {...lensArchMat} depthWrite={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, Math.PI]}>
          <torusGeometry
            args={[LENS_R, LENS_TUBE * 1.6, 24, 160, Math.PI * 0.94]}
          />
          <meshBasicMaterial
            color="#e2d4c1"
            transparent
            opacity={0.16}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Subtle outer refraction ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]} renderOrder={0}>
        <torusGeometry args={[1.32, 0.022, 16, 128]} />
        <MeshTransmissionMaterial
          backside
          samples={6}
          resolution={384}
          transmission={0.94}
          thickness={0.35}
          roughness={0.1}
          ior={1.15}
          chromaticAberration={0.03}
          color="#e0e6ed"
          background={new THREE.Color("#080808")}
        />
      </mesh>

      {/* Event horizon — opaque void drawn last, always crisp */}
      <mesh renderOrder={20}>
        <sphereGeometry args={[BH_R, 64, 64]} />
        <meshBasicMaterial
          color="#000000"
          toneMapped={false}
          depthWrite
          depthTest
        />
      </mesh>
    </group>
  );
}

/* ─── Needle only inside crystal glass sphere ─── */

const NEEDLE_HALF = 0.37;
const NEEDLE_RADIUS = 0.066;

function CompassNeedle({ pointer }: { pointer: Pointer }) {
  const needleRef = useRef<THREE.Group>(null);
  const spring = useRef({ y: 0, x: 0, vy: 0, vx: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (!needleRef.current) return;

    const targetY = pointer.x * 0.45;
    const targetX = pointer.y * 0.1;
    spring.current.vy += (targetY - spring.current.y) * 0.065;
    spring.current.vx += (targetX - spring.current.x) * 0.065;
    spring.current.vy *= 0.82;
    spring.current.vx *= 0.82;
    spring.current.y += spring.current.vy;
    spring.current.x += spring.current.vx;

    needleRef.current.rotation.z =
      spring.current.y + Math.sin(t * 0.85) * 0.022;
    needleRef.current.rotation.x = spring.current.x;
    needleRef.current.position.y = Math.sin(t * 0.55) * 0.025;
  });

  return (
    <group ref={needleRef}>
      {/* Pivot — dead center */}
      <mesh>
        <sphereGeometry args={[0.034, 20, 20]} />
        <meshStandardMaterial
          color="#b8b8b8"
          metalness={0.75}
          roughness={0.25}
        />
      </mesh>

      {/* Gold north — sharp cone pointing up from center */}
      <mesh position={[0, NEEDLE_HALF / 2, 0]}>
        <coneGeometry args={[NEEDLE_RADIUS, NEEDLE_HALF, 4]} />
        <meshStandardMaterial
          color="#c5a059"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>

      {/* Silver south — sharp cone pointing down from center */}
      <mesh position={[0, -NEEDLE_HALF / 2, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[NEEDLE_RADIUS, NEEDLE_HALF, 4]} />
        <meshStandardMaterial
          color="#e0e0e0"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
}

function CompassModel({
  scroll,
  pointer,
}: {
  scroll: MorphUniforms;
  pointer: Pointer;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const glassMat = useRef(
    (() => {
      const mat = new THREE.MeshPhysicalMaterial({
        transparent: true,
        opacity: 0.12,
        roughness: 0.02,
        metalness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        transmission: 0.98,
        ior: 1.05,
        color: "#ffffff",
        depthWrite: false,
        envMapIntensity: 0.18,
      });
      mat.userData.baseOpacity = 0.12;
      return mat;
    })()
  );

  useFrame((state) => {
    const m = scroll.morph;
    const t = state.clock.elapsedTime;
    const fadeIn = THREE.MathUtils.smoothstep(m, 0.35, 0.62);
    const scale = THREE.MathUtils.lerp(0.4, 1, fadeIn);

    if (groupRef.current) {
      setGroupFade(groupRef.current, scale, fadeIn);
      groupRef.current.rotation.y = t * 0.02 * fadeIn;
      groupRef.current.position.y = Math.sin(t * 0.45) * 0.03 * fadeIn;
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <CompassNeedle pointer={pointer} />

      {/* Ultra-thin crystal bubble — barely visible shell */}
      <mesh renderOrder={2}>
        <sphereGeometry args={[1.55, 64, 64]} />
        <primitive object={glassMat.current} attach="material" />
      </mesh>
    </group>
  );
}

export function HeroModels({
  scroll,
  pointer,
  viewport,
}: {
  scroll: MorphUniforms;
  pointer: Pointer;
  viewport: ViewportProfile;
}) {
  const rootRef = useRef<THREE.Group>(null);

  useFrame(() => {
    const settle = THREE.MathUtils.smoothstep(scroll.ui, 0, 1);
    if (rootRef.current) {
      const settleX = viewport.isMobile ? 0.9 : 1.8;
      rootRef.current.position.x = THREE.MathUtils.lerp(0, settleX, settle);
      rootRef.current.rotation.y = settle * 0.18;
    }
  });

  return (
    <group
      ref={rootRef}
      scale={viewport.sceneScale}
      position={[0, viewport.sceneYOffset, 0]}
    >
      <BlackHoleModel scroll={scroll} />
      <CompassModel scroll={scroll} pointer={pointer} />
    </group>
  );
}
