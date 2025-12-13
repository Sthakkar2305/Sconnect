import * as THREE from 'three';
import { placeObjectOnWorld } from './curvePlacement';

// --- CONFIGURATION ---
const TEMPLE_COLORS = {
    whiteMarble: 0xF5F5F5,
    brownStone: 0x5D4037,
    lightBrown: 0x8D6E63,
    flag: 0xff4500,
    metal: 0x444444,
    gold: 0xFFD700
};

// Reusable materials
const matWhite = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.whiteMarble, roughness: 0.4, metalness: 0.1 });
const matBrown = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.brownStone, roughness: 0.8 });
const matLightBrown = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.lightBrown, roughness: 0.6 });
const matFlag = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.flag, side: THREE.DoubleSide, emissive: 0x220000 });
const matMetal = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.metal });
const matGold = new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.gold, metalness: 0.8, roughness: 0.2 });

export function createTempleSector(worldGroup: THREE.Group) {
    const sectorStart = 0;
    const sectorEnd = Math.PI / 2;
    const sectorSize = sectorEnd - sectorStart;

    // 1. Entrance Gate (Torana) - Start Text
    createOrnateGate(worldGroup, sectorStart, "Rath X Welcome you");

    // 2. Street-Side Temples - WITH STAIRS ON FACING SIDE
    const count = 8;
    for (let i = 0; i < count; i++) {
        const angle = sectorStart + (i / count) * sectorSize + 0.2;
        const offset = 18;

        createStreetSideTemple(worldGroup, angle, -1, offset);
        createStreetSideTemple(worldGroup, angle, 1, offset);
    }

    // 3. Exit Gate - End Text (UPDATED)
    createOrnateGate(worldGroup, sectorEnd, "THANKS FOR EXPLORING RATH X");
}

/**
 * Helper to generate realistic stairs
 */
function createRealisticStairs(width: number, totalHeight: number, totalDepth: number, stepCount: number, material: THREE.Material): THREE.Group {
    const group = new THREE.Group();
    const stepHeight = totalHeight / stepCount;
    const stepDepth = totalDepth / stepCount;

    for (let i = 0; i < stepCount; i++) {
        // We stack "slabs" to create a solid stair look
        const currentDepth = totalDepth - (i * stepDepth);

        const step = new THREE.Mesh(
            new THREE.BoxGeometry(width, stepHeight, currentDepth),
            material
        );

        // Stack them upwards
        step.position.y = (i * stepHeight) + (stepHeight / 2);

        // Align them to the back
        step.position.z = (totalDepth / 2) - (currentDepth / 2);

        step.castShadow = true;
        step.receiveShadow = true;
        group.add(step);
    }
    return group;

}

/**
 * Places the detailed temple directly on the street side
 */
function createStreetSideTemple(worldGroup: THREE.Group, angle: number, side: number, dist: number) {
    const group = new THREE.Group();

    // 1. Foundation Plinth (Jagati)
    const plinthH = 1.5;
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(10, plinthH, 12), matBrown);
    plinth.position.y = plinthH / 2;
    group.add(plinth);

    // 2. REALISTIC STAIRS (Flipped to face road)
    const stairDepth = 3.5;
    const stairs = createRealisticStairs(5, plinthH, stairDepth, 6, matBrown);

    // Moved to Negative Z (-6) and Rotated 180 degrees to face road
    stairs.position.set(0, 0, -6 - (stairDepth / 2));
    stairs.rotation.y = Math.PI;

    group.add(stairs);

    // 3. Detailed Temple Mesh
    const templeBody = createDetailedTempleMesh();
    templeBody.position.y = plinthH;
    group.add(templeBody);

    // 4. Placement
    placeObjectOnWorld(worldGroup, group, angle, side, dist);
}

