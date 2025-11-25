import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { createGround } from './ground';
import { createBuildings } from './buildings';
import { createTemples } from './temples';
import { createTrees } from './trees';
import { createParks } from './playground';
import { createChariot } from './chariot';
import { placeOnGlobe, getGlobePosition, GLOBE_RADIUS } from './curvePlacement';

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

  // --- LOGIC VARIABLES ---
  let chariotZPosition = 0; 
  let targetZPosition = 0;
  let chariotSpeed = 0;

  // Stops
  const STOPS = [0, -250, -500];
  let currentStopIndex = 0;

  // Speed Settings
  const maxSpeed = 1.5;
  const acceleration = 0.08;
  const deceleration = 0.08;
  const tourMaxSpeed = 2.4; 
  const tourAcceleration = 0.1;
  const tourDeceleration = 0.1;
  
  const RATH_HEIGHT = 0.3;

  // --- CAMERA CONFIGURATION ---
  
  // 1. HERO VIEW (Stopped): Close, low, focused on screen
  const HERO_OFFSET = new THREE.Vector3(0, 3, 12);
  
  // 2. CHASE VIEW (Running): High, far back, wide view of environment
  const CHASE_OFFSET = new THREE.Vector3(0, 10, 24);

  let animationFrameId: number;
  let isRunning = false;
  let isTouring = false;
  let isLoopingBack = false;

  function goTo(z: number, isTour: boolean = false) {
    targetZPosition = z;
    isRunning = true;
    setIsRunning(true);
    isTouring = isTour;
    isLoopingBack = false;
  }

  function init() {
    scene = new THREE.Scene();

    const skyColor = 0xFFEA00;
    scene.background = new THREE.Color(skyColor);
    // Increased fog distance slightly so we can see further while running
    scene.fog = new THREE.Fog(skyColor, 80, 300);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.up.set(1, 0, 0); 

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxDistance = 500;
    controls.enablePan = true; 

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 0.8);
    sunLight.position.set(100, 100, 50);
    sunLight.castShadow = true;
    scene.add(sunLight);

    // World Generation
    createGround(scene);
    createBuildings(scene); 
    createTemples(scene);
    createParks(scene);
    createTrees(scene);

    const chariotCtrl = createChariot(scene);
    horseAndChariot = chariotCtrl.mesh;
    scene.add(horseAndChariot);

    // Initial Setup
    updateChariotPosition();
    
    // Force snap to Hero View initially (since we are stopped)
    snapToCameraOffset(HERO_OFFSET);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    animate();
  }

  // Helper: Instantly snap camera to a specific offset (used on load/reset)
  function snapToCameraOffset(offsetVec: THREE.Vector3) {
    if (!horseAndChariot) return;
    const worldOffset = offsetVec.clone().applyQuaternion(horseAndChariot.quaternion);
    const idealPosition = horseAndChariot.position.clone().add(worldOffset);
    
    camera.position.copy(idealPosition);
    camera.up.copy(horseAndChariot.position.clone().normalize());
    camera.lookAt(horseAndChariot.position);
    controls.target.copy(horseAndChariot.position);
    controls.update();
  }

  function updateChariotPosition() {
    if (!horseAndChariot) return;
    
    const { position } = getGlobePosition(0, chariotZPosition, RATH_HEIGHT);
    horseAndChariot.position.copy(position);
    horseAndChariot.up.copy(position).normalize();
    
    const moveDir = targetZPosition < chariotZPosition ? -1 : 1;
    const lookAheadPos = getGlobePosition(0, chariotZPosition + moveDir * 1, RATH_HEIGHT).position;
    
    horseAndChariot.lookAt(lookAheadPos);
    horseAndChariot.rotateY(Math.PI); 
  }

  function updateCamera() {
    if (!horseAndChariot) return;

    // DECIDE TARGET OFFSET
    // If running, we use CHASE_OFFSET (High/Wide)
    // If stopped, we use HERO_OFFSET (Low/Close)
    const targetOffset = isRunning ? CHASE_OFFSET : HERO_OFFSET;

    // Calculate World Position
    const worldOffset = targetOffset.clone().applyQuaternion(horseAndChariot.quaternion);
    const idealPosition = horseAndChariot.position.clone().add(worldOffset);

    // Smooth Interpolation
    // We use a slightly faster lerp (0.05) when running to keep up, 
    // and a slower one (0.03) when stopping for a smooth landing.
    const alpha = isRunning ? 0.05 : 0.03;
    camera.position.lerp(idealPosition, alpha);
    
    // Smooth Up Vector
    const globeNormal = horseAndChariot.position.clone().normalize();
    const currentUp = camera.up.clone();
    currentUp.lerp(globeNormal, 0.1);
    camera.up.copy(currentUp);

    // Always look at Chariot
    controls.target.lerp(horseAndChariot.position, 0.1);
    controls.update();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      if (currentStopIndex < STOPS.length - 1) {
        currentStopIndex++;
        goTo(STOPS[currentStopIndex], false);
      } else {
        currentStopIndex = 0; 
        targetZPosition = -754; 
        isRunning = true;
        setIsRunning(true);
        isLoopingBack = true; 
      }
    }
    if (event.key === 'ArrowDown' || event.key === 's' || event.key === 'S') {
      if (currentStopIndex > 0) {
        currentStopIndex--;
        goTo(STOPS[currentStopIndex], false);
      }
    }
  }

  function onKeyUp(event: KeyboardEvent) {}

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    const currentMaxSpeed = isTouring ? tourMaxSpeed : maxSpeed;
    const currentAcceleration = isTouring ? tourAcceleration : acceleration;
    const currentDeceleration = isTouring ? tourDeceleration : deceleration;

    if (isRunning && Math.abs(chariotZPosition - targetZPosition) > 0.5) {
      chariotSpeed = Math.min(chariotSpeed + currentAcceleration, currentMaxSpeed);
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

    updateChariotPosition();
    updateCamera(); // Camera logic now handles the switching inside
    
    onChariotMove(chariotZPosition);

    if (Math.abs(chariotZPosition - targetZPosition) < 0.5) {
      if (isLoopingBack) {
        chariotZPosition = 0;
        targetZPosition = 0;
        isLoopingBack = false;
        // Snap immediately so we don't see the coordinate jump
        snapToCameraOffset(isRunning ? CHASE_OFFSET : HERO_OFFSET);
      }
      
      isRunning = false;
      setIsRunning(false);
    }

    renderer.render(scene, camera);
  }

  init();

  return {
    cleanup: () => {
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