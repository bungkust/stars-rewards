import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';
import { PrimaryButton } from '../components/design-system/PrimaryButton';
import RestoreDataModal from '../components/modals/RestoreDataModal';

// FR 2.1: Data Positioning Mockup
const APP_MOCK_DATA = {
    core_value: "Responsibility, Habit, & Reward",
    target_age: "5-9 Years Old",
    star_value_rp: 500,
};

const Welcome = () => {
    const navigate = useNavigate();
    const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-base-100 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-white opacity-50" />

            {/* Decorative Circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -left-20 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col flex-1 justify-center p-6 max-w-md mx-auto w-full gap-8">
                {/* FR 1.1a: Visual Header (Top 1/3) */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-400 blur-xl opacity-40 animate-pulse" />
                        <div className="relative w-32 h-32 bg-gradient-to-br from-blue-300 to-blue-500 rounded-3xl rotate-3 flex items-center justify-center shadow-xl border-4 border-white">
                            <Star weight="fill" className="text-white w-20 h-20 drop-shadow-md" />
                        </div>
                    </div>
                </div>

                {/* FR 1.1b: Introduction/Value Prop */}
                <div className="flex-none text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                            Star Habit
                        </h1>
                        <div className="h-1 w-16 bg-primary mx-auto rounded-full" />
                    </div>

                    <p className="text-lg text-slate-600 leading-relaxed px-4">
                        Turn daily chores into <span className="font-bold text-blue-500">Stars</span>!
                        <br />
                        Build <span className="font-bold text-primary">{APP_MOCK_DATA.core_value}</span>.
                    </p>
                </div>

                {/* FR 1.1c & 1.2: Call to Action Area */}
                <div className="flex-none space-y-4 w-full">
                    {/* FR 1.2a: Primary Option */}
                    <PrimaryButton
                        onClick={() => navigate('/onboarding/family-setup')}
                        className="w-full text-lg py-4 h-auto min-h-0 rounded-2xl shadow-xl shadow-primary/20 transform transition active:scale-95 border-none flex justify-center items-center"
                    >
                        Start New Family
                    </PrimaryButton>

                    {/* FR 1.2b: Secondary Option */}
                    <button
                        onClick={() => setIsRestoreModalOpen(true)}
                        className="btn btn-ghost w-full text-slate-400 hover:bg-slate-50 hover:text-slate-600 rounded-2xl normal-case text-lg font-medium transition-all"
                    >
                        Restore from Backup
                    </button>

                    <p className="text-xs text-center text-slate-300 pt-4">
                        v1.0.0 • Designed for Kids {APP_MOCK_DATA.target_age}
                    </p>
                </div>
            </div>

            <RestoreDataModal
                isOpen={isRestoreModalOpen}
                onClose={() => setIsRestoreModalOpen(false)}
                onSuccess={() => navigate('/')}
            />
        </div>
    );
};

export default Welcome;
