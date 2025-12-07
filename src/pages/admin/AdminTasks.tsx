import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaTasks, FaPencilAlt, FaTrash } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { AppCard } from '../../components/design-system/AppCard';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';
import { AlertModal, ToggleButton } from '../../components/design-system';

const AdminTasks = () => {
  const navigate = useNavigate();
  const { tasks, updateTask } = useAppStore();
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');

  const filteredTasks = tasks
    .filter(task => task.is_active !== false)
    .filter(task => {
      if (filter === 'all') return true;
      if (filter === 'once') return task.recurrence_rule === 'Once';
      if (filter === 'daily') return task.recurrence_rule !== 'Once';
      return true;
    });

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
      case 'Once': return 'bg-amber-100 text-amber-800';
      case 'Daily': return 'bg-blue-100 text-blue-800';
      case 'Weekly': return 'bg-purple-100 text-purple-800';
      case 'Monthly': return 'bg-rose-100 text-rose-800';
      case 'Custom': return 'bg-teal-100 text-teal-800';
      default: return 'bg-teal-100 text-teal-800'; // Default to Custom style for complex rules
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

      <div className="grid gap-4">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            No missions created yet. Click below to add one!
          </div>
        ) : (
          filteredTasks.map((task) => (
            <AppCard key={task.id} className="flex flex-row items-center gap-4 !p-4">
              <div className="bg-base-200 p-3 rounded-lg">
                <IconWrapper icon={FaTasks} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-700">{task.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeStyle(task.recurrence_rule || 'Once')}`}>
                    {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule || 'Once') ? (task.recurrence_rule || 'Once') : 'Custom'}
                  </span>
                  {task.reward_value > 0 && (
                    <span className="text-sm text-gray-500">• {task.reward_value} Stars</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn btn-ghost btn-sm btn-circle text-gray-400"
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
