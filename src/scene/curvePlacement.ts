import * as THREE from 'three';

// --- GLOBE SETTINGS ---
// REDUCED from 200 to 120 to make the street smaller and tighter
export const GLOBE_RADIUS = 120;

/**
 * Maps a "Flat" (Linear) position to a position on the Globe.
 */
export function getGlobePosition(
  x: number,
  z: number,
  heightFromSurface: number = 0
): { position: THREE.Vector3, rotation: THREE.Quaternion } {

  const theta = -z / GLOBE_RADIUS; 
  const phi = (Math.PI / 2) - (x / GLOBE_RADIUS); 

  const r = GLOBE_RADIUS + heightFromSurface;

  const rawPosition = new THREE.Vector3();
  rawPosition.setFromSphericalCoords(r, phi, theta);

  // ROTATE TO "Y POSE"
  rawPosition.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

  const dummy = new THREE.Object3D();
  dummy.position.copy(rawPosition);

  dummy.up.set(1, 0, 0);

  dummy.lookAt(0, 0, 0); 
  dummy.rotateX(-Math.PI / 2); 
  dummy.rotateY(Math.PI); 

  return { position: dummy.position, rotation: dummy.quaternion };
}

export function placeOnGlobe(
  obj: THREE.Object3D,
  x: number,
  z: number,
  heightFromSurface: number = 0
) {
  const { position, rotation } = getGlobePosition(x, z, heightFromSurface);
  obj.position.copy(position);
  obj.quaternion.copy(rotation);
}