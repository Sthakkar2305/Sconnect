import * as THREE from 'three';
import { GLOBE_RADIUS } from './curvePlacement';

export function createPlayerMachine(scene: THREE.Scene) {
  const machineGroup = new THREE.Group();
  const matBody = new THREE.MeshStandardMaterial({ color: 0x1a332d, roughness: 0.3, metalness: 0.2 });
  const matAccent = new THREE.MeshStandardMaterial({ color: 0x2e7d32, roughness: 0.5 });
  // Removed unused matBlack
  const matWhite = new THREE.MeshStandardMaterial({ color: 0xffffff });

  // Chassis
  const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.15, 1.4), matBody);
  chassis.position.set(0, 0.45, 0); chassis.castShadow = true; machineGroup.add(chassis);
  const f1 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.25), matBody); f1.position.set(0, 0.4, 0.6); machineGroup.add(f1);
  const f2 = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.35, 0.25), matBody); f2.position.set(0, 0.4, -0.6); machineGroup.add(f2);

  // Wheels
  const wMat = new THREE.MeshStandardMaterial({color: 0x1a1a1a});
  [[0.6, 0.55], [-0.6, 0.55], [0.6, -0.55], [-0.6, -0.55]].forEach(p => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.08, 16, 32), wMat));
      g.add(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32).rotateX(Math.PI/2), matAccent));
      g.position.set(p[0], 0.33, p[1]); machineGroup.add(g);
  });

  // Cabinet
  const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 0.8), matBody);
  cabinet.position.set(0, 1.1, 0); machineGroup.add(cabinet);

  // Screens
  const cvs = document.createElement('canvas'); cvs.width=512; cvs.height=350;
  const ctx = cvs.getContext('2d');
  if(ctx) {
      const grd = ctx.createLinearGradient(0, 0, 512, 350); grd.addColorStop(0, "#e65100"); grd.addColorStop(1, "#2e7d32");
      ctx.fillStyle = grd; ctx.fillRect(0,0,512,350);
      ctx.fillStyle='white'; ctx.font='bold 120px Arial'; ctx.textAlign='center'; ctx.fillText('55"', 256, 160);
      ctx.font='bold 40px Arial'; ctx.fillText('OUTDOOR TV', 256, 230);
  }
  const machineScreenMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cvs) });
  
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.05, 0.7), machineScreenMat);
  screen.position.set(0, 1.25, 0.41); screen.name = 'TV_SCREEN_FRONT'; machineGroup.add(screen);
  
  const screenBack = screen.clone(); screenBack.position.z = -0.41; screenBack.rotation.y = Math.PI; screenBack.name = 'TV_SCREEN_BACK';
  machineGroup.add(screenBack);

  // Solar & Camera Arm
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.6), matBody); pole.position.set(0, 2.05, -0.2); machineGroup.add(pole);
  const solar = new THREE.Group(); solar.position.set(0, 2.4, -0.2); solar.rotation.x = THREE.MathUtils.degToRad(-30);
  const sPanel = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.04, 1.2), new THREE.MeshStandardMaterial({color: 0x1a237e}));
  const p1 = sPanel.clone(); p1.position.x = -0.38; solar.add(p1);
  const p2 = sPanel.clone(); p2.position.x = 0.38; solar.add(p2);
  machineGroup.add(solar);

  const camGrp = new THREE.Group(); camGrp.position.set(0.7, 2.2, -0.1);
  camGrp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.4).rotateZ(Math.PI/2), matWhite).translateX(-0.2));
  camGrp.add(new THREE.Mesh(new THREE.SphereGeometry(0.12), matWhite).translateY(-0.25));
  machineGroup.add(camGrp);

  // Upload Button
  const bubCvs = document.createElement('canvas'); bubCvs.width=256; bubCvs.height=256;
  const bCtx = bubCvs.getContext('2d');
  if(bCtx) {
      bCtx.beginPath(); bCtx.arc(128,128,120,0,Math.PI*2); bCtx.fillStyle="white"; bCtx.fill();
      bCtx.lineWidth=10; bCtx.strokeStyle="#2e7d32"; bCtx.stroke();
      bCtx.fillStyle="#2e7d32"; bCtx.font="bold 80px Arial"; bCtx.textAlign="center"; bCtx.fillText("⬆", 128, 100);
      bCtx.fillStyle="black"; bCtx.font="bold 28px Arial"; bCtx.fillText("UPLOAD", 128, 150);
  }
  const btn = new THREE.Mesh(new THREE.CircleGeometry(0.18, 32), new THREE.MeshBasicMaterial({map: new THREE.CanvasTexture(bubCvs), transparent:true}));
  btn.position.set(0.65, 1.6, 0.5); btn.name = 'UPLOAD_BUTTON'; machineGroup.add(btn);

  machineGroup.scale.set(3,3,3);
  
  const zPos = 8;
  const surfaceY = Math.sqrt(Math.pow(GLOBE_RADIUS, 2) - Math.pow(zPos, 2));
  machineGroup.position.set(0, surfaceY, zPos);
  machineGroup.rotation.y = Math.PI;
  machineGroup.rotation.x = Math.atan2(zPos, surfaceY);
  
  scene.add(machineGroup);

  return { machineGroup, machineScreenMat };
}