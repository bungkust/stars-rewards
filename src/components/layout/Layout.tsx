import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import AdminPinModal from '../modals/AdminPinModal';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header
        onParentLoginClick={() => setIsPinModalOpen(true)}
        onSettingsClick={() => navigate('/settings')}
      />
      
      <main className="flex-1 p-4 pb-24 overflow-y-auto">
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

export default Layout;

