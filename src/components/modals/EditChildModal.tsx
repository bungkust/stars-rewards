import { useState, useEffect } from 'react';
import { PrimaryButton } from '../design-system/PrimaryButton';
import { downloadAvatarAsDataUri } from '../../utils/avatarUtils';
import type { Child } from '../../types';

interface EditChildModalProps {
    isOpen: boolean;
    onClose: () => void;
    child: Child;
    onSave: (childId: string, updates: Partial<Child>) => Promise<void>;
    onDelete: (childId: string) => Promise<void>;
}

const AVATAR_OPTIONS = [
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Felix',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Aneka',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Bella',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Milo',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Sofia',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Leo',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Zoe',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Ryan',
    'https://api.dicebear.com/9.x/adventurer/svg?seed=Luna',
];

const EditChildModal = ({ isOpen, onClose, child, onSave, onDelete }: EditChildModalProps) => {
    const [name, setName] = useState(child.name);
    const [dob, setDob] = useState(child.birth_date || '');
    const [selectedAvatar, setSelectedAvatar] = useState(child.avatar_url);
    const [isEditingAvatar, setIsEditingAvatar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Sync state when child prop changes
    useEffect(() => {
        if (isOpen) {
            setName(child.name);
            setDob(child.birth_date || '');
            setSelectedAvatar(child.avatar_url);
            setIsEditingAvatar(false);
            setIsDeleting(false);
        }
    }, [child, isOpen]);

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        try {
            let avatarToSave = selectedAvatar;

            // If avatar is from dicebear (remote), convert to data URI for offline support
            if (selectedAvatar.startsWith('http')) {
                avatarToSave = await downloadAvatarAsDataUri(selectedAvatar);
            }

            await onSave(child.id, {
                name: name.trim(),
                birth_date: dob,
                avatar_url: avatarToSave
            });
            onClose();
        } catch (error) {
            console.error("Failed to update child", error);
            alert("Failed to save changes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (confirm(`Are you sure you want to delete ${child.name}? This action cannot be undone.`)) {
            setIsDeleting(true);
            try {
                await onDelete(child.id);
                onClose();
            } catch (error) {
                console.error("Failed to delete child", error);
                alert("Failed to delete child");
            } finally {
                setIsDeleting(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost z-10"
                >
                    ✕
                </button>

                <div className="p-6 text-center overflow-y-auto">
                    <h3 className="text-xl font-bold text-neutral mb-6">Edit Child Profile</h3>

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4 mb-6">
                        <div className="relative group cursor-pointer" onClick={() => setIsEditingAvatar(!isEditingAvatar)}>
                            <div className="avatar">
                                <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                    <img src={selectedAvatar} alt="Selected Avatar" />
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-bold">Change</span>
                            </div>
                        </div>

                        {isEditingAvatar && (
                            <div className="grid grid-cols-5 gap-2 w-full justify-items-center bg-base-200 p-2 rounded-xl">
                                {AVATAR_OPTIONS.map((avatar) => (
                                    <button
                                        key={avatar}
                                        type="button"
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`w-8 h-8 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === avatar ? 'border-primary scale-110 shadow-md' : 'border-transparent hover:border-base-300'}`}
                                    >
                                        <img src={avatar} alt="avatar option" loading="lazy" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Form Fields */}
                    <div className="flex flex-col gap-4 text-left">
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-neutral/70">Name</span>
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="input input-bordered w-full rounded-xl"
                                placeholder="Child Name"
                            />
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text font-bold text-neutral/70">Date of Birth</span>
                            </label>
                            <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="input input-bordered w-full rounded-xl"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                        <PrimaryButton
                            onClick={handleSave}
                            disabled={isLoading || !name.trim()}
                            className="w-full rounded-xl"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </PrimaryButton>

                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || isLoading}
                            className="btn btn-ghost text-error hover:bg-error/10 w-full"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Profile'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditChildModal;
