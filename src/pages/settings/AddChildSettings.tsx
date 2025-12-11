import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { FaArrowLeft } from 'react-icons/fa';
import { PrimaryButton } from '../../components/design-system/PrimaryButton';
import { H1Header } from '../../components/design-system/H1Header';

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Baby',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Ginger',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Oliver',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Bella',
];

const AddChildSettings = () => {
    const navigate = useNavigate();
    const { addChild, isLoading } = useAppStore();

    const [name, setName] = useState('');
    const [dob, setDob] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const saveChild = async () => {
        setErrorMsg('');
        const { error } = await addChild({
            name,
            birth_date: dob,
            avatar_url: selectedAvatar,
        });

        if (error) {
            setErrorMsg('Failed to add child. Please try again.');
            return false;
        }
        return true;
    };

    const handleDone = async (e: React.FormEvent) => {
        e.preventDefault();

        // If form is filled, save current child first
        if (name) {
            const success = await saveChild();
            if (!success) return;
        }

        navigate('/settings');
    };

    return (
        <div className="flex flex-col gap-6 pb-24">
            <div className="flex items-center gap-2">
                <button onClick={() => navigate('/settings')} className="btn btn-ghost btn-circle btn-sm">
                    <FaArrowLeft />
                </button>
                <H1Header>Add Child</H1Header>
            </div>

            <div className="w-full max-w-md mx-auto">
                <p className="text-gray-500 text-center mb-8">Add a new profile to your family.</p>

                {successMsg && (
                    <div className="alert alert-success mb-6 shadow-sm">
                        <span>{successMsg}</span>
                    </div>
                )}

                {errorMsg && (
                    <div className="alert alert-error mb-6 shadow-sm">
                        <span>{errorMsg}</span>
                    </div>
                )}

                <form className="flex flex-col gap-6">

                    {/* Avatar Selection */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="avatar">
                            <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                <img src={selectedAvatar} alt="Selected Avatar" />
                            </div>
                        </div>
                        <div className="flex gap-3 overflow-x-auto py-2 w-full justify-center">
                            {AVATAR_OPTIONS.map((avatar) => (
                                <button
                                    key={avatar}
                                    type="button"
                                    onClick={() => setSelectedAvatar(avatar)}
                                    className={`w-10 h-10 flex-shrink-0 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-primary scale-110' : 'border-transparent'}`}
                                >
                                    <img src={avatar} alt="avatar option" />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold">Child's Name</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                setSuccessMsg('');
                                setErrorMsg('');
                            }}
                            className="input input-bordered w-full rounded-xl"
                            placeholder="e.g. Alice"
                        />
                    </div>

                    <div className="form-control w-full">
                        <label className="label">
                            <span className="label-text font-bold">Date of Birth</span>
                        </label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className="input input-bordered w-full rounded-xl text-neutral"
                        />
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <PrimaryButton
                            onClick={handleDone}
                            className="rounded-xl shadow-md text-lg font-bold"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : (name ? 'Save & Done' : 'Done')}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddChildSettings;
