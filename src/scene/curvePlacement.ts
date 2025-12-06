import * as THREE from 'three';

// Exact radius from the target code
export const GLOBE_RADIUS = 35;

/**
 * Places an object on the rotating world group based on angle (scroll position) 
 * and side offset (left/right).
 */
export function placeObjectOnWorld(
  worldGroup: THREE.Group,
  obj: THREE.Object3D, 
  angle: number, 
  side: number, 
  radiusOffset: number = 0
) {
  const pivot = new THREE.Object3D();
  
  // Calculate lateral offset angle (distance from center line)
  const offsetAngle = (radiusOffset / GLOBE_RADIUS) * side;
  
  // Rotation X = Position along the scroll
  // Rotation Z = Position left/right of center
  pivot.rotation.x = -angle; 
  pivot.rotation.z = -offsetAngle;

  // Place object on surface
  obj.position.y = GLOBE_RADIUS - 0.5;
  
  // Orient object to face correct direction
  obj.rotation.y = (side * -Math.PI / 2);

  pivot.add(obj);
  worldGroup.add(pivot);
}