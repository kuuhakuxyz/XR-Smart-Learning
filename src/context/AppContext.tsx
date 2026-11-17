import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  DEMO_USERS,
  INITIAL_ACTIVITIES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_AR_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_BADGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_RECENT_ACTIVITIES,
  INITIAL_STUDENT_ROSTER,
  INITIAL_SUBJECT_MASTERY,
  INITIAL_SUBMISSIONS,
  INITIAL_WEEKLY_ACTIVITY,
  VIRTUAL_CLASSROOMS,
} from '../data/mockData';
import {
  AchievementBadge,
  Announcement,
  AppNotification,
  AppSettings,
  ARMaterial,
  Assignment,
  AssignmentSubmission,
  DemoUser,
  LearningActivity,
  QuizAttemptResult,
  RecentActivityLog,
  ScreenId,
  StudentRosterRecord,
  Subject,
  SubjectMastery,
  VirtualClassroom,
  WeeklyStudyDay,
} from '../types';

const STORAGE_KEY = 'xr_smart_learning_state_v1';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: 'success' | 'info' | 'error';
}

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

interface PersistedState {
  currentUserId: string | null;
  materials: ARMaterial[];
  activities: LearningActivity[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  announcements: Announcement[];
  studentRoster: StudentRosterRecord[];
  badges: AchievementBadge[];
  recentActivities: RecentActivityLog[];
  weeklyStudy: WeeklyStudyDay[];
  subjectMastery: SubjectMastery[];
  inspectedMaterialIds: string[];
  studiedStationIds: string[];
  completedActivityIds: string[];
  quizResultsHistory: QuizAttemptResult[];
  totalLearningMinutes: number;
  notifications: AppNotification[];
  settings: AppSettings;
}

const DEFAULT_PERSISTED: PersistedState = {
  currentUserId: null,
  materials: INITIAL_AR_MATERIALS,
  activities: INITIAL_ACTIVITIES,
  assignments: INITIAL_ASSIGNMENTS,
  submissions: INITIAL_SUBMISSIONS,
  announcements: INITIAL_ANNOUNCEMENTS,
  studentRoster: INITIAL_STUDENT_ROSTER,
  badges: INITIAL_BADGES,
  recentActivities: INITIAL_RECENT_ACTIVITIES,
  weeklyStudy: INITIAL_WEEKLY_ACTIVITY,
  subjectMastery: INITIAL_SUBJECT_MASTERY,
  inspectedMaterialIds: ['ar-human-heart', 'ar-water-molecule', 'ar-solar-system'],
  studiedStationIds: ['st-sun-core', 'st-earth-orbit'],
  completedActivityIds: ['act-elements-quiz'],
  quizResultsHistory: [],
  totalLearningMinutes: 295,
  notifications: INITIAL_NOTIFICATIONS,
  settings: {
    reducedMotion: false,
    show3DLabelsByDefault: true,
    arSimulationNoticeSeen: false,
  },
};

function loadInitialPersisted(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERSISTED;
    const parsed = JSON.parse(raw) as Partial<PersistedState>;
    return {
      ...DEFAULT_PERSISTED,
      ...parsed,
      settings: {
        ...DEFAULT_PERSISTED.settings,
        ...(parsed.settings ?? {}),
      },
    };
  } catch {
    return DEFAULT_PERSISTED;
  }
}

interface AppContextValue {
  currentUser: DemoUser | null;
  screen: ScreenId;
  screenLoading: boolean;
  selectedMaterialId: string;
  launchInARMode: boolean;
  selectedClassroomId: string;
  selectedActivityId: string;
  latestQuizResult: QuizAttemptResult | null;
  materials: ARMaterial[];
  classrooms: VirtualClassroom[];
  activities: LearningActivity[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  announcements: Announcement[];
  studentRoster: StudentRosterRecord[];
  badges: AchievementBadge[];
  recentActivities: RecentActivityLog[];
  weeklyStudy: WeeklyStudyDay[];
  subjectMastery: SubjectMastery[];
  inspectedMaterialIds: string[];
  studiedStationIds: string[];
  completedActivityIds: string[];
  quizResultsHistory: QuizAttemptResult[];
  totalLearningMinutes: number;
  overallCompletionPercent: number;
  averageQuizScore: number;
  lessonsCompletedCount: number;
  notifications: AppNotification[];
  settings: AppSettings;
  toasts: ToastMessage[];
  confirmDialog: ConfirmDialogState;

  loginAsUser: (userId: string) => void;
  logout: () => void;
  navigateTo: (target: ScreenId) => void;
  openARMaterial: (materialId: string, startAR?: boolean) => void;
  openVirtualClassroom: (classroomId: string) => void;
  startActivity: (activityId: string) => void;
  recordARPartInspected: (materialId: string) => void;
  recordClassroomStationStudied: (classroomId: string, stationId: string) => void;
  completeActivityAttempt: (result: QuizAttemptResult) => void;
  submitAssignment: (assignmentId: string, notes: string, attachmentName: string) => void;
  addLearningMaterial: (material: Omit<ARMaterial, 'id'>) => void;
  createQuizActivity: (activity: Omit<LearningActivity, 'id'>) => void;
  createAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  gradeSubmission: (submissionId: string, grade: number, feedback: string) => void;
  addAnnouncement: (title: string, body: string, subject: Subject | 'General') => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetDemoData: () => void;
  showToast: (title: string, description?: string, tone?: ToastMessage['tone']) => void;
  dismissToast: (id: string) => void;
  openConfirm: (title: string, message: string, confirmLabel: string, onConfirm: () => void) => void;
  closeConfirm: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persisted, setPersisted] = useState<PersistedState>(loadInitialPersisted);

