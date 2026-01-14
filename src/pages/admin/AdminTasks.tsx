import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaPencilAlt, FaTrash, FaBolt, FaRedo, FaCalendarWeek, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';
import { AlertModal, ToggleButton } from '../../components/design-system';

const AdminTasks = () => {
  const navigate = useNavigate();
  const { tasks, updateTask, categories } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredTasks = tasks
    .filter(task => task.is_active !== false)
    .filter(task => {
      // Recurrence Filter
      if (filter === 'once' && task.recurrence_rule !== 'Once') return false;
      if (filter === 'daily' && task.recurrence_rule === 'Once') return false;

      // Category Filter
      if (categoryFilter !== 'all' && task.category_id !== categoryFilter) return false;

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleEditClick = (taskId: string) => {
    setSelectedTask(taskId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleEditConfirm = () => {
    if (selectedTask) {
      navigate(`/admin/tasks/${selectedTask}/edit`);
    }
    setIsEditModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await updateTask(taskToDelete, { is_active: false });
    }
    setIsDeleteModalOpen(false);
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

  const getTaskIcon = (rule: string) => {
    switch (rule) {
      case 'Once': return FaBolt;
      case 'Daily': return FaRedo;
      case 'Weekly': return FaCalendarWeek;
      case 'Monthly': return FaCalendarAlt;
      default: return FaClock;
    }
  };

  return (
    <div className="relative min-h-full pb-20 flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <H1Header>Manage Missions</H1Header>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        <ToggleButton
          label="Daily"
          isActive={filter === 'daily'}
          onClick={() => setFilter('daily')}
        />
        <ToggleButton
          label="Once"
          isActive={filter === 'once'}
          onClick={() => setFilter('once')}
        />
        <ToggleButton
          label="All"
          isActive={filter === 'all'}
          onClick={() => setFilter('all')}
        />
      </div>

      {/* Category Filter */}
      <div className="form-control w-full">
        <select
          className="select select-bordered w-full"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-neutral/50">
            No missions created yet. Click below to add one!
          </div>
        ) : (
          filteredTasks.map((task) => (
            <AppCard key={task.id} className="flex flex-row items-center gap-4 !p-4">
              <div className={`p-3 rounded-lg ${task.recurrence_rule === 'Once' ? 'bg-accent/10 text-accent' :
                task.recurrence_rule === 'Daily' ? 'bg-primary/10 text-primary' :
                  task.recurrence_rule === 'Weekly' ? 'bg-secondary/10 text-secondary' :
                    task.recurrence_rule === 'Monthly' ? 'bg-info/10 text-info' :
                      'bg-base-200 text-neutral/50'
                }`}>
                <IconWrapper icon={getTaskIcon(task.recurrence_rule || 'Once')} className="" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral">{task.name}</h3>
                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(task.recurrence_rule || 'Once')}`}>
                      {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule || 'Once') ? (task.recurrence_rule || 'Once') : 'Custom'}
                    </span>
                    {task.category_id && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {categories.find(c => c.id === task.category_id)?.name || 'Unknown'}
                      </span>
                    )}
                  </div>
                  {task.reward_value > 0 && (
                    <span className="text-xs text-neutral/60 font-medium">{task.reward_value} Stars</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm btn-circle text-neutral/40"
                  onClick={() => handleEditClick(task.id)}
                >
                  <FaPencilAlt />
                </button>
                <button
                  className="btn btn-ghost btn-sm btn-circle text-error"
                  onClick={() => handleDeleteClick(task.id)}
                >
                  <FaTrash />
                </button>
              </div>
            </AppCard>
          ))
        )}
      </div>

      <WarningCTAButton onClick={() => navigate('/admin/tasks/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Mission</span>
      </WarningCTAButton>

      <AlertModal
        isOpen={isEditModalOpen}
        title="Edit Mission"
        message="Do you want to edit this mission?"
        confirmText="Edit"
        onClose={() => setIsEditModalOpen(false)}
        onConfirm={handleEditConfirm}
      />

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Mission"
        message="Are you sure you want to delete (archive) this mission?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default AdminTasks;
