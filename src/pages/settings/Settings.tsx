import { useMemo, useState, useEffect } from 'react';
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Link } from 'react-router-dom';
import { FaUsers, FaBell, FaShieldAlt, FaDatabase, FaCloudDownloadAlt, FaFileUpload, FaChevronRight, FaExclamationTriangle } from 'react-icons/fa';
import { useAppStore } from '../../store/useAppStore';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import RestoreConfirmationModal from '../../components/modals/RestoreConfirmationModal';
import BackupConfirmationModal from '../../components/modals/BackupConfirmationModal';
import ResetConfirmationModal from '../../components/modals/ResetConfirmationModal';

const Settings = () => {
  const {
    familyName,
    adminName,
    userProfile,
    children,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useAppStore();

  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [restoreData, setRestoreData] = useState<any>(null);
  const [restoreFilename, setRestoreFilename] = useState('');
  const [appVersion, setAppVersion] = useState('1.0.3'); // Default/Fallback

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          const info = await App.getInfo();
          setAppVersion(`${info.version} (${info.build})`);
        }
      } catch (error) {
        console.error('Failed to get app info:', error);
      }
    };
    fetchVersion();
  }, []);

  const policyLinks = useMemo(
    () => [
      {
        label: 'Privacy Policy',
        description: 'Learn how we protect your family data and account information.',
        href: '/privacy',
      },
      {
        label: 'Terms & Conditions',
        description: 'Understand the rules for using Star Habit as a parent or child.',
        href: '/terms',
      },
    ],
    []
  );

  // Mock user data for display
  const user = {
    name: adminName || 'Parent',
    email: 'Offline User',
    childCount: children.length,
  };

  const familySummary = {
    familyLabel: familyName || userProfile?.family_name || 'Not set yet',
    parentLabel: adminName || userProfile?.parent_name || 'Not set yet',
    parentEmail: user.email,
    childCount: user.childCount,
  };

  return (
    <div className="flex flex-col gap-6 pb-24">
      <H1Header>Settings</H1Header>

      {/* Family Information */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaUsers} />
          <h3 className="font-bold text-lg text-neutral">Family Information</h3>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
            <span className="text-neutral/60 font-medium">Family Name</span>
            <span className="font-bold text-neutral">{familySummary.familyLabel}</span>
          </div>
          <div className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
            <span className="text-neutral/60 font-medium">Primary Parent</span>
            <span className="font-bold text-neutral">{familySummary.parentLabel}</span>
          </div>
          <div className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
            <span className="text-neutral/60 font-medium">Parent Email</span>
            <span className="font-bold text-neutral">{familySummary.parentEmail}</span>
          </div>
          <div className="flex justify-between items-center p-3 hover:bg-base-200 rounded-lg transition-colors">
            <span className="text-neutral/60 font-medium">Children Linked</span>
            <span className="font-bold text-neutral">{familySummary.childCount}</span>
          </div>
        </div>
      </AppCard>

      {/* Notifications */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaBell} />
          <h3 className="font-bold text-lg text-neutral">Notifications</h3>
        </div>
        <div className="p-3 hover:bg-base-200 rounded-lg transition-colors">
          <label className="flex items-start justify-between gap-4 cursor-pointer">
            <div>
              <p className="font-bold text-neutral">Parent reminders</p>
              <p className="text-sm text-neutral/60 mt-1">
                Receive alerts for mission approvals, reward redemptions, and weekly summaries.
              </p>
            </div>
            <input
              type="checkbox"
              className="toggle toggle-primary"
              checked={notificationsEnabled}
              onChange={(event) => setNotificationsEnabled(event.target.checked)}
            />
          </label>
        </div>
        <div className="px-3 mt-2">
          <p className="text-xs text-neutral/40 bg-base-200 p-3 rounded-lg border border-base-300">
            Push notifications require permissions on your device. You can change this anytime.
          </p>
        </div>
      </AppCard>

      {/* Data Management */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaDatabase} />
          <h3 className="font-bold text-lg text-neutral">Data Management</h3>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg transition-colors cursor-pointer" onClick={() => setIsBackupModalOpen(true)}>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 text-info rounded-full">
                <FaCloudDownloadAlt />
              </div>
              <div>
                <p className="font-bold text-neutral">Backup Data</p>
                <p className="text-xs text-neutral/60">Download a copy of your data</p>
              </div>
            </div>
            <button className="btn btn-ghost btn-sm text-primary">
              Download
            </button>
          </div>

          <div className="relative flex items-center justify-between p-3 hover:bg-base-200 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 text-warning rounded-full">
                <FaFileUpload />
              </div>
              <div>
                <p className="font-bold text-neutral">Restore Data</p>
                <p className="text-xs text-neutral/60">Overwrite with backup file</p>
              </div>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                value="" // Always reset to allow selecting same file again
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const json = JSON.parse(event.target?.result as string);
                      const { validateBackupData } = await import('../../utils/backupUtils');

                      if (validateBackupData(json)) {
                        setRestoreData(json.data);
                        setRestoreFilename(file.name);
                        setIsRestoreModalOpen(true);
                      } else {
                        alert('Invalid backup file.');
                      }
                    } catch (err) {
                      console.error('Error parsing backup file:', err);
                      alert('Failed to parse backup file.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
              <button className="btn btn-ghost btn-sm text-primary pointer-events-none">
                Restore
              </button>
            </div>
          </div>
        </div>
      </AppCard>

      {/* Legal & Policy */}
      <AppCard>
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaShieldAlt} />
          <h3 className="font-bold text-lg text-neutral">Legal & Policy</h3>
        </div>
        <div className="flex flex-col gap-1">
          {policyLinks.map((link) => (
            <Link
              key={link.label}
              className="flex items-center justify-between p-3 hover:bg-base-200 rounded-lg transition-colors group"
              to={link.href}
            >
              <div>
                <p className="font-medium text-neutral group-hover:text-primary transition-colors">{link.label}</p>
                <p className="text-xs text-neutral/60">{link.description}</p>
              </div>
              <FaChevronRight className="text-neutral/20 group-hover:text-primary w-3 h-3" />
            </Link>
          ))}
        </div>
      </AppCard>

      {/* Danger Zone */}
      <AppCard className="border-error/20 bg-error/5">
        <div className="flex items-center gap-3 mb-4">
          <IconWrapper icon={FaExclamationTriangle} className="bg-error/10 text-error" />
          <h3 className="font-bold text-lg text-error">Danger Zone</h3>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-neutral/60 mb-2">
            Resetting the app will delete all data permanently. This cannot be undone.
          </p>
          <button
            className="btn btn-error btn-outline btn-sm w-full sm:w-auto"
            onClick={() => setIsResetModalOpen(true)}
          >
            Reset App Data
          </button>
        </div>
      </AppCard>

      {/* App Version */}
      <div className="text-center pb-4">
        <p className="text-xs text-neutral/40 font-medium">App Version {appVersion}</p>
      </div>

      {/* Restore Confirmation Modal */}
      {isRestoreModalOpen && restoreData && (
        <RestoreConfirmationModal
          isOpen={isRestoreModalOpen}
          onClose={() => {
            setIsRestoreModalOpen(false);
            setRestoreData(null);
            setRestoreFilename('');
          }}
          onConfirm={async () => {
            const { error } = await useAppStore.getState().importData(restoreData);
            if (error) throw error;
          }}
          onSuccess={() => {
            setIsRestoreModalOpen(false);
            setRestoreData(null);
            setRestoreFilename('');
            // Logout after successful restore
            useAppStore.getState().logout();
          }}
          filename={restoreFilename}
        />
      )}
      {/* Backup Confirmation Modal */}
      <BackupConfirmationModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onConfirm={async () => {
          const state = useAppStore.getState();
          const { generateBackupData, downloadBackupFile } = await import('../../utils/backupUtils');
          const backup = generateBackupData(state);

          // Generate filename: StarsRewards_[FamilyName]_[Children]_[Date]_[Time].json
          const familyPart = state.familyName || state.adminName || 'Family';
          const childrenPart = state.children.length > 0
            ? state.children.map(c => c.name).join('-')
            : 'NoChildren';

          const now = new Date();
          const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
          const timePart = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHMMSS

          const filename = `StarsRewards_${familyPart}_${childrenPart}_${datePart}_${timePart}.json`
            .replace(/\s+/g, '_'); // Replace spaces with underscores

          try {
            await downloadBackupFile(backup, filename);
          } catch (error) {
            console.error('Backup failed:', error);
            alert('Failed to save backup file. Please check permissions.');
          }
        }}
      />

      {/* Reset Confirmation Modal */}
      <ResetConfirmationModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={() => {
          useAppStore.getState().resetApp();
        }}
      />
    </div>
  );
};

export default Settings;
