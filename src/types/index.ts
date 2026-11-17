export type UserRole = 'student' | 'teacher';

export type Subject = 'Biology' | 'Chemistry' | 'Physics' | 'Geography';

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export type ScreenId =
  | 'login'
  | 'dashboard'
  | 'ar-library'
  | 'ar-viewer'
  | 'virtual-classrooms'
  | 'virtual-classroom-view'
  | 'activities'
  | 'quiz-player'
  | 'quiz-results'
  | 'progress'
  | 'lms';

export type ModelTemplateId =
  | 'human-heart'
  | 'human-skeleton'
  | 'human-cell'
  | 'water-molecule'
  | 'atomic-structure'
  | 'solar-system'
  | 'earth-layers';

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  institution: string;
  levelOrDepartment: string;
  initials: string;
  email: string;
}

export interface ARPartLabel {
  id: string;
  name: string;
  shortCode: string;
  summary: string;
  detail: string;
  keyFact: string;
  anchorPosition: [number, number, number];
  meshKey: string;
}

export interface ARMaterial {
  id: string;
  title: string;
  subject: Subject;
  syllabusTag: string;
  difficulty: Difficulty;
  durationMinutes: number;
  description: string;
  learningObjectives: string[];
  modelTemplate: ModelTemplateId;
  parts: ARPartLabel[];
  addedBy?: string;
  isCustom?: boolean;
}

export type ClassroomEnvironmentId = 'anatomy-lab' | 'solar-observatory' | 'earth-station';

export interface ClassroomStation {
  id: string;
  title: string;
  areaLabel: string;
  subtitle: string;
  description: string;
  keyTakeaways: string[];
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
  meshKey: string;
  relatedMaterialId?: string;
}

export interface VirtualClassroom {
  id: string;
  title: string;
  subject: Subject;
  instructor: string;
  syllabusTag: string;
  durationMinutes: number;
  description: string;
  previewImage: string;
  environmentId: ClassroomEnvironmentId;
  stations: ClassroomStation[];
}

export type ActivityType = 'quiz' | 'matching';

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface MatchingPair {
  id: string;
  term: string;
  matchLabel: string;
  explanation: string;
}

export interface LearningActivity {
  id: string;
  title: string;
  subject: Subject;
  difficulty: Difficulty;
  type: ActivityType;
  estimatedMinutes: number;
  description: string;
  questions?: QuizQuestion[];
  matchingPairs?: MatchingPair[];
  createdBy?: string;
  isCustom?: boolean;
}

export interface QuizAttemptResult {
  activityId: string;
  activityTitle: string;
  subject: Subject;
  type: ActivityType;
  scorePercent: number;
  correctCount: number;
  totalCount: number;
  durationSeconds: number;
  completedAt: string;
  itemReviews: {
    prompt: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  criteria: string;
  unlocked: boolean;
  unlockedAt?: string;
  category: 'ar' | 'vr' | 'quiz' | 'consistency';
}

export interface RecentActivityLog {
  id: string;
  title: string;
  category: 'AR Model' | 'Virtual Classroom' | 'Interactive Quiz' | 'LMS Assignment';
  subject: Subject;
  timestamp: string;
  metricText: string;
}

export interface WeeklyStudyDay {
  day: string;
  minutes: number;
  modules: number;
}

export interface SubjectMastery {
  subject: Subject;
  score: number;
  completedLessons: number;
  totalLessons: number;
}

export type SubmissionStatus = 'Pending' | 'Submitted' | 'Graded';

export interface Assignment {
  id: string;
  title: string;
  subject: Subject;
  dueDate: string;
  description: string;
  linkedMaterialId?: string;
  linkedActivityId?: string;
  assignedBy: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  studentLevel: string;
  status: SubmissionStatus;
  submittedAt?: string;
  notes?: string;
  attachmentName?: string;
  grade?: number;
  teacherFeedback?: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  author: string;
  subject: Subject | 'General';
  publishedAt: string;
}

export interface StudentRosterRecord {
  id: string;
  name: string;
  level: string;
  completionPercent: number;
  averageScore: number;
  lessonsCompleted: number;
  weeklyMinutes: number;
  lastActive: string;
}

export interface AppNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  targetScreen?: ScreenId;
}

export interface AppSettings {
  reducedMotion: boolean;
  show3DLabelsByDefault: boolean;
  arSimulationNoticeSeen: boolean;
}
