import * as THREE from 'three';
import { placeObjectOnWorld } from './curvePlacement';

export function createNatureSector(worldGroup: THREE.Group) {
  // Sector 2: From 90 degrees (PI/2) to 180 degrees (PI)
  const sectorStart = Math.PI / 2;
  const sectorEnd = Math.PI;
  
  // 1. Solar Panels Rows
  const rows = 5;
  const cols = 4;
  
  for(let r = 0; r < rows; r++) {
      // Calculate angle along the road
      const angle = sectorStart + 0.2 + (r / rows) * (sectorEnd - sectorStart - 0.4);
      
      for(let c = 0; c < cols; c++) {
          // Place on Left (-1) and Right (1) sides
          const side = c % 2 === 0 ? -1 : 1;
          const dist = 18 + (c * 6); // Distance from road
          
          createSolarPanel(worldGroup, angle, side, dist);
      }
  }

  // 2. Wind Turbines (Giant landmarks)
  createWindTurbine(worldGroup, sectorStart + 0.4, -1, 35);
  createWindTurbine(worldGroup, sectorStart + 0.8, 1, 40);
  createWindTurbine(worldGroup, sectorStart + 1.1, -1, 30);
}

function createSolarPanel(worldGroup: THREE.Group, angle: number, side: number, dist: number) {
    const group = new THREE.Group();

    // Stand
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3), new THREE.MeshStandardMaterial({color: 0x555555}));
    pole.position.y = 1.5;
    group.add(pole);

    // Panel
    const panelGeo = new THREE.BoxGeometry(4, 0.1, 2.5);
    // Solar Texture (Grid)
    const cvs = document.createElement('canvas'); cvs.width=64; cvs.height=64;
    const ctx = cvs.getContext('2d');
    if(ctx){
        ctx.fillStyle='#1a237e'; ctx.fillRect(0,0,64,64); // Dark Blue
        ctx.strokeStyle='#ffffff'; ctx.lineWidth=1;
        ctx.strokeRect(0,0,64,64); // Border
        ctx.beginPath(); ctx.moveTo(32,0); ctx.lineTo(32,64); ctx.stroke(); // Grid
    }
    const tex = new THREE.CanvasTexture(cvs);
    tex.magFilter = THREE.NearestFilter;

    const materials = [
        new THREE.MeshStandardMaterial({color: 0x333333}), // sides
        new THREE.MeshStandardMaterial({color: 0x333333}), 
        new THREE.MeshStandardMaterial({map: tex, roughness: 0.2, metalness: 0.5}), // Top face (Solar cells)
        new THREE.MeshStandardMaterial({color: 0x333333}),
        new THREE.MeshStandardMaterial({color: 0x333333}),
        new THREE.MeshStandardMaterial({color: 0x333333}),
    ];

    const panel = new THREE.Mesh(panelGeo, materials);
    panel.position.set(0, 3.0, 0);
    panel.rotation.x = Math.PI * 0.15; // Tilt towards sun
    group.add(panel);

    placeObjectOnWorld(worldGroup, group, angle, side, dist);
}

function createWindTurbine(worldGroup: THREE.Group, angle: number, side: number, dist: number) {
    const group = new THREE.Group();

    // Tower
    const tower = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.5, 25), new THREE.MeshStandardMaterial({color: 0xffffff}));
    tower.position.y = 12.5;
    group.add(tower);

    // Hub
    const hub = new THREE.Mesh(new THREE.SphereGeometry(1.5), new THREE.MeshStandardMaterial({color: 0xeeeeee}));
    hub.position.y = 24;
    hub.position.z = 1; // Face forward slightly
    group.add(hub);

    // Blades
    const bladeGeo = new THREE.BoxGeometry(1.0, 14, 0.2);
    const bladeMat = new THREE.MeshStandardMaterial({color: 0xffffff});
    
    for(let i=0; i<3; i++) {
        const blade = new THREE.Mesh(bladeGeo, bladeMat);
        blade.position.y = 7; // Offset from center
        
        const pivot = new THREE.Group();
        pivot.add(blade);
        pivot.rotation.z = i * (Math.PI * 2 / 3); // 120 degrees apart
        pivot.position.y = 24;
        pivot.position.z = 1.2;
        
        // Simple animation handled by scene rotation visually, or could add logic
        group.add(pivot);
    }

    placeObjectOnWorld(worldGroup, group, angle, side, dist);
}