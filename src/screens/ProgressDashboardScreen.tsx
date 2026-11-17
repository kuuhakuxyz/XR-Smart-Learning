import React, { useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  Lock,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';

const SUBJECT_FILTERS: ('All' | Subject)[] = [
  'All',
  'Biology',
  'Chemistry',
  'Physics',
  'Geography',
];

export const ProgressDashboardScreen: React.FC = () => {
  const {
    overallCompletionPercent,
    lessonsCompletedCount,
    averageQuizScore,
    totalLearningMinutes,
    weeklyStudy,
    subjectMastery,
    badges,
    recentActivities,
    inspectedMaterialIds,
    studiedStationIds,
    completedActivityIds,
    navigateTo,
  } = useApp();

  const [selectedSubject, setSelectedSubject] = useState<'All' | Subject>('All');

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const activeSubjectStats = useMemo(() => {
    if (selectedSubject === 'All') return null;
    return subjectMastery.find((s) => s.subject === selectedSubject) ?? null;
  }, [selectedSubject, subjectMastery]);

  const filteredRecent = useMemo(() => {
    if (selectedSubject === 'All') return recentActivities;
    return recentActivities.filter((r) => r.subject === selectedSubject);
  }, [recentActivities, selectedSubject]);

  const chartSubjectData = useMemo(() => {
    return subjectMastery.map((sm) => ({
      subject: sm.subject,
      Score: sm.score,
      Completion: Math.round((sm.completedLessons / Math.max(1, sm.totalLessons)) * 100),
    }));
  }, [subjectMastery]);

  return (
    <div className="space-y-6">
      {/* Header + Subject Filter */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#8B5CF6]">
            Feature 04 · Real-Time Analytics & Milestones
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
            Learning Progress Dashboard
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Metrics update automatically whenever you inspect 3D models, study virtual stations, or complete quizzes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 self-start lg:self-auto">
          {SUBJECT_FILTERS.map((subj) => (
            <button
              key={subj}
              type="button"
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-[#172554] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      </section>

      {/* 4 Summary Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">
            {activeSubjectStats ? `${activeSubjectStats.subject} Completion` : 'Overall Completion'}
          </p>
          <p className="font-display font-bold text-2xl text-[#172554] mt-1 tabular-nums">
            {activeSubjectStats
              ? Math.round(
                  (activeSubjectStats.completedLessons / activeSubjectStats.totalLessons) * 100,
                )
              : overallCompletionPercent}
            %
          </p>
          <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#3B82F6] rounded-full transition-all"
              style={{
                width: `${
                  activeSubjectStats
                    ? Math.round(
                        (activeSubjectStats.completedLessons / activeSubjectStats.totalLessons) *
                          100,
                      )
                    : overallCompletionPercent
                }%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Lessons Completed</p>
          <div className="flex items-center gap-2 mt-1">
            <BookOpen className="w-4 h-4 text-[#3B82F6]" />
            <p className="font-display font-bold text-2xl text-[#172554] tabular-nums">
              {activeSubjectStats ? activeSubjectStats.completedLessons : lessonsCompletedCount}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {inspectedMaterialIds.length} AR models · {studiedStationIds.length} VR stations
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Average Quiz Score</p>
          <div className="flex items-center gap-2 mt-1">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <p className="font-display font-bold text-2xl text-[#3B82F6] tabular-nums">
              {activeSubjectStats ? activeSubjectStats.score : averageQuizScore}%
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-1 tabular-nums">
            {completedActivityIds.length} activities completed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <p className="text-xs font-medium text-slate-500">Total Learning Time</p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
            <p className="font-display font-bold text-2xl text-[#172554] tabular-nums">
              {formatDuration(totalLearningMinutes)}
            </p>
          </div>
          <p className="text-xs text-slate-500 mt-1">Active study this week</p>
        </div>
      </section>

      {/* Recharts Analytics Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#172554]">
              Weekly Study Activity (Minutes)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily engagement across AR models, VR classrooms, and quizzes
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStudy} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="minutes" name="Study Minutes" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Performance Chart */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div>
            <h2 className="font-display font-bold text-base text-[#172554]">
              Subject Performance & Completion (%)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Average quiz accuracy vs. syllabus completion per STEM subject
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartSubjectData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="subject"
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={{ stroke: '#E2E8F0' }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Score" name="Avg Score (%)" fill="#172554" radius={[6, 6, 0, 0]} />
                <Bar
                  dataKey="Completion"
                  name="Completion (%)"
                  fill="#8B5CF6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Bottom Split: Achievement Badges + Recent Activities */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Achievement Badges */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-base text-[#172554]">
                Achievement Badges
              </h2>
              <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
                {badges.filter((b) => b.unlocked).length} of {badges.length} milestones unlocked
              </p>
            </div>
            <Award className="w-5 h-5 text-[#8B5CF6]" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-xl border p-4 transition-colors ${
                  badge.unlocked
                    ? 'bg-blue-50/40 border-blue-200'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display font-bold text-sm text-[#172554]">
                    {badge.title}
                  </span>
                  {badge.unlocked ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{badge.description}</p>
                <p className="text-[11px] font-medium mt-2 text-slate-500">
                  {badge.unlocked
                    ? `Unlocked · ${badge.unlockedAt}`
                    : `Goal: ${badge.criteria}`}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Learning Activities */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-base text-[#172554]">
              Recent Learning Activities
            </h2>
            <button
              type="button"
              onClick={() => navigateTo('activities')}
              className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700"
            >
              Take New Quiz
            </button>
          </div>

          {filteredRecent.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-sm font-medium text-slate-700">
                No recent {selectedSubject} activities logged yet
              </p>
              <button
                type="button"
                onClick={() => navigateTo('ar-library')}
                className="text-xs font-semibold text-[#3B82F6] hover:underline"
              >
                Explore {selectedSubject} 3D models
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredRecent.map((item) => (
                <div key={item.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {item.category} · {item.subject} · {item.timestamp}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-[#172554] shrink-0 tabular-nums">
                    {item.metricText}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
