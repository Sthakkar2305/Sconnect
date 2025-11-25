import * as THREE from 'three';

// --- GLOBE SETTINGS ---
export const GLOBE_RADIUS = 200;

/**
 * Maps a "Flat" (Linear) position to a position on the Globe.
 * @param x - Horizontal offset from the center of the road.
 * @param z - Distance along the road (Game Logic Z).
 * @param heightFromSurface - How high off the ground (default 0).
 */
export function getGlobePosition(
  x: number,
  z: number,
  heightFromSurface: number = 0
): { position: THREE.Vector3, rotation: THREE.Quaternion } {

  // 1. Spherical Math (Base: Horizontal Equatorial Band)
  const theta = -z / GLOBE_RADIUS; // FIX 1: Negative for correct direction
  const phi = (Math.PI / 2) - (x / GLOBE_RADIUS); // FIX 2: Minus instead of plus

  const r = GLOBE_RADIUS + heightFromSurface;

  // Calculate position as if it were a standard horizontal ring
  const rawPosition = new THREE.Vector3();
  rawPosition.setFromSphericalCoords(r, phi, theta);

  // 2. ROTATE TO "Y POSE" (Vertical Ring)
  // We rotate the result 90 degrees around the Z-axis.
  // This lifts the equatorial band from the X-Z plane into the Y-Z plane.
  // CHANGED: Use positive rotation to place objects at the TOP (North Pole) instead of Bottom.
  rawPosition.applyAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);

  // 3. Orientation Logic
  const dummy = new THREE.Object3D();
  dummy.position.copy(rawPosition);

  // CRITICAL FIX: Change the 'Up' reference for lookAt.
  // In a vertical Y-Z loop, the standard Y-up vector (0,1,0) becomes unstable 
  // (gimbal lock) at the top/bottom poles. 
  // We use X-up (1,0,0) which is perpendicular to our road plane, ensuring stability.
  dummy.up.set(1, 0, 0);

  dummy.lookAt(0, 0, 0); // Feet point to center
  dummy.rotateX(-Math.PI / 2); // Orient upright

  // --- ADD THIS LINE TO FLIP THE OBJECT'S FORWARD DIRECTION ---
  dummy.rotateY(Math.PI); // Rotate 180 degrees to face outward from the road

  return { position: dummy.position, rotation: dummy.quaternion };
}

/**
 * Helper to directly place an existing object onto the globe.
 */
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

// --- COMPATIBILITY HELPER ---
export function getRoadStateAtZ(z: number) {
  const { position, rotation } = getGlobePosition(0, z, 0);
  const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(rotation);
  return { position, tangent: forward, t: 0 };
}