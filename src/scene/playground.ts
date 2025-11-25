import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createParks(scene: THREE.Scene) {
  // NEW POSITION: Z = -500
  const parkZ = -500;

  const positions = [
    { x: 22, z: parkZ },
    { x: -22, z: parkZ - 20 },
    { x: 25, z: parkZ - 40 },
    { x: -25, z: parkZ + 20 },
  ];

  positions.forEach((pos, i) => {
    const group = new THREE.Group();
    
    // Green Patch Base
    const grassGeo = new THREE.CylinderGeometry(15, 15, 0.5, 32);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x4a9d6f, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.y = 0.25;
    grass.receiveShadow = true;
    group.add(grass);

    if (i % 2 === 0) {
      createRealisticSwing(group, 0, 0);
      createRoundabout(group, 6, 4);
    } else {
      createRealisticSlide(group, 0, 0);
      createSeesaw(group, 5, 5);
    }

    createBench(group, -8, 2);
    placeOnGlobe(group, pos.x, pos.z, 0);
    scene.add(group);
  });
}

// ... Include createRealisticSwing, createRealisticSlide, etc. from previous code ...
function createRealisticSwing(group: THREE.Group, x: number, z: number) {
  const metal = new THREE.MeshStandardMaterial({ color: 0x336699, metalness: 0.6, roughness: 0.3 });
  
  // A-Frame Legs
  const legGeo = new THREE.CylinderGeometry(0.1, 0.1, 4.5);
  const topBarGeo = new THREE.CylinderGeometry(0.15, 0.15, 5);

  const swingGroup = new THREE.Group();
  swingGroup.position.set(x, 0, z);

  // Legs (Slanted)
  const leg1 = new THREE.Mesh(legGeo, metal);
  leg1.position.set(-2, 2, 1.5);
  leg1.rotation.x = -0.3;
  swingGroup.add(leg1);

  const leg2 = new THREE.Mesh(legGeo, metal);
  leg2.position.set(-2, 2, -1.5);
  leg2.rotation.x = 0.3;
  swingGroup.add(leg2);

  const leg3 = new THREE.Mesh(legGeo, metal);
  leg3.position.set(2, 2, 1.5);
  leg3.rotation.x = -0.3;
  swingGroup.add(leg3);

  const leg4 = new THREE.Mesh(legGeo, metal);
  leg4.position.set(2, 2, -1.5);
  leg4.rotation.x = 0.3;
  swingGroup.add(leg4);

  // Top Bar
  const topBar = new THREE.Mesh(topBarGeo, metal);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.y = 4;
  swingGroup.add(topBar);

  // Swings (Seats + Chains)
  for(let i of [-1, 1]) {
     const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 2.5);
     const seatGeo = new THREE.BoxGeometry(0.6, 0.1, 0.4);
     const seatMat = new THREE.MeshStandardMaterial({ color: 0xff6600 }); // Orange Seat

     const sPos = i * 1.0;
     
     // Chains
     const c1 = new THREE.Mesh(chainGeo, metal);
     c1.position.set(sPos - 0.25, 2.7, 0);
     swingGroup.add(c1);
     const c2 = new THREE.Mesh(chainGeo, metal);
     c2.position.set(sPos + 0.25, 2.7, 0);
     swingGroup.add(c2);

     // Seat
     const seat = new THREE.Mesh(seatGeo, seatMat);
     seat.position.set(sPos, 1.5, 0);
     swingGroup.add(seat);
  }

  group.add(swingGroup);
}

function createRealisticSlide(group: THREE.Group, x: number, z: number) {
  const plasticRed = new THREE.MeshStandardMaterial({ color: 0xff3333, roughness: 0.2 });
  const metal = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.5 });

  const slideGroup = new THREE.Group();
  slideGroup.position.set(x, 0, z);

  // Ladder
  const ladderGeo = new THREE.BoxGeometry(0.6, 3, 0.1);
  const ladder = new THREE.Mesh(ladderGeo, metal);
  ladder.position.set(0, 1.5, -1.5);
  ladder.rotation.x = -0.2;
  slideGroup.add(ladder);

  // Platform
  const platGeo = new THREE.BoxGeometry(1, 0.1, 1);
  const plat = new THREE.Mesh(platGeo, metal);
  plat.position.set(0, 2.9, -1);
  slideGroup.add(plat);

  // Slide Body (Simple Ramp for now, but smooth)
  const rampGeo = new THREE.BoxGeometry(0.8, 0.1, 4);
  const ramp = new THREE.Mesh(rampGeo, plasticRed);
  ramp.position.set(0, 1.5, 1.2);
  ramp.rotation.x = -0.6;
  slideGroup.add(ramp);

  // Sides
  const sideGeo = new THREE.BoxGeometry(0.1, 0.3, 4);
  const side1 = new THREE.Mesh(sideGeo, plasticRed);
  side1.position.set(0.45, 1.6, 1.2);
  side1.rotation.x = -0.6;
  slideGroup.add(side1);
  
  const side2 = new THREE.Mesh(sideGeo, plasticRed);
  side2.position.set(-0.45, 1.6, 1.2);
  side2.rotation.x = -0.6;
  slideGroup.add(side2);

  group.add(slideGroup);
}

function createRoundabout(group: THREE.Group, x: number, z: number) {
  const baseGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.2, 16);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3366cc });
  const handleMat = new THREE.MeshStandardMaterial({ color: 0xdddddd });

  const round = new THREE.Mesh(baseGeo, mat);
  round.position.set(x, 0.4, z);
  group.add(round);

  const centerPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1), handleMat);
  centerPost.position.set(x, 0.9, z);
  group.add(centerPost);
  
  const wheel = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.05, 8, 16), handleMat);
  wheel.rotation.x = Math.PI / 2;
  wheel.position.set(x, 1.4, z);
  group.add(wheel);
}

function createSeesaw(group: THREE.Group, x: number, z: number) {
  // Simple seesaw pivot
  const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 0.6), new THREE.MeshStandardMaterial({color:0x555555}));
  pivot.position.set(x, 0.3, z);
  group.add(pivot);

  const board = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 4), new THREE.MeshStandardMaterial({color:0xffd700}));
  board.position.set(x, 0.6, z);
  board.rotation.x = 0.2; // tilted
  group.add(board);
}

function createBench(group: THREE.Group, x: number, z: number) {
  const seatGeo = new THREE.BoxGeometry(1.5, 0.1, 0.5);
  const wood = new THREE.MeshStandardMaterial({color: 0x8b4513});
  const bench = new THREE.Mesh(seatGeo, wood);
  bench.position.set(x, 0.5, z);
  group.add(bench);
}