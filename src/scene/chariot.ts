import * as THREE from 'three';
import { getGlobePosition, GLOBE_RADIUS } from './curvePlacement';

export interface ChariotControls {
  mesh: THREE.Group;
  update: (deltaTime: number, input: { forward: boolean; backward: boolean }) => void;
  getPosition: () => number;
  setPosition: (z: number) => void;
}

// --- TEXTURE GENERATION HELPERS (Same as before) ---

function createTextTexture(
  text: string, 
  width: number, 
  height: number, 
  bgColor: string | null, 
  textColor: string, 
  fontSize: number, 
  fontFamily: string = 'Arial',
  fontWeight: string = 'bold',
  align: CanvasTextAlign = 'center',
  baseline: CanvasTextBaseline = 'middle',
  xOffset: number = width / 2,
  yOffset: number = height / 2,
  hasBorder: boolean = false,
  borderColor: string = '#ffffff'
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  if (bgColor) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);
  }

  if (hasBorder) {
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);
  }

  ctx.fillStyle = textColor;
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, xOffset, yOffset);

  const tex = new THREE.CanvasTexture(canvas);
  tex.anisotropy = 16;
  return tex;
}

function createScreenTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 640;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Gradient Background
  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#FF4500'); 
  grad.addColorStop(0.5, '#FFA500'); 
  grad.addColorStop(1, '#00A86B'); 
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Text: 55"
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 250px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 20;
  ctx.fillText('55"', width / 2, height / 2 - 50);

  // Text: OUTDOOR TV
  ctx.font = 'bold 80px Arial';
  ctx.fillText('OUTDOOR TV', width / 2, height / 2 + 120);

  return new THREE.CanvasTexture(canvas);
}

function createLogoTexture(): THREE.CanvasTexture {
  const width = 1024;
  const height = 256;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background matching chassis
  ctx.fillStyle = '#25323D'; 
  ctx.fillRect(0, 0, width, height);

  // Green Circle Icon "S"
  const circleX = 200;
  const circleY = height / 2;
  const radius = 80;
  ctx.fillStyle = '#00A651'; 
  ctx.beginPath();
  ctx.arc(circleX, circleY, radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 100px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('S', circleX, circleY + 5);

  // Text: S-CONNECT
  ctx.textAlign = 'left';
  ctx.font = 'bold 110px Arial';
  ctx.fillText('S-CONNECT', circleX + 120, circleY + 5);

  return new THREE.CanvasTexture(canvas);
}

function createControlPanelTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Background
  ctx.fillStyle = '#25323D';
  ctx.fillRect(0, 0, width, height);

  // -- WATER SECTION --
  ctx.fillStyle = '#1A252E'; 
  ctx.fillRect(50, 100, 412, 180); // Widened slightly for side fit
  ctx.fillStyle = '#00CED1'; 
  ctx.globalAlpha = 0.3;
  ctx.fillRect(50, 100, 412, 180);
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 60px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('WATER', width / 2, 350);

  // -- MOBILE CHARGING SECTION --
  ctx.fillStyle = '#1A252E';
  ctx.fillRect(100, 450, 312, 120);
  ctx.fillStyle = '#00FF7F'; 
  ctx.globalAlpha = 0.2;
  ctx.fillRect(100, 450, 312, 120);
  ctx.globalAlpha = 1.0;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 50px Arial';
  ctx.fillText('MOBILE', width / 2, 630);
  ctx.fillText('CHARGING', width / 2, 690);

  // Icons
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(width / 2 - 40, 760);
  ctx.lineTo(width / 2 - 20, 730);
  ctx.lineTo(width / 2 - 20, 760);
  ctx.stroke();

  // -- BOTTOM TEXT --
  ctx.textAlign = 'left';
  ctx.font = 'bold 40px Arial';
  ctx.fillStyle = '#DDDDDD';
  ctx.fillText('LITHIUM', 50, 850);
  ctx.fillText('ENERGY', 50, 900);
  ctx.fillText('STORAGE', 50, 950);

  return new THREE.CanvasTexture(canvas);
}

function createSolarTexture(): THREE.CanvasTexture {
  const width = 512;
  const height = 512;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = '#102040';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.5;

  const cols = 6;
  const rows = 10;
  const cellW = width / cols;
  const cellH = height / rows;

  for (let i = 0; i <= cols; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cellW, 0);
    ctx.lineTo(i * cellW, height);
    ctx.stroke();
  }
  for (let i = 0; i <= rows; i++) {
    ctx.beginPath();
    ctx.moveTo(0, i * cellH);
    ctx.lineTo(width, i * cellH);
    ctx.stroke();
  }

  return new THREE.CanvasTexture(canvas);
}

// --- MAIN CHARIOT CREATION ---

