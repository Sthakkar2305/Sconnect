import * as THREE from 'three';

export function createBuildings(scene: THREE.Scene) {
  const numBuildings = 25;
  const buildingMat = new THREE.MeshStandardMaterial({
    color: 0x555555,
    roughness: 0.7,
  });

  for (let i = 0; i < numBuildings; i++) {
    const height = Math.random() * 15 + 8;
    const width = Math.random() * 3 + 2.5;
    const depth = Math.random() * 3 + 2.5;

    const buildingGeo = new THREE.BoxGeometry(width, height, depth);
    const building = new THREE.Mesh(buildingGeo, buildingMat.clone());

    building.material.color.setHSL(0, 0, Math.random() * 0.2 + 0.2);

    const side = i % 2 === 0 ? 1 : -1;
    building.position.set(
      (Math.random() * 5 + 8) * side,
      height / 2,
      (i * 6) - 60
    );

    building.castShadow = true;
    building.receiveShadow = true;
    scene.add(building);

    createWindows(building, width, height, depth);
    createRoof(building, width, height, depth, scene);
  }
}

function createWindows(
  building: THREE.Mesh,
  w: number,
  h: number,
  d: number
) {
  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2a,
    emissive: 0xffff88,
    emissiveIntensity: 0.4,
  });
  const windowGeo = new THREE.PlaneGeometry(0.35, 0.5);

  const windowSpacingX = 0.9;
  const windowSpacingY = 1.2;

  for (let y = windowSpacingY; y < h - 1; y += windowSpacingY) {
    for (let x = -w / 2 + 0.6; x < w / 2 - 0.3; x += windowSpacingX) {
      if (Math.random() > 0.2) {
        const windowMesh = new THREE.Mesh(windowGeo, windowMat);
        windowMesh.position.set(x, y - h / 2 + 1, d / 2 + 0.05);
        building.add(windowMesh);

        const backWindow = new THREE.Mesh(windowGeo, windowMat);
        backWindow.position.set(x, y - h / 2 + 1, -d / 2 - 0.05);
        building.add(backWindow);
      }
    }
  }

  for (let y = windowSpacingY; y < h - 1; y += windowSpacingY) {
    for (let z = -d / 2 + 0.5; z < d / 2 - 0.3; z += windowSpacingX) {
      if (Math.random() > 0.2) {
        const sideWindowGeo = new THREE.PlaneGeometry(0.35, 0.5);
        const sideWindow = new THREE.Mesh(sideWindowGeo, windowMat);
        sideWindow.position.set(w / 2 + 0.05, y - h / 2 + 1, z);
        sideWindow.rotation.y = Math.PI / 2;
        building.add(sideWindow);

        const sideWindow2 = new THREE.Mesh(sideWindowGeo, windowMat);
        sideWindow2.position.set(-w / 2 - 0.05, y - h / 2 + 1, z);
        sideWindow2.rotation.y = Math.PI / 2;
        building.add(sideWindow2);
      }
    }
  }
}

function createRoof(
  building: THREE.Mesh,
  w: number,
  h: number,
  d: number,
  scene: THREE.Scene
) {
  const roofMat = new THREE.MeshStandardMaterial({
    color: 0x333333,
    roughness: 0.6,
  });

  const roofGeo = new THREE.BoxGeometry(w + 0.2, 0.3, d + 0.2);
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(building.position.x, building.position.y + h / 2 + 0.15, building.position.z);
  roof.castShadow = true;
  roof.receiveShadow = true;
  scene.add(roof);

  const chimneyGeo = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
  const chimney = new THREE.Mesh(chimneyGeo, new THREE.MeshStandardMaterial({ color: 0x8B4513 }));
  chimney.position.set(
    building.position.x + w / 3,
    building.position.y + h / 2 + 0.7,
    building.position.z + d / 4
  );
  chimney.castShadow = true;
  scene.add(chimney);
}
