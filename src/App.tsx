import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
// Main App Component
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { useAppStore } from './store/useAppStore';

// Pages
import Dashboard from './pages/Dashboard';
import Tasks from './pages/Tasks';
import Rewards from './pages/Rewards';
import Stats from './pages/Stats';
import ClaimedRewardsHistory from './pages/child/ClaimedRewardsHistory';
import ChildHistory from './pages/child/ChildHistory';
import ChildLoyalty from './pages/child/ChildLoyalty';

import Settings from './pages/settings/Settings';
import AddChild from './pages/onboarding/AddChild';
import AddChildSettings from './pages/settings/AddChildSettings';
import SecuritySettings from './pages/settings/SecuritySettings';
import FamilySetup from './pages/onboarding/FamilySetup';
import FirstTask from './pages/onboarding/FirstTask';
import FirstReward from './pages/onboarding/FirstReward';
import Welcome from './pages/Welcome';
import AdminTaskForm from './pages/admin/AdminTaskForm';
import AdminRewardForm from './pages/admin/AdminRewardForm';
import CategoryManagement from './pages/admin/CategoryManagement';
import AdminHistory from './pages/admin/AdminHistory';
import AdminLoyalty from './pages/admin/AdminLoyalty';
import AdminStreakForm from './pages/admin/AdminStreakForm';

import Privacy from './pages/legal/Privacy';
import Terms from './pages/legal/Terms';
import Playground from './pages/Playground'; // Design System Verification

// Components
import Layout from './components/layout/Layout';
import ChildSelector from './components/ChildSelector';
import { notificationService } from './services/notificationService';
import StreakCelebrationModal from './components/modals/StreakCelebrationModal';
import ReviewPromptModal from './components/modals/ReviewPromptModal';
import LevelUpModal from './components/modals/LevelUpModal';
import ForceUpdateModal from './components/modals/ForceUpdateModal';
import AdminPinModal from './components/modals/AdminPinModal';
import { LockKey } from '@phosphor-icons/react';
import { browserService } from './services/browserService';
import { getReviewUrl } from './utils/reviewPromptUtils';

