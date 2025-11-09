import * as THREE from 'three';

export function createHorseAndChariot() {
  const group = new THREE.Group();

  const horse = createHorse();
  horse.position.z = 1.5;

  const chariot = createChariot();

  group.add(horse);
  group.add(chariot);

  const harnessMat = new THREE.MeshStandardMaterial({
    color: 0x5d4037,
    roughness: 0.6,
  });
  const harnessGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.5, 6);

  const harness1 = new THREE.Mesh(harnessGeo, harnessMat);
  harness1.position.set(0.3, 0.4, 0.25);
  harness1.rotation.x = Math.PI / 2;
  group.add(harness1);

  const harness2 = new THREE.Mesh(harnessGeo, harnessMat);
  harness2.position.set(-0.3, 0.4, 0.25);
  harness2.rotation.x = Math.PI / 2;
  group.add(harness2);

  // --- 1. MAKE IT BIGGER ---
  // Scale the entire group up by 30%
  group.scale.set(1.3, 1.3, 1.3);
  // -------------------------

  // --- Rotate the entire group 180 degrees around the Y-axis
  group.rotation.y = Math.PI;

  return group;
}

function createHorse() {
  const group = new THREE.Group();

  // --- For more realism, you would use a TextureLoader ---
  // const textureLoader = new THREE.TextureLoader();
  // const horseTexture = textureLoader.load('path/to/horse_skin.jpg');
  // const horseRoughness = textureLoader.load('path/to/horse_roughness.jpg');
  // --------------------------------------------------------

  const brownMat = new THREE.MeshStandardMaterial({
    color: 0x6d4c41,
    roughness: 0.6,
    // map: horseTexture,
    // roughnessMap: horseRoughness
  });

  // Material for mane and tail
  const maneMat = new THREE.MeshStandardMaterial({
    color: 0x222222,
    roughness: 0.8,
  });

  const bodyGeo = new THREE.BoxGeometry(0.5, 1, 1.5);
  const body = new THREE.Mesh(bodyGeo, brownMat);
  body.position.y = 0.7;
  body.castShadow = true;
  group.add(body);

  // --- 2. MORE REALISTIC HORSE SHAPES ---
  // Tapered neck
  const neckGeo = new THREE.BoxGeometry(0.25, 0.7, 0.4);
  const neck = new THREE.Mesh(neckGeo, brownMat);
  neck.position.set(0, 1.1, 0.5);
  neck.rotation.x = -Math.PI / 6;
  neck.castShadow = true;
  group.add(neck);

  // Tapered head (snout)
  const headGeo = new THREE.BoxGeometry(0.3, 0.35, 0.7);
  const head = new THREE.Mesh(headGeo, brownMat);
  head.position.set(0, 1.35, 0.85);
  head.castShadow = true;
  group.add(head);

  // Add Mane
  const maneGeo = new THREE.BoxGeometry(0.1, 0.8, 0.3);
  const mane = new THREE.Mesh(maneGeo, maneMat);
  mane.position.set(0, 1.3, 0.6);
  mane.rotation.x = -Math.PI / 6;
  group.add(mane);

  // Add Tail
  const tailGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
  const tail = new THREE.Mesh(tailGeo, maneMat);
  tail.position.set(0, 0.8, -0.8);
  tail.rotation.x = Math.PI / 4;
  group.add(tail);
  // ----------------------------------------

  const earGeo = new THREE.ConeGeometry(0.08, 0.2, 4);
  const ear1 = new THREE.Mesh(earGeo, brownMat);
  ear1.position.set(0.15, 1.55, 0.8); // Adjusted Y
  group.add(ear1);

  const ear2 = new THREE.Mesh(earGeo, brownMat);
  ear2.position.set(-0.15, 1.55, 0.8); // Adjusted Y
  group.add(ear2);

  const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.7, 6);

  const leg1 = new THREE.Mesh(legGeo, brownMat);
  leg1.position.set(0.2, 0.35, 0.5);
  leg1.castShadow = true;
  group.add(leg1);

  const leg2 = new THREE.Mesh(legGeo, brownMat);
  leg2.position.set(-0.2, 0.35, 0.5);
  leg2.castShadow = true;
  group.add(leg2);

  const leg3 = new THREE.Mesh(legGeo, brownMat);
  leg3.position.set(0.2, 0.35, -0.5);
  leg3.castShadow = true;
  group.add(leg3);

  const leg4 = new THREE.Mesh(legGeo, brownMat);
  leg4.position.set(-0.2, 0.35, -0.5);
  leg4.castShadow = true;
  group.add(leg4);

  return group;
}

function createChariot() {
  const group = new THREE.Group();

  // --- For more realism, you would use a TextureLoader ---
  // const textureLoader = new THREE.TextureLoader();
  // const woodTexture = textureLoader.load('path/to/wood.jpg');
  // const woodNormalMap = textureLoader.load('path/to/wood_normal.jpg');
  // --------------------------------------------------------

  const woodMat = new THREE.MeshStandardMaterial({
    color: 0x8d6e63,
    roughness: 0.6,
    // map: woodTexture,
    // normalMap: woodNormalMap
  });

  // --- 3. MORE REALISTIC CHARIOT MATERIALS ---
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.4,
    metalness: 0.6,
  });

  const spokeMat = new THREE.MeshStandardMaterial({
    color: 0x3e2723,
    roughness: 0.5,
  });
  // -------------------------------------------

  const baseGeo = new THREE.BoxGeometry(1.2, 0.2, 1);
  const base = new THREE.Mesh(baseGeo, woodMat);
  base.position.set(0, 0.5, -1);
  base.castShadow = true;
  group.add(base);

  const wallGeo = new THREE.BoxGeometry(1.2, 0.6, 0.1);
  const frontWall = new THREE.Mesh(wallGeo, woodMat);
  frontWall.position.set(0, 0.8, -0.55);
  frontWall.castShadow = true;
  group.add(frontWall);

  const sideWallGeo = new THREE.BoxGeometry(0.1, 0.6, 1);
  const leftWall = new THREE.Mesh(sideWallGeo, woodMat);
  leftWall.position.set(0.55, 0.8, -1);
  leftWall.castShadow = true;
  group.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeo, woodMat);
  rightWall.position.set(-0.55, 0.8, -1);
  rightWall.castShadow = true;
  group.add(rightWall);

  // --- 4. MORE REALISTIC WHEELS ---
  // Use a Torus for the rim
  const wheelGeo = new THREE.TorusGeometry(0.4, 0.04, 12, 32);

  const wheel1 = new THREE.Mesh(wheelGeo, rimMat);
  wheel1.rotation.y = Math.PI / 2; // Rotate torus to be vertical
  wheel1.position.set(0.65, 0.5, -1);
  wheel1.castShadow = true;
  group.add(wheel1);

  const wheel2 = new THREE.Mesh(wheelGeo, rimMat);
  wheel2.rotation.y = Math.PI / 2; // Rotate torus to be vertical
  wheel2.position.set(-0.65, 0.5, -1);
  wheel2.castShadow = true;
  group.add(wheel2);

  // Use thin Cylinders for spokes
  const spokeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);

  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4;
    const spoke1 = new THREE.Mesh(spokeGeo, spokeMat);
    spoke1.position.set(0.65, 0.5, -1);
    spoke1.rotation.z = angle; // Fan the spokes out
    group.add(spoke1);

    const spoke2 = new THREE.Mesh(spokeGeo, spokeMat);
    spoke2.position.set(-0.65, 0.5, -1);
    spoke2.rotation.z = angle; // Fan the spokes out
    group.add(spoke2);
  }
  // ----------------------------------

  return group;
}