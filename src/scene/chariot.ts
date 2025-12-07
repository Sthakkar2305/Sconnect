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
  const matWhite = new THREE.MeshStandardMaterial({ color: COLORS.white });
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
    // Green Rim (as per image)
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
  // The main box holding screen and utilities
  // Width 1.4, Height 1.6, Depth 0.9
  const cabinetGeo = new THREE.BoxGeometry(1.4, 1.6, 0.9);
  const cabinet = new THREE.Mesh(cabinetGeo, matBody);
  cabinet.position.y = 1.3; // Sit on top of chassis
  machineGroup.add(cabinet);

  // 3. SCREENS (Front & Back)
  // -------------------------
  // High Res Texture
  const cvs = document.createElement('canvas'); 
  cvs.width = 1024; cvs.height = 700;
  const ctx = cvs.getContext('2d');
  if(ctx) {
      // Create the default gradient look
      const grd = ctx.createLinearGradient(0, 0, 1024, 700); 
      grd.addColorStop(0, "#e65100"); grd.addColorStop(1, "#2e7d32");
      ctx.fillStyle = grd; ctx.fillRect(0,0,1024,700);
      
      // Text
      ctx.fillStyle='white'; ctx.font='bold 180px Arial'; ctx.textAlign='center'; 
      ctx.fillText('55"', 512, 300);
      ctx.font='bold 80px Arial'; 
      ctx.fillText('OUTDOOR TV', 512, 450);
  }
  const machineScreenMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs) });

  // Screen Geometry (Inset slightly)
  // MODIFICATION: Increased Screen Size (1.2 -> 1.3 width, 0.85 -> 1.0 height)
  const screenGeo = new THREE.PlaneGeometry(1.3, 1.0);
  
  // Front Screen
  const screenF = new THREE.Mesh(screenGeo, machineScreenMat);
  screenF.position.set(0, 1.5, 0.46); // Slightly protruding from cabinet face (z=0.45)
  screenF.name = 'TV_SCREEN_FRONT';
  machineGroup.add(screenF);

  // Back Screen
  const screenB = screenF.clone();
  screenB.rotation.y = Math.PI;
  screenB.position.z = -0.46;
  screenB.name = 'TV_SCREEN_BACK';
  machineGroup.add(screenB);

  // Black Bezel around screen
  // MODIFICATION: Increased Bezel Size (1.25 -> 1.35 width, 0.9 -> 1.05 height)
  const bezelF = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 1.05), matBlack);
  bezelF.position.set(0, 1.5, 0.455);
  machineGroup.add(bezelF);
  const bezelB = bezelF.clone();
  bezelB.rotation.y = Math.PI;
  bezelB.position.z = -0.455;
  machineGroup.add(bezelB);


  // 4. BRANDING AREA (Chin below screen)
  // ------------------------------------
  const logoTex = createLogoTexture();
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true });
  const logoGeo = new THREE.PlaneGeometry(1.2, 0.35);

  // Front Logo
  const logoF = new THREE.Mesh(logoGeo, logoMat);
  logoF.position.set(0, 0.85, 0.46);
  machineGroup.add(logoF);

  // Back Logo
  const logoB = logoF.clone();
  logoB.rotation.y = Math.PI;
  logoB.position.z = -0.46;
  machineGroup.add(logoB);


  // 5. SIDE UTILITY PANEL (Right Side)
  // ----------------------------------
  // Generates the "Water", "Mobile Charging", "Lithium" text texture
  const sideTex = createSidePanelTexture();
  const sideMat = new THREE.MeshBasicMaterial({ map: sideTex });
  const sidePanelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.5), sideMat);
  
  // Place on the right side of the cabinet
  sidePanelMesh.rotation.y = Math.PI / 2;
  sidePanelMesh.position.set(0.71, 1.3, 0); // x = 0.7 (half width) + 0.01 overlap
  machineGroup.add(sidePanelMesh);


  // 6. SOLAR PANELS (Top)
  // ---------------------
  const solarGroup = new THREE.Group();
  
  // Center Pole
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6), matBody);
  pole.position.y = 2.2;
  machineGroup.add(pole);

  // Solar Wing Left
  const panelGeo = new THREE.BoxGeometry(0.9, 0.05, 1.4); // Wide panels
  // Add solar cell texture pattern (grid)
  const cellTex = createSolarTexture();
  const matSolarFace = new THREE.MeshBasicMaterial({ map: cellTex });
  const matSolarEdge = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const materials = [matSolarEdge, matSolarEdge, matSolarFace, matSolarEdge, matSolarEdge, matSolarEdge];

  const panelL = new THREE.Mesh(panelGeo, materials);
  panelL.position.set(-0.46, 0, 0);
  panelL.rotation.z = 0.2; // Tilt up
  solarGroup.add(panelL);

  // Solar Wing Right
  const panelR = new THREE.Mesh(panelGeo, materials);
  panelR.position.set(0.46, 0, 0);
  panelR.rotation.z = -0.2; // Tilt up
  solarGroup.add(panelR);

  solarGroup.position.set(0, 2.5, 0);
  // Tilt the whole solar array towards the sun slightly
  solarGroup.rotation.x = -0.3; 
  machineGroup.add(solarGroup);


  // 7. DOME CCTV CAMERA (Side Mount)
  // --------------------------------
  const camGroup = new THREE.Group();
  
  // Arm
  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.4), matWhite);
  arm.rotation.z = Math.PI / 2;
  arm.position.x = 0.2;
  camGroup.add(arm);

  // Dome Housing
  const domeBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.15), matWhite);
  domeBase.position.x = 0.45;
  camGroup.add(domeBase);
  
  // Black Dome
  const glass = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16, 0, Math.PI * 2, 0, Math.PI/2), matBlack);
  // MODIFICATION: Rotate glass to face the front/side
  glass.rotation.z = -Math.PI / 4; // Original was Math.PI (down), this faces forward-right
  glass.position.set(0.45, -0.05, 0);
  camGroup.add(glass);

  // MODIFICATION: Move mount point to the back-right corner of cabinet and rotate to face forward
  camGroup.position.set(-0.7, 2.0, -0.3); // x=0.7 (right), z=-0.3 (back/side)
  camGroup.rotation.y = Math.PI / 2;
  machineGroup.add(camGroup);


  // 8. "PULL" HANDLES & BUMPER
  // --------------------------
  const bumperGeo = new THREE.BoxGeometry(0.4, 0.15, 0.1);
  
  // Green PULL blocks
  const pullMat = new THREE.MeshStandardMaterial({ color: COLORS.accent });
  const pullF = new THREE.Mesh(bumperGeo, pullMat);
  pullF.position.set(0, 0.6, 0.5); // Front Bumper area
  machineGroup.add(pullF);

  // Add "PULL" text? (Optional, kept simple green block for now to save texture space, 
  // or we can reuse a canvas if strict detail needed. The green block implies it visually)
  
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

