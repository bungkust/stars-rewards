import { useMemo, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import RestoreConfirmationModal from '../../components/modals/RestoreConfirmationModal';
import BackupConfirmationModal from '../../components/modals/BackupConfirmationModal';

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
  const [restoreData, setRestoreData] = useState<any>(null);
  const [restoreFilename, setRestoreFilename] = useState('');

  const policyLinks = useMemo(
    () => [
      {
        label: 'Privacy Policy',
        description: 'Learn how we protect your family data and account information.',
        href: 'https://starsrewards.app/privacy',
      },
      {
        label: 'Terms & Conditions',
        description: 'Understand the rules for using Stars Rewards as a parent or child.',
        href: 'https://starsrewards.app/terms',
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
    <div className="space-y-6 pb-12">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <section className="rounded-2xl border border-base-200 bg-white/95 shadow-sm">
        <div className="border-b border-base-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Family Information</h2>
        </div>
        <div className="divide-y divide-base-200">
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Family Name</p>
              <p className="font-semibold text-gray-900">{familySummary.familyLabel}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Primary Parent</p>
              <p className="font-semibold text-gray-900">{familySummary.parentLabel}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Parent Email</p>
              <p className="font-semibold text-gray-900">{familySummary.parentEmail}</p>
            </div>
          </div>
          <div className="px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Children Linked</p>
              <p className="font-semibold text-gray-900">{familySummary.childCount}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-base-200 bg-white/95 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
        <label className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-base-100 border border-base-200 cursor-pointer">
          <div>
            <p className="font-medium text-gray-900">Parent reminders</p>
            <p className="text-sm text-gray-500">
              Receive alerts for mission approvals, reward redemptions, and weekly summaries.
            </p>
          </div>
          <input
            type="checkbox"
            className="toggle toggle-primary mt-1"
            checked={notificationsEnabled}
            onChange={(event) => setNotificationsEnabled(event.target.checked)}
          />
        </label>
        <p className="text-xs text-gray-400 mt-3">
          Push notifications require permissions on your device. You can change this anytime.
        </p>
      </section>

      <section className="rounded-2xl border border-base-200 bg-white/95 shadow-sm">
        <div className="border-b border-base-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-800">Legal & Policy</h2>
        </div>
        <div className="divide-y divide-base-200">
          {policyLinks.map((link) => (
            <a
              key={link.label}
              className="flex items-center justify-between px-5 py-4 hover:bg-primary/5 transition-colors"
              href={link.href}
              target="_blank"
              rel="noreferrer"
            >
              <div>
                <p className="font-medium text-gray-900">{link.label}</p>
                <p className="text-sm text-gray-500">{link.description}</p>
              </div>
              <span className="text-sm font-semibold text-primary">View</span>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-base-200 bg-white/95 shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Data Management</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-2xl bg-base-100 border border-base-200">
            <div>
              <p className="font-medium text-gray-900">Backup Data</p>
              <p className="text-sm text-gray-500">Download a copy of your current data.</p>
            </div>
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="btn btn-primary btn-sm"
            >
              Download Backup
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-base-100 border border-base-200">
            <div>
              <p className="font-medium text-gray-900">Restore Data</p>
              <p className="text-sm text-gray-500">Restore data from a backup file. This will overwrite current data.</p>
            </div>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
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
              <button className="btn btn-outline btn-sm pointer-events-none">
                Restore from File
              </button>
            </div>
          </div>
        </div>
      </section>

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

          downloadBackupFile(backup, filename);
        }}
      />
    </div>
  );
};

export default Settings;
