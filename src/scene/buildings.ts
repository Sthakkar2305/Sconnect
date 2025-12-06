import * as THREE from 'three';
import { placeObjectOnWorld, GLOBE_RADIUS } from './curvePlacement';

const COLORS = [
  0xE74C3C, 0xE67E22, 0xF1C40F, 0x3498DB, 
  0xE59866, 0x1ABC9C, 0xD35400, 0x95A5A6
];

export function createCitySector(worldGroup: THREE.Group) {
  const sectorStart = 0;
  const sectorEnd = (Math.PI * 2) / 3;
  const sectorSize = sectorEnd - sectorStart;
  
  // Road Markings
  createCityRoadMarkings(worldGroup, sectorStart, sectorEnd);

  // Houses
  const count = 12;
  for (let i = 0; i < count; i++) {
    const angle = sectorStart + (i / count) * sectorSize + 0.1;
    createDetailedHouse(worldGroup, angle, -1);
    createDetailedHouse(worldGroup, angle, 1);
  }

  // Traffic Signals
  createDetailedTrafficSignal(worldGroup, sectorStart + 0.5, -1);
  createDetailedTrafficSignal(worldGroup, sectorStart + 1.2, 1);

  // Clouds
  generateCityClouds(worldGroup, sectorStart, sectorEnd);
}

function createCityRoadMarkings(worldGroup: THREE.Group, startAngle: number, endAngle: number) {
  const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 32;
  const ctx = canvas.getContext('2d');
  if(ctx) { ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0,0,64,32); ctx.fillStyle = '#ffffff'; ctx.fillRect(16, 0, 32, 32); }
  const texture = new THREE.CanvasTexture(canvas); texture.wrapS = THREE.RepeatWrapping; texture.wrapT = THREE.ClampToEdgeWrapping; texture.repeat.set(20, 1);
  const lineMat = new THREE.MeshBasicMaterial({ map: texture, transparent: true, side: THREE.DoubleSide });
  
  [-5.0, 5.0].forEach(xPos => {
      const radius = Math.sqrt(Math.pow(GLOBE_RADIUS, 2) - Math.pow(xPos, 2)) + 0.05;
      const geo = new THREE.TorusGeometry(radius, 0.2, 16, 100, endAngle - startAngle);
      const mesh = new THREE.Mesh(geo, lineMat);
      mesh.rotation.y = Math.PI / 2; mesh.position.x = xPos; mesh.rotation.z = startAngle + Math.PI/2;
      worldGroup.add(mesh);
  });
}

