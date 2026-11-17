import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Box,
  CheckCircle2,
  Compass,
  Maximize2,
} from 'lucide-react';
import { VirtualClassroomCanvas } from '../components/three/VirtualClassroomCanvas';
import { useApp } from '../context/AppContext';
import { ClassroomStation } from '../types';

export const VirtualClassroomViewScreen: React.FC = () => {
  const {
    classrooms,
    selectedClassroomId,
    navigateTo,
    openARMaterial,
    studiedStationIds,
    recordClassroomStationStudied,
    settings,
  } = useApp();

  const classroom =
    classrooms.find((c) => c.id === selectedClassroomId) ?? classrooms[0];

  const [activeStation, setActiveStation] = useState<ClassroomStation>(
    classroom.stations[0],
  );
  const [moveCmd, setMoveCmd] = useState<{
    dir: 'forward' | 'back' | 'left' | 'right' | 'overview';
    nonce: number;
  } | null>(null);

  useEffect(() => {
    setActiveStation(classroom.stations[0]);
  }, [classroom]);

  const isStudied = studiedStationIds.includes(activeStation.id);

  const triggerMove = (dir: 'forward' | 'back' | 'left' | 'right' | 'overview') => {
    setMoveCmd({ dir, nonce: Date.now() });
  };

  return (
    <div className="space-y-5">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigateTo('virtual-classrooms')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Classroom</span>
          </button>
          <div className="min-w-0">
            <p className="text-xs text-slate-500 truncate">
              {classroom.subject} · {classroom.instructor} · Simulated 3D Environment
            </p>
            <h1 className="font-display font-bold text-xl sm:text-2xl text-[#172554] truncate">
              {classroom.title}
            </h1>
          </div>
        </div>

        {/* Area Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {classroom.stations.map((st, idx) => {
            const active = st.id === activeStation.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStation(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#172554] text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                0{idx + 1}. {st.title}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => triggerMove('overview')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#3B82F6] hover:bg-blue-50 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Room Overview</span>
          </button>
        </div>
      </div>

      {/* Main Split: Interactive 3D Virtual Environment + Lesson Information Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 3D Virtual Classroom Canvas */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          <div className="relative h-[380px] sm:h-[460px] lg:h-[520px] w-full">
            <VirtualClassroomCanvas
              classroom={classroom}
              activeStationId={activeStation.id}
              onSelectStation={(st) => setActiveStation(st)}
              moveCommand={moveCmd}
              reducedMotion={settings.reducedMotion}
            />

            {/* Bottom Navigation Controls for Desktop & Mobile */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-[#0F172A]/90 border border-slate-700 rounded-xl px-3.5 py-2 flex items-center gap-2 text-white">
              <span className="hidden sm:inline text-[11px] text-slate-300 mr-1">
                Move / Orbit:
              </span>
              <button
                type="button"
                aria-label="Move Left"
                onClick={() => triggerMove('left')}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Move Forward"
                onClick={() => triggerMove('forward')}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Move Backward"
                onClick={() => triggerMove('back')}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <ArrowDown className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Move Right"
                onClick={() => triggerMove('right')}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-200 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
              <span className="text-[11px] text-slate-400 pl-2 border-l border-slate-700 hidden md:inline whitespace-nowrap">
                Drag to look · Click any 3D station
              </span>
            </div>
          </div>
        </div>

        {/* Lesson Information Panel */}
        <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-200">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-[#8B5CF6]">
                  {activeStation.areaLabel}
                </span>
                {isStudied && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Studied
                  </span>
                )}
              </div>
              <h2 className="font-display font-bold text-xl text-[#172554] mt-1">
                {activeStation.title}
              </h2>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                {activeStation.subtitle}
              </p>
              <p className="text-xs text-slate-600 leading-relaxed mt-3">
                {activeStation.description}
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="text-xs font-semibold text-slate-800">
                Key Educational Takeaways
              </p>
              <ul className="space-y-2">
                {activeStation.keyTakeaways.map((pt, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2.5 text-xs text-slate-600 bg-slate-50 rounded-lg p-2.5 border border-slate-100"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#3B82F6] shrink-0 mt-0.5" />
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              disabled={isStudied}
              onClick={() => recordClassroomStationStudied(classroom.id, activeStation.id)}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                isStudied
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                  : 'bg-[#172554] hover:bg-blue-900 text-white'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isStudied ? 'Station Recorded in Progress' : 'Mark Station Studied'}</span>
            </button>

            {activeStation.relatedMaterialId && (
              <button
                type="button"
                onClick={() => openARMaterial(activeStation.relatedMaterialId!, false)}
                className="w-full py-2.5 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Box className="w-4 h-4 text-[#3B82F6]" />
                <span>Inspect Full 3D / AR Model</span>
              </button>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};
