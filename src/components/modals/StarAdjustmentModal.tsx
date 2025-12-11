import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { FaMinus, FaPlus } from 'react-icons/fa';

interface Child {
    id: string;
    name: string;
    current_balance: number;
    avatar_url?: string;
}

interface StarAdjustmentModalProps {
    isOpen: boolean;
    childrenList: Child[];
    initialChildId?: string | null;
    onClose: () => void;
    onConfirm: (childIds: string[], amount: number, type: 'add' | 'deduct', reason: string) => void;
    isLoading?: boolean;
}

const StarAdjustmentModal = ({ isOpen, childrenList, initialChildId, onClose, onConfirm, isLoading }: StarAdjustmentModalProps) => {
    // State management for modal
    const [selectedChildIds, setSelectedChildIds] = useState<string[]>([]);
    const [amount, setAmount] = useState<string>('1');
    const [type, setType] = useState<'add' | 'deduct'>('deduct');
    const [reason, setReason] = useState('');
    const [step, setStep] = useState<'input' | 'confirm'>('input');

    // Reset state when modal opens or initialChildId changes
    useEffect(() => {
        if (isOpen) {
            if (initialChildId) {
                setSelectedChildIds([initialChildId]);
            } else {
                setSelectedChildIds([]);
            }
            setAmount('1');
            setReason('');
            setStep('input');
            setType('deduct');
        }
    }, [isOpen, initialChildId]);

    const toggleChildSelection = (childId: string) => {
        setSelectedChildIds(prev =>
            prev.includes(childId)
                ? prev.filter(id => id !== childId)
                : [...prev, childId]
        );
    };

    const handleNext = () => {
        const val = parseInt(amount);
        if (isNaN(val) || val <= 0) return;
        if (!reason.trim()) {
            alert('Please provide a reason for the adjustment.');
            return;
        }
        if (selectedChildIds.length === 0) {
            alert('Please select at least one child.');
            return;
        }
        setStep('confirm');
    };

    const handleConfirm = () => {
        const val = parseInt(amount);
        if (selectedChildIds.length > 0) {
            onConfirm(selectedChildIds, val, type, reason);
        }
        // Reset state after a slight delay or rely on unmount
        setTimeout(() => {
            setAmount('1');
            setReason('');
            setStep('input');
        }, 500);
    };

    const handleClose = () => {
        setStep('input');
        onClose();
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-base-200/95 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0"
                        >
                            <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <Dialog.Title
                                    as="h3"
                                    className="text-xl font-bold leading-6 text-gray-900 text-center mb-2"
                                >
                                    {step === 'input' ? 'Adjust Balance' : 'Confirm Adjustment'}
                                </Dialog.Title>

                                {step === 'input' ? (
                                    <>
                                        <div className="form-control w-full mb-4">
                                            <label className="label">
                                                <span className="label-text font-bold">Select Children</span>
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {childrenList.map(child => {
                                                    const isSelected = selectedChildIds.includes(child.id);
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            className={`flex items-center gap-2 p-2 rounded-xl border-2 transition-all text-left ${isSelected
                                                                    ? 'border-primary bg-primary/5'
                                                                    : 'border-transparent bg-base-100 hover:bg-base-200'
                                                                }`}
                                                            onClick={() => toggleChildSelection(child.id)}
                                                        >
                                                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-gray-300'}`}>
                                                                {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                                                            </div>
                                                            <div className="avatar">
                                                                <div className="w-6 h-6 rounded-full">
                                                                    <img src={child.avatar_url} alt={child.name} />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`text-xs font-bold ${isSelected ? 'text-primary' : 'text-gray-600'}`}>{child.name}</span>
                                                                <span className="text-[10px] text-gray-400">{child.current_balance} Stars</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        <div className="flex gap-2 mb-6 bg-base-100 p-1 rounded-xl">
                                            <button
                                                className={`flex-1 btn btn-sm ${type === 'deduct' ? 'btn-error text-white' : 'btn-ghost'}`}
                                                onClick={() => setType('deduct')}
                                            >
                                                <FaMinus className="mr-2" /> Deduct
                                            </button>
                                            <button
                                                className={`flex-1 btn btn-sm ${type === 'add' ? 'btn-success text-white' : 'btn-ghost'}`}
                                                onClick={() => setType('add')}
                                            >
                                                <FaPlus className="mr-2" /> Add
                                            </button>
                                        </div>

                                        <div className="form-control w-full mb-4">
                                            <label className="label">
                                                <span className="label-text font-bold">Amount</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="1"
                                                className="input input-bordered w-full rounded-xl text-center text-2xl font-bold"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                            />
                                        </div>

                                        <div className="form-control w-full mb-6">
                                            <label className="label">
                                                <span className="label-text font-bold">Reason</span>
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Extra chores, Misbehavior"
                                                className="input input-bordered w-full rounded-xl"
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                className="btn flex-1 rounded-xl"
                                                onClick={handleClose}
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                className="btn flex-1 rounded-xl btn-primary text-white"
                                                onClick={handleNext}
                                                disabled={isLoading}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col gap-4 animate-fade-in">
                                        <div className="bg-base-100 p-6 rounded-xl text-center">
                                            <p className="text-gray-500 text-sm mb-2">Are you sure you want to</p>
                                            <h4 className={`text-2xl font-bold mb-1 ${type === 'add' ? 'text-success' : 'text-error'}`}>
                                                {type === 'add' ? 'Add' : 'Deduct'} {amount} Stars
                                            </h4>
                                            <p className="text-gray-500 text-sm">
                                                {type === 'add' ? 'to' : 'from'} <span className="font-bold text-gray-800">{selectedChildIds.length} Children</span>?
                                            </p>
                                            <div className="divider my-3"></div>
                                            <p className="text-xs text-gray-400 uppercase font-bold mb-1">Reason</p>
                                            <p className="font-medium text-gray-700 italic">"{reason}"</p>
                                        </div>

                                        <div className="flex gap-3 mt-2">
                                            <button
                                                className="btn flex-1 rounded-xl"
                                                onClick={() => setStep('input')}
                                                disabled={isLoading}
                                            >
                                                Back
                                            </button>
                                            <button
                                                className={`btn flex-1 rounded-xl ${type === 'add' ? 'btn-success' : 'btn-error'} text-white`}
                                                onClick={handleConfirm}
                                                disabled={isLoading}
                                            >
                                                {isLoading ? 'Saving...' : 'Confirm'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
};

export default StarAdjustmentModal;
