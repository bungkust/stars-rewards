import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import AdminPinModal from '../modals/AdminPinModal';

interface LayoutProps {
  children: ReactNode;
  onChildSelect?: () => void;
}

const Layout = ({ children, onChildSelect }: LayoutProps) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-base-100">
      <Header
        onParentLoginClick={() => setIsPinModalOpen(true)}
        onSettingsClick={() => navigate('/settings')}
        onChildSelectClick={onChildSelect}
      />

      <main className="flex-1 p-4 pt-28 pb-36 overflow-y-auto">
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

