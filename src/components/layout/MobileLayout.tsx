import { useState, type ReactNode } from 'react';
import Header from './Header';
import BottomNav from './BottomNav';
import AdminPinModal from '../modals/AdminPinModal';

interface MobileLayoutProps {
  children: ReactNode;
}

const MobileLayout = ({ children }: MobileLayoutProps) => {
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-blue-50 font-sans text-neutral">
      <Header onSettingsClick={() => setIsPinModalOpen(true)} />
      
      <main className="flex-1 w-full pt-16 pb-24 px-4 overflow-y-auto scroll-smooth">
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
