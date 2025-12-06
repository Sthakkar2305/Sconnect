import * as THREE from 'three';
import { placeObjectOnWorld, GLOBE_RADIUS } from './curvePlacement';

// --- CONFIGURATION: REALISTIC AIRPORT AESTHETIC ---
const AIRPORT_COLORS = {
  concrete: 0x333333,     // Dark Tarmac
  markingYellow: 0xFFC107,// Taxiway Yellow
  markingWhite: 0xE0E0E0, // Stand lines
  lightBlue: 0x00B0FF,    // Edge lights (Emissive)
  
  terminalWall: 0xEEEEEE, // White Alucobond panels
  terminalGlass: 0x1f2f38, // Dark Blue-Grey Glass
  roof: 0x607D8B,         // Metal Roof
  
  planeBody: 0xFFFFFF,    // White Fuselage
  planeGrey: 0x90A4AE,    // Wings
  planeDark: 0x263238     // Engines/Tires
};

// --- HIGH QUALITY MATERIALS ---
const matConcrete = new THREE.MeshStandardMaterial({ 
    color: AIRPORT_COLORS.concrete, 
    roughness: 0.9, 
    metalness: 0.1 
});

const matMarkingYellow = new THREE.MeshBasicMaterial({ color: AIRPORT_COLORS.markingYellow });
const matMarkingWhite = new THREE.MeshBasicMaterial({ color: AIRPORT_COLORS.markingWhite });

const matTerminal = new THREE.MeshStandardMaterial({ 
    color: AIRPORT_COLORS.terminalWall, 
    roughness: 0.4, 
    metalness: 0.2 
});

const matGlass = new THREE.MeshPhysicalMaterial({ 
    color: AIRPORT_COLORS.terminalGlass, 
    metalness: 0.9, 
    roughness: 0.0, 
    transparent: true, 
    opacity: 0.8,
    reflectivity: 1.0,
    clearcoat: 1.0
});

const matRoof = new THREE.MeshStandardMaterial({ color: AIRPORT_COLORS.roof, roughness: 0.5, metalness: 0.7 });

const matLight = new THREE.MeshBasicMaterial({ color: AIRPORT_COLORS.lightBlue });

// Plane Materials
const matPlaneBody = new THREE.MeshStandardMaterial({ color: AIRPORT_COLORS.planeBody, roughness: 0.3, metalness: 0.1 });
const matPlaneWings = new THREE.MeshStandardMaterial({ color: AIRPORT_COLORS.planeGrey, roughness: 0.5, metalness: 0.3 });
const matPlaneDark = new THREE.MeshStandardMaterial({ color: AIRPORT_COLORS.planeDark });


export function createBeachSector(worldGroup: THREE.Group) {
  // NOTE: Function named createBeachSector for compatibility, creates AIRPORT scene.
  const sectorStart = (Math.PI * 4) / 3;
  const sectorEnd = Math.PI * 2;
  const sectorSize = sectorEnd - sectorStart;

  // 1. Tarmac (Replaces Road)
  createTarmacStrip(worldGroup, sectorStart, sectorEnd);

  // 2. Modern Terminal Buildings (Right Side)
  // Aligned at distance 20 to match City Buildings
  const termCount = 5;
  for(let i=0; i<termCount; i++) {
    const angle = sectorStart + (i / termCount) * sectorSize + 0.15;
    createModernTerminal(worldGroup, angle, 1);
  }

  // 3. Hangars & Cargo (Left Side)
  const hangarCount = 4;
  for(let i=0; i<hangarCount; i++) {
    const angle = sectorStart + (i / hangarCount) * sectorSize + 0.1;
    createHangar(worldGroup, angle, -1);
  }

  // 4. Parked Airliners (Left Side)
  // Placed between hangars
  for(let i=0; i<3; i++) {
    const angle = sectorStart + (i / 3) * sectorSize + 0.25;
    createCommercialJet(worldGroup, angle, -1, 28);
  }

  // 5. Taxiway Edge Lights
  createEdgeLights(worldGroup, sectorStart, sectorEnd);

  // 6. Control Tower (Landmark)
  createControlTower(worldGroup, sectorStart + sectorSize * 0.6, -1);
}

/**
 * Creates the dark concrete Taxiway with Yellow Centerline
 */
