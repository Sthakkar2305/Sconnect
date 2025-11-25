import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createBuildings(scene: THREE.Scene) {
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9 });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff, metalness: 0.9, roughness: 0.05, transmission: 0.2, transparent: true
  });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

  // ONLY generate buildings around Z=0 (The Contact/Start Scene)
  // Avoid Z=-250 (Temples) and Z=-500 (Playground)
  
  // Start Zone: +120 to -120
  // Loop Seam Zone: -680 to -754 (Which connects back to 0)
  
  const ranges = [
    { start: 120, end: -120 },
    { start: -680, end: -800 } 
  ];

  ranges.forEach(range => {
    for (let z = range.start; z > range.end; z -= (Math.random() * 8 + 12)) {
      // Leave small gap for the "Contact Us" text at exactly 0
      if (z < 20 && z > -20) continue;

      const side = Math.random() > 0.5 ? 1 : -1;
      const x = (Math.random() * 10 + 15) * side; 
      createModernBuilding(scene, x, z, concreteMat, glassMat, frameMat);
      
      // Background building
      if (Math.random() > 0.6) {
        createModernBuilding(scene, (Math.random() * 10 + 25) * side, z, concreteMat, glassMat, frameMat);
      }
    }
  });
}

function createModernBuilding(
  scene: THREE.Scene, 
  x: number, 
  z: number, 
  wallMat: THREE.Material, 
  glassMat: THREE.Material,
  frameMat: THREE.Material
) {
  const buildingGroup = new THREE.Group();
  const width = Math.random() * 5 + 5;
  const depth = Math.random() * 5 + 5;
  const height = Math.random() * 25 + 10; 

  const isGlassTower = Math.random() > 0.6;

  if (isGlassTower) {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, glassMat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    buildingGroup.add(mesh);

    const core = new THREE.Mesh(new THREE.BoxGeometry(width - 0.5, height, depth - 0.5), frameMat);
    core.position.y = height / 2;
    buildingGroup.add(core);
  } else {
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    buildingGroup.add(mesh);
    
    const winMat = new THREE.MeshStandardMaterial({color: 0x111111, roughness: 0.1});
    for(let i=2; i<height-1; i+=3) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(width-1, 1), winMat);
      w.position.set(0, i, depth/2 + 0.05);
      buildingGroup.add(w);
    }
  }

  placeOnGlobe(buildingGroup, x, z, 0);
  scene.add(buildingGroup);
}