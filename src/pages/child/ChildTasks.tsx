import { useAppStore } from '../../store/useAppStore';
import { FaTasks, FaBolt, FaRedo, FaCalendarWeek, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { ToggleButton, AdminEntityCard } from '../../components/design-system';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';
import { useState, useMemo } from 'react';
import { ICON_MAP, getTaskIconComponent } from '../../utils/icons';
import type { Task } from '../../types';
import { getLocalDateString } from '../../utils/timeUtils';

const ChildTasks = () => {
  const { activeChildId, getTasksByChildId, categories, completeTask, isLoading, childLogs } = useAppStore();
  const allTasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleTaskClick = (task: any) => {
    setSelectedTaskDetails(task);
    setIsDetailsModalOpen(true);
  };


  const handleFilterChange = (newFilter: 'daily' | 'once' | 'all') => {
    setFilter(newFilter);
  };

  const filteredTasks = useMemo(() => {
    return allTasks.filter(task => {
      if (!task.is_active) return false;
      if (filter === 'all') return true;
      if (filter === 'once') return task.recurrence_rule === 'Once';
      if (filter === 'daily') return task.recurrence_rule !== 'Once';
      return true;
    }).sort((a, b) => {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return dateB - dateA;
    });
  }, [allTasks, filter]);

  const groupedTasks = useMemo(() => {
    const groups: Record<string, Task[]> = {};

    // Sort categories to ensure consistent order (Default first, then alphabetical?)
    // Actually, we'll iterate categories later.

    filteredTasks.forEach(task => {
      const catId = task.category_id || 'uncategorized';
      if (!groups[catId]) groups[catId] = [];
      groups[catId].push(task);
    });

    return groups;
  }, [filteredTasks]);

  // Sort categories for display: Default categories first (in specific order if needed), then custom, then uncategorized
  const sortedCategoryIds = useMemo(() => {
    const catIds = Object.keys(groupedTasks);
    return catIds.sort((a, b) => {
      if (a === 'uncategorized') return 1;
      if (b === 'uncategorized') return -1;

      const catA = categories.find(c => c.id === a);
      const catB = categories.find(c => c.id === b);

      // If one is missing (shouldn't happen), push to end
      if (!catA) return 1;
      if (!catB) return -1;

      // Default categories first? Or just alphabetical?
      // Let's go with alphabetical for now
      return catA.name.localeCompare(catB.name);
    });
  }, [groupedTasks, categories]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-neutral">My Missions</h2>
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

      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-neutral/40">
          <FaTasks className="w-16 h-16 mb-4 opacity-20" />
          <p>No missions found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {sortedCategoryIds.map(catId => {
            const tasks = groupedTasks[catId];
            if (!tasks || tasks.length === 0) return null;

            const category = categories.find(c => c.id === catId);
            const name = category ? category.name : 'Others';
            const Icon = category && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : FaTasks;

            return (
              <div key={catId}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div className={`p-1.5 rounded-lg ${category ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                    <Icon className="text-sm" />
                  </div>
                  <h3 className="font-bold text-lg text-neutral">{name}</h3>
                  <span className="text-xs font-medium text-neutral/40 bg-base-200 px-2 py-0.5 rounded-full">
                    {tasks.length}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {tasks.map((task) => (
                    <AdminEntityCard
                      key={task.id}
                      variant="child"
                      badge={
                        task.image_url ? (
                          <img src={task.image_url} alt={task.name} className="w-full h-full object-cover" />
                        ) : task.icon ? (
                          (() => {
                            const CustomIcon = getTaskIconComponent(task.icon);
                            return <CustomIcon className="w-6 h-6 text-sky-600" />;
                          })()
                        ) : (
                          task.recurrence_rule === 'Once' ? <FaBolt className="w-5 h-5 text-sky-600" /> :
                          task.recurrence_rule === 'Daily' ? <FaRedo className="w-5 h-5 text-sky-600" /> :
                          task.recurrence_rule === 'Weekly' ? <FaCalendarWeek className="w-5 h-5 text-sky-600" /> :
                          task.recurrence_rule === 'Monthly' ? <FaCalendarAlt className="w-5 h-5 text-sky-600" /> :
                          <FaClock className="w-5 h-5 text-sky-600" />
                        )
                      }
                      title={task.name}
                      stars={task.reward_value > 0 ? task.reward_value : undefined}
                      tags={
                        task.recurrence_rule ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/60">
                            {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule) ? task.recurrence_rule : 'Custom'}
                          </span>
                        ) : undefined
                      }
                      description={task.description}
                      onClick={() => handleTaskClick(task)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        task={selectedTaskDetails ? {
          ...selectedTaskDetails,
          status: (() => {
            const logs = childLogs.filter(l => l.child_id === activeChildId && l.task_id === selectedTaskDetails.id);
            const todayStr = getLocalDateString();
            const todayLogs = logs.filter(l => getLocalDateString(new Date(l.completed_at)) === todayStr);
            const validLogs = todayLogs.filter(l => ['VERIFIED', 'PENDING', 'PENDING_EXCUSE', 'EXCUSED'].includes(l.status));
            if (validLogs.length > 0) return validLogs[0].status;
            if (todayLogs.find(l => l.status === 'IN_PROGRESS')) return 'IN_PROGRESS';
            return 'ACTIVE';
          })()
        } : null}
        onClose={() => setIsDetailsModalOpen(false)}
        onComplete={async (task) => {
          const { error } = await completeTask(task.id);
          if (!error) {
            setIsDetailsModalOpen(false);
            
            // Streak Milestone Check (Hidden for now)
            const predictedStreak = (task.current_streak || 0) + 1;
            const isMilestone = false && [3, 7, 14, 30, 100].includes(predictedStreak);

            if (isMilestone) {
              const { setStreakMilestone } = useAppStore.getState();
              setStreakMilestone({ taskName: task.name, streak: predictedStreak });
            }
          }
        }}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ChildTasks;
