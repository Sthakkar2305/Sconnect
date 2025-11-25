import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createTemples(scene: THREE.Scene) {
  // NEW POSITION: Z = -250
  const mainTempleZ = -250;

  const grandTemple = createRealisticTemple(1.2); 
  placeOnGlobe(grandTemple, -20, mainTempleZ, 0);
  grandTemple.rotateY(Math.PI / 4); 
  scene.add(grandTemple);

  const grandTemple2 = createRealisticTemple(1.2);
  placeOnGlobe(grandTemple2, 20, mainTempleZ - 15, 0);
  grandTemple2.rotateY(-Math.PI / 4);
  scene.add(grandTemple2);

  // Fill area around
  for (let i = 1; i <= 2; i++) {
    const offset = i * 30;
    const shrineL = createRealisticTemple(0.6);
    placeOnGlobe(shrineL, -22, mainTempleZ - offset, 0);
    scene.add(shrineL);

    const shrineR = createRealisticTemple(0.6);
    placeOnGlobe(shrineR, 22, mainTempleZ + offset, 0);
    scene.add(shrineR);
  }
}

// ... Copy the createRealisticTemple function from the previous response ...
function createRealisticTemple(scale: number) {
  const group = new THREE.Group();
  group.scale.set(scale, scale, scale);

  // Materials
  const sandstone = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness: 0.9 });
  const darkStone = new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.9 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xffd700, metalness: 0.6, roughness: 0.3 });

  // 1. BASE PLATFORM (Jagati)
  const baseGeo = new THREE.BoxGeometry(15, 2, 25);
  const base = new THREE.Mesh(baseGeo, sandstone);
  base.position.y = 1;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Stairs
  const stairGeo = new THREE.BoxGeometry(6, 1.5, 4);
  const stairs = new THREE.Mesh(stairGeo, darkStone);
  stairs.position.set(0, 0.75, 13.5); // Stick out front
  group.add(stairs);

  // 2. PILLARS HALL (Mandapa)
  const pillarGeo = new THREE.CylinderGeometry(0.4, 0.4, 4, 8);
  const mandapaRoofGeo = new THREE.ConeGeometry(5, 3, 4);
  
  // Place 4 corners of Mandapa
  const mandapaZ = 5;
  const positions = [
    {x: -3, z: 8}, {x: 3, z: 8},
    {x: -3, z: 2}, {x: 3, z: 2}
  ];

  positions.forEach(pos => {
    const p = new THREE.Mesh(pillarGeo, sandstone);
    p.position.set(pos.x, 3, pos.z);
    p.castShadow = true;
    group.add(p);
  });

  const mandapaRoof = new THREE.Mesh(mandapaRoofGeo, darkStone);
  mandapaRoof.position.set(0, 6.5, 5);
  mandapaRoof.rotation.y = Math.PI / 4; // Align square pyramid
  mandapaRoof.castShadow = true;
  group.add(mandapaRoof);

  // 3. MAIN TOWER (Shikhara/Vimana) - The tall part
  const towerBaseZ = -4;
  
  // Main body box
  const sanctumGeo = new THREE.BoxGeometry(8, 6, 8);
  const sanctum = new THREE.Mesh(sanctumGeo, sandstone);
  sanctum.position.set(0, 4, towerBaseZ);
  sanctum.castShadow = true;
  group.add(sanctum);

  // Tapering Tower layers
  let currentY = 7;
  let currentSize = 7;
  
  for(let i=0; i<5; i++) {
     const layerHeight = 2.5;
     // Trapezoid-ish effect using Cylinder with different top/bottom radius
     const layerGeo = new THREE.CylinderGeometry(currentSize - 1, currentSize, layerHeight, 4);
     const layer = new THREE.Mesh(layerGeo, sandstone);
     layer.position.set(0, currentY + layerHeight/2, towerBaseZ);
     layer.rotation.y = Math.PI/4; // Square alignment
     layer.castShadow = true;
     group.add(layer);

     currentY += layerHeight;
     currentSize -= 1.2;
  }

  // Amalaka (The ribbed disc on top)
  const amalakaGeo = new THREE.TorusGeometry(1.5, 0.8, 16, 32);
  const amalaka = new THREE.Mesh(amalakaGeo, darkStone);
  amalaka.rotation.x = Math.PI / 2;
  amalaka.position.set(0, currentY + 0.5, towerBaseZ);
  group.add(amalaka);

  // Kalasha (Gold Pot Finial)
  const kalashaGeo = new THREE.CylinderGeometry(0.1, 0.5, 1.5);
  const kalasha = new THREE.Mesh(kalashaGeo, gold);
  kalasha.position.set(0, currentY + 1.5, towerBaseZ);
  group.add(kalasha);

  // Flag
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 3), gold);
  pole.position.set(0, currentY + 3, towerBaseZ);
  group.add(pole);

  const flagGeo = new THREE.PlaneGeometry(1.5, 0.8);
  const flagMat = new THREE.MeshBasicMaterial({ color: 0xff4500, side: THREE.DoubleSide });
  const flag = new THREE.Mesh(flagGeo, flagMat);
  flag.position.set(0.8, currentY + 3.5, towerBaseZ);
  group.add(flag);

  return group;
}