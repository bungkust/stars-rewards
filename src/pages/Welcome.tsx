import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RestoreDataModal from '../components/modals/RestoreDataModal';
import { LandingHero } from '../components/landing/LandingHero';
import { LandingFeatures } from '../components/landing/LandingFeatures';
import { LandingFooter } from '../components/landing/LandingFooter';

const Welcome = () => {
  const navigate = useNavigate();
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

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
