import { useAppStore } from '../../store/useAppStore';
import { FaTasks, FaStar, FaBolt, FaRedo, FaCalendarWeek, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { ToggleButton } from '../../components/design-system';
import { useState, useMemo } from 'react';

const ChildTasks = () => {
  const { activeChildId, getTasksByChildId } = useAppStore();
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

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleTasks.length < filteredTasks.length;

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

      {visibleTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-neutral/40">
          <FaTasks className="w-16 h-16 mb-4 opacity-20" />
          <p>No missions found.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4">
            {visibleTasks.map((task) => (
              <div key={task.id} className="card bg-base-100 shadow-sm rounded-xl p-4 flex flex-row items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full text-primary">
                  {task.recurrence_rule === 'Once' ? <FaBolt className="w-6 h-6" /> :
                    task.recurrence_rule === 'Daily' ? <FaRedo className="w-6 h-6" /> :
                      task.recurrence_rule === 'Weekly' ? <FaCalendarWeek className="w-6 h-6" /> :
                        task.recurrence_rule === 'Monthly' ? <FaCalendarAlt className="w-6 h-6" /> :
                          <FaClock className="w-6 h-6" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral">{task.name}</h3>
                  <div className="flex gap-4 text-sm text-neutral/60">
                    {task.reward_value > 0 && (
                      <span className="flex items-center gap-1 text-warning font-bold">
                        <FaStar /> {task.reward_value}
                      </span>
                    )}
                    {task.recurrence_rule && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(task.recurrence_rule)}`}>
                        {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule) ? task.recurrence_rule : 'Custom'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {hasMore && (
            <button
              className="btn btn-ghost btn-sm w-full text-neutral/60 mt-2"
              onClick={() => setVisibleCount(prev => prev + 20)}
            >
              Load More
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default ChildTasks;
