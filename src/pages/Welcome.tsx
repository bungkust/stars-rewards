import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/design-system/PrimaryButton';
import { SecondaryButton } from '../components/design-system/SecondaryButton';
import { H1Header } from '../components/design-system/H1Header';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
      <div className="w-full max-w-md text-center space-y-8">
        
        {/* Logo / Branding */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary text-4xl">
            ⭐
          </div>
          <H1Header className="text-4xl text-primary">Stars Rewards</H1Header>
          <p className="text-gray-500 text-lg">
            Make habits fun for your family.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 w-full">
          <PrimaryButton onClick={() => navigate('/onboarding/parent-setup')}>
            Get Started (Sign Up)
          </PrimaryButton>
          
          <SecondaryButton 
            className="rounded-xl shadow-sm"
            onClick={() => navigate('/login')}
          >
            I already have an account
          </SecondaryButton>
        </div>

      </div>
    </div>
  );
};

export default Welcome;

