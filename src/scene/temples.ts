import * as THREE from 'three';
import { placeObjectOnWorld } from './curvePlacement';

// --- CONFIGURATION ---
const TEMPLE_COLORS = {
  stone: 0xe39e93,   // Pinkish sandstone
  darkStone: 0x8c5e56, 
  base: 0x5D4037,    
  floor: 0x8D6E63,   
  flag: 0xff0000,    
  metal: 0x555555,
  gold: 0xFFD700     // <--- ADDED MISSING COLOR
};

// Reusable materials
const matStone = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.stone, roughness: 0.7 });
const matFlag = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.flag, side: THREE.DoubleSide, emissive: 0x330000 });
const matMetal = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.metal });

export function createTempleSector(worldGroup: THREE.Group) {
  const sectorStart = (Math.PI * 2) / 3;
  const sectorEnd = (Math.PI * 4) / 3;
  const sectorSize = sectorEnd - sectorStart;

  // 1. Entrance Gate (Torana)
  createOrnateGate(worldGroup, sectorStart + 0.1);

  // 2. Street-Side Temples
  const count = 8; 
  for (let i = 0; i < count; i++) {
    const angle = sectorStart + (i / count) * sectorSize + 0.2;
    const offset = 18; 
    
    createStreetSideTemple(worldGroup, angle, -1, offset);
    createStreetSideTemple(worldGroup, angle, 1, offset);
  }

  // 3. Exit Gate
  createOrnateGate(worldGroup, sectorEnd - 0.1);
}

/**
 * Places the detailed temple directly on the street side
 */
function createStreetSideTemple(worldGroup: THREE.Group, angle: number, side: number, dist: number) {
  const group = new THREE.Group();

  // 1. Foundation Plinth (Jagati)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(10, 1.5, 12), matStone);
  plinth.position.y = 0.75;
  group.add(plinth);

  // 2. Stairs
  const stairs = new THREE.Mesh(new THREE.BoxGeometry(4, 1.5, 3), matStone);
  stairs.position.set(0, 0.5, 6 + 1.5); 
  stairs.rotation.x = 0.2; 
  group.add(stairs);

  // 3. Detailed Temple Mesh
  const templeBody = createDetailedTempleMesh();
  templeBody.position.y = 1.5; 
  group.add(templeBody);

  // 4. Placement
  placeObjectOnWorld(worldGroup, group, angle, side, dist);
}

/**
 * Ported "createPillar" logic
 */
function createPillar(x: number, z: number, height: number): THREE.Group {
    const group = new THREE.Group();

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), matStone);
    base.position.y = 0.3;
    group.add(base);

    const shaftPoints = [];
    shaftPoints.push(new THREE.Vector2(0.3, 0));
    shaftPoints.push(new THREE.Vector2(0.3, height - 1));
    shaftPoints.push(new THREE.Vector2(0.35, height - 0.8));
    shaftPoints.push(new THREE.Vector2(0.25, height - 0.6));
    shaftPoints.push(new THREE.Vector2(0.35, height - 0.2)); 
    
    const shaftGeom = new THREE.LatheGeometry(shaftPoints, 16);
    const shaft = new THREE.Mesh(shaftGeom, matStone);
    shaft.position.y = 0.6;
    shaft.castShadow = true;
    group.add(shaft);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), matStone);
    cap.position.y = height + 0.2;
    group.add(cap);

    group.position.set(x, 0, z);
    return group;
}

/**
 * Ported "createMandapa" logic
 */
