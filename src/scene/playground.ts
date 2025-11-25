import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createParks(scene: THREE.Scene) {
  const parkPositions = [
    { x: 20, z: -210 },
    { x: -20, z: -215 },
    { x: 21, z: -240 },
    { x: -21, z: -245 },
  ];

  parkPositions.forEach((pos) => {
    const parkGroup = new THREE.Group();
    // Build the park contents relative to the group's center (0,0,0)
    createParkContent(parkGroup);

    // Place the entire group on the globe
    placeOnGlobe(parkGroup, pos.x, pos.z, 0);

    // parkGroup.rotateY(Math.PI); // REMOVED: Causing reverse orientation
    scene.add(parkGroup);
  });
}

function createParkContent(group: THREE.Group) {
  const parkGrassGeo = new THREE.PlaneGeometry(15, 20);
  const parkGrassMat = new THREE.MeshStandardMaterial({
    color: 0x4a9d6f,
    roughness: 0.8,
  });
  const parkGrass = new THREE.Mesh(parkGrassGeo, parkGrassMat);
  parkGrass.rotation.x = -Math.PI / 2;
  parkGrass.position.y = 0.05;
  parkGrass.receiveShadow = true;
  group.add(parkGrass);

  // Add objects relative to the group center
  createSwings(group, -4, -3);
  createSlide(group, 3, -2);
  createSeesaw(group, 0, 4);
  createBench(group, -5, 6);
  createBench(group, 5, 6);
  createTrashCan(group, -6, -4);
}

function createSwings(group: THREE.Group, x: number, z: number) {
  const swingFrameGeo = new THREE.CylinderGeometry(0.1, 0.1, 2.5, 8);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2,
  });

  const leftPole = new THREE.Mesh(swingFrameGeo, metalMat);
  leftPole.position.set(x - 1.5, 1.25, z);
  leftPole.castShadow = true;
  group.add(leftPole);

  const rightPole = new THREE.Mesh(swingFrameGeo, metalMat);
  rightPole.position.set(x + 1.5, 1.25, z);
  rightPole.castShadow = true;
  group.add(rightPole);

  const topBarGeo = new THREE.CylinderGeometry(0.08, 0.08, 3.2, 8);
  const topBar = new THREE.Mesh(topBarGeo, metalMat);
  topBar.rotation.z = Math.PI / 2;
  topBar.position.set(x, 2.5, z);
  topBar.castShadow = true;
  group.add(topBar);

  for (let i = 0; i < 3; i++) {
    const offsetX = -1.2 + i * 1.2;
    createSingleSwing(group, x + offsetX, z);
  }
}

function createSingleSwing(group: THREE.Group, x: number, z: number) {
  const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 1.5, 6);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x666666,
    metalness: 0.8,
    roughness: 0.3,
  });

  const chain1 = new THREE.Mesh(chainGeo, metalMat);
  chain1.position.set(x - 0.15, 1.75, z);
  group.add(chain1);

  const chain2 = new THREE.Mesh(chainGeo, metalMat);
  chain2.position.set(x + 0.15, 1.75, z);
  group.add(chain2);

  const seatGeo = new THREE.BoxGeometry(0.4, 0.08, 0.35);
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0xff6b35,
    roughness: 0.7,
  });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(x, 0.5, z);
  seat.castShadow = true;
  group.add(seat);
}

function createSlide(group: THREE.Group, x: number, z: number) {
  const ladderGeo = new THREE.BoxGeometry(0.3, 1.8, 0.1);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2,
  });

  const ladder = new THREE.Mesh(ladderGeo, metalMat);
  ladder.position.set(x - 0.7, 0.9, z - 0.3);
  ladder.castShadow = true;
  group.add(ladder);

  const rungGeo = new THREE.BoxGeometry(0.4, 0.08, 0.08);
  for (let i = 0; i < 6; i++) {
    const rung = new THREE.Mesh(rungGeo, metalMat);
    rung.position.set(x - 0.7, 0.4 + i * 0.3, z - 0.3);
    group.add(rung);
  }

  const slideGeo = new THREE.BoxGeometry(0.5, 0.1, 1.8);
  const slideMat = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    roughness: 0.5,
  });
  const slide = new THREE.Mesh(slideGeo, slideMat);
  slide.rotation.x = Math.PI / 3.5;
  slide.position.set(x + 0.3, 1.2, z + 0.5);
  slide.castShadow = true;
  group.add(slide);

  const platformGeo = new THREE.BoxGeometry(0.8, 0.1, 0.6);
  const platform = new THREE.Mesh(platformGeo, metalMat);
  platform.position.set(x - 0.7, 1.8, z - 0.3);
  platform.castShadow = true;
  group.add(platform);
}

function createSeesaw(group: THREE.Group, x: number, z: number) {
  const supportGeo = new THREE.CylinderGeometry(0.12, 0.15, 0.8, 8);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x888888,
    metalness: 0.8,
    roughness: 0.2,
  });

  const support = new THREE.Mesh(supportGeo, metalMat);
  support.position.set(x, 0.4, z);
  support.castShadow = true;
  group.add(support);

  const boardGeo = new THREE.BoxGeometry(0.4, 0.08, 2.5);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xff6b35,
    roughness: 0.7,
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(x, 0.8, z);
  board.castShadow = true;
  board.receiveShadow = true;
  group.add(board);

  const handleGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
  for (let offsetZ of [-1, 1]) {
    const handle = new THREE.Mesh(handleGeo, metalMat);
    handle.rotation.z = Math.PI / 2;
    handle.position.set(x + 0.2, 1.0, z + offsetZ * 1.2);
    group.add(handle);
  }
}

function createBench(group: THREE.Group, x: number, z: number) {
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 6);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    metalness: 0.6,
    roughness: 0.4,
  });

  for (let offsetX of [-0.8, 0.8]) {
    const leg = new THREE.Mesh(legGeo, metalMat);
    leg.position.set(x + offsetX, 0.2, z);
    leg.castShadow = true;
    group.add(leg);
  }

  const seatGeo = new THREE.BoxGeometry(1.8, 0.1, 0.5);
  const seatMat = new THREE.MeshStandardMaterial({
    color: 0x8B4513,
    roughness: 0.7,
  });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(x, 0.4, z);
  seat.castShadow = true;
  seat.receiveShadow = true;
  group.add(seat);

  const backGeo = new THREE.BoxGeometry(1.8, 0.8, 0.1);
  const back = new THREE.Mesh(backGeo, seatMat);
  back.position.set(x, 0.7, z - 0.3);
  back.castShadow = true;
  group.add(back);
}

function createTrashCan(group: THREE.Group, x: number, z: number) {
  const canGeo = new THREE.CylinderGeometry(0.25, 0.3, 0.7, 8);
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    metalness: 0.6,
    roughness: 0.4,
  });

  const can = new THREE.Mesh(canGeo, metalMat);
  can.position.set(x, 0.35, z);
  can.castShadow = true;
  group.add(can);

  const lidGeo = new THREE.CylinderGeometry(0.27, 0.25, 0.08, 8);
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0xff6b35,
    roughness: 0.7,
  });
  const lid = new THREE.Mesh(lidGeo, lidMat);
  lid.position.set(x, 0.73, z);
  lid.castShadow = true;
  group.add(lid);
}