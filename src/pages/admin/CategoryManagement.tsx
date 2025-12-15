import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrash, FaArrowLeft } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { useAppStore } from '../../store/useAppStore';
import { AlertModal } from '../../components/design-system';
import { ICON_MAP, ICON_OPTIONS } from '../../utils/icons';

const CategoryManagement = () => {
    const navigate = useNavigate();
    const { categories, addCategory, updateCategory, deleteCategory } = useAppStore();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', icon: 'soap' });
    const [error, setError] = useState<string | null>(null);

    const handleEditClick = (cat: any) => {
        setSelectedCategory(cat.id);
        setFormData({ name: cat.name, icon: cat.icon });
        setIsEditModalOpen(true);
        setError(null);
    };

    const handleAddClick = () => {
        setSelectedCategory(null);
        setFormData({ name: '', icon: 'soap' });
        setIsEditModalOpen(true);
        setError(null);
    };

    const handleDeleteClick = (catId: string) => {
        setSelectedCategory(catId);
        setIsDeleteModalOpen(true);
        setError(null);
    };

    const handleSubmit = async () => {
        if (!formData.name.trim()) return;

        // Check for duplicates
        const isDuplicate = categories.some(c =>
            c.name.toLowerCase() === formData.name.trim().toLowerCase() &&
            c.id !== selectedCategory
        );

        if (isDuplicate) {
            setError('Category name already exists');
            return;
        }

        if (selectedCategory) {
            const res = await updateCategory(selectedCategory, formData);
            if (res.error) {
                setError('Failed to update category');
                return;
            }
        } else {
            const res = await addCategory(formData);
            if (res.error) {
                setError('Failed to create category');
                return;
            }
        }
        setIsEditModalOpen(false);
    };

    const handleDeleteConfirm = async () => {
        if (selectedCategory) {
            const res = await deleteCategory(selectedCategory);
            if (res.error) {
                // Show error in a toast or alert? For now, we keep the modal open or show alert
                // But AlertModal doesn't support showing error easily after confirm.
                // We'll rely on the error state if we were inside the modal, but here we are closing it.
                // Let's use window.alert for simplicity if it fails due to dependency
                alert(res.error.message || 'Failed to delete category. It might be in use.');
            }
        }
        setIsDeleteModalOpen(false);
    };

    return (
        <div className="relative min-h-full pb-20 flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="btn btn-circle btn-ghost btn-sm">
                    <FaArrowLeft />
                </button>
                <H1Header>Categories</H1Header>
            </div>

            <div className="grid gap-4">
                {categories.map((cat) => {
                    const Icon = ICON_MAP[cat.icon] || ICON_MAP['default'];
                    return (
                        <AppCard key={cat.id} className="flex flex-row items-center gap-4 !p-4">
                            <div className="p-3 rounded-lg bg-base-200 text-neutral">
                                <Icon className="text-xl" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-neutral">{cat.name}</h3>
                                {cat.is_default && (
                                    <span className="text-xs text-neutral/50 bg-base-200 px-2 py-0.5 rounded-full">Default</span>
                                )}
                            </div>
                            <div className="flex gap-2">
                                {!cat.is_default && (
                                    <>
                                        <button
                                            className="btn btn-ghost btn-sm btn-circle text-neutral/40"
                                            onClick={() => handleEditClick(cat)}
                                        >
                                            <FaPencilAlt />
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm btn-circle text-error"
                                            onClick={() => handleDeleteClick(cat.id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </>
                                )}
                                {cat.is_default && (
                                    <button
                                        className="btn btn-ghost btn-sm btn-circle text-neutral/40"
                                        onClick={() => handleEditClick(cat)}
                                    >
                                        <FaPencilAlt />
                                    </button>
                                )}
                            </div>
                        </AppCard>
                    );
                })}
            </div>

            <WarningCTAButton onClick={handleAddClick}>
                <FaPlus className="w-6 h-6" />
                <span className="ml-2 hidden sm:inline">Add Category</span>
            </WarningCTAButton>

            {/* Edit/Add Modal */}
            {isEditModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">{selectedCategory ? 'Edit Category' : 'New Category'}</h3>

                        <div className="form-control w-full mb-4">
                            <label className="label">
                                <span className="label-text font-bold">Name</span>
                            </label>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        <div className="form-control w-full mb-6">
                            <label className="label">
                                <span className="label-text font-bold">Icon</span>
                            </label>
                            <div className="grid grid-cols-5 gap-2">
                                {ICON_OPTIONS.map((iconKey) => {
                                    const Icon = ICON_MAP[iconKey];
                                    return (
                                        <button
                                            key={iconKey}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, icon: iconKey })}
                                            className={`p-2 rounded-lg flex items-center justify-center border ${formData.icon === iconKey ? 'border-primary bg-primary/10 text-primary' : 'border-gray-200'
                                                }`}
                                        >
                                            <Icon />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {error && <p className="text-error text-sm mb-4">{error}</p>}

                        <div className="modal-action">
                            <button className="btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
                        </div>
                    </div>
                </div>
            )}

            <AlertModal
                isOpen={isDeleteModalOpen}
                title="Delete Category"
                message="Are you sure you want to delete this category?"
                confirmText="Delete"
                type="danger"
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default CategoryManagement;
