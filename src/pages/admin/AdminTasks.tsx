import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaBolt, FaRedo, FaCalendarWeek, FaCalendarAlt, FaClock, FaTasks } from 'react-icons/fa';
import { WarningCTAButton } from '../../components/design-system/WarningCTAButton';
import { H1Header } from '../../components/design-system/H1Header';
import { IconWrapper } from '../../components/design-system/IconWrapper';
import { useAppStore } from '../../store/useAppStore';
import { AlertModal, ToggleButton, AdminEntityCard } from '../../components/design-system';
import TaskDetailsModal from '../../components/modals/TaskDetailsModal';
import { getTaskIconComponent } from '../../utils/icons';

const AdminTasks = () => {
  const navigate = useNavigate();
  const { tasks, updateTask, categories, activeChildId } = useAppStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [filter, setFilter] = useState<'daily' | 'once' | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const filteredTasks = tasks
    .filter(task => task.is_active !== false)
    .filter(task => {
      // Create a copy of assigned_to to ensure it's treated as an array if it exists
      const assignedTo = task.assigned_to;

      // Filter by Active Child
      if (activeChildId && assignedTo && assignedTo.length > 0 && !assignedTo.includes(activeChildId)) {
        return false;
      }

      // Recurrence Filter
      if (filter === 'once' && task.recurrence_rule !== 'Once') return false;
      if (filter === 'daily' && task.recurrence_rule === 'Once') return false;

      // Category Filter
      if (categoryFilter !== 'all' && task.category_id !== categoryFilter) return false;

      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleEditClick = (taskId: string) => {
    navigate(`/admin/tasks/${taskId}/edit`);
  };

  const handleTaskClick = (task: any) => {
    setSelectedTaskDetails(task);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteClick = (taskId: string) => {
    setTaskToDelete(taskId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (taskToDelete) {
      await updateTask(taskToDelete, { is_active: false });
    }
    setIsDeleteModalOpen(false);
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

      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="card bg-base-100 border border-base-200 rounded-3xl p-8 text-center flex flex-col items-center justify-center gap-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FaTasks className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral">No Missions Created</h3>
              <p className="text-xs text-neutral/50 max-w-xs mt-1">
                No missions created yet. Tap the button below to add your first mission!
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/tasks/new')}
              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-none rounded-xl text-xs font-bold mt-2"
            >
              + Add Mission
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <AdminEntityCard
              key={task.id}
              badge={
                task.image_url ? (
                  <img src={task.image_url} alt={task.name} className="w-full h-full object-cover" />
                ) : task.icon ? (
                  (() => {
                    const CustomIcon = getTaskIconComponent(task.icon);
                    return <CustomIcon className="w-6 h-6 text-emerald-700" />;
                  })()
                ) : (
                  <IconWrapper icon={getTaskIcon(task.recurrence_rule || 'Once')} className="text-emerald-700 text-xl" />
                )
              }
              title={task.name}
              stars={task.reward_value > 0 ? task.reward_value : undefined}
              tags={
                <>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {['Once', 'Daily', 'Weekly', 'Monthly'].includes(task.recurrence_rule || 'Once') ? (task.recurrence_rule || 'Once') : 'Custom'}
                  </span>
                  {task.category_id && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/60">
                      {categories.find(c => c.id === task.category_id)?.name || 'Unknown'}
                    </span>
                  )}
                </>
              }
              description={task.description}
              onClick={() => handleTaskClick(task)}
              onEdit={() => handleEditClick(task.id)}
              onDelete={() => handleDeleteClick(task.id)}
            />
          ))
        )}
      </div>

      <WarningCTAButton onClick={() => navigate('/admin/tasks/new')}>
        <FaPlus className="w-6 h-6" />
        <span className="ml-2 hidden sm:inline">Add Mission</span>
      </WarningCTAButton>

      <AlertModal
        isOpen={isDeleteModalOpen}
        title="Delete Mission"
        message="Are you sure you want to delete (archive) this mission?"
        confirmText="Delete"
        type="danger"
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <TaskDetailsModal
        isOpen={isDetailsModalOpen}
        task={selectedTaskDetails}
        onClose={() => setIsDetailsModalOpen(false)}
      />
    </div>
  );
};

export default AdminTasks;
