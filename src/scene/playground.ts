import * as THREE from 'three';
import { placeObjectOnWorld } from './curvePlacement';
// NOTE: For the background to be truly transparent, ensure these files are PNGs with transparency, not JPEGs.
import image1 from '../images/photo_6172213715319590219_y-removebg-preview.png';
import image2 from '../images/photo_6172213715319590222_y-removebg-preview.png';
import image3 from '../images/pngtree-3d-coconut-tree-with-large-leaf-cartoon-style-png-image_12838168-removebg-preview.png';

// ... imports ...

export function createBeachSector(worldGroup: THREE.Group) {
  const sectorStart = (Math.PI * 3) / 2;
  const sectorEnd = Math.PI * 2;
  const sectorSize = sectorEnd - sectorStart;

  const loader = new THREE.TextureLoader();
  
  // Helper to load textures
  const loadTex = (url: string) => {
    return loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.premultiplyAlpha = true;
    });
  };

  const texLeft = loadTex(image1);
  const texRight = loadTex(image2);
  const texTree = loadTex(image3);

  const count = 5; 
  for(let i = 0; i < count; i++) {
    // Calculate angle exactly like the buildings loop
    const angle = sectorStart + (i / count) * sectorSize + 0.1;
    
    // --- MATCHING BUILDING ALIGNMENT ---
    // Use dist = 19 to match the 'createDetailedHouse' placement.
    
    // Left Side Billboard
    createImageBillboard(worldGroup, angle, -1, 19, texLeft, 12, 8);
    
    // Right Side Billboard
    createImageBillboard(worldGroup, angle, 1, 19, texRight, 12, 8);

    // Trees can be slightly offset (e.g., dist 25) to look like background scenery
    createImageBillboard(worldGroup, angle, -1, 25, texTree, 10, 18);
    createImageBillboard(worldGroup, angle, 1, 25, texTree, 10, 18);
  }
}

function createImageBillboard(
  worldGroup: THREE.Group, 
  angle: number, 
  side: number, 
  dist: number, 
  texture: THREE.Texture,
  width: number = 12,
  height: number = 8
) {
  const group = new THREE.Group();
  
  const geometry = new THREE.PlaneGeometry(width, height);
  
  const material = new THREE.MeshBasicMaterial({ 
    map: texture,
    transparent: true,
    opacity: 1.0,
    side: THREE.DoubleSide,
    color: 0xffffff,
    depthWrite: false,
    premultipliedAlpha: true,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = height / 2;
  group.add(mesh);

  // Orient the image to face the 'street' (center)
  // Side 1 (Right) needs to face Left (-PI/2)
  // Side -1 (Left) needs to face Right (+PI/2)
  if (side === 1) {
      group.rotation.y = -Math.PI / 2; 
  } else {
      group.rotation.y = Math.PI / 2;
  }
  
  // Use the shared placement logic
  placeObjectOnWorld(worldGroup, group, angle, side, dist);
}