import * as THREE from 'three';
import { createGround } from './ground';
import { createCitySector, createGlobalRoadMarkings } from './buildings';
import { createTempleSector } from './temples';
import { createBeachSector } from './playground';
import { createNatureSector } from './nature';
import { createPlayerMachine } from './chariot';
import { GLOBE_RADIUS } from './curvePlacement';

const SECTOR_CONFIG = {
  city: { fog: 0xffde00 },
  temple: { fog: 0xFFE0B2 },
  nature: { fog: 0x4caf50 },
  airport: { fog: 0x87CEEB }
};

const ANGLES = {
  WELCOME: 0.7,
  ABOUT: Math.PI * 0.75,
  DEMO: Math.PI + 0.8,
  CONTACT: Math.PI * 1.75
};

export function initScene(
  container: HTMLDivElement,
  onVibeChange: (vibe: string) => void,
  onMachineClick: () => void,
  onBookDemoClick: () => void,
  onContactClick: () => void,
  onAboutClick: () => void
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SECTOR_CONFIG.temple.fog);
  scene.fog = new THREE.Fog(SECTOR_CONFIG.temple.fog, 50, 120);

  const camera = new THREE.PerspectiveCamera(85, window.innerWidth / window.innerHeight, 0.1, 1000);

  const updateCameraPosition = () => {
    const aspect = window.innerWidth / window.innerHeight;
    const isPortrait = aspect < 1.0; 
    const isMobile = window.innerWidth < 768;
    if (isPortrait || isMobile) {
      camera.position.set(0, GLOBE_RADIUS + 22, 68);
      camera.lookAt(0, GLOBE_RADIUS - 2, -15);
    } else {
      camera.position.set(0, GLOBE_RADIUS + 6, 20);
      camera.lookAt(0, GLOBE_RADIUS - 5, -60);
    }
  };
  updateCameraPosition();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  scene.add(sunLight);

  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // --- BUILD WORLD ---
  createGround(worldGroup);
  createGlobalRoadMarkings(worldGroup);
  
  createTempleSector(worldGroup); 
  
  // FIX: Capture the blades array. If nature.ts doesn't return anything, use empty array to prevent crash.
  // @ts-ignore (Ignores type check if nature.ts hasn't been updated to return array yet)
  const windBlades = createNatureSector(worldGroup) || []; 
  
  createCitySector(worldGroup);   
  createBeachSector(worldGroup);  

  createGlobalClouds(worldGroup);

  // --- TEXT LABELS ---
  generate3DText(worldGroup, "WELCOME", ANGLES.WELCOME, "TEXT_WELCOME", 15);
  generate3DText(worldGroup, "ABOUT US", ANGLES.ABOUT, "LINK_ABOUT", 15);
  generate3DText(worldGroup, "BOOK DEMO", ANGLES.DEMO, "LINK_BOOK_DEMO", 15);
  generate3DText(worldGroup, "CONTACT US", ANGLES.CONTACT, "LINK_CONTACT", 15);

  const cars = generateCityCars(worldGroup);
  const carClock = new THREE.Clock();

  const { machineScreenMat } = createPlayerMachine(scene);

  // --- INITIAL SCROLL POSITION ---
  let scrollPos = -0.1; 
  let targetScrollPos = -0.1;
  
  let isAutoScrolling = false; 
  let autoScrollCallback: (() => void) | null = null;
  let animationFrameId: number;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const singleClickNames = ['UPLOAD_BUTTON', 'LINK_BOOK_DEMO', 'LINK_CONTACT', 'LINK_ABOUT'];
  const doubleClickNames = ['TV_SCREEN_FRONT', 'TV_SCREEN_BACK'];

  let touchStartY = 0;
  let lastTapTime = 0;

  const onTouchStart = (e: TouchEvent) => {
    isAutoScrolling = false; 
    touchStartY = e.touches[0].clientY;
    const currentTime = new Date().getTime();
    if (currentTime - lastTapTime < 300) {
        const touch = e.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const hit = raycaster.intersectObjects(scene.children, true).find(i => doubleClickNames.includes(i.object.name));
        if (hit) { e.preventDefault(); onMachineClick(); }
    }
    lastTapTime = currentTime;
  };

  const onTouchMove = (e: TouchEvent) => {
    isAutoScrolling = false;
    targetScrollPos += (touchStartY - e.touches[0].clientY) * 0.005; 
    touchStartY = e.touches[0].clientY;
  };
  
  const onWheel = (e: WheelEvent) => {
    isAutoScrolling = false;
    targetScrollPos += e.deltaY * 0.002;
    e.preventDefault();
  };

  const onClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(scene.children, true).find(i => singleClickNames.includes(i.object.name));
    if (hit) {
      switch (hit.object.name) {
        case 'UPLOAD_BUTTON': onMachineClick(); break;
        case 'LINK_BOOK_DEMO': onBookDemoClick(); break;
        case 'LINK_CONTACT': onContactClick(); break;
        case 'LINK_ABOUT': onAboutClick(); break;
      }
    }
  };

  const onDoubleClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(scene.children, true).find(i => doubleClickNames.includes(i.object.name));
    if (hit) { onMachineClick(); }
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const isHovering = raycaster.intersectObjects(scene.children, true).some(i => [...singleClickNames, ...doubleClickNames].includes(i.object.name));
    document.body.style.cursor = isHovering ? 'pointer' : 'default';
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart, { passive: false });
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('click', onClick);
  window.addEventListener('dblclick', onDoubleClick);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition(); 
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const lerpFactor = isAutoScrolling ? 0.03 : 0.1;
    scrollPos += (targetScrollPos - scrollPos) * lerpFactor;
    worldGroup.rotation.x = scrollPos;

    if (isAutoScrolling && Math.abs(scrollPos - targetScrollPos) < 0.01) {
        isAutoScrolling = false;
        if (autoScrollCallback) { autoScrollCallback(); autoScrollCallback = null; }
    }

    let normRot = scrollPos % (Math.PI * 2);
    if (normRot < 0) normRot += Math.PI * 2;
    
    let currentVibe = "Welcome"; 
    let targetHex = SECTOR_CONFIG.temple.fog;

    if (normRot >= 0 && normRot < Math.PI/2) {
        currentVibe = "Welcome"; targetHex = SECTOR_CONFIG.temple.fog;
    }
    else if (normRot >= Math.PI/2 && normRot < Math.PI) {
        currentVibe = "About Us"; targetHex = SECTOR_CONFIG.nature.fog;
    }
    else if (normRot >= Math.PI && normRot < (Math.PI * 3)/2) {
        currentVibe = "Book Demo"; targetHex = SECTOR_CONFIG.city.fog;
    }
    else {
        currentVibe = "Contact Us"; targetHex = SECTOR_CONFIG.airport.fog;
    }

    onVibeChange(currentVibe);

    const targetColor = new THREE.Color(targetHex);
    (scene.background as THREE.Color).lerp(targetColor, 0.05);
    scene.fog!.color.lerp(targetColor, 0.05);

    const delta = carClock.getDelta();

    // --- FIX: ROTATE WINDMILLS ---
    if (windBlades && windBlades.length > 0) {
        windBlades.forEach((bladeGroup: THREE.Group, index: number) => {
            const speed = 2.0 + (index * 0.5); 
            bladeGroup.rotation.z -= speed * delta; 
        });
    }

    cars.forEach(car => {
      car.angle += car.speed * delta;
      if (car.angle > (Math.PI * 3)/2) car.angle = Math.PI; 
      car.pivot.rotation.x = -car.angle;
    });

    renderer.render(scene, camera);
  }

  animate();

  const scrollTo = (target: 'ABOUT' | 'DEMO' | 'CONTACT', onArrival: () => void) => {
      isAutoScrolling = true;
      autoScrollCallback = onArrival;
      const angle = ANGLES[target];
      const cycle = Math.floor(targetScrollPos / (Math.PI * 2));
      let newTarget = cycle * (Math.PI * 2) + angle;
      if (newTarget < targetScrollPos - Math.PI) newTarget += Math.PI * 2;
      targetScrollPos = newTarget;
  };

  return {
    cleanup: () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('click', onClick);
      window.removeEventListener('dblclick', onDoubleClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    },
    updateScreen: (texture: THREE.Texture) => {
      if (machineScreenMat) {
        machineScreenMat.map = texture;
        machineScreenMat.needsUpdate = true;
      }
    },
    scrollTo
  };
}

