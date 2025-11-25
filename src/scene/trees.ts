import * as THREE from 'three';
import { placeOnGlobe } from './curvePlacement';

export function createTrees(scene: THREE.Scene) {
  // Fill the entire scene with trees
  const numTrees = 200;

  for (let i = 0; i < numTrees; i++) {
    const tree = createTree();
    const side = Math.random() > 0.5 ? -1 : 1;
    
    // Distance from center line
    const x = (Math.random() * 15 + 22) * side;
    
    // Full loop range
    const z = (Math.random() * 1300) - 1250; // +50 to -1250

    // Random scaling for variety
    const scale = Math.random() * 0.5 + 0.8;
    tree.scale.set(scale, scale, scale);

    placeOnGlobe(tree, x, z, 0);
    
    scene.add(tree);
  }
}

function createTree() {
  const treeGroup = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2511, roughness: 1.0 });
  const trunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 2.5, 8);
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.25;
  trunk.castShadow = true;
  treeGroup.add(trunk);

  const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.8 });
  const leafGeo = new THREE.DodecahedronGeometry(1.5);
  
  const leaves = new THREE.Mesh(leafGeo, leafMat);
  leaves.position.y = 3.5;
  leaves.castShadow = true;
  treeGroup.add(leaves);

  const leaves2 = new THREE.Mesh(leafGeo, leafMat);
  leaves2.position.set(0, 4.5, 0);
  leaves2.scale.set(0.8, 0.8, 0.8);
  leaves2.castShadow = true;
  treeGroup.add(leaves2);

  return treeGroup;
}