// --- TEXTURE HELPERS (UNMODIFIED) ---

function createLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 580; canvas.height = 128;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Transparent BG
    ctx.clearRect(0,0,512,128);
    
    // Circle Background (Green)
    const cx = 64, cy = 64, r = 50;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2);
    ctx.fillStyle = '#00A86B'; ctx.fill();

    // "S" Text
    ctx.fillStyle = 'white'; ctx.font = 'bold 70px Arial';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('S', cx, cy + 4);

    // "S-CONNECT" Text
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
    // Background
    ctx.fillStyle = '#2F3E46'; 
    ctx.fillRect(0,0,256,512);

    // 1. WATER DISPENSER AREA (Top)
    ctx.fillStyle = '#222';
    ctx.fillRect(40, 40, 176, 120); // Recessed box
    ctx.fillStyle = '#00A86B'; // Water Icon/Text
    ctx.font = 'bold 24px Arial'; ctx.textAlign = 'center';
    ctx.fillText('WATER', 128, 190);
    // Draw a fake bottle/spout
    ctx.fillStyle = '#4FC3F7'; ctx.fillRect(110, 60, 36, 60);

    // 2. CHARGING AREA (Middle)
    ctx.fillStyle = '#222';
    ctx.fillRect(40, 240, 176, 80);
    ctx.fillStyle = 'white';
    ctx.font = 'bold 20px Arial';
    ctx.fillText('MOBILE', 128, 345);
    ctx.fillText('CHARGING', 128, 370);
    // Draw fake ports
    ctx.fillStyle = '#444'; ctx.fillRect(60, 260, 20, 40); ctx.fillRect(100, 260, 20, 40);

    // 3. LITHIUM TEXT (Bottom)
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
      // Draw Grid
      ctx.beginPath();
      for(let i=0; i<=256; i+=32) {
          ctx.moveTo(i, 0); ctx.lineTo(i, 256);
          ctx.moveTo(0, i); ctx.lineTo(256, i);
      }
      ctx.stroke();
  }
  return new THREE.CanvasTexture(canvas);
}