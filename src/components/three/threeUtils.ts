import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { ModelTemplateId } from '../../types';

export function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

export function createStudioRenderer(
  container: HTMLElement,
  isSoftwareGl: boolean,
  alpha = false,
): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.12;
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setSize(container.clientWidth || 640, container.clientHeight || 420);
  if (alpha) {
    renderer.setClearColor(0x000000, 0);
  }
  return renderer;
}

export function applyStudioEnvironmentAndLights(
  scene: THREE.Scene,
  renderer: THREE.WebGLRenderer,
  isSoftwareGl: boolean,
): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = envTex;
  pmrem.dispose();

  const hemi = new THREE.HemisphereLight(0xdbeafe, 0x1e293b, 0.85);
  hemi.position.set(0, 8, 0);
  scene.add(hemi);

  const keyLight = new THREE.DirectionalLight(0xfff7ed, 1.85);
  keyLight.position.set(4.5, 6.5, 5);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    const d = 4;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0005;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0x60a5fa, 1.1);
  rimLight.position.set(-4.5, 3, -4);
  scene.add(rimLight);

  return envTex;
}

export function createContactShadowPlane(radius = 1.6): THREE.Mesh {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const grad = ctx.createRadialGradient(
      size / 2,
      size / 2,
      size * 0.08,
      size / 2,
      size / 2,
      size * 0.48,
    );
    grad.addColorStop(0, 'rgba(15, 23, 42, 0.45)');
    grad.addColorStop(0.55, 'rgba(15, 23, 42, 0.16)');
    grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -1.35;
  return mesh;
}

export function afterDrawSync(
  renderer: THREE.WebGLRenderer,
  cb: () => void,
  registerTimer: (id: number) => void,
) {
  const gl = renderer.getContext() as WebGL2RenderingContext;
  if (!gl || typeof gl.fenceSync !== 'function') {
    const id = window.setTimeout(cb, 80);
    registerTimer(id);
    return;
  }
  const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
  gl.flush();
  const poll = () => {
    const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
    if (state === gl.UNSIGNALED) {
      registerTimer(window.setTimeout(poll, 5));
    } else {
      if (sync) gl.deleteSync(sync);
      registerTimer(window.setTimeout(cb, 80));
    }
  };
  registerTimer(window.setTimeout(poll, 5));
}

export interface BuiltModelResult {
  root: THREE.Group;
  interactables: THREE.Object3D[];
  animate: (elapsed: number, explodeAmount: number) => void;
}

