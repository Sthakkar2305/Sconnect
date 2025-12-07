import * as THREE from 'three';
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
  onMachineClick: () => void
) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SECTOR_CONFIG.city.fog);
  scene.fog = new THREE.Fog(SECTOR_CONFIG.city.fog, 25, 70);

  // --- RESPONSIVE CAMERA SETUP ---
  // --- CHANGES FOR sceneSetup.ts ---

  // Change 1: Reduce FOV from 100 to 90 (or 85)
  // const camera = new THREE.PerspectiveCamera(100, window.innerWidth / window.innerHeight, 0.1, 1000);
  const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000); // 90 is a good balance

  // Change 2: Adjust mobile camera position (bring Z closer)
  const updateCameraPosition = () => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      // New: Bring Z closer to make buildings appear larger.
      camera.position.set(0, GLOBE_RADIUS + 12, 25);
      camera.lookAt(0, GLOBE_RADIUS - 2, -60);
    } else {
      camera.position.set(0, GLOBE_RADIUS + 6, 20);
      camera.lookAt(0, GLOBE_RADIUS - 5, -60);
    }
  };
  updateCameraPosition();

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  // Handle high pixel density screens (retina displays) for sharpness
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  scene.add(sunLight);

  // Groups
  const worldGroup = new THREE.Group();
  scene.add(worldGroup);

  // --- BUILD WORLD ---
  createGround(worldGroup);
  createGlobalRoadMarkings(worldGroup);
  createCitySector(worldGroup);
  createTempleSector(worldGroup);
  createBeachSector(worldGroup);

  // --- 3D TEXT LABELS ---
  // We scale these down slightly so they fit better on mobile screens
  generate3DText(worldGroup, "WELCOME", (Math.PI * 2) / 3 / 2, "TEXT_WELCOME");
  generate3DText(worldGroup, "BOOK DEMO", Math.PI, "LINK_BOOK_DEMO");
  generate3DText(worldGroup, "CONTACT US", (Math.PI * 5) / 3, "LINK_CONTACT");

  const cars = generateCityCars(worldGroup);
  const carClock = new THREE.Clock();

  const { machineScreenMat } = createPlayerMachine(scene);

  // --- LOGIC ---
  let scrollPos = 0;
  let targetScrollPos = 0;
  let animationFrameId: number;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  const interactableNames = ['TV_SCREEN_FRONT', 'UPLOAD_BUTTON', 'LINK_BOOK_DEMO', 'LINK_CONTACT'];

  // Scroll Handling
  let touchStartY = 0;
  const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
  const onTouchMove = (e: TouchEvent) => {
    // New: Decreased sensitivity for smoother rotation/clearer viewing
    targetScrollPos += (touchStartY - e.touches[0].clientY) * 0.004; 
    touchStartY = e.touches[0].clientY;
};
  const onWheel = (e: WheelEvent) => {
    targetScrollPos += e.deltaY * 0.002;
    e.preventDefault();
  };

  const onClick = (e: MouseEvent) => {
    // Standardize coordinate calculation
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const hit = intersects.find(i => interactableNames.includes(i.object.name));

    if (hit) {
      switch (hit.object.name) {
        case 'TV_SCREEN_FRONT':
        case 'UPLOAD_BUTTON':
          onMachineClick();
          break;
        case 'LINK_BOOK_DEMO':
          window.location.href = '/book-demo';
          break;
        case 'LINK_CONTACT':
          window.location.href = 'tel:+918758649149';
          break;
      }
    }
  };

  const onMouseMove = (e: MouseEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    const isHovering = intersects.some(i => interactableNames.includes(i.object.name));

    document.body.style.cursor = isHovering ? 'pointer' : 'default';
  };

  window.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('touchstart', onTouchStart);
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('click', onClick);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onWindowResize);

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateCameraPosition(); // Recalculate position on resize
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
      currentVibe = "Airport"; targetHex = SECTOR_CONFIG.airport.fog;
    }

    onVibeChange(currentVibe);

    const targetColor = new THREE.Color(targetHex);
    (scene.background as THREE.Color).lerp(targetColor, 0.05);
    scene.fog!.color.lerp(targetColor, 0.05);

    const delta = carClock.getDelta();
    const cityEndAngle = (Math.PI * 2) / 3;

    cars.forEach(car => {
      car.angle += car.speed * delta;
      if (car.angle > cityEndAngle) {
        car.angle = 0;
      }
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

function generate3DText(worldGroup: THREE.Group, textStr: string, angle: number, name: string) {
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
  // Reduced geometry size slightly to fit mobile screens better
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(25, 12.5), new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }));

  mesh.name = name;
  mesh.position.y = GLOBE_RADIUS + 12;

  const pivot = new THREE.Object3D();
  pivot.rotation.x = -angle;
  pivot.add(mesh);
  worldGroup.add(pivot);
}

// ... existing generateCityCars function ...
function generateCityCars(worldGroup: THREE.Group) {
  // (Keep the existing implementation of generateCityCars from previous steps)
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