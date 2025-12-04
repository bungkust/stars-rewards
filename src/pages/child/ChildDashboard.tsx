import { useState, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FaStar, FaCheckCircle, FaCamera, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';
import AvatarSelectionModal from '../../components/modals/AvatarSelectionModal';
import TaskCompletionModal from '../../components/modals/TaskCompletionModal';
import TaskRejectionDetailsModal from '../../components/modals/TaskRejectionDetailsModal';

const ChildDashboard = () => {
  const { activeChildId, children, getTasksByChildId, updateChildAvatar, completeTask, isLoading, childLogs } = useAppStore();
  const child = children.find(c => c.id === activeChildId);
  const allTasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  const [filter, setFilter] = useState<'today' | 'once' | 'all'>('today');
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset visible count when filter changes
  const handleFilterChange = (newFilter: 'today' | 'once' | 'all') => {
    setFilter(newFilter);
    setVisibleCount(20);
  };

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.is_active) return false;

      if (filter === 'all') return true;

      if (filter === 'once') {
        return task.recurrence_rule === 'Once';
      }

      // Default: 'today' logic
      // Always show Daily tasks
      if (task.recurrence_rule === 'Daily') return true;

      // Check recurrence date logic
      if (!task.created_at) return true; // Fallback
      const created = new Date(task.created_at);
      const today = new Date();

      if (task.recurrence_rule === 'Weekly') {
        return created.getDay() === today.getDay();
      }

      if (task.recurrence_rule === 'Monthly') {
        return created.getDate() === today.getDate();
      }

      // 'Once' tasks show up in 'Today' only if created today
      return created.toDateString() === today.toDateString();
    }).sort((a, b) => {
      // Sort by status (Pending/Rejected first, then incomplete, then Verified)
      // This is complex, so for now keep simple date sort or refine later
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA; // Descending
    });
  }, [allTasks, filter]);

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleTasks.length < filteredTasks.length;

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<{ name: string, value: number } | null>(null);

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<{ taskName: string, reason: string } | null>(null);

  // Helper to find log status for today
  const getTaskStatus = (taskId: string) => {
    if (!activeChildId) return null;
    // Filter logs for this child and this task, created today
    // For simplicity, just check if ANY log exists for today. 
    // In real app, we should handle timezones properly.
    const today = new Date().toISOString().split('T')[0];

    return childLogs.find(log =>
      log.child_id === activeChildId &&
      log.task_id === taskId &&
      log.completed_at.startsWith(today)
    );
  };

  const handleAvatarSave = async (newAvatar: string) => {
    if (child) {
      await updateChildAvatar(child.id, newAvatar);
    }
  };

  const handleTaskComplete = async (task: { id: string, name: string, reward_value: number }) => {
    // Check if already done today handled by UI state, but double check
    if (getTaskStatus(task.id)) return;

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
          <h3 className="text-xl font-bold text-gray-700">Missions</h3>

          {/* Filter Tabs */}
          <div className="tabs tabs-boxed bg-base-200 p-1 rounded-lg w-fit">
            <a
              className={`tab tab-sm rounded-md transition-all ${filter === 'today' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-base-300'}`}
              onClick={() => handleFilterChange('today')}
            >
              Today
            </a>
            <a
              className={`tab tab-sm rounded-md transition-all ${filter === 'once' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-base-300'}`}
              onClick={() => handleFilterChange('once')}
            >
              Once
            </a>
            <a
              className={`tab tab-sm rounded-md transition-all ${filter === 'all' ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:bg-base-300'}`}
              onClick={() => handleFilterChange('all')}
            >
              All
            </a>
          </div>
        </div>

        {visibleTasks.length === 0 ? (
          <div className="text-center p-8 bg-base-100 rounded-xl border-2 border-dashed border-gray-300 text-gray-400">
            <p>No missions found for this filter.</p>
          </div>
        ) : (
          <>
            {visibleTasks.map((task) => {
              const log = getTaskStatus(task.id);
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
                      {status === 'VERIFIED' ? <FaCheckCircle className="w-6 h-6" /> :
                        status === 'REJECTED' ? <FaTimesCircle className="w-6 h-6" /> :
                          status === 'PENDING' ? <FaHourglassHalf className="w-6 h-6" /> :
                            <FaCheckCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">{task.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {task.reward_value > 0 && (
                          <span className="flex items-center gap-1 text-warning font-bold">
                            <FaStar className="w-3 h-3" /> {task.reward_value}
                          </span>
                        )}
                        {filter !== 'today' && (
                          <span className="badge badge-ghost badge-xs">{task.recurrence_rule}</span>
                        )}
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
