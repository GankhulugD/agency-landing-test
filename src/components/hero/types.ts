export type MorphUniforms = { morph: number; ui: number };
export type Pointer = { x: number; y: number };

export type ViewportProfile = {
  isMobile: boolean;
  sceneScale: number;
  sceneYOffset: number;
  cameraZ: number;
  cameraY: number;
  lookAtY: number;
  starCount: number;
  /** Torus / ring radial segment count */
  ringSegments: number;
  /** Torus tube cross-section segments */
  tubeSegments: number;
  /** Sphere width/height segments */
  sphereSegments: number;
  enableBloom: boolean;
  enableTransmission: boolean;
  envIntensity: number;
};
