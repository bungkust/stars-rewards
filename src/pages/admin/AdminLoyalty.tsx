import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import { CheckCircle, Trophy } from '@phosphor-icons/react';
import { H1Header, WarningCTAButton, AdminEntityCard } from '../../components/design-system';
import { useAppStore } from '../../store/useAppStore';
import type { StreakMilestone } from '../../types';

const AdminLoyalty = () => {
  const navigate = useNavigate();
  const { streakMilestones, deleteStreakMilestone } = useAppStore();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDeleteMilestone = (milestone: StreakMilestone) => {
    if (window.confirm(`Delete the "${milestone.title}" (${milestone.days}-day) milestone?`)) {
      deleteStreakMilestone(milestone.id);
      showToast(`Deleted "${milestone.title}" milestone`);
    }
  };

  return (
    <div className="relative min-h-full pb-24 flex flex-col gap-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="toast toast-top toast-center z-50 animate-fade-in">
          <div className="alert alert-success text-white font-bold text-xs py-2 px-4 shadow-lg rounded-xl flex items-center gap-2">
            <CheckCircle size={18} weight="fill" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-1">
        <H1Header>Streak Milestones & Rewards</H1Header>
        <p className="text-xs text-neutral/60 font-medium mt-0.5">
          Customize streak milestone names, required consecutive days, and bonus star rewards
        </p>
      </div>

      {/* Milestone List */}
      <div className="flex flex-col gap-3">
        {streakMilestones.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Trophy size={28} weight="fill" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral">No Streak Milestones</h3>
              <p className="text-xs text-neutral/50 max-w-xs mt-1">
                You haven't set up any streak milestones yet. Tap below to create your first milestone.
              </p>
            </div>
            <div className="mt-2">
              <button
                onClick={() => navigate('/admin/streaks/new')}
                className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-xs font-bold"
              >
                + Add Milestone
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {streakMilestones.map((milestone) => (
              <AdminEntityCard
                key={milestone.id || milestone.days}
                badge={
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-black text-sm leading-none">{milestone.days}</span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider leading-none mt-0.5">
                      Days
                    </span>
                  </div>
                }
                title={milestone.title}
                stars={milestone.bonusStars}
                starPrefix="+"
                description={milestone.description}
                onEdit={() => navigate(`/admin/streaks/${milestone.id}/edit`)}
                onDelete={() => handleDeleteMilestone(milestone)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button (+ Add Milestone, navigates to /admin/streaks/new) */}
      <WarningCTAButton onClick={() => navigate('/admin/streaks/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Milestone</span>
      </WarningCTAButton>
    </div>
  );
};

export default AdminLoyalty;
