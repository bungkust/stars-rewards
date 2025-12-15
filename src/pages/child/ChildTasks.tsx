import { useAppStore } from '../../store/useAppStore';
import { FaTasks, FaStar, FaBolt, FaRedo, FaCalendarWeek, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { ToggleButton } from '../../components/design-system';
import { useState, useMemo } from 'react';
import { ICON_MAP } from '../../utils/icons';
import type { Task } from '../../types';

const ChildTasks = () => {
  const { activeChildId, getTasksByChildId, categories } = useAppStore();
  const allTasks = activeChildId ? getTasksByChildId(activeChildId) : [];

  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');
  const [visibleCount, setVisibleCount] = useState(20);

  const handleFilterChange = (newFilter: 'daily' | 'once' | 'all') => {
    setFilter(newFilter);
    setVisibleCount(20);
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

  // DEBUG LOGS
  console.log('[ChildTasks] Active Child:', activeChildId);
  console.log('[ChildTasks] All Tasks (from store):', allTasks.length);
  console.log('[ChildTasks] Filtered Tasks:', filteredTasks.length);
  filteredTasks.forEach(t => {
    console.log(`[ChildTasks] Showing: ${t.name}, Recurrence: ${t.recurrence_rule}, Assigned: ${JSON.stringify(t.assigned_to || 'ALL')}`);
  });

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
                <div className="grid gap-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="card bg-base-100 shadow-sm rounded-xl p-4 flex flex-row items-center gap-4 border border-base-200">
                      <div className="bg-base-200 p-3 rounded-full text-neutral/60">
                        {/* Task Type Icon */}
                        {task.recurrence_rule === 'Once' ? <FaBolt className="w-5 h-5" /> :
                          task.recurrence_rule === 'Daily' ? <FaRedo className="w-5 h-5" /> :
                            task.recurrence_rule === 'Weekly' ? <FaCalendarWeek className="w-5 h-5" /> :
                              task.recurrence_rule === 'Monthly' ? <FaCalendarAlt className="w-5 h-5" /> :
                                <FaClock className="w-5 h-5" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-neutral">{task.name}</h3>
                        <div className="flex gap-4 text-sm text-neutral/60 mt-1">
                          {task.reward_value > 0 && (
                            <span className="flex items-center gap-1 text-warning font-bold">
                              <FaStar /> {task.reward_value}
                            </span>
                          )}
                          {task.recurrence_rule && (
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getBadgeStyle(task.recurrence_rule)}`}>
                              {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule) ? task.recurrence_rule : 'Custom'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChildTasks;