function createPillar(x: number, z: number, height: number): THREE.Group {
    const group = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.8), matBrown);
    base.position.y = 0.3; group.add(base);

    const shaftPoints = [
        new THREE.Vector2(0.3, 0), new THREE.Vector2(0.3, height - 1),
        new THREE.Vector2(0.35, height - 0.8), new THREE.Vector2(0.25, height - 0.6),
        new THREE.Vector2(0.35, height - 0.2)
    ];
    const shaftGeom = new THREE.LatheGeometry(shaftPoints, 16);
    const shaft = new THREE.Mesh(shaftGeom, matWhite);
    shaft.position.y = 0.6; shaft.castShadow = true; group.add(shaft);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.7), matBrown);
    cap.position.y = height + 0.2; group.add(cap);

    group.position.set(x, 0, z);
    return group;
}

function createMandapa(): THREE.Group {
    const group = new THREE.Group();
    const width = 8; const depth = 8; const pHeight = 3.5; const baseHeight = 1.5;

    const platform = new THREE.Mesh(new THREE.BoxGeometry(width + 2, baseHeight, depth + 2), matLightBrown);
    platform.position.y = baseHeight / 2; group.add(platform);

    const spacing = 2.5; const startX = -width / 2 + 1; const startZ = -depth / 2 + 1;
    for (let x = startX; x < width / 2; x += spacing) {
        for (let z = startZ; z < depth / 2; z += spacing) {
            const pillar = createPillar(x, z, pHeight);
            pillar.position.y = baseHeight; group.add(pillar);
        }
    }

    const roofY = baseHeight + pHeight + 0.4;
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(width + 1, 0.5, depth + 1), matBrown);
    roofSlab.position.y = roofY; group.add(roofSlab);
    const eaves = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 0.2, depth + 2), matBrown);
    eaves.position.y = roofY - 0.2; group.add(eaves);

    let currentY = roofY + 0.25; let currentSize = width; const steps = 4; const stepHeight = 0.8;
    for (let i = 0; i < steps; i++) {
        currentSize -= 1.5; if (currentSize < 0.5) break;
        const stepBlock = new THREE.Mesh(new THREE.BoxGeometry(currentSize, stepHeight, currentSize), matBrown);
        stepBlock.position.y = currentY + stepHeight / 2; group.add(stepBlock);

        const decorationCount = Math.floor(currentSize);
        const knobGeo = new THREE.SphereGeometry(0.15, 8, 8);
        for (let d = 0; d < decorationCount; d++) {
            const knob = new THREE.Mesh(knobGeo, matGold);
            knob.position.set(-currentSize / 2 + 0.5 + d, currentY + stepHeight / 2, currentSize / 2);
            group.add(knob);
        }
        currentY += stepHeight;
    }
    const finial = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.5, 1, 8), matGold);
    finial.position.y = currentY + 0.5; group.add(finial);
    return group;
}

