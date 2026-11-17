import React, { Suspense, lazy } from 'react';
import { AppShell } from './components/layout/AppShell';
import { AppProvider, useApp } from './context/AppContext';
import { ActivitiesHubScreen } from './screens/ActivitiesHubScreen';
import { ARLibraryScreen } from './screens/ARLibraryScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { QuizPlayerScreen } from './screens/QuizPlayerScreen';
import { QuizResultsScreen } from './screens/QuizResultsScreen';
import { VirtualClassroomSelectionScreen } from './screens/VirtualClassroomSelectionScreen';

// Lazy-load heavy Three.js 3D, Recharts, and LMS modules for faster initial load
const ARViewerScreen = lazy(() =>
  import('./screens/ARViewerScreen').then((m) => ({ default: m.ARViewerScreen })),
);
const VirtualClassroomViewScreen = lazy(() =>
  import('./screens/VirtualClassroomViewScreen').then((m) => ({
    default: m.VirtualClassroomViewScreen,
  })),
);
const ProgressDashboardScreen = lazy(() =>
  import('./screens/ProgressDashboardScreen').then((m) => ({
    default: m.ProgressDashboardScreen,
  })),
);
const LMSScreen = lazy(() =>
  import('./screens/LMSScreen').then((m) => ({ default: m.LMSScreen })),
);

const LazyModuleFallback: React.FC = () => (
  <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading module">
    <div className="h-7 w-56 bg-slate-200 rounded-lg" />
    <div className="h-[440px] w-full bg-slate-200 rounded-xl" />
  </div>
);

const MainRouter: React.FC = () => {
  const { currentUser, screen } = useApp();

  if (!currentUser || screen === 'login') {
    return <LoginScreen />;
  }

  return (
    <AppShell>
      <Suspense fallback={<LazyModuleFallback />}>
        {screen === 'dashboard' && <DashboardScreen />}
        {screen === 'ar-library' && <ARLibraryScreen />}
        {screen === 'ar-viewer' && <ARViewerScreen />}
        {screen === 'virtual-classrooms' && <VirtualClassroomSelectionScreen />}
        {screen === 'virtual-classroom-view' && <VirtualClassroomViewScreen />}
        {screen === 'activities' && <ActivitiesHubScreen />}
        {screen === 'quiz-player' && <QuizPlayerScreen />}
        {screen === 'quiz-results' && <QuizResultsScreen />}
        {screen === 'progress' && <ProgressDashboardScreen />}
        {screen === 'lms' && <LMSScreen />}
      </Suspense>
    </AppShell>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
