import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { ARMaterial, ARPartLabel } from '../../types';
import {
  afterDrawSync,
  applyStudioEnvironmentAndLights,
  buildEducationalModel,
  createContactShadowPlane,
  createStudioRenderer,
  detectSoftwareWebGL,
} from './threeUtils';

export interface ViewerCommand {
  type: 'rotate-left' | 'rotate-right' | 'zoom-in' | 'zoom-out' | 'reset';
  nonce: number;
}

interface ModelViewerCanvasProps {
  material: ARMaterial;
  selectedPartId: string | null;
  onSelectPart: (part: ARPartLabel) => void;
  showLabels: boolean;
  autoRotate: boolean;
  explodeAmount: number;
  arMode: boolean;
  arScale: number;
  command: ViewerCommand | null;
  reducedMotion: boolean;
}

const _projVec = new THREE.Vector3();

export const ModelViewerCanvas: React.FC<ModelViewerCanvasProps> = ({
  material,
  selectedPartId,
  onSelectPart,
  showLabels,
  autoRotate,
  explodeAmount,
  arMode,
  arScale,
  command,
  reducedMotion,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const labelRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [contextLost, setContextLost] = useState(false);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const propsRef = useRef({
    selectedPartId,
    showLabels,
    autoRotate,
    explodeAmount,
    arMode,
    arScale,
    reducedMotion,
    parts: material.parts,
  });
  propsRef.current = {
    selectedPartId,
    showLabels,
    autoRotate,
    explodeAmount,
    arMode,
    arScale,
    reducedMotion,
    parts: material.parts,
  };

  const onSelectPartRef = useRef(onSelectPart);
  onSelectPartRef.current = onSelectPart;

  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const modelRootRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const shadowPlaneRef = useRef<THREE.Mesh | null>(null);

  // Sync AR transparent vs studio dark background dynamically without tearing down WebGL
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const shadow = shadowPlaneRef.current;
    if (!scene || !renderer) return;
    if (arMode) {
      scene.background = null;
      renderer.setClearColor(0x000000, 0);
      if (shadow) shadow.visible = false;
    } else {
      scene.background = new THREE.Color(0x0f172a);
      renderer.setClearColor(0x0f172a, 1);
      if (shadow) shadow.visible = true;
    }
  }, [arMode]);

  // Execute toolbar commands (rotate / zoom / reset)
  useEffect(() => {
    if (!command || !controlsRef.current || !cameraRef.current || !modelRootRef.current) return;
    const controls = controlsRef.current;
    const camera = cameraRef.current;
    const root = modelRootRef.current;

    if (command.type === 'rotate-left') {
      root.rotation.y -= Math.PI / 6;
    } else if (command.type === 'rotate-right') {
      root.rotation.y += Math.PI / 6;
    } else if (command.type === 'zoom-in') {
      camera.position.multiplyScalar(0.84);
      if (camera.position.length() < 1.9) camera.position.setLength(1.9);
      controls.update();
    } else if (command.type === 'zoom-out') {
      camera.position.multiplyScalar(1.18);
      if (camera.position.length() > 7.5) camera.position.setLength(7.5);
      controls.update();
    } else if (command.type === 'reset') {
      camera.position.set(0, 1.15, 3.85);
      controls.target.set(0, 0.1, 0);
      root.rotation.set(0, 0, 0);
      controls.update();
    }
  }, [command]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const scene = new THREE.Scene();
    scene.background = propsRef.current.arMode ? null : new THREE.Color(0x0f172a);
    sceneRef.current = scene;

    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;
    const camera = new THREE.PerspectiveCamera(44, width / height, 0.1, 60);
    camera.position.set(0, 1.15, 3.85);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = createStudioRenderer(container, isSoftwareGl, true);
    } catch {
      setWebglUnsupported(true);
      return;
    }
    if (!propsRef.current.arMode) {
      renderer.setClearColor(0x0f172a, 1);
    }
    rendererRef.current = renderer;

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
    const handleContextRestored = () => {
      setContextLost(false);
    };
    domEl.addEventListener('webglcontextlost', handleContextLost);
    domEl.addEventListener('webglcontextrestored', handleContextRestored);

    const envTex = applyStudioEnvironmentAndLights(scene, renderer, isSoftwareGl);

    const shadowPlane = createContactShadowPlane(1.7);
    shadowPlane.visible = !propsRef.current.arMode;
    scene.add(shadowPlane);
    shadowPlaneRef.current = shadowPlane;

    const built = buildEducationalModel(material.modelTemplate);
    modelRootRef.current = built.root;
    scene.add(built.root);

    const controls = new OrbitControls(camera, domEl);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.8;
    controls.maxDistance = 7.5;
    controls.enablePan = false;
    controls.target.set(0, 0.1, 0);
    controls.update();
    controlsRef.current = controls;

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Raycaster for direct 3D part click
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dx = e.clientX - pointerDownPos.x;
      const dy = e.clientY - pointerDownPos.y;
      if (Math.hypot(dx, dy) > 6) return; // Ignore orbit drag
      const rect = domEl.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(built.interactables, true);
      if (hits.length > 0) {
        const key = hits[0].object.userData.meshKey as string | undefined;
        if (key) {
          const matched = propsRef.current.parts.find((p) => p.meshKey === key);
          if (matched) onSelectPartRef.current(matched);
        }
      }
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointerup', onPointerUp);

    // Resize observer for crisp layout transitions
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(container);

    // Highlight selected mesh part cleanly using emissive tint
    let currentExplode = propsRef.current.explodeAmount;
    let currentScale = propsRef.current.arScale;
    const clock = new THREE.Clock();
    let frameId = 0;
    const timers: number[] = [];
    let disposed = false;

    const registerTimer = (id: number) => {
      timers.push(id);
    };

    const updateHighlight = (selectedId: string | null) => {
      const activePart = propsRef.current.parts.find((p) => p.id === selectedId);
      const activeKey = activePart?.meshKey;
      built.root.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (!mat || !('emissive' in mat)) return;
        if (mat.userData.baseEmissive === undefined) {
          mat.userData.baseEmissive = mat.emissive.getHex();
          mat.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 0;
        }
        if (activeKey && mesh.userData.meshKey === activeKey) {
          mat.emissive.setHex(0x3b82f6);
          mat.emissiveIntensity = 0.55;
        } else {
          mat.emissive.setHex(mat.userData.baseEmissive);
          mat.emissiveIntensity = mat.userData.baseEmissiveIntensity;
        }
      });
    };

    const projectLabels = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      const show = propsRef.current.showLabels;
      propsRef.current.parts.forEach((part) => {
        const el = labelRefs.current[part.id];
        if (!el) return;
        if (!show || !w || !h) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          return;
        }
        _projVec.set(
          part.anchorPosition[0] * (1 + currentExplode * 0.45),
          part.anchorPosition[1] * (1 + currentExplode * 0.45),
          part.anchorPosition[2] * (1 + currentExplode * 0.45),
        );
        _projVec.applyMatrix4(built.root.matrixWorld);
        _projVec.project(camera);

        if (_projVec.z > 1) {
          el.style.opacity = '0';
          el.style.pointerEvents = 'none';
          return;
        }
        const x = (_projVec.x * 0.5 + 0.5) * w;
        const y = (-_projVec.y * 0.5 + 0.5) * h;
        el.style.opacity = '1';
        el.style.pointerEvents = 'auto';
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      });
    };

    const tick = () => {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      currentExplode = THREE.MathUtils.damp(currentExplode, propsRef.current.explodeAmount, 8, dt);
      const targetScale = propsRef.current.arMode ? propsRef.current.arScale : 1;
      currentScale = THREE.MathUtils.damp(currentScale, targetScale, 8, dt);
      built.root.scale.setScalar(currentScale);

      if (propsRef.current.autoRotate && !propsRef.current.reducedMotion && !isSoftwareGl) {
        built.root.rotation.y += dt * 0.35;
      }

      built.animate(propsRef.current.reducedMotion ? 0 : elapsed, currentExplode);
      built.root.updateMatrixWorld(true);
      updateHighlight(propsRef.current.selectedPartId);
      controls.update();
      renderer.render(scene, camera);
      projectLabels();

      if (isSoftwareGl) {
        afterDrawSync(renderer, tick, registerTimer);
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
  }, [material.id, material.modelTemplate]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Projected 3D Hotspot Labels (DOM overlay, zero backdrop-blur) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {material.parts.map((part, idx) => {
          const isSelected = selectedPartId === part.id;
          return (
            <button
              key={part.id}
              ref={(el) => {
                labelRefs.current[part.id] = el;
              }}
              type="button"
              onClick={() => onSelectPart(part)}
              style={{ opacity: 0 }}
              className={`absolute top-0 left-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 whitespace-nowrap shadow-md border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-300'
                  : 'bg-[#0F172A]/90 text-slate-100 border-slate-600 hover:bg-blue-700'
              }`}
              title={`Inspect ${part.name}`}
            >
              <span className="font-mono text-[10px] mr-1.5 opacity-80">{idx + 1}</span>
              {part.name}
            </button>
          );
        })}
      </div>

      {(contextLost || webglUnsupported) && (
        <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-6 text-center text-white z-20">
          <p className="text-base font-semibold mb-1">
            {webglUnsupported ? '3D WebGL Unavailable on This Device' : '3D Viewport Paused'}
          </p>
          <p className="text-sm text-slate-300 max-w-sm">
            {webglUnsupported
              ? 'Your browser or device has disabled WebGL graphics. Use the labeled component list on the right to study all structures.'
              : 'WebGL graphics context was temporarily suspended by the browser. Reload or switch models to resume.'}
          </p>
        </div>
      )}
    </div>
  );
};