function createMandapa(): THREE.Group {
    const group = new THREE.Group();
    const width = 8; 
    const depth = 8;
    const pHeight = 3.5; 

    const baseHeight = 1.5;
    const platform = new THREE.Mesh(new THREE.BoxGeometry(width + 2, baseHeight, depth + 2), matStone);
    platform.position.y = baseHeight/2;
    group.add(platform);

    const spacing = 2.5;
    const startX = -width/2 + 1;
    const startZ = -depth/2 + 1;
    
    for(let x = startX; x < width/2; x += spacing) {
        for(let z = startZ; z < depth/2; z += spacing) {
            const pillar = createPillar(x, z, pHeight);
            pillar.position.y = baseHeight;
            group.add(pillar);
        }
    }

    const roofY = baseHeight + pHeight + 0.4;
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(width + 1, 0.5, depth + 1), matStone);
    roofSlab.position.y = roofY;
    group.add(roofSlab);

    const eaves = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 0.2, depth + 2), matStone);
    eaves.position.y = roofY - 0.2;
    group.add(eaves);

    let currentY = roofY + 0.25;
    let currentSize = width;
    const steps = 4;
    const stepHeight = 0.8;
    
    for(let i=0; i<steps; i++) {
        currentSize -= 1.5;
        if(currentSize < 0.5) break;
        
        const stepBlock = new THREE.Mesh(new THREE.BoxGeometry(currentSize, stepHeight, currentSize), matStone);
        stepBlock.position.y = currentY + stepHeight/2;
        group.add(stepBlock);

        const decorationCount = Math.floor(currentSize);
        const knobGeo = new THREE.SphereGeometry(0.15, 8, 8);
        for(let d=0; d<decorationCount; d++) {
            const knob = new THREE.Mesh(knobGeo, matStone);
            knob.position.set(-currentSize/2 + 0.5 + d, currentY + stepHeight/2, currentSize/2);
            group.add(knob);
        }
        
        currentY += stepHeight;
    }

    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.5, 1, 8), matStone);
    finial.position.y = currentY + 0.5;
    group.add(finial);

    return group;
}

/**
 * Ported "createShikhara" logic
 */
function createShikhara(): THREE.Group {
    const group = new THREE.Group();
    
    const baseSize = 6;
    const pHeight = 3.5;
    const platformHeight = 1.5;
    const towerHeight = 8; 

    const platform = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 2, platformHeight, baseSize + 2), matStone);
    platform.position.y = platformHeight/2;
    group.add(platform);

    const sanctumSize = baseSize - 2; 
    const sanctum = new THREE.Mesh(new THREE.BoxGeometry(sanctumSize, pHeight, sanctumSize), matStone);
    sanctum.position.y = platformHeight + pHeight/2;
    group.add(sanctum);

    const cornerDist = baseSize/2 - 0.5;
    const pillars = [
        [cornerDist, cornerDist], [-cornerDist, cornerDist],
        [cornerDist, -cornerDist], [-cornerDist, -cornerDist],
        [0, cornerDist], [0, -cornerDist],
        [cornerDist, 0], [-cornerDist, 0]
    ];

    pillars.forEach(([px, pz]) => {
        const pillar = createPillar(px, pz, pHeight);
        pillar.position.y = platformHeight;
        group.add(pillar);
    });

    const roofY = platformHeight + pHeight + 0.4; 
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 1, 0.5, baseSize + 1), matStone);
    roofSlab.position.y = roofY;
    group.add(roofSlab);
    
    const eaves = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 2, 0.2, baseSize + 2), matStone);
    eaves.position.y = roofY - 0.2;
    group.add(eaves);

    let currentY = roofY + 0.25;
    let currentSize = baseSize + 0.5;
    
    const stepHeight = 0.6; 
    const steps = Math.floor(towerHeight / stepHeight);
    const shrinkagePerStep = (currentSize - 1.5) / steps;

    const knobGeo = new THREE.SphereGeometry(0.15, 8, 8);

    for(let i=0; i<steps; i++) {
        currentSize -= shrinkagePerStep;
        
        const stepBlock = new THREE.Mesh(new THREE.BoxGeometry(currentSize, stepHeight, currentSize), matStone);
        stepBlock.position.y = currentY + stepHeight/2;
        group.add(stepBlock);

        if (currentSize > 2) {
            const knobCount = Math.floor(currentSize / 1.5);
            const spacing = currentSize / (knobCount + 1);
            
            for(let k=1; k<=knobCount; k++) {
                const offset = -currentSize/2 + (k * spacing);
                const k1 = new THREE.Mesh(knobGeo, matStone); k1.position.set(offset, currentY + stepHeight/2, currentSize/2); group.add(k1);
                const k2 = new THREE.Mesh(knobGeo, matStone); k2.position.set(offset, currentY + stepHeight/2, -currentSize/2); group.add(k2);
                const k3 = new THREE.Mesh(knobGeo, matStone); k3.position.set(-currentSize/2, currentY + stepHeight/2, offset); group.add(k3);
                const k4 = new THREE.Mesh(knobGeo, matStone); k4.position.set(currentSize/2, currentY + stepHeight/2, offset); group.add(k4);
            }
        }
        currentY += stepHeight;
    }

    const amalakaY = currentY;
    const amalaka = new THREE.Mesh(new THREE.TorusGeometry( 1.5, 0.6, 16, 32 ), matStone);
    amalaka.rotation.x = Math.PI / 2;
    amalaka.scale.set(1, 1, 0.6); 
    amalaka.position.y = amalakaY;
    group.add(amalaka);

    const kalashaPoints = [];
    kalashaPoints.push(new THREE.Vector2(0,0));
    kalashaPoints.push(new THREE.Vector2(0.5, 0.2));
    kalashaPoints.push(new THREE.Vector2(0.8, 0.5));
    kalashaPoints.push(new THREE.Vector2(0.2, 1.2));
    kalashaPoints.push(new THREE.Vector2(0.3, 1.4));
    kalashaPoints.push(new THREE.Vector2(0, 1.8));
    
    const kalashaGeom = new THREE.LatheGeometry(kalashaPoints, 16);
    const kalasha = new THREE.Mesh(kalashaGeom, matStone);
    kalasha.position.y = amalakaY + 0.5;
    group.add(kalasha);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5), matMetal);
    pole.position.y = amalakaY + 2.0; 
    group.add(pole);

    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0);
    flagShape.lineTo(2.2, 0.6); 
    flagShape.lineTo(0, 1.5); 
    flagShape.lineTo(0, 0); 
    
    const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), matFlag);
    flag.position.set(0, amalakaY + 3.0, 0);
    flag.rotation.y = -Math.PI / 4; 
    group.add(flag);

    return group;
}

