import { FaFingerprint, FaShieldAlt, FaInfoCircle } from 'react-icons/fa';
import { PrimaryButton } from '../design-system/PrimaryButton';

interface BiometricConsentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const BiometricConsentModal = ({ isOpen, onClose, onConfirm }: BiometricConsentModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-base-100 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-scale-in relative flex flex-col">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 btn btn-circle btn-sm btn-ghost z-10"
                >
                    ✕
                </button>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <FaFingerprint size={40} />
                    </div>

                    <h3 className="text-2xl font-bold text-neutral mb-3">Enable Fingerprint Login</h3>

                    <p className="text-neutral/70 mb-6 leading-relaxed">
                        Use your device's <strong>Fingerprint</strong> for faster and more secure access to Parent Mode.
                    </p>

                    <div className="flex flex-col gap-4 text-left bg-base-200/50 p-4 rounded-2xl mb-8">
                        <div className="flex gap-3">
                            <FaShieldAlt className="text-primary mt-1 shrink-0" />
                            <p className="text-sm text-neutral/80">
                                <strong>Privacy First:</strong> Your fingerprint data is stored securely on your device and is never shared or stored on our servers.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <FaInfoCircle className="text-primary mt-1 shrink-0" />
                            <p className="text-sm text-neutral/80">
                                <strong>Secure Fallback:</strong> You can always use your PIN or Pattern if fingerprint login fails or is unavailable.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <PrimaryButton
                            onClick={() => {
                                onConfirm();
                                onClose();
                            }}
                            className="w-full rounded-2xl py-4 h-auto text-lg"
                        >
                            Enable Fingerprint
                        </PrimaryButton>

                        <button
                            onClick={onClose}
                            className="btn btn-ghost text-neutral/50 w-full rounded-2xl h-auto py-2"
                        >
                            Not Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BiometricConsentModal;
