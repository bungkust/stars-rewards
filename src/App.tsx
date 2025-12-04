import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAppStore } from './store/useAppStore';

// Pages
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Rewards from './pages/Rewards';
import Stats from './pages/Stats'; // Wrapper page
import Settings from './pages/settings/Settings';
import AddChild from './pages/onboarding/AddChild';
import FamilySetup from './pages/onboarding/FamilySetup';
import FirstTask from './pages/onboarding/FirstTask';
import FirstReward from './pages/onboarding/FirstReward';
import Welcome from './pages/Welcome';

// Components
import Layout from './components/layout/Layout';
import ChildSelector from './components/ChildSelector';

function App() {
  const { activeChildId, setActiveChild, isAdminMode, onboardingStep, userProfile, refreshData } = useAppStore();
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);

  // Simplified Auth Check: Just check if we have a local user profile
  const isAuthenticated = !!userProfile;
  const needsOnboarding = isAuthenticated && onboardingStep !== 'completed';

  // Check for active child on mount
  useEffect(() => {
    if (isAuthenticated && !needsOnboarding && !activeChildId && !isAdminMode) {
      setIsChildSelectorOpen(true);
    } else {
      setIsChildSelectorOpen(false);
    }

    // Configure StatusBar
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => { });
      StatusBar.setBackgroundColor({ color: '#F0F9FF' }).catch(() => { }); // Light blue to match app theme
      StatusBar.setStyle({ style: Style.Light }).catch(() => { }); // Dark icons for light background
    }
  }, [activeChildId, isAdminMode, needsOnboarding, isAuthenticated]);

  // Fetch Data on Mount if Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  const handleChildSelect = (childId: string) => {
    setActiveChild(childId);
    setIsChildSelectorOpen(false);
  };

  // Unauthenticated Router
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding/family-setup" element={<FamilySetup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }

  // Onboarding Router
  if (needsOnboarding) {
    return (
      <Router>
        <Routes>
          <Route path="/onboarding/add-child" element={<AddChild />} />
          <Route path="/onboarding/first-task" element={<FirstTask />} />
          <Route path="/onboarding/first-reward" element={<FirstReward />} />
          <Route path="*" element={<Navigate to="/onboarding/add-child" replace />} />
        </Routes>
      </Router>
    );
  }

  // Authenticated App Router
  return (
    <Router>
      <Layout onChildSelect={() => setIsChildSelectorOpen(true)}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        {isChildSelectorOpen && (
          <ChildSelector
            onSelect={handleChildSelect}
            onClose={() => !activeChildId && setIsChildSelectorOpen(false)}
          />
        )}
      </Layout>
    </Router>
  );
}

export default App;
