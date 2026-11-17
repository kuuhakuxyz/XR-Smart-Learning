import React from 'react';
import { AppShell } from './components/layout/AppShell';
import { AppProvider, useApp } from './context/AppContext';
import { ActivitiesHubScreen } from './screens/ActivitiesHubScreen';
import { ARLibraryScreen } from './screens/ARLibraryScreen';
import { ARViewerScreen } from './screens/ARViewerScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LMSScreen } from './screens/LMSScreen';
import { LoginScreen } from './screens/LoginScreen';
import { ProgressDashboardScreen } from './screens/ProgressDashboardScreen';
import { QuizPlayerScreen } from './screens/QuizPlayerScreen';
import { QuizResultsScreen } from './screens/QuizResultsScreen';
import { VirtualClassroomSelectionScreen } from './screens/VirtualClassroomSelectionScreen';
import { VirtualClassroomViewScreen } from './screens/VirtualClassroomViewScreen';

const MainRouter: React.FC = () => {
  const { currentUser, screen } = useApp();

  if (!currentUser || screen === 'login') {
    return <LoginScreen />;
  }

  return (
    <AppShell>
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
