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

  // --- Logic variables ---
  let chariotZPosition = 5;
  let targetZPosition = 5;
  let chariotSpeed = 0;

  const STOPS = [5, 0, -147, -227];
  let currentStopIndex = 0;

  const maxSpeed = 0.9;
  const acceleration = 0.05;
  const deceleration = 0.05;
  
  const tourMaxSpeed = 1.2; 
  const tourAcceleration = 0.05;
  const tourDeceleration = 0.05;

  const RATH_HEIGHT = 0.3;

  let animationFrameId: number;
  let isRunning = false;
  let isTouring = false;

  function goTo(z: number, isTour: boolean = false) {
    targetZPosition = z;
    isRunning = true;
    setIsRunning(true);
    isTouring = isTour;
  }

  function init() {
    scene = new THREE.Scene();

    const skyColor = 0xFFEA00;
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.Fog(skyColor, 150, 350);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    // --- FIX: SET INITIAL UP VECTOR TO AVOID FLIPPING ---
    // At start (Z=5), the globe normal is roughly (0, 0, 1). 
    // Default camera up is (0, 1, 0). 
    // Since view direction is along Y, (0,1,0) causes a singularity/flip.
    camera.up.set(0, 0, 1); 

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
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -150;
    sunLight.shadow.camera.right = 150;
    sunLight.shadow.camera.top = 150;
    sunLight.shadow.camera.bottom = -150;
    scene.add(sunLight);

    const sunGeo = new THREE.SphereGeometry(15, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.position.copy(sunLight.position).normalize().multiplyScalar(GLOBE_RADIUS * 2.5);
    scene.add(sunMesh);

    createGround(scene);
    createBuildings(scene);
    createTemples(scene);
    createParks(scene);
    createTrees(scene);

    const chariotCtrl = createChariot(scene);
    horseAndChariot = chariotCtrl.mesh;
    scene.add(horseAndChariot);

    updateChariotPosition();
    
    // Snap camera immediately with the corrected UP vector
    updateCamera(true);

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    animate();
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

  function updateCamera(snap: boolean = false) {
    if (!horseAndChariot) return;

    // Calculate Surface Normal
    const globeNormal = horseAndChariot.position.clone().normalize();

    if (isRunning || snap) {
      const targetOffset = new THREE.Vector3(0, 5, 13);
      const worldOffset = targetOffset.clone().applyQuaternion(horseAndChariot.quaternion);
      const idealPosition = horseAndChariot.position.clone().add(worldOffset);

      if (snap) {
        camera.position.copy(idealPosition);
        // FORCE the Up vector instantly on snap to prevent flipping
        camera.up.copy(globeNormal);
        camera.lookAt(horseAndChariot.position);
      } else {
        camera.position.lerp(idealPosition, 0.05);
        
        // Smoothly adjust Up vector during movement
        const currentUp = camera.up.clone();
        currentUp.lerp(globeNormal, 0.1);
        camera.up.copy(currentUp);
      }
    } else {
      // Even when stopped, we must maintain the correct Up orientation for the orbit controls
      // otherwise dragging the mouse might flip the camera
      const currentUp = camera.up.clone();
      currentUp.lerp(globeNormal, 0.1);
      camera.up.copy(currentUp);
    }
    
    controls.target.lerp(horseAndChariot.position, 0.1);
    controls.update();
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowUp' || event.key === 'w' || event.key === 'W') {
      if (currentStopIndex < STOPS.length - 1) {
        currentStopIndex++;
        goTo(STOPS[currentStopIndex], false);
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
    updateCamera(false);
    
    // We update controls inside updateCamera now, but doing it here is also fine/redundant
    // controls.update(); 

    onChariotMove(chariotZPosition);

    if (Math.abs(chariotZPosition - targetZPosition) < 0.5) {
      if (isTouring) {
        if (targetZPosition < -1000) {
          chariotZPosition = 5;
          targetZPosition = 5;
          currentStopIndex = 0;
          isTouring = false;
          isRunning = false;
          setIsRunning(false);
          updateChariotPosition();
          updateCamera(true);
        }
      } else {
        isRunning = false;
        setIsRunning(false);
      }
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