import * as THREE from 'three';

export function createTemples(scene: THREE.Scene) {
  // These positions are still good, the new temples will fit.
  const templePositions = [
    { x: 18, z: -100 }, // Moved x slightly for more space
    { x: -18, z: -105 }, // Moved x slightly for more space
    { x: 19, z: -130 },
    { x: -19, z: -135 },
    { x: 18, z: -160 },
    { x: -18, z: -165 },
    { x: 20, z: -190 },
    { x: -20, z: -195 },
  ];

  templePositions.forEach((pos, index) => {
    // We pass the index to createSingleTemple to vary rotation
    const temple = createSingleTemple();
    temple.position.set(pos.x, 0, pos.z);
    // Keep the original rotation logic
    temple.rotation.y = index % 2 === 0 ? -Math.PI / 6 : Math.PI / 6;
    scene.add(temple);
  });
}

/**
 * Creates a single, more realistic Hindu temple structure.
 */
function createSingleTemple() {
  const templeGroup = new THREE.Group();

  // --- Materials ---
  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xd4a574, // Sandstone color
    roughness: 0.8,
    metalness: 0.1,
  });

  const stoneMatDark = new THREE.MeshStandardMaterial({
    color: 0xc49b6b, // Darker stone for contrast
    roughness: 0.7,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffe066, // Bright gold
    metalness: 0.8,
    roughness: 0.3,
  });

  const redMat = new THREE.MeshStandardMaterial({
    color: 0xcc3300, // Saffron/Red
    roughness: 0.6,
    side: THREE.DoubleSide,
  });

  // --- 1. Base (Adhishthana) ---
  // A wide, multi-level platform
  const platform1Geo = new THREE.BoxGeometry(18, 1, 14);
  const platform1 = new THREE.Mesh(platform1Geo, stoneMat);
  platform1.position.y = 0.5;
  platform1.castShadow = true;
  platform1.receiveShadow = true;
  templeGroup.add(platform1);

  const platform2Geo = new THREE.BoxGeometry(16, 1, 12);
  const platform2 = new THREE.Mesh(platform2Geo, stoneMatDark);
  platform2.position.y = 1.5; // Sits on top of platform1
  platform2.castShadow = true;
  platform2.receiveShadow = true;
  templeGroup.add(platform2);
  // Main temple floor is at y = 2

  // --- 2. Steps ---
  const stepsGeo = new THREE.BoxGeometry(6, 0.3, 0.8);
  for (let i = 0; i < 5; i++) {
    const step = new THREE.Mesh(stepsGeo, stoneMat);
    // Place steps at the front (positive z)
    step.position.set(0, 0.15 + i * 0.3, 6 + i * 0.4);
    step.castShadow = true;
    step.receiveShadow = true;
    templeGroup.add(step);
  }

  // --- 3. Pillared Hall (Mandapa) ---
  const pillarHeight = 7;
  const pillarGeo = new THREE.BoxGeometry(0.8, pillarHeight, 0.8); // Square pillars
  const capitalGeo = new THREE.BoxGeometry(1, 0.5, 1); // Top of pillar

  const pillarPositions = [
    { x: 6, z: 4 },
    { x: -6, z: 4 }, // Front pillars
    { x: 6, z: -1 },
    { x: -6, z: -1 }, // Back pillars
  ];

  pillarPositions.forEach((pos) => {
    // Pillar
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(pos.x, 2 + pillarHeight / 2, pos.z);
    pillar.castShadow = true;
    templeGroup.add(pillar);

    // Capital
    const capital = new THREE.Mesh(capitalGeo, stoneMatDark);
    capital.position.set(pos.x, 2 + pillarHeight + 0.25, pos.z);
    capital.castShadow = true;
    templeGroup.add(capital);
  });

  // Mandapa Roof
  const mandapaRoofGeo = new THREE.BoxGeometry(14, 0.5, 7);
  const mandapaRoof = new THREE.Mesh(mandapaRoofGeo, stoneMatDark);
  // Place on top of capitals, centered on the pillar area
  mandapaRoof.position.set(0, 2 + pillarHeight + 0.5 + 0.25, 1.5);
  mandapaRoof.castShadow = true;
  templeGroup.add(mandapaRoof);

  // --- 4. Inner Sanctum (Garbhagriha) ---
  // This is the solid building the main tower sits on
  const garbhagrihaGeo = new THREE.BoxGeometry(10, 7.5, 8);
  const garbhagriha = new THREE.Mesh(garbhagrihaGeo, stoneMat);
  // Sits on the 2nd platform, behind the Mandapa
  garbhagriha.position.set(0, 2 + 7.5 / 2, -4);
  garbhagriha.castShadow = true;
  templeGroup.add(garbhagriha);

  // Doorway
  const doorFrameGeo = new THREE.BoxGeometry(2.4, 3.4, 0.2);
  const doorFrame = new THREE.Mesh(doorFrameGeo, goldMat);
  // Place on the front face of the Garbhagriha (z = 0)
  doorFrame.position.set(0, 2 + 1.7, 0.05);
  templeGroup.add(doorFrame);

  const doorGeo = new THREE.BoxGeometry(2, 3, 0.2);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 2 + 1.5, 0.1);
  templeGroup.add(door);

  // --- 5. Main Tower (Shikhara) ---
  // A group to hold all the tower parts
  const shikharaGroup = new THREE.Group();
  // Place it on top of the Garbhagriha (which ends at y = 2 + 7.5 = 9.5)
  shikharaGroup.position.set(0, 9.5, -4);
  templeGroup.add(shikharaGroup);

  // Create a stacked, tapering tower
  const layer1Geo = new THREE.CylinderGeometry(3, 4, 3, 8); // Tapered
  const layer1 = new THREE.Mesh(layer1Geo, stoneMat);
  layer1.position.y = 1.5;
  shikharaGroup.add(layer1);

  const layer2Geo = new THREE.CylinderGeometry(2, 3, 3, 8);
  const layer2 = new THREE.Mesh(layer2Geo, stoneMat);
  layer2.position.y = 4.5; // On top of layer 1
  shikharaGroup.add(layer2);

  const layer3Geo = new THREE.CylinderGeometry(1, 2, 2, 8);
  const layer3 = new THREE.Mesh(layer3Geo, stoneMat);
  layer3.position.y = 6.5; // On top of layer 2
  shikharaGroup.add(layer3);

  // Amalaka (Circular capstone)
  const amalakaGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 16);
  const amalaka = new THREE.Mesh(amalakaGeo, stoneMatDark);
  amalaka.position.y = 7.7; // On top of layer 3
  shikharaGroup.add(amalaka);

  // --- 6. Golden Finial (Kalasha) ---
  // Sits on the Amalaka (which ends at y = 7.7 + 0.2 = 7.9)
  const kalashaBaseGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
  const kalashaBase = new THREE.Mesh(kalashaBaseGeo, goldMat);
  kalashaBase.position.y = 8;
  shikharaGroup.add(kalashaBase);

  const kalashaPotGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const kalashaPot = new THREE.Mesh(kalashaPotGeo, goldMat);
  kalashaPot.position.y = 8 + 0.7; // Sits on its base
  shikharaGroup.add(kalashaPot);

  const kalashaTopGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
  const kalashaTop = new THREE.Mesh(kalashaTopGeo, goldMat);
  kalashaTop.position.y = 8.7 + 0.25;
  shikharaGroup.add(kalashaTop);

  // --- 7. Temple Flag (Dhwaja) ---
  // Sits on top of the whole Shikhara (which ends at y ~ 9.5 + 9 = 18.5)
  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
  const pole = new THREE.Mesh(poleGeo, goldMat);
  pole.position.set(0, 9.5 + 8.95 + 1.5, -4);
  templeGroup.add(pole);

  const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
  const flag = new THREE.Mesh(flagGeo, redMat);
  // Position at top of pole
  flag.position.set(0.4, 9.5 + 8.95 + 3 - 0.25, -4);
  templeGroup.add(flag);

  return templeGroup;
}