import * as THREE from 'three';

export function createTrees(scene: THREE.Scene) {
  for (let i = 0; i < 40; i++) {
    const tree = createTree();
    const side = i % 2 === 0 ? 1 : -1;
    const x = (Math.random() * 10 + 20) * side;
    const z = (Math.random() * 180) - 90;
    tree.position.set(x, 0, z);
    scene.add(tree);
  }
}

function createTree() {
  const treeGroup = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2511 });
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.4, 3, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.5;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22 });
  const leafGeo = new THREE.ConeGeometry(2, 4, 8);
  const leaves = new THREE.Mesh(leafGeo, leafMat);
  leaves.position.y = 4.5;
  leaves.castShadow = true;
  treeGroup.add(leaves);

  const leaves2 = new THREE.Mesh(leafGeo, leafMat);
  leaves2.position.y = 3.5;
  leaves2.scale.set(1.2, 1, 1.2);
  leaves2.castShadow = true;
  treeGroup.add(leaves2);

  return treeGroup;
}