export function createChariot(scene: THREE.Scene): ChariotControls {
  const group = new THREE.Group();

  const COLOR_CHASSIS = 0x25323D; 
  const COLOR_ACCENT = 0x00A651;  
  const COLOR_TIRE = 0x111111;

  const chassisMat = new THREE.MeshStandardMaterial({ color: COLOR_CHASSIS, roughness: 0.3, metalness: 0.2 });
  const accentMat = new THREE.MeshStandardMaterial({ color: COLOR_ACCENT, roughness: 0.3 });
  const metalMat = new THREE.MeshStandardMaterial({ color: 0xAAAAAA, roughness: 0.3, metalness: 0.8 });
  const tireMat = new THREE.MeshStandardMaterial({ color: COLOR_TIRE, roughness: 0.9 });
  const rimMat = new THREE.MeshStandardMaterial({ color: COLOR_ACCENT, roughness: 0.4, metalness: 0.5 });
  const whitePlasticMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2 });
  const blackGlassMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.0, metalness: 0.9 });

  // 1. MAIN BODY BOX
  const chassisGeo = new THREE.BoxGeometry(1.6, 1.8, 1.0);
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 1.3; 
  chassis.castShadow = true;
  group.add(chassis);

  // --- SWAPPED: SCREEN NOW ON +Z FACE (The "Back" face in local coords, but "Front" to user) ---
  const screenTex = createScreenTexture();
  const screenMat = new THREE.MeshBasicMaterial({ map: screenTex });
  const screenGeo = new THREE.PlaneGeometry(1.4, 0.9); // Width fits the 1.6 chassis width well
  const screen = new THREE.Mesh(screenGeo, screenMat);
  
  // Position on +Z Face (Local Front/Back)
  screen.position.set(0, 1.55, 0.51); 
  // No rotation needed for Plane facing +Z
  group.add(screen);

  // --- SWAPPED: LOGO PANEL NOW ON +Z FACE ---
  const logoTex = createLogoTexture();
  const logoMat = new THREE.MeshBasicMaterial({ map: logoTex, transparent: true });
  const logoGeo = new THREE.PlaneGeometry(1.4, 0.4); 
  const logoMesh = new THREE.Mesh(logoGeo, logoMat);
  logoMesh.position.set(0, 0.85, 0.51); // Below screen on +Z
  group.add(logoMesh);


  // --- SWAPPED: CONTROL PANEL NOW ON -X FACE (Left Side) ---
  const controlTex = createControlPanelTexture();
  const controlMat = new THREE.MeshBasicMaterial({ map: controlTex });
  // Side is depth=1.0. Panel should fit.
  const controlGeo = new THREE.PlaneGeometry(0.9, 1.6); 
  const controlMesh = new THREE.Mesh(controlGeo, controlMat);
  
  // Position on -X Face
  controlMesh.position.set(-0.81, 1.4, 0); 
  controlMesh.rotation.y = -Math.PI / 2; // Face Left
  group.add(controlMesh);


  // 4. SIDE "PULL" BADGE 
  // Keep it on the same side (-X) but maybe lower or move to Right side (+X) to avoid overlap?
  // User said "exchange position". 
  // Let's put the PULL badge on the OTHER side (+X) or just below controls if it fits.
  // The control panel takes up most of the side.
  // Let's move the PULL badge to the Right Side (+X) to be clean.
  const badgeGroup = new THREE.Group();
  const badgeGeo = new THREE.BoxGeometry(0.5, 0.15, 0.05);
  const badge = new THREE.Mesh(badgeGeo, accentMat);
  badgeGroup.add(badge);

  const pullTextTex = createTextTexture('PULL', 256, 128, null, '#FFFFFF', 60);
  const pullTextMat = new THREE.MeshBasicMaterial({ map: pullTextTex, transparent: true });
  const pullTextGeo = new THREE.PlaneGeometry(0.5, 0.25);
  const pullText = new THREE.Mesh(pullTextGeo, pullTextMat);
  pullText.position.z = 0.03;
  badgeGroup.add(pullText);

  // Place on Right (+X)
  badgeGroup.position.set(0.81, 0.6, 0.3); 
  badgeGroup.rotation.y = Math.PI / 2;
  group.add(badgeGroup);


  // 6. WHEELS
  const wheelPositions = [
    { x: 0.6, z: 0.35 }, { x: -0.6, z: 0.35 },
    { x: 0.6, z: -0.35 }, { x: -0.6, z: -0.35 }
  ];
  
  const wheelRadius = 0.35;
  const wheelWidth = 0.2;
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 32);
  const rimGeo = new THREE.TorusGeometry(0.15, 0.08, 16, 32);
  
  wheelPositions.forEach(pos => {
    const wGroup = new THREE.Group();
    wGroup.position.set(pos.x, wheelRadius, pos.z * 1.5); 

    const tire = new THREE.Mesh(wheelGeo, tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wGroup.add(tire);

    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.rotation.y = Math.PI / 2;
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.05), metalMat);
    cap.rotation.z = Math.PI / 2;
    wGroup.add(cap);

    wGroup.add(rim);
    group.add(wGroup);
  });


  // 7. FRONT HANDLE (Still at -Z, essentially "behind" the screen view now? 
  // If Screen is +Z, Handle at -Z is opposite.
  // The image shows the handle sticking out relative to the side. 
  // If Screen is +Z, let's keep Handle at -Z (Rear of screen, Front of pulling).
  const handleGroup = new THREE.Group();
  const armGeo = new THREE.BoxGeometry(0.1, 0.05, 0.8);
  const arm = new THREE.Mesh(armGeo, chassisMat);
  arm.position.set(0, 0, -0.6); 
  handleGroup.add(arm);

  const tabGeo = new THREE.BoxGeometry(0.4, 0.1, 0.15);
  const tab = new THREE.Mesh(tabGeo, accentMat);
  tab.position.set(0, 0, -1.0);
  handleGroup.add(tab);

  const pullTabTex = createTextTexture('PULL', 128, 64, null, '#FFFFFF', 40);
  const pullTabMat = new THREE.MeshBasicMaterial({ map: pullTabTex, transparent: true });
  const pullTabLabel = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), pullTabMat);
  pullTabLabel.position.set(0, 0.06, -1.0);
  pullTabLabel.rotation.x = -Math.PI / 2; 
  handleGroup.add(pullTabLabel);

  handleGroup.position.y = 0.6;
  group.add(handleGroup);


  // 8. SOLAR PANELS
  const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6);
  const pole = new THREE.Mesh(poleGeo, chassisMat);
  pole.position.set(0, 2.4, 0); 
  group.add(pole);

  const solarGroup = new THREE.Group();
  solarGroup.position.set(0, 2.7, 0);
  
  const solarTex = createSolarTexture();
  const solarMat = new THREE.MeshStandardMaterial({ map: solarTex, roughness: 0.2, metalness: 0.5 });
  
  const panelGeo = new THREE.BoxGeometry(1.2, 0.05, 0.8);
  const leftPanel = new THREE.Mesh(panelGeo, solarMat);
  leftPanel.position.set(-0.65, 0, 0);
  solarGroup.add(leftPanel);

  const rightPanel = new THREE.Mesh(panelGeo, solarMat);
  rightPanel.position.set(0.65, 0, 0);
  solarGroup.add(rightPanel);

  solarGroup.rotation.x = 0.2; 
  group.add(solarGroup);


  // 9. SECURITY CAMERA (Relative to Screen which is now +Z)
  // Screen is +Z. Top Right of +Z face is (+X, +Y, +Z).
  const camGroup = new THREE.Group();
  camGroup.position.set(0.9, 2.3, 0.6); // Moved to +X side

  const bracketGeo = new THREE.BoxGeometry(0.2, 0.05, 0.2);
  const bracket = new THREE.Mesh(bracketGeo, whitePlasticMat);
  camGroup.add(bracket);

  const domeGeo = new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const dome = new THREE.Mesh(domeGeo, whitePlasticMat);
  dome.rotation.x = Math.PI; 
  dome.position.y = -0.05;
  camGroup.add(dome);

  const lensGeo = new THREE.SphereGeometry(0.06, 16, 16);
  const lens = new THREE.Mesh(lensGeo, blackGlassMat);
  lens.position.set(0, -0.15, 0.08); 
  camGroup.add(lens);

  group.add(camGroup);


  // --- PHYSICS & LOGIC ---
  let currentZ = 5; 
  let speed = 0;
  const MAX_SPEED = 0.8;
  const ACCEL = 0.02;
  const DECEL = 0.03;
  const CLEARANCE = 0.02;

  function update(deltaTime: number, input: { forward: boolean; backward: boolean }) {
    if (input.forward) {
      speed = Math.min(speed + ACCEL, MAX_SPEED);
    } else if (input.backward) {
      speed = Math.max(speed - DECEL, -MAX_SPEED);
    } else {
      if (speed > 0) speed = Math.max(speed - DECEL, 0);
      else if (speed < 0) speed = Math.min(speed + DECEL, 0);
    }

    currentZ -= speed * (deltaTime * 60);

    const { position, rotation } = getGlobePosition(0, currentZ, 0);
    group.position.copy(position);
    group.quaternion.copy(rotation);

    const dist = group.position.length();
    if (dist < GLOBE_RADIUS) {
      group.position.setLength(GLOBE_RADIUS + CLEARANCE);
    }
  }

  return {
    mesh: group,
    update,
    getPosition: () => currentZ,
    setPosition: (z: number) => { currentZ = z; }
  };
}