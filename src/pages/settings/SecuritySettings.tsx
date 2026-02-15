import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Device } from '@capacitor/device';
import { FaFingerprint, FaChevronRight, FaShieldAlt } from 'react-icons/fa';
import { BiGridAlt, BiKey } from 'react-icons/bi';
import { useAppStore } from '../../store/useAppStore';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import PatternSetupModal from '../../components/modals/PatternSetupModal';
import PinSetupModal from '../../components/modals/PinSetupModal';
import BiometricConsentModal from '../../components/modals/BiometricConsentModal';

const SecuritySettings = () => {
    const navigate = useNavigate();
    const {
        biometricEnabled,
        setBiometricEnabled,
        parentPattern,
        preferredAuthMethod,
        setPreferredAuthMethod,
    } = useAppStore();

    const [isPatternModalOpen, setIsPatternModalOpen] = useState(false);
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
    const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);

    useEffect(() => {
        const checkBiometric = async () => {
            try {
                const info = await Device.getInfo();
                if (info.platform === 'web') return;

                const result = await NativeBiometric.isAvailable();
                if (result.isAvailable) {
                    setIsBiometricAvailable(true);
                }
            } catch (e) {
                console.log('Biometric not available:', e);
            }
        };
        checkBiometric();
    }, []);

    const handleToggleChange = (method: 'pin' | 'pattern' | 'biometric') => {
        // If clicking the already active one, do nothing (enforce one active)
        if (preferredAuthMethod === method) return;

        // Special checks
        if (method === 'pattern' && !parentPattern) {
            setIsPatternModalOpen(true);
            return;
        }

        if (method === 'biometric') {
            if (!isBiometricAvailable) {
                alert("Biometrics not available on this device");
                return;
            }
            // Ensure biometric is enabled if selected as default
            setBiometricEnabled(true);
        }

        setPreferredAuthMethod(method);
    };

    return (
        <div className="flex flex-col gap-6 pb-24">
            <div className="flex items-center gap-2">
                <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm -ml-2">
                    <FaChevronRight className="transform rotate-180" /> Back
                </button>
                <H1Header>Security</H1Header>
            </div>

            <AppCard>
                <div className="flex items-center gap-3 mb-6">
                    <IconWrapper icon={FaShieldAlt} />
                    <h3 className="font-bold text-lg text-neutral">Access & Authentication</h3>
                </div>

                {/* Biometrics Master Switch */}
                <div className="p-4 bg-base-100 rounded-xl border border-base-200 mb-6">
                    <label className={`flex items-center justify-between gap-4 cursor-pointer ${!isBiometricAvailable && Capacitor.isNativePlatform() ? 'opacity-50' : ''}`}>
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${biometricEnabled ? 'bg-primary/10 text-primary' : 'bg-neutral/5 text-neutral/40'}`}>
                                <FaFingerprint size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-neutral">Enable Fingerprint</p>
                                <p className="text-xs text-neutral/60">
                                    {isBiometricAvailable ? 'Allow using Fingerprint login' : 'Not available on this device'}
                                </p>
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={biometricEnabled}
                            onChange={(e) => {
                                const checked = e.target.checked;
                                if (checked) {
                                    setIsConsentModalOpen(true);
                                } else {
                                    setBiometricEnabled(false);
                                    // If disabling biometric and it was the preferred method, revert to PIN
                                    if (preferredAuthMethod === 'biometric') {
                                        setPreferredAuthMethod('pin');
                                    }
                                }
                            }}
                            disabled={!isBiometricAvailable && Capacitor.isNativePlatform()}
                        />
                    </label>
                </div>

                <div className="divider my-0"></div>

                {/* Default Access Method Toggles */}
                <div className="mb-6 mt-6">
                    <h4 className="text-sm font-bold text-neutral/60 mb-3 uppercase tracking-wider ml-1">Default Access Method</h4>

                    <div className="flex flex-col gap-3">
                        {/* PIN Toggle */}
                        <div className="flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral/5 text-neutral rounded-full">
                                    <BiKey size={20} />
                                </div>
                                <span className="font-bold text-neutral">PIN Code</span>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={preferredAuthMethod === 'pin'}
                                onChange={() => handleToggleChange('pin')}
                            />
                        </div>

                        {/* Pattern Toggle */}
                        <div className={`flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-200 ${!parentPattern ? 'opacity-70' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral/5 text-neutral rounded-full">
                                    <BiGridAlt size={20} />
                                </div>
                                <div>
                                    <span className="font-bold text-neutral">Pattern</span>
                                    {!parentPattern && <p className="text-xs text-neutral/60">Not set up yet</p>}
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={preferredAuthMethod === 'pattern'}
                                onChange={() => handleToggleChange('pattern')}
                            />
                        </div>

                        {/* Biometric Toggle */}
                        <div className={`flex items-center justify-between p-3 bg-base-100 rounded-xl border border-base-200 ${(!isBiometricAvailable || !biometricEnabled) ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-neutral/5 text-neutral rounded-full">
                                    <FaFingerprint size={20} />
                                </div>
                                <div>
                                    <span className="font-bold text-neutral">Fingerprint Login</span>
                                    {(!isBiometricAvailable) && <p className="text-xs text-neutral/60">Not available</p>}
                                    {(isBiometricAvailable && !biometricEnabled) && <p className="text-xs text-neutral/60">Enable above first</p>}
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                className="toggle toggle-primary"
                                checked={preferredAuthMethod === 'biometric'}
                                onChange={() => handleToggleChange('biometric')}
                                disabled={!isBiometricAvailable || !biometricEnabled}
                            />
                        </div>
                    </div>
                </div>

                {/* Credential Management */}
                <div className="flex flex-col gap-2 mt-4">
                    <h4 className="text-sm font-bold text-neutral/60 mb-1 uppercase tracking-wider ml-1">Manage Credentials</h4>
                    <div
                        className="flex items-center justify-between p-4 hover:bg-base-200 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-base-300"
                        onClick={() => setIsPinModalOpen(true)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-base-200 rounded-full text-neutral/70">
                                <BiKey />
                            </div>
                            <div>
                                <p className="font-bold text-neutral">Change PIN</p>
                                <p className="text-xs text-neutral/60">Update your 4-digit PIN</p>
                            </div>
                        </div>
                        <FaChevronRight className="text-neutral/20" />
                    </div>

                    <div
                        className="flex items-center justify-between p-4 hover:bg-base-200 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-base-300"
                        onClick={() => setIsPatternModalOpen(true)}
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-base-200 rounded-full text-neutral/70">
                                <BiGridAlt />
                            </div>
                            <div>
                                <p className="font-bold text-neutral">{parentPattern ? 'Change Pattern' : 'Setup Pattern'}</p>
                                <p className="text-xs text-neutral/60">{parentPattern ? 'Update your unlock pattern' : 'Create a new pattern'}</p>
                            </div>
                        </div>
                        <FaChevronRight className="text-neutral/20" />
                    </div>
                </div>

            </AppCard>

            <PatternSetupModal
                isOpen={isPatternModalOpen}
                onClose={() => setIsPatternModalOpen(false)}
            />

            <PinSetupModal
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
            />

            <BiometricConsentModal
                isOpen={isConsentModalOpen}
                onClose={() => setIsConsentModalOpen(false)}
                onConfirm={() => {
                    setBiometricEnabled(true);
                    setIsConsentModalOpen(false);
                }}
            />
        </div>
    );
};

export default SecuritySettings;