function createTarmacStrip(worldGroup: THREE.Group, startAngle: number, endAngle: number) {
    const width = 24; 
    const arc = endAngle - startAngle;
    
    // Segmented Floor for curvature
    const numStrips = 24;
    const angleStep = arc / numStrips;
    const stripLen = arc * GLOBE_RADIUS / numStrips;

    for(let i=0; i<numStrips; i++) {
        const angle = startAngle + (i * angleStep) + (angleStep/2);
        const pivot = new THREE.Object3D();
        pivot.rotation.x = -angle;

        const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, stripLen), matConcrete);
        mesh.rotation.x = -Math.PI/2; 
        mesh.position.set(0, GLOBE_RADIUS + 0.05, 0); 
        pivot.add(mesh);
        worldGroup.add(pivot);
    }

    // Yellow Center Line (Continuous)
    const lineGeo = new THREE.TorusGeometry(GLOBE_RADIUS + 0.06, 0.15, 16, 128, arc);
    const lineMesh = new THREE.Mesh(lineGeo, matMarkingYellow);
    lineMesh.rotation.y = Math.PI / 2;
    lineMesh.rotation.z = startAngle + Math.PI / 2;
    worldGroup.add(lineMesh);

    // White Stand Lines (Dashed on the right side)
    const dashCount = 30;
    for(let i=0; i<dashCount; i++) {
        const a = startAngle + (i/dashCount) * arc;
        const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 3), matMarkingWhite);
        dash.rotation.x = -Math.PI/2;
        dash.rotation.z = Math.PI/4; // Angled stand line
        placeObjectOnWorld(worldGroup, dash, a, 1, 8); // Right side
    }
}

/**
 * Sleek Modern Terminal (Glass Facade)
 */
function createModernTerminal(worldGroup: THREE.Group, angle: number, side: number) {
    const group = new THREE.Group();

    // Main Structure (Block)
    const width = 12; 
    const height = 6; 
    const depth = 8;
    const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), matTerminal);
    body.position.y = height/2;
    group.add(body);

    // Glass Curtain Wall (Angled)
    const glassGeo = new THREE.BoxGeometry(width + 0.2, height - 1, 0.5);
    const glass = new THREE.Mesh(glassGeo, matGlass);
    glass.position.set(0, height/2, depth/2 + 0.1);
    glass.rotation.x = -0.05; // Slight slant
    group.add(glass);

    // Roof Overhang (Wing shape)
    const roofShape = new THREE.Shape();
    roofShape.moveTo(-width/2 - 2, 0);
    roofShape.lineTo(width/2 + 2, 0);
    roofShape.lineTo(width/2, 1);
    roofShape.lineTo(-width/2, 1);
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: depth + 3, bevelEnabled: false });
    const roof = new THREE.Mesh(roofGeo, matRoof);
    roof.rotation.x = Math.PI/2; // Flatten
    roof.position.set(0, height, -depth/2 - 1);
    group.add(roof);

    // Jet Bridge (Tube connecting to planes)
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 6), matRoof);
    bridge.position.set(2, 3, 5);
    group.add(bridge);

    // Rotunda at end
    const rotunda = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 2, 16), matTerminal);
    rotunda.position.set(2, 3, 8);
    group.add(rotunda);

    // Place at distance 20 (Same as City Buildings)
    placeObjectOnWorld(worldGroup, group, angle, side, 20);
}

/**
 * Industrial Aircraft Hangar (Curved Roof)
 */
function createHangar(worldGroup: THREE.Group, angle: number, side: number) {
    const group = new THREE.Group();
    const width = 14; 
    const length = 10;
    const height = 6;

    // Curved Roof
    const roofGeo = new THREE.CylinderGeometry(width/2, width/2, length, 32, 1, true, 0, Math.PI);
    const roof = new THREE.Mesh(roofGeo, matRoof);
    roof.rotation.z = Math.PI / 2;
    roof.position.y = height;
    group.add(roof);

    // Side Walls
    const wallGeo = new THREE.BoxGeometry(width, height, length);
    const wall = new THREE.Mesh(wallGeo, matTerminal);
    wall.position.y = height/2;
    group.add(wall);

    // Open Door Frame
    const doorFrame = new THREE.Mesh(new THREE.BoxGeometry(width - 1, height - 1, 0.5), new THREE.MeshStandardMaterial({color: 0x333333}));
    doorFrame.position.set(0, height/2, length/2);
    group.add(doorFrame);

    // Red Obstruction Light on top
    const light = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), new THREE.MeshBasicMaterial({color: 0xFF0000}));
    light.position.y = height + width/2;
    group.add(light);

    // Rotate to face road
    group.rotation.y = side === 1 ? -Math.PI/2 : Math.PI/2;

    placeObjectOnWorld(worldGroup, group, angle, side, 22);
}

/**
 * Realistic Commercial Jet
 */
