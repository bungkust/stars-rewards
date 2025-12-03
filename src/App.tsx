import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from './store/useAppStore';
import { supabase } from './utils/supabase';
import MobileLayout from './components/layout/MobileLayout';
import ChildSelectorModal from './components/modals/ChildSelectorModal';
import SessionExpiredModal from './components/modals/SessionExpiredModal';
import Settings from './pages/settings/Settings';
import ChildDashboard from './pages/child/ChildDashboard';
import ChildTasks from './pages/child/ChildTasks';
import ChildRewards from './pages/child/ChildRewards';
import ChildStats from './pages/child/ChildStats';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTasks from './pages/admin/AdminTasks';
import AdminTaskForm from './pages/admin/AdminTaskForm';
import AdminRewards from './pages/admin/AdminRewards';
import AdminRewardForm from './pages/admin/AdminRewardForm';
import AdminStats from './pages/admin/AdminStats'; 
import Welcome from './pages/Welcome';
import Login from './pages/auth/Login';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import FamilySetup from './pages/onboarding/FamilySetup'; 
import ParentSetup from './pages/onboarding/ParentSetup'; 
import AddParent from './pages/onboarding/AddParent'; 
import AddChild from './pages/onboarding/AddChild';
import FirstTask from './pages/onboarding/FirstTask';
import FirstReward from './pages/onboarding/FirstReward';
import { PageTransition } from './components/design-system/Animations';

