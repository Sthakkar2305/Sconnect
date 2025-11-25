import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createBuildings(scene: THREE.Scene) {
  // --- MATERIALS ---
  // 1. Concrete / Stone
  const concreteMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    roughness: 0.9,
  });

  // 2. Glass (Reflective)
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0x88ccff,
    metalness: 0.9,
    roughness: 0.05,
    transmission: 0.2, // Slight transparency
    transparent: true,
  });

  // 3. Dark Frame
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.8 });

  // --- GENERATION LOOP (Fill whole globe) ---
  // Globe Circumference ~1256. Loop from +20 down to -1250
  for (let z = 20; z > -1250; z -= (Math.random() * 10 + 10)) {
    
    // Skip areas where we want specific landmarks (Temples/Parks)
    // About/Temple Area: -100 to -200
    // Project/Park Area: -210 to -250
    // Let's leave gaps for them
    if (z < -90 && z > -200) continue; 
    if (z < -210 && z > -260) continue;

    // Create building on Left (-1) or Right (1)
    const side = Math.random() > 0.5 ? 1 : -1;
    const x = (Math.random() * 8 + 18) * side;

    createModernBuilding(scene, x, z, concreteMat, glassMat, frameMat);
    
    // Occasionally add a second building behind it
    if (Math.random() > 0.7) {
       const x2 = (Math.random() * 10 + 30) * side;
       createModernBuilding(scene, x2, z, concreteMat, glassMat, frameMat);
    }
  }
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

  const width = Math.random() * 4 + 4;
  const depth = Math.random() * 4 + 4;
  const height = Math.random() * 20 + 10; // Taller buildings

  const isGlassTower = Math.random() > 0.6;

  if (isGlassTower) {
    // --- TYPE A: GLASS TOWER ---
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, glassMat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    buildingGroup.add(mesh);

    // Internal Core (so it's not empty)
    const coreGeo = new THREE.BoxGeometry(width - 0.5, height, depth - 0.5);
    const core = new THREE.Mesh(coreGeo, frameMat);
    core.position.y = height / 2;
    buildingGroup.add(core);

    // Vertical Strips
    const numStrips = 4;
    for(let i=0; i<numStrips; i++) {
        const strip = new THREE.Mesh(new THREE.BoxGeometry(0.2, height, depth + 0.2), frameMat);
        strip.position.x = -width/2 + (width/numStrips)*i + (width/numStrips)/2;
        strip.position.y = height/2;
        buildingGroup.add(strip);
    }

  } else {
    // --- TYPE B: CONCRETE APARTMENT ---
    const geo = new THREE.BoxGeometry(width, height, depth);
    const mesh = new THREE.Mesh(geo, wallMat);
    mesh.position.y = height / 2;
    mesh.castShadow = true;
    buildingGroup.add(mesh);

    // Windows (Grid)
    const winGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const winCountY = Math.floor(height / 2);
    const winCountX = Math.floor(width / 1.5);
    
    // Front Face Windows
    for(let i=0; i<winCountX; i++) {
        for(let j=0; j<winCountY; j++) {
            const win = new THREE.Mesh(winGeo, glassMat);
            // Calculate local positions
            const wx = -width/2 + 1 + i * 1.5;
            const wy = 2 + j * 2;
            const wz = depth/2 + 0.05;
            
            win.position.set(wx, wy, wz);
            buildingGroup.add(win);

            // Add simple ledge
            const ledge = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.1, 0.3), frameMat);
            ledge.position.set(wx, wy - 0.7, wz);
            buildingGroup.add(ledge);
        }
    }
  }

  // Roof
  const roof = new THREE.Mesh(new THREE.BoxGeometry(width - 0.5, 1, depth - 0.5), frameMat);
  roof.position.y = height + 0.5;
  buildingGroup.add(roof);

  placeOnGlobe(buildingGroup, x, z, 0);
  scene.add(buildingGroup);
}