function createCommercialJet(worldGroup: THREE.Group, angle: number, side: number, dist: number) {
    const group = new THREE.Group();

    // 1. Fuselage
    const fuselageLen = 14;
    const fuselageRad = 1.1;
    const fuselage = new THREE.Mesh(new THREE.CylinderGeometry(fuselageRad, fuselageRad, fuselageLen, 24), matPlaneBody);
    fuselage.rotation.z = Math.PI / 2;
    fuselage.position.y = 2.0;
    group.add(fuselage);

    // 2. Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(fuselageRad, 24, 24), matPlaneBody);
    nose.position.set(fuselageLen/2, 2.0, 0);
    group.add(nose);

    // 3. Tail Cone
    const tailCone = new THREE.Mesh(new THREE.ConeGeometry(fuselageRad, 2.5, 24), matPlaneBody);
    tailCone.rotation.z = -Math.PI / 2;
    tailCone.position.set(-fuselageLen/2 - 1.25, 2.0, 0);
    group.add(tailCone);

    // 4. Wings (Swept)
    const wingShape = new THREE.Shape();
    wingShape.moveTo(0,0); wingShape.lineTo(3, 0); wingShape.lineTo(1, 8); wingShape.lineTo(-1, 8);
    const wingGeo = new THREE.ExtrudeGeometry(wingShape, {depth: 0.2, bevelEnabled: false});
    
    const leftWing = new THREE.Mesh(wingGeo, matPlaneWings);
    leftWing.rotation.x = Math.PI / 2; 
    leftWing.rotation.z = -0.2; 
    leftWing.position.set(1, 1.8, 0.5);
    group.add(leftWing);

    const rightWing = new THREE.Mesh(wingGeo, matPlaneWings);
    rightWing.rotation.x = -Math.PI / 2; 
    rightWing.rotation.z = 0.2; 
    rightWing.position.set(1, 1.8, -0.5);
    group.add(rightWing);

    // 5. Tail Fin (Vertical Stabilizer)
    const tailGeo = new THREE.BoxGeometry(3, 3.5, 0.2);
    const tail = new THREE.Mesh(tailGeo, new THREE.MeshStandardMaterial({color: 0x01579B})); // Blue Tail
    tail.position.set(-fuselageLen/2 + 1, 4, 0);
    // Skew it manually by rotation or custom geometry for simplicity
    tail.rotation.z = -0.3;
    group.add(tail);

    // 6. Engines
    const engGeo = new THREE.CylinderGeometry(0.5, 0.5, 2, 16);
    const eng1 = new THREE.Mesh(engGeo, matPlaneDark);
    eng1.rotation.z = Math.PI / 2; eng1.position.set(0, 1.2, 3); group.add(eng1);
    
    const eng2 = eng1.clone();
    eng2.position.z = -3; group.add(eng2);

    // 7. Landing Gear (Visual only)
    const gearLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5), matPlaneDark);
    gearLeg.position.set(4, 1, 0); group.add(gearLeg);

    // Orientation: Parked Parallel to runway or Angled
    group.rotation.y = Math.PI; // Nose pointing back or forward

    placeObjectOnWorld(worldGroup, group, angle, side, dist);
}

/**
 * Control Tower
 */
function createControlTower(worldGroup: THREE.Group, angle: number, side: number) {
    const group = new THREE.Group();

    // Shaft
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 2.5, 15, 8), matTerminal);
    shaft.position.y = 7.5;
    group.add(shaft);

    // Cab
    const cab = new THREE.Mesh(new THREE.CylinderGeometry(4, 3, 3, 8), matGlass);
    cab.position.y = 16.5;
    group.add(cab);

    // Roof
    const roof = new THREE.Mesh(new THREE.ConeGeometry(5, 2, 8), matRoof);
    roof.position.y = 19;
    group.add(roof);

    // Antenna
    const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 5), new THREE.MeshBasicMaterial({color: 0xFF0000}));
    ant.position.y = 21;
    group.add(ant);

    placeObjectOnWorld(worldGroup, group, angle, side, 25);
}

/**
 * Blue Taxiway Edge Lights
 */
function createEdgeLights(worldGroup: THREE.Group, startAngle: number, endAngle: number) {
    const geo = new THREE.CylinderGeometry(0.1, 0.1, 0.3);
    const count = 40;
    const step = (endAngle - startAngle) / count;

    for(let i=0; i<count; i++) {
        const angle = startAngle + i * step;
        
        // Left
        const l1 = new THREE.Mesh(geo, matLight);
        l1.position.y = 0.15;
        placeObjectOnWorld(worldGroup, l1, angle, -1, 10); // Edge of tarmac

        // Right
        const l2 = new THREE.Mesh(geo, matLight);
        l2.position.y = 0.15;
        placeObjectOnWorld(worldGroup, l2, angle, 1, 10);
    }
}