function createDetailedHouse(worldGroup: THREE.Group, angle: number, side: number) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  const width = 6; 
  const depth = 7; 
  const height = 15 + Math.random() * 10;
  
  const houseGroup = new THREE.Group();
  
  // --- 1. Procedural Facade Shape ---
  const shape = new THREE.Shape();
  const gableType = Math.floor(Math.random() * 4);
  const peakH = 3;
  
  shape.moveTo(width, 0);
  
  if (gableType === 0) {
      // Stepped Gable
      shape.lineTo(width, height); shape.lineTo(width - 1, height); shape.lineTo(width - 1, height + 1);
      shape.lineTo(width - 2, height + 1); shape.lineTo(width - 2, height + 2); shape.lineTo(width - 3, height + 2);
      shape.lineTo(width - 3, height + 3); shape.lineTo(3, height + 3); shape.lineTo(3, height + 2);
      shape.lineTo(2, height + 2); shape.lineTo(2, height + 1); shape.lineTo(1, height + 1);
      shape.lineTo(1, height); shape.lineTo(0, height);
  } else if (gableType === 1) {
      // Curved Gable
      shape.lineTo(width, height); shape.bezierCurveTo(width, height + 1.5, width/2 + 1, height + peakH, width/2, height + peakH);
      shape.bezierCurveTo(width/2 - 1, height + peakH, 0, height + 1.5, 0, height);
  } else if (gableType === 2) {
      // Pointed Step Gable
      shape.lineTo(width, height); shape.lineTo(width - 1, height); shape.lineTo(width - 1, height + 1);
      shape.lineTo(width - 1.5, height + 1); shape.lineTo(width - 1.5, height + peakH); shape.lineTo(1.5, height + peakH);
      shape.lineTo(1.5, height + 1); shape.lineTo(1, height + 1); shape.lineTo(1, height); shape.lineTo(0, height);
  } else {
      // Standard Triangular Gable
      shape.lineTo(width, height); shape.lineTo(width/2, height + peakH); shape.lineTo(0, height);
  }
  shape.lineTo(0, 0);

  const facade = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, {depth:0.3, bevelEnabled:false}), new THREE.MeshLambertMaterial({color}));
  facade.position.x = -width/2; 
  facade.castShadow = true; 
  houseGroup.add(facade);

  // --- 2. Decorative Bands ---
  const bandGeo = new THREE.BoxGeometry(width, 0.25, 0.4);
  const trimMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
  for(let y = 3; y < height; y += 3) { 
      const band = new THREE.Mesh(bandGeo, trimMat); 
      band.position.set(0, y, 0.1); 
      houseGroup.add(band); 
  }

  // --- 3. Windows ---
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

  // --- 4. Storefront ---
  const store = new THREE.Mesh(new THREE.BoxGeometry(width, 2.5, 0.5), new THREE.MeshLambertMaterial({color: 0x2C3E50})); 
  store.position.set(0, 1.25, 0); 
  houseGroup.add(store);
  
  const door = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.0, 0.1), new THREE.MeshLambertMaterial({color: 0xA0522D})); 
  door.position.set(0, 1.0, 0.3); 
  houseGroup.add(door);
  
  // --- 5. Main Body & Roof ---
  const body = new THREE.Mesh(new THREE.BoxGeometry(width - 0.2, height, depth), new THREE.MeshLambertMaterial({color: 0xeeeeee})); 
  body.position.set(0, height/2, -depth/2); 
  houseGroup.add(body);
  
  const roof = new THREE.Mesh(new THREE.ConeGeometry(width * 0.7, depth, 4), new THREE.MeshLambertMaterial({color: 0xC0392B})); 
  roof.rotation.set(-Math.PI/2, 0, Math.PI/4); 
  roof.position.set(0, height, -depth/2); 
  houseGroup.add(roof);
  
  placeObjectOnWorld(worldGroup, houseGroup, angle, side, 19);
}

function createDetailedTrafficSignal(worldGroup: THREE.Group, angle: number, side: number) {
  const signalAssembly = new THREE.Group();
  const darkColor = 0x1a1a1a;
  const poleMat = new THREE.MeshLambertMaterial({ color: darkColor });

  // Base
  const base1 = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 1.2), poleMat); 
  base1.position.y = 0.15; 
  signalAssembly.add(base1);
  
  const base2 = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 0.8), poleMat); 
  base2.position.y = 0.45; 
  signalAssembly.add(base2);
  
  // Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 7, 16), poleMat); 
  pole.position.y = 4.1; 
  pole.castShadow = true; 
  signalAssembly.add(pole);
  
  // Head Group
  const headGroup = new THREE.Group();
  const box = new THREE.Mesh(new THREE.BoxGeometry(1.6, 4.2, 1.0), poleMat); 
  headGroup.add(box);
  
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.64, 0.64, 1.0, 16).rotateX(Math.PI/2), poleMat); 
  cap.position.y = 2.1; 
  headGroup.add(cap);
  
  const lightGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 32).rotateX(Math.PI/2);
  const hoodGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.6, 32, 1, true, 0, Math.PI).rotateX(Math.PI/2);
  const hoodMat = new THREE.MeshBasicMaterial({ color: darkColor, side: THREE.DoubleSide });
  
  [1.2, 0, -1.2].forEach((y, i) => {
      const c = [0xff0000, 0xffff00, 0x00ff00][i];
      // Light
      const l = new THREE.Mesh(lightGeo, new THREE.MeshBasicMaterial({color: c})); 
      l.position.z = 0.55; 
      l.position.y = y; 
      headGroup.add(l);
      
      // Hood
      const h = new THREE.Mesh(hoodGeo, hoodMat); 
      h.position.z = 0.55; 
      h.position.y = y; 
      h.rotation.z = -Math.PI/2; 
      headGroup.add(h);
      
      // Side Flaps
      const fL = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.1), poleMat); 
      fL.position.set(-0.9, y, 0.2); 
      fL.rotation.y = Math.PI/4; 
      headGroup.add(fL);
      
      const fR = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 0.1), poleMat); 
      fR.position.set(0.9, y, 0.2); 
      fR.rotation.y = -Math.PI/4; 
      headGroup.add(fR);
  });
  
  // Position head on pole
  headGroup.position.y = 7 + 0.6 + 1.1; // Matches original math
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