function createGlobalClouds(worldGroup: THREE.Group) {
    const cloudGeo = new THREE.SphereGeometry(1, 7, 7);
    const cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
    const cloudCount = 60; 
    for (let i = 0; i < cloudCount; i++) {
        const cloudGroup = new THREE.Group();
        for (let j = 0; j < 5; j++) {
            const m = new THREE.Mesh(cloudGeo, cloudMat);
            m.position.set((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 3);
            m.scale.setScalar(1 + Math.random());
            cloudGroup.add(m);
        }
        const pivot = new THREE.Object3D();
        const angle = Math.random() * Math.PI * 2;
        pivot.rotation.x = -angle; 
        pivot.rotation.z = (Math.random() - 0.5) * 0.8; 
        cloudGroup.position.y = GLOBE_RADIUS + 20 + Math.random() * 15;
        pivot.add(cloudGroup);
        worldGroup.add(pivot);
    }
}

function generate3DText(worldGroup: THREE.Group, textStr: string, angle: number, name: string, extraHeight: number = 12) {
    const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '900 120px "Segoe UI", sans-serif'; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 10; ctx.strokeStyle = 'black'; ctx.lineWidth = 4;
      ctx.strokeText(textStr, canvas.width / 2, canvas.height / 2); ctx.fillText(textStr, canvas.width / 2, canvas.height / 2);
    }
    const tex = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
    mesh.name = name; mesh.position.y = GLOBE_RADIUS + extraHeight;
    const pivot = new THREE.Object3D(); pivot.rotation.x = -angle; pivot.add(mesh); worldGroup.add(pivot);
}