function createDetailedTempleMesh(): THREE.Group {
    const templeGroup = new THREE.Group();
    const mandapa = createMandapa();
    mandapa.position.z = 4; 
    templeGroup.add(mandapa);

    const shikhara = createShikhara();
    shikhara.position.z = -5; 
    templeGroup.add(shikhara);

    const connector = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 3), matStone);
    connector.position.set(0, 3.5, -0.5);
    templeGroup.add(connector);

    return templeGroup;
}

function createOrnateGate(worldGroup: THREE.Group, angle: number) {
  const group = new THREE.Group();
  const mat = matStone;

  const pillarGeo = new THREE.BoxGeometry(2.5, 9, 2.5);
  const leftP = new THREE.Mesh(pillarGeo, mat); leftP.position.set(-9, 4.5, 0); group.add(leftP);
  const rightP = new THREE.Mesh(pillarGeo, mat); rightP.position.set(9, 4.5, 0); group.add(rightP);

  const curveShape = new THREE.Shape();
  curveShape.moveTo(-11, 0); curveShape.lineTo(11, 0); curveShape.lineTo(11, 2);
  curveShape.quadraticCurveTo(0, 5, -11, 2); curveShape.lineTo(-11, 0);

  const archGeo = new THREE.ExtrudeGeometry(curveShape, { depth: 3, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 });
  const arch = new THREE.Mesh(archGeo, mat);
  arch.position.set(0, 8.5, -1.5);
  group.add(arch);

  const k1 = createKalashGeometry(); k1.position.set(0, 12.5, 0); k1.scale.set(1.5,1.5,1.5); group.add(k1);

  // Flags on Gate Pillars
  const flagL = createGateFlag(); flagL.position.set(-9, 9, 0); group.add(flagL);
  const flagR = createGateFlag(); flagR.position.set(9, 9, 0); group.add(flagR);

  placeObjectOnWorld(worldGroup, group, angle, 0, 0);
}

function createGateFlag(): THREE.Group {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), matMetal);
    pole.position.y = 2; g.add(pole);

    const flagShape = new THREE.Shape();
    flagShape.moveTo(0, 0); flagShape.lineTo(2.5, 0.8); flagShape.lineTo(0, 1.6); flagShape.lineTo(0, 0); 
    const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), matFlag);
    flag.position.set(0, 3.8, 0); flag.rotation.y = -Math.PI / 2; g.add(flag);
    return g;
}

function createKalashGeometry(): THREE.Group {
    const g = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.gold, metalness: 0.8, roughness: 0.2 });
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), mat); g.add(pot);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.5), mat); neck.position.y = 0.4; g.add(neck);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 16), mat); rim.rotation.x = Math.PI/2; rim.position.y = 0.65; g.add(rim);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 8), mat); tip.position.y = 0.8; g.add(tip);
    
    // Tiny flag on top of Kalash
    const flagGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1.2, 0.4, 0, 0, 0.8, 0]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    flagGeo.computeVertexNormals();
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.flag, side: THREE.DoubleSide }));
    flag.position.set(0, 0.8, 0); g.add(flag);

    return g;
}