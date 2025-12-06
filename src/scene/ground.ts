import * as THREE from 'three';
import { GLOBE_RADIUS } from './curvePlacement';

export function createGround(worldGroup: THREE.Group) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 1024; 
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    const h = 1024;
    const w = 128;
    
    // 1. City Sector (0 - 1/3): Dark Asphalt
    ctx.fillStyle = '#333333';
    ctx.fillRect(0, 0, w, h/3);
    
    // 2. Temple Sector (1/3 - 2/3): Temple Parisar (Stone Paving)
    const templeStart = h/3;
    const templeHeight = h/3;
    
    ctx.fillStyle = '#8D6E63'; 
    ctx.fillRect(0, templeStart, w, templeHeight);
    
    ctx.strokeStyle = '#6D4C41'; 
    ctx.lineWidth = 2;
    ctx.beginPath();
    for(let y = templeStart; y < templeStart + templeHeight; y += 32) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
    for(let x = 0; x < w; x += 32) {
      ctx.moveTo(x, templeStart);
      ctx.lineTo(x, templeStart + templeHeight);
    }
    ctx.stroke();

    // 3. Airport Sector (2/3 - 1): Concrete Tarmac Color
    ctx.fillStyle = '#44484C'; // Updated to match airport concrete
    ctx.fillRect(0, (h/3)*2, w, h/3);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 16; 

  const sphereGeo = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
  const sphereMat = new THREE.MeshPhongMaterial({ 
    map: tex,
    shininess: 5,
    flatShading: false
  });

  const worldSphere = new THREE.Mesh(sphereGeo, sphereMat);
  worldSphere.rotation.y = -Math.PI/2; 
  worldSphere.rotation.z = Math.PI/2; 
  
  worldSphere.receiveShadow = true;
  worldGroup.add(worldSphere);
}