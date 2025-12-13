import * as THREE from 'three';
import { GLOBE_RADIUS } from './curvePlacement';

// --- COLORS BASED ON IMAGE ---
const COLORS = {
  body: 0x2F3E46,       // Dark Slate/Teal Grey
  accent: 0x00A86B,     // Vibrant Green (S-Connect Green)
  solar: 0x111111,      // Black for solar cells
  white: 0xffffff,
  metal: 0x888888,
  tire: 0x1a1a1a
};

export function createPlayerMachine(scene: THREE.Scene) {
  const machineGroup = new THREE.Group();

  // Shared Materials
  const matBody = new THREE.MeshStandardMaterial({ color: COLORS.body, roughness: 0.4 });
  const matAccent = new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.5 });
  //const matWhite = new THREE.MeshStandardMaterial({ color: COLORS.white });
  const matBlack = new THREE.MeshStandardMaterial({ color: COLORS.solar });

  // 1. CHASSIS & WHEELS
  // -------------------
  // Main base slab
  const chassisGeo = new THREE.BoxGeometry(1.6, 0.2, 1.4);
  const chassis = new THREE.Mesh(chassisGeo, matBody);
  chassis.position.y = 0.4;
  machineGroup.add(chassis);

  // Wheels function
  const createWheel = (x: number, z: number) => {
    const grp = new THREE.Group();
    // Tire
    const tire = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.08, 16, 32),
      new THREE.MeshStandardMaterial({ color: COLORS.tire })
    );
    // Green Rim
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.15, 32),
      matAccent
    );
    rim.rotation.x = Math.PI / 2;
    
    grp.add(tire);
    grp.add(rim);
    grp.position.set(x, 0.33, z);
    return grp;
  };

  machineGroup.add(createWheel(0.65, 0.6));
  machineGroup.add(createWheel(-0.65, 0.6));
  machineGroup.add(createWheel(0.65, -0.6));
  machineGroup.add(createWheel(-0.65, -0.6));

  // 2. MAIN CABINET BODY
  // --------------------
  const cabinetGeo = new THREE.BoxGeometry(1.4, 1.6, 0.9);
  const cabinet = new THREE.Mesh(cabinetGeo, matBody);
  cabinet.position.y = 1.3; 
  machineGroup.add(cabinet);

  // 3. SCREENS (Front & Back)
  // -------------------------
  const cvs = document.createElement('canvas'); 
  cvs.width = 1024; cvs.height = 700;
  const ctx = cvs.getContext('2d');
  if(ctx) {
      const grd = ctx.createLinearGradient(0, 0, 1024, 700); 
      grd.addColorStop(0, "#e65100"); grd.addColorStop(1, "#2e7d32");
      ctx.fillStyle = grd; ctx.fillRect(0,0,1024,700);
      
      ctx.fillStyle='white'; ctx.font='bold 180px Arial'; ctx.textAlign='center'; 
      ctx.fillText('55"', 512, 300);
      ctx.font='bold 80px Arial'; 
      ctx.fillText('OUTDOOR TV', 512, 450);
  }
  const machineScreenMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs) });

  const screenGeo = new THREE.PlaneGeometry(1.2, 0.85);
  
  // Front Screen
  const screenF = new THREE.Mesh(screenGeo, machineScreenMat);
  screenF.position.set(0, 1.5, 0.46); 
  screenF.name = 'TV_SCREEN_FRONT';
  machineGroup.add(screenF);

  // Back Screen
  const screenB = screenF.clone();
  screenB.rotation.y = Math.PI;
  screenB.position.z = -0.46;
  screenB.name = 'TV_SCREEN_BACK';
  machineGroup.add(screenB);

  // Black Bezel
  const bezelF = new THREE.Mesh(new THREE.PlaneGeometry(1.25, 0.9), matBlack);
  bezelF.position.set(0, 1.5, 0.455);
  machineGroup.add(bezelF);
  const bezelB = bezelF.clone();
  bezelB.rotation.y = Math.PI;
  bezelB.position.z = -0.455;
  machineGroup.add(bezelB);


  // 4. BRANDING AREA
  // ----------------
  const logoTex = createLogoTexture();
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true });
  const logoGeo = new THREE.PlaneGeometry(1.2, 0.35);

  const logoF = new THREE.Mesh(logoGeo, logoMat);
  logoF.position.set(0, 0.85, 0.46);
  machineGroup.add(logoF);

  const logoB = logoF.clone();
  logoB.rotation.y = Math.PI;
  logoB.position.z = -0.46;
  machineGroup.add(logoB);


  // 5. SIDE UTILITY PANEL (Right Side)
  // ----------------------------------
  const sideTex = createSidePanelTexture();
  const sideMat = new THREE.MeshBasicMaterial({ map: sideTex });
  const sidePanelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.5), sideMat);
  sidePanelMesh.rotation.y = Math.PI / 2;
  sidePanelMesh.position.set(0.71, 1.3, 0); 
  machineGroup.add(sidePanelMesh);


  // 6. SOLAR PANELS (Top)
  // ---------------------
  const solarGroup = new THREE.Group();
  
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), matBody);
  pole.position.y = 2.2;
  machineGroup.add(pole);

  const panelGeo = new THREE.BoxGeometry(0.9, 0.05, 1.4); 
  const cellTex = createSolarTexture();
  const matSolarFace = new THREE.MeshBasicMaterial({ map: cellTex });
  const matSolarEdge = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const materials = [matSolarEdge, matSolarEdge, matSolarFace, matSolarEdge, matSolarEdge, matSolarEdge];

  const panelL = new THREE.Mesh(panelGeo, materials);
  panelL.position.set(-0.46, 0, 0);
  panelL.rotation.z = 0.2; 
  solarGroup.add(panelL);

  const panelR = new THREE.Mesh(panelGeo, materials);
  panelR.position.set(0.46, 0, 0);
  panelR.rotation.z = -0.2; 
  solarGroup.add(panelR);

  solarGroup.position.set(0, 2.5, 0);
  solarGroup.rotation.x = -0.3; 
  machineGroup.add(solarGroup);


  // 7. REALISTIC DOME CCTV CAMERA (Side Mount)
  // ------------------------------------------
  const camGroup = new THREE.Group();

  // Materials for Camera
  const matCamHousing = new THREE.MeshStandardMaterial({ color: COLORS.white, roughness: 0.5, metalness: 0.1 });
  const matCamBlack = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.8 });
  // Realistic Glass: Shiny and semi-transparent
  const matCamLens = new THREE.MeshPhysicalMaterial({
    color: 0x222222,
    metalness: 0.9,
    roughness: 0.1,
    transparent: true,
    opacity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    side: THREE.FrontSide
  });

  // A. Mounting Base (Attached to cabinet)
  const mountBase = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.15, 0.15), matCamHousing);
  mountBase.position.set(0, 0, 0);
  camGroup.add(mountBase);

  // B. Arm (L-Shape Gooseneck)
  // Horizontal part
  const armH = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25), matCamHousing);
  armH.rotation.z = Math.PI / 2;
  armH.position.set(0.125, 0, 0);
  camGroup.add(armH);

  // Elbow joint
  const elbow = new THREE.Mesh(new THREE.SphereGeometry(0.045), matCamHousing);
  elbow.position.set(0.25, 0, 0);
  camGroup.add(elbow);

  // Vertical connector
  const armV = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.1), matCamHousing);
  armV.position.set(0.25, -0.05, 0);
  camGroup.add(armV);

  // C. Camera Main Housing (The white top part)
  const housing = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.12, 32), matCamHousing);
  housing.position.set(0.25, -0.12, 0);
  camGroup.add(housing);

  // D. The "Eye" (Lens Unit inside the dome)
  // This creates the internal detail seen through the glass
  const eyeGroup = new THREE.Group();
  const eyeBody = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.08), matCamBlack);
  eyeGroup.add(eyeBody);
  const eyeLens = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06), new THREE.MeshStandardMaterial({color: 0x000000, roughness: 0.2}));
  eyeLens.rotation.x = Math.PI/2;
  eyeLens.position.z = 0.04;
  eyeGroup.add(eyeLens);

  // Rotate eye to look diagonally down/out
  eyeGroup.position.set(0.25, -0.18, 0);
  eyeGroup.rotation.x = Math.PI / 3;
  eyeGroup.rotation.y = Math.PI / 4;
  camGroup.add(eyeGroup);

  // E. Glass Dome (The Tinted Cover)
  const glassDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.13, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2),
    matCamLens
  );
  glassDome.rotation.x = Math.PI; // Flip to form a bowl
  glassDome.position.set(0.25, -0.13, 0);
  camGroup.add(glassDome);

  // F. Mount Position on Chariot
  camGroup.position.set(0.7, 1.9, 0.3);
  machineGroup.add(camGroup);


  // 8. "PULL" HANDLES & BUMPER
  // --------------------------
  const bumperGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
  const pullMat = new THREE.MeshStandardMaterial({ color: COLORS.accent });
  const pullF = new THREE.Mesh(bumperGeo, pullMat);
  pullF.position.set(0, 0.6, 0.5); 
  machineGroup.add(pullF);
  const pullBar = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4).rotateZ(Math.PI/2), matBody);
  pullBar.position.set(0, 0.6, 0.6);
  machineGroup.add(pullBar);


  // 9. UPLOAD BUTTON (Floating)
  // ---------------------------
  const bubCvs = document.createElement('canvas'); bubCvs.width=256; bubCvs.height=256;
  const bCtx = bubCvs.getContext('2d');
  if(bCtx) {
      bCtx.beginPath(); bCtx.arc(128,128,120,0,Math.PI*2); bCtx.fillStyle="white"; bCtx.fill();
      bCtx.lineWidth=10; bCtx.strokeStyle= "#00A86B"; bCtx.stroke();
      bCtx.fillStyle="#00A86B"; bCtx.font="bold 80px Arial"; bCtx.textAlign="center"; bCtx.fillText("⬆", 128, 100);
      bCtx.fillStyle="black"; bCtx.font="bold 28px Arial"; bCtx.fillText("UPLOAD", 128, 150);
  }
  const btn = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(bubCvs), transparent:true}));
  btn.position.set(0.8, 1.0, 0.5); 
  btn.name = 'UPLOAD_BUTTON'; 
  machineGroup.add(btn);


  // FINAL PLACEMENT ON WORLD
  machineGroup.scale.set(3,3,3);
  const zPos = 8;
  const surfaceY = Math.sqrt(Math.pow(GLOBE_RADIUS, 2) - Math.pow(zPos, 2));
  machineGroup.position.set(0, surfaceY, zPos);
  machineGroup.rotation.y = Math.PI;
  machineGroup.rotation.x = Math.atan2(zPos, surfaceY);
  
  scene.add(machineGroup);

  return { machineGroup, machineScreenMat };
}