// --- NEW FUNCTION: 3 REALISTIC CAR TYPES ---
function createRealisticCar(type: 'nano' | 'xuv' | 'mercedes', color: number) {
  const carGroup = new THREE.Group();

  const mainMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.2, metalness: 0.4 });
  const darkMat = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.8 }); // Bumpers/Tires
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.0, metalness: 0.9 }); // Windows
  const rimMat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.8 }); // Silver rims
  const yellowLight = new THREE.MeshBasicMaterial({ color: 0xffffaa });
  const redLight = new THREE.MeshBasicMaterial({ color: 0xff0000 });

  let bodyGeo, cabinGeo;
  let wheelRadius, wheelWidth, chassisY, cabinY;

  // --- 1. Define Geometry based on Type ---
  if (type === 'nano') {
      // NANO: Small, Tall, Stubby
      bodyGeo = new THREE.BoxGeometry(3.2, 1.2, 1.8);
      cabinGeo = new THREE.BoxGeometry(2.0, 0.9, 1.6); // Tall cabin
      wheelRadius = 0.3; wheelWidth = 0.25;
      chassisY = 0.5; cabinY = 1.3;
  } 
  else if (type === 'xuv') {
      // XUV 700: Big, Boxy, High Ground Clearance
      bodyGeo = new THREE.BoxGeometry(4.8, 1.4, 2.2);
      cabinGeo = new THREE.BoxGeometry(3.0, 0.8, 2.0);
      wheelRadius = 0.45; wheelWidth = 0.35;
      chassisY = 0.7; cabinY = 1.6;
  } 
  else { // 'mercedes'
      // MERCEDES: Long, Sleek, Low
      bodyGeo = new THREE.BoxGeometry(5.2, 1.0, 2.0);
      cabinGeo = new THREE.BoxGeometry(2.8, 0.7, 1.8);
      wheelRadius = 0.38; wheelWidth = 0.3;
      chassisY = 0.5; cabinY = 1.2;
  }

  // --- 2. Build Car Parts ---
  
  // Body
  const body = new THREE.Mesh(bodyGeo, mainMat);
  body.position.y = chassisY; 
  carGroup.add(body);

  // Cabin (Glass area)
  const cabin = new THREE.Mesh(cabinGeo, glassMat);
  cabin.position.set(-0.2, cabinY, 0);
  carGroup.add(cabin);

  // Roof (Top of cabin)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(cabinGeo.parameters.width * 0.95, 0.1, cabinGeo.parameters.depth * 0.95), mainMat);
  roof.position.set(-0.2, cabinY + (cabinGeo.parameters.height/2), 0);
  carGroup.add(roof);

  // Headlights (Front)
  const hlGeo = new THREE.BoxGeometry(0.1, 0.2, 0.4);
  const bodyW = bodyGeo.parameters.width;
  const bodyD = bodyGeo.parameters.depth;
  
  const hlL = new THREE.Mesh(hlGeo, yellowLight); hlL.position.set(bodyW/2, chassisY + 0.2, bodyD/2 - 0.3); carGroup.add(hlL);
  const hlR = hlL.clone(); hlR.position.z = -(bodyD/2 - 0.3); carGroup.add(hlR);

  // Taillights (Rear)
  const tlL = new THREE.Mesh(hlGeo, redLight); tlL.position.set(-bodyW/2, chassisY + 0.2, bodyD/2 - 0.3); carGroup.add(tlL);
  const tlR = tlL.clone(); tlR.position.z = -(bodyD/2 - 0.3); carGroup.add(tlR);

  // Wheels
  const wheelGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 16);
  wheelGeo.rotateX(Math.PI/2);
  
  // Calculate wheel positions based on body size
  const wx = bodyW / 2 - 0.8;
  const wz = bodyD / 2; // flush with body
  
  const wheelPos = [
      { x: wx, z: wz }, { x: wx, z: -wz },   // Front
      { x: -wx, z: wz }, { x: -wx, z: -wz }  // Back
  ];

  wheelPos.forEach(p => {
      const w = new THREE.Mesh(wheelGeo, darkMat);
      w.position.set(p.x, wheelRadius, p.z);
      
      // Rim/Hubcap
      const rim = new THREE.Mesh(new THREE.CylinderGeometry(wheelRadius * 0.6, wheelRadius * 0.6, wheelWidth + 0.05, 8), rimMat);
      rim.rotation.x = Math.PI/2;
      rim.position.copy(w.position);
      
      carGroup.add(w);
      carGroup.add(rim);
  });

  return carGroup;
}

