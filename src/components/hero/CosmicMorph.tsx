"use client";

import { HeroModels } from "./HeroModels";
import type { MorphUniforms, Pointer, ViewportProfile } from "./types";

export type { MorphUniforms } from "./types";

/** GLTF black hole ↔ compass cross-fade driven by GSAP scroll.morph */
export function CosmicMorph({
  scroll,
  pointer,
  viewport,
}: {
  scroll: MorphUniforms;
  pointer: Pointer;
  viewport: ViewportProfile;
}) {
  return (
    <HeroModels scroll={scroll} pointer={pointer} viewport={viewport} />
  );
}
