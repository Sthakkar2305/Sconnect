import * as THREE from 'three';
// ... (keep your existing imports) ...
import { createGround } from './ground';
import { createCitySector, createGlobalRoadMarkings } from './buildings';
import { createTempleSector } from './temples';
import { createBeachSector } from './playground';
import { createPlayerMachine } from './chariot';
import { GLOBE_RADIUS } from './curvePlacement';

const SECTOR_CONFIG = {
  city: { fog: 0xffde00 },
  temple: { fog: 0xFFE0B2 },
  airport: { fog: 0x87CEEB }
};

export function initScene(
  container: HTMLDivElement,
  onVibeChange: (vibe: string) => void,
  onMachineClick: () => void,
  onBookDemoClick: () => void // <--- NEW PARAMETER
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SECTOR_CONFIG.city.fog);
  scene.fog = new THREE.Fog(SECTOR_CONFIG.city.fog, 50, 120);

  // ... (Keep camera setup exactly as it was) ...
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
  // ...

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // ... (Keep lighting and group setup) ...
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  scene.add(sunLight);
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // ... (Keep world creation) ...
  createGround(worldGroup);
  createGlobalRoadMarkings(worldGroup);
  createCitySector(worldGroup);
  createTempleSector(worldGroup);
  createBeachSector(worldGroup);

  generate3DText(worldGroup, "WELCOME", (Math.PI * 2) / 3 / 2, "TEXT_WELCOME", 15);
  generate3DText(worldGroup, "BOOK DEMO", Math.PI, "LINK_BOOK_DEMO", 15);
  generate3DText(worldGroup, "CONTACT US", (Math.PI * 5) / 3, "LINK_CONTACT", 15);

  const cars = generateCityCars(worldGroup);
  const carClock = new THREE.Clock();

  const { machineScreenMat } = createPlayerMachine(scene);

  // ... (Keep variables) ...
  let scrollPos = 0;
  let targetScrollPos = 0;
  let animationFrameId: number;
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  
  const singleClickNames = ['UPLOAD_BUTTON', 'LINK_BOOK_DEMO', 'LINK_CONTACT'];
  const doubleClickNames = ['TV_SCREEN_FRONT', 'TV_SCREEN_BACK'];

  // ... (Keep Touch Logic) ...
  let touchStartY = 0;
  let lastTapTime = 0;
  const onTouchStart = (e: TouchEvent) => {
    touchStartY = e.touches[0].clientY;
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime;
    if (tapLength < 300 && tapLength > 0) {
        const touch = e.touches[0];
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);
        const hit = intersects.find(i => doubleClickNames.includes(i.object.name));
        if (hit) { e.preventDefault(); onMachineClick(); }
    }
    lastTapTime = currentTime;
  };
  const onTouchMove = (e: TouchEvent) => {
    targetScrollPos += (touchStartY - e.touches[0].clientY) * 0.005; 
    touchStartY = e.touches[0].clientY;
  };
  const onWheel = (e: WheelEvent) => {
    targetScrollPos += e.deltaY * 0.002;
    e.preventDefault();
  };

  // --- UPDATED CLICK HANDLER ---
  const onClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(i => singleClickNames.includes(i.object.name));

    if (hit) {
      switch (hit.object.name) {
        case 'UPLOAD_BUTTON':
          onMachineClick();
          break;
        case 'LINK_BOOK_DEMO':
          onBookDemoClick(); // <--- CALL THE NEW NAVIGATOR
          break;
        case 'LINK_CONTACT':
          window.location.href = 'tel:+918758649149';
          break;
      }
    }
  };

  // ... (Keep double click, mousemove, resize, animate) ...
  const onDoubleClick = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(i => doubleClickNames.includes(i.object.name));
    if (hit) { onMachineClick(); }
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const allTargets = [...singleClickNames, ...doubleClickNames];
    const intersects = raycaster.intersectObjects(scene.children, true);
    const isHovering = intersects.some(i => allTargets.includes(i.object.name));
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
    scrollPos += (targetScrollPos - scrollPos) * 0.1;
    worldGroup.rotation.x = scrollPos;
    let normRot = scrollPos % (Math.PI * 2);
    if (normRot < 0) normRot += Math.PI * 2;
    let currentVibe = "City";
    let targetHex = SECTOR_CONFIG.city.fog;
    if (normRot >= (Math.PI * 2) / 3 && normRot < (Math.PI * 4) / 3) {
      currentVibe = "Temple"; targetHex = SECTOR_CONFIG.temple.fog;
    } else if (normRot >= (Math.PI * 4) / 3) {
      currentVibe = "Beach"; targetHex = SECTOR_CONFIG.airport.fog;
    }
    onVibeChange(currentVibe);
    const targetColor = new THREE.Color(targetHex);
    (scene.background as THREE.Color).lerp(targetColor, 0.05);
    scene.fog!.color.lerp(targetColor, 0.05);
    const delta = carClock.getDelta();
    cars.forEach(car => {
      car.angle += car.speed * delta;
      if (car.angle > (Math.PI * 2) / 3) car.angle = 0;
      car.pivot.rotation.x = -car.angle;
    });
    renderer.render(scene, camera);
  }
  animate();

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
    }
  };
}

// ... (Rest of functions: generate3DText, generateCityCars) ...
function generate3DText(worldGroup: THREE.Group, textStr: string, angle: number, name: string, extraHeight: number = 12) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(0,0,0,0)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.font = '900 120px "Segoe UI", sans-serif';
    ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = 'black'; ctx.lineWidth = 4;
    ctx.strokeText(textStr, canvas.width / 2, canvas.height / 2);
    ctx.fillText(textStr, canvas.width / 2, canvas.height / 2);
  }
  const tex = new THREE.CanvasTexture(canvas);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(30, 15), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));
  mesh.name = name;
  mesh.position.y = GLOBE_RADIUS + extraHeight;
  const pivot = new THREE.Object3D();
  pivot.rotation.x = -angle;
  pivot.add(mesh);
  worldGroup.add(pivot);
}

function generateCityCars(worldGroup: THREE.Group) {
  const cars: any[] = [];
  const carCount = 8;
  const COLORS = [0xE74C3C, 0xE67E22, 0xF1C40F, 0x3498DB];
  const citySectorEnd = (Math.PI * 2) / 3;
  for (let i = 0; i < carCount; i++) {
    const angle = (i / carCount) * citySectorEnd;
    const side = i % 2 === 0 ? 1 : -1;
    const speed = 0.1 + Math.random() * 0.1;
    const carGroup = new THREE.Group();
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.75, 1.95), new THREE.MeshStandardMaterial({ color }));
    body.position.y = 0.55; carGroup.add(body);
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.6, 1.6), new THREE.MeshStandardMaterial({ color: 0x111111 }));
    cabin.position.set(-0.2, 1.25, 0); carGroup.add(cabin);
    const wMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
    [[1.3, 0.9], [1.3, -0.9], [-1.3, 0.9], [-1.3, -0.9]].forEach(pos => {
      const w = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.3).rotateX(Math.PI / 2), wMat);
      w.position.set(pos[0], 0.35, pos[1]);
      carGroup.add(w);
    });
    const pivot = new THREE.Object3D();
    const offsetAngle = (8.0 / GLOBE_RADIUS) * side;
    carGroup.position.y = GLOBE_RADIUS + 0.15;
    carGroup.rotation.y = Math.PI / 2;
    pivot.add(carGroup);
    pivot.rotation.x = -angle;
    pivot.rotation.z = offsetAngle;
    worldGroup.add(pivot);
    cars.push({ pivot, angle, speed, side });
  }
  return cars;
}