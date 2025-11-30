import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import PlaceholderPage from './components/layout/PlaceholderPage';

function App() {
  const { activeChildId, setActiveChild, isAdminMode, adminPin, onboardingStep, session, refreshData } = useAppStore();
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
        <Routes>
          {isAdminMode ? (
            // ADMIN ROUTES
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/tasks" element={<AdminTasks />} />
              <Route path="/admin/tasks/new" element={<AdminTaskForm />} />
              <Route path="/admin/rewards" element={<AdminRewards />} />
              <Route path="/admin/rewards/new" element={<AdminRewardForm />} />
              <Route path="/admin/stats" element={<AdminStats />} />
              
              {/* Redirect root to admin dashboard if in admin mode */}
              <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
            </>
          ) : (
            // CHILD ROUTES
            <>
              <Route path="/" element={activeChildId ? <ChildDashboard /> : <div />} />
              <Route path="/tasks" element={<ChildTasks />} />
              <Route path="/rewards" element={<ChildRewards />} />
              <Route path="/stats" element={<ChildStats />} />
              
              {/* Protect admin routes from non-admin users */}
              <Route path="/admin/*" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
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