function createShikhara(): THREE.Group {
    const group = new THREE.Group();
    const baseSize = 6; const pHeight = 3.5; const platformHeight = 1.5; const towerHeight = 8;

    const platform = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 2, platformHeight, baseSize + 2), matLightBrown);
    platform.position.y = platformHeight / 2; group.add(platform);

    const sanctumSize = baseSize - 2;
    const sanctum = new THREE.Mesh(new THREE.BoxGeometry(sanctumSize, pHeight, sanctumSize), matWhite);
    sanctum.position.y = platformHeight + pHeight / 2; group.add(sanctum);

    const cornerDist = baseSize / 2 - 0.5;
    const pillars = [[cornerDist, cornerDist], [-cornerDist, cornerDist], [cornerDist, -cornerDist], [-cornerDist, -cornerDist], [0, cornerDist], [0, -cornerDist], [cornerDist, 0], [-cornerDist, 0]];
    pillars.forEach(([px, pz]) => {
        const pillar = createPillar(px, pz, pHeight);
        pillar.position.y = platformHeight; group.add(pillar);
    });

    const roofY = platformHeight + pHeight + 0.4;
    const roofSlab = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 1, 0.5, baseSize + 1), matBrown);
    roofSlab.position.y = roofY; group.add(roofSlab);
    const eaves = new THREE.Mesh(new THREE.BoxGeometry(baseSize + 2, 0.2, baseSize + 2), matBrown);
    eaves.position.y = roofY - 0.2; group.add(eaves);

    let currentY = roofY + 0.25; let currentSize = baseSize + 0.5; const stepHeight = 0.6; const steps = Math.floor(towerHeight / stepHeight); const shrinkagePerStep = (currentSize - 1.5) / steps;
    const knobGeo = new THREE.SphereGeometry(0.15, 8, 8);

    for (let i = 0; i < steps; i++) {
        currentSize -= shrinkagePerStep;
        const stepBlock = new THREE.Mesh(new THREE.BoxGeometry(currentSize, stepHeight, currentSize), matWhite);
        stepBlock.position.y = currentY + stepHeight / 2; group.add(stepBlock);

        if (currentSize > 2) {
            const accent = new THREE.Mesh(new THREE.BoxGeometry(currentSize + 0.05, 0.05, currentSize + 0.05), matBrown);
            accent.position.y = currentY + stepHeight; group.add(accent);
            const knobCount = Math.floor(currentSize / 1.5); const spacing = currentSize / (knobCount + 1);
            for (let k = 1; k <= knobCount; k++) {
                const offset = -currentSize / 2 + (k * spacing);
                const k1 = new THREE.Mesh(knobGeo, matGold); k1.position.set(offset, currentY + stepHeight / 2, currentSize / 2); group.add(k1);
                const k2 = new THREE.Mesh(knobGeo, matGold); k2.position.set(offset, currentY + stepHeight / 2, -currentSize / 2); group.add(k2);
                const k3 = new THREE.Mesh(knobGeo, matGold); k3.position.set(-currentSize / 2, currentY + stepHeight / 2, offset); group.add(k3);
                const k4 = new THREE.Mesh(knobGeo, matGold); k4.position.set(currentSize / 2, currentY + stepHeight / 2, offset); group.add(k4);
            }
        }
        currentY += stepHeight;
    }

    const amalakaY = currentY;
    const amalaka = new THREE.Mesh(new THREE.TorusGeometry(1.5, 0.6, 16, 32), matBrown);
    amalaka.rotation.x = Math.PI / 2; amalaka.scale.set(1, 1, 0.6); amalaka.position.y = amalakaY; group.add(amalaka);
    const kalashaPoints = [new THREE.Vector2(0, 0), new THREE.Vector2(0.5, 0.2), new THREE.Vector2(0.8, 0.5), new THREE.Vector2(0.2, 1.2), new THREE.Vector2(0.3, 1.4), new THREE.Vector2(0, 1.8)];
    const kalashaGeom = new THREE.LatheGeometry(kalashaPoints, 16);
    const kalasha = new THREE.Mesh(kalashaGeom, matGold);
    kalasha.position.y = amalakaY + 0.5; group.add(kalasha);

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.5), matMetal);
    pole.position.y = amalakaY + 2.0; group.add(pole);
    const flagShape = new THREE.Shape(); flagShape.moveTo(0, 0); flagShape.lineTo(2.2, 0.6); flagShape.lineTo(0, 1.5); flagShape.lineTo(0, 0);
    const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), matFlag);
    flag.position.set(0, amalakaY + 3.0, 0); flag.rotation.y = -Math.PI / 4; group.add(flag);

    return group;
}

function createDetailedTempleMesh(): THREE.Group {
    const templeGroup = new THREE.Group();
    const mandapa = createMandapa(); mandapa.position.z = 4; templeGroup.add(mandapa);
    const shikhara = createShikhara(); shikhara.position.z = -5; templeGroup.add(shikhara);
    const connector = new THREE.Mesh(new THREE.BoxGeometry(4, 4, 3), matBrown);
    connector.position.set(0, 3.5, -0.5); templeGroup.add(connector);
    return templeGroup;
}