// Wrapper to handle route transitions and deep linking
const AnimatedRoutes = ({ isAdminMode, activeChildId }: { isAdminMode: boolean, activeChildId: string | null }) => {
  const location = useLocation();
  const { refreshData, session } = useAppStore();

  // Handle deep links for mobile app
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      // TODO: Implement deep linking after @capacitor/app plugin is installed
      // For now, reset password flow works through manual navigation
      console.log('Deep linking will be implemented after @capacitor/app plugin installation');
    }
  }, []);

  useEffect(() => {
    if (session) {
      refreshData();
    }
  }, [location.pathname, session, refreshData]);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {isAdminMode ? (
          // ADMIN ROUTES
          <>
            <Route path="/admin/dashboard" element={<PageTransition><AdminDashboard /></PageTransition>} />
            <Route path="/admin/tasks" element={<PageTransition><AdminTasks /></PageTransition>} />
            <Route path="/admin/tasks/new" element={<PageTransition><AdminTaskForm /></PageTransition>} />
            <Route path="/admin/tasks/:id/edit" element={<PageTransition><AdminTaskForm /></PageTransition>} />
            <Route path="/admin/rewards" element={<PageTransition><AdminRewards /></PageTransition>} />
            <Route path="/admin/rewards/new" element={<PageTransition><AdminRewardForm /></PageTransition>} />
            <Route path="/admin/rewards/:id/edit" element={<PageTransition><AdminRewardForm /></PageTransition>} />
            <Route path="/admin/stats" element={<PageTransition><AdminStats /></PageTransition>} />
            <Route path="/settings" element={<PageTransition><Settings /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

            {/* Redirect root to admin dashboard if in admin mode */}
            <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </>
        ) : (
          // CHILD ROUTES
          <>
            <Route path="/" element={activeChildId ? <PageTransition><ChildDashboard /></PageTransition> : <div />} />
            <Route path="/tasks" element={<PageTransition><ChildTasks /></PageTransition>} />
            <Route path="/rewards" element={<PageTransition><ChildRewards /></PageTransition>} />
            <Route path="/stats" element={<PageTransition><ChildStats /></PageTransition>} />
            <Route path="/reset-password" element={<PageTransition><ResetPassword /></PageTransition>} />
            <Route path="/forgot-password" element={<PageTransition><ForgotPassword /></PageTransition>} />

            {/* Protect admin routes from non-admin users */}
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="/settings" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { activeChildId, setActiveChild, isAdminMode, onboardingStep, session, refreshData, isLoading, userProfile, sessionExpired, setSessionExpired } = useAppStore();
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isAuthenticated = !!session;

  // Use onboarding_step from database profile, fallback to local state if not loaded yet
  const currentOnboardingStep = userProfile?.onboarding_step || onboardingStep;
  const needsOnboarding = isAuthenticated && currentOnboardingStep !== 'completed';

  // Auth state is now managed by onAuthStateChange listener in the store
  // No need for manual initialization

  // Debug logging
  console.log('App render:', {
    isAuthenticated,
    needsOnboarding,
    onboardingStep,
    activeChildId,
    isAdminMode,
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'unknown'
  });

  // Check for active child on mount
  useEffect(() => {
    if (isAuthenticated && !needsOnboarding && !activeChildId && !isAdminMode) {
      setIsChildSelectorOpen(true);
    } else {
      setIsChildSelectorOpen(false);
    }

    // Configure StatusBar
    if (Capacitor.isNativePlatform()) {
      StatusBar.setOverlaysWebView({ overlay: false }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#F0F9FF' }).catch(() => {}); // Light blue to match app theme
      StatusBar.setStyle({ style: Style.Light }).catch(() => {}); // Dark icons for light background
    }
  }, [activeChildId, isAdminMode, needsOnboarding, isAuthenticated]);

  // Fetch Data on Mount if Authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  // MODE SWITCHING: Force token refresh and data sync
  useEffect(() => {
    const handleModeSwitch = async () => {
      if (!session) {
        console.log('🚫 Mode switch skipped: no active session');
        return; // Exit if not logged in
      }

      console.log(`🔄 MODE SWITCH DETECTED: ${isAdminMode ? 'ADMIN' : 'CHILD'} mode activated`);
      setIsRefreshing(true);
      console.log(`⏳ Starting mode switch process for: ${isAdminMode ? 'ADMIN' : 'CHILD'}`);

      try {
        // --- STEP 1: FORCE TOKEN REFRESH & VALIDATION ---
        console.log('🔐 Validating session and refreshing token...');
        const { data: { session: newSession }, error: refreshError } = await supabase.auth.getSession();

        if (refreshError || !newSession) {
          console.error('❌ Token refresh failed during mode switch:', refreshError);
          // If refresh fails, token refresh is dead -> Force logout
          await useAppStore.getState().logout();
          return; // Don't set isRefreshing false here as we're navigating away
        }

        console.log('✅ Token refresh successful, proceeding with data sync');

        // --- STEP 2: FETCH MODE-SPECIFIC DATA (SYNC) ---
        console.log('📊 Starting data synchronization for mode:', isAdminMode ? 'ADMIN' : 'CHILD');

        if (isAdminMode) {
          // CRITICAL ADMIN DATA: Pending verification queue
          console.log('📋 Syncing admin data: pending verifications');
          await refreshData(); // This will fetch pendingVerifications and other admin data
        } else {
          // CRITICAL CHILD DATA: Child's daily tasks and progress
          console.log('👶 Syncing child data: daily tasks and progress');
          await refreshData(); // This will fetch child-specific data including tasks and logs
        }

        console.log('✅ Mode switch data sync completed successfully');
      } catch (error) {
        console.error('❌ Error during mode switch data sync:', error);
        console.error('🚨 Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        // Don't force logout here, just log the error
        // User can try again or data will sync on next mode switch
      } finally {
        // Only set refreshing to false if we didn't logout (navigation away)
        if (session) {
          setIsRefreshing(false);
          console.log(`✅ MODE SWITCH COMPLETED: ${isAdminMode ? 'ADMIN' : 'CHILD'} mode ready`);
        } else {
          console.log('🚪 MODE SWITCH CANCELLED: user logged out during process');
        }
      }
    };

    handleModeSwitch();
  }, [isAdminMode, session]); // Run when mode or session changes

  const handleChildSelect = (childId: string) => {
    setActiveChild(childId);
    setIsChildSelectorOpen(false);
  };

  const handleSessionExpiredLogin = () => {
    setSessionExpired(false);
    window.location.href = '/login';
  };

  // Show loading spinner while auth state is being determined or mode is switching
  if ((isLoading && !session && !isAuthenticated) || isRefreshing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isRefreshing ? 'Menyinkronkan data terbaru...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Unauthenticated Router
  if (!isAuthenticated) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/onboarding/parent-setup" element={<ParentSetup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }


  // Special case: Allow reset-password for authenticated users
  // This handles password reset links clicked while logged in
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/reset-password')) {
    return <ResetPassword />;
  }

  // Authenticated but incomplete onboarding
  if (needsOnboarding) {
    return (
      <Router>
        <Routes>
          <Route path="/onboarding/family-setup" element={<FamilySetup />} />
          <Route path="/onboarding/add-parent" element={<AddParent />} />
          <Route path="/onboarding/add-child" element={<AddChild />} />
          <Route path="/onboarding/first-task" element={<FirstTask />} />
          <Route path="/onboarding/first-reward" element={<FirstReward />} />
          
          {/* Explicit redirects for flow enforcement */}
          <Route path="/onboarding/parent-setup" element={<Navigate to="/onboarding/family-setup" replace />} />
          
          {/* Fallback logic based on current step from database */}
          <Route path="*" element={<OnboardingRedirect step={currentOnboardingStep} />} />
        </Routes>
      </Router>
    );
  }

  // Fully Authenticated App
  return (
    <Router>
      <MobileLayout>
        <AnimatedRoutes isAdminMode={isAdminMode} activeChildId={activeChildId} />
      </MobileLayout>
      
      {/* Child Selector Modal (Global Guard) */}
      <ChildSelectorModal 
        isOpen={isChildSelectorOpen && !isAdminMode} 
        onSelect={handleChildSelect} 
      />

      {/* Session Expired Modal (Global - shows when session dies) */}
      <SessionExpiredModal
        isOpen={sessionExpired}
        onLogin={handleSessionExpiredLogin}
      />
    </Router>
  );
}

// Helper component to redirect based on step
const OnboardingRedirect = ({ step }: { step: string }) => {
  switch (step) {
    case 'family-setup': return <Navigate to="/onboarding/family-setup" replace />;
    case 'parent-setup': return <Navigate to="/onboarding/add-parent" replace />; // Map old step name if legacy
    case 'add-parent': return <Navigate to="/onboarding/add-parent" replace />; // New Step
    case 'add-child': return <Navigate to="/onboarding/add-child" replace />;
    case 'first-task': return <Navigate to="/onboarding/first-task" replace />;
    case 'first-reward': return <Navigate to="/onboarding/first-reward" replace />;
    default: return <Navigate to="/onboarding/family-setup" replace />;
  }
};

export default App;
