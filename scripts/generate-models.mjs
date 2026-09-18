/**
 * Generates minimal GLB placeholders for Hero scene.
 * Run: node scripts/generate-models.mjs
 */
import { Blob } from "node:buffer";

if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        this.onload?.({ target: this });
        this.onloadend?.({ target: this });
      });
    }
    readAsDataURL() {}
  };
}
if (typeof globalThis.Blob === "undefined") {
  globalThis.Blob = Blob;
}

import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "../public/models");
fs.mkdirSync(outDir, { recursive: true });

const exporter = new GLTFExporter();

function exportGlb(scene, filename) {
  return new Promise((resolve, reject) => {
    exporter.parse(
      scene,
      (result) => {
        const buffer = result instanceof ArrayBuffer ? result : null;
        if (!buffer) {
          reject(new Error("Expected binary GLB output"));
          return;
        }
        fs.writeFileSync(path.join(outDir, filename), Buffer.from(buffer));
        resolve();
      },
      reject,
      { binary: true }
    );
  });
}

// Black hole — refraction lens torus (singularity added in R3F)
const bhScene = new THREE.Scene();
const bhGroup = new THREE.Group();
bhGroup.name = "BlackHole";
const lens = new THREE.Mesh(
  new THREE.TorusGeometry(1.02, 0.052, 32, 128),
  new THREE.MeshStandardMaterial({ color: "#c8c4be", metalness: 0.2, roughness: 0.15 })
);
lens.name = "LensRing";
lens.rotation.x = Math.PI / 2;
const rim = new THREE.Mesh(
  new THREE.TorusGeometry(1.08, 0.008, 8, 128),
  new THREE.MeshStandardMaterial({ color: "#d1c7bd", metalness: 0.9, roughness: 0.25 })
);
rim.name = "WhisperRim";
rim.rotation.x = Math.PI / 2;
bhGroup.add(lens, rim);
bhScene.add(bhGroup);

// Compass — outer glass shell (interior built in R3F)
const compassScene = new THREE.Scene();
const compassGroup = new THREE.Group();
compassGroup.name = "Compass";
const shell = new THREE.Mesh(
  new THREE.SphereGeometry(1.55, 64, 64),
  new THREE.MeshStandardMaterial({
    color: "#f0eeea",
    metalness: 0,
    roughness: 0.05,
    transparent: true,
    opacity: 0.15,
  })
);
shell.name = "GlassShell";
const outerRing = new THREE.Mesh(
  new THREE.TorusGeometry(1.05, 0.038, 24, 128),
  new THREE.MeshStandardMaterial({ color: "#1c1d21", metalness: 0.85, roughness: 0.18 })
);
outerRing.name = "OuterRing";
compassGroup.add(shell, outerRing);
compassScene.add(compassGroup);

await exportGlb(bhScene, "blackhole.glb");
await exportGlb(compassScene, "compass.glb");
console.log("Wrote public/models/blackhole.glb and compass.glb");