function generateCityCars(worldGroup: THREE.Group) {
  const cars: any[] = [];
  const carCount = 6; // Increased count slightly
  const COLORS = [0xE74C3C, 0xF1C40F, 0x3498DB, 0xFFFFFF, 0x333333, 0x888888];
  
  // Cars belong to City Sector (180 to 270)
  const sectorStart = Math.PI; 
  const sectorEnd = (Math.PI * 3)/2; 
  const range = sectorEnd - sectorStart;

  for (let i = 0; i < carCount; i++) {
    const angle = sectorStart + (i / carCount) * range;
    const side = i % 2 === 0 ? 1 : -1;
    const speed = 0.1 + Math.random() * 0.1;
    
    // Pick a random car type
    const rand = Math.random();
    let type: 'nano' | 'xuv' | 'mercedes' = 'mercedes';
    if(rand < 0.33) type = 'nano';
    else if(rand < 0.66) type = 'xuv';

    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // --- CREATE REALISTIC CAR ---
    const carGroup = createRealisticCar(type, color);
    
    const pivot = new THREE.Object3D();
    const offsetAngle = (8.0 / GLOBE_RADIUS) * side;
    
    // Position on road
    carGroup.position.y = GLOBE_RADIUS + 0.1; 
    
    // Orient car to drive forward
    carGroup.rotation.y = Math.PI / 2;
    // If driving on left side (-1), rotate 180 to face other way? 
    // Usually traffic drives one way on one side. Let's assume standard 2-way traffic.
    if (side === 1) {
       carGroup.rotation.y = -Math.PI / 2; // Face opposite direction
    }

    pivot.add(carGroup); 
    pivot.rotation.x = -angle; 
    pivot.rotation.z = offsetAngle;
    
    worldGroup.add(pivot);
    cars.push({ pivot, angle, speed, side });
  }
  return cars;
}