import { useState } from 'react';
import { PatternLock } from '../common/PatternLock';
import { useAppStore } from '../../store/useAppStore';


interface PatternSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

const PatternSetupModal = ({ isOpen, onClose, onSuccess }: PatternSetupModalProps) => {
    const [step, setStep] = useState<'initial' | 'confirm'>('initial');
    const [firstPattern, setFirstPattern] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [path, setPath] = useState<number[]>([]);
    const { setParentPattern, setPreferredAuthMethod } = useAppStore();

    const handlePatternFinish = (pattern: string) => {
        // Reset path (the library might not do it automatically visually, but we get the pattern)
        // Actually we need to reset the internal state of the lock if we want to clear it.
        // But for this library, often we just take the output.

        if (pattern.length < 4) {
            setError('Pattern must connect at least 4 dots');
            return;
        }

        if (step === 'initial') {
            setFirstPattern(pattern);
            setStep('confirm');
            setError('');
        } else {
            if (pattern === firstPattern) {
                setParentPattern(pattern);
                setPreferredAuthMethod('pattern'); // Auto-set as preferred
                onClose();
                if (onSuccess) onSuccess();
                // Reset state after success (for next open)
                setTimeout(() => {
                    setStep('initial');
                    setFirstPattern('');
                    setPath([]);
                    setError('');
                }, 300);
            } else {
                setError('Patterns do not match. Try again.');
                setStep('initial');
                setFirstPattern('');
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
                <div className="p-6 flex flex-col items-center">
                    <h3 className="text-xl font-bold text-neutral mb-2">
                        {step === 'initial' ? 'Set Pattern' : 'Confirm Pattern'}
                    </h3>
                    <p className="text-neutral/60 text-sm mb-6 text-center">
                        {error ? <span className="text-error font-bold">{error}</span> :
                            step === 'initial' ? 'Draw a pattern to unlock parent mode' : 'Draw the pattern again to confirm'}
                    </p>

                    <div className="bg-base-200/50 p-4 rounded-3xl mb-6">
                        <PatternLock
                            width={250}
                            path={path}
                            onChange={(val) => {
                                setPath(val);
                                setError('');
                            }}
                            onFinish={() => {
                                handlePatternFinish(path.join('-'));
                                setPath([]);
                            }}
                            error={!!error}
                        />
                    </div>

                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => {
                                onClose();
                                setStep('initial');
                                setFirstPattern('');
                                setPath([]);
                                setError('');
                            }}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        {step === 'confirm' && (
                            <button
                                onClick={() => {
                                    setStep('initial');
                                    setFirstPattern('');
                                    setPath([]);
                                    setError('');
                                }}
                                className="btn btn-outline flex-1"
                            >
                                Redraw
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatternSetupModal;
