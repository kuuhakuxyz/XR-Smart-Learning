import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  Layers,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  ShieldAlert,
  Video,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { ModelViewerCanvas, ViewerCommand } from '../components/three/ModelViewerCanvas';
import { useApp } from '../context/AppContext';
import { ASSETS } from '../data/mockData';
import { ARPartLabel } from '../types';

export const ARViewerScreen: React.FC = () => {
  const {
    materials,
    selectedMaterialId,
    launchInARMode,
    navigateTo,
    recordARPartInspected,
    settings,
    showToast,
  } = useApp();

  const material = materials.find((m) => m.id === selectedMaterialId) ?? materials[0];

  const [selectedPart, setSelectedPart] = useState<ARPartLabel>(material.parts[0]);
  const [showLabels, setShowLabels] = useState<boolean>(settings.show3DLabelsByDefault);
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [explodeAmount, setExplodeAmount] = useState<number>(0);
  const [command, setCommand] = useState<ViewerCommand | null>(null);

  // AR Simulation state
  const [arMode, setArMode] = useState<boolean>(launchInARMode);
  const [arDialogOpen, setArDialogOpen] = useState<boolean>(launchInARMode);
  const [arSource, setArSource] = useState<'desk-fallback' | 'live-camera'>('desk-fallback');
  const [arScale, setArScale] = useState<number>(0.95);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Reset part selection when switching material
  useEffect(() => {
    setSelectedPart(material.parts[0]);
    setExplodeAmount(0);
    recordARPartInspected(material.id);
  }, [material.id, material.parts, recordARPartInspected]);

  // Stop camera stream cleanly on exit from AR mode or unmount
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => stopCameraStream();
  }, []);

  const handleRequestLiveCamera = async () => {
    setCameraError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Camera API is unavailable in this browser context. Using Simulated Study Desk AR Fallback instead.',
      );
      setArSource('desk-fallback');
      setArMode(true);
      setArDialogOpen(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      setArSource('live-camera');
      setArMode(true);
      setArDialogOpen(false);
      window.setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
      }, 60);
      showToast('Live AR camera overlay active', 'Drag to rotate and tap labels to inspect parts.', 'info');
    } catch {
      setCameraError(
        'Camera permission was declined or no camera hardware was detected. Switched to Simulated Study Desk AR Fallback.',
      );
      setArSource('desk-fallback');
      setArMode(true);
      setArDialogOpen(false);
    }
  };

  const handleUseFallbackAR = () => {
    stopCameraStream();
    setCameraError(null);
    setArSource('desk-fallback');
    setArMode(true);
    setArDialogOpen(false);
    showToast(
      'Simulated AR Desk Mode active',
      'WebGL overlay placed on simulated study surface.',
      'info',
    );
  };

  const handleExitAR = () => {
    stopCameraStream();
    setArMode(false);
    setArDialogOpen(false);
  };

  const sendCmd = (type: ViewerCommand['type']) => {
    setCommand({ type, nonce: Date.now() });
  };

  return (
    <div className="space-y-5">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              navigateTo('ar-library');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Library</span>
          </button>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">
              {material.subject} · {material.syllabusTag}
            </p>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#172554] truncate">
              {material.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {arMode ? (
            <button
              type="button"
              onClick={handleExitAR}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <span>Exit AR Simulation</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setArDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Camera className="w-4 h-4" />
              <span>Launch AR Experience</span>
            </button>
          )}
        </div>
      </div>

      {cameraError && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{cameraError}</span>
        </div>
      )}

      {/* Main Split: 3D/AR Viewport + Educational Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Interactive 3D / AR Stage */}
        <div className="lg:col-span-8 flex flex-col bg-[#0F172A] rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          {/* AR Simulation Status Banner when in AR Mode */}
          {arMode && (
            <div className="px-4 py-2.5 bg-[#172554] text-white flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-3.5 h-3.5 text-blue-300" />
                <span className="font-semibold">
                  Prototype AR Simulation ·{' '}
                  {arSource === 'live-camera'
                    ? 'Live Camera Feed + 3D Overlay'
                    : 'Simulated Study Desk Backdrop (Fallback Mode)'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setArDialogOpen(true)}
                className="text-blue-200 hover:text-white underline font-medium"
              >
                Switch Camera / Fallback
              </button>
            </div>
          )}

          {/* Viewport Container */}
          <div className="relative h-[380px] sm:h-[460px] lg:h-[510px] w-full overflow-hidden">
            {/* AR Backdrop Layer (Video or Simulated Study Desk) */}
            {arMode && (
              <div className="absolute inset-0 z-0">
                {arSource === 'live-camera' ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={ASSETS.arDeskBackdrop}
                    alt="Simulated study desk surface for augmented reality model placement"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Subtle AR Surface Reticle */}
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-14 flex justify-center pointer-events-none"
                >
                  <div className="w-56 h-16 rounded-full border-2 border-dashed border-blue-400/75 bg-blue-500/10 flex items-center justify-center">
                    <span className="text-[10px] font-mono text-white bg-slate-900/80 px-2 py-0.5 rounded">
                      AR Surface Anchor (Simulated)
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Three.js Canvas Overlay */}
            <div className="relative z-10 w-full h-full">
              <ModelViewerCanvas
                material={material}
                selectedPartId={selectedPart?.id ?? null}
                onSelectPart={(part) => {
                  setSelectedPart(part);
                  recordARPartInspected(material.id);
                }}
                showLabels={showLabels}
                autoRotate={autoRotate}
                explodeAmount={explodeAmount}
                arMode={arMode}
                arScale={arScale}
                command={command}
                reducedMotion={settings.reducedMotion}
              />
            </div>

            {/* Bottom Floating Viewport Controls */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 w-[calc(100%-1.5rem)] max-w-2xl bg-[#0F172A]/90 border border-slate-700 rounded-xl px-3 py-2 flex flex-wrap items-center justify-between gap-2 text-white">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Rotate Left"
                  aria-label="Rotate Left"
                  onClick={() => sendCmd('rotate-left')}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Rotate Right"
                  aria-label="Rotate Right"
                  onClick={() => sendCmd('rotate-right')}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Zoom In"
                  aria-label="Zoom In"
                  onClick={() => sendCmd('zoom-in')}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  title="Zoom Out"
                  aria-label="Zoom Out"
                  onClick={() => sendCmd('zoom-out')}
                  className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => sendCmd('reset')}
                  className="px-2.5 py-1.5 rounded-lg hover:bg-slate-800 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap"
                >
                  Reset View
                </button>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline whitespace-nowrap">Explode</span>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={explodeAmount}
                    onChange={(e) => setExplodeAmount(parseFloat(e.target.value))}
                    aria-label="Exploded view separation"
                    className="w-16 sm:w-24 accent-[#3B82F6]"
                  />
                </label>

                {arMode && (
                  <label className="flex items-center gap-2 text-xs text-slate-300">
                    <span className="hidden sm:inline whitespace-nowrap">Scale</span>
                    <input
                      type="range"
                      min={0.55}
                      max={1.4}
                      step={0.05}
                      value={arScale}
                      onChange={(e) => setArScale(parseFloat(e.target.value))}
                      aria-label="AR model scale"
                      className="w-16 accent-[#8B5CF6]"
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={() => setAutoRotate((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    autoRotate ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {autoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Spin</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLabels((v) => !v)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                    showLabels ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">Labels</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Information Panel */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            {/* Selected Part Detail */}
            <div className="space-y-2 pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#3B82F6]">
                  Selected Structure · {selectedPart.shortCode}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {material.parts.findIndex((p) => p.id === selectedPart.id) + 1}/{material.parts.length}
                </span>
              </div>
              <h2 className="font-display font-bold text-lg text-[#172554]">
                {selectedPart.name}
              </h2>
              <p className="text-xs font-medium text-slate-700">{selectedPart.summary}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{selectedPart.detail}</p>
              <div className="bg-blue-50/70 border border-blue-100 rounded-lg p-3 mt-2 flex items-start gap-2">
                <Info className="w-4 h-4 text-[#3B82F6] shrink-0 mt-0.5" />
                <p className="text-xs text-[#172554] font-medium">{selectedPart.keyFact}</p>
              </div>
            </div>

            {/* Interactive Labeled Parts List */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Inspect Labeled Components (Tap in 3D or List)
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {material.parts.map((part, idx) => {
                  const active = part.id === selectedPart.id;
                  return (
                    <button
                      key={part.id}
                      type="button"
                      onClick={() => {
                        setSelectedPart(part);
                        recordARPartInspected(material.id);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        active
                          ? 'bg-[#172554] text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="truncate">
                        <span className="font-mono opacity-75 mr-2">0{idx + 1}.</span>
                        {part.name}
                      </span>
                      <span className="font-mono text-[11px] opacity-80 shrink-0 ml-2">
                        {part.shortCode}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <p className="text-xs font-semibold text-slate-700">Learning Objectives</p>
            <ul className="space-y-1.5">
              {material.learningObjectives.map((obj, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {/* Camera Permission Explanation & AR Fallback Modal */}
      {arDialogOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#3B82F6] flex items-center justify-center shrink-0">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-display font-bold text-base text-[#172554]">
                  AR Simulation & Camera Permission
                </h2>
                <p className="text-xs text-slate-500">Alpha Prototype AR Mode</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              XR Smart Learning can project the interactive 3D{' '}
              <span className="font-semibold text-slate-900">{material.title}</span> over your live
              device camera feed. No video is recorded or uploaded. If camera access is unavailable on
              this device, use our simulated study desk AR fallback mode.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Prototype Disclosure:</span> Browser WebGL
              renders a simulated AR overlay rather than native ARKit/ARCore SLAM surface tracking.
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleRequestLiveCamera}
                className="w-full py-2.5 px-4 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Video className="w-4 h-4" />
                <span>Allow Camera & Start AR Overlay</span>
              </button>
              <button
                type="button"
                onClick={handleUseFallbackAR}
                className="w-full py-2.5 px-4 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Layers className="w-4 h-4" />
                <span>Use AR Fallback Mode (Simulated Desk)</span>
              </button>
              <button
                type="button"
                onClick={() => setArDialogOpen(false)}
                className="w-full py-2 px-4 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
              >
                Stay in Standard 3D Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
