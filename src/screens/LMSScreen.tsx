import React, { useState } from 'react';
import {
  BookOpen,
  Box,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileText,
  Megaphone,
  Plus,
  Send,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Assignment,
  AssignmentSubmission,
  Difficulty,
  ModelTemplateId,
  QuizQuestion,
  StudentRosterRecord,
  Subject,
} from '../types';

const SUBJECT_OPTIONS: Subject[] = ['Biology', 'Chemistry', 'Physics', 'Geography'];
const MODEL_TEMPLATES: { id: ModelTemplateId; label: string }[] = [
  { id: 'human-heart', label: 'Human Heart 3D Anatomy' },
  { id: 'human-skeleton', label: 'Human Skeleton 3D Rig' },
  { id: 'human-cell', label: 'Eukaryotic Human Cell' },
  { id: 'water-molecule', label: 'H₂O Polar Molecule' },
  { id: 'atomic-structure', label: 'Bohr Atomic Structure' },
  { id: 'solar-system', label: 'Heliocentric Solar System' },
  { id: 'earth-layers', label: "Earth's Geosphere Cutaway" },
];

export const LMSScreen: React.FC = () => {
  const {
    currentUser,
    materials,
    activities,
    assignments,
    submissions,
    announcements,
    studentRoster,
    openARMaterial,
    startActivity,
    submitAssignment,
    addLearningMaterial,
    createQuizActivity,
    createAssignment,
    gradeSubmission,
    addAnnouncement,
    showToast,
  } = useApp();

  const isTeacher = currentUser?.role === 'teacher';

  const [studentTab, setStudentTab] = useState<'lessons' | 'assignments' | 'announcements'>(
    'lessons',
  );
  const [teacherTab, setTeacherTab] = useState<
    'overview' | 'materials' | 'quiz-builder' | 'assignments'
  >('overview');

  // Student assignment submission modal
  const [submittingAsg, setSubmittingAsg] = useState<Assignment | null>(null);
  const [subNotes, setSubNotes] = useState('');
  const [subFileName, setSubFileName] = useState('lab_observation_notes.pdf');

  // Teacher: student detail modal
  const [selectedStudent, setSelectedStudent] = useState<StudentRosterRecord | null>(null);

  // Teacher: Add Learning Material form
  const [matTitle, setMatTitle] = useState('');
  const [matSubject, setMatSubject] = useState<Subject>('Biology');
  const [matSyllabus, setMatSyllabus] = useState('KSSM Form 5 · Chapter 4');
  const [matDifficulty, setMatDifficulty] = useState<Difficulty>('Intermediate');
  const [matDuration, setMatDuration] = useState(15);
  const [matTemplate, setMatTemplate] = useState<ModelTemplateId>('human-cell');
  const [matDesc, setMatDesc] = useState('');

  // Teacher: Create Quiz form
  const [quizTitle, setQuizTitle] = useState('');
  const [quizSubject, setQuizSubject] = useState<Subject>('Biology');
  const [quizDifficulty, setQuizDifficulty] = useState<Difficulty>('Intermediate');
  const [quizDesc, setQuizDesc] = useState('');
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    {
      id: 'new-q1',
      prompt: '',
      options: ['', '', '', ''],
      correctIndex: 0,
      explanation: '',
    },
  ]);

  // Teacher: Create Assignment & Announcement forms
  const [asgTitle, setAsgTitle] = useState('');
  const [asgSubject, setAsgSubject] = useState<Subject>('Biology');
  const [asgDue, setAsgDue] = useState('30 Nov 2026');
  const [asgDesc, setAsgDesc] = useState('');

  const [annTitle, setAnnTitle] = useState('');
  const [annBody, setAnnBody] = useState('');
  const [annSubject, setAnnSubject] = useState<Subject | 'General'>('General');

  // Teacher: Grade Submission Modal
  const [gradingSub, setGradingSub] = useState<AssignmentSubmission | null>(null);
  const [gradeValue, setGradeValue] = useState(88);
  const [gradeFeedback, setGradeFeedback] = useState('');

  if (!currentUser) return null;

  // --- Handlers ---
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAsg) return;
    if (!subNotes.trim()) {
      showToast('Please enter your observation notes', undefined, 'error');
      return;
    }
    submitAssignment(submittingAsg.id, subNotes.trim(), subFileName.trim() || 'submission.pdf');
    setSubmittingAsg(null);
    setSubNotes('');
  };

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matTitle.trim() || !matDesc.trim()) {
      showToast('Please fill in title and description', undefined, 'error');
      return;
    }
    const baseTemplateMat = materials.find((m) => m.modelTemplate === matTemplate) ?? materials[0];
    addLearningMaterial({
      title: matTitle.trim(),
      subject: matSubject,
      syllabusTag: matSyllabus.trim() || 'KSSM STEM Module',
      difficulty: matDifficulty,
      durationMinutes: Number(matDuration) || 15,
      description: matDesc.trim(),
      learningObjectives: baseTemplateMat.learningObjectives,
      modelTemplate: matTemplate,
      parts: baseTemplateMat.parts,
      addedBy: currentUser.name,
    });
    setMatTitle('');
    setMatDesc('');
  };

  const handleAddQuizQuestionRow = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: `new-q-${Date.now()}`,
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      showToast('Quiz title is required', undefined, 'error');
      return;
    }
    const validQuestions = quizQuestions.filter(
      (q) => q.prompt.trim() && q.options.every((o) => o.trim()),
    );
    if (validQuestions.length === 0) {
      showToast(
        'Complete at least 1 question',
        'Provide a question prompt and all 4 answer choices.',
        'error',
      );
      return;
    }
    createQuizActivity({
      title: quizTitle.trim(),
      subject: quizSubject,
      difficulty: quizDifficulty,
      type: 'quiz',
      estimatedMinutes: Math.max(3, validQuestions.length * 2),
      description:
        quizDesc.trim() ||
        `Teacher-authored ${quizSubject} interactive assessment (${validQuestions.length} questions).`,
      questions: validQuestions.map((q) => ({
        ...q,
        explanation:
          q.explanation.trim() || `Correct option: ${q.options[q.correctIndex]}.`,
      })),
      createdBy: currentUser.name,
    });
    setQuizTitle('');
    setQuizDesc('');
    setQuizQuestions([
      {
        id: `new-q-${Date.now()}`,
        prompt: '',
        options: ['', '', '', ''],
        correctIndex: 0,
        explanation: '',
      },
    ]);
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!asgTitle.trim() || !asgDesc.trim()) {
      showToast('Please enter assignment title and instructions', undefined, 'error');
      return;
    }
    createAssignment({
      title: asgTitle.trim(),
      subject: asgSubject,
      dueDate: asgDue.trim() || '30 Nov 2026',
      description: asgDesc.trim(),
      assignedBy: currentUser.name,
    });
    setAsgTitle('');
    setAsgDesc('');
  };

  const handlePostAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim() || !annBody.trim()) {
      showToast('Announcement title and message required', undefined, 'error');
      return;
    }
    addAnnouncement(annTitle.trim(), annBody.trim(), annSubject);
    setAnnTitle('');
    setAnnBody('');
  };

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSub) return;
    gradeSubmission(
      gradingSub.id,
      Math.max(0, Math.min(100, Number(gradeValue))),
      gradeFeedback.trim() || 'Reviewed and graded.',
    );
    setGradingSub(null);
    setGradeFeedback('');
  };

  // ==================== STUDENT LMS VIEW ====================
  if (!isTeacher) {
    return (
      <div className="space-y-6">
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#3B82F6]">
              Feature 05 · Student Learning Management Portal
            </p>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
              Online Learning Management
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Access assigned 3D lessons, submit coursework, and track teacher announcements.
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start md:self-auto">
            {(
              [
                ['lessons', 'Assigned Lessons'],
                ['assignments', 'Assignments'],
                ['announcements', 'Announcements'],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setStudentTab(key)}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  studentTab === key
                    ? 'bg-[#172554] text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {studentTab === 'lessons' && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Assigned 3D Learning Materials */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base text-[#172554]">
                  Assigned 3D & AR Materials
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">{materials.length} items</span>
              </div>
              <div className="divide-y divide-slate-100">
                {materials.map((mat) => (
                  <div key={mat.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{mat.title}</p>
                      <p className="text-xs text-slate-500">
                        {mat.subject} · {mat.syllabusTag} · {mat.durationMinutes} min
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openARMaterial(mat.id, false)}
                      className="px-3 py-1.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold shrink-0 whitespace-nowrap"
                    >
                      Open 3D
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assigned Quizzes & Activities */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-base text-[#172554]">
                  Assigned Interactive Quizzes
                </h2>
                <span className="text-xs text-slate-500 tabular-nums">{activities.length} items</span>
              </div>
              <div className="divide-y divide-slate-100">
                {activities.map((act) => (
                  <div key={act.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">{act.title}</p>
                      <p className="text-xs text-slate-500">
                        {act.subject} · {act.difficulty} ·{' '}
                        {act.type === 'quiz' ? 'Quiz' : 'Matching'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => startActivity(act.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-700 text-white text-xs font-semibold shrink-0 whitespace-nowrap"
                    >
                      Start
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {studentTab === 'assignments' && (
          <section className="space-y-4">
            {assignments.map((asg) => {
              const sub = submissions.find(
                (s) => s.assignmentId === asg.id && s.studentId === currentUser.id,
              );
              const status = sub?.status ?? 'Pending';

              return (
                <article
                  key={asg.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-[#3B82F6]">{asg.subject}</span>
                      <span aria-hidden="true">·</span>
                      <span>Assigned by {asg.assignedBy}</span>
                      <span aria-hidden="true">·</span>
                      <span>Due {asg.dueDate}</span>
                    </div>
                    <h2 className="font-display font-bold text-lg text-[#172554]">{asg.title}</h2>
                    <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                      {asg.description}
                    </p>

                    {sub?.status === 'Graded' && (
                      <div className="mt-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900">
                        <span className="font-bold">Grade: {sub.grade}/100</span> —{' '}
                        {sub.teacherFeedback}
                      </div>
                    )}
                    {sub?.status === 'Submitted' && (
                      <p className="text-xs text-blue-700 font-medium pt-1">
                        Submitted ({sub.submittedAt}) · Attachment: {sub.attachmentName}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                    <span
                      className={`inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border ${
                        status === 'Graded'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : status === 'Submitted'
                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                            : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}
                    >
                      {status === 'Pending' ? (
                        <Clock className="w-3.5 h-3.5" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{status}</span>
                    </span>

                    {asg.linkedMaterialId && (
                      <button
                        type="button"
                        onClick={() => openARMaterial(asg.linkedMaterialId!, false)}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 whitespace-nowrap"
                      >
                        Open 3D Lab
                      </button>
                    )}

                    {status === 'Pending' && (
                      <button
                        type="button"
                        onClick={() => setSubmittingAsg(asg)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold whitespace-nowrap"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Submit Work</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}

        {studentTab === 'announcements' && (
          <section className="space-y-4">
            {announcements.map((ann) => (
              <article
                key={ann.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-semibold text-[#8B5CF6]">{ann.subject}</span>
                  <span>{ann.publishedAt}</span>
                </div>
                <h2 className="font-display font-bold text-base text-[#172554]">{ann.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{ann.body}</p>
                <p className="text-xs text-slate-500 pt-1">Posted by {ann.author}</p>
              </article>
            ))}
          </section>
        )}

        {/* Student Assignment Submission Modal */}
        {submittingAsg && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
            <form
              onSubmit={handleStudentSubmit}
              className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-display font-bold text-lg text-[#172554]">
                  Submit Assignment
                </h2>
                <button
                  type="button"
                  onClick={() => setSubmittingAsg(null)}
                  className="p-1 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs font-semibold text-slate-700">{submittingAsg.title}</p>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Observation Summary & Response
                </label>
                <textarea
                  rows={4}
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="Write your findings from the 3D/AR model inspection..."
                  className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Simulated File Attachment Name
                </label>
                <input
                  type="text"
                  value={subFileName}
                  onChange={(e) => setSubFileName(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAsg(null)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // ==================== TEACHER LMS VIEW ====================
  return (
    <div className="space-y-6">
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#8B5CF6]">
            Feature 05 · Educator LMS & Authoring Console
          </p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#172554] mt-1">
            Teacher Management Platform
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Monitor student progress, publish new 3D learning materials, author quizzes, and grade submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-start lg:self-auto">
          {(
            [
              ['overview', 'Class & Students'],
              ['materials', 'Learning Materials'],
              ['quiz-builder', 'Create Quiz'],
              ['assignments', 'Assignments & Grading'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTeacherTab(key)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                teacherTab === key
                  ? 'bg-[#172554] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* TAB 1: Class Overview, Student Roster & Quick Announcement */}
      {teacherTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#3B82F6]" />
                <h2 className="font-display font-bold text-base text-[#172554]">
                  Student Performance Roster
                </h2>
              </div>
              <span className="text-xs text-slate-500 tabular-nums">
                {studentRoster.length} enrolled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                    <th className="py-2.5 pr-4">Student</th>
                    <th className="py-2.5 px-3 text-right">Completion</th>
                    <th className="py-2.5 px-3 text-right">Avg Quiz</th>
                    <th className="py-2.5 px-3 text-right">Weekly Time</th>
                    <th className="py-2.5 pl-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {studentRoster.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50">
                      <td className="py-3 pr-4">
                        <p className="font-semibold text-slate-900">{stu.name}</p>
                        <p className="text-[11px] text-slate-500">{stu.level}</p>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-800">
                        {stu.completionPercent}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-[#3B82F6]">
                        {stu.averageScore}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-600">
                        {stu.weeklyMinutes}m
                      </td>
                      <td className="py-3 pl-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(stu)}
                          className="text-xs font-semibold text-[#172554] hover:text-[#3B82F6]"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Post Announcement Card */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="font-display font-bold text-base text-[#172554]">
                Post Class Announcement
              </h2>
            </div>

            <form onSubmit={handlePostAnnouncement} className="space-y-3">
              <input
                type="text"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Announcement headline"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={annSubject}
                onChange={(e) => setAnnSubject(e.target.value as Subject | 'General')}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="General">General Cohort</option>
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                value={annBody}
                onChange={(e) => setAnnBody(e.target.value)}
                placeholder="Write instructions or schedule updates..."
                className="w-full p-3 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold transition-colors"
              >
                Publish Announcement
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 space-y-2">
              <p className="text-[11px] font-semibold text-slate-500">Recent Announcements</p>
              {announcements.slice(0, 2).map((a) => (
                <div key={a.id} className="text-xs bg-slate-50 rounded-lg p-2.5">
                  <p className="font-semibold text-slate-900">{a.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {a.subject} · {a.publishedAt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Learning Material Management */}
      {teacherTab === 'materials' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleAddMaterial}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-[#3B82F6]" />
              <h2 className="font-display font-bold text-base text-[#172554]">
                Add 3D Learning Material
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Material Title
                </label>
                <input
                  type="text"
                  value={matTitle}
                  onChange={(e) => setMatTitle(e.target.value)}
                  placeholder="e.g., Cardiac Muscle Ultrastructure"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={matSubject}
                    onChange={(e) => setMatSubject(e.target.value as Subject)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    {SUBJECT_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={matDifficulty}
                    onChange={(e) => setMatDifficulty(e.target.value as Difficulty)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Syllabus Tag
                  </label>
                  <input
                    type="text"
                    value={matSyllabus}
                    onChange={(e) => setMatSyllabus(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Duration (min)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={matDuration}
                    onChange={(e) => setMatDuration(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Interactive 3D Mesh Template
                </label>
                <select
                  value={matTemplate}
                  onChange={(e) => setMatTemplate(e.target.value as ModelTemplateId)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  {MODEL_TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={matDesc}
                  onChange={(e) => setMatDesc(e.target.value)}
                  placeholder="Describe what students will inspect in 3D/AR..."
                  className="w-full p-3 rounded-lg border border-slate-200 text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish to AR Library</span>
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-base text-[#172554]">
              Published Library Catalog ({materials.length})
            </h2>
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto pr-1">
              {materials.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {m.title}{' '}
                      {m.isCustom && (
                        <span className="text-[11px] text-[#3B82F6] font-medium ml-1">
                          · Newly Added
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">
                      {m.subject} · {m.syllabusTag} · {m.parts.length} labeled parts
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openARMaterial(m.id, false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 shrink-0"
                  >
                    Preview 3D
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Create New Quiz */}
      {teacherTab === 'quiz-builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <form
            onSubmit={handleCreateQuiz}
            className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5"
          >
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="font-display font-bold text-base text-[#172554]">
                Create New Interactive Quiz
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quiz Title
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder="e.g., SPM Heart Valves Check"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
                <select
                  value={quizSubject}
                  onChange={(e) => setQuizSubject(e.target.value as Subject)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Difficulty
                </label>
                <select
                  value={quizDifficulty}
                  onChange={(e) => setQuizDifficulty(e.target.value as Difficulty)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quiz Description
              </label>
              <input
                type="text"
                value={quizDesc}
                onChange={(e) => setQuizDesc(e.target.value)}
                placeholder="Brief instructions for students..."
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
              />
            </div>

            <div className="space-y-4">
              {quizQuestions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#172554]">
                      Question 0{qIdx + 1}
                    </span>
                    {quizQuestions.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx))
                        }
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={q.prompt}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuizQuestions((prev) =>
                        prev.map((item, i) => (i === qIdx ? { ...item, prompt: val } : item)),
                      );
                    }}
                    placeholder="Enter question prompt..."
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-sm"
                    required
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {q.options.map((opt, oIdx) => (
                      <div key={oIdx} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctIndex === oIdx}
                          onChange={() =>
                            setQuizQuestions((prev) =>
                              prev.map((item, i) =>
                                i === qIdx ? { ...item, correctIndex: oIdx } : item,
                              ),
                            )
                          }
                          aria-label={`Mark option ${oIdx + 1} as correct`}
                          className="accent-[#3B82F6]"
                        />
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => {
                            const val = e.target.value;
                            setQuizQuestions((prev) =>
                              prev.map((item, i) => {
                                if (i !== qIdx) return item;
                                const nextOpts = [...item.options];
                                nextOpts[oIdx] = val;
                                return { ...item, options: nextOpts };
                              }),
                            );
                          }}
                          placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                          className="flex-1 h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <input
                    type="text"
                    value={q.explanation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuizQuestions((prev) =>
                        prev.map((item, i) =>
                          i === qIdx ? { ...item, explanation: val } : item,
                        ),
                      );
                    }}
                    placeholder="Explanation shown to students after answering (optional)"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddQuizQuestionRow}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Another Question</span>
              </button>

              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold"
              >
                Publish Quiz to Activities
              </button>
            </div>
          </form>

          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-base text-[#172554]">
              Active Quizzes ({activities.length})
            </h2>
            <div className="divide-y divide-slate-100">
              {activities.map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">{a.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {a.subject} · {a.difficulty}
                      {a.isCustom ? ' · Teacher Created' : ''}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => startActivity(a.id)}
                    className="text-xs font-semibold text-[#3B82F6] hover:underline shrink-0"
                  >
                    Preview
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Assignments & Recent Submissions Grading */}
      {teacherTab === 'assignments' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Create Assignment Form */}
          <form
            onSubmit={handleCreateAssignment}
            className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 self-start"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#3B82F6]" />
              <h2 className="font-display font-bold text-base text-[#172554]">
                Assign New Task
              </h2>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={asgTitle}
                onChange={(e) => setAsgTitle(e.target.value)}
                placeholder="Assignment title"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={asgSubject}
                  onChange={(e) => setAsgSubject(e.target.value as Subject)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm bg-white"
                >
                  {SUBJECT_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={asgDue}
                  onChange={(e) => setAsgDue(e.target.value)}
                  placeholder="Due date"
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm"
                />
              </div>
              <textarea
                rows={3}
                value={asgDesc}
                onChange={(e) => setAsgDesc(e.target.value)}
                placeholder="Instructions for students..."
                className="w-full p-3 rounded-lg border border-slate-200 text-sm"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold"
            >
              Create Assignment
            </button>
          </form>

          {/* Student Submissions Table */}
          <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h2 className="font-display font-bold text-base text-[#172554]">
              Student Assignment Submissions
            </h2>
            <div className="divide-y divide-slate-100">
              {submissions.map((sub) => {
                const asg = assignments.find((a) => a.id === sub.assignmentId);
                return (
                  <div
                    key={sub.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {sub.studentName}{' '}
                        <span className="font-normal text-xs text-slate-500">
                          · {sub.studentLevel}
                        </span>
                      </p>
                      <p className="text-xs text-slate-600 truncate">
                        {asg?.title ?? 'Assignment'} ({asg?.subject})
                      </p>
                      {sub.notes && (
                        <p className="text-xs text-slate-500 line-clamp-1">
                          “{sub.notes}”
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-xs font-semibold ${
                          sub.status === 'Graded'
                            ? 'text-emerald-700'
                            : sub.status === 'Submitted'
                              ? 'text-[#3B82F6]'
                              : 'text-amber-700'
                        }`}
                      >
                        {sub.status === 'Graded'
                          ? `Graded (${sub.grade}/100)`
                          : sub.status}
                      </span>

                      {sub.status === 'Submitted' && (
                        <button
                          type="button"
                          onClick={() => {
                            setGradingSub(sub);
                            setGradeValue(90);
                            setGradeFeedback('');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold"
                        >
                          Grade
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Teacher: Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-lg text-[#172554]">
                  {selectedStudent.name}
                </h2>
                <p className="text-xs text-slate-500">{selectedStudent.level}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Overall Completion</p>
                <p className="font-display font-bold text-lg text-[#172554] tabular-nums mt-0.5">
                  {selectedStudent.completionPercent}%
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Average Quiz Score</p>
                <p className="font-display font-bold text-lg text-[#3B82F6] tabular-nums mt-0.5">
                  {selectedStudent.averageScore}%
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Lessons Completed</p>
                <p className="font-display font-bold text-lg text-slate-900 tabular-nums mt-0.5">
                  {selectedStudent.lessonsCompleted}
                </p>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                <p className="text-slate-500">Weekly Study Time</p>
                <p className="font-display font-bold text-lg text-slate-900 tabular-nums mt-0.5">
                  {selectedStudent.weeklyMinutes} min
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Last active: <strong className="text-slate-800">{selectedStudent.lastActive}</strong>
            </p>

            <button
              type="button"
              onClick={() => setSelectedStudent(null)}
              className="w-full py-2.5 rounded-lg bg-[#172554] text-white text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Teacher: Grade Submission Modal */}
      {gradingSub && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveGrade}
            className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-[#172554]">
                Grade Submission
              </h2>
              <button
                type="button"
                onClick={() => setGradingSub(null)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
              <p className="font-semibold text-slate-900">{gradingSub.studentName}</p>
              <p className="text-slate-600">{gradingSub.notes}</p>
              {gradingSub.attachmentName && (
                <p className="text-blue-600 font-medium">
                  Attachment: {gradingSub.attachmentName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Score (0–100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={gradeValue}
                onChange={(e) => setGradeValue(Number(e.target.value))}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 text-sm tabular-nums"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Feedback for Student
              </label>
              <textarea
                rows={3}
                value={gradeFeedback}
                onChange={(e) => setGradeFeedback(e.target.value)}
                placeholder="Write constructive comments..."
                className="w-full p-3 rounded-lg border border-slate-200 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setGradingSub(null)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#172554] hover:bg-blue-900 text-white text-xs font-semibold"
              >
                Save Grade
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
