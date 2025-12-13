import * as THREE from 'three';
import { placeObjectOnWorld } from './curvePlacement';

// We return an array of blade groups to animate them later
export function createNatureSector(worldGroup: THREE.Group) {
  const sectorStart = Math.PI / 2;
  const sectorEnd = Math.PI;
  const blades: THREE.Group[] = []; // Store rotating parts here
  
  // 1. Solar Panels Rows
  const rows = 5;
  const cols = 3; 
  
  for(let r = 0; r < rows; r++) {
      const angle = sectorStart + 0.2 + (r / rows) * (sectorEnd - sectorStart - 0.4);
      for(let c = 0; c < cols; c++) {
          const side = c % 2 === 0 ? -1 : 1;
          const dist = 16 + (c * 5); 
          createSolarPanel(worldGroup, angle, side, dist);
      }
  }

  // 2. Wind Turbines (Giant landmarks)
  // We capture the blade group returned by createWindTurbine
  blades.push(createWindTurbine(worldGroup, sectorStart + 0.4, -1, 24));
  blades.push(createWindTurbine(worldGroup, sectorStart + 0.8, 1, 26));
  blades.push(createWindTurbine(worldGroup, sectorStart + 1.1, -1, 22));

  return blades; // Return the array to the main scene
}

function createSolarPanel(worldGroup: THREE.Group, angle: number, side: number, dist: number) {
    const group = new THREE.Group();
    // Stand
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3), new THREE.MeshStandardMaterial({color: 0x555555}));
    pole.position.y = 1.5; group.add(pole);
    // Panel
    const panelGeo = new THREE.BoxGeometry(4, 0.1, 2.5);
    const cvs = document.createElement('canvas'); cvs.width=64; cvs.height=64;
    const ctx = cvs.getContext('2d');
    if(ctx){
        ctx.fillStyle='#1a237e'; ctx.fillRect(0,0,64,64); 
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=1;
        ctx.strokeRect(0,0,64,64); 
        ctx.beginPath(); ctx.moveTo(32,0); ctx.lineTo(32,64); ctx.stroke(); 
    }
    const tex = new THREE.CanvasTexture(cvs); tex.magFilter = THREE.NearestFilter;
    const materials = [
        new THREE.MeshStandardMaterial({color: 0x333333}), new THREE.MeshStandardMaterial({color: 0x333333}), 
        new THREE.MeshStandardMaterial({map: tex, roughness: 0.2, metalness: 0.5}), 
        new THREE.MeshStandardMaterial({color: 0x333333}), new THREE.MeshStandardMaterial({color: 0x333333}), new THREE.MeshStandardMaterial({color: 0x333333}),
    ];
    const panel = new THREE.Mesh(panelGeo, materials);
    panel.position.set(0, 3.0, 0); panel.rotation.x = Math.PI * 0.15; group.add(panel);
    placeObjectOnWorld(worldGroup, group, angle, side, dist);
}

// Updated to return the blade group
function createWindTurbine(worldGroup: THREE.Group, angle: number, side: number, dist: number): THREE.Group {
    const group = new THREE.Group();

    // Tower
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 1.2, 16), new THREE.MeshStandardMaterial({color: 0xffffff}));
    tower.position.y = 8; group.add(tower);

    // Hub (Center of rotation)
    const hub = new THREE.Mesh(new THREE.SphereGeometry(1.2), new THREE.MeshStandardMaterial({color: 0xeeeeee}));
    hub.position.y = 15.5; hub.position.z = 0.8; group.add(hub);

    // --- BLADES GROUP ---
    // We create a specific group just for blades so we can rotate it easily
    const bladeAssembly = new THREE.Group();
    bladeAssembly.position.set(0, 15.5, 1.0); // Center rotation point

    const bladeGeo = new THREE.BoxGeometry(0.8, 9, 0.15);
    const bladeMat = new THREE.MeshStandardMaterial({color: 0xffffff});
    
    for(let i=0; i<3; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        // Offset so it rotates around the center, not its own middle
        blade.position.y = 4.5; 
        
        const pivot = new THREE.Group();
        pivot.add(blade);
        pivot.rotation.z = i * (Math.PI * 2 / 3); 
        
        bladeAssembly.add(pivot);
    }
    
    group.add(bladeAssembly);
    placeObjectOnWorld(worldGroup, group, angle, side, dist);

    return bladeAssembly; // Return the part that needs to spin
}