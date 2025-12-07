import * as THREE from 'three';
import { placeObjectOnWorld, GLOBE_RADIUS } from './curvePlacement';

const COLORS = [
  0xE74C3C, 0xE67E22, 0xF1C40F, 0x3498DB, 
  0xE59866, 0x1ABC9C, 0xD35400, 0x95A5A6
];

// --- NEW FUNCTION: Generates Road Lines for the WHOLE world ---
export function createGlobalRoadMarkings(worldGroup: THREE.Group) {
    const totalDashes = 150; // Increased count for full circle
    const fullCircle = Math.PI * 2;

    for(let i = 0; i < totalDashes; i++) {
        const angle = (i / totalDashes) * fullCircle;
        
        // Center double line (Yellow)
        createRoadDash(worldGroup, angle, -0.5, 0xFFD700); // Inner Left
        createRoadDash(worldGroup, angle, 0.5, 0xFFD700);  // Inner Right

        // Lane dividers (White) - Outer lanes
        createRoadDash(worldGroup, angle, -7, 0xFFFFFF);
        createRoadDash(worldGroup, angle, 7, 0xFFFFFF);
    }
}

export function createCitySector(worldGroup: THREE.Group) {
  const sectorStart = 0;
  const sectorEnd = (Math.PI * 2) / 3;
  const sectorSize = sectorEnd - sectorStart;
  
  // NOTE: Road markings moved to createGlobalRoadMarkings above.

  // Houses
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = sectorStart + (i / count) * sectorSize + 0.1;
    // Offset buildings further out (22) so the road feels wide
    createDetailedHouse(worldGroup, angle, -1, 22);
    createDetailedHouse(worldGroup, angle, 1, 22);
  }

  // Traffic Signals
  createDetailedTrafficSignal(worldGroup, sectorStart + 0.5, -1);
  createDetailedTrafficSignal(worldGroup, sectorStart + 1.2, 1);

  // Clouds
  generateCityClouds(worldGroup, sectorStart, sectorEnd);
}

// Helper to place a single dash
function createRoadDash(worldGroup: THREE.Group, angle: number, xOffset: number, color: number) {
    const dashGeo = new THREE.BoxGeometry(2.0, 0.1, 0.3); // Longer dashes
    const dashMat = new THREE.MeshBasicMaterial({ color: color }); 
    const mesh = new THREE.Mesh(dashGeo, dashMat);

    const side = xOffset >= 0 ? 1 : -1;
    const dist = Math.abs(xOffset);

    // Place slightly above the ground radius so it doesn't z-fight with asphalt
    placeObjectOnWorld(worldGroup, mesh, angle, side, dist, GLOBE_RADIUS + 0.08);
}

function createDetailedHouse(worldGroup: THREE.Group, angle: number, side: number, dist: number = 19) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const width = 6; 
  const depth = 7; 
  const height = 15 + Math.random() * 10;
  
  const houseGroup = new THREE.Group();
  
  // 1. Facade
  const shape = new THREE.Shape();
  const peakH = 3;
  shape.moveTo(width, 0);
  shape.lineTo(width, height); 
  shape.lineTo(width/2, height + peakH); 
  shape.lineTo(0, height);
  shape.lineTo(0, 0);

  const facade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth:0.3, bevelEnabled:false}), new THREE.MeshLambertMaterial({color}));
  facade.position.x = -width/2; 
  facade.castShadow = true; 
  houseGroup.add(facade);

  // 2. Bands
  const bandGeo = new THREE.BoxGeometry(width, 0.25, 0.4);
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  for(let y = 3; y < height; y += 3) { 
      const band = new THREE.Mesh(bandGeo, trimMat); 
      band.position.set(0, y, 0.1); 
      houseGroup.add(band); 
  }

  // 3. Windows
  const winRows = Math.floor((height - 2) / 3.5);
  for(let r=0; r<winRows; r++) {
      [ -1.5, 1.5 ].forEach(xx => {
          const yy = 2.5 + r * 3.5;
          const f = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.3, 0.1), trimMat); 
          f.position.set(xx, yy, 0.35);
          const g = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.0), new THREE.MeshLambertMaterial({color: 0x34495E})); 
          g.position.set(0,0,0.06); 
          f.add(g); 
          houseGroup.add(f);
      });
  }

  // 4. Storefront
  const store = new THREE.Mesh(new THREE.BoxGeometry(width, 2.5, 0.5), new THREE.MeshLambertMaterial({color: 0x2C3E50})); 
  store.position.set(0, 1.25, 0); 
  houseGroup.add(store);
  
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.1), new THREE.MeshLambertMaterial({color: 0xA0522D})); 
  door.position.set(0, 1.0, 0.3); 
  houseGroup.add(door);
  
  // 5. Body & Roof
  const body = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, height, depth), new THREE.MeshLambertMaterial({color: 0xeeeeee})); 
  body.position.set(0, height/2, -depth/2); 
  houseGroup.add(body);
  
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.7, depth, 4), new THREE.MeshLambertMaterial({color: 0xC0392B})); 
  roof.rotation.set(-Math.PI/2, 0, Math.PI/4); 
  roof.position.set(0, height, -depth/2); 
  houseGroup.add(roof);
  
  placeObjectOnWorld(worldGroup, houseGroup, angle, side, dist);
}

function createDetailedTrafficSignal(worldGroup: THREE.Group, angle: number, side: number) {
  const signalAssembly = new THREE.Group();
  const darkColor = 0x1a1a1a;
  const poleMat = new THREE.MeshLambertMaterial({ color: darkColor });

  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 16), poleMat); 
  pole.position.y = 4.1; 
  pole.castShadow = true; 
  signalAssembly.add(pole);
  
  const headGroup = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 1.0), poleMat); 
  headGroup.add(box);
  
  const lightGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32).rotateX(Math.PI/2);
  [1.2, 0, -1.2].forEach((y, i) => {
      const c = [0xff0000, 0xffff00, 0x00ff00][i];
      const l = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({color: c})); 
      l.position.set(0, y, 0.55); 
      headGroup.add(l);
  });
  
  headGroup.position.y = 7 + 0.6 + 1.1; 
  signalAssembly.add(headGroup);

  const pivot = new THREE.Object3D(); 
  pivot.rotation.x = -angle; 
  pivot.rotation.z = -side * 0.45; 
  signalAssembly.position.y = GLOBE_RADIUS - 0.5; 
  pivot.add(signalAssembly); 
  worldGroup.add(pivot);
}

function generateCityClouds(worldGroup: THREE.Group, start: number, end: number) {
  const cloudGeo = new THREE.SphereGeometry(1, 7, 7);
  const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
  for(let i=0; i<15; i++) {
      const cloud = new THREE.Group();
      for(let j=0; j<4; j++) {
          const m = new THREE.Mesh(cloudGeo, cloudMat); m.position.set((Math.random()-0.5)*3, (Math.random()-0.5)*1.5, (Math.random()-0.5)*2); m.scale.setScalar(1 + Math.random()); cloud.add(m);
      }
      const pivot = new THREE.Object3D();
      const angle = start + Math.random() * (end - start);
      pivot.rotation.x = -angle; pivot.rotation.z = (Math.random() - 0.5) * 0.5; cloud.position.y = GLOBE_RADIUS + 15 + Math.random() * 10;
      pivot.add(cloud); worldGroup.add(pivot);
  }
}