function createOrnateGate(worldGroup: THREE.Group, angle: number, text: string) {
    const group = new THREE.Group();

    // High Pillars
    const pillarHeight = 15;
    const pillarGeo = new THREE.BoxGeometry(2.5, pillarHeight, 2.5);
    const pillarY = pillarHeight / 2;

    const leftP = new THREE.Mesh(pillarGeo, matBrown);
    leftP.position.set(-9, pillarY, 0);
    group.add(leftP);

    const rightP = new THREE.Mesh(pillarGeo, matBrown);
    rightP.position.set(9, pillarY, 0);
    group.add(rightP);

    // Arch on top
    const archY = pillarHeight - 0.5;
    const curveShape = new THREE.Shape();
    curveShape.moveTo(-11, 0); curveShape.lineTo(11, 0); curveShape.lineTo(11, 2);
    curveShape.quadraticCurveTo(0, 5, -11, 2); curveShape.lineTo(-11, 0);

    const archGeo = new THREE.ExtrudeGeometry(curveShape, { depth: 3, bevelEnabled: true, bevelSize: 0.2, bevelThickness: 0.2 });
    const arch = new THREE.Mesh(archGeo, matWhite);
    arch.position.set(0, archY, -1.5);
    group.add(arch);

    // Sign (Dynamic Text)
    if (text) {
        const sign = createGateSign(text);
        sign.position.set(0, archY + 2.5, 2.0);
        group.add(sign);
    }

    // Top Decor
    const k1 = createKalashGeometry();
    k1.position.set(0, archY + 4, 0);
    k1.scale.set(1.5, 1.5, 1.5);
    group.add(k1);

    // Flags
    const flagL = createGateFlag(); flagL.position.set(-9, pillarY + (pillarHeight / 2), 0); group.add(flagL);
    const flagR = createGateFlag(); flagR.position.set(9, pillarY + (pillarHeight / 2), 0); group.add(flagR);

    placeObjectOnWorld(worldGroup, group, angle, 0, 0);
}

function createGateSign(textStr: string): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 1024; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.fillStyle = '#4E342E'; ctx.strokeStyle = '#FFD700'; ctx.lineWidth = 10;
        ctx.fillRect(0, 0, 1024, 256); ctx.strokeRect(0, 0, 1024, 256);

        // Reduced font size slightly to ensure longer text fits
        ctx.font = 'bold 80px "Segoe UI", Arial, sans-serif';
        ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';

        // Convert to Uppercase to match style
        ctx.fillText(textStr.toUpperCase(), 512, 128, 950);
    }
    const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace;
    const signGroup = new THREE.Mesh(new THREE.PlaneGeometry(14, 3.5), new THREE.MeshBasicMaterial({ map: tex }));
    const backing = new THREE.Mesh(new THREE.BoxGeometry(14.2, 3.7, 0.5), matBrown); backing.position.z = -0.3; signGroup.add(backing);
    return signGroup;
}

function createGateFlag(): THREE.Group {
    const g = new THREE.Group();
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 4), matMetal);
    pole.position.y = 2; g.add(pole);
    const flagShape = new THREE.Shape(); flagShape.moveTo(0, 0); flagShape.lineTo(2.5, 0.8); flagShape.lineTo(0, 1.6); flagShape.lineTo(0, 0);
    const flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape), matFlag);
    flag.position.set(0, 3.8, 0); flag.rotation.y = -Math.PI / 2; g.add(flag);
    return g;
}

function createKalashGeometry(): THREE.Group {
    const g = new THREE.Group();
    const pot = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 16), matGold); g.add(pot);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 0.5), matGold); neck.position.y = 0.4; g.add(neck);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.05, 8, 16), matGold); rim.rotation.x = Math.PI / 2; rim.position.y = 0.65; g.add(rim);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 8), matGold); tip.position.y = 0.8; g.add(tip);
    const flagGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([0, 0, 0, 1.2, 0.4, 0, 0, 0.8, 0]);
    flagGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    flagGeo.computeVertexNormals();
    const flag = new THREE.Mesh(flagGeo, new THREE.MeshStandardMaterial({ color: TEMPLE_COLORS.flag, side: THREE.DoubleSide }));
    flag.position.set(0, 0.8, 0); g.add(flag);
    return g;
}