function App() {
  const {
    activeChildId,
    setActiveChild,
    isAdminMode,
    onboardingStep,
    userProfile,
    refreshData,
    fetchUserProfile,
    requestReviewPrompt,
    checkAppVersion
  } = useAppStore();
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Initial Auth Check
  useEffect(() => {
    const initAuth = async () => {
      await fetchUserProfile();
      setIsCheckingAuth(false);

      // Initialize Notifications (Check/Request Permissions)
      if (Capacitor.isNativePlatform()) {
        notificationService.init();
      }

      // Check app version status
      await checkAppVersion();
    };
    initAuth();
  }, [fetchUserProfile, checkAppVersion]);

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
      StatusBar.setOverlaysWebView({ overlay: true }).catch(() => { });
      StatusBar.setStyle({ style: Style.Dark }).catch(() => { });
    }

    // Listen for App Resume (Foreground)
    // This ensures we re-check daily missions if the app was left open overnight
    const setupAppListener = async () => {
      await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
        if (isActive && isAuthenticated) {
          console.log('App resumed, refreshing data...');
          refreshData();
          checkAppVersion();
          requestReviewPrompt('app_launch');
        }
      });
    };
    setupAppListener();

    return () => {
      CapacitorApp.removeAllListeners();
    };
  }, [activeChildId, isAdminMode, needsOnboarding, isAuthenticated, isCheckingAuth, refreshData, requestReviewPrompt]);

  // Fetch Data on Mount if Authenticated
  useEffect(() => {
    if (!isCheckingAuth && isAuthenticated) {
      refreshData();
      requestReviewPrompt('app_launch');
    }
  }, [isAuthenticated, refreshData, isCheckingAuth, requestReviewPrompt]);

  const handleChildSelect = (childId: string) => {
    setActiveChild(childId);
    setIsChildSelectorOpen(false);
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-100 gap-4">
        <span className="loading loading-spinner loading-lg text-primary"></span>
        <p className="text-neutral/60 font-medium animate-pulse">Initializing...</p>
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

// Root Redirect Component
const RootRedirect = () => {
  const isAdminMode = useAppStore(state => state.isAdminMode);
  return <Navigate to={isAdminMode ? "/parent" : "/child"} replace />;
};

// Protected Route for Parent
const ParentRoute = ({ children }: { children: ReactNode }) => {
  const { isAdminMode, parentPin, userProfile, parentPattern, toggleAdminMode } = useAppStore();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  // If no security PIN or pattern is configured, automatically allow parent mode
  useEffect(() => {
    if (!isAdminMode && !parentPin && !userProfile?.pin_admin && !parentPattern) {
      toggleAdminMode(true);
    }
  }, [isAdminMode, parentPin, userProfile, parentPattern, toggleAdminMode]);

  if (!isAdminMode) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center gap-4 animate-fade-in">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-sm">
          <LockKey size={34} weight="duotone" />
        </div>
        <div className="max-w-xs">
          <h2 className="text-xl font-bold text-neutral">Parent Access Required</h2>
          <p className="text-xs text-neutral/60 mt-1">
            Please authenticate with your PIN to access parent controls, streaks, and milestone rewards.
          </p>
        </div>
        <button
          onClick={() => setIsPinModalOpen(true)}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-6 shadow-md border-none active:scale-95 transition-transform"
        >
          Unlock Parent Mode
        </button>
        <AdminPinModal
          isOpen={isPinModalOpen}
          onClose={() => setIsPinModalOpen(false)}
          onSuccess={() => setIsPinModalOpen(false)}
        />
      </div>
    );
  }

  return <>{children}</>;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const {
    isAdminMode,
    streakMilestone,
    clearStreakMilestone,
    levelUpMilestone,
    clearLevelUpMilestone,
    reviewPromptVisible,
    closeReviewPrompt,
    updateModalState,
    closeUpdateModal
  } = useAppStore();

  const handleRateNow = async () => {
    closeReviewPrompt('rated');
    await browserService.openUrl(getReviewUrl());
  };

  // Apply Global Theme
  useEffect(() => {
    // Allow Playground to manage its own theme
    if (location.pathname === '/playground') return;

    const theme = isAdminMode ? 'parentTheme' : 'childTheme';
    document.documentElement.setAttribute('data-theme', theme);
  }, [isAdminMode, location.pathname]);

  return (
    <>
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
          <Route path="/parent/tasks" element={
            <ParentRoute>
              <PageTransition>
                <Tasks />
              </PageTransition>
            </ParentRoute>
          } />
          <Route path="/parent/loyalty" element={
            <ParentRoute>
              <PageTransition>
                <AdminLoyalty />
              </PageTransition>
            </ParentRoute>
          } />
          <Route path="/parent/rewards" element={
            <ParentRoute>
              <PageTransition>
                <Rewards />
              </PageTransition>
            </ParentRoute>
          } />
          <Route path="/parent/stats" element={
            <ParentRoute>
              <PageTransition>
                <Stats />
              </PageTransition>
            </ParentRoute>
          } />
          <Route path="/parent/history" element={
            <ParentRoute>
              <PageTransition>
                <AdminHistory />
              </PageTransition>
            </ParentRoute>
          } />

          <Route path="/child" element={
            <PageTransition>
              <Dashboard />
            </PageTransition>
          } />
          <Route path="/child/tasks" element={
            <PageTransition>
              <Tasks />
            </PageTransition>
          } />
          <Route path="/child/rewards" element={
            <PageTransition>
              <Rewards />
            </PageTransition>
          } />
          <Route path="/child/stats" element={
            <PageTransition>
              <Stats />
            </PageTransition>
          } />

          <Route path="/child/claimed-rewards" element={
            <PageTransition>
              <ClaimedRewardsHistory />
            </PageTransition>
          } />
          <Route path="/child/history" element={
            <PageTransition>
              <ChildHistory />
            </PageTransition>
          } />
          <Route path="/child/loyalty" element={
            <PageTransition>
              <ChildLoyalty />
            </PageTransition>
          } />

          {/* Legacy & Friendly Route Aliases */}
          <Route path="/parent/mission" element={<Navigate to="/parent/tasks" replace />} />
          <Route path="/mission" element={<Navigate to={isAdminMode ? "/parent/tasks" : "/child/tasks"} replace />} />
          <Route path="/tasks" element={<Navigate to={isAdminMode ? "/parent/tasks" : "/child/tasks"} replace />} />
          <Route path="/rewards" element={<Navigate to={isAdminMode ? "/parent/rewards" : "/child/rewards"} replace />} />
          <Route path="/stats" element={<Navigate to={isAdminMode ? "/parent/stats" : "/child/stats"} replace />} />

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

          <Route path="/admin/streaks/new" element={
            <ParentRoute>
              <PageTransition>
                <AdminStreakForm />
              </PageTransition>
            </ParentRoute>
          } />
          <Route path="/admin/streaks/:id/edit" element={
            <ParentRoute>
              <PageTransition>
                <AdminStreakForm />
              </PageTransition>
            </ParentRoute>
          } />

          <Route path="/admin/categories" element={
            <PageTransition>
              <CategoryManagement />
            </PageTransition>
          } />

          <Route path="/settings" element={
            <PageTransition>
              <Settings />
            </PageTransition>
          } />
          <Route path="/settings/add-child" element={
            <PageTransition>
              <AddChildSettings />
            </PageTransition>
          } />
          <Route path="/settings/security" element={
            <PageTransition>
              <SecuritySettings />
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
      {/* Force / Optional Update Modal */}
      {updateModalState && (
        <ForceUpdateModal
          isOpen={updateModalState.isOpen}
          isForce={updateModalState.isForce}
          currentVersion={updateModalState.currentVersion}
          latestVersion={updateModalState.latestVersion}
          releaseNotes={updateModalState.releaseNotes}
          storeUrl={updateModalState.storeUrl}
          onClose={closeUpdateModal}
        />
      )}

      {/* Streak Celebration (Hidden for now) */}
      {false && <StreakCelebrationModal milestone={streakMilestone} onClose={clearStreakMilestone} />}

      {/* Level Up Modal (Priority 2) - Only shown if no Force Update */}
      {!updateModalState?.isForce && (
        <LevelUpModal milestone={levelUpMilestone} onClose={clearLevelUpMilestone} />
      )}

      {/* Review Prompt Modal (Priority 4) - Only shown if no higher-priority modal active */}
      {!updateModalState?.isForce && !levelUpMilestone && (
        <ReviewPromptModal
          isOpen={reviewPromptVisible}
          onRateNow={handleRateNow}
          onMaybeLater={() => closeReviewPrompt('later')}
          onNoThanks={() => closeReviewPrompt('dismissed')}
        />
      )}
    </>
  );
};

export default App;
