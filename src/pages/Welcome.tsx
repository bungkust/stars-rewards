import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestoreDataModal from '../components/modals/RestoreDataModal';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingFooter } from '../components/landing/LandingFooter';

import { Capacitor } from '@capacitor/core';
import { AppWelcome } from '../components/landing/AppWelcome';

const Welcome = () => {
  const navigate = useNavigate();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isNative || isLocal) {
    return (
      <>
        <AppWelcome onRestore={() => setIsRestoreModalOpen(true)} />
        <RestoreDataModal
          isOpen={isRestoreModalOpen}
          onClose={() => setIsRestoreModalOpen(false)}
          onSuccess={() => navigate('/')}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <LandingHero />
      <LandingFeatures />
      <LandingFooter />

      <RestoreDataModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        onSuccess={() => navigate('/')}
      />
    </div>
  );
};

export default Welcome;
