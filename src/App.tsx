import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
// Main App Component
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAppStore } from './store/useAppStore';

// Pages
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Rewards from './pages/Rewards';
import Stats from './pages/Stats';
import Settings from './pages/settings/Settings';
import AddChild from './pages/onboarding/AddChild';
import FamilySetup from './pages/onboarding/FamilySetup';
import FirstTask from './pages/onboarding/FirstTask';
import FirstReward from './pages/onboarding/FirstReward';
import Welcome from './pages/Welcome';
import AdminTaskForm from './pages/admin/AdminTaskForm';
import AdminRewardForm from './pages/admin/AdminRewardForm';

import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Playground from './pages/Playground'; // Design System Verification

// Components
import Layout from './components/layout/Layout';
import ChildSelector from './components/ChildSelector';

function App() {
  const { activeChildId, setActiveChild, isAdminMode, onboardingStep, userProfile, refreshData, fetchUserProfile } = useAppStore();
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      await fetchUserProfile();
      setIsCheckingAuth(false);
    };
    initAuth();
  }, [fetchUserProfile]);

  // Simplified Auth Check: Just check if we have a local user profile
  const isAuthenticated = !!userProfile;
  const needsOnboarding = isAuthenticated && onboardingStep !== 'completed';

  // Check for active child on mount
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated && !needsOnboarding && !activeChildId && !isAdminMode) {
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
  }, [activeChildId, isAdminMode, needsOnboarding, isAuthenticated, isCheckingAuth]);

  // Fetch Data on Mount if Authenticated
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData, isCheckingAuth]);

  const handleChildSelect = (childId: string) => {
    setActiveChild(childId);
    setIsChildSelectorOpen(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Unauthenticated Router
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/onboarding/family-setup" element={<FamilySetup />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
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
        <AnimatedRoutes />

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

// Separate component to use useLocation hook
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './components/layout/PageTransition';

const AnimatedRoutes = () => {
  const location = useLocation();
  const { isAdminMode } = useAppStore();

  // Apply Global Theme
  useEffect(() => {
    // Allow Playground to manage its own theme
    if (location.pathname === '/playground') return;

    const theme = isAdminMode ? 'parentTheme' : 'childTheme';
    document.documentElement.setAttribute('data-theme', theme);
  }, [isAdminMode, location.pathname]);

  // Root Redirect Component
  const RootRedirect = () => {
    return <Navigate to={isAdminMode ? "/parent" : "/child"} replace />;
  };

  // Protected Route for Parent
  const ParentRoute = ({ children }: { children: ReactNode }) => {
    if (!isAdminMode) {
      return <Navigate to="/child" replace />;
    }
    return children;
  };

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<RootRedirect />} />

        <Route path="/parent" element={
          <ParentRoute>
            <PageTransition>
              <Dashboard />
            </PageTransition>
          </ParentRoute>
        } />

        <Route path="/child" element={
          <PageTransition>
            <Dashboard />
          </PageTransition>
        } />

        <Route path="/tasks" element={
          <PageTransition>
            <Tasks />
          </PageTransition>
        } />
        <Route path="/admin/tasks/new" element={
          <PageTransition>
            <AdminTaskForm />
          </PageTransition>
        } />
        <Route path="/admin/tasks/:id/edit" element={
          <PageTransition>
            <AdminTaskForm />
          </PageTransition>
        } />


        <Route path="/rewards" element={
          <PageTransition>
            <Rewards />
          </PageTransition>
        } />
        <Route path="/admin/rewards/new" element={
          <PageTransition>
            <AdminRewardForm />
          </PageTransition>
        } />
        <Route path="/admin/rewards/:id/edit" element={
          <PageTransition>
            <AdminRewardForm />
          </PageTransition>
        } />

        <Route path="/stats" element={
          <PageTransition>
            <Stats />
          </PageTransition>
        } />
        <Route path="/settings" element={
          <PageTransition>
            <Settings />
          </PageTransition>
        } />
        <Route path="/privacy" element={
          <PageTransition>
            <Privacy />
          </PageTransition>
        } />
        <Route path="/terms" element={
          <PageTransition>
            <Terms />
          </PageTransition>
        } />
        <Route path="/playground" element={
          <PageTransition>
            <Playground />
          </PageTransition>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
};

export default App;
