import { useState, useMemo, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FaStar, FaClock, FaRedo, FaCamera, FaBolt, FaCalendarWeek, FaCalendarAlt } from 'react-icons/fa';
import { motion, type PanInfo } from 'framer-motion';
import { ToggleButton } from '../../components/design-system';
import { parseRRule, isDateValid } from '../../utils/recurrence';
import { getTodayLocalStart, getLocalStartOfDay, getLocalDateString } from '../../utils/timeUtils';
import AvatarSelectionModal from '../../components/modals/AvatarSelectionModal';
import TaskCompletionModal from '../../components/modals/TaskCompletionModal';
import TaskRejectionDetailsModal from '../../components/modals/TaskRejectionDetailsModal';
import ExemptionModal from '../../components/modals/ExemptionModal';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';

const ChildDashboard = () => {
  const { activeChildId, children, getTasksByChildId, updateChildAvatar, completeTask, isLoading, childLogs } = useAppStore();
  const child = children.find(c => c.id === activeChildId);
  const allTasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  const [filter, setFilter] = useState<'today' | 'daily' | 'once' | 'all'>('today');
  const [visibleCount, setVisibleCount] = useState(20);

  // Reset visible count when filter changes
  const handleFilterChange = (newFilter: 'today' | 'daily' | 'once' | 'all') => {
    setFilter(newFilter);
    setVisibleCount(20);
  };

  // Schedule Missed Notification
  useEffect(() => {
    if (!activeChildId) return;

    const checkAndSchedule = async () => {
      const { notificationService } = await import('../../services/notificationService');

      // Calculate incomplete tasks for today
      const todayStr = getLocalDateString();
      const incompleteCount = allTasks.filter(task => {
        if (task.is_active === false) return false;
        if (task.assigned_to && !task.assigned_to.includes(activeChildId)) return false;

        // Check if scheduled for today
        let isScheduled = false;
        if (task.recurrence_rule === 'Once') {
          isScheduled = true;
        } else if (task.recurrence_rule) {
          const options = parseRRule(task.recurrence_rule);
          const baseDate = new Date(task.created_at || new Date());
          const today = getTodayLocalStart();
          isScheduled = isDateValid(today, options, baseDate);
        }

        if (!isScheduled) return false;

        // Check if completed today
        const log = childLogs.find(l =>
          l.child_id === activeChildId &&
          l.task_id === task.id &&
          getLocalDateString(new Date(l.completed_at)) === todayStr
        );

        // If no log, it's incomplete.
        if (!log) return true;
        // If log exists, check status.
        if (['VERIFIED', 'PENDING', 'PENDING_EXCUSE', 'EXCUSED'].includes(log.status)) return false;

        return true;
      }).length;

      // Always call this to ensure we cancel if count is 0
      notificationService.scheduleMissedChildNotification(incompleteCount);
    };

    checkAndSchedule();
  }, [activeChildId, allTasks, childLogs]);

  // Helper to find logs for today
  const getTodayLogs = (taskId: string) => {
    if (!activeChildId) return [];
    const todayStr = getLocalDateString();

    return childLogs.filter(log => {
      if (log.child_id !== activeChildId || log.task_id !== taskId) return false;

      const logDate = new Date(log.completed_at);
      const logDateStr = getLocalDateString(logDate);
      return logDateStr === todayStr;
    });
  };

  const getTaskStatus = (task: any) => {
    const logs = getTodayLogs(task.id);
    const max = task.max_completions_per_day || 1;

    // Count valid completions (Pending or Verified or Excused)
    const validLogs = logs.filter(l => ['VERIFIED', 'PENDING', 'PENDING_EXCUSE', 'EXCUSED'].includes(l.status));
    const count = validLogs.length;
    const isFullyCompleted = count >= max;

    // For sorting/display, we need a "primary" status.
    // If fully completed, use the status of the last valid log.
    // If not, it's "ACTIVE" (or "PARTIAL").

    if (isFullyCompleted) {
      // Return status of the latest valid log
      // Sort logs by time desc? They come from store sorted? 
      // childLogs in store might not be sorted by time for same day?
      // Let's assume the last one added is at the top or we sort.
      // logs is filtered from childLogs. childLogs in store is unshifted (newest first).
      // So logs[0] is likely the newest.
      return validLogs[0]?.status || 'VERIFIED';
    }

    return 'ACTIVE';
  };

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.is_active) return false;

      // Filter by Assignment
      if (task.assigned_to && activeChildId && !task.assigned_to.includes(activeChildId)) {
        return false;
      }

      if (filter === 'all') return true;

      if (filter === 'once') {
        return task.recurrence_rule === 'Once';
      }

      if (filter === 'daily') {
        return task.recurrence_rule === 'Daily';
      }

      if (filter === 'today') {
        // Show tasks scheduled for TODAY (Local Time)

        // If it's 'Once', it is available today (unless filtered out by future due date below)
        if (task.recurrence_rule === 'Once') return true;

        if (task.recurrence_rule) {
          const options = parseRRule(task.recurrence_rule);
          const baseDate = new Date(task.created_at || new Date());
          // Use getTodayLocalStart() to ensure we check against local midnight
          const today = getTodayLocalStart();
          return isDateValid(today, options, baseDate);
        }
        return false;
      }

      // Filter out tasks that have a pending exemption request for TODAY
      const logs = getTodayLogs(task.id);
      if (logs.some(l => l.status === 'PENDING_EXCUSE')) return false;

      // Filter out FAILED tasks (they should only appear in history)
      if (logs.some(l => l.status === 'FAILED')) return false;

      // Filter out tasks that are not due yet (if next_due_date is set and in future)
      if (task.next_due_date) {
        const today = getTodayLocalStart();
        const dueDate = new Date(task.next_due_date);
        // Ensure dueDate is compared as local date 00:00
        const localDueDate = getLocalStartOfDay(dueDate);

        if (localDueDate > today) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort Priority:
      // 1. Not Started (No Log)
      // 2. Pending (PENDING, PENDING_EXCUSE)
      // 3. Completed (VERIFIED, EXCUSED, REJECTED)
      // 4. Failed (FAILED)



      const getStatusWeight = (task: any) => {
        const status = getTaskStatus(task);
        if (status === 'ACTIVE') return 0; // Not started or Partial
        if (status === 'PENDING' || status === 'PENDING_EXCUSE') return 1;

        // Completed Status Sorting: Verified > Rejected > Excused
        if (status === 'VERIFIED') return 2;
        if (status === 'REJECTED') return 3;
        if (status === 'EXCUSED') return 4;
        if (status === 'FAILED') return 5;

        return 6; // Fallback
      };

      const weightA = getStatusWeight(a);
      const weightB = getStatusWeight(b);

      if (weightA !== weightB) {
        return weightA - weightB;
      }

      // Secondary Sort: Created Date (Newest First)
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [allTasks, filter, childLogs, activeChildId]);

  // DEBUG LOGS
  console.log('[Dashboard] Active Child:', activeChildId);
  console.log('[Dashboard] All Tasks:', allTasks.length);
  console.log('[Dashboard] Filtered Tasks:', filteredTasks.length);

  filteredTasks.forEach(t => {
    const status = getTaskStatus(t);
    console.log(`[Dashboard] Task: ${t.name}, Status: ${status}, Recurrence: ${t.recurrence_rule}, Expiry: ${t.expiry_time || 'None'}, AssignedTo: ${t.assigned_to ? JSON.stringify(t.assigned_to) : 'ALL'}`);
  });

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleTasks.length < filteredTasks.length;

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [lastCompletedTask, setLastCompletedTask] = useState<{ name: string, value: number } | null>(null);

  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [selectedRejection, setSelectedRejection] = useState<{ taskName: string, reason: string } | null>(null);

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);

  const handleTaskClick = (task: any) => {
    setSelectedTaskDetails(task);
    setIsDetailsModalOpen(true);
  };

  const handleAvatarSave = async (newAvatar: string) => {
    if (child) {
      await updateChildAvatar(child.id, newAvatar);
    }
  };

  const handleTaskComplete = async (task: { id: string, name: string, reward_value: number, max_completions_per_day?: number }) => {
    // Check if already done today handled by UI state, but double check
    const status = getTaskStatus(task);
    if (status !== 'ACTIVE') return;

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

  const { submitExemptionRequest } = useAppStore();
  const [isExemptionModalOpen, setIsExemptionModalOpen] = useState(false);
  const [selectedTaskForExemption, setSelectedTaskForExemption] = useState<{ id: string, name: string } | null>(null);

  const handleSwipe = (_: any, info: PanInfo, task: { id: string, name: string }) => {
    if (info.offset.x > 100) { // Swipe Right threshold
      setSelectedTaskForExemption(task);
      setIsExemptionModalOpen(true);
    }
  };

  const handleExemptionSubmit = async (reason: string) => {
    if (selectedTaskForExemption) {
      const { error } = await submitExemptionRequest(selectedTaskForExemption.id, reason);
      if (!error) {
        setIsExemptionModalOpen(false);
        setSelectedTaskForExemption(null);
      } else {
        alert('Failed to submit request');
      }
    }
  };

  const getBadgeStyle = (rule: string) => {
    switch (rule) {
      case 'Once': return 'badge badge-accent badge-outline';
      case 'Daily': return 'badge badge-primary badge-outline';
      case 'Weekly': return 'badge badge-secondary badge-outline';
      case 'Monthly': return 'badge badge-info badge-outline';
      case 'Custom': return 'badge badge-neutral badge-outline';
      default: return 'badge badge-ghost badge-outline';
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

      <ExemptionModal
        isOpen={isExemptionModalOpen}
        taskName={selectedTaskForExemption?.name || ''}
        onClose={() => setIsExemptionModalOpen(false)}
        onSubmit={handleExemptionSubmit}
        isLoading={isLoading}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        task={selectedTaskDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />

      {/* Today's Tasks Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 px-1">
          <h3 className="text-xl font-bold text-gray-700">
            Daily Mission, <span className="text-black">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</span>
          </h3>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            <ToggleButton
              label="Today"
              isActive={filter === 'today'}
              onClick={() => handleFilterChange('today')}
            />
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
              const logs = getTodayLogs(task.id);
              const max = task.max_completions_per_day || 1;
              const validLogs = logs.filter(l => ['VERIFIED', 'PENDING', 'PENDING_EXCUSE', 'EXCUSED'].includes(l.status));
              const count = validLogs.length;
              const isFullyCompleted = count >= max;

              // Determine display status
              // If fully completed, use the status of the latest valid log
              // If not, it's "ACTIVE" (show Done button)
              const displayStatus = isFullyCompleted ? (validLogs[0]?.status || 'VERIFIED') : 'ACTIVE';

              // For "Why?" button on rejected, we need to check if there are ANY rejected logs that are "fresh" (not retried)?
              // Actually, if I have a REJECTED log, it doesn't count towards validLogs.
              // So count is 0 (or lower than max).
              // So displayStatus is ACTIVE.
              // But we might want to show a "Rejected" badge or border if the *latest* log was rejected?
              // Let's check the absolute latest log.
              const latestLog = logs[0]; // Assuming logs are sorted new to old (from childLogs)
              const isLatestRejected = latestLog?.status === 'REJECTED';

              return (
                <div key={task.id} className="relative">
                  {/* Background for Swipe Action */}
                  <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-start px-6">
                    <span className="text-gray-400 font-medium text-sm">Swipe to Skip &rarr;</span>
                  </div>

                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={{ right: 0.2 }} // Allow pulling right
                    onDragEnd={(e, info) => handleSwipe(e, info, task)}
                    whileDrag={{ scale: 1.02 }}
                    onClick={() => handleTaskClick(task)}
                    className={`relative card bg-white shadow-sm rounded-xl p-4 flex flex-row items-center justify-between border-l-4 cursor-pointer active:scale-95 transition-transform ${displayStatus === 'VERIFIED' ? 'border-success' :
                      displayStatus === 'FAILED' ? 'border-error' :
                        displayStatus === 'PENDING' ? 'border-warning' :
                          displayStatus === 'PENDING_EXCUSE' ? 'border-warning' :
                            displayStatus === 'EXCUSED' ? 'border-gray-300' :
                              isLatestRejected ? 'border-error' : 'border-primary'
                      }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`p-3 rounded-full flex-shrink-0 ${displayStatus === 'VERIFIED' ? 'bg-success/10 text-success' :
                        displayStatus === 'FAILED' ? 'bg-error/10 text-error' :
                          displayStatus === 'PENDING' ? 'bg-warning/10 text-warning' :
                            displayStatus === 'PENDING_EXCUSE' ? 'bg-warning/10 text-warning' :
                              displayStatus === 'EXCUSED' ? 'bg-neutral/10 text-neutral' :
                                isLatestRejected ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'
                        }`}>
                        {task.recurrence_rule === 'Once' ? <FaBolt className="w-6 h-6" /> :
                          task.recurrence_rule === 'Daily' ? <FaRedo className="w-6 h-6" /> :
                            task.recurrence_rule === 'Weekly' ? <FaCalendarWeek className="w-6 h-6" /> :
                              task.recurrence_rule === 'Monthly' ? <FaCalendarAlt className="w-6 h-6" /> :
                                <FaClock className="w-6 h-6" />}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-gray-800 truncate">{task.name}</h4>
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

                    {displayStatus === 'VERIFIED' ? (
                      <span className="badge badge-success text-white font-bold p-3">Approved</span>
                    ) : displayStatus === 'FAILED' ? (
                      <span className="badge badge-error text-white font-bold p-3">Failed</span>
                    ) : displayStatus === 'PENDING' ? (
                      <span className="badge badge-warning text-white font-bold p-3">Pending</span>
                    ) : displayStatus === 'PENDING_EXCUSE' ? (
                      <span className="badge badge-warning text-white font-bold p-3">Pending</span>
                    ) : displayStatus === 'EXCUSED' ? (
                      <span className="badge badge-ghost text-gray-500 font-bold p-3">Skipped</span>
                    ) : (
                      <div className="flex flex-col items-end gap-1">
                        <button
                          className={`btn btn-sm rounded-full text-white ${isLatestRejected ? 'btn-error' : 'btn-primary'}`}
                          onClick={(e) => { e.stopPropagation(); handleTaskComplete(task); }}
                          disabled={isLoading}
                        >
                          {isLatestRejected ? 'Try Again' : 'Done'}
                        </button>
                        {max > 1 && (
                          <span className="text-[10px] font-bold text-gray-400">
                            {count}/{max} completed
                          </span>
                        )}
                        {isLatestRejected && (
                          <button
                            className="text-[10px] text-error underline"
                            onClick={(e) => { e.stopPropagation(); handleViewRejection(task.name, latestLog?.rejection_reason); }}
                          >
                            Why rejected?
                          </button>
                        )}
                      </div>
                    )}
                  </motion.div>
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
