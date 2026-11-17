import React from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Compass,
  Play,
  PlusCircle,
  Users,
} from 'lucide-react';
import { MaterialThumbnail } from '../components/common/MaterialThumbnail';
import { useApp } from '../context/AppContext';
import { Subject } from '../types';

export const DashboardScreen: React.FC = () => {
  const {
    currentUser,
    navigateTo,
    openARMaterial,
    openVirtualClassroom,
    startActivity,
    materials,
    classrooms,
    activities,
    assignments,
    submissions,
    studentRoster,
    recentActivities,
    subjectMastery,
    overallCompletionPercent,
    averageQuizScore,
    lessonsCompletedCount,
    totalLearningMinutes,
  } = useApp();

  if (!currentUser) return null;

  const isTeacher = currentUser.role === 'teacher';
  const featuredMaterial = materials[0];
  const featuredClassroom = classrooms[0];
  const pendingSubmissionsCount = submissions.filter((s) => s.status === 'Submitted').length;

  const formatStudyTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const subjects: { name: Subject; count: number; focus: string }[] = [
    {
      name: 'Biology',
      count: materials.filter((m) => m.subject === 'Biology').length,
      focus: 'Anatomy, Cardiovascular & Cellular Biology',
    },
    {
      name: 'Chemistry',
      count: materials.filter((m) => m.subject === 'Chemistry').length,
      focus: 'Covalent Bonding & Atomic Orbitals',
    },
    {
      name: 'Physics',
      count: materials.filter((m) => m.subject === 'Physics').length,
      focus: 'Astrophysics & Planetary Mechanics',
    },
    {
      name: 'Geography',
      count: materials.filter((m) => m.subject === 'Geography').length,
      focus: 'Geosphere Layers & Plate Tectonics',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <section className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-500">
            {currentUser.institution} · {currentUser.levelOrDepartment}
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
            Welcome back, {currentUser.name}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {isTeacher ? (
            <>
              <button
                type="button"
                onClick={() => navigateTo('lms')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Manage LMS & Create Quiz</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('ar-library')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Box className="w-4 h-4 text-[#3B82F6]" />
                <span>Preview 3D Library</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openARMaterial(featuredMaterial.id, false)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Continue 3D Lesson</span>
              </button>
              <button
                type="button"
                onClick={() => navigateTo('activities')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-colors whitespace-nowrap"
              >
                <ClipboardCheck className="w-4 h-4 text-[#8B5CF6]" />
                <span>Take a Quiz</span>
              </button>
            </>
          )}
        </div>
      </section>

      {/* 4 Summary KPI Cards (Tabular Numerals) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {isTeacher ? (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Active Students</p>
              <p className="font-display font-bold text-2xl text-[#172554] mt-1 tabular-nums">
                {studentRoster.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">Secondary & Foundation cohorts</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Class Average Score</p>
              <p className="font-display font-bold text-2xl text-[#3B82F6] mt-1 tabular-nums">
                {Math.round(
                  studentRoster.reduce((a, b) => a + b.averageScore, 0) / studentRoster.length,
                )}
                %
              </p>
              <p className="text-xs text-emerald-700 mt-1">Across all STEM quizzes</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Submissions To Grade</p>
              <p className="font-display font-bold text-2xl text-[#8B5CF6] mt-1 tabular-nums">
                {pendingSubmissionsCount}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {assignments.length} active assignments
              </p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Published XR Materials</p>
              <p className="font-display font-bold text-2xl text-[#172554] mt-1 tabular-nums">
                {materials.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {activities.length} interactive activities
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Overall Completion</p>
              <div className="flex items-baseline justify-between mt-1">
                <p className="font-display font-bold text-2xl text-[#172554] tabular-nums">
                  {overallCompletionPercent}%
                </p>
                <span className="text-xs text-slate-500 tabular-nums">
                  {lessonsCompletedCount} lessons
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#3B82F6] rounded-full transition-all"
                  style={{ width: `${overallCompletionPercent}%` }}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Average Quiz Score</p>
              <p className="font-display font-bold text-2xl text-[#3B82F6] mt-1 tabular-nums">
                {averageQuizScore}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Updated automatically after quizzes
              </p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Weekly Study Time</p>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4 text-[#8B5CF6]" />
                <p className="font-display font-bold text-2xl text-[#172554] tabular-nums">
                  {formatStudyTime(totalLearningMinutes)}
                </p>
              </div>
              <p className="text-xs text-slate-500 mt-1">Across AR, VR & quizzes</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <p className="text-xs font-medium text-slate-500">Pending Assignments</p>
              <p className="font-display font-bold text-2xl text-[#172554] mt-1 tabular-nums">
                {
                  submissions.filter(
                    (s) => s.studentId === currentUser.id && s.status === 'Pending',
                  ).length
                }
              </p>
              <button
                type="button"
                onClick={() => navigateTo('lms')}
                className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700 mt-1 inline-flex items-center gap-1"
              >
                <span>Open LMS Tasks</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </>
        )}
      </section>

      {/* Quick Access to All Five Major Features */}
      <section className="space-y-3">
        <h2 className="font-display font-bold text-base text-[#172554]">
          Five Core Learning Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {[
            {
              title: 'AR 3D Materials',
              desc: `${materials.length} interactive models`,
              icon: Box,
              accent: 'text-[#3B82F6]',
              screen: 'ar-library' as const,
            },
            {
              title: 'Virtual Classroom',
              desc: `${classrooms.length} 3D lab spaces`,
              icon: Compass,
              accent: 'text-[#8B5CF6]',
              screen: 'virtual-classrooms' as const,
            },
            {
              title: 'Interactive Quizzes',
              desc: `${activities.length} activities & matching`,
              icon: ClipboardCheck,
              accent: 'text-[#3B82F6]',
              screen: 'activities' as const,
            },
            {
              title: 'Learning Progress',
              desc: 'Charts & achievement badges',
              icon: BarChart3,
              accent: 'text-[#8B5CF6]',
              screen: 'progress' as const,
            },
            {
              title: 'Online LMS',
              desc: isTeacher ? 'Materials, quizzes & grading' : 'Lessons & submissions',
              icon: BookOpen,
              accent: 'text-[#172554]',
              screen: 'lms' as const,
            },
          ].map((mod) => {
            const Icon = mod.icon;
            return (
              <button
                key={mod.title}
                type="button"
                onClick={() => navigateTo(mod.screen)}
                className="bg-white hover:border-[#3B82F6] rounded-xl border border-slate-200 p-4 text-left shadow-xs transition-all group flex flex-col justify-between gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-5 h-5 ${mod.accent}`} />
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#3B82F6] transition-colors" />
                </div>
                <div>
                  <p className="font-display font-semibold text-sm text-slate-900">{mod.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Primary Split: Continue Learning / Classroom Spotlight + Recent Activity */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Continue Learning Card */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-12">
            <div className="sm:col-span-5">
              <MaterialThumbnail
                template={featuredMaterial.modelTemplate}
                subject={featuredMaterial.subject}
              />
            </div>
            <div className="sm:col-span-7 p-5 flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">
                  Continue Learning · {featuredMaterial.subject} · {featuredMaterial.syllabusTag}
                </p>
                <h3 className="font-display font-bold text-lg text-[#172554] mt-1">
                  {featuredMaterial.title}
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {featuredMaterial.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => openARMaterial(featuredMaterial.id, false)}
                  className="px-4 py-2 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors"
                >
                  Open 3D Viewer
                </button>
                <button
                  type="button"
                  onClick={() => openARMaterial(featuredMaterial.id, true)}
                  className="px-4 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                >
                  Launch AR Experience
                </button>
              </div>
            </div>
          </div>

          {/* Secondary Virtual Lab Prompt Strip */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-700">
              <span className="font-semibold text-[#172554]">Featured Virtual Classroom:</span>{' '}
              {featuredClassroom.title} ({featuredClassroom.stations.length} interactive stations)
            </div>
            <button
              type="button"
              onClick={() => openVirtualClassroom(featuredClassroom.id)}
              className="text-xs font-semibold text-[#8B5CF6] hover:text-violet-700 inline-flex items-center gap-1 whitespace-nowrap"
            >
              <span>Enter Classroom</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Activities / Teacher Class Watch */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-bold text-base text-[#172554]">
                {isTeacher ? 'Student Performance Snapshot' : 'Recent Learning Activities'}
              </h3>
              <button
                type="button"
                onClick={() => navigateTo(isTeacher ? 'lms' : 'progress')}
                className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700"
              >
                View All
              </button>
            </div>

            {isTeacher ? (
              <div className="divide-y divide-slate-100">
                {studentRoster.slice(0, 4).map((stu) => (
                  <div key={stu.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{stu.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{stu.level}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-semibold text-[#172554] tabular-nums">
                        {stu.averageScore}% avg
                      </p>
                      <p className="text-[11px] text-slate-500 tabular-nums">
                        {stu.completionPercent}% done
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentActivities.slice(0, 4).map((item) => (
                  <div key={item.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{item.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.category} · {item.subject} · {item.timestamp}
                      </p>
                    </div>
                    <span className="text-xs font-medium text-[#3B82F6] shrink-0 tabular-nums">
                      {item.metricText}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {isTeacher ? 'Need to create a new assessment?' : 'Recommended next activity:'}
            </span>
            <button
              type="button"
              onClick={() => (isTeacher ? navigateTo('lms') : startActivity(activities[0].id))}
              className="text-xs font-semibold text-[#172554] hover:text-[#3B82F6] inline-flex items-center gap-1"
            >
              <span>{isTeacher ? 'Open Quiz Builder' : activities[0].title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Recommended Subjects Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-[#172554]">
            STEM Subject Coverage
          </h2>
          <button
            type="button"
            onClick={() => navigateTo('ar-library')}
            className="text-xs font-semibold text-[#3B82F6] hover:text-blue-700"
          >
            Browse All Materials
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((subj) => {
            const mastery = subjectMastery.find((s) => s.subject === subj.name);
            return (
              <button
                key={subj.name}
                type="button"
                onClick={() => navigateTo('ar-library')}
                className="bg-white hover:border-[#3B82F6] rounded-xl border border-slate-200 p-4 text-left shadow-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[#172554]">{subj.name}</span>
                  <span className="text-xs font-mono text-slate-500 tabular-nums">
                    {subj.count} models
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1.5">{subj.focus}</p>
                {mastery && (
                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 tabular-nums">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      {mastery.completedLessons}/{mastery.totalLessons} lessons
                    </span>
                    <span className="font-semibold text-slate-700">{mastery.score}% avg</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};
