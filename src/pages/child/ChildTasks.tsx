import { useAppStore } from '../../store/useAppStore';
import { FaTasks } from 'react-icons/fa';
import { ToggleButton } from '../../components/design-system';
import { useState, useMemo } from 'react';
import { TaskCard } from '../../components/TaskCard';
import { TaskExceptionModal } from '../../components/modals/TaskExceptionModal';

const ChildTasks = () => {
  const { activeChildId, getTasksByChildId, completeTask, requestTaskException, childLogs } = useAppStore();
  const allTasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(20);

  // Exception Modal State
  const [isExceptionModalOpen, setIsExceptionModalOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleFilterChange = (newFilter: 'daily' | 'once' | 'all') => {
    setFilter(newFilter);
    setVisibleCount(20);
  };

  const getTaskStatusToday = (taskId: string) => {
    if (!activeChildId) return null;
    const today = new Date().toISOString().split('T')[0];

    // Find the latest log for this task today
    const log = childLogs.find(l =>
      l.task_id === taskId &&
      l.child_id === activeChildId &&
      l.completed_at.startsWith(today)
    );

    return log ? log.status : null;
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.is_active) return false;

      // Filter by type
      if (filter === 'once' && task.recurrence_rule !== 'Once') return false;
      if (filter === 'daily' && task.recurrence_rule === 'Once') return false;

      // Check status
      const status = getTaskStatusToday(task.id);

      // Hide if Verified, Rejected (maybe?), Failed, or Excused?
      // User requirement: "Tombol berubah menjadi 'Menunggu Verifikasi ⏳'" -> So PENDING stays visible.
      // If VERIFIED, usually we hide it or move it to "Completed" section. 
      // For now let's hide VERIFIED and EXCUSED to keep the list clean for "To Do".
      if (status === 'VERIFIED' || status === 'EXCUSED') return false;

      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [allTasks, filter, childLogs, activeChildId]);

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleTasks.length < filteredTasks.length;

  const handleComplete = async (taskId: string) => {
    await completeTask(taskId);
  };

  const handleExceptionTrigger = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsExceptionModalOpen(true);
  };

  const handleSubmitException = async (reason: string) => {
    if (selectedTaskId) {
      await requestTaskException(selectedTaskId, reason);
      setIsExceptionModalOpen(false);
      setSelectedTaskId(null);
    }
  };

  const getSelectedTaskName = () => {
    return allTasks.find(t => t.id === selectedTaskId)?.name || 'Task';
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">My Missions</h2>
      </div>

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

      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <FaTasks className="w-16 h-16 mb-4 opacity-20" />
          <p>No missions found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {visibleTasks.map((task) => {
              const status = getTaskStatusToday(task.id);
              const isPending = status === 'PENDING' || status === 'PENDING_EXCUSE';

              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={handleComplete}
                  onException={handleExceptionTrigger}
                  isPending={isPending}
                />
              );
            })}
          </div>

          {hasMore && (
            <button
              className="btn btn-ghost btn-sm w-full text-gray-500 mt-2"
              onClick={() => setVisibleCount(prev => prev + 20)}
            >
              Load More
            </button>
          )}
        </>
      )}

      <TaskExceptionModal
        isOpen={isExceptionModalOpen}
        onClose={() => setIsExceptionModalOpen(false)}
        onSubmit={handleSubmitException}
        taskName={getSelectedTaskName()}
      />
    </div>
  );
};

export default ChildTasks;
