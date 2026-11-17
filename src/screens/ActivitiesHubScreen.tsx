import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  GripVertical,
  Play,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Difficulty, Subject } from '../types';

const SUBJECTS: ('All' | Subject)[] = ['All', 'Biology', 'Chemistry', 'Physics', 'Geography'];
const DIFFICULTIES: ('All' | Difficulty)[] = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export const ActivitiesHubScreen: React.FC = () => {
  const { activities, startActivity, completedActivityIds } = useApp();
  const [subjectFilter, setSubjectFilter] = useState<'All' | Subject>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | Difficulty>('All');

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      const okSubj = subjectFilter === 'All' || act.subject === subjectFilter;
      const okDiff = difficultyFilter === 'All' || act.difficulty === difficultyFilter;
      return okSubj && okDiff;
    });
  }, [activities, subjectFilter, difficultyFilter]);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-semibold text-[#3B82F6]">
          Feature 03 · Interactive Assessments & Spatial Matching
        </p>
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
          Interactive Learning Activities
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Reinforce what you studied in 3D and Virtual Classrooms with instant-feedback quizzes and drag-and-drop labeling challenges.
        </p>
      </section>

      {/* Filters */}
      <section className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-2">Subject:</span>
          {SUBJECTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSubjectFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                subjectFilter === s
                  ? 'bg-[#172554] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-2">Difficulty:</span>
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDifficultyFilter(d)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                difficultyFilter === d
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </section>

      {/* Activities Grid or Empty State */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-10 text-center space-y-3">
          <ClipboardCheck className="w-8 h-8 text-slate-400 mx-auto" />
          <h2 className="font-display font-bold text-base text-slate-900">
            No activities match these filters
          </h2>
          <p className="text-sm text-slate-500">
            Reset your subject or difficulty selection to view all STEM activities.
          </p>
          <button
            type="button"
            onClick={() => {
              setSubjectFilter('All');
              setDifficultyFilter('All');
            }}
            className="px-4 py-2 rounded-lg bg-[#172554] text-white text-xs font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((act) => {
            const done = completedActivityIds.includes(act.id);
            const itemCount =
              act.type === 'quiz'
                ? `${act.questions?.length ?? 0} questions`
                : `${act.matchingPairs?.length ?? 0} drag-and-drop pairs`;

            return (
              <article
                key={act.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between gap-4 hover:border-[#3B82F6] transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span>
                      {act.subject} · {act.difficulty} ·{' '}
                      {act.type === 'quiz' ? 'Multiple Choice' : 'Drag & Drop Matching'}
                    </span>
                    {done && (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        act.type === 'quiz'
                          ? 'bg-blue-50 text-[#3B82F6]'
                          : 'bg-violet-50 text-[#8B5CF6]'
                      }`}
                    >
                      {act.type === 'quiz' ? (
                        <ClipboardCheck className="w-5 h-5" />
                      ) : (
                        <GripVertical className="w-5 h-5" />
                      )}
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-lg text-[#172554]">
                        {act.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-slate-500 tabular-nums">
                    <span>{itemCount}</span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {act.estimatedMinutes} min
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => startActivity(act.id)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{done ? 'Retry Activity' : 'Start Activity'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
