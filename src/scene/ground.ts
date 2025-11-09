import * as THREE from 'three';

export function createGround(scene: THREE.Scene) {
  // --- CHANGES ARE HERE ---
  // 1. Set a much longer length for the scene
  const groundLength = 400;

  // 2. Calculate the center point for the long ground
  // (Your scene goes from z=84 to z=-260, so the middle is ~-90)
  const groundCenterZ = -90;
  // -------------------------

  const groundMat = new THREE.MeshStandardMaterial({
    color: 0x3a8c3a,
    roughness: 0.8,
  });
  // Use the new groundLength
  const groundGeo = new THREE.PlaneGeometry(100, groundLength);
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  // Set the new center position
  ground.position.z = groundCenterZ;
  ground.receiveShadow = true;
  scene.add(ground);

  const roadMat = new THREE.MeshStandardMaterial({
    color: 0x444444,
    roughness: 0.7,
  });
  // Use the new groundLength
  const roadGeo = new THREE.PlaneGeometry(10, groundLength);
  const road = new THREE.Mesh(roadGeo, roadMat);
  road.rotation.x = -Math.PI / 2;
  // Set the new center position
  road.position.set(0, 0.02, groundCenterZ);
  road.receiveShadow = true;
  scene.add(road);

  const lineGeo = new THREE.PlaneGeometry(0.3, groundLength);
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xffff00 });
  const centerLine = new THREE.Mesh(lineGeo, lineMat);
  centerLine.rotation.x = -Math.PI / 2;
  // Set the new center position
  centerLine.position.set(0, 0.03, groundCenterZ);
  scene.add(centerLine);
}