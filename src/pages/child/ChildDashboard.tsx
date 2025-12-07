import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FaStar, FaClock, FaRedo, FaCamera, FaBolt, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import { ToggleButton } from '../../components/design-system';
import AvatarSelectionModal from '../../components/modals/AvatarSelectionModal';
import TaskCompletionModal from '../../components/modals/TaskCompletionModal';
import TaskRejectionDetailsModal from '../../components/modals/TaskRejectionDetailsModal';

const ChildDashboard = () => {
  const { activeChildId, children, getTasksByChildId, updateChildAvatar, completeTask, isLoading, childLogs } = useAppStore();
  const child = children.find(c => c.id === activeChildId);
  const allTasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset visible count when filter changes
  const handleFilterChange = (newFilter: 'daily' | 'once' | 'all') => {
    setFilter(newFilter);
    setVisibleCount(20);
  };

  // Helper to find log status for today
  const getTodayLog = (taskId: string) => {
    if (!activeChildId) return null;
    const today = new Date().toISOString().split('T')[0];

    return childLogs.find(log =>
      log.child_id === activeChildId &&
      log.task_id === taskId &&
      log.completed_at.startsWith(today)
    );
  };

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.is_active) return false;

      if (filter === 'all') return true;

      if (filter === 'once') {
        return task.recurrence_rule === 'Once';
      }

      if (filter === 'daily') {
        // Show Daily tasks (and maybe others that recur often? User said "Daily")
        // Let's include anything that is NOT 'Once' for now, or strictly 'Daily'?
        // User request: "daily, once, all".
        // Strict interpretation: recurrence_rule === 'Daily'
        // But we have Weekly/Monthly/Custom.
        // Let's assume 'Daily' filter is for Habits (Recurring).
        // Actually, let's stick to strict 'Daily' first, or maybe 'Recurring' is better?
        // User said "Daily". Let's try to match 'Daily' or 'Custom' with frequency DAILY?
        // Simplest: recurrence_rule !== 'Once' (i.e. Recurring)
        // But the label is "Daily".
        // Let's use: recurrence_rule !== 'Once' to show all recurring habits.
        return task.recurrence_rule !== 'Once';
      }

      return true;
    }).sort((a, b) => {
      // Sort: Pending/Due first, then Completed/Verified
      // But we also have "due today" logic.
      // For "All" view, we might want to see everything.
      // Let's keep simple date sort for now.
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [allTasks, filter, childLogs, activeChildId]);

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleTasks.length < filteredTasks.length;

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<{ name: string, value: number } | null>(null);

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<{ taskName: string, reason: string } | null>(null);

  const handleAvatarSave = async (newAvatar: string) => {
    if (child) {
      await updateChildAvatar(child.id, newAvatar);
    }
  };

  const handleTaskComplete = async (task: { id: string, name: string, reward_value: number }) => {
    // Check if already done today handled by UI state, but double check
    if (getTodayLog(task.id)) return;

    const { error } = await completeTask(task.id);
    if (!error) {
      setLastCompletedTask({ name: task.name, value: task.reward_value });
      setIsCompletionModalOpen(true);
    } else {
      alert('Something went wrong. Please try again.');
    }
  };

  const handleViewRejection = (taskName: string, reason?: string) => {
    setSelectedRejection({ taskName, reason: reason || '' });
    setIsRejectionModalOpen(true);
  };

  const getBadgeStyle = (rule: string) => {
    switch (rule) {
      case 'Once': return 'bg-amber-100 text-amber-800';
      case 'Daily': return 'bg-blue-100 text-blue-800';
      case 'Weekly': return 'bg-purple-100 text-purple-800';
      case 'Monthly': return 'bg-rose-100 text-rose-800';
      case 'Custom': return 'bg-teal-100 text-teal-800';
      default: return 'bg-teal-100 text-teal-800'; // Default to Custom style for complex rules
    }
  };

  if (!child) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-6">
      {/* Profile Card */}
      <div className="card bg-white shadow-md rounded-xl p-6 flex flex-row items-center gap-4">
        <div className="avatar indicator cursor-pointer group" onClick={() => setIsAvatarModalOpen(true)}>
          <span className="indicator-item badge badge-secondary p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity absolute top-0 right-0 z-10">
            <FaCamera className="w-3 h-3 text-white" />
          </span>
          <div className="w-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 group-hover:ring-4 transition-all">
            <img src={child.avatar_url} alt={child.name} />
          </div>
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-800">Hi, {child.name}!</h2>
          <div className="flex items-center gap-2 text-warning mt-1">
            <FaStar className="w-6 h-6" />
            <span className="text-3xl font-bold text-gray-700">{child.current_balance}</span>
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={isAvatarModalOpen}
        currentAvatar={child.avatar_url}
        onClose={() => setIsAvatarModalOpen(false)}
        onSave={handleAvatarSave}
      />

      {/* Task Completion Modal */}
      <TaskCompletionModal
        isOpen={isCompletionModalOpen}
        taskName={lastCompletedTask?.name || ''}
        rewardValue={lastCompletedTask?.value || 0}
        onClose={() => setIsCompletionModalOpen(false)}
      />

      <TaskRejectionDetailsModal
        isOpen={isRejectionModalOpen}
        taskName={selectedRejection?.taskName || ''}
        reason={selectedRejection?.reason || ''}
        onClose={() => setIsRejectionModalOpen(false)}
      />

      {/* Today's Tasks Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 px-1">
          <h3 className="text-xl font-bold text-gray-700">
            Daily Mission <span className="text-black">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          </h3>

          {/* Filter Tabs */}
          {/* Filter Tabs */}
          <div className="flex gap-2">
            <ToggleButton
              label="Daily"
              isActive={filter === 'daily'}
              onClick={() => handleFilterChange('daily')}
            />
            <ToggleButton
              label="Once"
              isActive={filter === 'once'}
              onClick={() => handleFilterChange('once')}
            />
            <ToggleButton
              label="All"
              isActive={filter === 'all'}
              onClick={() => handleFilterChange('all')}
            />
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="text-center p-8 bg-base-100 rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
            <p>No missions found for this filter.</p>
          </div>
        ) : (
          <>
            {visibleTasks.map((task) => {
              const log = getTodayLog(task.id);
              const status = log?.status; // PENDING, VERIFIED, REJECTED

              return (
                <div key={task.id} className={`card bg-white shadow-sm rounded-xl p-4 flex flex-row items-center justify-between border-l-4 ${status === 'VERIFIED' ? 'border-success' :
                  status === 'REJECTED' ? 'border-error' :
                    status === 'PENDING' ? 'border-warning' : 'border-primary'
                  }`}>
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-full ${status === 'VERIFIED' ? 'bg-success/10 text-success' :
                      status === 'REJECTED' ? 'bg-error/10 text-error' :
                        status === 'PENDING' ? 'bg-warning/10 text-warning' : 'bg-blue-50 text-primary'
                      }`}>
                      {task.recurrence_rule === 'Once' ? <FaBolt className="w-6 h-6" /> :
                        task.recurrence_rule === 'Daily' ? <FaRedo className="w-6 h-6" /> :
                          task.recurrence_rule === 'Weekly' ? <FaCalendarWeek className="w-6 h-6" /> :
                            task.recurrence_rule === 'Monthly' ? <FaCalendarAlt className="w-6 h-6" /> :
                              <FaClock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{task.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {task.reward_value > 0 && (
                          <span className="flex items-center gap-1 text-warning font-bold">
                            <FaStar className="w-3 h-3" /> {task.reward_value}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(task.recurrence_rule || '')}`}>
                          {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule || '') ? task.recurrence_rule : 'Custom'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {status === 'VERIFIED' ? (
                    <span className="badge badge-success text-white font-bold p-3">Approved</span>
                  ) : status === 'REJECTED' ? (
                    <button
                      className="btn btn-sm btn-error btn-outline rounded-full"
                      onClick={() => handleViewRejection(task.name, log?.rejection_reason)}
                    >
                      Why?
                    </button>
                  ) : status === 'PENDING' ? (
                    <span className="badge badge-warning text-white font-bold p-3">Pending</span>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary rounded-full"
                      onClick={() => handleTaskComplete(task)}
                      disabled={isLoading}
                    >
                      Done
                    </button>
                  )}
                </div>
              )
            })}

            {hasMore && (
              <button
                className="btn btn-ghost btn-sm w-full text-gray-500"
                onClick={() => setVisibleCount(prev => prev + 20)}
              >
                Load More
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChildDashboard;
