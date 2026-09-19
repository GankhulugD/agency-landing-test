"use client";

import { HeroModels } from "./HeroModels";
import type {
  MorphUniforms,
  Pointer,
  ServiceInteraction,
  ViewportProfile,
} from "./types";
import type { RefObject } from "react";

export type { MorphUniforms } from "./types";

/** GLTF black hole ↔ compass cross-fade driven by GSAP scroll.morph */
export function CosmicMorph({
  scroll,
  pointer,
  viewport,
  serviceInteraction,
}: {
  scroll: MorphUniforms;
  pointer: Pointer;
  viewport: ViewportProfile;
  serviceInteraction: RefObject<ServiceInteraction>;
}) {
  return (
    <HeroModels
      scroll={scroll}
      pointer={pointer}
      viewport={viewport}
      serviceInteraction={serviceInteraction}
    />
  );
}
