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
};
