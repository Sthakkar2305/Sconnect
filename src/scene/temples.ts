import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createTemples(scene: THREE.Scene) {
  // Main Temple Cluster (About Section)
  const templePositions = [
    { x: 25, z: -100 },
    { x: -25, z: -105 },
    { x: 28, z: -130 },
    { x: -28, z: -135 },
    { x: 25, z: -160 },
    { x: -25, z: -165 },
    { x: 28, z: -190 },
    { x: -28, z: -195 },
  ];

  templePositions.forEach((pos, index) => {
    const temple = createSingleTemple();
    placeOnGlobe(temple, pos.x, pos.z, 0);
    // Slight rotation variations
    temple.rotateY(index % 2 === 0 ? -Math.PI / 6 : Math.PI / 6);
    scene.add(temple);
  });

  // Extra Temples scattered elsewhere on the globe (Filling empty space)
  for (let i = 0; i < 6; i++) {
     const z = -600 - (i * 80); // Far side of the world
     const x = (i % 2 === 0 ? 1 : -1) * 30;
     const temple = createSingleTemple();
     // Make these slightly smaller
     temple.scale.set(0.8, 0.8, 0.8);
     placeOnGlobe(temple, x, z, 0);
     scene.add(temple);
  }
}

// ... (Rest of createSingleTemple function stays exactly the same) ...
// Copy the createSingleTemple function and Mesh class from your previous file here.
function createSingleTemple() {
  const templeGroup = new THREE.Group();

  const stoneMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.8, metalness: 0.1 });
  const stoneMatDark = new THREE.MeshStandardMaterial({ color: 0xc49b6b, roughness: 0.7 });
  const goldMat = new THREE.MeshStandardMaterial({ color: 0xffe066, metalness: 0.8, roughness: 0.3 });
  const redMat = new THREE.MeshStandardMaterial({ color: 0xcc3300, roughness: 0.6, side: THREE.DoubleSide });

  const platform1Geo = new THREE.BoxGeometry(18, 1, 14);
  const platform1 = new THREE.Mesh(platform1Geo, stoneMat);
  platform1.position.y = 0.5;
  platform1.castShadow = true;
  platform1.receiveShadow = true;
  templeGroup.add(platform1);

  const platform2Geo = new THREE.BoxGeometry(16, 1, 12);
  const platform2 = new THREE.Mesh(platform2Geo, stoneMatDark);
  platform2.position.y = 1.5;
  platform2.castShadow = true;
  platform2.receiveShadow = true;
  templeGroup.add(platform2);

  const stepsGeo = new THREE.BoxGeometry(6, 0.3, 0.8);
  for (let i = 0; i < 5; i++) {
    const step = new THREE.Mesh(stepsGeo, stoneMat);
    step.position.set(0, 0.15 + i * 0.3, 6 + i * 0.4);
    step.castShadow = true;
    step.receiveShadow = true;
    templeGroup.add(step);
  }

  const pillarHeight = 7;
  const pillarGeo = new THREE.BoxGeometry(0.8, pillarHeight, 0.8);
  const capitalGeo = new THREE.BoxGeometry(1, 0.5, 1);
  const pillarPositions = [{ x: 6, z: 4 }, { x: -6, z: 4 }, { x: 6, z: -1 }, { x: -6, z: -1 }];

  pillarPositions.forEach((pos) => {
    const pillar = new THREE.Mesh(pillarGeo, stoneMat);
    pillar.position.set(pos.x, 2 + pillarHeight / 2, pos.z);
    pillar.castShadow = true;
    templeGroup.add(pillar);
    const capital = new THREE.Mesh(capitalGeo, stoneMatDark);
    capital.position.set(pos.x, 2 + pillarHeight + 0.25, pos.z);
    capital.castShadow = true;
    templeGroup.add(capital);
  });

  const mandapaRoofGeo = new THREE.BoxGeometry(14, 0.5, 7);
  const mandapaRoof = new THREE.Mesh(mandapaRoofGeo, stoneMatDark);
  mandapaRoof.position.set(0, 2 + pillarHeight + 0.5 + 0.25, 1.5);
  mandapaRoof.castShadow = true;
  templeGroup.add(mandapaRoof);

  const garbhagrihaGeo = new THREE.BoxGeometry(10, 7.5, 8);
  const garbhagriha = new THREE.Mesh(garbhagrihaGeo, stoneMat);
  garbhagriha.position.set(0, 2 + 7.5 / 2, -4);
  garbhagriha.castShadow = true;
  templeGroup.add(garbhagriha);

  const doorFrameGeo = new THREE.BoxGeometry(2.4, 3.4, 0.2);
  const doorFrame = new THREE.Mesh(doorFrameGeo, goldMat);
  doorFrame.position.set(0, 2 + 1.7, 0.05);
  templeGroup.add(doorFrame);
  const doorGeo = new THREE.BoxGeometry(2, 3, 0.2);
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
  const door = new THREE.Mesh(doorGeo, doorMat);
  door.position.set(0, 2 + 1.5, 0.1);
  templeGroup.add(door);

  const shikharaGroup = new THREE.Group();
  shikharaGroup.position.set(0, 9.5, -4);
  templeGroup.add(shikharaGroup);

  const layer1Geo = new THREE.CylinderGeometry(3, 4, 3, 8);
  const layer1 = new THREE.Mesh(layer1Geo, stoneMat);
  layer1.position.y = 1.5;
  shikharaGroup.add(layer1);
  const layer2Geo = new THREE.CylinderGeometry(2, 3, 3, 8);
  const layer2 = new Mesh(layer2Geo, stoneMat);
  layer2.position.y = 4.5;
  shikharaGroup.add(layer2);
  const layer3Geo = new THREE.CylinderGeometry(1, 2, 2, 8);
  const layer3 = new THREE.Mesh(layer3Geo, stoneMat);
  layer3.position.y = 6.5;
  shikharaGroup.add(layer3);

  const amalakaGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.4, 16);
  const amalaka = new THREE.Mesh(amalakaGeo, stoneMatDark);
  amalaka.position.y = 7.7;
  shikharaGroup.add(amalaka);

  const kalashaBaseGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.2, 12);
  const kalashaBase = new THREE.Mesh(kalashaBaseGeo, goldMat);
  kalashaBase.position.y = 8;
  shikharaGroup.add(kalashaBase);
  const kalashaPotGeo = new THREE.SphereGeometry(0.7, 16, 16);
  const kalashaPot = new THREE.Mesh(kalashaPotGeo, goldMat);
  kalashaPot.position.y = 8 + 0.7;
  shikharaGroup.add(kalashaPot);
  const kalashaTopGeo = new THREE.ConeGeometry(0.2, 0.5, 8);
  const kalashaTop = new THREE.Mesh(kalashaTopGeo, goldMat);
  kalashaTop.position.y = 8.7 + 0.25;
  shikharaGroup.add(kalashaTop);

  const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3, 8);
  const pole = new THREE.Mesh(poleGeo, goldMat);
  pole.position.set(0, 9.5 + 8.95 + 1.5, -4);
  templeGroup.add(pole);

  const flagGeo = new THREE.PlaneGeometry(0.8, 0.5);
  const flag = new THREE.Mesh(flagGeo, redMat);
  flag.position.set(0.4, 9.5 + 8.95 + 3 - 0.25, -4);
  templeGroup.add(flag);

  return templeGroup;
}
class Mesh extends THREE.Mesh { }