  const [screen, setScreen] = useState<ScreenId>(() =>
    persisted.currentUserId ? 'dashboard' : 'login',
  );
  const [screenLoading, setScreenLoading] = useState(false);
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('ar-human-heart');
  const [launchInARMode, setLaunchInARMode] = useState<boolean>(false);
  const [selectedClassroomId, setSelectedClassroomId] = useState<string>('vc-anatomy-lab');
  const [selectedActivityId, setSelectedActivityId] = useState<string>('act-heart-quiz');
  const [latestQuizResult, setLatestQuizResult] = useState<QuizAttemptResult | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    open: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch {
      // Ignore storage quota errors
    }
  }, [persisted]);

  const currentUser =
    persisted.currentUserId
      ? DEMO_USERS.find((u) => u.id === persisted.currentUserId) ?? null
      : null;

  const showToast = useCallback(
    (title: string, description?: string, tone: ToastMessage['tone'] = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, title, description, tone }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    },
    [],
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openConfirm = useCallback(
    (title: string, message: string, confirmLabel: string, onConfirm: () => void) => {
      setConfirmDialog({ open: true, title, message, confirmLabel, onConfirm });
    },
    [],
  );

  const closeConfirm = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const navigateWithBriefTransition = useCallback((target: ScreenId, heavy = false) => {
    if (heavy) {
      setScreenLoading(true);
      setScreen(target);
      window.setTimeout(() => setScreenLoading(false), 180);
    } else {
      setScreen(target);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const loginAsUser = useCallback(
    (userId: string) => {
      const user = DEMO_USERS.find((u) => u.id === userId);
      if (!user) return;
      setPersisted((prev) => ({ ...prev, currentUserId: userId }));
      navigateWithBriefTransition('dashboard');
      showToast(`Signed in as ${user.name}`, user.levelOrDepartment, 'info');
    },
    [navigateWithBriefTransition, showToast],
  );

  const logout = useCallback(() => {
    setPersisted((prev) => ({ ...prev, currentUserId: null }));
    setScreen('login');
  }, []);

  const navigateTo = useCallback(
    (target: ScreenId) => {
      if (target === 'ar-viewer' || target === 'virtual-classroom-view') {
        navigateWithBriefTransition(target, true);
      } else {
        navigateWithBriefTransition(target, false);
      }
    },
    [navigateWithBriefTransition],
  );

  const openARMaterial = useCallback(
    (materialId: string, startAR = false) => {
      setSelectedMaterialId(materialId);
      setLaunchInARMode(startAR);
      navigateWithBriefTransition('ar-viewer', true);
    },
    [navigateWithBriefTransition],
  );

  const openVirtualClassroom = useCallback(
    (classroomId: string) => {
      setSelectedClassroomId(classroomId);
      navigateWithBriefTransition('virtual-classroom-view', true);
    },
    [navigateWithBriefTransition],
  );

  const startActivity = useCallback(
    (activityId: string) => {
      setSelectedActivityId(activityId);
      navigateWithBriefTransition('quiz-player');
    },
    [navigateWithBriefTransition],
  );

  const recordARPartInspected = useCallback((materialId: string) => {
    setPersisted((prev) => {
      const mat = prev.materials.find((m) => m.id === materialId);
      if (!mat) return prev;
      const already = prev.inspectedMaterialIds.includes(materialId);
      const nextInspected = already
        ? prev.inspectedMaterialIds
        : [...prev.inspectedMaterialIds, materialId];

      const updatedWeekly = prev.weeklyStudy.map((d, idx) =>
        idx === prev.weeklyStudy.length - 1
          ? { ...d, minutes: d.minutes + 4, modules: d.modules + (already ? 0 : 1) }
          : d,
      );

      const updatedSubjectMastery = prev.subjectMastery.map((sm) =>
        sm.subject === mat.subject && !already
          ? {
              ...sm,
              completedLessons: Math.min(sm.totalLessons, sm.completedLessons + 1),
              score: Math.min(100, sm.score + 2),
            }
          : sm,
      );

      const updatedBadges = prev.badges.map((b) => {
        if (b.id === 'badge-ar-explorer' && !b.unlocked && nextInspected.length >= 3) {
          return { ...b, unlocked: true, unlockedAt: 'Just now' };
        }
        return b;
      });

      const nextRecent: RecentActivityLog[] = already
        ? prev.recentActivities
        : [
            {
              id: `rec-${Date.now()}`,
              title: `${mat.title} 3D/AR Inspection`,
              category: 'AR Model',
              subject: mat.subject,
              timestamp: 'Just now',
              metricText: `${mat.parts.length} labeled structures`,
            },
            ...prev.recentActivities.slice(0, 7),
          ];

      return {
        ...prev,
        inspectedMaterialIds: nextInspected,
        weeklyStudy: updatedWeekly,
        subjectMastery: updatedSubjectMastery,
        badges: updatedBadges,
        recentActivities: nextRecent,
        totalLearningMinutes: prev.totalLearningMinutes + 4,
      };
    });
  }, []);

  const recordClassroomStationStudied = useCallback(
    (classroomId: string, stationId: string) => {
      setPersisted((prev) => {
        const cls = VIRTUAL_CLASSROOMS.find((c) => c.id === classroomId);
        const st = cls?.stations.find((s) => s.id === stationId);
        if (!cls || !st) return prev;
        if (prev.studiedStationIds.includes(stationId)) return prev;

        const nextStations = [...prev.studiedStationIds, stationId];
        const updatedWeekly = prev.weeklyStudy.map((d, idx) =>
          idx === prev.weeklyStudy.length - 1
            ? { ...d, minutes: d.minutes + 8, modules: d.modules + 1 }
            : d,
        );
        const updatedMastery = prev.subjectMastery.map((sm) =>
          sm.subject === cls.subject
            ? {
                ...sm,
                completedLessons: Math.min(sm.totalLessons, sm.completedLessons + 1),
                score: Math.min(100, sm.score + 2),
              }
            : sm,
        );
        const updatedBadges = prev.badges.map((b) =>
          b.id === 'badge-vr-pioneer' && !b.unlocked && nextStations.length >= 2
            ? { ...b, unlocked: true, unlockedAt: 'Just now' }
            : b,
        );
        const nextRecent: RecentActivityLog[] = [
          {
            id: `rec-${Date.now()}`,
            title: `${cls.title} · ${st.title}`,
            category: 'Virtual Classroom',
            subject: cls.subject,
            timestamp: 'Just now',
            metricText: 'Station completed',
          },
          ...prev.recentActivities.slice(0, 7),
        ];

        return {
          ...prev,
          studiedStationIds: nextStations,
          weeklyStudy: updatedWeekly,
          subjectMastery: updatedMastery,
          badges: updatedBadges,
          recentActivities: nextRecent,
          totalLearningMinutes: prev.totalLearningMinutes + 8,
        };
      });
      showToast('Station marked as studied', 'Your virtual lab progress has been saved.');
    },
    [showToast],
  );

  const completeActivityAttempt = useCallback(
    (result: QuizAttemptResult) => {
      setLatestQuizResult(result);
      setPersisted((prev) => {
        const nextCompleted = prev.completedActivityIds.includes(result.activityId)
          ? prev.completedActivityIds
          : [...prev.completedActivityIds, result.activityId];

        const nextHistory = [result, ...prev.quizResultsHistory];

        const updatedMastery = prev.subjectMastery.map((sm) => {
          if (sm.subject !== result.subject) return sm;
          const blended = Math.round((sm.score + result.scorePercent) / 2);
          return {
            ...sm,
            score: blended,
            completedLessons: prev.completedActivityIds.includes(result.activityId)
              ? sm.completedLessons
              : Math.min(sm.totalLessons, sm.completedLessons + 1),
          };
        });

        const updatedWeekly = prev.weeklyStudy.map((d, idx) =>
          idx === prev.weeklyStudy.length - 1
            ? {
                ...d,
                minutes: d.minutes + Math.max(3, Math.round(result.durationSeconds / 60)),
                modules: d.modules + 1,
              }
            : d,
        );

        const updatedBadges = prev.badges.map((b) => {
          if (
            b.id === 'badge-anatomy-ace' &&
            !b.unlocked &&
            result.subject === 'Biology' &&
            result.scorePercent >= 80
          ) {
            return { ...b, unlocked: true, unlockedAt: 'Just now' };
          }
          if (b.id === 'badge-quiz-master' && !b.unlocked && nextCompleted.length >= 3) {
            return { ...b, unlocked: true, unlockedAt: 'Just now' };
          }
          return b;
        });

        const nextRecent: RecentActivityLog[] = [
          {
            id: `rec-${Date.now()}`,
            title: result.activityTitle,
            category: 'Interactive Quiz',
            subject: result.subject,
            timestamp: 'Just now',
            metricText: `Score: ${result.scorePercent}% (${result.correctCount}/${result.totalCount})`,
          },
          ...prev.recentActivities.slice(0, 7),
        ];

        return {
          ...prev,
          completedActivityIds: nextCompleted,
          quizResultsHistory: nextHistory,
          subjectMastery: updatedMastery,
          weeklyStudy: updatedWeekly,
          badges: updatedBadges,
          recentActivities: nextRecent,
          totalLearningMinutes:
            prev.totalLearningMinutes + Math.max(3, Math.round(result.durationSeconds / 60)),
        };
      });
      navigateWithBriefTransition('quiz-results');
    },
    [navigateWithBriefTransition],
  );

  const submitAssignment = useCallback(
    (assignmentId: string, notes: string, attachmentName: string) => {
      setPersisted((prev) => {
        const user = DEMO_USERS.find((u) => u.id === prev.currentUserId) ?? DEMO_USERS[0];
        const existing = prev.submissions.find(
          (s) => s.assignmentId === assignmentId && s.studentId === user.id,
        );
        const asg = prev.assignments.find((a) => a.id === assignmentId);
        let nextSubs: AssignmentSubmission[];
        if (existing) {
          nextSubs = prev.submissions.map((s) =>
            s.id === existing.id
              ? {
                  ...s,
                  status: 'Submitted',
                  submittedAt: 'Just now',
                  notes,
                  attachmentName,
                }
              : s,
          );
        } else {
          nextSubs = [
            {
              id: `sub-${Date.now()}`,
              assignmentId,
              studentId: user.id,
              studentName: user.name,
              studentLevel: user.levelOrDepartment,
              status: 'Submitted',
              submittedAt: 'Just now',
              notes,
              attachmentName,
            },
            ...prev.submissions,
          ];
        }

        const nextRecent: RecentActivityLog[] = asg
          ? [
              {
                id: `rec-${Date.now()}`,
                title: asg.title,
                category: 'LMS Assignment',
                subject: asg.subject,
                timestamp: 'Just now',
                metricText: 'Submitted',
              },
              ...prev.recentActivities.slice(0, 7),
            ]
          : prev.recentActivities;

        return {
          ...prev,
          submissions: nextSubs,
          recentActivities: nextRecent,
        };
      });
      showToast('Assignment submitted', 'Your teacher can now review your submission.');
    },
    [showToast],
  );

  const addLearningMaterial = useCallback(
    (material: Omit<ARMaterial, 'id'>) => {
      const id = `ar-custom-${Date.now()}`;
      setPersisted((prev) => ({
        ...prev,
        materials: [{ ...material, id, isCustom: true }, ...prev.materials],
        notifications: [
          {
            id: `not-${Date.now()}`,
            title: `New 3D Material Published: ${material.title}`,
            detail: `${material.subject} · Available now in the AR Learning Library.`,
            time: 'Just now',
            read: false,
            targetScreen: 'ar-library',
          },
          ...prev.notifications,
        ],
      }));
      showToast('Learning material published', `${material.title} is now live in the AR Library.`);
    },
    [showToast],
  );

  const createQuizActivity = useCallback(
    (activity: Omit<LearningActivity, 'id'>) => {
      const id = `act-custom-${Date.now()}`;
      setPersisted((prev) => ({
        ...prev,
        activities: [{ ...activity, id, isCustom: true }, ...prev.activities],
        notifications: [
          {
            id: `not-${Date.now()}`,
            title: `New Quiz Assigned: ${activity.title}`,
            detail: `${activity.subject} · ${activity.questions?.length ?? 0} questions ready.`,
            time: 'Just now',
            read: false,
            targetScreen: 'activities',
          },
          ...prev.notifications,
        ],
      }));
      showToast('Quiz created', `${activity.title} added to Interactive Activities.`);
    },
    [showToast],
  );

  const createAssignment = useCallback(
    (assignment: Omit<Assignment, 'id'>) => {
      const id = `asg-custom-${Date.now()}`;
      const newAsg: Assignment = { ...assignment, id };
      setPersisted((prev) => ({
        ...prev,
        assignments: [newAsg, ...prev.assignments],
        submissions: [
          {
            id: `sub-aiman-${Date.now()}`,
            assignmentId: id,
            studentId: 'stu-aiman',
            studentName: 'Aiman Hakim',
            studentLevel: 'Form 5 Science',
            status: 'Pending',
          },
          ...prev.submissions,
        ],
      }));
      showToast('Assignment created', `${assignment.title} has been assigned to the class.`);
    },
    [showToast],
  );

  const gradeSubmission = useCallback(
    (submissionId: string, grade: number, feedback: string) => {
      setPersisted((prev) => ({
        ...prev,
        submissions: prev.submissions.map((s) =>
          s.id === submissionId
            ? { ...s, status: 'Graded', grade, teacherFeedback: feedback }
            : s,
        ),
      }));
      showToast('Submission graded', `Recorded score ${grade}/100 with feedback.`);
    },
    [showToast],
  );

  const addAnnouncement = useCallback(
    (title: string, body: string, subject: Subject | 'General') => {
      setPersisted((prev) => ({
        ...prev,
        announcements: [
          {
            id: `ann-${Date.now()}`,
            title,
            body,
            subject,
            author:
              DEMO_USERS.find((u) => u.id === prev.currentUserId)?.name ?? 'Dr. Farah Nadia',
            publishedAt: 'Just now',
          },
          ...prev.announcements,
        ],
      }));
      showToast('Announcement posted', 'Students will see this update in their LMS feed.');
    },
    [showToast],
  );

  const markNotificationRead = useCallback((id: string) => {
    setPersisted((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setPersisted((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  }, []);

  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setPersisted((prev) => ({
      ...prev,
      settings: { ...prev.settings, ...partial },
    }));
  }, []);

  const resetDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setPersisted((prev) => ({
      ...DEFAULT_PERSISTED,
      currentUserId: prev.currentUserId,
    }));
    showToast('Demo data restored', 'All progress, quizzes, and assignments reset to default.', 'info');
  }, [showToast]);

  const totalLessonsAvailable = persisted.subjectMastery.reduce(
    (acc, s) => acc + s.totalLessons,
    0,
  );
  const lessonsCompletedCount = persisted.subjectMastery.reduce(
    (acc, s) => acc + s.completedLessons,
    0,
  );
  const overallCompletionPercent = Math.min(
    100,
    Math.round((lessonsCompletedCount / Math.max(1, totalLessonsAvailable)) * 100),
  );
  const averageQuizScore = Math.round(
    persisted.subjectMastery.reduce((acc, s) => acc + s.score, 0) /
      Math.max(1, persisted.subjectMastery.length),
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        screen,
        screenLoading,
        selectedMaterialId,
        launchInARMode,
        selectedClassroomId,
        selectedActivityId,
        latestQuizResult,
        materials: persisted.materials,
        classrooms: VIRTUAL_CLASSROOMS,
        activities: persisted.activities,
        assignments: persisted.assignments,
        submissions: persisted.submissions,
        announcements: persisted.announcements,
        studentRoster: persisted.studentRoster,
        badges: persisted.badges,
        recentActivities: persisted.recentActivities,
        weeklyStudy: persisted.weeklyStudy,
        subjectMastery: persisted.subjectMastery,
        inspectedMaterialIds: persisted.inspectedMaterialIds,
        studiedStationIds: persisted.studiedStationIds,
        completedActivityIds: persisted.completedActivityIds,
        quizResultsHistory: persisted.quizResultsHistory,
        totalLearningMinutes: persisted.totalLearningMinutes,
        overallCompletionPercent,
        averageQuizScore,
        lessonsCompletedCount,
        notifications: persisted.notifications,
        settings: persisted.settings,
        toasts,
        confirmDialog,
        loginAsUser,
        logout,
        navigateTo,
        openARMaterial,
        openVirtualClassroom,
        startActivity,
        recordARPartInspected,
        recordClassroomStationStudied,
        completeActivityAttempt,
        submitAssignment,
        addLearningMaterial,
        createQuizActivity,
        createAssignment,
        gradeSubmission,
        addAnnouncement,
        markNotificationRead,
        markAllNotificationsRead,
        updateSettings,
        resetDemoData,
        showToast,
        dismissToast,
        openConfirm,
        closeConfirm,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
