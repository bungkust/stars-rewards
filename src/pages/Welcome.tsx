import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../components/design-system/PrimaryButton';
import RestoreDataModal from '../components/modals/RestoreDataModal';

const Welcome = () => {
    const navigate = useNavigate();
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center app-gradient p-6">
            <div className="w-full max-w-md text-center space-y-8">

                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-primary">Stars Rewards</h1>
                    <p className="text-gray-500 text-lg">Manage chores and rewards for your family.</p>
                </div>

                <div className="space-y-4">
                    <PrimaryButton
                        onClick={() => navigate('/onboarding/family-setup')}
                        className="w-full text-lg py-4 rounded-xl shadow-lg"
                    >
                        Create New Family
                    </PrimaryButton>

                    <button
                        onClick={() => setIsRestoreModalOpen(true)}
                        className="w-full py-4 text-primary font-bold bg-white/50 hover:bg-white/80 rounded-xl transition-all"
                    >
                        Restore from Backup
                    </button>
                </div>

                <RestoreDataModal
                    isOpen={isRestoreModalOpen}
                    onClose={() => setIsRestoreModalOpen(false)}
                    onSuccess={() => navigate('/')}
                />
            </div>
        </div>
    );
};

export default Welcome;
