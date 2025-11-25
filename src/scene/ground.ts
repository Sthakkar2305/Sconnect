import * as THREE from 'three';
import { GLOBE_RADIUS } from './curvePlacement';

export function createGround(scene: THREE.Scene) {
  // --- 1. THE GLOBE (Planet Surface) ---
  const globeGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3a5f3a, // Deep Greenish ground
    roughness: 0.9
  });

  const globe = new THREE.Mesh(globeGeo, groundMat);

  // ROTATION: Rotate globe to match the Vertical "Y Pose"
  globe.rotation.z = Math.PI / 2;

  globe.receiveShadow = true;
  scene.add(globe);

  // --- 2. THE ROAD (Asphalt Ring) ---
  const roadWidth = 14;
  const phiLength = roadWidth / GLOBE_RADIUS;
  const phiStart = (Math.PI / 2) - (phiLength / 2);

  // Generate strip
  const roadGeo = new THREE.SphereGeometry(
    GLOBE_RADIUS + 0.1, // Slightly above ground
    128, 8,             // High segments for smoothness
    0, Math.PI * 2,     // Full circle length
    phiStart, phiLength // Strip width
  );

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x3a3a3a,
    roughness: 0.8,
    side: THREE.DoubleSide // Ensure visibility from all angles
  });

  const road = new THREE.Mesh(roadGeo, roadMat);

  // ROTATION: Stand the road up vertically
  road.rotation.z = Math.PI / 2;

  road.receiveShadow = true;
  scene.add(road);

  // --- 3. CENTER LINE (Yellow Dashed Strip) ---
  const lineWidth = 0.3;
  const linePhiLength = lineWidth / GLOBE_RADIUS;
  const linePhiStart = (Math.PI / 2) - (linePhiLength / 2);

  const lineGeo = new THREE.SphereGeometry(
    GLOBE_RADIUS + 0.15, 128, 2, 0, Math.PI * 2, linePhiStart, linePhiLength
  );

  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const centerLine = new THREE.Mesh(lineGeo, lineMat);

  // ROTATION: Stand the line up vertically
  centerLine.rotation.z = Math.PI / 2;

  scene.add(centerLine);
}