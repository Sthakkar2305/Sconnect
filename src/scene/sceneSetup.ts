import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createGround } from './ground';
import { createBuildings } from './buildings';
import { createTemples } from './temples';
import { createTrees } from './trees';
import { createParks } from './playground';
import { createHorseAndChariot } from './chariot';

export function initScene(
  container: HTMLDivElement,
  setIsRunning: (running: boolean) => void,
  onChariotMove: (z: number) => void
) {
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let horseAndChariot: THREE.Group;
  let chariotZPosition = 5;
  let targetZPosition = 5;
  let chariotSpeed = 0;

  // --- Normal Speeds ---
  const maxSpeed = 0.9;
  const acceleration = 0.05;
  const deceleration = 0.05;

  // --- ADD THESE ---
  // We'll use these faster speeds for the "Start" button tour
  const tourMaxSpeed = 2.7; // 3x faster
  const tourAcceleration = 0.1;
  const tourDeceleration = 0.1;
  // -----------------

  let animationFrameId: number;
  let isRunning = false;

  // --- ADD THIS ---
  let isTouring = false;
  // ----------------

  // --- UPDATE goTo ---
  // Add an 'isTour' flag
  function goTo(z: number, isTour: boolean = false) {
    targetZPosition = z;
    isRunning = true;
    setIsRunning(true);
    isTouring = isTour; // Set the tour flag
  }
  // -----------------

  function init() {
    // ... (init function stays exactly the same) ...
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 30, 150);

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(12, 8, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(30, 50, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = -50;
    dirLight.shadow.camera.left = -50;
    dirLight.shadow.camera.right = 50;
    scene.add(dirLight);

    createGround(scene);
    createBuildings(scene);
    createTemples(scene);
    createParks(scene);
    createTrees(scene);

    horseAndChariot = createHorseAndChariot();
    horseAndChariot.position.set(0, 0.25, 5);
    scene.add(horseAndChariot);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    animate();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      goTo(-260, false); // Pass false for user control
    }
    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      goTo(5, false); // Pass false for user control
    }
  }

  function onKeyUp(event: KeyboardEvent) {
    // ... (onKeyUp function stays exactly the same) ...
    if (
      event.key === 'ArrowUp' ||
      event.key === 'w' ||
      event.key === 'W' ||
      event.key === 'ArrowDown' ||
      event.key === 's' ||
      event.key === 'S'
    ) {
      // Don't stop if we're on a tour
      if (!isTouring) {
        isRunning = false;
        setIsRunning(false);
      }
    }
  }

  function onWindowResize() {
    // ... (onWindowResize function stays exactly the same) ...
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    // --- UPDATE ANIMATION LOGIC ---
    // 1. Check if we are in "Tour Mode" to set the speed
    const currentMaxSpeed = isTouring ? tourMaxSpeed : maxSpeed;
    const currentAcceleration = isTouring ? tourAcceleration : acceleration;
    const currentDeceleration = isTouring ? tourDeceleration : deceleration;

    // 2. Standard physics logic (uses the speeds from step 1)
    if (isRunning && Math.abs(chariotZPosition - targetZPosition) > 0.5) {
      chariotSpeed = Math.min(
        chariotSpeed + currentAcceleration,
        currentMaxSpeed
      );
    } else {
      chariotSpeed = Math.max(chariotSpeed - currentDeceleration, 0);
    }

    if (chariotZPosition > targetZPosition) {
      chariotZPosition -= chariotSpeed;
      if (chariotZPosition < targetZPosition) chariotZPosition = targetZPosition;
    } else if (chariotZPosition < targetZPosition) {
      chariotZPosition += chariotSpeed;
      if (chariotZPosition > targetZPosition) chariotZPosition = targetZPosition;
    }

    horseAndChariot.position.z = chariotZPosition;
    onChariotMove(chariotZPosition);

    // 3. Auto-return logic for Tour Mode
    if (isTouring && Math.abs(chariotZPosition - targetZPosition) < 1.5) {
      if (targetZPosition === -260) {
        // We reached the end, now go home
        goTo(5, true);
      } else if (targetZPosition === 5) {
        // We reached home, stop the tour
        isTouring = false;
        isRunning = false;
        setIsRunning(false);
      }
    }

    // 4. Make camera faster during tour
    const cameraLerp = isTouring ? 0.2 : 0.1;
    camera.position.z = THREE.MathUtils.lerp(
      camera.position.z,
      chariotZPosition + 15,
      cameraLerp // Use the dynamic camera speed
    );
    // --- END OF ANIMATION UPDATES ---

    controls.target.z = chariotZPosition;
    controls.update();
    renderer.render(scene, camera);
  }

  init();

  return {
    cleanup: () => {
      // ... (cleanup function stays exactly the same) ...
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', onWindowResize);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      container.removeChild(renderer.domElement);
      renderer.dispose();
    },
    goTo: goTo,
  };
}