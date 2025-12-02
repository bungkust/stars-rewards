import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import AccountDeletionModal from '../../components/modals/AccountDeletionModal';

const Settings = () => {
  const navigate = useNavigate();
  const {
    familyName,
    adminName,
    userProfile,
    session,
    children,
    notificationsEnabled,
    setNotificationsEnabled,
    deleteAccount,
    isLoading,
  } = useAppStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteAccount = async () => {
    const { error } = await deleteAccount();

    if (error) {
      alert('Failed to delete account. Please try again or contact support.');
      return;
    }

    // Account deleted successfully, navigate to welcome page
    navigate('/');
  };

  const policyLinks = useMemo(
    () => [
      {
        label: 'Privacy Policy',
        description: 'Learn how we protect your family data and account information.',
        href: 'https://starhabit.web.id/privacy',
      },
      {
        label: 'Terms & Conditions',
        description: 'Understand the rules for using Stars Rewards as a parent or child.',
        href: 'https://starhabit.web.id/terms',
      },
    ],
    []
  );

  const familySummary = {
    familyLabel: familyName || userProfile?.family_name || 'Not set yet',
    parentLabel: adminName || userProfile?.parent_name || 'Not set yet',
    parentEmail: session?.user?.email || 'No email on file',
    childCount: children.length,
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

      <section className="rounded-2xl border border-red-200 bg-red-50/50 shadow-sm">
        <div className="border-b border-red-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-red-800">Danger Zone</h2>
        </div>
        <div className="p-5">
          <div className="bg-white rounded-xl p-4 border border-red-200">
            <h3 className="text-md font-semibold text-gray-800 mb-2">Delete Account</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
              disabled={isLoading}
            >
              Delete Account
            </button>
          </div>
        </div>
      </section>

      <AccountDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Settings;

