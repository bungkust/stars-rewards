import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { useAppStore } from './store/useAppStore';
import MobileLayout from './components/layout/MobileLayout';
import ChildSelectorModal from './components/modals/ChildSelectorModal';
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
import FamilySetup from './pages/onboarding/FamilySetup'; 
import ParentSetup from './pages/onboarding/ParentSetup'; 
import AddParent from './pages/onboarding/AddParent'; 
import AddChild from './pages/onboarding/AddChild';
import FirstTask from './pages/onboarding/FirstTask';
import FirstReward from './pages/onboarding/FirstReward';
import { PageTransition } from './components/design-system/Animations';

// Wrapper to handle route transitions
const AnimatedRoutes = ({ isAdminMode, activeChildId }: { isAdminMode: boolean, activeChildId: string | null }) => {
  const location = useLocation();

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
            
            {/* Protect admin routes from non-admin users */}
            <Route path="/admin/*" element={<Navigate to="/" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    </AnimatePresence>
  );
};

function App() {
  const { activeChildId, setActiveChild, isAdminMode, onboardingStep, session, refreshData } = useAppStore();
  const [isChildSelectorOpen, setIsChildSelectorOpen] = useState(false);

  const isAuthenticated = !!session;
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
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding/parent-setup" element={<ParentSetup />} /> 
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
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
          
          {/* Fallback logic based on current step in store */}
          <Route path="*" element={<OnboardingRedirect step={onboardingStep} />} />
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
