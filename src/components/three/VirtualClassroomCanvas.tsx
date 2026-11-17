import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ClassroomStation, VirtualClassroom } from '../../types';
import {
  afterDrawSync,
  applyStudioEnvironmentAndLights,
  buildEducationalModel,
  createStudioRenderer,
  detectSoftwareWebGL,
} from './threeUtils';

interface VirtualClassroomCanvasProps {
  classroom: VirtualClassroom;
  activeStationId: string | null;
  onSelectStation: (station: ClassroomStation) => void;
  moveCommand: { dir: 'forward' | 'back' | 'left' | 'right' | 'overview'; nonce: number } | null;
  reducedMotion: boolean;
}

const _proj = new THREE.Vector3();
const _targetCam = new THREE.Vector3();
const _targetLook = new THREE.Vector3();

export const VirtualClassroomCanvas: React.FC<VirtualClassroomCanvasProps> = ({
  classroom,
  activeStationId,
  onSelectStation,
  moveCommand,
  reducedMotion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pinRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [contextLost, setContextLost] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const onSelectStationRef = useRef(onSelectStation);
  onSelectStationRef.current = onSelectStation;

  const propsRef = useRef({ activeStationId, reducedMotion, stations: classroom.stations });
  propsRef.current = { activeStationId, reducedMotion, stations: classroom.stations };

  const transitionRef = useRef<{
    active: boolean;
    camPos: THREE.Vector3;
    lookAt: THREE.Vector3;
  }>({
    active: false,
    camPos: new THREE.Vector3(0, 3.1, 7.2),
    lookAt: new THREE.Vector3(0, 1.0, 0),
  });

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  // Glide camera when user picks a station
  useEffect(() => {
    if (!activeStationId) return;
    const station = classroom.stations.find((s) => s.id === activeStationId);
    if (!station) return;
    transitionRef.current = {
      active: true,
      camPos: new THREE.Vector3(...station.cameraPosition),
      lookAt: new THREE.Vector3(...station.lookAt),
    };
  }, [activeStationId, classroom.stations]);

  // Execute directional navigation controls
  useEffect(() => {
    if (!moveCommand || !cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    transitionRef.current.active = false;

    if (moveCommand.dir === 'overview') {
      transitionRef.current = {
        active: true,
        camPos: new THREE.Vector3(0, 3.2, 7.6),
        lookAt: new THREE.Vector3(0, 1.0, 0),
      };
      return;
    }

    const forward = new THREE.Vector3();
    cam.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    const step = 0.9;
    if (moveCommand.dir === 'forward') {
      cam.position.addScaledVector(forward, step);
      ctrl.target.addScaledVector(forward, step);
    } else if (moveCommand.dir === 'back') {
      cam.position.addScaledVector(forward, -step);
      ctrl.target.addScaledVector(forward, -step);
    } else if (moveCommand.dir === 'left') {
      cam.position.addScaledVector(right, -step);
      ctrl.target.addScaledVector(right, -step);
    } else if (moveCommand.dir === 'right') {
      cam.position.addScaledVector(right, step);
      ctrl.target.addScaledVector(right, step);
    }
    ctrl.update();
  }, [moveCommand]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const scene = new THREE.Scene();

    const bgColors: Record<VirtualClassroom['environmentId'], number> = {
      'anatomy-lab': 0xe2e8f0,
      'solar-observatory': 0x060b19,
      'earth-station': 0xdbeafe,
    };
    const bgHex = bgColors[classroom.environmentId];
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, classroom.environmentId === 'solar-observatory' ? 0.032 : 0.025);

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 460;
    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 3.2, 7.6);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createStudioRenderer(container, isSoftwareGl, false);
    } catch {
      setWebglUnsupported(true);
      return;
    }
    const domEl = renderer.domElement;
    domEl.style.width = '100%';
    domEl.style.height = '100%';
    domEl.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(domEl);

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const handleContextRestored = () => setContextLost(false);
    domEl.addEventListener('webglcontextlost', handleContextLost);
    domEl.addEventListener('webglcontextrestored', handleContextRestored);

    const envTex = applyStudioEnvironmentAndLights(scene, renderer, isSoftwareGl);

    // Environment floor & architectural structures
    const isSpace = classroom.environmentId === 'solar-observatory';
    const floorMat = new THREE.MeshStandardMaterial({
      color: isSpace ? 0x0f172a : 0xf1f5f9,
      roughness: isSpace ? 0.35 : 0.65,
      metalness: isSpace ? 0.35 : 0.05,
    });
    const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 48), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridColor = isSpace ? 0x1e3a8a : 0xcbd5e1;
    const grid = new THREE.GridHelper(20, 24, gridColor, gridColor);
    grid.position.y = 0.015;
    scene.add(grid);

    // Build background context props
    if (classroom.environmentId === 'anatomy-lab') {
      const wallMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.7 });
      const backWall = new THREE.Mesh(new THREE.BoxGeometry(16, 4.5, 0.2), wallMat);
      backWall.position.set(0, 2.25, -4.2);
      backWall.receiveShadow = true;
      scene.add(backWall);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(6.8, 2.1, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x172554, roughness: 0.4, metalness: 0.15 }),
      );
      board.position.set(0, 2.35, -4.05);
      scene.add(board);
    } else if (classroom.environmentId === 'solar-observatory') {
      // Starfield using InstancedMesh
      const starGeo = new THREE.SphereGeometry(0.04, 6, 6);
      const starMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
      const stars = new THREE.InstancedMesh(starGeo, starMat, 140);
      const dummy = new THREE.Object3D();
      for (let i = 0; i < 140; i++) {
        const theta = (i * 2.39996) % (Math.PI * 2);
        const phi = Math.acos(1 - (2 * (i + 0.5)) / 140);
        const r = 14 + (i % 5) * 2.2;
        dummy.position.set(
          r * Math.sin(phi) * Math.cos(theta),
          Math.abs(r * Math.cos(phi)) + 1.2,
          r * Math.sin(phi) * Math.sin(theta),
        );
        dummy.scale.setScalar(0.6 + (i % 4) * 0.35);
        dummy.updateMatrix();
        stars.setMatrixAt(i, dummy.matrix);
      }
      stars.computeBoundingSphere();
      scene.add(stars);
    } else {
      // Earth station architectural frame + horizon ring
      const deckRing = new THREE.Mesh(
        new THREE.TorusGeometry(6.5, 0.08, 12, 64),
        new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.35, metalness: 0.4 }),
      );
      deckRing.rotation.x = Math.PI / 2;
      deckRing.position.y = 0.04;
      scene.add(deckRing);
    }

    // Build 3 interactive learning stations inside the room
    const stationInteractables: THREE.Object3D[] = [];
    const stationAnimators: ((elapsed: number) => void)[] = [];
    const stationAnchors: Record<string, THREE.Vector3> = {};

    const pedestalMat = new THREE.MeshStandardMaterial({
      color: isSpace ? 0x1e293b : 0x172554,
      roughness: 0.35,
      metalness: 0.45,
    });
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x2563eb,
      emissiveIntensity: 0.65,
      roughness: 0.25,
    });

    classroom.stations.forEach((station) => {
      const stationGroup = new THREE.Group();
      const basePos = new THREE.Vector3(station.lookAt[0], 0, station.lookAt[2]);
      stationGroup.position.copy(basePos);

      // Pedestal
      const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.78, 28), pedestalMat.clone());
      pedestal.position.y = 0.39;
      pedestal.castShadow = true;
      pedestal.receiveShadow = true;

      const glowRing = new THREE.Mesh(new THREE.TorusGeometry(0.65, 0.025, 10, 36), ringMat.clone());
      glowRing.rotation.x = Math.PI / 2;
      glowRing.position.y = 0.79;
      stationGroup.add(pedestal, glowRing);

      // Station 3D Educational Object
      let heroObj: THREE.Object3D;
      if (station.meshKey === 'station-heart') {
        const built = buildEducationalModel('human-heart');
        heroObj = built.root;
        heroObj.scale.setScalar(0.58);
        heroObj.position.y = 1.5;
        stationAnimators.push((t) => built.animate(t, 0));
      } else if (station.meshKey === 'station-skeleton') {
        const built = buildEducationalModel('human-skeleton');
        heroObj = built.root;
        heroObj.scale.setScalar(0.55);
        heroObj.position.y = 1.65;
      } else if (station.meshKey === 'station-cell') {
        const built = buildEducationalModel('human-cell');
        heroObj = built.root;
        heroObj.scale.setScalar(0.58);
        heroObj.position.y = 1.45;
      } else if (station.meshKey === 'station-sun') {
        const built = buildEducationalModel('solar-system');
        heroObj = built.root;
        heroObj.scale.setScalar(0.56);
        heroObj.position.y = 1.5;
        stationAnimators.push((t) => built.animate(t, 0));
      } else if (station.meshKey === 'station-earth-orbit') {
        const g = new THREE.Group();
        const earth = new THREE.Mesh(
          new THREE.SphereGeometry(0.42, 24, 18),
          new THREE.MeshStandardMaterial({ color: 0x2563eb, roughness: 0.45 }),
        );
        const moon = new THREE.Mesh(
          new THREE.SphereGeometry(0.11, 16, 12),
          new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.75 }),
        );
        moon.position.set(0.75, 0.1, 0);
        g.add(earth, moon);
        g.position.y = 1.5;
        heroObj = g;
        stationAnimators.push((t) => {
          earth.rotation.y = t * 0.4;
          moon.position.set(Math.cos(t * 0.9) * 0.75, 0.1, Math.sin(t * 0.9) * 0.75);
        });
      } else if (station.meshKey === 'station-saturn') {
        const g = new THREE.Group();
        const saturn = new THREE.Mesh(
          new THREE.SphereGeometry(0.38, 24, 18),
          new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.48 }),
        );
        const ring = new THREE.Mesh(
          new THREE.RingGeometry(0.5, 0.85, 36),
          new THREE.MeshStandardMaterial({ color: 0xfef08a, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }),
        );
        ring.rotation.x = Math.PI / 2.6;
        g.add(saturn, ring);
        g.position.y = 1.5;
        heroObj = g;
        stationAnimators.push((t) => {
          g.rotation.y = t * 0.35;
        });
      } else if (station.meshKey === 'station-geosphere') {
        const built = buildEducationalModel('earth-layers');
        heroObj = built.root;
        heroObj.scale.setScalar(0.58);
        heroObj.position.y = 1.5;
      } else if (station.meshKey === 'station-tectonics') {
        const g = new THREE.Group();
        const p1 = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.18, 0.85),
          new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.7 }),
        );
        p1.position.set(-0.36, 0, 0);
        const p2 = new THREE.Mesh(
          new THREE.BoxGeometry(0.68, 0.18, 0.85),
          new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.65 }),
        );
        p2.position.set(0.36, -0.05, 0);
        p2.rotation.z = -0.18;
        g.add(p1, p2);
        g.position.y = 1.38;
        heroObj = g;
      } else {
        // Climate mast
        const g = new THREE.Group();
        const pole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.08, 1.0, 12),
          new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.6, roughness: 0.3 }),
        );
        const cloud = new THREE.Mesh(
          new THREE.SphereGeometry(0.28, 18, 14),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4 }),
        );
        cloud.position.y = 0.55;
        g.add(pole, cloud);
        g.position.y = 1.3;
        heroObj = g;
      }

      stationGroup.add(heroObj);
      stationGroup.traverse((child) => {
        child.userData.stationId = station.id;
      });
      scene.add(stationGroup);
      stationInteractables.push(stationGroup);
      stationAnchors[station.id] = new THREE.Vector3(basePos.x, 2.35, basePos.z);
    });

    const controls = new OrbitControls(camera, domEl);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.minDistance = 2.2;
    controls.maxDistance = 12.5;
    controls.target.set(0, 1.0, 0);
    controls.update();
    controlsRef.current = controls;

    // Cancel automatic camera glide if user grabs orbit controls
    const onControlStart = () => {
      transitionRef.current.active = false;
    };
    controls.addEventListener('start', onControlStart);

    // Keyboard WASD movement inside virtual classroom
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.code] = true;
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Click to select station
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPos = { x: 0, y: 0 };
    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 6) return;
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(stationInteractables, true);
      if (hits.length > 0) {
        const sid = hits[0].object.userData.stationId as string | undefined;
        const st = propsRef.current.stations.find((s) => s.id === sid);
        if (st) onSelectStationRef.current(st);
      }
    };
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointerup', onPointerUp);

    const resizeObs = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    resizeObs.observe(container);

    if (!isSoftwareGl) renderer.compile(scene, camera);

    const clock = new THREE.Clock();
    let frameId = 0;
    const timers: number[] = [];
    let disposed = false;

    const projectPins = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      propsRef.current.stations.forEach((st) => {
        const el = pinRefs.current[st.id];
        const anchor = stationAnchors[st.id];
        if (!el || !anchor || !w || !h) return;
        _proj.copy(anchor).project(camera);
        if (_proj.z > 1) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          return;
        }
        const x = (_proj.x * 0.5 + 0.5) * w;
        const y = (-_proj.y * 0.5 + 0.5) * h;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      });
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      if (transitionRef.current.active) {
        _targetCam.copy(transitionRef.current.camPos);
        _targetLook.copy(transitionRef.current.lookAt);
        const factor = propsRef.current.reducedMotion ? 1 : 5.5;
        camera.position.x = THREE.MathUtils.damp(camera.position.x, _targetCam.x, factor, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, _targetCam.y, factor, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, _targetCam.z, factor, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, _targetLook.x, factor, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, _targetLook.y, factor, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, _targetLook.z, factor, dt);

        if (camera.position.distanceTo(_targetCam) < 0.04) {
          transitionRef.current.active = false;
        }
      }

      // WASD navigation
      const moveSpeed = dt * 3.8;
      if (keys['KeyW'] || keys['ArrowUp']) {
        camera.getWorldDirection(_targetCam);
        _targetCam.y = 0;
        _targetCam.normalize();
        camera.position.addScaledVector(_targetCam, moveSpeed);
        controls.target.addScaledVector(_targetCam, moveSpeed);
      }
      if (keys['KeyS'] || keys['ArrowDown']) {
        camera.getWorldDirection(_targetCam);
        _targetCam.y = 0;
        _targetCam.normalize();
        camera.position.addScaledVector(_targetCam, -moveSpeed);
        controls.target.addScaledVector(_targetCam, -moveSpeed);
      }

      if (!propsRef.current.reducedMotion) {
        stationAnimators.forEach((fn) => fn(elapsed));
      }
      controls.update();
      renderer.render(scene, camera);
      projectPins();

      if (isSoftwareGl) {
        afterDrawSync(renderer, tick, (id) => timers.push(id));
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      timers.forEach((id) => clearTimeout(id));
      resizeObs.disconnect();
      controls.removeEventListener('start', onControlStart);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('webglcontextlost', handleContextLost);
      domEl.removeEventListener('webglcontextrestored', handleContextRestored);
      controls.dispose();
      envTex.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) mesh.material.forEach((m) => m.dispose());
          else mesh.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, [classroom]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Projected 3D Station Markers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {classroom.stations.map((st, idx) => {
          const isActive = activeStationId === st.id;
          return (
            <button
              key={st.id}
              ref={(el) => {
                pinRefs.current[st.id] = el;
              }}
              type="button"
              onClick={() => onSelectStation(st)}
              style={{ opacity: 0 }}
              className={`absolute top-0 left-0 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md border transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-300'
                  : 'bg-[#172554]/95 text-white border-blue-400/50 hover:bg-blue-700'
              }`}
            >
              <span className="font-mono text-[10px] mr-1.5 text-blue-200">0{idx + 1}</span>
              {st.title}
            </button>
          );
        })}
      </div>

      {(contextLost || webglUnsupported) && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-20">
          <p className="text-base font-semibold mb-1">
            {webglUnsupported ? 'Virtual 3D Environment Unavailable' : 'Virtual Environment Paused'}
          </p>
          <p className="text-sm text-slate-300 max-w-sm">
            {webglUnsupported
              ? 'WebGL is unavailable on this browser or device. Use the station tabs above and the lesson panel to review all virtual lab takeaways.'
              : 'WebGL context was suspended. Return to Classroom Selection or reload to resume.'}
          </p>
        </div>
      )}
    </div>
  );
};