function tagPart(obj: THREE.Object3D, meshKey: string, basePos?: THREE.Vector3, explodeDir?: THREE.Vector3) {
  obj.userData.meshKey = meshKey;
  if (basePos) obj.userData.basePos = basePos.clone();
  else obj.userData.basePos = obj.position.clone();
  obj.userData.explodeDir = explodeDir ? explodeDir.clone() : new THREE.Vector3(0, 0, 0);
  obj.traverse((child) => {
    child.userData.meshKey = meshKey;
    if ((child as THREE.Mesh).isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}

export function buildEducationalModel(template: ModelTemplateId): BuiltModelResult {
  const root = new THREE.Group();
  const interactables: THREE.Object3D[] = [];
  const animatedHandles: Record<string, THREE.Object3D[]> = {};

  const applyExplode = (explodeAmount: number) => {
    root.children.forEach((child) => {
      if (child.userData.basePos && child.userData.explodeDir) {
        const base = child.userData.basePos as THREE.Vector3;
        const dir = child.userData.explodeDir as THREE.Vector3;
        child.position.set(
          base.x + dir.x * explodeAmount,
          base.y + dir.y * explodeAmount,
          base.z + dir.z * explodeAmount,
        );
      }
    });
  };

  if (template === 'human-heart') {
    const oxyRed = new THREE.MeshPhysicalMaterial({
      color: 0xc81e3a,
      roughness: 0.32,
      metalness: 0.05,
      clearcoat: 0.55,
      clearcoatRoughness: 0.25,
    });
    const deoxyBlue = new THREE.MeshPhysicalMaterial({
      color: 0x2563eb,
      roughness: 0.35,
      metalness: 0.05,
      clearcoat: 0.5,
    });
    const atrialTissue = new THREE.MeshStandardMaterial({
      color: 0x9f1239,
      roughness: 0.48,
      metalness: 0.02,
    });
    const coronaryMat = new THREE.MeshStandardMaterial({
      color: 0xf43f5e,
      roughness: 0.3,
      metalness: 0.08,
    });

    // Left Ventricle (dominant muscular apex)
    const lvGeo = new THREE.SphereGeometry(0.55, 32, 24);
    lvGeo.scale(0.88, 1.32, 0.85);
    const lv = new THREE.Mesh(lvGeo, oxyRed.clone());
    lv.position.set(0.28, -0.35, 0.05);
    lv.rotation.z = 0.28;
    tagPart(lv, 'left-ventricle', lv.position, new THREE.Vector3(0.45, -0.35, 0.2));
    root.add(lv);
    interactables.push(lv);

    // Right Ventricle
    const rvGeo = new THREE.SphereGeometry(0.48, 28, 22);
    rvGeo.scale(0.82, 1.15, 0.85);
    const rv = new THREE.Mesh(rvGeo, deoxyBlue.clone());
    rv.position.set(-0.28, -0.25, 0.14);
    rv.rotation.z = -0.2;
    tagPart(rv, 'right-ventricle', rv.position, new THREE.Vector3(-0.45, -0.25, 0.25));
    root.add(rv);
    interactables.push(rv);

    // Left Atrium
    const la = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 20), atrialTissue.clone());
    la.position.set(0.42, 0.36, -0.05);
    tagPart(la, 'left-atrium', la.position, new THREE.Vector3(0.45, 0.35, -0.2));
    root.add(la);
    interactables.push(la);

    // Right Atrium + Vena Cava stub
    const raGroup = new THREE.Group();
    const raMesh = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20), deoxyBlue.clone());
    const svc = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, 0.6, 18), deoxyBlue.clone());
    svc.position.set(-0.08, 0.45, -0.05);
    raGroup.add(raMesh, svc);
    raGroup.position.set(-0.45, 0.35, 0.02);
    tagPart(raGroup, 'right-atrium', raGroup.position, new THREE.Vector3(-0.5, 0.35, 0));
    root.add(raGroup);
    interactables.push(raGroup);

    // Aorta Arch (TubeGeometry)
    const aortaCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.15, 0.15, 0.05),
      new THREE.Vector3(0.18, 0.72, 0.02),
      new THREE.Vector3(0.0, 0.96, -0.04),
      new THREE.Vector3(-0.24, 0.8, -0.18),
      new THREE.Vector3(-0.26, 0.1, -0.3),
    ]);
    const aortaGeo = new THREE.TubeGeometry(aortaCurve, 32, 0.135, 16, false);
    const aorta = new THREE.Mesh(aortaGeo, oxyRed.clone());
    tagPart(aorta, 'aorta', aorta.position, new THREE.Vector3(0.1, 0.55, -0.15));
    root.add(aorta);
    interactables.push(aorta);

    // Pulmonary Artery Trunk
    const pulmCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.18, 0.15, 0.25),
      new THREE.Vector3(-0.08, 0.58, 0.28),
      new THREE.Vector3(0.32, 0.68, 0.15),
    ]);
    const pulmGroup = new THREE.Group();
    pulmGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pulmCurve, 24, 0.105, 14, false), deoxyBlue.clone()));
    const pulmLeftBranch = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.08, 0.58, 0.28),
      new THREE.Vector3(-0.48, 0.65, 0.12),
    ]);
    pulmGroup.add(new THREE.Mesh(new THREE.TubeGeometry(pulmLeftBranch, 16, 0.08, 12, false), deoxyBlue.clone()));
    tagPart(pulmGroup, 'pulmonary-artery', pulmGroup.position, new THREE.Vector3(-0.15, 0.45, 0.45));
    root.add(pulmGroup);
    interactables.push(pulmGroup);

    // Coronary surface vessels accent
    const corCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.05, 0.15, 0.42),
      new THREE.Vector3(0.02, -0.25, 0.48),
      new THREE.Vector3(0.18, -0.68, 0.32),
    ]);
    const corMesh = new THREE.Mesh(new THREE.TubeGeometry(corCurve, 18, 0.026, 8, false), coronaryMat);
    tagPart(corMesh, 'left-ventricle', corMesh.position, new THREE.Vector3(0.3, -0.2, 0.4));
    root.add(corMesh);

    animatedHandles.chambers = [lv, rv, la, raGroup];
  } else if (template === 'human-skeleton') {
    const boneMat = new THREE.MeshStandardMaterial({
      color: 0xf1ece1,
      roughness: 0.46,
      metalness: 0.04,
    });
    const cartilageMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      roughness: 0.35,
      metalness: 0.05,
    });

    // Cranium + Jaw
    const skullGroup = new THREE.Group();
    const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 20), boneMat.clone());
    cranium.scale.set(0.92, 1.05, 1.02);
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.26), boneMat.clone());
    jaw.position.set(0, -0.18, 0.06);
    const leftSocket = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 }),
    );
    leftSocket.position.set(-0.09, -0.02, 0.24);
    const rightSocket = leftSocket.clone();
    rightSocket.position.x = 0.09;
    skullGroup.add(cranium, jaw, leftSocket, rightSocket);
    skullGroup.position.set(0, 1.38, 0);
    tagPart(skullGroup, 'cranium', skullGroup.position, new THREE.Vector3(0, 0.55, 0));
    root.add(skullGroup);
    interactables.push(skullGroup);

    // Vertebral Column
    const spineGroup = new THREE.Group();
    for (let i = 0; i < 12; i++) {
      const y = 1.05 - i * 0.095;
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.09, 0.065, 14), boneMat.clone());
      v.position.set(0, y, -0.12 + Math.sin(i * 0.35) * 0.04);
      spineGroup.add(v);
    }
    tagPart(spineGroup, 'spine', spineGroup.position, new THREE.Vector3(0, 0, -0.45));
    root.add(spineGroup);
    interactables.push(spineGroup);

    // Ribcage + Sternum
    const ribGroup = new THREE.Group();
    const sternum = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.52, 0.06), cartilageMat.clone());
    sternum.position.set(0, 0.66, 0.25);
    ribGroup.add(sternum);
    for (let i = 0; i < 6; i++) {
      const y = 0.9 - i * 0.095;
      const radiusX = 0.24 + Math.sin((i / 5) * Math.PI) * 0.14;
      const ribGeo = new THREE.TorusGeometry(radiusX, 0.024, 10, 26, Math.PI * 1.45);
      const rib = new THREE.Mesh(ribGeo, boneMat.clone());
      rib.rotation.x = Math.PI / 2;
      rib.rotation.z = -Math.PI * 0.22;
      rib.position.set(0, y, 0.04);
      ribGroup.add(rib);
    }
    tagPart(ribGroup, 'ribcage', ribGroup.position, new THREE.Vector3(0, 0.1, 0.5));
    root.add(ribGroup);
    interactables.push(ribGroup);

    // Pelvis
    const pelvisGroup = new THREE.Group();
    const iliumL = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 12, 18, Math.PI), boneMat.clone());
    iliumL.position.set(-0.18, -0.08, 0.02);
    iliumL.rotation.z = 0.4;
    const iliumR = iliumL.clone();
    iliumR.position.x = 0.18;
    iliumR.rotation.z = -0.4;
    const sacrum = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 6), boneMat.clone());
    sacrum.rotation.x = Math.PI;
    sacrum.position.set(0, -0.1, -0.05);
    pelvisGroup.add(iliumL, iliumR, sacrum);
    tagPart(pelvisGroup, 'pelvis', pelvisGroup.position, new THREE.Vector3(0, -0.15, 0.35));
    root.add(pelvisGroup);
    interactables.push(pelvisGroup);

    // Lower Limbs (Femurs + Tibias) + Upper Arms
    const limbsGroup = new THREE.Group();
    [-1, 1].forEach((side) => {
      const femur = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.68, 14), boneMat.clone());
      femur.position.set(side * 0.23, -0.52, 0.02);
      femur.rotation.z = side * -0.06;
      const tibia = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.036, 0.56, 12), boneMat.clone());
      tibia.position.set(side * 0.21, -1.08, 0.02);
      const humerus = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.036, 0.55, 12), boneMat.clone());
      humerus.position.set(side * 0.46, 0.65, 0.02);
      humerus.rotation.z = side * 0.16;
      limbsGroup.add(femur, tibia, humerus);
    });
    tagPart(limbsGroup, 'femur', limbsGroup.position, new THREE.Vector3(0, -0.45, 0.2));
    root.add(limbsGroup);
    interactables.push(limbsGroup);
  } else if (template === 'human-cell') {
    // Cutaway Plasma Membrane Bowl
    const memMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      roughness: 0.22,
      metalness: 0.05,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      clearcoat: 0.8,
    });
    const membrane = new THREE.Mesh(
      new THREE.SphereGeometry(1.18, 36, 28, 0, Math.PI * 2, Math.PI * 0.35, Math.PI * 0.65),
      memMat,
    );
    membrane.position.set(0, -0.1, 0);
    tagPart(membrane, 'membrane', membrane.position, new THREE.Vector3(0, -0.35, 0));
    root.add(membrane);
    interactables.push(membrane);

    // Cytoplasm Disc
    const cyto = new THREE.Mesh(
      new THREE.CylinderGeometry(1.06, 1.06, 0.06, 36),
      new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.65, metalness: 0.02 }),
    );
    cyto.position.set(0, -0.1, 0);
    tagPart(cyto, 'membrane', cyto.position, new THREE.Vector3(0, -0.15, 0));
    root.add(cyto);

    // Nucleus + Nucleolus
    const nucGroup = new THREE.Group();
    const nucOuter = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 28, 22, 0, Math.PI * 1.55),
      new THREE.MeshStandardMaterial({ color: 0x6366f1, roughness: 0.38, metalness: 0.1, side: THREE.DoubleSide }),
    );
    const nucleolus = new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 20, 16),
      new THREE.MeshStandardMaterial({ color: 0x312e81, roughness: 0.3, metalness: 0.15 }),
    );
    nucGroup.add(nucOuter, nucleolus);
    nucGroup.position.set(0, 0.15, 0);
    tagPart(nucGroup, 'nucleus', nucGroup.position, new THREE.Vector3(0, 0.55, 0));
    root.add(nucGroup);
    interactables.push(nucGroup);

    // Mitochondria (2 capsules with cristae bands)
    const mitoGroup = new THREE.Group();
    const mitoMat = new THREE.MeshStandardMaterial({ color: 0xea580c, roughness: 0.36, metalness: 0.08 });
    [
      [0.64, 0.05, 0.32, 0.5],
      [-0.52, 0.06, -0.45, -0.8],
    ].forEach(([x, y, z, rot]) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.26, 8, 16), mitoMat.clone());
      m.position.set(x, y, z);
      m.rotation.set(Math.PI / 2, 0, rot);
      mitoGroup.add(m);
    });
    tagPart(mitoGroup, 'mitochondria', mitoGroup.position, new THREE.Vector3(0.45, 0.35, 0.35));
    root.add(mitoGroup);
    interactables.push(mitoGroup);

    // Golgi Apparatus (stacked curved cisternae)
    const golgiGroup = new THREE.Group();
    const golgiMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.35, metalness: 0.05 });
    for (let i = 0; i < 4; i++) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.22 + i * 0.055, 0.028, 10, 20, Math.PI * 0.75), golgiMat.clone());
      arc.rotation.x = Math.PI / 2;
      arc.position.set(-0.56, 0.02 + i * 0.02, 0.28);
      golgiGroup.add(arc);
    }
    tagPart(golgiGroup, 'golgi', golgiGroup.position, new THREE.Vector3(-0.45, 0.3, 0.3));
    root.add(golgiGroup);
    interactables.push(golgiGroup);

    // Endoplasmic Reticulum (folded ribbons around nucleus)
    const erGroup = new THREE.Group();
    const erMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, roughness: 0.42, metalness: 0.06 });
    for (let i = 0; i < 3; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.5 + i * 0.08, 0.032, 10, 24, Math.PI * 1.1), erMat.clone());
      ring.rotation.x = Math.PI / 2;
      ring.rotation.z = 0.6 + i * 0.25;
      ring.position.set(0.08, 0.02, -0.05);
      erGroup.add(ring);
    }
    tagPart(erGroup, 'er', erGroup.position, new THREE.Vector3(0.25, 0.4, -0.35));
    root.add(erGroup);
    interactables.push(erGroup);
    animatedHandles.spin = [mitoGroup];
  } else if (template === 'water-molecule') {
    const oMat = new THREE.MeshPhysicalMaterial({
      color: 0xdc2626,
      roughness: 0.2,
      metalness: 0.1,
      clearcoat: 0.85,
    });
    const hMat = new THREE.MeshPhysicalMaterial({
      color: 0xf8fafc,
      roughness: 0.22,
      metalness: 0.08,
      clearcoat: 0.8,
    });
    const bondMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.25,
      metalness: 0.7,
    });

    const oxygen = new THREE.Mesh(new THREE.SphereGeometry(0.46, 32, 24), oMat);
    oxygen.position.set(0, 0.25, 0);
    tagPart(oxygen, 'oxygen', oxygen.position, new THREE.Vector3(0, 0.45, 0));
    root.add(oxygen);
    interactables.push(oxygen);

    // 104.5 degree bond angle => half angle = 52.25 deg
    const halfAngle = THREE.MathUtils.degToRad(52.25);
    const bondDist = 1.05;
    const hPositions = [
      new THREE.Vector3(-Math.sin(halfAngle) * bondDist, 0.25 - Math.cos(halfAngle) * bondDist, 0),
      new THREE.Vector3(Math.sin(halfAngle) * bondDist, 0.25 - Math.cos(halfAngle) * bondDist, 0),
    ];

    const hGroup = new THREE.Group();
    const bondsGroup = new THREE.Group();
    hPositions.forEach((hp) => {
      const hSphere = new THREE.Mesh(new THREE.SphereGeometry(0.28, 28, 20), hMat.clone());
      hSphere.position.copy(hp);
      hGroup.add(hSphere);

      const dir = hp.clone().sub(oxygen.position);
      const len = dir.length();
      const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, len, 16), bondMat.clone());
      cyl.position.copy(oxygen.position).add(dir.clone().multiplyScalar(0.5));
      cyl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
      bondsGroup.add(cyl);
    });
    tagPart(hGroup, 'hydrogen', hGroup.position, new THREE.Vector3(0, -0.45, 0.2));
    tagPart(bondsGroup, 'bonds', bondsGroup.position, new THREE.Vector3(0, -0.2, 0.45));
    root.add(hGroup, bondsGroup);
    interactables.push(hGroup, bondsGroup);

    // Lone pair electron lobes (translucent violet teardrops)
    const lpGroup = new THREE.Group();
    const lpMat = new THREE.MeshPhysicalMaterial({
      color: 0x8b5cf6,
      roughness: 0.15,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    [-1, 1].forEach((side) => {
      const lobe = new THREE.Mesh(new THREE.SphereGeometry(0.24, 20, 16), lpMat.clone());
      lobe.scale.set(0.85, 1.35, 0.85);
      lobe.position.set(0, 0.72, side * 0.34);
      lobe.rotation.x = side * 0.55;
      lpGroup.add(lobe);
    });
    tagPart(lpGroup, 'lone-pairs', lpGroup.position, new THREE.Vector3(0, 0.55, -0.3));
    root.add(lpGroup);
    interactables.push(lpGroup);
    animatedHandles.bob = [lpGroup];
  } else if (template === 'atomic-structure') {
    // Nucleus cluster (6 protons red + 6 neutrons slate-blue)
    const nucleusGroup = new THREE.Group();
    const protonMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.25, metalness: 0.2 });
    const neutronMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.35, metalness: 0.3 });
    for (let i = 0; i < 12; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / 12);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 0.15;
      const nucleon = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 12),
        i % 2 === 0 ? protonMat.clone() : neutronMat.clone(),
      );
      nucleon.position.set(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta),
      );
      nucleusGroup.add(nucleon);
    }
    tagPart(nucleusGroup, 'nucleus', nucleusGroup.position, new THREE.Vector3(0, 0.35, 0));
    root.add(nucleusGroup);
    interactables.push(nucleusGroup);

    const orbitMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.3, metalness: 0.7 });
    const electronMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.45,
      roughness: 0.2,
    });

    // Inner Shell (2 electrons)
    const innerGroup = new THREE.Group();
    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.68, 0.018, 12, 48), orbitMat.clone());
    innerRing.rotation.x = Math.PI / 2.4;
    innerGroup.add(innerRing);
    const e1 = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), electronMat.clone());
    e1.position.set(0.68, 0, 0);
    const e2 = e1.clone();
    e2.position.set(-0.68, 0, 0);
    const innerElectrons = new THREE.Group();
    innerElectrons.rotation.x = Math.PI / 2.4;
    innerElectrons.add(e1, e2);
    innerGroup.add(innerElectrons);
    tagPart(innerGroup, 'inner-shell', innerGroup.position, new THREE.Vector3(0.25, -0.25, 0));
    root.add(innerGroup);
    interactables.push(innerGroup);

    // Outer Valence Shell (4 electrons)
    const outerGroup = new THREE.Group();
    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.18, 0.018, 12, 64), orbitMat.clone());
    outerRing.rotation.x = -Math.PI / 3;
    outerRing.rotation.y = 0.35;
    outerGroup.add(outerRing);
    const outerElectrons = new THREE.Group();
    outerElectrons.rotation.x = -Math.PI / 3;
    outerElectrons.rotation.y = 0.35;
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2;
      const el = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 12), electronMat.clone());
      el.position.set(Math.cos(a) * 1.18, Math.sin(a) * 1.18, 0);
      outerElectrons.add(el);
    }
    outerGroup.add(outerElectrons);
    tagPart(outerGroup, 'outer-shell', outerGroup.position, new THREE.Vector3(-0.35, 0.25, 0));
    root.add(outerGroup);
    interactables.push(outerGroup);

    animatedHandles.orbits = [innerElectrons, outerElectrons];
  } else if (template === 'solar-system') {
    // Sun
    const sun = new THREE.Mesh(
      new THREE.SphereGeometry(0.42, 32, 24),
      new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        emissive: 0xea580c,
        emissiveIntensity: 0.75,
        roughness: 0.4,
      }),
    );
    tagPart(sun, 'sun', sun.position, new THREE.Vector3(0, 0.55, 0));
    root.add(sun);
    interactables.push(sun);

    const orbitLineMat = new THREE.MeshBasicMaterial({
      color: 0x64748b,
      transparent: true,
      opacity: 0.45,
    });

    const addOrbitRing = (r: number) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.008, 8, 64), orbitLineMat);
      ring.rotation.x = Math.PI / 2;
      root.add(ring);
    };

    // Terrestrial Planets Group (Mercury, Venus, Earth+Moon, Mars)
    const earthPivot = new THREE.Group();
    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 24, 18),
      new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45, metalness: 0.1 }),
    );
    earth.position.set(1.02, 0, 0);
    const moon = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 12, 10),
      new THREE.MeshStandardMaterial({ color: 0xcbd5e1, roughness: 0.8 }),
    );
    moon.position.set(1.24, 0.04, 0.08);
    const mercury = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 16, 12),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.75 }),
    );
    mercury.position.set(0.62, 0, 0.18);
    const venus = new THREE.Mesh(
      new THREE.SphereGeometry(0.105, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 }),
    );
    venus.position.set(-0.78, 0, 0.35);
    const mars = new THREE.Mesh(
      new THREE.SphereGeometry(0.095, 18, 14),
      new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.72 }),
    );
    mars.position.set(0.35, 0, -1.24);
    earthPivot.add(earth, moon, mercury, venus, mars);
    [0.64, 0.84, 1.02, 1.28].forEach(addOrbitRing);
    tagPart(earthPivot, 'earth', earthPivot.position, new THREE.Vector3(0, 0.25, 0));
    root.add(earthPivot);
    interactables.push(earthPivot);

    // Jupiter
    addOrbitRing(1.62);
    const jupiterPivot = new THREE.Group();
    const jupiter = new THREE.Mesh(
      new THREE.SphereGeometry(0.24, 26, 20),
      new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.55 }),
    );
    jupiter.position.set(-1.55, 0, 0.45);
    jupiterPivot.add(jupiter);
    tagPart(jupiterPivot, 'jupiter', jupiterPivot.position, new THREE.Vector3(-0.3, 0.35, 0));
    root.add(jupiterPivot);
    interactables.push(jupiterPivot);

    // Saturn + Ring
    addOrbitRing(2.05);
    const saturnPivot = new THREE.Group();
    const saturn = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 24, 18),
      new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.52 }),
    );
    const saturnRing = new THREE.Mesh(
      new THREE.RingGeometry(0.28, 0.44, 42),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        roughness: 0.4,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.82,
      }),
    );
    saturnRing.rotation.x = Math.PI / 2.4;
    const saturnUnit = new THREE.Group();
    saturnUnit.add(saturn, saturnRing);
    saturnUnit.position.set(1.88, 0, -0.78);
    saturnPivot.add(saturnUnit);
    tagPart(saturnPivot, 'saturn', saturnPivot.position, new THREE.Vector3(0.35, 0.35, 0));
    root.add(saturnPivot);
    interactables.push(saturnPivot);

    animatedHandles.planets = [earthPivot, jupiterPivot, saturnPivot];
  } else {
    // Earth's Layers Cutaway
    const innerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.34, 28, 22),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.65,
        roughness: 0.25,
        metalness: 0.6,
      }),
    );
    tagPart(innerCore, 'inner-core', innerCore.position, new THREE.Vector3(0.35, -0.1, 0.35));
    root.add(innerCore);
    interactables.push(innerCore);

    const outerCore = new THREE.Mesh(
      new THREE.SphereGeometry(0.62, 32, 24, Math.PI * 0.5, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({
        color: 0xf97316,
        emissive: 0xc2410c,
        emissiveIntensity: 0.35,
        roughness: 0.35,
        side: THREE.DoubleSide,
      }),
    );
    tagPart(outerCore, 'outer-core', outerCore.position, new THREE.Vector3(0.18, 0.05, 0.18));
    root.add(outerCore);
    interactables.push(outerCore);

    const mantle = new THREE.Mesh(
      new THREE.SphereGeometry(0.96, 36, 28, Math.PI * 0.5, Math.PI * 1.5),
      new THREE.MeshStandardMaterial({
        color: 0xb91c1c,
        roughness: 0.62,
        side: THREE.DoubleSide,
      }),
    );
    tagPart(mantle, 'mantle', mantle.position, new THREE.Vector3(-0.15, 0.15, -0.15));
    root.add(mantle);
    interactables.push(mantle);

    const crustGroup = new THREE.Group();
    const oceanCrust = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 36, 28, Math.PI * 0.5, Math.PI * 1.5),
      new THREE.MeshPhysicalMaterial({
        color: 0x1d4ed8,
        roughness: 0.28,
        metalness: 0.08,
        clearcoat: 0.55,
        side: THREE.DoubleSide,
      }),
    );
    // Stylized tectonic continent plates
    const landMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.78 });
    const plate1 = new THREE.Mesh(new THREE.SphereGeometry(1.135, 18, 14, 2.2, 0.9, 0.7, 0.75), landMat);
    const plate2 = new THREE.Mesh(new THREE.SphereGeometry(1.135, 18, 14, 3.8, 0.85, 1.1, 0.85), landMat);
    crustGroup.add(oceanCrust, plate1, plate2);
    tagPart(crustGroup, 'crust', crustGroup.position, new THREE.Vector3(-0.35, 0.3, -0.35));
    root.add(crustGroup);
    interactables.push(crustGroup);
  }

  return {
    root,
    interactables,
    animate: (elapsed: number, explodeAmount: number) => {
      applyExplode(explodeAmount);
      if (animatedHandles.chambers) {
        const beat = 1 + Math.pow(Math.max(0, Math.sin(elapsed * 3.2)), 6) * 0.055;
        animatedHandles.chambers.forEach((c) => c.scale.setScalar(beat));
      }
      if (animatedHandles.orbits) {
        animatedHandles.orbits[0].rotation.z = elapsed * 1.4;
        animatedHandles.orbits[1].rotation.z = -elapsed * 0.85;
      }
      if (animatedHandles.planets) {
        animatedHandles.planets[0].rotation.y = elapsed * 0.32;
        animatedHandles.planets[1].rotation.y = elapsed * 0.14;
        animatedHandles.planets[2].rotation.y = elapsed * 0.09;
      }
      if (animatedHandles.bob) {
        animatedHandles.bob[0].position.y = Math.sin(elapsed * 2) * 0.03;
      }
    },
  };
}
