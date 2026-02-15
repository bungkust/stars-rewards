import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';

interface PinSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const PinSetupModal = ({ isOpen, onClose, onSuccess }: PinSetupModalProps) => {
    const [step, setStep] = useState<'initial' | 'confirm'>('initial');
    const [pin, setPin] = useState('');
    const [firstPin, setFirstPin] = useState('');
    const [error, setError] = useState('');
    const { setParentPin, setPreferredAuthMethod } = useAppStore();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Small delay to ensure modal animation doesn't interfere with focus
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [isOpen, step]);

    const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        setPin(val);
        setError('');

        if (val.length === 4) {
            handlePinSubmit(val);
        }
    };

    const handlePinSubmit = (val: string) => {
        if (step === 'initial') {
            setFirstPin(val);
            setStep('confirm');
            setPin('');
            setError('');
        } else {
            if (val === firstPin) {
                setParentPin(val);
                setPreferredAuthMethod('pin'); // Auto-set as preferred
                handleClose();
                if (onSuccess) onSuccess();
            } else {
                setError('PINs do not match. Try again.');
                setStep('initial');
                setFirstPin('');
                setPin('');
            }
        }
    };

    const handleClose = () => {
        onClose();
        // Reset state after animation
        setTimeout(() => {
            setStep('initial');
            setFirstPin('');
            setPin('');
            setError('');
        }, 300);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-neutral mb-2">
                        {step === 'initial' ? 'Set New PIN' : 'Confirm New PIN'}
                    </h3>
                    <p className="text-neutral/60 text-sm mb-6 text-center">
                        {error ? <span className="text-error font-bold">{error}</span> :
                            step === 'initial' ? 'Enter a 4-digit PIN' : 'Re-enter your PIN to confirm'}
                    </p>

                    <div className="form-control w-full max-w-xs mb-8">
                        <input
                            ref={inputRef}
                            type="password"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={4}
                            value={pin}
                            onChange={handlePinChange}
                            className={`input input-lg text-center text-3xl font-bold w-full bg-base-200 focus:bg-white transition-all tracking-widest ${error ? 'input-error animate-shake' : 'input-primary'}`}
                            placeholder="••••"
                        />
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={handleClose}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PinSetupModal;