// --- TEXTURE HELPERS ---

function createLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0,0,512,128);
    const cx = 64, cy = 64, r = 50;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = '#00A86B'; ctx.fill();
    ctx.fillStyle = 'white'; ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('S', cx, cy + 4);
    ctx.textAlign = 'left';
    ctx.fillText('S-CONNECT', cx + r + 20, cy + 4);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSidePanelTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  if (ctx) {
    ctx.fillStyle = '#2F3E46'; 
    ctx.fillRect(0,0,256,512);

    // WATER
    ctx.fillStyle = '#222';
    ctx.fillRect(40, 40, 176, 120); 
    ctx.fillStyle = '#00A86B'; 
    ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
    ctx.fillText('WATER', 128, 190);
    ctx.fillStyle = '#4FC3F7'; ctx.fillRect(110, 60, 36, 60);

    // CHARGING
    ctx.fillStyle = '#222';
    ctx.fillRect(40, 240, 176, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('MOBILE', 128, 345);
    ctx.fillText('CHARGING', 128, 370);
    ctx.fillStyle = '#444'; ctx.fillRect(60, 260, 20, 40); ctx.fillRect(100, 260, 20, 40);

    // LITHIUM
    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px Arial';
    ctx.fillText('LITHIUM', 128, 440);
    ctx.fillText('ENERGY', 128, 465);
    ctx.fillText('STORAGE', 128, 490);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSolarTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if(ctx) {
      ctx.fillStyle = '#111'; ctx.fillRect(0,0,256,256);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
      ctx.beginPath();
      for(let i=0; i<=256; i+=32) {
          ctx.moveTo(i, 0); ctx.lineTo(i, 256);
          ctx.moveTo(0, i); ctx.lineTo(256, i);
      }
      ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}