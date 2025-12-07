import * as THREE from 'three';
import { GLOBE_RADIUS } from './curvePlacement';

export function createGround(worldGroup: THREE.Group) {
  const canvas = document.createElement('canvas');
  // High resolution for clean transition
  canvas.width = 128;
  canvas.height = 2048;
  const ctx = canvas.getContext('2d');

  if (ctx) {
    const w = 128;
    const h = 2048;

    // --- UNIFIED HIGHWAY ROAD ---
    // Fill the entire length with Asphalt color
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(0, 0, w, h);

    // Asphalt Noise (Increased count to cover the larger area)
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#3a3a3a' : '#1a1a1a';
      const x = Math.random() * w;
      const y = Math.random() * h;
      ctx.fillRect(x, y, 2, 2);
    }
  }

  // --- CHANGES FOR ground.ts ---

  // ... (Canvas creation)
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // New: Use mipmaps for better quality when viewed from a distance
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = THREE.RepeatWrapping;
  // ...

  tex.offset.y = 0.0;

  const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
  const sphereMat = new THREE.MeshPhongMaterial({
    map: tex,
    shininess: 5,
    flatShading: false
  });

  const worldSphere = new THREE.Mesh(sphereGeo, sphereMat);
  worldSphere.rotation.y = -Math.PI / 2;
  worldSphere.rotation.z = Math.PI / 2;
  worldSphere.receiveShadow = true;
  worldGroup.add(worldSphere);
}