import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Compass, Clock, UserCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VirtualClassroomSelectionScreen: React.FC = () => {
  const { classrooms, openVirtualClassroom, studiedStationIds } = useApp();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-6">
      {/* Header */}
      <section>
        <p className="text-xs font-semibold text-[#8B5CF6]">
          Feature 02 · Interactive 3D Virtual Learning Environments
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
          Virtual Classrooms
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Enter interactive 3D classrooms simulated for desktop and mobile browsers. Navigate between laboratory stations and click spatial objects to study key concepts.
        </p>
      </section>

      {/* Classroom Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {classrooms.map((cls) => {
          const completedInClass = cls.stations.filter((s) =>
            studiedStationIds.includes(s.id),
          ).length;

          return (
            <article
              key={cls.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-[#8B5CF6] transition-colors"
            >
              <div>
                <div className="relative aspect-[16/9] bg-[#172554] overflow-hidden">
                  {!failedImages[cls.id] ? (
                    <img
                      src={cls.previewImage}
                      alt={`${cls.title} virtual classroom environment preview`}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      decoding="async"
                      onError={() =>
                        setFailedImages((prev) => ({ ...prev, [cls.id]: true }))
                      }
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#172554] to-[#8B5CF6] flex items-center justify-center text-white">
                      <Compass className="w-12 h-12 opacity-80" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/80 via-transparent to-transparent flex items-end p-4">
                    <span className="text-xs font-medium text-blue-100">
                      {cls.subject} · {cls.stations.length} Interactive Stations
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      {cls.instructor}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {cls.durationMinutes} min
                    </span>
                  </div>

                  <h2 className="font-display font-bold text-lg text-[#172554]">
                    {cls.title}
                  </h2>

                  <p className="text-xs text-slate-500 font-medium">{cls.syllabusTag}</p>

                  <p className="text-xs text-slate-600 leading-relaxed">{cls.description}</p>

                  {/* Station List Preview */}
                  <div className="pt-2 space-y-1.5">
                    <p className="text-[11px] font-semibold text-slate-500">
                      Learning Stations ({completedInClass}/{cls.stations.length} studied)
                    </p>
                    {cls.stations.map((st, idx) => {
                      const done = studiedStationIds.includes(st.id);
                      return (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-xs text-slate-700 py-1 border-b border-slate-100 last:border-0"
                        >
                          <span className="truncate">
                            <span className="font-mono text-slate-400 mr-1.5">0{idx + 1}</span>
                            {st.title}
                          </span>
                          {done && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-2">
                <button
                  type="button"
                  onClick={() => openVirtualClassroom(cls.id)}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Enter Classroom</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
