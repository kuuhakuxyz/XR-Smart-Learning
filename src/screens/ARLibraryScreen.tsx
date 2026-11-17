import React, { useMemo, useState } from 'react';
import { ArrowRight, Box, Camera, CheckCircle2, Search, X } from 'lucide-react';
import { MaterialThumbnail } from '../components/common/MaterialThumbnail';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';

const SUBJECT_TABS: ('All' | Subject)[] = ['All', 'Biology', 'Chemistry', 'Physics', 'Geography'];

export const ARLibraryScreen: React.FC = () => {
  const { materials, openARMaterial, inspectedMaterialIds } = useApp();
  const [selectedSubject, setSelectedSubject] = useState<'All' | Subject>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const subjectCounts = useMemo(() => {
    const counts: Record<string, number> = { All: materials.length };
    (['Biology', 'Chemistry', 'Physics', 'Geography'] as Subject[]).forEach((s) => {
      counts[s] = materials.filter((m) => m.subject === s).length;
    });
    return counts;
  }, [materials]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return materials.filter((m) => {
      const matchSubj = selectedSubject === 'All' || m.subject === selectedSubject;
      const matchSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.syllabusTag.toLowerCase().includes(q) ||
        m.subject.toLowerCase().includes(q);
      return matchSubj && matchSearch;
    });
  }, [materials, selectedSubject, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#3B82F6]">
            Feature 01 · Interactive 3D & Simulated Augmented Reality
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
            AR 3D Learning Materials
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Inspect multi-part 3D models aligned with Malaysian KSSM and university STEM curricula, explore labeled structures, or launch simulated AR placement on your study desk.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80 shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search heart, molecule, planet..."
            aria-label="Search AR learning materials"
            className="w-full h-10 pl-10 pr-9 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </section>

      {/* Subject Selection Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {SUBJECT_TABS.map((subj) => {
          const active = selectedSubject === subj;
          return (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`rounded-xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                active
                  ? 'bg-[#172554] border-[#172554] text-white shadow-xs'
                  : 'bg-white border-slate-200 hover:border-[#3B82F6] text-slate-800'
              }`}
            >
              <p className="font-display font-bold text-sm">{subj}</p>
              <p
                className={`text-xs mt-0.5 tabular-nums ${
                  active ? 'text-blue-200' : 'text-slate-500'
                }`}
              >
                {subjectCounts[subj]} {subjectCounts[subj] === 1 ? 'model' : 'models'}
              </p>
            </button>
          );
        })}
      </section>

      {/* Materials Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <Box className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="font-display font-bold text-base text-slate-900">
            No matching 3D materials found
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Try clearing your search term or switching back to all STEM subjects.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedSubject('All');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-[#172554] text-white text-xs font-semibold hover:bg-blue-900 transition-colors"
          >
            Show All Materials
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((mat) => {
            const explored = inspectedMaterialIds.includes(mat.id);
            return (
              <article
                key={mat.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                <div>
                  <button
                    type="button"
                    onClick={() => openARMaterial(mat.id, false)}
                    className="w-full text-left block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  >
                    <MaterialThumbnail template={mat.modelTemplate} subject={mat.subject} />
                  </button>

                  <div className="p-5 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span>
                        {mat.subject} · {mat.difficulty} · {mat.durationMinutes} min
                      </span>
                      {explored && (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Explored
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openARMaterial(mat.id, false)}
                      className="text-left group block"
                    >
                      <h2 className="font-display font-bold text-lg text-[#172554] group-hover:text-[#3B82F6] transition-colors">
                        {mat.title}
                      </h2>
                    </button>

                    <p className="text-xs text-slate-500 font-medium">{mat.syllabusTag}</p>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {mat.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => openARMaterial(mat.id, false)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <span>Inspect 3D</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => openARMaterial(mat.id, true)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#172554] text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#3B82F6]" />
                    <span>Launch AR Experience</span>
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
