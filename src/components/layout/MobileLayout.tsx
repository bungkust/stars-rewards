import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import AdminPinModal from '../modals/AdminPinModal';
import { useAppStore } from '../../store/useAppStore';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const navigate = useNavigate();
  const { isAdminMode } = useAppStore();
  const backgroundClass = isAdminMode ? 'admin-gradient' : 'app-gradient';

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} font-sans text-neutral`}>
      <Header
        onParentLoginClick={() => setIsPinModalOpen(true)}
        onSettingsClick={() => navigate('/settings')}
      />
      
      <main className="flex-1 w-full pt-24 pb-24 px-4 overflow-y-auto scroll-smooth">
        {children}
      </main>

      <BottomNav />

      <AdminPinModal 
        isOpen={isPinModalOpen} 
        onClose={() => setIsPinModalOpen(false)} 
      />
    </div>
  );
};

export default MobileLayout;
